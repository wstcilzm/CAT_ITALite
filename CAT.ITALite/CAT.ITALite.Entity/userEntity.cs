using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage.Table;

namespace CAT.ITALite.Entity
{
    public class UserEntity : TableEntity
    {
        public UserEntity()
        { }

        public UserEntity(string objectId, string upn)
        {
            this.PartitionKey = objectId;
            this.RowKey = upn;
        }

        public string DisplayName { get; set; }
        public string MailNickname { get; set; }
        public string UserType { get; set; }
        public string UsageLocation { get; set; }
        public bool AccountEnabled { get; set; }

    }
}
