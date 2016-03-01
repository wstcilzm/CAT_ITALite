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
    }
}