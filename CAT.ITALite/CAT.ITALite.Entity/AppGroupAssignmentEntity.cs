using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage.Table;

namespace CAT.ITALite.Entity
{
    public class AppGroupAssignmentEntity : TableEntity
    {
        public AppGroupAssignmentEntity(string appId, string groupObejectId)
        {
            this.PartitionKey = appId;
            this.RowKey = groupObejectId;
        }

        public AppGroupAssignmentEntity()
        { }

        public string AppName { set; get; }
        public string GroupName { set; get; }
        public string OperationTypes { set; get; }
        public string UpdatedBy { set; get; }
    }
}
