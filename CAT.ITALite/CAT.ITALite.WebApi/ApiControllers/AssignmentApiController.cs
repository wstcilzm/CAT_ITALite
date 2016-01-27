﻿using System.Configuration;
using System.Threading.Tasks;
using System.Web.Http;
using CAT.ITALite.Common;
using CAT.ITALite.Entity;

namespace CAT.ITALite.WebApi.ApiControllers
{
    [RoutePrefix("api/assignment")]
    public class AssignmentApiController : ApiControllerBase
    {
        [HttpGet]
        [Route("usergroup")]
        public async Task<IHttpActionResult> GetUserGroupAssignments()
        {
            //var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserGroupAssignments);
            //var result = operation.RetrieveUserGroupAssignments();
            return CreateSuccessResult(123);
           

        }

        [HttpGet]
        [Route("appgroup")]
        public async Task<IHttpActionResult> GetAppGroupAssignments()
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AppGroupAssignments);
            var result = operation.RetrieveAppGroupAssignments();
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("addapptogroup")]
        public async Task<IHttpActionResult> AssignAppToGroupAsync(string appId, string groupId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AppGroupAssignments);
            var agse = new AppGroupAssignmentEntity(appId.ToString(), groupId.ToString());
            var result = operation.InsertEntity(agse);
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("addusertogroup")]
        public async Task<IHttpActionResult> AssignUserToGroupAsync(string userId, string groupId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserGroupAssignments);
            var ugae = new UserGroupAssignmentsEntity(userId, groupId);
            var result = operation.InsertEntity(ugae);
            var resultUser = operation.RetrieveUserByUserId(userId);
            return CreateSuccessResult(resultUser);
        }

        [HttpGet]
        [Route("removeappfromgroup")]
        public async Task<IHttpActionResult> RemoveAppFromGroupAsync(string appId, string groupId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.AppGroupAssignments);
            //var ags = new AppGroupAssignmentEntity(appId.ToString(), groupId.ToString());
            var result = operation.RetrieveGroupsByAppId(appId.ToString());
            return CreateSuccessResult(result);
        }

        [HttpGet]
        [Route("removeuserfromgroup")]
        public async Task<IHttpActionResult> RemoveUserFromGroupAsync(string userId, string groupId)
        {
            var operation = new TableDal(ConfigurationManager.AppSettings["storageConnection"], TableNames.UserGroupAssignments);
            var result = operation.RemoveUserAssignment(userId, groupId);
            return CreateSuccessResult(result);
        }
    }
}
