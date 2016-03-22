using CAT.ITALite.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Configuration;

namespace ClientWebApplication
{
    public partial class SiteMaster : MasterPage
    {
        private const string AntiXsrfTokenKey = "__AntiXsrfToken";
        private const string AntiXsrfUserNameKey = "__AntiXsrfUserName";
        private string _antiXsrfTokenValue;

        protected void Page_Init(object sender, EventArgs e)
        {
            // The code below helps to protect against XSRF attacks
            var requestCookie = Request.Cookies[AntiXsrfTokenKey];
            Guid requestCookieGuidValue;
            if (requestCookie != null && Guid.TryParse(requestCookie.Value, out requestCookieGuidValue))
            {
                // Use the Anti-XSRF token from the cookie
                _antiXsrfTokenValue = requestCookie.Value;
                Page.ViewStateUserKey = _antiXsrfTokenValue;
            }
            else
            {
                // Generate a new Anti-XSRF token and save to the cookie
                _antiXsrfTokenValue = Guid.NewGuid().ToString("N");
                Page.ViewStateUserKey = _antiXsrfTokenValue;

                var responseCookie = new HttpCookie(AntiXsrfTokenKey)
                {
                    HttpOnly = true,
                    Value = _antiXsrfTokenValue
                };
                if (FormsAuthentication.RequireSSL && Request.IsSecureConnection)
                {
                    responseCookie.Secure = true;
                }
                Response.Cookies.Set(responseCookie);
            }

            Page.PreLoad += master_Page_PreLoad;
        }

        protected void master_Page_PreLoad(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                // Set Anti-XSRF token
                ViewState[AntiXsrfTokenKey] = Page.ViewStateUserKey;
                ViewState[AntiXsrfUserNameKey] = Context.User.Identity.Name ?? String.Empty;
            }
            else
            {
                // Validate the Anti-XSRF token
                if ((string)ViewState[AntiXsrfTokenKey] != _antiXsrfTokenValue
                    || (string)ViewState[AntiXsrfUserNameKey] != (Context.User.Identity.Name ?? String.Empty))
                {
                    throw new InvalidOperationException("Validation of Anti-XSRF token failed.");
                }
            }
        }

        protected string LoginName = "Log In";
        protected string SigninServer = ConfigurationManager.AppSettings["AuthenServer"] + "Account/SignIn";
        protected string SignoutServer = ConfigurationManager.AppSettings["AuthenServer"] + "Account/SignOut";
        protected string ReturnUri =  ConfigurationManager.AppSettings["ReturnUri"];
        protected string BuddyLink = "Register"; //Register or Sign Out
        public static AuthData CurrentUser = null;

        protected void Page_Load(object sender, EventArgs e)
        {
            ReturnUri = ConfigurationManager.AppSettings["ReturnUri"] + Request.Url.AbsolutePath;

            if (!string.IsNullOrEmpty(Request.QueryString["AK"]))
            {
                using (var client = new HttpClient())
                {
                    client.BaseAddress = new Uri(ConfigurationManager.AppSettings["AuthenServer"]);
                    client.DefaultRequestHeaders.Accept.Clear();
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var result = client.GetAsync("api/auth/connect/?AuthenKey=" + Request.QueryString["AK"]).Result.Content.ReadAsStringAsync().Result;

                    try
                    {
                        CurrentUser = JsonConvert.DeserializeObject<AuthData>(result);
                        LoginName = CurrentUser.userPrincipleName;
                        BuddyLink = "Sign Out";
                        SignoutServer = ConfigurationManager.AppSettings["SignoutServer"];
                    }
                    catch(Exception ex)
                    { }

                }

            }

            if (null == CurrentUser || !string.IsNullOrEmpty(Request.QueryString["BK"]))
            {
                BuddyLink = "Register";
                SignoutServer = "Account/Register";
                LoginName = "Log In";
                CurrentUser = null;
            }
            else
            {
                LoginName = CurrentUser.userPrincipleName;
                BuddyLink = "Sign Out";
                SignoutServer = ConfigurationManager.AppSettings["SignoutServer"];
            }

            if(null!=CurrentUser && CurrentUser.authResult==false)
            {
                using (var client = new HttpClient())
                {

                    client.BaseAddress = new Uri(ConfigurationManager.AppSettings["AuthenServer"]);

                    CurrentUser.appObjectId = "05dbf7ce-ea6b-4784-89c6-d11c67a2c7f1";
                    CurrentUser.appName = "CATITA ClientWepApp";
                    CurrentUser.hashKey = DateTime.Now.Ticks.ToString();

                    var requestJson = JsonConvert.SerializeObject(CurrentUser);
                    HttpContent httpContent = new StringContent(requestJson);
                    httpContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                    var result = client.PostAsync("api/auth/check", httpContent).Result.Content.ReadAsStringAsync().Result;
                    CurrentUser = JsonConvert.DeserializeObject<AuthData>(result);
                }
            }

        }
    }
}