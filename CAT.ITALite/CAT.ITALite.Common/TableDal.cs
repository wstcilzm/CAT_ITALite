using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System.Collections.Generic;
using CAT.ITALite.Entity;
using System;

namespace CAT.ITALite.Common
{
    public class TableDal
    {
        private CloudTable _table = null;

        public TableDal(string storageConnectionString, string tableName)
        {
            var storageAccount = CloudStorageAccount.Parse(storageConnectionString);
            var tableClient = storageAccount.CreateCloudTableClient();
            _table = tableClient.GetTableReference(tableName);
            _table.CreateIfNotExists();
        }

        public void CleanTable()
        {
            _table.Delete();
        }

        #region AADInfo


        public bool InsertAADInfo(AADInfoEntity Aad)
        {
            var operation = TableOperation.InsertOrReplace(Aad);
            _table.Execute(operation);
            return true;
        }
        public IEnumerable<AADInfoEntity> RetrieveAADs()
        {
            var query = new TableQuery<AADInfoEntity>();
            var result = _table.ExecuteQuery(query);
            return result;
        }
        #endregion

        #region Group

        public bool InsertEntity(GroupEntity group)
        {
            var operation = TableOperation.InsertOrReplace(group);
            _table.Execute(operation);
            return true;
        }

        public IEnumerable<GroupEntity> RetrieveGroups()
        {
            var query = new TableQuery<GroupEntity>();
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public IEnumerable<GroupEntity> RetrieveGroups(IEnumerable<AppGroupAssignmentEntity> entities)
        {
            string filter = string.Empty;
            foreach (var group in entities)
            {
                filter += "PartitionKey eq " + group.RowKey + " or";
            }
            filter = filter.Remove(filter.LastIndexOf(" or"));
            //TableQuery<GroupEntity> query = new TableQuery<GroupEntity>().Where(filter);
            //foreach(var entity in entities)
            //{
            //   filter = entity.RowKey;
            // }
            var query = new TableQuery<GroupEntity>().Where(filter);
            var result = _table.ExecuteQuery(query);
            return result;
        }

        #endregion

        #region RMResourceGroup
        public bool InsertEntity(RMResourceGroupEntiry resourceGroup)
        {
            var operation = TableOperation.InsertOrReplace(resourceGroup);
            _table.Execute(operation);
            return true;
        }
        public IEnumerable<RMResourceGroupEntiry> RetrieveRMGroup(string groupName)
        {
            var query = new TableQuery<RMResourceGroupEntiry>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, groupName));
            var result = _table.ExecuteQuery(query);
            return result;
        }

        #endregion

        #region User

        public bool InsertEntity(UserEntity user)
        {
            var insertOperation = TableOperation.InsertOrReplace(user);
            _table.Execute(insertOperation);
            return true;
        }

