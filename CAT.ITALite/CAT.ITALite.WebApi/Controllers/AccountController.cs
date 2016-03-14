using System.Web;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using System.Web.Mvc;
using Microsoft.Owin.Security.OpenIdConnect;

namespace CAT.ITALite.WebApi.Controllers
{
    public class AccountController : Controller
    {
        public void SignIn()
        {
            // Send an OpenID Connect sign-in request.
            if (!Request.IsAuthenticated)
            {
                HttpContext.GetOwinContext().Authentication.Challenge(new AuthenticationProperties { RedirectUri = "/" }, OpenIdConnectAuthenticationDefaults.AuthenticationType);
            }
        }
        public void SignOut()
        {
            string relyingApp = Request.QueryString["Uri"];
            // Send an OpenID Connect sign-out request.
            HttpContext.GetOwinContext().Authentication.SignOut(
                OpenIdConnectAuthenticationDefaults.AuthenticationType, CookieAuthenticationDefaults.AuthenticationType);
            if (string.IsNullOrEmpty(relyingApp))
            {
                Session["RelyingApp"] = null;
            }
            else
            {
                Session["RelyingApp"] = relyingApp;
            }
        }
    }
}
