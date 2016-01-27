using System.Web.Http;

namespace CAT.ITALite.WebApi.ApiControllers
{
    public class ApiControllerBase : ApiController
    {
        protected IHttpActionResult CreateSuccessResult(object result)
        {
            return Ok(new
            {
                status = "success",
                result = result
            });
        }

        protected IHttpActionResult CreateErrorResult(int code, string message)
        {
            return Ok(new
            {
                status = "error",
                error = new
                {
                    code = code,
                    message = message
                }
            });
        }
    }
}
