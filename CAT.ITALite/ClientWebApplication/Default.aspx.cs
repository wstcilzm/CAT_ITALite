using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace ClientWebApplication
{
    public partial class MyDefault : Page
    {

        protected MVCAuthHelper mVCAuthHelper = new MVCAuthHelper();
        protected void Page_Load(object sender, EventArgs e)
        {
            
        }


        protected CAT.ITALite.Common.AuthData GetCookie()
        {
            
            return mVCAuthHelper.GetUserCookie();
            //return mVCAuthHelper.UserData;
        }

        protected string privateInfo =
            "<h3 class=\"auto-style1\">Here is content to private:</h3>" +
            "<ol class=\"round\">" +
            "<li class=\"one\">" +
            "<h5 class=\"auto-style1\">Getting Started</h5>" +
            "<span class=\"auto-style1\">ASP.NET Web Forms lets you build dynamic websites using a familiar drag-and-drop, event-driven model." +
            "A design surface and hundreds of controls and components let you rapidly build sophisticated, powerful UI-driven sites with data access." +
            "</span>" +
            "<a href=\"http://go.microsoft.com/fwlink/?LinkId=245146\" class=\"auto-style1\">Learn more…</a><span class=\"auto-style1\"> </span>" +
            "</li>" +
            "<li class=\"two\">" +
            "<h5 class=\"auto-style1\">Add NuGet packages and jump-start your coding</h5>" +
            "<span class=\"auto-style1\">NuGet makes it easy to install and update free libraries and tools." +
            "</span>" +
            "<a href=\"http://go.microsoft.com/fwlink/?LinkId=245147\" class=\"auto-style1\">Learn more…</a><span class=\"auto-style1\"> </span>" +
            "</li>" +
            "</ol>";

        protected  string managerInfo =
            "<h3 class=\"auto-style2\">Here is content with access authorization:</h3>" +
            "<ol class=\"round\">" +
            "<li class=\"one\">" +
            "<h5 class=\"auto-style2\">Getting Started</h5>" +
            "<span class=\"auto-style2\">ASP.NET Web Forms lets you build dynamic websites using a familiar drag-and-drop, event-driven model." +
            "A design surface and hundreds of controls and components let you rapidly build sophisticated, powerful UI-driven sites with data access." +
            "</span>" +
            "<a href=\"http://go.microsoft.com/fwlink/?LinkId=245146\" class=\"auto-style2\">Learn more…</a><span class=\"auto-style2\"> </span>" +
            "</li>" +
            "<li class=\"two\">" +
            "<h5 class=\"auto-style2\">Add NuGet packages and jump-start your coding</h5>" +
            "<span class=\"auto-style2\">NuGet makes it easy to install and update free libraries and tools." +
            "</span>" +
            "<a href=\"http://go.microsoft.com/fwlink/?LinkId=245147\" class=\"auto-style2\">Learn more…</a><span class=\"auto-style2\"> </span>" +
            "</li>" +
            "</ol>";



    }
}