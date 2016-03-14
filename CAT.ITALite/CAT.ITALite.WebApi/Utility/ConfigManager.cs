using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;

namespace CAT.ITALite.WebApi.Utility
{
    public class ConfigManager
    {
        public static string ReadstorageConnection()
        {
            return ConfigurationManager.AppSettings["storageConnection"];
        }

        public static string ReadAzureSubscriptionID()
        {
            return ConfigurationManager.AppSettings["azureSubscriptionID"];
        }

        public static string ReadTenantName()
        {
            return ConfigurationManager.AppSettings["TenantName"];
        }

        public static string ReadTenantId()
        {
            return ConfigurationManager.AppSettings["TenantId"];
        }

        public static string ReadClientId()
        {
            return ConfigurationManager.AppSettings["ClientId"];
        }

        public static string ReadClientSecret()
        {
            return ConfigurationManager.AppSettings["ClientSecret"];
        }

        public static string ReadAuthString()
        {
            return ConfigurationManager.AppSettings["AuthorizeUrl"]+ReadTenantName();
        }

        public static string ReadResourceUrl()
        {
            return ConfigurationManager.AppSettings["ResourceUrl"];
        }
    }
}
