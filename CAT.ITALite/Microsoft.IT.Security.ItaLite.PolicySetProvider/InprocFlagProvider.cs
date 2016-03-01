using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Reflection;
using Microsoft.IT.Security.Core;
using Microsoft.IT.Security.Core.DataEntities;
using Microsoft.IT.Security.Enforcement.DataEntities;
using Microsoft.IT.Security.Enforcement.DataProviders;
using Microsoft.IdentityModel.Authorization;
using System.Security.Claims;
using Microsoft.IdentityModel.Authorization.Aad;

namespace Microsoft.IT.Security.ItaLite.PolicySetProvider
{
    public class AadProvider
    {
        public static bool CheckAccess(List<RoleDefinition> roleDefinitions, List<RoleAssignment> roleAssigments, string user, string resource, string action)
        {
            List<Claim> claims = new List<Claim>(1);
            claims.Add(new Claim("oid", user));
            ClaimsPrincipal claimsPrincipal = new ClaimsPrincipal(new ClaimsIdentity(claims));

            ResourceInfo resourceInfo = new ResourceInfo("/" + resource);
            ActionInfo actionInfo = new ActionInfo("/"+ resource + "/" + action);            
            
            DefaultPolicyProvider policyProvider = new DefaultPolicyProvider(roleDefinitions, roleAssigments);

            AadAuthorizationEngine engine = new AadAuthorizationEngine(policyProvider);

            return engine.CheckAccess(claimsPrincipal, resourceInfo, actionInfo);
        }
    }

    /// <summary>
    /// Policy provider for ITA lite to supply the const policy PDP needs without reading from DB
    /// </summary>
    public class InprocFlagProvider : EnforcementProvider
    {
        const string MethodNameConstructPolicySet = "ConstructCompositePolicySet";
        const string NameProtectionDomain = "EP Admin";
        const string Resource = "EPResource";
        const string Operation = "Action";
        const string ResourceRoleSumAttribute = "EPResourceRoleSum";
        const string SubjectRoleSumAttribute = "EPSubjectRoleSum";

        private MethodInfo miConstructPolicySet;
        private DataSet dsPolicySet;

        public override void Initialize(string providerName,
            System.Collections.Specialized.NameValueCollection config)
        {
            dsPolicySet = ExtractDataSet(ResourcePolicySet.policysetdataset_epita);
            miConstructPolicySet = ReflectStaticMethod(typeof(SqlProvider), MethodNameConstructPolicySet);
        }

        public override PolicySet FindPolicySet(string namedProtectionDomain,
            string policysetName,
            string policysetVersion,
            ICollection<SearchTarget> searchTargets,
            CustomContext context)
        {
            // it's expected to return new instance instead of one single shared one of PolicySet object
            // since the execution engine modifies it later
            // PolicySet class doesn't support perfect clone or XML serialization/de-serialization
            // so have to construct it from DataSet repeatitively
            return (PolicySet)miConstructPolicySet.Invoke(null, new object[] { dsPolicySet, context });
        }

        public override SearchResult<TargetAttributeEntity> SearchTargetAttributes(string name,
            string version,
            string namedProtectionDomain,
            string targetObjectType,
            CustomContext context)
        {
            throw new NotSupportedException();
        }

        public static List<Request> GetRequests(bool hasAccess)
        {
            // reuse existing code that works with the policy set used here

            var result = new Request
            {
                ApplicationType = ApplicationType.WebApplication,
                NameProtectionDomain = NameProtectionDomain,
                PolicySetName = ""
            };

            result.SearchTargets.Add(new SearchTarget()
            {
                AttributeId = "ActionName",
                AttributeValue = Operation,
                TargetType = AttributeType.Action
            });
            result.SearchTargets.Add(
                        new SearchTarget()
                        {
                            AttributeId = "ResourceName",
                            AttributeValue = Resource,
                            TargetType = AttributeType.Resource
                        });

            result.RequestAttributes.Add(new RequestAttributeEntity
            {
                AttributeId = "ActionName",
                AttributeValues = new List<string> { Operation },
                Category = "",
                DataType = AttributeDataType.String,
                Issuer = "",
                TargetType = AttributeType.Action
            });
            result.RequestAttributes.Add(new RequestAttributeEntity
            {
                AttributeId = "ResourceName",
                AttributeValues = new List<string> { Resource },
                Category = "",
                DataType = AttributeDataType.String,
                Issuer = "",
                TargetType = AttributeType.Resource
            });
            result.RequestAttributes.Add(new RequestAttributeEntity
            {
                AttributeId = ResourceRoleSumAttribute,
                AttributeValues = new List<string> { hasAccess ? "1" : "0" },
                Category = "",
                DataType = AttributeDataType.Integer,
                Issuer = "",
                TargetType = AttributeType.Resource
            });
            result.RequestAttributes.Add(new RequestAttributeEntity
            {
                AttributeId = SubjectRoleSumAttribute,
                AttributeValues = new List<string> { hasAccess ? "1" : "0" },
                Category = "",
                DataType = AttributeDataType.Integer,
                Issuer = "",
                TargetType = AttributeType.Subject
            });

            return new List<Request> { result };
        }

        static DataSet ExtractDataSet(string xml)
        {
            using (var tr = new StringReader(xml))
            {
                var ds = new DataSet();
                ds.ReadXml(tr, XmlReadMode.ReadSchema);
                return ds;
            }
        }

        static MethodInfo ReflectStaticMethod(Type type, string method)
        {
            try
            {
                var mi = type.GetMethod(method, BindingFlags.NonPublic | BindingFlags.InvokeMethod | BindingFlags.Static);
                if (mi == null)
                {
                    throw new ApplicationException(string.Format("Fail to reflect method {0} of type {1}", type.Name, method));
                }
                return mi;
            }
            catch (AmbiguousMatchException e)
            {
                throw new ApplicationException(string.Format("Mulitple method {0} of type {1}", type.Name, method), e);
            }
        }
    }
}
