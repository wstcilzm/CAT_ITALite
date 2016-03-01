using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.IT.Security.Core;
using Microsoft.IT.Security.Enforcement.DataEntities;
using Microsoft.IT.Security.Enforcement.Server.PolicyDecisionPoint;
using Microsoft.IT.Security.ItaLite.PolicySetProvider;
using CAT.ITALite.Entity;
using Microsoft.IdentityModel.Authorization;
using System.Security.Claims;

namespace CAT.ITALite.Common
{
    public class InvokingITA
    {
        public bool AccessControl(bool hasAccess)
        {
            return AuthorizeByItaLite(hasAccess);
        }

        public bool AccessControl(List<UserGroupAssignmentsEntity> userGroupAssignments, List<AppGroupAssignmentEntity> appGroupAssignments, string user, string application)
        {
            return AuthorizeByItaLite(userGroupAssignments, appGroupAssignments, user, application);
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

        static List<RoleAssignment> GetRoleAssigments(List<UserGroupAssignmentsEntity> userGroupAssignments)
        {
            List<RoleAssignment> roleAssignments = new List<RoleAssignment>();

            foreach (UserGroupAssignmentsEntity assignment in userGroupAssignments)
            {
                RoleAssignment roleAssignment = new RoleAssignment();
                roleAssignment.Id = Guid.NewGuid().ToString();
                roleAssignment.PrincipalId = assignment.PartitionKey; // userObjectId;
                roleAssignment.Scope = "/";
                roleAssignment.RoleDefinitionId = assignment.RowKey; // groupObejectId -> role id
                roleAssignment.PrincipalType = "User";

                roleAssignments.Add(roleAssignment);
            }

            return roleAssignments;
        }

        static List<RoleDefinition> GetRoleDefinitions(List<AppGroupAssignmentEntity> appGroupAssignments, string action)
        {
            List<RoleDefinition> roleDefinitions = new List<RoleDefinition>();

            foreach (AppGroupAssignmentEntity assignment in appGroupAssignments)
            {                
                RoleDefinition roleDefinition = new RoleDefinition();
                roleDefinition.Id = assignment.RowKey; // groupObejectId -> role id
                roleDefinition.Name = assignment.GroupName;
                roleDefinition.Scopes = new List<string>();
                roleDefinition.Scopes.Add("/");
                Permission permission = new Permission();
                permission.Actions = new List<string>();
                permission.Actions.Add("/" + assignment.PartitionKey + "/" + action); // "/appId/action"
                roleDefinition.Permissions.Add(permission);

                roleDefinitions.Add(roleDefinition);
            }

            return roleDefinitions;
        }

        private static bool AuthorizeByItaLite(List<UserGroupAssignmentsEntity> userGroupAssignments, List<AppGroupAssignmentEntity> appGroupAssignments, string user, string application)
        {
            string action = "default";
            List<RoleAssignment> roleAssignments = GetRoleAssigments(userGroupAssignments);
            List<RoleDefinition> roleDefinitions = GetRoleDefinitions(appGroupAssignments, action);

            return AadProvider.CheckAccess(roleDefinitions, roleAssignments, user, application, action);
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
