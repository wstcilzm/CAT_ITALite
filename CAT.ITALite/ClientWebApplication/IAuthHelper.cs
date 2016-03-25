using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using System.Web;
using CAT.ITALite.Common;

namespace ClientWebApplication
{
    public interface IAuthHelper
    {
        bool HasAccessToken(Object sender);
        void Authentication(string accesskey);
        bool IsAuthentication();
        bool IsAuthorization();
        void Authorization(string appId, string appName, string hashKey);
        void ClearCookieAndLogoff();
        //IDictionary<string,string> Users { get; }
    }
}
