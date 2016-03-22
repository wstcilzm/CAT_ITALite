using Microsoft.Azure.ActiveDirectory.GraphClient;
using Microsoft.Azure.ActiveDirectory.GraphClient.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CAT.ITALite.Common;
using System.Configuration;
using CAT.ITALite.Entity;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Queue;
using System.Threading;


namespace CAT.ITALite.SyncService
{

    class Program
    {

        public static List<IUser> newUserList = new List<IUser>();
        public static TableDal userTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AADUsers);
        public static TableDal appTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AADApps);
        public static TableDal groupTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AADGroups);
        public static TableDal aadTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AADInfo);
        public static TableDal adminRoleTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AADAdminRoles);
        public static TableDal userGroupAssignmentOperation = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.UserGroupAssignments);
        public static TableDal appGroupAssignmentOperation = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AppGroupAssignments);
        public static TableDal userAdminRoleAssignmentOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.UserAdminRoleAssignments);
        public static TableDal rbacRoleTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.RBACRoles);
        public static TableDal rbacRoleAssignmentTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.UserRBACRoleAssignments);
        public static TableDal rgRoleAssignmentTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.RGRBACRoleAssignments);        
        public static TableDal rmResourceOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.RMResources);
        public static TableDal rmResourceGroupOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.RMResourceGroups);
        public static ActiveDirectoryClient activeDirectoryClient;


        static void Main(string[] args)
        {
            #region Setup Active Directory Client

            //*********************************************************************
            // setup Active Directory Client
            //*********************************************************************
            try
            {
                activeDirectoryClient = AuthenticationHelper.GetActiveDirectoryClientAsApplication();
            }
            catch (AuthenticationException ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("Acquiring a token failed with the following error: {0}", ex.Message);
                if (ex.InnerException != null)
                {
                    //You should implement retry and back-off logic per the guidance given here:http://msdn.microsoft.com/en-us/library/dn168916.aspx
                    //InnerException Message will contain the HTTP error status codes mentioned in the link above
                    Console.WriteLine("Error detail: {0}", ex.InnerException.Message);
                }
                Console.ResetColor();
                Console.ReadKey();
                return;
            }

            #endregion

            CleanTableStorages();
            Thread t = new Thread(new ThreadStart(ThreadRetrieveUpdates));
            t.Start();

            while (true)
            {
                RetrieveAADInfo();
                RetrieveUsers();
                RetrieveGroups();
                RetrieveApps();
                RetrieveAdminRoles();
                ParseUserMembership();
                RetrieveRBACRoles();
                ParseRBACRoleAssignments();
                RetrieveResourceGroups();
                RetrieveRMResources();                
                Console.WriteLine("ITALite initialization is done!");
                Thread.Sleep(100000);
            }
            
            //InvokingITA testITACore = new InvokingITA();
            //Console.WriteLine(testITACore.AccessControl(true));
            //Console.WriteLine(testITACore.AccessControl(false));  
            //TestItaLite();
            //Console.WriteLine("TestItaLite done!");

            Console.Read();
        }

        static void CleanTableStorages()
        {
            Console.WriteLine("Start to delete all history tables ?");
            if (Console.ReadLine() == "yes")
            {
                userTableOper.CleanTable();
                appTableOper.CleanTable();
                groupTableOper.CleanTable();
                aadTableOper.CleanTable();
                adminRoleTableOper.CleanTable();
                userGroupAssignmentOperation.CleanTable();
                appGroupAssignmentOperation.CleanTable();
                userAdminRoleAssignmentOper.CleanTable();
                rbacRoleTableOper.CleanTable();
                rbacRoleAssignmentTableOper.CleanTable();
                rgRoleAssignmentTableOper.CleanTable();
                rmResourceOper.CleanTable();
                rmResourceGroupOper.CleanTable();
                Console.WriteLine("All history tables are deleted.");

                //System.IO.File.AppendAllText("ITALiteLog.txt", DateTime.Now.ToString() + "   All history tables are deleted.\r\n");

                System.Threading.Thread.Sleep(5000);
                Environment.Exit(0);
               
            }
        }

        static void ThreadRetrieveUpdates()
        {            
            Console.WriteLine("Real time updating is started.");
            // Retrieve storage account from connection string
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(ConfigurationSettings.AppSettings["storageConnection"]);
            // Create the queue client
            CloudQueueClient queueClient = storageAccount.CreateCloudQueueClient();
            // Retrieve a reference to a queue
            CloudQueue queue = queueClient.GetQueueReference("italitemsgqueue");
            // Create the queue if it doesn't already exist.
            queue.CreateIfNotExists();

            while(true)
            {
                // Get the next message
                CloudQueueMessage retrievedMessage = queue.GetMessage();

                if(retrievedMessage!=null)
                {
                    string[] msg = retrievedMessage.AsString.Split(';');
                    //msg pattern: "New AAD User;newuser@jianwmfatest.partner.onmschina.cn"
                    if(msg.Length==2)
                    {
                        switch(msg[0])
                        {
                            case "New AAD User":
                                RetrieveUpdatedUser(msg[1]);
                                break;
                            case "New AAD Group":
                                RetrieveUpdatedGroup(msg[1]);
                                break;
                            default:
                                break;

                        }
                    }

                    //Process the message in less than 30 seconds, and then delete the message
                    queue.DeleteMessage(retrievedMessage);
                }
                System.Threading.Thread.Sleep(3000);
            }
        }

        static void RetrieveAADInfo()
        {
            Console.WriteLine("Start to sync AADInfo ...");
            VerifiedDomain initialDomain = new VerifiedDomain();
            VerifiedDomain defaultDomain = new VerifiedDomain();
            AADInfoEntity aadInfo = null;
            ITenantDetail tenant = null;
            try
            {
                List<ITenantDetail> tenantsList = activeDirectoryClient.TenantDetails
                    .Where(tenantDetail => tenantDetail.ObjectId.Equals(Constants.TenantId))
                    .ExecuteAsync().Result.CurrentPage.ToList();
                if (tenantsList.Count > 0)
                {
                    tenant = tenantsList.First();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("\nError getting TenantDetails {0} {1}", e.Message, e.InnerException != null ? e.InnerException.Message : "");
            }

            if (tenant == null)
            {
                Console.WriteLine("Tenant not found");
            }
            else
            {
                TenantDetail tenantDetail = (TenantDetail)tenant;                

                // Get the Tenant's Verified Domains 
                initialDomain = tenantDetail.VerifiedDomains.First(x => x.Initial.HasValue && x.Initial.Value);
                defaultDomain = tenantDetail.VerifiedDomains.First(x => x.@default.HasValue && x.@default.Value);
                aadInfo = new AADInfoEntity(tenantDetail.ObjectId, initialDomain.Name);
                aadInfo.DefaultDomainName = defaultDomain.Name;
                aadInfo.ObjectType = tenantDetail.ObjectType;
                aadInfo.DisplayName = tenantDetail.DisplayName; 
                // Get Tenant's Tech Contacts
                foreach (string techContact in tenantDetail.TechnicalNotificationMails)
                {
                    aadInfo.TechContacts += techContact + ";";
                }
                foreach (string marketContact in tenantDetail.MarketingNotificationEmails)
                {
                    aadInfo.TechContacts += marketContact + ";";
                }
                aadInfo.PreferredLanguage = tenantDetail.PreferredLanguage;
                aadInfo.CountryLetter = tenantDetail.CountryLetterCode;
                aadInfo.Country = tenantDetail.Country;
                aadInfo.State = tenantDetail.State;
                aadInfo.City = tenantDetail.City;
                aadInfo.Street = tenantDetail.Street;
                aadTableOper.InsertAADInfo(aadInfo);
            }
        }

        public static List<IUser> AllUsers = new List<IUser>();
        static void RetrieveUsers()
        {
            Console.WriteLine("Start to sync AAD Users ...");
            AllUsers.Clear();
            IUserCollection userCollection = activeDirectoryClient.Users;

            IPagedCollection<IUser> searchResults = activeDirectoryClient.Users.OrderBy(user => user.DisplayName).ExecuteAsync().Result;

            List<IUser> usersList = searchResults.CurrentPage.ToList();

            if (usersList != null && usersList.Count > 0)
            {
                int count = 1;
                do
                {
                    AllUsers.AddRange(usersList);
                    Console.WriteLine("===={0}===", count++);
                    usersList = searchResults.CurrentPage.ToList();
                    newUserList = usersList;
                    foreach (IUser user in usersList)
                    {
                        //Console.WriteLine("User DisplayName: {0} UPN: {1}", user.DisplayName, user.UserPrincipalName);

                        var newUser = new UserEntity(user.ObjectId, user.UserPrincipalName.Contains("#EXT#") ? user.UserPrincipalName.Replace("#EXT#", "_") : user.UserPrincipalName);
                        newUser.DisplayName = user.DisplayName;
                        newUser.MailNickname = user.MailNickname;
                        newUser.AccountEnabled = (bool)user.AccountEnabled;
                        newUser.UserType = user.UserType;
                        newUser.UsageLocation = user.UsageLocation;
                        userTableOper.InsertEntity(newUser);

                    }
                    searchResults = searchResults.GetNextPageAsync().Result;
                } while (searchResults != null);  // && searchResults.MorePagesAvailable
            }
        }

        static void RetrieveUpdatedUser(string userUPN)
        {
            // search for a single user by UPN
            User retrievedUser = new User();
            List<IUser> retrievedUsers = null;
            try
            {
                retrievedUsers = activeDirectoryClient.Users.Where(user => user.UserPrincipalName.Equals(userUPN)).ExecuteAsync().Result.CurrentPage.ToList();
            }
            catch (Exception e)
            {
                Console.WriteLine("\nError getting new user {0} {1}", e.Message, e.InnerException != null ? e.InnerException.Message : "");
            }
            // should only find one user with the specified UPN
            if (retrievedUsers != null && retrievedUsers.Count == 1)
            {
                retrievedUser = (User)retrievedUsers.First();

                var newUser = new UserEntity(retrievedUser.ObjectId, retrievedUser.UserPrincipalName.Contains("#EXT#") ? retrievedUser.UserPrincipalName.Replace("#EXT#", "_") : retrievedUser.UserPrincipalName);
                newUser.DisplayName = retrievedUser.DisplayName;
                newUser.MailNickname = retrievedUser.MailNickname;
                newUser.AccountEnabled = (bool)retrievedUser.AccountEnabled;
                newUser.UserType = retrievedUser.UserType;
                newUser.UsageLocation = retrievedUser.UsageLocation;
                userTableOper.InsertEntity(newUser);
            }
        }

        static void RetrieveGroups()
        {
            Console.WriteLine("Start to sync AAD groups ...");
            List<IGroup> foundGroups = null;
            try
            {
                foundGroups = activeDirectoryClient.Groups.ExecuteAsync().Result.CurrentPage.ToList();
            }
            catch (Exception e)
            {
                Console.WriteLine("\nError getting Group {0} {1}", e.Message, e.InnerException != null ? e.InnerException.Message : "");
            }
            if (foundGroups != null && foundGroups.Count > 0)
            {
                foreach (IGroup group in foundGroups)
                {
                    //Console.WriteLine("Group Name: {0}   GroupObjectId: {1}", group.DisplayName, group.ObjectId);

                    var newGroup = new GroupEntity(group.ObjectId, group.DisplayName);
                    newGroup.Descrption = group.Description;
                    newGroup.SecurityEnabled = (bool)group.SecurityEnabled;
                    newGroup.MailNickName = group.MailNickname;
                    newGroup.OriginatedFrom = "AAD";
                    groupTableOper.InsertEntity(newGroup);

                }
            }
            else
            {
                Console.WriteLine("Group Not Found");
            }
        }

        static void RetrieveUpdatedGroup(string groupName)
        {
            List<IGroup> foundGroups = null;
            try
            {
                foundGroups = activeDirectoryClient.Groups.Where(group =>group.DisplayName.Equals(groupName)).ExecuteAsync().Result.CurrentPage.ToList();
            }
            catch (Exception e)
            {
                Console.WriteLine("\nError getting Group {0} {1}", e.Message, e.InnerException != null ? e.InnerException.Message : "");
            }
            if (foundGroups != null && foundGroups.Count > 0)
            {
                foreach (IGroup group in foundGroups)
                {
                    //Console.WriteLine("Group Name: {0}   GroupObjectId: {1}", group.DisplayName, group.ObjectId);

                    var newGroup = new GroupEntity(group.ObjectId, group.DisplayName);
                    newGroup.Descrption = group.Description;
                    newGroup.SecurityEnabled = (bool)group.SecurityEnabled;
                    newGroup.MailNickName = group.MailNickname;
                    newGroup.OriginatedFrom = "AAD";
                    groupTableOper.InsertEntity(newGroup);
                }
            }
        }

        static void RetrieveGroupMembers(ActiveDirectoryClient activeDirectoryClient, Group targetAADGroup)
        {
            if (targetAADGroup.ObjectId != null)
            {
                Console.WriteLine("\n Found Group: " + targetAADGroup.DisplayName + "  " + targetAADGroup.Description);

                //*********************************************************************
                // get the groups' membership - 
                // Note this method retrieves ALL links in one request - please use this method with care - this
                // may return a very large number of objects
                //*********************************************************************
                IGroupFetcher retrievedGroupFetcher = targetAADGroup;
                try
                {
                    IPagedCollection<IDirectoryObject> members = retrievedGroupFetcher.Members.ExecuteAsync().Result;
                    Console.WriteLine(" Members:");
                    do
                    {
                        List<IDirectoryObject> directoryObjects = members.CurrentPage.ToList();
                        foreach (IDirectoryObject member in directoryObjects)
                        {
                            if (member is User)
                            {
                                User user = member as User;
                            }
                            if (member is Group)
                            {
                                Group group = member as Group;
                                //Console.WriteLine("Group DisplayName: {0}", group.DisplayName);
                            }
                            if (member is Contact)
                            {
                                Contact contact = member as Contact;
                                //Console.WriteLine("Contact DisplayName: {0}", contact.DisplayName);
                            }
                        }
                        members = members.GetNextPageAsync().Result;
                    } while (members != null);
                }
                catch (Exception e)
                {
                    Console.WriteLine("\nError getting groups' membership. {0} {1}",
                        e.Message, e.InnerException != null ? e.InnerException.Message : "");
                }
            }
        }


        static void RetrieveApps()
        {
            Console.WriteLine("Start to sync AAD Apps ...");
            IPagedCollection<IApplication> applications = null;
            try
            {
                applications = activeDirectoryClient.Applications.Take(999).ExecuteAsync().Result;
            }
            catch (Exception e)
            {
                Console.WriteLine("\nError getting Applications {0} {1}", e.Message, e.InnerException != null ? e.InnerException.Message : "");
            }
            if (applications != null)
            {
                do
                {
                    List<IApplication> appsList = applications.CurrentPage.ToList();
                    foreach (IApplication app in appsList)
                    {
                        var newApp = new AppEntity(app.AppId, app.DisplayName);
                        newApp.AppRoles = app.AppRoles.Count;
                        newApp.AppType = app.ObjectType;
                        newApp.HomePage = app.Homepage;
                        newApp.IdentifierUris = app.IdentifierUris.Count;
                        appTableOper.InsertEntity(newApp);
                    }
                    applications = applications.GetNextPageAsync().Result;
                } while (applications != null);
            }
        }

        static void RetrieveAdminRoles()
        {
            Console.WriteLine("Start to sync AAD Roles ...");
            List<IDirectoryRole> foundRoles = null;
            try
            {
                foundRoles = activeDirectoryClient.DirectoryRoles.ExecuteAsync().Result.CurrentPage.ToList();
            }
            catch (Exception e)
            {
                Console.WriteLine("\nError getting Roles {0} {1}", e.Message,
                    e.InnerException != null ? e.InnerException.Message : "");
            }

            if (foundRoles != null && foundRoles.Count > 0)
            {
                foreach (IDirectoryRole role in foundRoles)
                {
                    //Console.WriteLine("\n Found Role: {0} {1} {2} ", role.DisplayName, role.Description, role.ObjectId);

                    var newAdminRole = new AdminRoleEntity(role.ObjectId, role.DisplayName);
                    newAdminRole.Description = role.Description;
                    newAdminRole.IsSystem = (bool)role.IsSystem;
                    newAdminRole.RoleDisabled = (bool)role.RoleDisabled;
                    //newAdminRole.MembersCount = role.Members.CurrentPage.Count;
                    adminRoleTableOper.InsertEntity(newAdminRole);
                }
            }

        }

        static void ParseUserMembership()
        {
            Console.WriteLine("Start to sync AAD memberships ...");
            foreach (IUser retrievedUser in AllUsers)
            {

                IUserFetcher retrievedUserFetcher = (User)retrievedUser;
                try
                {
                    IPagedCollection<IDirectoryObject> pagedCollection = retrievedUserFetcher.MemberOf.ExecuteAsync().Result;
                    do
                    {
                        //Console.WriteLine("\n {0} is a member of the following Group and Roles (IDs)", retrievedUser.DisplayName);
                        List<IDirectoryObject> directoryObjects = pagedCollection.CurrentPage.ToList();
                        foreach (IDirectoryObject directoryObject in directoryObjects)
                        {
                            if (directoryObject is Group)
                            {
                                Group group = directoryObject as Group;
                                var userGroupAssignment = new UserGroupAssignmentsEntity(retrievedUser.ObjectId, group.ObjectId);
                                userGroupAssignment.UserPrincipleName = retrievedUser.UserPrincipalName;
                                userGroupAssignment.GroupName = group.DisplayName;
                                userGroupAssignmentOperation.InsertEntity(userGroupAssignment);

                            }
                            if (directoryObject is DirectoryRole)
                            {
                                DirectoryRole role = directoryObject as DirectoryRole;
                                var userAdminRoleAssignment = new UserAdminRoleAssignmentEntity(retrievedUser.ObjectId, role.ObjectId);
                                userAdminRoleAssignment.UserPrincipleName = retrievedUser.UserPrincipalName;
                                userAdminRoleAssignment.AdminRoleName = role.DisplayName;
                                userAdminRoleAssignmentOper.InsertEntity(userAdminRoleAssignment);
                            }
                        }
                        pagedCollection = pagedCollection.GetNextPageAsync().Result;
                    } while (pagedCollection != null);
                }
                catch (Exception e)
                {
                    Console.WriteLine("\nError getting user's groups and roles memberships. {0} {1}", e.Message, e.InnerException != null ? e.InnerException.Message : "");
                }
            }
        }

        static void RetrieveRBACRoles()
        {
            Console.WriteLine("Start to sync RBAC roles ...");
            string _subscriptionId = ConfigurationSettings.AppSettings["azureSubscriptionID"];
            var client = new HttpClient();
            var header = AuthenticationHelper.GetAuthorizationHeader();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", header);

            try
            {
                var myTask = client.GetStringAsync(
                    String.Format(
                        "https://management.chinacloudapi.cn/subscriptions/{0}/providers/Microsoft.Authorization/roleDefinitions?api-version=2015-07-01&filter=atScopeAndBelow()",
                        _subscriptionId));
                var result = myTask.Result;

                JObject jObj = JObject.Parse(result);
                JToken jTk = jObj.GetValue("value").First;
                while (jTk != null)
                {
                    var rbacRole = new RBACRoleEntity(jTk["properties"]["roleName"].ToString(), jTk["name"].ToString());
                    rbacRole.RoleID = jTk["id"].ToString();
                    rbacRole.TypeProperty = jTk["properties"]["type"].ToString();
                    rbacRole.Description = jTk["properties"]["description"].ToString();
                    rbacRole.AssignableScopes = jTk["properties"]["assignableScopes"].ToString();
                    rbacRole.CreatedOn = jTk["properties"]["createdOn"].ToString();
                    rbacRole.UpdatedOn = jTk["properties"]["updatedOn"].ToString();
                    rbacRole.CreatedBy = jTk["properties"]["createdBy"].ToString();
                    rbacRole.UpdatedBy = jTk["properties"]["updatedBy"].ToString();
                    rbacRole.Type = jTk["type"].ToString();
                    rbacRole.Permissions = jTk["properties"]["permissions"].ToString();
                    rbacRoleTableOper.InsertEntity(rbacRole);

                    jTk = jTk.Next;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        static void ParseRBACRoleAssignments()
        {
            Console.WriteLine("Start to sync RBAC assignments ...");
            string _subscriptionId = ConfigurationSettings.AppSettings["azureSubscriptionID"];
            var client = new HttpClient();
            var header = AuthenticationHelper.GetAuthorizationHeader();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", header);

            try
            {
                var myTask = client.GetStringAsync(
                    String.Format(
                        "https://management.chinacloudapi.cn/subscriptions/{0}/providers/Microsoft.Authorization/roleAssignments?api-version=2015-07-01&filter=atScope()",
                        _subscriptionId));
                var result = myTask.Result;

                JObject jObj = JObject.Parse(result);
                JToken jTk = jObj.GetValue("value").First;
                while (jTk != null)
                {
                    string roleDefinitionId = jTk["properties"]["roleDefinitionId"].ToString(); //  /subscriptions/-----/providers/.../roleDefinitions/rolebackendidname
                    string[] items = roleDefinitionId.Split('/');
                    string roleBackendIDName = items[items.Count() - 1];
                    string resourceGroupID = jTk["properties"]["scope"].ToString().Replace('/', '&');

                    var rbacRoleAssignment = new UserRBACRoleAssignmentEntity(jTk["properties"]["principalId"].ToString(), roleBackendIDName);
                    rbacRoleAssignment.RoleDefinitionId = roleDefinitionId;
                    rbacRoleAssignment.Scope = jTk["properties"]["scope"].ToString();
                    rbacRoleAssignment.CreatedOn = jTk["properties"]["createdOn"].ToString();
                    rbacRoleAssignment.UpdatedOn = jTk["properties"]["updatedOn"].ToString();
                    rbacRoleAssignment.CreatedBy = jTk["properties"]["createdBy"].ToString();
                    rbacRoleAssignment.UpdatedBy = jTk["properties"]["updatedBy"].ToString();
                    rbacRoleAssignment.AssignmentID = jTk["id"].ToString();
                    rbacRoleAssignment.Type = jTk["type"].ToString();
                    rbacRoleAssignment.AssignmentName = jTk["name"].ToString();
                    rbacRoleAssignmentTableOper.InsertEntity(rbacRoleAssignment);

                    var rgRoleAssignment = new RGRBACRoleAssignmentEntity(resourceGroupID,roleBackendIDName);
                    rgRoleAssignment.RoleDefinitionId = roleDefinitionId;
                    rgRoleAssignment.UserObjectID = jTk["properties"]["principalId"].ToString();
                    rgRoleAssignment.Scope = jTk["properties"]["scope"].ToString();
                    rgRoleAssignment.CreatedOn = jTk["properties"]["createdOn"].ToString();
                    rgRoleAssignment.UpdatedOn = jTk["properties"]["updatedOn"].ToString();
                    rgRoleAssignment.CreatedBy = jTk["properties"]["createdBy"].ToString();
                    rgRoleAssignment.UpdatedBy = jTk["properties"]["updatedBy"].ToString();
                    rgRoleAssignment.AssignmentID = jTk["id"].ToString();
                    rgRoleAssignment.Type = jTk["type"].ToString();
                    rgRoleAssignment.AssignmentName = jTk["name"].ToString();
                    rgRoleAssignmentTableOper.InsertEntity(rgRoleAssignment);



                    jTk = jTk.Next;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        static void RetrieveResourceGroups()
        {
            Console.WriteLine("Start to sync RM resource groups ...");
            string _subscriptionId = ConfigurationSettings.AppSettings["azureSubscriptionID"];
            var client = new HttpClient();
            var header = AuthenticationHelper.GetAuthorizationHeader();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", header);

            try
            {
                var myTask = client.GetStringAsync(
                    String.Format(
                        "https://management.chinacloudapi.cn/subscriptions/{0}/resourcegroups?api-version=2015-01-01",
                        _subscriptionId));
                var result = myTask.Result;


                JObject jObj = JObject.Parse(result);
                JToken jTk = jObj.GetValue("value").First;

                while (jTk != null)
                {
                    var rmResourceGroup = new RMResourceGroupEntiry(jTk["name"].ToString(), jTk["location"].ToString());
                    rmResourceGroup.resourceGroupID = jTk["id"].ToString();
                    if (jTk["tags"] != null)
                    {
                        rmResourceGroup.tags = jTk["tags"].ToString();
                    }
                    rmResourceGroup.properties = jTk["properties"].ToString();
                    rmResourceGroupOper.InsertEntity(rmResourceGroup);

                    jTk = jTk.Next;
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }  
        }

        static void RetrieveRMResources()
        {
            Console.WriteLine("Start to sync RM resources ...");
            string _subscriptionId = ConfigurationSettings.AppSettings["azureSubscriptionID"];
            var client = new HttpClient();
            var header = AuthenticationHelper.GetAuthorizationHeader();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", header);

            try
            {
                var myTask = client.GetStringAsync(
                    String.Format(
                        "https://management.chinacloudapi.cn/subscriptions/{0}/resources?api-version=2015-01-01",
                        _subscriptionId));
                var result = myTask.Result;

                JObject jObj = JObject.Parse(result);
                JToken jTk = jObj.GetValue("value").First;

                while (jTk != null)
                {
                    string resourceId = jTk["id"].ToString(); //  /subscriptions/03042fd8-7b09-4c73-9217-0dcea66ede69/resourceGroups/Ambercs/providers/Microsoft.ClassicCompute/domainNames/Ambercs
                    string[] items = resourceId.Split('/');
                    string resourceGroupName = "";
                    string resourceType = "";
                    for(int i=0; i<items.Count() - 1;i++)
                    {
                        if(items[i]=="resourceGroups")
                        {
                            resourceGroupName = items[i+1];
                        }
                        if(items[i]=="providers")
                        {
                            resourceType = items[i + 1] + "." + items[i + 2] + "." + items[i + 3];
                            break;
                        }
                    }

                    var rmResource = new RMResourceEntity(resourceGroupName, resourceType);
                    rmResource.resourceID = resourceId;
                    rmResource.resourceName = jTk["name"].ToString();
                    rmResource.resourceType = jTk["type"].ToString();
                    rmResource.resourceLocation = jTk["location"].ToString();
                    rmResourceOper.InsertEntity(rmResource);

                    jTk = jTk.Next;
        }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }  
        }

        public static void PortalSimulator()
        {
            Console.WriteLine("Start to insert simulation data ?");
            if (Console.ReadLine()=="yes")
            {
            var userGroupAssignment = new UserGroupAssignmentsEntity("8734cc8a-2e67-4a9f-b1aa-3306a5e62760", "f8541113-c54b-4eab-af59-77b0eeef3617");
                userGroupAssignment.UserPrincipleName = "admin@jianwmfatest.partner.onmschina.cn";
            userGroupAssignment.GroupName = "MyGroup";
            userGroupAssignment.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            userGroupAssignmentOperation.InsertEntity(userGroupAssignment);

            var appGroupAssignment = new AppGroupAssignmentEntity("1a7249e7-fa56-4c47-83de-5048097bc510", "f8541113-c54b-4eab-af59-77b0eeef3617");
            appGroupAssignment.AppName = "Console App for Azure AD";
            appGroupAssignment.GroupName = "MyGroup";
            appGroupAssignment.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            appGroupAssignment.OperationTypes = OperationTypes.Read.ToString();
            appGroupAssignmentOperation.InsertEntity(appGroupAssignment);
            }

        }

        public static void TestItaLite()
        {
            TableDal userGroupAssignmentOperation = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.UserGroupAssignments);
            TableDal appGroupAssignmentOperation = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AppGroupAssignments);

            var userGroupAssignment = new UserGroupAssignmentsEntity("8734cc8a-2e67-4a9f-b1aa-3306a5e62760", "f8541113-c54b-4eab-af59-77b0eeef3617");
            userGroupAssignment.UserPrincipleName = "testuu@jianwmfatest.partner.onmschina.cn";
            userGroupAssignment.GroupName = "MyGroup";
            userGroupAssignment.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            userGroupAssignmentOperation.InsertEntity(userGroupAssignment);

            var appGroupAssignment = new AppGroupAssignmentEntity("1a7249e7-fa56-4c47-83de-5048097bc510", "f8541113-c54b-4eab-af59-77b0eeef3617");
            appGroupAssignment.AppName = "Console App for Azure AD";
            appGroupAssignment.GroupName = "MyGroup";
            appGroupAssignment.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            appGroupAssignment.OperationTypes = OperationTypes.Read.ToString();
            appGroupAssignmentOperation.InsertEntity(appGroupAssignment);

            InvokingITA testITACore = new InvokingITA();
            // true
            Console.WriteLine(testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment }, new List<AppGroupAssignmentEntity>() { appGroupAssignment }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760", "1a7249e7-fa56-4c47-83de-5048097bc510"));
            // false
            Console.WriteLine(testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment }, new List<AppGroupAssignmentEntity>() { appGroupAssignment }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760_", "1a7249e7-fa56-4c47-83de-5048097bc510"));
            // false
            Console.WriteLine(testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment }, new List<AppGroupAssignmentEntity>() { appGroupAssignment }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760", "1a7249e7-fa56-4c47-83de-5048097bc510_"));


            var userGroupAssignment2 = new UserGroupAssignmentsEntity("8734cc8a-2e67-4a9f-b1aa-3306a5e62760_", "f8541113-c54b-4eab-af59-77b0eeef3617");
            userGroupAssignment2.UserPrincipleName = "testuu@jianwmfatest.partner.onmschina.cn";
            userGroupAssignment2.GroupName = "MyGroup";
            userGroupAssignment2.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            userGroupAssignmentOperation.InsertEntity(userGroupAssignment2);

            // true
            Console.WriteLine(testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment, userGroupAssignment2 }, new List<AppGroupAssignmentEntity>() { appGroupAssignment }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760_", "1a7249e7-fa56-4c47-83de-5048097bc510"));

            var appGroupAssignment2 = new AppGroupAssignmentEntity("1a7249e7-fa56-4c47-83de-5048097bc510_", "f8541113-c54b-4eab-af59-77b0eeef3617_");
            appGroupAssignment2.AppName = "Console App for Azure AD_";
            appGroupAssignment2.GroupName = "MyGroup";
            appGroupAssignment2.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            appGroupAssignment2.OperationTypes = OperationTypes.Read.ToString();
            appGroupAssignmentOperation.InsertEntity(appGroupAssignment2);

            var userGroupAssignment31 = new UserGroupAssignmentsEntity("8734cc8a-2e67-4a9f-b1aa-3306a5e62760", "f8541113-c54b-4eab-af59-77b0eeef3617_");
            userGroupAssignment2.UserPrincipleName = "testuu@jianwmfatest.partner.onmschina.cn";
            userGroupAssignment2.GroupName = "MyGroup";
            userGroupAssignment2.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            userGroupAssignmentOperation.InsertEntity(userGroupAssignment2);

            var userGroupAssignment32 = new UserGroupAssignmentsEntity("8734cc8a-2e67-4a9f-b1aa-3306a5e62760_", "f8541113-c54b-4eab-af59-77b0eeef3617_");
            userGroupAssignment2.UserPrincipleName = "testuu@jianwmfatest.partner.onmschina.cn";
            userGroupAssignment2.GroupName = "MyGroup";
            userGroupAssignment2.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            userGroupAssignmentOperation.InsertEntity(userGroupAssignment2);

            // true
            Console.WriteLine(testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment, userGroupAssignment2, userGroupAssignment31 }, new List<AppGroupAssignmentEntity>() { appGroupAssignment, appGroupAssignment2 }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760", "1a7249e7-fa56-4c47-83de-5048097bc510_"));

            // true
            Console.WriteLine(testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment, userGroupAssignment2, userGroupAssignment32 }, new List<AppGroupAssignmentEntity>() { appGroupAssignment, appGroupAssignment2 }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760_", "1a7249e7-fa56-4c47-83de-5048097bc510_"));

        }
    }
}
