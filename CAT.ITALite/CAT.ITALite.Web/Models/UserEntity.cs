using System.Linq;

namespace CAT.ITALite.Web.Models
{
    public class UserEntity
    {
        public string UserName { get; set; }
        public string DisplayName { get; set; }

        public string Alias
        {
            get { return UserName.Split('\\').Last(); }
        }

        public string PhotoUrl
        {
            get { return "../Content/images/default.jpg"; }
        }
    }
}