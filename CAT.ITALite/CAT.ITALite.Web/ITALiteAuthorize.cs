using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Principal;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace CAT.ITALite.Web
{


    public class ITALiteAuthorize : System.Web.Mvc.AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (httpContext == null)
            {
                throw new ArgumentNullException("HttpContext");
            }
            if (httpContext.User.Identity.IsAuthenticated)
            {
                return true;
            }

            return false;
        }

        public override void OnAuthorization(System.Web.Mvc.AuthorizationContext filterContext)
        {
            RestoreUserFromCookie(HttpContext.Current.Request);

            base.OnAuthorization(filterContext);
        }

        protected override void HandleUnauthorizedRequest(System.Web.Mvc.AuthorizationContext filterContext)
        {
            string AK = HttpContext.Current.Request.QueryString["AK"];
            string Uri = System.Configuration.ConfigurationManager.AppSettings["ReturnRelyingUri"];

            if (string.IsNullOrEmpty(AK))
            {
                string authServerUri = System.Configuration.ConfigurationManager.AppSettings["AuthenServer"] + "authen/index?Uri=" + Uri + "ITALiteAuth/ITALogon";           
                filterContext.Result = new RedirectResult(authServerUri);
            }
        }


        public static void RestoreUserFromCookie(HttpRequest Request)
        {
            HttpCookie authCookie = Request.Cookies[FormsAuthentication.FormsCookieName];
            if (authCookie != null)
            {
                FormsAuthenticationTicket authTicket = FormsAuthentication.Decrypt(authCookie.Value);

                ITALogonModel serializeModel = JsonConvert.DeserializeObject<ITALogonModel>(authTicket.UserData);
                ITALitePrincipal newUser = new ITALitePrincipal(authTicket.Name);
                if (null != newUser && null != serializeModel)
                {
                    newUser.UserID = serializeModel.ObjectId;
                    newUser.UserSurName = serializeModel.Surname;
                    newUser.UserGivenName = serializeModel.GivenName;
                    HttpContext.Current.User = newUser;
                }
            }
        }
    }

    public class ITALiteAuthController : Controller
    {
        public string ITALogon()
        {
            string AK = Request.QueryString["AK"];
            string Uri = Request.Url.AbsoluteUri;

            if (!string.IsNullOrEmpty(AK))
            {
                if (AK != null) //will use decryption to detect information loyalty
                {
                    using (var client = new HttpClient())
                    {
                        client.BaseAddress = new Uri(System.Configuration.ConfigurationManager.AppSettings["AuthenServer"]);
                        client.DefaultRequestHeaders.Accept.Clear();
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        var result = client.GetAsync("api/auth/connect/?AuthenKey=" + Request.QueryString["AK"]).Result.Content.ReadAsStringAsync().Result;

                        try
                        {
                            AuthData signedUser = JsonConvert.DeserializeObject<AuthData>(result);

                            ITALogonModel italiteModel = new ITALogonModel();
                            italiteModel.UPN = signedUser.userPrincipleName;
                            italiteModel.ObjectId = signedUser.userObjectID;
                            italiteModel.Surname = "N/A";
                            italiteModel.GivenName = "N/A";
                            italiteModel.Name = "hello, world.";

                            string userData = JsonConvert.SerializeObject(italiteModel);
                            FormsAuthenticationTicket authTicket = new FormsAuthenticationTicket(
                                1,
                                italiteModel.UPN,
                                DateTime.Now,
                                DateTime.Now.AddMinutes(30),
                                false,
                                userData
                                );
                            string encryptedTicket = FormsAuthentication.Encrypt(authTicket);
                            System.Web.HttpCookie authCookie = new System.Web.HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                            System.Web.HttpContext.Current.Response.Cookies.Add(authCookie);

                            Response.Redirect("~/");
                            //LoginName = CurrentUser.userPrincipleName;
                            //SignoutServer = ConfigurationManager.AppSettings["SignoutServer"];
                        }
                        catch (Exception ex)
                        {
                            return "Error in ITALite Auth.";
                        }

                    }
                }
            }
            return "hello, world.";
        }

        [ITALiteAuthorize]
        public string ITALogout()
        {
            FormsAuthenticationTicket authTicket = new FormsAuthenticationTicket(1,"null",DateTime.Now,DateTime.Now.AddDays(-1),false,"null");
            string encryptedTicket = FormsAuthentication.Encrypt(authTicket);
            System.Web.HttpCookie authCookie = new System.Web.HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
            System.Web.HttpContext.Current.Response.Cookies.Add(authCookie);

            string returnUri = System.Configuration.ConfigurationManager.AppSettings["ReturnRelyingUri"] + "ITALiteAuth/ITALite";
            Response.Redirect(System.Configuration.ConfigurationManager.AppSettings["AuthenServer"] + "Account/SignOut?Uri=" + returnUri);

            return "Welcome to ITALite.";
        }

        public string ITALite()
        {
            Response.Redirect("~/Views/WebForm/ITALiteInfo.html");
            return "Hello, ITALite.";
        }

    }


    public class ITALogonModel
    {
        public string Name { set; get; }
        public string ObjectId { set; get; }
        public string GivenName { set; get; }
        public string Surname { set; get; }
        public string UPN { set; get; }
    }

    public class ITALitePrincipal : IPrincipal
    {
        public IIdentity Identity { get; private set; }
        public ITALitePrincipal(string userPrincipleName)
        {
            this.Identity = new GenericIdentity(userPrincipleName);
        }

        public String[] roles { get; set; }
        public Boolean IsInRole(String role)
        {
            return roles.Any(r => String.Equals(role, r, StringComparison.InvariantCultureIgnoreCase));
        }
        public string UserID { get; set; }
        public string UserSurName { get; set; }
        public string UserGivenName { get; set; }

    }

    public class AuthData
    {
        public AuthData()
        {
            authResult = false;
            expireInUTC = DateTime.UtcNow;
            operationRequired = 0;
        }

        public string userObjectID { set; get; }
        public string userPrincipleName { set; get; }
        public string appObjectId { set; get; }
        public string appName { set; get; }
        public Byte operationRequired { set; get; }
        public string hashKey { set; get; }

        public bool authResult { set; get; }
        public DateTime expireInUTC { set; get; }

    }

}