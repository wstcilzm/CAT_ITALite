using System.Web.Optimization;

namespace CAT.ITALite.Web
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js",
                        "~/Scripts/jquery.cookie.js",
                        "~/Scripts/jquery.form.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                        "~/Scripts/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.unobtrusive*",
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/js").Include(
                        "~/Scripts/bootstrap.min.js",
                        "~/Scripts/menu.js",
                        "~/Scripts/vutils.js",
                        "~/Scripts/vextends.js",
                        "~/Scripts/venum.js",
                        "~/Scripts/vgrid.js",
                        "~/Scripts/vtree.js",
                        "~/Scripts/vslide.js",
                        "~/Scripts/vlayout.js",
                        "~/Scripts/vchart.js",
                        "~/Scripts/Chart.js",
                        "~/Scripts/vgraph.js",
                        "~/Scripts/vbar.js",
                        "~/Scripts/vhistogram.js",
                        "~/Scripts/vradio.js",
                        "~/Scripts/vxml.js",
                        "~/Scripts/vupload.js",
                        "~/Scripts/vlinechart.js",
                        "~/Scripts/vdropdown.js",
                        "~/Scripts/vdateRange.js",
                        "~/Scripts/vvalidationRules.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                        //"~/Content/christmas.css",
                        "~/Content/SettingStyle.css",
                        "~/Content/site.css",
                        "~/Content/vdropdown.css",
                        "~/Content/vlinechart.css",
                        "~/Content/vgrid.css",
                        "~/Content/vwizard.css",
                        "~/Content/vdataRange.css",
                        "~/Content/themes/base/jquery.ui.all.css",
                        "~/Content/tabContainer.css",
                        "~/Content/screen.css"));

            bundles.Add(new StyleBundle("~/Content/themes/base/css").Include(
                        "~/Content/themes/base/jquery.ui.core.css",
                        "~/Content/themes/base/jquery.ui.resizable.css",
                        "~/Content/themes/base/jquery.ui.selectable.css",
                        "~/Content/themes/base/jquery.ui.accordion.css",
                        "~/Content/themes/base/jquery.ui.autocomplete.css",
                        "~/Content/themes/base/jquery.ui.button.css",
                        "~/Content/themes/base/jquery.ui.dialog.css",
                        "~/Content/themes/base/jquery.ui.slider.css",
                        "~/Content/themes/base/jquery.ui.tabs.css",
                        "~/Content/themes/base/jquery.ui.datepicker.css",
                        "~/Content/themes/base/jquery.ui.progressbar.css",
                        "~/Content/themes/base/jquery.ui.theme.css"));
        }
    }
}
