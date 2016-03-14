using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.ActiveDirectory.GraphClient;
using Microsoft.IdentityModel.Clients.ActiveDirectory;

namespace CAT.ITALite.WebApi.Utility
{
    internal class AuthenticationHelper
    {
        /// <summary>
        /// Async task to acquire token for Application.
        /// </summary>
        /// <returns>Async Token for application.</returns>
        public static async Task<string> AcquireTokenAsyncForApplication()
        {
            return GetTokenForApplication();
        }

        /// <summary>
        /// Get Token for Application.
        /// </summary>
        /// <returns>Token for application.</returns>
        public static string GetTokenForApplication()
        {
            AuthenticationContext authenticationContext = new AuthenticationContext(ConfigManager.ReadAuthString(), false);
            // Config for OAuth client credentials 
            ClientCredential clientCred = new ClientCredential(ConfigManager.ReadClientId(), ConfigManager.ReadClientSecret());
            AuthenticationResult authenticationResult = authenticationContext.AcquireToken(ConfigManager.ReadResourceUrl(),
                clientCred);
            string token = authenticationResult.AccessToken;
            return token;
        }

        /// <summary>
        /// Get Active Directory Client for Application.
        /// </summary>
        /// <returns>ActiveDirectoryClient for Application.</returns>
        public static ActiveDirectoryClient GetActiveDirectoryClientAsApplication()
        {
            Uri servicePointUri = new Uri(ConfigManager.ReadResourceUrl());
            Uri serviceRoot = new Uri(servicePointUri, ConfigManager.ReadTenantId());
            ActiveDirectoryClient activeDirectoryClient = new ActiveDirectoryClient(serviceRoot,
                async () => await AcquireTokenAsyncForApplication());
            return activeDirectoryClient;
        }
    }
}
