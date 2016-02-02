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


namespace CAT.ITALite.SyncService
{

    class Program
    {

        public static List<IUser> newUserList = new List<IUser>();
        public static TableDal userTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AADUsers);
        public static TableDal appTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AADApps);
        public static TableDal groupTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AADGroups);
        public static TableDal aadTableOper = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AADInfo);


        static void Main(string[] args)
        {
            #region Setup Active Directory Client

            //*********************************************************************
            // setup Active Directory Client
            //*********************************************************************
            ActiveDirectoryClient activeDirectoryClient;
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

            #region TenantDetails

            //*********************************************************************
            // Get Tenant Details
            // Note: update the string TenantId with your TenantId.
            // This can be retrieved from the login Federation Metadata end point:             
            // https://login.windows.net/GraphDir1.onmicrosoft.com/FederationMetadata/2007-06/FederationMetadata.xml
            //  Replace "GraphDir1.onMicrosoft.com" with any domain owned by your organization
            // The returned value from the first xml node "EntityDescriptor", will have a STS URL
            // containing your TenantId e.g. "https://sts.windows.net/4fd2b2f2-ea27-4fe5-a8f3-7b1a7c975f34/" is returned for GraphDir1.onMicrosoft.com
            //*********************************************************************
            VerifiedDomain initialDomain = new VerifiedDomain();
            VerifiedDomain defaultDomain = new VerifiedDomain();
            AADInfoEntity aadInfo = null;
            ITenantDetail tenant = null;
            Console.WriteLine("\n Retrieving Tenant Details");
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
                Console.WriteLine("Tenant Display Name: " + tenantDetail.DisplayName);

                // Get the Tenant's Verified Domains 
                initialDomain = tenantDetail.VerifiedDomains.First(x => x.Initial.HasValue && x.Initial.Value);
                Console.WriteLine("Initial Domain Name: " + initialDomain.Name);
                defaultDomain = tenantDetail.VerifiedDomains.First(x => x.@default.HasValue && x.@default.Value);
                Console.WriteLine("Default Domain Name: " + defaultDomain.Name);
                aadInfo = new AADInfoEntity(tenantDetail.ObjectId, initialDomain.Name);
                aadInfo.DefaultDomainName = defaultDomain.Name;
                aadInfo.ObjectType = tenantDetail.ObjectType;
                aadInfo.DisplayName = tenantDetail.DisplayName; 
                // Get Tenant's Tech Contacts
                foreach (string techContact in tenantDetail.TechnicalNotificationMails)
                {
                    Console.WriteLine("Tenant Tech Contact: " + techContact);
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

            #endregion


            //RetrieveUsers(activeDirectoryClient);
            //RetrieveGroups(activeDirectoryClient);
            //RetrieveApps(activeDirectoryClient);

            PortalSimulator();


            InvokingITA testITACore = new InvokingITA();
            Console.WriteLine(testITACore.AccessControl(true));
            Console.WriteLine(testITACore.AccessControl(false));

            Console.WriteLine("done!");
            Console.Read();

        }

        static void RetrieveUsers(ActiveDirectoryClient activeDirectoryClient)
        {

            IUserCollection userCollection = activeDirectoryClient.Users;

            IPagedCollection<IUser> searchResults = activeDirectoryClient.Users.OrderBy(user => user.DisplayName).ExecuteAsync().Result;

            List<IUser> usersList = searchResults.CurrentPage.ToList();

            if (usersList != null && usersList.Count > 0)
            {
                int count = 1;
                do
                {
                    Console.WriteLine("===={0}===", count++);
                    usersList = searchResults.CurrentPage.ToList();
                    newUserList = usersList;
                    foreach (IUser user in usersList)
                    {
                        Console.WriteLine("User DisplayName: {0} UPN: {1}", user.DisplayName, user.UserPrincipalName);

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
                Console.WriteLine();
            }
        }

        static void RetrieveGroups(ActiveDirectoryClient activeDirectoryClient)
        {
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
                    Console.WriteLine("Group Name: {0}   GroupObjectId: {1}", group.DisplayName, group.ObjectId);

                    var newGroup = new GroupEntity(group.ObjectId, group.DisplayName);
                    newGroup.Descrption = group.Description;
                    newGroup.SecurityEnabled = (bool)group.SecurityEnabled;
                    newGroup.MailNickName = group.MailNickname;
                    newGroup.OriginatedFrom = "AAD";
                    groupTableOper.InsertEntity(newGroup);

                    //Console.WriteLine("Group details ...");
                    //RetrieveGroupMembers(activeDirectoryClient, group as Group);
                }
            }
            else
            {
                Console.WriteLine("Group Not Found");
            }
            Console.WriteLine();
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
                                Console.WriteLine("User DisplayName: {0}  UPN: {1}",
                                    user.DisplayName,
                                    user.UserPrincipalName);
                            }
                            if (member is Group)
                            {
                                Group group = member as Group;
                                Console.WriteLine("Group DisplayName: {0}", group.DisplayName);
                            }
                            if (member is Contact)
                            {
                                Contact contact = member as Contact;
                                Console.WriteLine("Contact DisplayName: {0}", contact.DisplayName);
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


        static void RetrieveApps(ActiveDirectoryClient activeDirectoryClient)
        {
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
                        Console.WriteLine("Application AppId: {0}  Name: {1}", app.AppId, app.DisplayName);

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
            Console.WriteLine();
        }


        public static void PortalSimulator()
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

        }
    }
}
