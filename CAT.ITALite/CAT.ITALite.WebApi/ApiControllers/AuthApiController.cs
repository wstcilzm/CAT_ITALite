using System.Configuration;
using System.Web.Http;
using CAT.ITALite.Common;
using CAT.ITALite.WebApi.Controllers;

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
            return AuthenController.IDsDic[AuthenKey];
        }

        [HttpPost]
        [Route("check")]
        public AuthData Post([FromBody]AuthData inputData)
        {

            TableDal userRelationTableOper = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserGroupAssignments);
            TableDal appRelationTableOper = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AppGroupAssignments);

            var userResult = userRelationTableOper.RetrieveGroupsByUserId(inputData.userObjectID);
            var appResult = appRelationTableOper.RetrieveGroupsByAppId(inputData.appObjectId);

            inputData.authResult = false;
            foreach (var user in userResult)
            {
                foreach (var app in appResult)
                {
                    if (app.RowKey == user.RowKey)
                    {
                        inputData.authResult = true;
                        inputData.hashKey = "hello, world.";
                        return inputData;
                    }
                }
            }
            return inputData;
        }

    }
}
