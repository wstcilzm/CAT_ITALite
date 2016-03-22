using System.Configuration;
using System.Threading.Tasks;
using System.Web.Http;
using CAT.ITALite.Common;
using CAT.ITALite.Entity;
using Microsoft.Azure.ActiveDirectory.GraphClient;
using CAT.ITALite.WebApi.Utility;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Queue;
using System.Collections.Generic;

namespace CAT.ITALite.WebApi.ApiControllers
{
    [RoutePrefix("api/user")]
    public class UserApiController : ApiControllerBase
    {
        [HttpGet]
        [Route("list")]
        public async Task<IHttpActionResult> GetUsersAsync()
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AADUsers);
            var result = operation.RetrieveUsers();
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("{userId}/groups")]
        public async Task<IHttpActionResult> GetGroupsAsync(string userId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserGroupAssignments);
            var result = operation.RetrieveGroupsByUserId(userId);
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("{groups}/apps")]
        public async Task<IHttpActionResult> GetAppsAsync(string groups)
        {
                var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AppGroupAssignments);
                var result = operation.RetrieveUserGroupApplications(groups);
                return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("{userId}")]
        public async Task<IHttpActionResult> GetUsersAsync(string userId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AADUsers);
            var result = operation.RetrieveUserByUserId(userId);
            return CreateSuccessResult(result);
        }

        [HttpPost]
        [Route("add")]
        public async Task<IHttpActionResult> PostAddUserAsync([FromBody] AADUserEntity user)
        {

            

            ActiveDirectoryClient activeDirectoryClient;
            try
            {
                activeDirectoryClient = AuthenticationHelper.GetActiveDirectoryClientAsApplication();
            }
            catch (AuthenticationException ex)
            {
                return CreateErrorResult(401, ex.Message);
            }

            IUser newUser = new User();
            if (user!= null )
            {
                newUser.DisplayName = user.DisplayName; 
                newUser.UserPrincipalName = user.RowKey;
                newUser.AccountEnabled = true;
                newUser.MailNickname = user.DisplayName;
                newUser.UserType = user.UserType;
                newUser.UsageLocation = user.UsageLocation;
                newUser.PasswordProfile = new PasswordProfile
                {
                    Password = user.Password,
                    ForceChangePasswordNextLogin =user.ForceChangePwd 
                };
                try
                {
                    await Task.Run(()=>
                        {
                        activeDirectoryClient.Users.AddUserAsync(newUser).Wait();
                    });
                    
                    // Retrieve storage account from connection string.
                    CloudStorageAccount storageAccount = CloudStorageAccount.Parse(ConfigurationSettings.AppSettings["storageConnection"]);
                    // Create the queue client.
                    CloudQueueClient queueClient = storageAccount.CreateCloudQueueClient();
                    // Retrieve a reference to a queue.
                    CloudQueue queue = queueClient.GetQueueReference("italitemsgqueue");
                    // Create the queue if it doesn't already exist.
                    queue.CreateIfNotExists();
                    // Create a message and add it to the queue.
                    CloudQueueMessage message = new CloudQueueMessage("New AAD User;" + user.RowKey);
                    queue.AddMessage(message);
                    return CreateSuccessResult(string.Empty);
                }
                catch (System.Exception e)
                {
                    return CreateErrorResult(501, e.Message);
                }
            }
            return CreateErrorResult(301, "User has some invalid info");
        }

        [HttpGet]
        [Route("{userId}/roles")]
        public async Task<IHttpActionResult> GetRBACRolesByUserID(string userId)
        {
            List<RBACRoleEntity> list = new List<RBACRoleEntity>();

            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserRBACRoleAssignments);
            var result = operation.RetrieveRolesByUserId(userId);
            foreach(UserRBACRoleAssignmentEntity entiry in result)
            {
                string roleId = entiry.RowKey;
                operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.RBACRoles);
                var RBAC_result = operation.RetrieveRbacRoleByID(roleId);
                foreach(RBACRoleEntity rb_entity in RBAC_result)
                {
                    list.Add(rb_entity);
                }
            }

            return CreateSuccessResult(list);
        }
    }
    
}
