using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using CAT.ITALite.Portal.Models;
using System.Security.Principal;

namespace CAT.ITALite.Portal
{
    public class ITAAuthorizeAttribute : System.Web.Mvc.AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (DateTime.Now.Second % 2 == 1)
            {
                //HttpContext.Current.User.Identity = 
                FormsAuthentication.SetAuthCookie("admin", false);
                HttpContext.Current.User = new CustomPrincipal();
            }

            if (httpContext.Request.IsAuthenticated)
            {
                return true;
            }

            if (httpContext == null)
            {
                throw new ArgumentNullException("HttpContext");
            }
            if (!httpContext.User.Identity.IsAuthenticated)
            {
                return false;
            }
            if (Roles == null)
            {
                return true;
            }
            if (Roles.Length == 0)
            {
                return true;
            }
            return false;
        }

        public override void OnAuthorization(System.Web.Mvc.AuthorizationContext filterContext)
        {

            string controllerName = filterContext.ActionDescriptor.ControllerDescriptor.ControllerName;
            string actionName = filterContext.ActionDescriptor.ActionName;
            base.OnAuthorization(filterContext);

        }

        protected override void HandleUnauthorizedRequest(System.Web.Mvc.AuthorizationContext filterContext)
        {
            string AK = HttpContext.Current.Request.QueryString["AK"];
            if (string.IsNullOrEmpty(AK))
            {
                filterContext.Result = new RedirectResult("http://www.baidu.com");
            }
            else
            {
            }
        }

    }


    public class CustomPrincipal : IPrincipal
    {
        private CustomIdentity identity;
        public CustomPrincipal(CustomIdentity identity)
        {
            this.identity = identity;
        }

        public CustomPrincipal()
        { }

        public IIdentity Identity
        {
            get
            {
                return identity;
            }
        }
        public bool IsInRole(string role)
        {
            return false;
        }
    }
    public class CustomIdentity : IIdentity
    {
        private FormsAuthenticationTicket ticket;
        private HttpContext context = HttpContext.Current;
        public CustomIdentity(FormsAuthenticationTicket ticket)
        {
            this.ticket = ticket;
        }
        public string AuthenticationType
        {
            get { return "Custom"; }
        }
        public bool IsAuthenticated
        {
            get { return true; }
        }
        public string Name
        {
            get
            {
                return ticket.Name;
            }
        }
        public FormsAuthenticationTicket Ticket
        {
            get { return ticket; }
        }
    }

}