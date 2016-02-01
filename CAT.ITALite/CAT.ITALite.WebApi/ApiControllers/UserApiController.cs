using System.Configuration;
using System.Threading.Tasks;
using System.Web.Http;
using CAT.ITALite.Common;

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
            string[] PrincipleName_GroupID_arry = groups.Split(';');
            foreach (string str in PrincipleName_GroupID_arry)
            {
                string[] PrincipleName_Group = str.Split(',');
                string PrincipleName = PrincipleName_Group[0];
                string GroupID = PrincipleName_Group[1];
                var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AppGroupAssignments);
                var result = operation.RetrieveUserGroupApplications(GroupID, PrincipleName);
                return CreateSuccessResult(result);
            }
            return CreateErrorResult(0, "error Parameters ");
        }
               
    }
    
}
