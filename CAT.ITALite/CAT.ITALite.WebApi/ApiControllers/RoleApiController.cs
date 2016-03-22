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
        
        [HttpGet]
        [Route("rbac/list")]
        public async Task<IHttpActionResult> GetRbacRolesAsync()
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.RBACRoles);
            var result = operation.RetrieveRbacRoles();
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("rbac/{roleId}/users")]
        public async Task<IHttpActionResult> GetRbacRolesUsersAsync(string roleId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserRBACRoleAssignments);
            var result = operation.RetrieveUsersByRbacRoleId(roleId);
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("rbac/{userId}/groups")]
        public async Task<IHttpActionResult> GetRMGroupsAsync(string userId)
        {
            #region get RBACRoleBy userID
            List<RBACRoleEntity> RBACRolelist = new List<RBACRoleEntity>();
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserRBACRoleAssignments);
            var result = operation.RetrieveRolesByUserId(userId);
            foreach (UserRBACRoleAssignmentEntity entiry in result)
            {
                string roleId = entiry.RowKey;
                operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.RBACRoles);
                var RBAC_result = operation.RetrieveRbacRoleByID(roleId);
                foreach (RBACRoleEntity rb_entity in RBAC_result)
                {
                    RBACRolelist.Add(rb_entity);
                }
            }

            #endregion


            List<RmAccessGroupView> list = new List<RmAccessGroupView>();

            foreach (RBACRoleEntity rbacRole in RBACRolelist)
            {
                string roleId = rbacRole.PartitionKey;
                string roleName = rbacRole.RowKey;
                operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.RGRBACRoleAssignments);
                var RGresult = operation.RetrieveRMGroupsByRbacRoleId(roleId);
                foreach (RGRBACRoleAssignmentEntity RG_entity in RGresult)
                {
                    string rmGroupName = RG_entity.PartitionKey.Substring(RG_entity.PartitionKey.LastIndexOf("&") + 1);
                    operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.RMResourceGroups);
                    var RMresult = operation.RetrieveRMGroup(rmGroupName);
                    foreach (RMResourceGroupEntiry RmG_entity in RMresult)
                    {
                        list.Add(new RmAccessGroupView(RmG_entity, roleName));
                    }
                }

            }
            return CreateSuccessResult(list);
        }

    }
}