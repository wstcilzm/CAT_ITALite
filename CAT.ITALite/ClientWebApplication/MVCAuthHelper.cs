using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using System.Web;
using System.Configuration;
using System.Net.Http.Headers;
using CAT.ITALite.Common;
using Newtonsoft.Json;
using System.Web.Security;

namespace ClientWebApplication
{
    public class MVCAuthHelper : IAuthHelper
    {

        private AuthData userData;
        public AuthData UserData
        {
            get { return userData; }
            private set { }
        }

        public LoginModel loginModel { get; set; }


        public void GetUserDataCookie()
        {
            bool isSignIn = HttpContext.Current.User.Identity.IsAuthenticated;
            HttpCookie authCookie = HttpContext.Current.Response.Cookies.Get(FormsAuthentication.FormsCookieName);
            if (authCookie == null || authCookie.Value == null)
            {
                authCookie = HttpContext.Current.Request.Cookies.Get(FormsAuthentication.FormsCookieName);
            }
            try
            {

                FormsAuthenticationTicket authTicket = FormsAuthentication.Decrypt(authCookie.Value);
                if (authTicket != null)
                {
                    userData = JsonConvert.DeserializeObject<AuthData>(authTicket.UserData);
                }
                else
                {
                    userData = null;
                }
            }
            catch (Exception ex)
            {
                string message = ex.Message;
                userData = null;
            }
        }

        private void SetUserDataCookie()
        {
            if (userData != null)
            {
                try
                {
                    var result = JsonConvert.SerializeObject(userData);
                    FormsAuthenticationTicket authTicket = new FormsAuthenticationTicket(
                    1,
                    userData.userPrincipleName,
                    DateTime.Now,
                    DateTime.Now.AddMinutes(30),
                    false,
                   result
                    );
                    string encryptedTicket = FormsAuthentication.Encrypt(authTicket);
                    //HttpContext.Current.Response.Cookies.Clear();
                    System.Web.HttpCookie authCookie = new System.Web.HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                    System.Web.HttpContext.Current.Response.Cookies.Add(authCookie);
                }
                catch(Exception)
                {

                }
            }
        }

        public bool HasAccessToken(Object sender)
        {
            HttpRequest request = (HttpRequest)sender;
            if (string.IsNullOrEmpty(request.QueryString["AK"]))
            {
                return false;
            }
            else
            {
                return true;
            }
        } 

        public void Authentication(string accesskey)
        {
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri(System.Configuration.ConfigurationManager.AppSettings["AuthenServer"]);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                var result = client.GetAsync("api/auth/connect/?AuthenKey=" + accesskey).Result.Content.ReadAsStringAsync().Result;
                try
                {
                    userData = JsonConvert.DeserializeObject<AuthData>(result);
                   
                    SetUserDataCookie();
                }
                catch(Exception)
                {
                    ; 
                }

            }
        }

        public bool IsAuthentication()
        {
            GetUserDataCookie();
            if(userData!=null)
            {
                return true;
            }
            return false;
        }


        public bool IsAuthorization()
        {
            GetUserDataCookie();
            if (userData != null && userData.authResult)
            {
                return true;
            }
            return false;
        }

        public void Authorization(string appId,string appName,string hashKey)
        {
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri(ConfigurationManager.AppSettings["AuthenServer"]);
                if(userData!=null)
                {
                    try {
                        userData.appObjectId = appId;
                        userData.appName = appName;
                        userData.hashKey = hashKey;
                        var requestJson = JsonConvert.SerializeObject(userData);
                        HttpContent httpContent = new StringContent(requestJson);
                        httpContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                        var result = client.PostAsync("api/auth/check", httpContent).Result.Content.ReadAsStringAsync().Result;
                        userData = JsonConvert.DeserializeObject<AuthData>(result);
                        SetUserDataCookie();
                    }
                    catch(Exception ex)
                    {
                        string message = ex.Message;
                    }
                }

            }
        }

        public void ClearCookie()
        {
            HttpContext.Current.Response.Cookies.Clear();
            System.Web.HttpCookie authCookie = new System.Web.HttpCookie(FormsAuthentication.FormsCookieName);
            authCookie.Expires= DateTime.Now.AddDays(-1d);
            System.Web.HttpContext.Current.Response.Cookies.Add(authCookie);
            this.userData = null;
        }

    }

    public class LoginModel
    {
        public string LoginName { get; set; }
        public string BuddyLink { get; set; }
        public string SignoutServer { get; set; }
    }
}
