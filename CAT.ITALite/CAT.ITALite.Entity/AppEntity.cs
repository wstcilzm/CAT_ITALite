using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage.Table;

namespace CAT.ITALite.Entity
{
    public class AppEntity : TableEntity
    {
        public AppEntity()
        {
        }

        public AppEntity(string objectId, string appName)
        {
            this.PartitionKey = objectId;
            this.RowKey = appName;
        }

        public string AppType { get; set; }
        public string HomePage { get; set; }
        public int IdentifierUris { get; set; }
        public int AppRoles { get; set; }
    }

}
