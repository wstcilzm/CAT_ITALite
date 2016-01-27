using System.Web.Mvc;

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

        public ActionResult AssignAppToGroup()
        {
            return View();
        }
    }
}
