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

        static MVCAuthHelper()
        {
            users = new Dictionary<string, AuthData>();
        }

        private AuthData userData;
        public AuthData UserData
        {
            get { return userData; }
            private set { }
        }

        private static IDictionary<string, AuthData> users ;
        public static IDictionary<string,AuthData> Users
        {
            get { return users; }
            private set {; }
        }

        public LoginModel loginModel { get; set; }


        public void GetUserDataFromServerCookie()
        {
            HttpCookie authCookie = HttpContext.Current.Response.Cookies.Get(FormsAuthentication.FormsCookieName);
            if (authCookie == null || authCookie.Value == null)
            {
                userData = null;
            }
            else
            {
                try
                {
                    FormsAuthenticationTicket authTicket = FormsAuthentication.Decrypt(authCookie.Value);
                    if (authTicket != null)
                    {
                        AuthData tempData = JsonConvert.DeserializeObject<AuthData>(authTicket.UserData);
                        if (users.Keys.Contains(UserData.userPrincipleName))
                        {
                            userData = users[tempData.userPrincipleName];
                        }

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
        }

        public void GetUserDataFromCustomerCookie()
        {
            HttpCookie authCookie = HttpContext.Current.Request.Cookies.Get(FormsAuthentication.FormsCookieName);
            if (authCookie == null || authCookie.Value == null)
            {
                userData = null;
            }
            else
            {
                try
                {
                    FormsAuthenticationTicket authTicket = FormsAuthentication.Decrypt(authCookie.Value);
                    if (authTicket != null)
                    {
                        AuthData tempData = JsonConvert.DeserializeObject<AuthData>(authTicket.UserData);
                        if (users.Keys.Contains(UserData.userPrincipleName))
                        {
                            userData = users[tempData.userPrincipleName];
                        }

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
        }
        

        public AuthData GetUserCookie()
        {
            HttpCookie httpCookie = HttpContext.Current.Request.Cookies.Get(FormsAuthentication.FormsCookieName);
            if(httpCookie!=null && httpCookie.Value!=null && httpCookie.Value!=string.Empty)
            {
                string userName = httpCookie.Value;
                if(Users.Keys.Contains(userName))
                {
                    return Users[userName];
                }
            }
            
            return null;
        }

        public void GetUserDataFromDic()
        {
            HttpCookie authCookie = HttpContext.Current.Request.Cookies.Get(FormsAuthentication.FormsCookieName);
            if (authCookie == null || authCookie.Value == null)
            {
                authCookie = null;
            }
        }

        private void SetUserDataCookie()
        {
            if (userData != null)
            {
                try
                {
                    var result = JsonConvert.SerializeObject(userData);
                    // FormsAuthenticationTicket authTicket = new FormsAuthenticationTicket(
                    // 1,
                    // userData.userPrincipleName,
                    // DateTime.Now,
                    // DateTime.Now.AddMinutes(30),
                    // false,
                    //result
                    // );
                    //string encryptedTicket = FormsAuthentication.Encrypt(authTicket);
                    //System.Web.HttpCookie authCookie = new System.Web.HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                    System.Web.HttpCookie authCookie = new System.Web.HttpCookie(FormsAuthentication.FormsCookieName, userData.userPrincipleName);
                    System.Web.HttpContext.Current.Response.Cookies.Add(authCookie);

                    if (users.Keys.Contains(UserData.userPrincipleName))
                    {
                        users[UserData.userPrincipleName] = UserData;
                    }
                    else
                    {
                        users.Add(UserData.userPrincipleName, UserData);
                    }

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
            //GetUserDataFromCustomerCookie();
            AuthData authData = GetUserCookie();
            if (authData != null)
            {
                return true;
            }
            return false;
        }


        public bool IsAuthorization()
        {
            //GetUserDataFromCustomerCookie();
            AuthData authData = GetUserCookie();
            if (authData != null && authData.authResult)
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
                        //SetUserDataCookie();
                    }
                    catch(Exception ex)
                    {
                        string message = ex.Message;
                    }
                }

            }
        }

        public void ClearCookieAndLogoff()
        {
            HttpContext.Current.Response.Cookies.Clear();
            System.Web.HttpCookie authCookie = new System.Web.HttpCookie(FormsAuthentication.FormsCookieName);
            authCookie.Expires= DateTime.Now.AddDays(-1d);
            System.Web.HttpContext.Current.Response.Cookies.Add(authCookie);
            AuthData authData = GetUserCookie();
            if (authData != null)
            {
                users.Remove(authData.userPrincipleName);
            }
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
