using System;
using System.Web.Mvc;

namespace CAT.ITALite.WebApi.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            if (null != Session["RelyingApp"])
            {
                ViewBag.Title = "http://" + Session["RelyingApp"].ToString();
            }

            //for temp before next coding work.
            //Response.Redirect("http://localhost:33162/?BK=" + Guid.NewGuid().ToString());

            return View();
        }

        public string Test()
        {
            return "Hello, ITALite Auth Center!";
        }

    }
}
