using System.Web.Mvc;
using Newtonsoft.Json;

namespace CAT.ITALite.Web.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";
            //comments
            return View();
        }

        public ActionResult Application()
        {
            return View();
        }

        public ActionResult Group()
        {
            return View();
        }

        public ActionResult User()
        {
            return View();
        }

        public ActionResult AddUser()
        {
            return View();
        }

        public ActionResult AddGroup()
        {
            return View();
        }

        public ActionResult Role()
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
    }
}
