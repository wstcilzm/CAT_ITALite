using System.Configuration;
using System.Threading.Tasks;
using System.Web.Http;
using CAT.ITALite.Common;

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
        public async Task<IHttpActionResult> GetUsersAsync(int userId)
        {
            return CreateSuccessResult(null);
        }
    }
}
