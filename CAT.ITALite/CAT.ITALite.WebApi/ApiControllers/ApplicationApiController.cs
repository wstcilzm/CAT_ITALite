using System.Configuration;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using CAT.ITALite.Common;
using CAT.ITALite.Entity;
using System.Collections.Generic;

namespace CAT.ITALite.WebApi.ApiControllers
{
    [RoutePrefix("api/application")]
    public class ApplicationApiController : ApiControllerBase
    {
        [HttpGet]
        [Route("list")]
        public async Task<IHttpActionResult> GetApplicationssAsync()
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AADApps);
            var result = operation.RetrieveApplications();
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("{appId}/groups")]
        public async Task<IHttpActionResult> GetGroupsAsync(string appId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AppGroupAssignments);
            var result = (IEnumerable<AppGroupAssignmentEntity>)(operation.RetrieveGroupsByAppId(appId));
            var optGroup = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AADGroups);
            var final = optGroup.RetrieveGroups(result);
            return CreateSuccessResult(final);
            }
        }
    }
