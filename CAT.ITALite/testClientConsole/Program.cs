using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using CAT.ITALite.Common;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System.Threading;
using System.Net;
using Newtonsoft.Json.Linq;

namespace testClientConsole
{
    class Program
    {
        static void Main(string[] args)
        {

            GetRMResources();
            //callChinaAzureREST();

            //callRESTAPI();
            Console.Read();
        }

        static void callRESTAPI()
        {
            using (var client = new HttpClient())
            {

                client.BaseAddress = new Uri("http://localhost:33042/");

                AuthData inputData = new AuthData();
                inputData.userObjectID = "57cb2212-3c34-4000-b1fa-e328af694351";
                inputData.userPrincipleName = "admin@jianwmfatest.partner.onmschina.cn";
                inputData.appObjectId = "1a7249e7-fa56-4c47-83de-5048097bc510";
                inputData.appName = "Console App for Azure AD";
                inputData.hashKey = DateTime.Now.Ticks.ToString();

                var requestJson = JsonConvert.SerializeObject(inputData);
                HttpContent httpContent = new StringContent(requestJson);
                httpContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");


                var result = client.PostAsync("api/auth/check", httpContent).Result.Content.ReadAsStringAsync().Result;
                Console.WriteLine(result);
                AuthData outputData = JsonConvert.DeserializeObject<AuthData>(result);
            }
        }

        static void callChinaAzureREST()
        {
            GetRMAssignments();
            //GetRMRoles();
            //CallAzureResourceManagerApi();
            //CallServiceManagementApi();
        }


        private static string GetAuthorizationHeader()
        {
            AuthenticationResult result = null;

            var context = new AuthenticationContext("https://login.chinacloudapi.cn/82a8b6cc-3dcc-4661-8efb-d4e3ff10d28e");

            var thread = new Thread(() =>
            {
                result = context.AcquireToken(
                  "https://management.core.chinacloudapi.cn/",
                  "6f173395-839b-4139-a41d-6a566cf847a9",
                  new Uri("http://localhost/11"));
            });



            thread.SetApartmentState(ApartmentState.STA);
            thread.Name = "AquireTokenThread";
            thread.Start();
            thread.Join();

            if (result == null)
            {
                throw new InvalidOperationException("Failed to obtain the JWT token");
            }

            string token = result.AccessToken;
            return token;
        }

        public static string GetAuthorizationHeader2()
        {
            //
            string _aadTenantDomain = "cciccat.partner.onmschina.cn";
            _aadTenantDomain = "cciccat.com";
            string _aadClientId = "9adbfe5e-2252-4d26-a3ad-68bbd1e25963"; 

            AuthenticationResult result = null;
            var context = new AuthenticationContext("https://login.chinacloudapi.cn/" + _aadTenantDomain);



            // If you wanted to show a credential dialog, do this: 
            //result = context.AcquireToken( 
            //    "https://management.core.windows.net/", 
            //    _aadClientId, 
            //      new Uri("http://localhost"), PromptBehavior.Auto);

            // Directly specify the username and password. 
            var credential = new UserCredential(
                "jianw@cciccat.com",
                "microsoft@123");
            result = context.AcquireToken(
                "https://management.core.chinacloudapi.cn/",
                _aadClientId,
                    credential);
            if (result == null)
            {
                throw new InvalidOperationException("Failed to obtain the JWT token");
            }

            string token = result.AccessToken;
            return token; 

        }

