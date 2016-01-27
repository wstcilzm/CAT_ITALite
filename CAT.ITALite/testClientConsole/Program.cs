using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using CAT.ITALite.Common;

namespace testClientConsole
{
    class Program
    {
        static void Main(string[] args)
        {
            callRESTAPI();
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
    }
}
