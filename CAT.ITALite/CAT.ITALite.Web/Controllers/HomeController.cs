using System.Web.Mvc;
using Newtonsoft.Json;

namespace CAT.ITALite.Web.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

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

        public ActionResult AssignUserToGroup()
        {
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
    }
}
