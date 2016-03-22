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
    public class MVCAuthHelper:IAuthHelper
    {

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

        public void ChangeToken(string accesskey)
        {
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri(System.Configuration.ConfigurationManager.AppSettings["AuthenServer"]);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                var result = client.GetAsync("api/auth/connect/?AuthenKey=" + accesskey).Result.Content.ReadAsStringAsync().Result;
                try
                {
                    AuthData signedUser = JsonConvert.DeserializeObject<AuthData>(result);

                    //LoginModel loginModel = new LoginModel();
                    //loginModel.LoginName = signedUser.userPrincipleName;
                    //loginModel.BuddyLink = "Sign Out";
                    //loginModel.SignoutServer = ConfigurationManager.AppSettings["SignoutServer"];
                    //string userData = JsonConvert.SerializeObject(loginModel);
                    FormsAuthenticationTicket authTicket = new FormsAuthenticationTicket(
                        1,
                        signedUser.userPrincipleName,
                        DateTime.Now,
                        DateTime.Now.AddMinutes(30),
                        false,
                        result
                        );
                    string encryptedTicket = FormsAuthentication.Encrypt(authTicket);
                    System.Web.HttpCookie authCookie = new System.Web.HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                    System.Web.HttpContext.Current.Response.Cookies.Add(authCookie);

                }
                catch(Exception ex)
                {
                    ; 
                }

            }
        }
        
        public bool IsAuthorization()
        {
            if(HttpContext.Current.Response.Cookies[FormsAuthentication.FormsCookieName]!=null)
            {
                AuthData AuthUser = new AuthData();
                HttpCookie authCookie = HttpContext.Current.Response.Cookies[FormsAuthentication.FormsCookieName];
                FormsAuthenticationTicket authTicket = FormsAuthentication.Decrypt(authCookie.Value);
                AuthData serializeModel = JsonConvert.DeserializeObject<AuthData>(authTicket.UserData);
                if(serializeModel.authResult)
                {
                    return true;
                }
            }
            return false;
        }

        public void Authorization()
        {
            using (var client = new HttpClient())
            {

                client.BaseAddress = new Uri(ConfigurationManager.AppSettings["AuthenServer"]);

                if (HttpContext.Current.Response.Cookies[FormsAuthentication.FormsCookieName] != null)
                {
                    AuthData authUser = new AuthData();
                    HttpCookie authCookie = HttpContext.Current.Response.Cookies[FormsAuthentication.FormsCookieName];
                    FormsAuthenticationTicket authTicket = FormsAuthentication.Decrypt(authCookie.Value);
                    AuthData serializeModel = JsonConvert.DeserializeObject<AuthData>(authTicket.UserData);
                    authUser.appObjectId= "05dbf7ce-ea6b-4784-89c6-d11c67a2c7f1";
                    authUser.appName= "CATITA ClientWepApp";
                    authUser.hashKey= DateTime.Now.Ticks.ToString();
                    var requestJson = JsonConvert.SerializeObject(authUser);
                    HttpContent httpContent = new StringContent(requestJson);
                    httpContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                    var result = client.PostAsync("api/auth/check", httpContent).Result.Content.ReadAsStringAsync().Result;
                    AuthData signedUser = JsonConvert.DeserializeObject<AuthData>(result);

               
                    FormsAuthenticationTicket authTicket1 = new FormsAuthenticationTicket(
                        1,
                        signedUser.userPrincipleName,
                        DateTime.Now,
                        DateTime.Now.AddMinutes(30),
                        false,
                        result
                        );
                    string encryptedTicket = FormsAuthentication.Encrypt(authTicket);
                    HttpContext.Current.Response.Cookies.Clear();
                    System.Web.HttpCookie authCookie1 = new System.Web.HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                    System.Web.HttpContext.Current.Response.Cookies.Add(authCookie1);
                }

              

               
            }
        }
    }

    public class LoginModel
    {
        public string LoginName { get; set; }
        public string BuddyLink { get; set; }
        public string SignoutServer { get; set; }
    }
}
