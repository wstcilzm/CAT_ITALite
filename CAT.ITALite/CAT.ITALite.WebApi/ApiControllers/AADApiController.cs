using System.Configuration;
using System.Threading.Tasks;
using System.Web.Http;
using CAT.ITALite.Common;

namespace CAT.ITALite.WebApi.ApiControllers
{    
    [RoutePrefix("api/aad")]
    public class AADApiController : ApiControllerBase
    {
        [HttpGet]
        [Route("getaad")]
        public async Task<IHttpActionResult> GetAADAsync()
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AADInfo);
            var result = operation.RetrieveAADs();
            return CreateSuccessResult(result);
        }
    }
}