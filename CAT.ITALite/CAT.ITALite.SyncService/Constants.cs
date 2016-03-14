using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CAT.ITALite.SyncService
{
    internal class Constants
    {
        //public const string TenantName = "jianwmfatest.partner.onmschina.cn";
        //public const string TenantId = "9f435dd8-c995-42e2-a86f-c3e393af6699";
        //public const string ClientId = "1a7249e7-fa56-4c47-83de-5048097bc510";
        //public const string ClientSecret = "MkNP0Qpq2fbDaEoLtUSn/3VfgK7+oQW+ToN20NfmuQY=";
        public static string TenantName = ConfigurationSettings.AppSettings["TenantName"];
        public static string TenantId = ConfigurationSettings.AppSettings["TenantId"];
        public static string ClientId = ConfigurationSettings.AppSettings["ClientId"];
        public static string ClientSecret = ConfigurationSettings.AppSettings["ClientSecret"];
        public static string ResourceUrl = "https://graph.chinacloudapi.cn";

        //public const string ClientIdForUserAuthn = "5a462762-2441-4609-b0fd-9fded313af50";
        public static string AuthString = "https://login.partner.microsoftonline.cn/" + TenantName;

    }
}




