using CAT.ITALite.Web.Models;

namespace CAT.ITALite.Web.Utils
{
    public class PortalConfig
    {
        public static UserEntity CurrentUser
        {
            get
            {
                return new UserEntity();
                //ClaimsIdentity
                //UserEntity userInSession = null;
                //if (HttpContext.Current.Session != null)
                //{
                //    userInSession = HttpContext.Current.Session["CurrentUser"] as UserEntity;
                //}
            }
        }
    }
}