        public IEnumerable<UserEntity> RetrieveUsers()
        {
            var query = new TableQuery<UserEntity>();
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public IEnumerable<UserEntity> RetrieveUserByUserId(string userId)
        {
            var query = new TableQuery<UserEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, userId));
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public IEnumerable<UserRBACRoleAssignmentEntity> RetrieveRolesByUserId(string userId)
        {
            var query = new TableQuery<UserRBACRoleAssignmentEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, userId));
            var result = _table.ExecuteQuery(query);
            return result;
        }
        #endregion

        #region App

        public bool InsertEntity(AppEntity app)
        {
            var operation = TableOperation.InsertOrReplace(app);
            _table.Execute(operation);
            return true;
        }

        public IEnumerable<AppEntity> RetrieveApplications()
        {
            var query = new TableQuery<AppEntity>();
            var result = _table.ExecuteQuery(query);
            return result;
        }

        #endregion

        #region RMResource
        public bool InsertEntity(RMResourceEntity rmResource)
        {
            var operation = TableOperation.InsertOrReplace(rmResource);
            _table.Execute(operation);
            return true;
        }

        public IEnumerable<RMResourceGroupEntiry> RetrieveRMGroups()
        {
            var query = new TableQuery<RMResourceGroupEntiry>();
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public IEnumerable<RMResourceEntity> RetrieveRMResourcesByGroupID(string groupID)
        {
            var query = new TableQuery<RMResourceEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, groupID));
            var result = _table.ExecuteQuery(query);
            return result;
        }

        #endregion


        #region AdminRole
        public bool InsertEntity(AdminRoleEntity adminRole)
        {
            var operation = TableOperation.InsertOrReplace(adminRole);
            _table.Execute(operation);
            return true;
        }

        public IEnumerable<AdminRoleEntity> RetrieveAdminRoles()
        {
            var query = new TableQuery<AdminRoleEntity>();
            var result = _table.ExecuteQuery(query);
            return result;
        }

        #endregion

        #region RBACRoles
        public bool InsertEntity(RBACRoleEntity rbacRole)
        {
            var operation = TableOperation.InsertOrReplace(rbacRole);
            _table.Execute(operation);
            return true;
        }

        public IEnumerable<RBACRoleEntity> RetrieveRbacRoles()
        {
            var query = new TableQuery<RBACRoleEntity>();
            var result = _table.ExecuteQuery(query);
            return result;
        }
        public IEnumerable<RBACRoleEntity> RetrieveRbacRoleByID(string roleID)
        {
            var query = new TableQuery<RBACRoleEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, roleID));
            var result = _table.ExecuteQuery(query);
            return result;
        }
        #endregion

        #region UserGroupAssignment

        public bool InsertEntity(UserGroupAssignmentsEntity assignment)
        {
            var operation = TableOperation.InsertOrReplace(assignment);
            _table.Execute(operation);
            return true;
        }

        public IEnumerable<UserGroupAssignmentsEntity> RetrieveUserGroupAssignments(string groupId)
        {
            var query = new TableQuery<UserGroupAssignmentsEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, groupId));
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public IEnumerable<UserGroupAssignmentsEntity> RetrieveGroupsByUserId(string userId)
        {
            var query = new TableQuery<UserGroupAssignmentsEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, userId));
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public IEnumerable<UserGroupAssignmentsEntity> RetrieveUsers(string groupId)
        {
            var query = new TableQuery<UserGroupAssignmentsEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, groupId));
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public bool RemoveUserAssignment(string userID, string groupID)
        {
            //var query = new TableQuery<UserGroupAssignmentsEntity>().Where(TableQuery.CombineFilters(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, userID), TableOperators.And, TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, groupID)));
            //var result = _table.ExecuteQuery(query);

            TableOperation retrieveOperation = TableOperation.Retrieve<UserGroupAssignmentsEntity>(userID, groupID);
            TableResult retrievedResult = _table.Execute(retrieveOperation);
            try
            {
                UserGroupAssignmentsEntity deleteEntity = (UserGroupAssignmentsEntity)retrievedResult.Result;
                TableOperation deleteOperation = TableOperation.Delete(deleteEntity);
                // Execute the operation.
                _table.Execute(deleteOperation);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }


        #endregion

        #region AppGroupAssignment

        public bool InsertEntity(AppGroupAssignmentEntity assignment)
        {
            var operation = TableOperation.InsertOrReplace(assignment);
            _table.Execute(operation);
            return true;
        }

        public IEnumerable<AppGroupAssignmentEntity> RetrieveAppGroupAssignments()
        {
            var query = new TableQuery<AppGroupAssignmentEntity>();
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public IEnumerable<AppGroupAssignmentEntity> RetrieveGroupsByAppId(string appId)
        {
            var query = new TableQuery<AppGroupAssignmentEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, appId));
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public IEnumerable<AppGroupAssignmentEntity> RetrieveApplications(string groupId)
        {
            var query = new TableQuery<AppGroupAssignmentEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, groupId));
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public IEnumerable<UserGroupAppEntity> RetrieveUserGroupApplications(string groups)
        {
            List<UserGroupAppEntity> list = new List<UserGroupAppEntity>();
            string[] PrincipleName_GroupID_arry = groups.Split(',');
            string PrincipleName = PrincipleName_GroupID_arry[PrincipleName_GroupID_arry.Length - 1];
            for (int i = 0; i < PrincipleName_GroupID_arry.Length - 1; i++)
            {
                string GroupID = PrincipleName_GroupID_arry[i];
                var query = new TableQuery<AppGroupAssignmentEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, GroupID));
                IEnumerable<AppGroupAssignmentEntity> result = _table.ExecuteQuery(query);
                foreach (AppGroupAssignmentEntity obj in result)
                {
                    UserGroupAppEntity entity = new UserGroupAppEntity(obj);
                    entity.UserPrincipleName = PrincipleName;
                    list.Add(entity);
                }
            }
            return list;
        }

        public bool RemoveAppAssignment(string appId, string groupId)
        {
            TableOperation retrieveOperation = TableOperation.Retrieve<AppGroupAssignmentEntity>(appId, groupId);
            TableResult retrievedResult = _table.Execute(retrieveOperation);
            try
            {
                UserGroupAssignmentsEntity deleteEntity = (UserGroupAssignmentsEntity)retrievedResult.Result;
                TableOperation deleteOperation = TableOperation.Delete(deleteEntity);
                // Execute the operation.
                _table.Execute(deleteOperation);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        #endregion

        #region UserAdminRoleAssignment

        public bool InsertEntity(UserAdminRoleAssignmentEntity assignment)
        {
            var operation = TableOperation.InsertOrReplace(assignment);
            _table.Execute(operation);
            return true;
        }

        public IEnumerable<UserAdminRoleAssignmentEntity> RetrieveUsersByRoleId(string roleId)
        {
            var query = new TableQuery<UserAdminRoleAssignmentEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, roleId));
            var result = _table.ExecuteQuery(query);
            return result;
        }
        #endregion

        #region RBACRoleAssignment
        public bool InsertEntity(UserRBACRoleAssignmentEntity assignment)
        {
            var operation = TableOperation.InsertOrReplace(assignment);
            _table.Execute(operation);
            return true;
        }

        public bool InsertEntity(RGRBACRoleAssignmentEntity assignment)
        {
            var operation = TableOperation.InsertOrReplace(assignment);
            _table.Execute(operation);
            return true;
        }

        public IEnumerable<UserRBACRoleAssignmentEntity> RetrieveUsersByRbacRoleId(string roleId)
        {
            var query = new TableQuery<UserRBACRoleAssignmentEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, roleId));
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public IEnumerable<RGRBACRoleAssignmentEntity> RetrieveRMGroupsByRbacRoleId(string roleId)
        {
            var query = new TableQuery<RGRBACRoleAssignmentEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, roleId));
            var result = _table.ExecuteQuery(query);
            return result;
        }

        public IEnumerable<RGRBACRoleAssignmentEntity> RetrieveRGRBACRoleAssignmentByGroupID(string resGroupID)
        {
            var query = new TableQuery<RGRBACRoleAssignmentEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, resGroupID));
            var result = _table.ExecuteQuery(query);
            return result;
        }
        #endregion
    }
}
