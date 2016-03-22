using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage.Table;

namespace CAT.ITALite.Entity
{
    public class GroupEntity : TableEntity
    {
        public GroupEntity()
        { }

        public GroupEntity(string objectId, string groupName)
        {
            this.PartitionKey = objectId;
            this.RowKey = groupName;
        }

        public string Descrption { get; set; }
        public string MailNickName { get; set; }
        public bool SecurityEnabled { get; set; }
        public string OriginatedFrom { get; set; }
    }

    public class AdminRoleEntity : TableEntity
    {
        public AdminRoleEntity()
        { }

        public AdminRoleEntity(string objectId, string roleName)
        {
            this.PartitionKey = objectId;
            this.RowKey = roleName;
        }

        public string Description { get; set; }
        public bool IsSystem { get; set; }
        public bool RoleDisabled { get; set; }
        //public int MembersCount { get; set; }
    }

    public class RBACRoleEntity : TableEntity
    {
        public RBACRoleEntity() { }

        public RBACRoleEntity(string roleName, string backendName)
        {
            this.RowKey = roleName;
            this.PartitionKey = backendName;
        }

        public string RoleID { get; set; }
        public string TypeProperty { get; set; }
        public string Description { get; set; }
        public string AssignableScopes { get; set; }
        public string Permissions { get; set; }
        public string CreatedOn { get; set; }
        public string UpdatedOn { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public string Type { get; set; }

    }

    public class RMResourceGroupEntiry : TableEntity
    {
        public RMResourceGroupEntiry()
        { }

        public RMResourceGroupEntiry(string resourceGroupName, string location)
        {
            this.PartitionKey = resourceGroupName;
            this.RowKey = location;
        }

        public string resourceGroupID { set; get; }
        public string resourceGroupName { set; get; }
        public string tags { set; get; }
        public string properties { set; get; }
    }

    public class RmAccessGroupView: RMResourceGroupEntiry
    {
        public RmAccessGroupView() { }
        public RmAccessGroupView(RMResourceGroupEntiry view)
        {
            this.PartitionKey = view.PartitionKey;
            this.RowKey = view.RowKey;
            this.resourceGroupID = view.resourceGroupID;
            this.resourceGroupName = view.resourceGroupName;
            this.tags = view.tags;
            this.properties = view.properties;
        }
        public RmAccessGroupView(RMResourceGroupEntiry view,string roleName):this(view)
        {
            this.RoleName = roleName;
        }
        public string RoleName { get; set; }
        public string RoleID { get; set; }
    }

}
