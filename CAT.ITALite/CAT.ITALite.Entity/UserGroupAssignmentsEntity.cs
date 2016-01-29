﻿using System;
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
}