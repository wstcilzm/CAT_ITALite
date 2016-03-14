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
        public static string RBACRoles = ConfigurationManager.AppSettings["tableNamePrefix"] + "RBACRoles";
        public static string UserRBACRoleAssignments = ConfigurationManager.AppSettings["tableNamePrefix"] + "UserRBACRoleAssignments";
        public static string RGRBACRoleAssignments = ConfigurationManager.AppSettings["tableNamePrefix"] + "RgRBACRoleAssignments";
        public static string RMResources = ConfigurationManager.AppSettings["tableNamePrefix"] + "RMResources";
        public static string RMResourceGroups = ConfigurationManager.AppSettings["tableNamePrefix"] + "RMResourceGroups";

    }
}