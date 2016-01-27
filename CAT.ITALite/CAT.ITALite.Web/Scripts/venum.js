var Enums = {
    RoleStatus: {
        Null: -1,
        Pending: 0,
        Approved: 2,
        Denied: 3
    },
    HostStateEnum: {
        Adding: 0,
        Removing: 1,
        Responding: 2,
        NotResponding: 3,
        AccessDenied: 4,
        Updating: 5,
        Reassociating: 6,
        Pending: 7,
        MaintenanceMode: 8,
        Starting: 9,
        Stopping: 10,
        Restarting: 11,
        Stopped: 12
    },
    VMComputerSystemStateEnum: {
        CheckpointFailed: 0xd5,
        CreatingCheckpoint: 210,
        CreationFailed: 0x65,
        CustomizationFailed: 0x69,
        Deleting: 13,
        DeletingCheckpoint: 0xd3,
        DiscardingDrives: 80,
        DiscardSavedState: 10,
        FinishingCheckpointOperation: 0xd7,
        HostNotResponding: 0xdd,
        IncompleteVMConfig: 0xdf,
        InitializingCheckpointOperation: 0xd6,
        MergingDrives: 12,
        MigrationFailed: 0xc9,
        Missing: 220,
        P2VCreationFailed: 240,
        Paused: 6,
        Pausing: 0x51,
        PoweringOff: 2,
        PowerOff: 1,
        RecoveringCheckpoint: 0xd4,
        ReplacementFailed: 0x6c,
        Restoring: 5,
        Running: 0,
        Saved: 3,
        Saving: 4,
        Starting: 11,
        Stored: 0x66,
        TemplateCreationFailed: 0x68,
        UnderCreation: 100,
        UnderMigration: 200,
        UnderReplacement: 0x6d,
        UnderTemplateCreation: 0x67,
        UnderUpdate: 0x6a,
        Unsupported: 0xde,
        UnsupportedCluster: 0xe1,
        UnsupportedSharedFiles: 0xe0,
        UpdateFailed: 0x6b,
        V2VCreationFailed: 250,

        //following status is from vmrequest table. Rule: +100 then *(-1)
        Pending: -100,
        Initializing: -101,
        CreateSuccess: -102,
        CreateFailed: -103,
        Removed: -104
    },
    RoleType: {
        VmmAdmin: 1,
        GroupAdmin: 2,
        SelfServiceUser: 32
    },
    VMExpiredStatus: {
        UnNotify: 0,
        NofityIn7Days: 1,
        NofityIn3Days: 2,
        Removed: 3,
        Handling: 4
    },
    VMRequestStatus: {
        Pending: 0,
        Initializing: 1,
        CreateSuccess: 2,
        CreateFailed: 3,
        Removed: 4
    },
    JobStatus: {
        Pending: 0,
        Running: 1,
        Succeed: 2,
        Failed: 3,
        Deleted: 4,
        WaitingApproval: 5, // waiting for approval, 
        Denied: 6 // denied 
    },
    RoleFeatureStatus: {
        Pending: 0,
        Approved: 1,
        Denied: 2
    },
    SQLServerAuthenticationType: {
        SQLServer: 0,
        Windows: 1
    },
    QuotaType: {
        UseDefault: -1,
        Unlimited: -2
    },
    getString: function (type, state) {
        var t = this[type];
        if (t) {
            for (name in t) {
                if (t[name] == state) {
                    return name;
                }
            }
        }
        return 'Unknown';
    },
    parse: function (name, str, ignoreCase) {
        if (!str || typeof (str) != 'string') {
            return null;
        }
        if (ignoreCase) {
            str = str.toLocaleLowerCase();
            var val = null;
            $.each(Enums[name], function (n) {
                if (n.toLocaleLowerCase() == str) {
                    val = this.valueOf();
                }
            });
            return val;
        } else {
            return Enums[name][str];
        }
    }
};
(function () {
    $.each(Enums, function (name) {
        if (typeof (this) == 'object') {
            this.getString = function (state) {
                return Enums.getString(name, state);
            };
            this.parse = function (v, ignoreCase) {
                return Enums.parse(name, v, ignoreCase);
            };
        }
    });
    var en = Enums.VMComputerSystemStateEnum;
    Enums.canStartStatus = [en.PowerOff, en.Saved, en.Paused];
    Enums.canShutdownStatus = [en.Running, en.Paused];
    Enums.canResetStatus = [en.Running];
    Enums.canDeleteStatus = [en.Running, en.Saved, en.PowerOff, en.Missing, en.UpdateFailed, en.CreationFailed, en.CustomizationFailed, en.Pending, en.CreateFailed];
    Enums.canRecreateStatus = [en.CreationFailed, en.CustomizationFailed, en.CreateFailed];
    Enums.canOperateStatus = [en.PowerOff, en.Saved, en.Paused, en.Running];
})();