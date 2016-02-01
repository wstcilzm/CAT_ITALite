using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CAT.ITALite.Entity
{
    public class UserGroupAppEntity : AppGroupAssignmentEntity
    {
        //{
        //    public UserGroupAppEntity(string appId, string groupObejectId)
        //    {
        //        this.PartitionKey = appId;
        //        this.RowKey = groupObejectId;
        //    }
        //    public UserGroupAppEntity()
        //    { }

        //    public string AppName { set; get; }
        //    public string GroupName { set; get; }
        //    public string OperationTypes { set; get; }
        //    public string UpdatedBy { set; get; }
        public UserGroupAppEntity(AppGroupAssignmentEntity entity)
        {
            this.PartitionKey = entity.PartitionKey;
            this.RowKey = entity.RowKey;
            this.AppName = entity.AppName;
            this.GroupName = entity.GroupName;
            this.OperationTypes = entity.OperationTypes;
            this.UpdatedBy = entity.UpdatedBy;
        }
        public string UserPrincipleName { set; get; }
    }
}
