using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.ActiveDirectory.GraphClient;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System.Configuration;

namespace CAT.ITALite.SyncService
{
    internal class AuthenticationHelper
    {
        public static string GetAuthorizationHeader()
        {
            //
            string _aadTenantDomain = "cciccat.partner.onmschina.cn";
            _aadTenantDomain = ConfigurationSettings.AppSettings["_aadTenantDomain"];
            //_aadTenantDomain = "cciccat.com";
            string _aadClientId = "9adbfe5e-2252-4d26-a3ad-68bbd1e25963";
            _aadClientId = ConfigurationSettings.AppSettings["_aadClientId"];

            AuthenticationResult result = null;
            var context = new AuthenticationContext("https://login.chinacloudapi.cn/" + _aadTenantDomain);

            // Directly specify the username and password. 
            var credential = new UserCredential(
                ConfigurationSettings.AppSettings["CoAdminUser"],
                ConfigurationSettings.AppSettings["CoAdminPassword"]);
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

        public static string TokenForUser;

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
            AuthenticationContext authenticationContext = new AuthenticationContext(Constants.AuthString, false);
            // Config for OAuth client credentials 
            ClientCredential clientCred = new ClientCredential(Constants.ClientId, Constants.ClientSecret);
            AuthenticationResult authenticationResult = authenticationContext.AcquireToken(Constants.ResourceUrl,
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
            Uri servicePointUri = new Uri(Constants.ResourceUrl);
            Uri serviceRoot = new Uri(servicePointUri, Constants.TenantId);
            ActiveDirectoryClient activeDirectoryClient = new ActiveDirectoryClient(serviceRoot,
                async () => await AcquireTokenAsyncForApplication());
            return activeDirectoryClient;
        }

        /// <summary>
        /// Async task to acquire token for User.
        /// </summary>
        /// <returns>Token for user.</returns>
        //public static async Task<string> AcquireTokenAsyncForUser()
        //{
        //    return GetTokenForUser();
        //}

        /// <summary>
        /// Get Token for User.
        /// </summary>
        /// <returns>Token for user.</returns>
        //public static string GetTokenForUser()
        //{
        //    if (TokenForUser == null)
        //    {
        //        var redirectUri = new Uri("https://localhost");
        //        AuthenticationContext authenticationContext = new AuthenticationContext(Constants.AuthString, false);
        //        AuthenticationResult userAuthnResult = authenticationContext.AcquireToken(Constants.ResourceUrl,
        //            Constants.ClientIdForUserAuthn, redirectUri, PromptBehavior.Always);
        //        TokenForUser = userAuthnResult.AccessToken;
        //        Console.WriteLine("\n Welcome " + userAuthnResult.UserInfo.GivenName + " " +
        //                          userAuthnResult.UserInfo.FamilyName);
        //    }
        //    return TokenForUser;
        //}

        /// <summary>
        /// Get Active Directory Client for User.
        /// </summary>
        /// <returns>ActiveDirectoryClient for User.</returns>
        //public static ActiveDirectoryClient GetActiveDirectoryClientAsUser()
        //{
        //    Uri servicePointUri = new Uri(Constants.ResourceUrl);
        //    Uri serviceRoot = new Uri(servicePointUri, Constants.TenantId);
        //    ActiveDirectoryClient activeDirectoryClient = new ActiveDirectoryClient(serviceRoot,
        //        async () => await AcquireTokenAsyncForUser());
        //    return activeDirectoryClient;
        //}
    }
}
