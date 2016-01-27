using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CAT.ITALite.Common
{
    public class AuthData
    {
        public AuthData()
        {
            authResult = false;
            expireInUTC = DateTime.UtcNow;
            operationRequired = 0;
        }

        public string userObjectID { set; get; }
        public string userPrincipleName { set; get; }
        public string appObjectId { set; get; }
        public string appName { set; get; }
        public Byte operationRequired { set; get; }
        public string hashKey { set; get; }

        public bool authResult { set; get; }
        public DateTime expireInUTC { set; get; }

    }
}
