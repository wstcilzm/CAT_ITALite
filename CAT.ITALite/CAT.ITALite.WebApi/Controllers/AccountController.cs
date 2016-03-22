using System.Web;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using System.Web.Mvc;
using Microsoft.Owin.Security.OpenIdConnect;
using System;

namespace CAT.ITALite.WebApi.Controllers
{
    public class AccountController : Controller
    {
        public void SignIn()
        {
            // Send an OpenID Connect sign-in request.
            if (!Request.IsAuthenticated)
            {
                HttpContext.GetOwinContext().Authentication.Challenge(new AuthenticationProperties { RedirectUri = "Authen/index?Uri="+ Request.QueryString["Uri"] }, OpenIdConnectAuthenticationDefaults.AuthenticationType);
            }
            else
            {
                Response.Redirect("../Authen/index?Uri=" + Request.QueryString["Uri"]);
            }
        }
        public void SignOut()
        {
            string relyingApp = Request.QueryString["Uri"] + "?BK=" + Guid.NewGuid().ToString();
            // Send an OpenID Connect sign-out request.
            HttpContext.GetOwinContext().Authentication.SignOut(
                new AuthenticationProperties { RedirectUri= relyingApp },
                OpenIdConnectAuthenticationDefaults.AuthenticationType, CookieAuthenticationDefaults.AuthenticationType);
            //HttpContext.GetOwinContext().Authentication.SignOut(CookieAuthenticationDefaults.AuthenticationType);
            //if (string.IsNullOrEmpty(relyingApp))
            //{
            //    Session["RelyingApp"] = null;
            //}
            //else
            //{
            //    Session["RelyingApp"] = relyingApp;
            //}
        }
    }
}