        private static async Task CallServiceManagementApi()
        {
            string _subscriptionId = "03042fd8-7b09-4c73-9217-0dcea66ede69";
            var client = new HttpClient();
            var header = GetAuthorizationHeader2();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", header);
            client.DefaultRequestHeaders.Add("x-ms-version", "2009-10-01");

            try
            {
                var result = await
                    client.GetStringAsync(
                        String.Format(
                            "https://management.core.chinacloudapi.cn/{0}/services/hostedservices",
                            _subscriptionId));
                Console.WriteLine(result);

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        public static async Task CallAzureResourceManagerApi()
        {
            string _subscriptionId = "03042fd8-7b09-4c73-9217-0dcea66ede69";
            var client = new HttpClient();
            var header = GetAuthorizationHeader2();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", header);

            try
            {
                var result = await
                client.GetStringAsync(
                    String.Format(
                        "https://management.chinacloudapi.cn/subscriptions/{0}/resourcegroups?api-version=2014-04-01-preview",
                        _subscriptionId));
                Console.WriteLine(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }


        public static async Task GetRMRoles()
        {
            string _subscriptionId = "03042fd8-7b09-4c73-9217-0dcea66ede69";
            var client = new HttpClient();
            var header = GetAuthorizationHeader2();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", header);

            try
            {
                var result = await
                client.GetStringAsync(
                    String.Format(
                        "https://management.chinacloudapi.cn/subscriptions/{0}/providers/Microsoft.Authorization/roleDefinitions?api-version=2015-07-01&filter=atScopeAndBelow()",
                        _subscriptionId));

                JObject jObj = JObject.Parse(result);
                JToken jTk = jObj.GetValue("value").First;       
                while(jTk!=null)
                {
                    Console.WriteLine("===" + jTk["properties"]["roleName"].ToString() + "===");
                    Console.WriteLine(jTk["properties"]["type"].ToString());
                    Console.WriteLine(jTk["properties"]["description"].ToString());
                    Console.WriteLine(jTk["properties"]["createdOn"].ToString());
                    Console.WriteLine(jTk["properties"]["updatedOn"].ToString());
                    Console.WriteLine(jTk["properties"]["createdBy"].ToString());
                    Console.WriteLine(jTk["properties"]["updatedBy"].ToString());
                    Console.WriteLine(jTk["id"].ToString());
                    Console.WriteLine(jTk["name"].ToString());
                    Console.WriteLine(jTk["type"].ToString());
                    Console.WriteLine(jTk["properties"]["permissions"].ToString());

                    jTk = jTk.Next;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }     
        }


        public static async Task GetRMAssignments()
        {
            string _subscriptionId = "03042fd8-7b09-4c73-9217-0dcea66ede69";
            var client = new HttpClient();
            var header = GetAuthorizationHeader2();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", header);

            try
            {
                var result = await
                client.GetStringAsync(
                    String.Format(
                        "https://management.chinacloudapi.cn/subscriptions/{0}/providers/Microsoft.Authorization/roleAssignments?api-version=2015-07-01&filter=atScope()",
                        _subscriptionId));

                JObject jObj = JObject.Parse(result);
                JToken jTk = jObj.GetValue("value").First;
                while (jTk != null)
                {
                    Console.WriteLine("===" + jTk["properties"]["roleDefinitionId"].ToString() + "===");
                    Console.WriteLine(jTk["properties"]["principalId"].ToString());
                    Console.WriteLine(jTk["properties"]["scope"].ToString());
                    Console.WriteLine(jTk["properties"]["createdOn"].ToString());
                    Console.WriteLine(jTk["properties"]["updatedOn"].ToString());
                    Console.WriteLine(jTk["properties"]["createdBy"].ToString());
                    Console.WriteLine(jTk["properties"]["updatedBy"].ToString());
                    Console.WriteLine(jTk["id"].ToString());
                    Console.WriteLine(jTk["type"].ToString());
                    Console.WriteLine(jTk["name"].ToString());

                    jTk = jTk.Next;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }   
        }

        public static async Task GetRMResources()
        {
            string _subscriptionId = "03042fd8-7b09-4c73-9217-0dcea66ede69";
            var client = new HttpClient();
            var header = GetAuthorizationHeader2();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", header);

            try
            {
                var result = await
                client.GetStringAsync(
                    String.Format(
                        "https://management.chinacloudapi.cn/subscriptions/{0}/resources?api-version=2015-01-01",
                        _subscriptionId));

                JObject jObj = JObject.Parse(result);
                JToken jTk = jObj.GetValue("value").First;


            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }   
        }


    }
}
