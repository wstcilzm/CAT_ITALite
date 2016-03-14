using System.Web.Mvc;
using Newtonsoft.Json;

namespace CAT.ITALite.Web.Controllers
{
    [ITALiteAuthorize]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";
            //comments
            return View();
        }

        public ActionResult Application(string apps)
        {
            ViewBag.apps = apps;
            return View();
        }

        public ActionResult Group()
        {
            return View();
        }

        public ActionResult QuickCreateAADGroup()
        {
            return View();
        }

        public ActionResult GroupDetail(string id)
        {
            ViewBag.groupID = id;
            return View();
        }

        public ActionResult User(string users="")
        {
            ViewBag.Users = users;
            return View();
        }

        public ActionResult AddUser()
        {
            return View();
        }

        public ActionResult QuickCreateAADUser()
        {
            return View();
        }

        public ActionResult AddGroup()
        {
            return View();
        }

        public ActionResult AddApp()
        {
            return View();
        }

        public ActionResult QuickCreateAADApp()
        {
            return View();
        }

        public ActionResult Role()
        {
            return View();
        }

        public ActionResult AddRBACRole()
        {
            return View();
        }

        public ActionResult QuickCreateRBACRole()
        {
            return View();
        }

        public ActionResult AddAdminRole()
        {
            return View();
        }

        public ActionResult QuickCreateAdminRole()
        {
            return View();
        }
        public ActionResult AssignUserToGroup(string users)
        {
            ViewBag.users = users;
            return View();
        }

        public ActionResult AssignAppToGroup(string apps)
        {
            ViewBag.apps = apps;
            return View();
        }

        public ActionResult AppsGroups(string appId)
        {
            ViewBag.appId = appId;
            return View();
        }

        public ActionResult UserDetail(string id)
        {
            ViewBag.userID = id;
            return View();
        }

        public ActionResult RolesUsers(string roleId)
        {
            ViewBag.roleId = roleId;
            return View();
        }

        public ActionResult RBACRoleUsers(string roleId,string roleName)
        {
            ViewBag.roleId = roleId;
            ViewBag.roleName = roleName;
            return View();
        }

        public ActionResult ResourceGroups()
        {
            return View();
        }

        public ActionResult AddARMResources()
        {
            return View();
        }

        public ActionResult QuickCreateARMResources()
        {
            return View();
        }

        public ActionResult Resource(string groupID,string resGroupID)
        {
            ViewBag.resGroupID = resGroupID;
            ViewBag.groupID = groupID;
            return View();
        }

        public ActionResult Setting()
        {
            return View();
        }

        public ActionResult DynamicDetail(string param)
        {
            ViewBag.param = param;
            //ViewBag.pageCaption = pageCaption;
            return View();
        }
    }
}
