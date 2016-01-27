using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(CAT.ITALite.WebApi.Startup))]

namespace CAT.ITALite.WebApi
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
