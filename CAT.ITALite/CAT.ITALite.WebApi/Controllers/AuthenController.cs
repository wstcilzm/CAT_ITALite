using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Web.Mvc;
using CAT.ITALite.Common;

namespace CAT.ITALite.WebApi.Controllers
{

    
    public class AuthenController : Controller
    {
        public static Dictionary<string,AuthData> IDsDic = new Dictionary<string,AuthData>();

        //[Authorize]
        // GET: Authen
        public string Index()
        {
            ViewBag.nextUri = Request.QueryString["Uri"];
            if (!string.IsNullOrEmpty(ViewBag.nextUri))
            {
                ViewBag.Name = ClaimsPrincipal.Current.FindFirst(ClaimTypes.Name).Value;
                ViewBag.ObjectId = ClaimsPrincipal.Current.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier").Value;
                ViewBag.GivenName = ClaimsPrincipal.Current.FindFirst(ClaimTypes.GivenName).Value;
                ViewBag.Surname = ClaimsPrincipal.Current.FindFirst(ClaimTypes.Surname).Value;
                ViewBag.UPN = ClaimsPrincipal.Current.FindFirst(ClaimTypes.Upn).Value;
                
                AuthData newUser = new AuthData();
                newUser.userPrincipleName = ClaimsPrincipal.Current.FindFirst(ClaimTypes.Upn).Value;
                newUser.userObjectID = ClaimsPrincipal.Current.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier").Value;

                ViewBag.Key = Guid.NewGuid().ToString();
                IDsDic.Add(ViewBag.Key, newUser);

                //Session["RelyingApp"] = Request.QueryString["Uri"];
                //Response.Cookies["RelyingApp"].Value = Request.QueryString["Uri"];
                //Response.Cookies["RelyingApp"].Expires = DateTime.Now.AddDays(1);

                //will do similar logistics for authentication integration
                string uri = Request.QueryString["Uri"] + "?AK=" + ViewBag.Key;

                Response.Redirect(uri);
            }
            return "Welcome to ITALite.";
            
        }

        [Authorize]
        public ActionResult test()
        {
            //return "Authenticated! Welcome to ITALite.";

            return View();
        }

    }


}