using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage.Table;

namespace CAT.ITALite.Entity
{
    public class AADInfoEntity : TableEntity
    {
        public AADInfoEntity()
        {
        }

        public AADInfoEntity(string objectId, string initialDomainName)
        {
            this.PartitionKey = objectId;
            this.RowKey = initialDomainName;
        }

        public string ObjectType { get; set; }
        public string DisplayName { get; set; }
        public string IntialDomainName { get; set; }
        public string DefaultDomainName { get; set; }
        public string TechContacts { get; set; }
        public string MarketingNotificationContacts { get; set; }
        public string PreferredLanguage { get; set; }
        public string CountryLetter { get; set; }
        public string Country { get; set; }
        public string State { get; set; }
        public string City { get; set; }
        public string Street { get; set; }

    }
}
