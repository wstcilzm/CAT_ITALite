using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.IT.Security.Core;
using Microsoft.IT.Security.Enforcement.DataEntities;
using Microsoft.IT.Security.Enforcement.Server.PolicyDecisionPoint;
using Microsoft.IT.Security.ItaLite.PolicySetProvider;

namespace CAT.ITALite.Common
{
    public class InvokingITA
    {
        public bool AccessControl(bool hasAccess)
        {
            return AuthorizeByItaLite(hasAccess);
        }

        public string AccessControlPerfTest()
        {
            bool hasAccess = true;
            const int warmuptimes = 50;
            for (int i = 0; i < warmuptimes; ++i)
            {
                AuthorizeByItaLite(hasAccess);
            }
            const int testtimes = 500;
            var start = DateTime.Now;
            for (int i = 0; i < testtimes; ++i)
            {
                AuthorizeByItaLite(hasAccess);
            }
            var end = DateTime.Now;
            var milliseconds = end.Subtract(start).TotalMilliseconds;
            return string.Format("Duration {0} ms", milliseconds / testtimes);
        }

        /// <summary>
        /// Wrapper interface of ITA lite
        /// </summary>
        /// <param name="hasAccess"></param>
        /// <returns></returns>
        private static bool AuthorizeByItaLite(bool hasAccess)
        {
            var provider = PolicyDecisionPointProvider.RetrievePolicyDecisionPointProviderInstance();
            var responses = provider.AssertAccessControl(InprocFlagProvider.GetRequests(hasAccess), GetDefaultContext());

            const string msgItaLiteSysFailure = "ITA lite system failure";

            if (responses == null
                || responses[0] == null
                || responses[0].StatusMessage[0] == null)
            {
                throw new ApplicationException(msgItaLiteSysFailure);
            }

            switch (responses[0].StatusMessage[0].AuthorizationStatus)
            {
                case "Permit":
                    return true;

                case "NotApplicable":
                case "Deny":
                    return false;

                default:
                    throw new ApplicationException(msgItaLiteSysFailure);
            }
        }

        private static CustomContext GetDefaultContext()
        {
            return new CustomContext
            {
                CorrelationId = CustomMessageHeaders.CheckCorrelationId(null),
                ScenarioName = EnforcementDataEntityConstants.AccessControlScenario
            };
        }
    }
}
