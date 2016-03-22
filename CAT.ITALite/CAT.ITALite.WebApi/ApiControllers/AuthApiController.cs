using System.Configuration;
using System.Web.Http;
using CAT.ITALite.Common;
using CAT.ITALite.WebApi.Controllers;
using System.Linq;

namespace CAT.ITALite.WebApi.ApiControllers
{
    //[Authorize]
    [RoutePrefix("api/auth")]
    public class AuthApiController : ApiControllerBase
    {
        [HttpGet]
        [Route("connect")]
        public AuthData Get(string AuthenKey)
        {
            AuthData resAuthData = AuthenController.IDsDic[AuthenKey];
            AuthenController.IDsDic.Remove(AuthenKey);
            return resAuthData;
        }

        private static InvokingITA ITACore = new InvokingITA();
        private static TableDal userRelationTableOper = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserGroupAssignments);
        private static TableDal appRelationTableOper = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AppGroupAssignments);
        [HttpPost]
        [Route("check")]
        public AuthData Post([FromBody]AuthData inputData)
        {
            var userResult = userRelationTableOper.RetrieveGroupsByUserId(inputData.userObjectID).ToList();
            var appResult = appRelationTableOper.RetrieveGroupsByAppId(inputData.appObjectId).ToList();          
                      
            inputData.authResult = ITACore.AccessControl(userResult, appResult, inputData.userObjectID, inputData.appObjectId);
            return inputData;
        }

    }
}
