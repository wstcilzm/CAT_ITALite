using System.Configuration;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using CAT.ITALite.Common;
using CAT.ITALite.Entity;
using System.Collections.Generic;

namespace CAT.ITALite.WebApi.ApiControllers
{
    [RoutePrefix("api/RMResource")]
    public class RMResourceApiController:ApiControllerBase
    {
        [HttpGet]
        [Route("listGroups")]
        public async Task<IHttpActionResult> GetResourceGroupsAsync()
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.RMResourceGroups);
            var result = operation.RetrieveRMGroups();
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("{groupId}/resources")]
        public async Task<IHttpActionResult> GetResourcesByGroupIDAsync(string groupId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.RMResources);
            var result = operation.RetrieveRMResourcesByGroupID(groupId);
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("{resGroupID}/roles")]
        public async Task<IHttpActionResult> GetRolesByResGroupIDAsync(string resGroupID)
        {
            string groupName = resGroupID.Split(';')[0];
            string groupID = resGroupID.Split(';')[1];
            List<ResourcePageView> list = new List<ResourcePageView>();

            groupID = groupID.Replace("/", "&");

            //RetrieveRMResourcesByGroupID
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.RMResourceGroups);
            var result = operation.RetrieveRMGroup(groupName);
            foreach (RMResourceGroupEntiry resGroupEntiry in result)
            {
                operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.RGRBACRoleAssignments);
                var RGBACRole_result = operation.RetrieveRGRBACRoleAssignmentByGroupID(groupID);
                foreach (RGRBACRoleAssignmentEntity entry in RGBACRole_result)
                {
                    var role_operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.RBACRoles);
                    var role_result = role_operation.RetrieveRbacRoleByID(entry.RowKey);
                    RBACRoleEntity rbacRole = new RBACRoleEntity();
                    foreach(RBACRoleEntity _temp in role_result)
                    {
                        rbacRole = _temp;
                        break;
                    }
                    operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserRBACRoleAssignments);
                    var userRBRole_result = operation.RetrieveUsersByRbacRoleId(entry.RowKey);
                    foreach (UserRBACRoleAssignmentEntity userRBACRoleAssignmentEntity in userRBRole_result)
                    {
                        ResourcePageView view = new ResourcePageView();
                        view.ResourceGroupName = resGroupEntiry.PartitionKey;
                        view.GroupID = resGroupEntiry.resourceGroupID;
                        view.UserID = "External AAD User";
                        view.UserPrincipleName = "External AAD User";
                        view.Location = resGroupEntiry.RowKey;
                        view.RoleName = rbacRole.RowKey;
                        view.RoleID = rbacRole.PartitionKey;
                        var user_operation= new TableDal(ConfigurationManager.AppSettings["storageConnection"],TableNames.AADUsers);
                        var user_result = user_operation.RetrieveUserByUserId(userRBACRoleAssignmentEntity.PartitionKey);
                        foreach(UserEntity userEntity in user_result)
                        {
                            view.UserID = userEntity.PartitionKey;
                            view.UserPrincipleName = userEntity.RowKey;
                            break;
                        }
                        list.Add(view);
                    }
                }
            }




            return CreateSuccessResult(list);
        }
    }
}