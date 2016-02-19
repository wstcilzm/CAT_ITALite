using System.Configuration;

namespace CAT.ITALite.Common
{
    public static class TableNames
    {
        public static string AADInfo = ConfigurationManager.AppSettings["tableNamePrefix"] + "AADInfo";
        public static string AADApps = ConfigurationManager.AppSettings["tableNamePrefix"] + "AADApps";
        public static string AADGroups = ConfigurationManager.AppSettings["tableNamePrefix"] + "AADGroups";
        public static string AADUsers = ConfigurationManager.AppSettings["tableNamePrefix"] + "AADUsers";
        public static string AADAdminRoles = ConfigurationManager.AppSettings["tableNamePrefix"] + "AADAdminRoles";
        public static string AppGroupAssignments = ConfigurationManager.AppSettings["tableNamePrefix"] + "AppGroupAssignments";
        public static string UserGroupAssignments = ConfigurationManager.AppSettings["tableNamePrefix"] + "UserGroupAssignments";
        public static string UserAdminRoleAssignments = ConfigurationManager.AppSettings["tableNamePrefix"] + "UserAdminRoleAssignments";
    }
}