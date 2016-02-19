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
}
