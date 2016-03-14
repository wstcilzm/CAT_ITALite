using CAT.ITALite.Common;
using CAT.ITALite.Entity;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Web.Mvc;

namespace CAT.ITALite.WebApi.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            string relyingApp = "~/";
            if (null != Session["RelyingApp"])
            {
                relyingApp = Session["RelyingApp"].ToString().Trim() + "?BK=" + Guid.NewGuid().ToString();
                //Session["RelyingApp"] = null;
                Response.Redirect(relyingApp);
            }

            //for temp before next coding work.
            //Response.Redirect("http://localhost:33162/?BK=" + Guid.NewGuid().ToString());

            return View();
        }

        public string TestITA()
        {
            TableDal userGroupAssignmentOperation = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.UserGroupAssignments);
            TableDal appGroupAssignmentOperation = new TableDal(ConfigurationSettings.AppSettings["storageConnection"], TableNames.AppGroupAssignments);

            var userGroupAssignment = new UserGroupAssignmentsEntity("8734cc8a-2e67-4a9f-b1aa-3306a5e62760", "f8541113-c54b-4eab-af59-77b0eeef3617");
            userGroupAssignment.UserPrincipleName = "testuu@jianwmfatest.partner.onmschina.cn";
            userGroupAssignment.GroupName = "MyGroup";
            userGroupAssignment.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            //userGroupAssignmentOperation.InsertEntity(userGroupAssignment);

            var appGroupAssignment = new AppGroupAssignmentEntity("1a7249e7-fa56-4c47-83de-5048097bc510", "f8541113-c54b-4eab-af59-77b0eeef3617");
            appGroupAssignment.AppName = "Console App for Azure AD";
            appGroupAssignment.GroupName = "MyGroup";
            appGroupAssignment.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            appGroupAssignment.OperationTypes = OperationTypes.Read.ToString();
            //appGroupAssignmentOperation.InsertEntity(appGroupAssignment);

            InvokingITA testITACore = new InvokingITA();
            // true
            bool res = testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment }, new List<AppGroupAssignmentEntity>() { appGroupAssignment }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760", "1a7249e7-fa56-4c47-83de-5048097bc510");
            // false
            res = testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment }, new List<AppGroupAssignmentEntity>() { appGroupAssignment }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760_", "1a7249e7-fa56-4c47-83de-5048097bc510");
            // false
            res = testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment }, new List<AppGroupAssignmentEntity>() { appGroupAssignment }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760", "1a7249e7-fa56-4c47-83de-5048097bc510_");


            var userGroupAssignment2 = new UserGroupAssignmentsEntity("8734cc8a-2e67-4a9f-b1aa-3306a5e62760_", "f8541113-c54b-4eab-af59-77b0eeef3617");
            userGroupAssignment2.UserPrincipleName = "testuu@jianwmfatest.partner.onmschina.cn";
            userGroupAssignment2.GroupName = "MyGroup";
            userGroupAssignment2.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            //userGroupAssignmentOperation.InsertEntity(userGroupAssignment2);

            // true
            Console.WriteLine(testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment, userGroupAssignment2 }, new List<AppGroupAssignmentEntity>() { appGroupAssignment }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760_", "1a7249e7-fa56-4c47-83de-5048097bc510"));

            var appGroupAssignment2 = new AppGroupAssignmentEntity("1a7249e7-fa56-4c47-83de-5048097bc510_", "f8541113-c54b-4eab-af59-77b0eeef3617_");
            appGroupAssignment2.AppName = "Console App for Azure AD_";
            appGroupAssignment2.GroupName = "MyGroup";
            appGroupAssignment2.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            appGroupAssignment2.OperationTypes = OperationTypes.Read.ToString();
            //appGroupAssignmentOperation.InsertEntity(appGroupAssignment2);

            var userGroupAssignment31 = new UserGroupAssignmentsEntity("8734cc8a-2e67-4a9f-b1aa-3306a5e62760", "f8541113-c54b-4eab-af59-77b0eeef3617_");
            userGroupAssignment2.UserPrincipleName = "testuu@jianwmfatest.partner.onmschina.cn";
            userGroupAssignment2.GroupName = "MyGroup";
            userGroupAssignment2.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            //userGroupAssignmentOperation.InsertEntity(userGroupAssignment2);

            var userGroupAssignment32 = new UserGroupAssignmentsEntity("8734cc8a-2e67-4a9f-b1aa-3306a5e62760_", "f8541113-c54b-4eab-af59-77b0eeef3617_");
            userGroupAssignment2.UserPrincipleName = "testuu@jianwmfatest.partner.onmschina.cn";
            userGroupAssignment2.GroupName = "MyGroup";
            userGroupAssignment2.UpdatedBy = "admin@jianwmfatest.partner.onmschina.cn";
            //userGroupAssignmentOperation.InsertEntity(userGroupAssignment2);

            // true
            res = testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment, userGroupAssignment2, userGroupAssignment31 }, new List<AppGroupAssignmentEntity>() { appGroupAssignment, appGroupAssignment2 }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760", "1a7249e7-fa56-4c47-83de-5048097bc510_");

            // true
            res = testITACore.AccessControl(new List<UserGroupAssignmentsEntity>() { userGroupAssignment, userGroupAssignment2, userGroupAssignment32 }, new List<AppGroupAssignmentEntity>() { appGroupAssignment, appGroupAssignment2 }, "8734cc8a-2e67-4a9f-b1aa-3306a5e62760_", "1a7249e7-fa56-4c47-83de-5048097bc510_");

            return "Hello, ITALite Auth Center!";
        }

    }
}
