using System.Configuration;
using System.Threading.Tasks;
using System.Web.Http;
using CAT.ITALite.Common;
using CAT.ITALite.Entity;
using Microsoft.Azure.ActiveDirectory.GraphClient;
using CAT.ITALite.WebApi.Utility;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Queue;

namespace CAT.ITALite.WebApi.ApiControllers
{
    [RoutePrefix("api/group")]
    public class GroupApiController : ApiControllerBase
    {
        [HttpGet]
        [Route("list")]
        public async Task<IHttpActionResult> GetGroupsAsync()
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AADGroups);
            var result = operation.RetrieveGroups();
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("{groupId}/applications")]
        public async Task<IHttpActionResult> GetApplicationsAsync(string groupId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AppGroupAssignments);
            var result = operation.RetrieveApplications(groupId);
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("{groupId}/users")]
        public async Task<IHttpActionResult> GetUsersAsync(string groupId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserGroupAssignments);
            var result = operation.RetrieveUserGroupAssignments(groupId);
            return CreateSuccessResult(result);
        }

        [HttpPost]
        [Route("add")]
        public async Task<IHttpActionResult> PostAddGroup([FromBody] GroupEntity group)
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

            Group newGroup = new Group
            {
                DisplayName = group.RowKey,
                Description = group.Descrption,
                MailNickname = group.MailNickName,
                MailEnabled = false,
                SecurityEnabled = true
            };
            try
            {
                await Task.Run(() =>
                {
                    activeDirectoryClient.Groups.AddGroupAsync(newGroup).Wait();
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
                CloudQueueMessage message = new CloudQueueMessage("New AAD Group;" + group.RowKey);
                queue.AddMessage(message);
                return CreateSuccessResult(string.Empty);
            }
            catch (System.Exception e)
            {
                return CreateErrorResult(501, e.Message);
            }
        }
    }
}
