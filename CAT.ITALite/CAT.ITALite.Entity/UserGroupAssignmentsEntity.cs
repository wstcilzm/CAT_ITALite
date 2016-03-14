using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage.Table;

namespace CAT.ITALite.Entity
{
    public class UserGroupAssignmentsEntity : TableEntity
    {
        public UserGroupAssignmentsEntity()
        {
        }

        public UserGroupAssignmentsEntity(string userObjectId, string groupObejectId)
        {
            this.PartitionKey = userObjectId;
            this.RowKey = groupObejectId;
        }

        public string UserPrincipleName { set; get; }
        public string GroupName { set; get; }
        public string UpdatedBy { set; get; }
    }

    public class UserAdminRoleAssignmentEntity : TableEntity
    {
        public UserAdminRoleAssignmentEntity()
        { }

        public UserAdminRoleAssignmentEntity(string userObjectId, string adminRoleObejectId)
        {
            this.PartitionKey = userObjectId;
            this.RowKey = adminRoleObejectId;
        }

        public string UserPrincipleName { set; get; }
        public string AdminRoleName { set; get; }
    }

    public class UserRBACRoleAssignmentEntity : TableEntity
    {
        public UserRBACRoleAssignmentEntity() { }

        public UserRBACRoleAssignmentEntity(string userObjectId, string rbacRoleBackendName)
        {
            this.PartitionKey = userObjectId;
            this.RowKey = rbacRoleBackendName;
        }

        public string RoleDefinitionId { set; get; }
        public string Scope { set; get; }
        public string CreatedOn { get; set; }
        public string UpdatedOn { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public string AssignmentID { get; set; }
        public string Type { set; get; }
        public string AssignmentName { set; get; }


    }

    /// <summary>
    /// Generate this table with index from UserRBACRoleAssignmentEntity
    /// </summary>
    public class RGRBACRoleAssignmentEntity : TableEntity
    {
        public RGRBACRoleAssignmentEntity() { }

        public RGRBACRoleAssignmentEntity(string resourceGroupId, string rbacRoleBackendName)
        {
            this.PartitionKey = resourceGroupId;
            this.RowKey = rbacRoleBackendName;
        }

        public string RoleDefinitionId { set; get; }
        public string UserObjectID { set; get; }
        public string Scope { set; get; }
        public string CreatedOn { get; set; }
        public string UpdatedOn { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public string AssignmentID { get; set; }
        public string Type { set; get; }
        public string AssignmentName { set; get; }


    }

    /// <summary>
    /// for ResourcePage Entity; 
    /// </summary>
    public class ResourcePageView:TableEntity
    {
        public ResourcePageView() { }

        public ResourcePageView(string id,string name)
        {
            this.PartitionKey = id;
            this.RowKey = name;
        }

        public string ResourceGroupName { get; set; }
        public string UserPrincipleName { get; set; }
        public string Location { get; set; }
        public string RoleName { get; set; }
        public string RoleID { get; set; }
        public string GroupID { get; set; }
        public string UserID { get; set; }
    }

}
