using System.Configuration;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using CAT.ITALite.Common;
using CAT.ITALite.Entity;
using System.Collections.Generic;


namespace CAT.ITALite.WebApi.ApiControllers
{
    [RoutePrefix("api/role")]
    public class RoleApiController : ApiControllerBase
    {
        [HttpGet]
        [Route("list")]
        public async Task<IHttpActionResult> GetRolesAsync()
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AADAdminRoles);
            var result = operation.RetrieveAdminRoles();
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("{roleId}/users")]
        public async Task<IHttpActionResult> GetUsersAsync(string roleId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserAdminRoleAssignments);
            var result = (IEnumerable<UserAdminRoleAssignmentEntity>)(operation.RetrieveUsersByRoleId(roleId));
            return CreateSuccessResult(result);
        }
    }
}