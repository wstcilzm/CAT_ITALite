
validationRules = {
    requiredField: { rules: [{ base: 'required', emptyValues: ['-1'] }] },
    language: {
        rules: [{ base: 'required', error: 'Language is required.' }]
    },
    vhd: {
        valueGetter: function () {
            return this.vgrid('selectedData');
        },
        alertOffset: { left: -10, top: 200 },
        rules: [{ base: 'required', error: 'You should select a vhd file first.' }]
    },
    host: {
        valueGetter: function () {
            return this.vgrid('selectedData');
        },
        alertOffset: { left: -10, top: 200 },
        rules: [{ base: 'required', error: 'Choose one host please.' }]
    },
    expireTime: {
        rules: [{ base: 'required', error: 'Expire Time is required' }]
    },
    vmname: {
        rules: [
            { base: 'required', error: "Computer name is required, multi names split by ',' or ';'." },
            { base: 'regex', regular: '^[0-9a-zA-Z][a-zA-Z0-9,;\\-]*$', error: 'Machine must be composed only of letters, numbers, and hyphens.' },
            { base: 'regex', match: false, regular: '^\\d+$', error: 'Machine name can not be composed completely of numbers.' },
            { base: 'remote', url: '../../VMOperation/CheckNameLegal', error: 'The VM name already exist.', key: 'vmName' }
        ]
    },
    description: {
        rules: [{ base: 'required', error: 'Description is required.' }]
    },
    network: {
        rules: [{ base: 'required', error: 'Virtual Network is required.' }]
    },
    vlan: {
        rules: [{ base: 'numeric', error: 'Vlan can only be numeric.' }]
    },
    password: {
        rules: [{ base: 'required', error: 'The password is required.' }]
    },
    cpuCount: {
        rules: [{ base: 'required', error: 'The password is required.' }]
    },
    vmPlacement: {
        rules: [{
            base: 'customer', error: 'Disk not enough.', run: function (v) {
                if (v == -1)
                    return 'success';
                var pathReg = /^([a-zA-Z]:)?(\\[^<>:"/\\|?*]+)+\\?$/gi;
                if (!pathReg.test(v)) {
                    this.error = 'invalid path';
                    return 'error';
                }
                var path = v.substring(0, 2);
                var regex = /[A-z]: ([0-9.]+)([GB|TB])/gi;
                // todo: short this
                var s = '';
                var volumes = JSON.parse($("#createvmwizard #hostList").vgrid('selectedData').Volume);
                $.each(volumes, function () {
                    var t = this;
                    s += '{0} {1} free, '.format(t.partition, vstorm.getSizeStr(t.free), vstorm.getSizeStr(t.total));
                });
                var available = null;
                var num = null;
                while ((result = regex.exec(s)) !== null) {
                    if (result[0].toLowerCase().indexOf(path.toLowerCase()) > -1) {
                        available = result[1];
                        if (result[2] == 'T') {
                            num = parseInt(result[1]) * 1024;
                        }
                        else {
                            num = parseInt(result[1]);
                        }
                    }
                }
                if (available == null) {
                    this.error = 'No disk ' + path.substring(0, 1) + '.';
                    return 'error';
                }
                if (parseInt(cvm.settings.reservedDisk) > num) {
                    this.error = 'Not enough disk on ' + path.substring(0, 1) + '.';
                    return 'error';
                }
                return 'success';
            }
        }
        ]
    },
};