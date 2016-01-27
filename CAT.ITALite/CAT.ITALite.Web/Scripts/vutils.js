var guid = {
    newGuid: function () {
        var s4 = function () { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); };
        return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4());
    },
    isGuid: function (v) {
        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);
    },
    empty: '00000000-0000-0000-0000-000000000000'
};
var vstorm = { version: 1.0 };
$(function () {
    String.prototype.contains = function (v) {
        return this.indexOf(v) != -1;
    };
    String.prototype.startWith = function (v) {
        return this.indexOf(v) == 0;
    };
    String.prototype.endWith = function (v) {
        return this.lastIndexOf(v) == this.length - v.length;
    };
    String.prototype.trimStart = function () {
        return this.replace(/\s*((\S+\s*)*)/, "$1");
    };
    String.prototype.trimEnd = function () {
        return this.replace(/((\s*\S+)*)\s*/, "$1");
    };
    String.prototype.trim = function () {
        return this.trimEnd().trimStart();
    };
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/\{(\d+)\}/g,
            function (m, i) {
                return args[i];
            });
    };
    Array.prototype.indexOf = function (v, f) {
        var count = this.length;
        if (!f) {
            f = function (a) { return a; };
        }
        for (var i = 0; i < count; i++) {
            if (f(this[i]) == v) {
                return i;
            }
        }
        return -1;
    };
    Array.prototype.contains = function (v, f) {
        return this.indexOf(v, f) != -1;
    };
    Array.prototype.clear = function () {
        while (this.length > 0) {
            this.pop();
        }
    };
    Array.prototype.isEmpty = function () {
        return this.length == 0;
    };
    Array.prototype.last = function () {
        return this.isEmpty() ? null : this[this.length - 1];
    };
    Array.prototype.first = function () {
        return this.isEmpty() ? null : this[0];
    };
    Array.prototype.remove = function (v, all) {
        var idx = this.indexOf(v);
        if (idx != -1) {
            this.splice(idx, 1);
            if (all && this.contains(v)) {
                this.remove(v, all);
            }
        }
        return this;
    };
    Array.prototype.removeAt = function (idx) {
        if (idx < 0 || idx >= this.length) {
            return;
        }
        var temp = this.slice(idx + 1);
        this.length = idx;
        this.push.apply(this, temp);
    };
    Array.prototype.distinct = function () {
        var arr = [];
        var len = this.length;
        for (var idx = 0; idx < len; idx++) {
            if (!arr.contains(this[idx])) {
                arr.push(this[idx]);
            }
        }
        return arr;
    };
    Array.prototype.sum = function () {
        if (this.length == 0) {
            return null;
        } else {
            var len = this.length;
            var res = this[0];
            for (var idx = 1; idx < len; idx++) {
                res += this[idx];
            }
            return res;
        }
    };
    Array.prototype.parseInt = function (radix) {
        var len = this.length;
        var arr = [];
        if (radix == 16) {
            arr.push('0x');
        } else if (radix == 8) {
            arr.push('0');
        }
        for (var idx = 0; idx < len; idx++) {
            var x = this[idx].toString(radix);
            if (radix == 16 && x.length == 1) {
                x = "0" + x;
            }
            arr.push(x);
        }
        return parseInt(arr.join(''));
    };
    Array.prototype.each = function (callback) {
        if (typeof callback != "function") {
            return;
        }
        var len = this.length;
        for (var idx = 0; idx < len; idx++) {
            if (this[idx] != null && this[idx] != undefined) {
                callback.call(this[idx], idx);
            }
        }
    };
    Array.prototype.deach = function (callback) {
        if (typeof callback != "function") {
            return;
        }
        var len = this.length;
        for (var idx = len - 1; idx >= 0; idx--) {
            if (this[idx] != null && this[idx] != undefined) {
                callback.call(this[idx], idx);
            }
        }
    };
    Array.prototype.findAll = function (v) {
        var r = [];
        if (typeof v == "function") {
            this.each(function () {
                if (v(this)) {
                    r.push(this);
                }
            });
        } else {
            this.each(function () {
                if (v == this) {
                    r.push(this);
                }
            });
        }
        return r;
    };
    Array.prototype.find = function (v) {
        if (typeof v == 'function') {
            var count = this.length;
            for (var idx = 0; idx < count; idx++) {
                if (v(this[idx])) {
                    return this[idx];
                }
            }
        } else {
            var idx = this.indexOf(v);
            if (idx != -1) {
                return this[idx];
            }
        }
        return null;
    };
    Array.prototype.min = function (callback) {
        var min = null;
        if (callback) {
            this.each(function () {
                if (min == null || callback(this) < min) {
                    min = callback(this);
                }
            });
        } else {
            this.each(function () {
                if (typeof (this) == 'number' && isNaN(this)) {
                    return;
                }
                if (min == null || this < min) {
                    min = this;
                }
            });
        }
        return min ? min.valueOf() : min;
    };
    Array.prototype.max = function (callback) {
        var max = null;
        if (callback) {
            this.each(function () {
                if (max == null || callback(this) > max) {
                    max = callback(this);
                }
            });
        } else {
            this.each(function () {
                if (typeof (this) == 'number' && isNaN(this)) {
                    return;
                }
                if (max == null || this > max) {
                    max = this;
                }
            });
        }
        return max ? max.valueOf() : max;
    };
    Array.prototype.pick = function (prop) {
        if (prop != 0 && !prop) {
            return this;
        }
        var r = [];
        if (typeof prop == 'function') {
            this.each(function () {
                r.push(prop(this));
            });
        } else {
            this.each(function () {
                r.push(this[prop]);
            });
        }
        return r;
    };
    Array.prototype.groupBy = function (prop) {
        var r = [];
        var props = this.pick(prop).distinct();
        var t = this;
        if (typeof prop == 'function') {
            props.each(function () {
                var i = [];
                var p = this;
                t.each(function () {
                    if (prop(this) == p) {
                        i.push(this);
                    }
                });
                r.push({ key: p, items: i });
                i = [];
            });
        } else {
            props.each(function () {
                var i = [];
                var p = this;
                t.each(function () {
                    if (this[prop] == p) {
                        i.push(this);
                    }
                });
                r.push({ key: p, items: i });
                i = [];
            });
        }
        return r;
    };
    Array.prototype.addRange = function (range) {
        if (range) {
            if (range.constructor == Array) {
                var t = this;
                range.each(function () { t.push(this.valueOf()); });
            } else {
                this.push(range);
            }
        }
    };
    Array.prototype.clone = function () {
        return this.concat([]);
    };
    Array.prototype.deapClone = function () {
        var result = [];
        this.each(function () {
            if (typeof this == 'object') {
                result.push($.extend({}, this));
            } else {
                result.push(this);
            }
        });
        return result;
    };
    Array.prototype.countOf = function (v) {
        var count = 0, len = this.length;
        for (var idx = 0; idx < len; idx++) {
            var vl = this[idx];
            if (typeof (v) == 'function') {
                if (v(vl)) {
                    count++;
                }
            } else if (v == vl) {
                count++;
            }
        }
        return count;
    };
    Date.prototype.isValid = function () {
        return !!this.getDate();
    };
    Date.fromJSON = function (json) {
        if (json != null) {
            var lud = new Date(parseInt(json.substr(6)));//utc time but with local time zone.
            var ld = new Date(); ld.getTimezoneOffset();
            return new Date(lud.getTime() - ld.getTimezoneOffset() * 60000);
        }
    };
    Date.daysInMonth = function (year, month) {//month is 0 base.
        return new Date(year, month + 1, 0).getDate();
    };
    Date.daysInYear = function (year) {
        if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
            // Leap year
            return 366;
        } else {
            // Not a leap year
            return 365;
        }
    };
    Date.formatJSON = function (json, fmt) {
        if (!json) {
            return "N/A";
        } else {
            var d = Date.fromJSON(json), now = new Date();
            var formatStr = fmt;
            if (!formatStr || typeof (formatStr) != 'string') {
                formatStr = 'hh:mm:ss';
                if (d.toDateString() != now.toDateString()) {
                    formatStr = 'MM/dd/yyyy hh:mm:ss';
                }
            }
            return d.format(formatStr);
        }
    };
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
            "H+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S": this.getMilliseconds()
        };
        var week = {
            "0": "\u65e5",
            "1": "\u4e00",
            "2": "\u4e8c",
            "3": "\u4e09",
            "4": "\u56db",
            "5": "\u4e94",
            "6": "\u516d"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
        }
        if (/(w+)/.test(fmt)) {
            fmt = (this.getMonth() + 1) + '/' + this.getDate();
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };
    Date.prototype.addSeconds = function (seconds) {
        var d = this.getTime() + (1000 * seconds);
        return new Date(d);
    };
    Date.prototype.addMinutes = function (minutes) {
        return this.addSeconds(minutes * 60);
    };
    Date.prototype.addHours = function (hours) {
        return this.addMinutes(hours * 60);
    };
    Date.prototype.addDays = function (days) {
        return this.addHours(days * 24);
    };
    Date.prototype.addWeeks = function (weeks) {
        return this.addDays(weeks * 7);
    };
    Date.prototype.addMonths = function (months) {
        var d = new Date(this.getTime());
        d.setMonth(d.getMonth() + months);
        return d;
    };
    Date.prototype.addYears = function (years) {
        var d = new Date(this.getTime());
        d.setFullYear(d.getFullYear() + years);
        return d;
    };
    Date.prototype.daysInMonth = function () {//return the days count of current month.(28,29,30,31)
        return Date.daysInMonth(this.getFullYear(), this.getMonth());
    };
    Date.prototype.daysInYear = function () {//return the days count of current year (365 or 366). 01/01/2012 is 366 for example
        return Date.daysInYear(this.getFullYear());
    };
    Date.prototype.daysOfMonth = function () {//return the date's day in a month.(1~31)
        return this.getDate();
    };
    Date.prototype.daysOfYear = function () {//return the date's day in a year, 01/01/2012 is 1 for example.(1~365,366)
        var start = new Date(this.getFullYear(), 0, 0);
        return start.duration(this, 'd');
    };
    Date.prototype.toUtc = function () {
        return new Date(this.getTime() + this.getTimezoneOffset() * 60 * 1000);
    };
    Date.now = function (unit) {
        if (!unit) {
            unit = 's';
        }
        return new Date().accurate(unit);
    };
    Date.utcNow = function (unit) {
        return Date.now(unit).toUtc();
    };
    Date.today = function () {
        return Date.now('d');
    };
    Date.utcToday = function () {
        return (new Date()).toUtc().accurate('d');
    };
    Date.prototype.accurate = function (unit) {
        switch (unit) {
            case "s":
                return new Date(this.getTime() - this.getMilliseconds());
            case "m":
                return new Date(this.accurate('s') - this.getSeconds() * 1000);
            case "h":
                return new Date(this.accurate('m') - this.getMinutes() * 60 * 1000);
            case "d":
                return new Date(this.getFullYear(), this.getMonth(), this.getDate());
            case "w":
                return new Date(this.accurate('d') - (this.getDay()) * 24 * 3600 * 1000);
            case "M":
                return new Date(this.getFullYear(), this.getMonth(), 1);
            case "y":
                return new Date(this.getFullYear(), 0, 1);
        }
    };
    Date.prototype.add = function (value, unit) {
        switch (unit) {
            case "s":
                return this.addSeconds(value);
            case "m":
                return this.addMinutes(value);
            case "h":
                return this.addHours(value);
            case "d":
                return this.addDays(value);
            case "w":
                return this.addWeeks(value);
            case "M":
                return this.addMonths(value);
            case "y":
                return this.addYears(value);

        }
    };
    Date.prototype.duration = function (to, unit) {
        switch (unit) {
            case "s":
                return (to.getTime() - this.getTime()) / 1000;
            case "m":
                return this.duration(to, 's') / 60;
            case "h":
                return this.duration(to, 'm') / 60;
            case "d":
                return this.duration(to, 'h') / 24;
            case "w":
                return this.duration(to, 'd') / 7;
            case "M":
                return (to.getFullYear() - this.getFullYear()) * 12 + (to.getMonth() - this.getMonth()) + (to.getDate() - this.getDate()) / to.daysInMonth();
            case "y":
                return (to.getFullYear() - this.getFullYear()) + (to.daysOfYear() - this.daysOfYear()) / to.daysInYear();

        }
    };
    Date.prototype.nextUnit = function (unit) {
        var units = ['s', 'm', 'h', 'd', 'w', 'M', 'y'];
        var idx = units.indexOf(unit);
        if (unit < units.length - 1) {
            return units[idx + 1];
        }
        return null;
    };
    Date.prototype.value = function (unit) {
        switch (unit) {
            case "s":
                this.getSeconds();
            case "m":
                return this.getMinutes();
            case "h":
                return this.getHours();
            case "d":
                return this.getDate()
            case "w":
                return parseInt(this.daysInYear() / 7, 10);
            case "M":
                return this.getMonth();
            case "y":
                return this.getFullYear();
        }
    };
    Math.o_round = Math.round;
    Math.round = function (num, decimals) {
        if (!decimals || decimals < 0) {
            return Math.o_round(num);
        }
        var p = Math.pow(10, decimals);
        return Math.o_round(num * p) / p;
    };
});
$(function () {
    $.extend(vstorm, {
        getApiServerUrl: function() {
            var debug = window.location.href.indexOf('http://localhost') == 0;
            return debug ? 'http://localhost:33042/' : 'http://catitalitewebapi.chinacloudsites.cn/';
        },
        getSize: function (size, orgUnit, targetUnit, dif) {
            if (!orgUnit) {
                orgUnit = "B";
            }
            if (!targetUnit) {
                targetUnit = "Auto";
            }
            if (dif) {
                size += dif;
            }
            var units = ["B", "KB", "MB", "GB", "TB", "PB"];
            var idx = -1;
            for (idx = 0; idx < units.length; idx++) {
                if (units[idx].toLowerCase() == orgUnit.toLowerCase()) {
                    break;
                }
            }
            var dsize = size;
            targetUnit = targetUnit.toLowerCase();
            while (idx < units.length) {
                unit = units[idx];
                idx++;
                if (targetUnit != "auto" && unit.toLowerCase() == targetUnit) {
                    break;
                }
                if (targetUnit == "auto" && dsize < 1024) {
                    break;
                }
                dsize = dsize / 1024;
            }
            unit = units[idx - 1];
            return { value: Math.round(dsize, 2), unit: unit };
        },
        getSizeStr: function (size, orgUnit, targetUnit, dif) {
            var v = this.getSize(size, orgUnit, targetUnit, dif);
            if (v) {
                return v.value + v.unit;
            }
            return null;
        },
        convertSizeStrToFloat: function (v) {
            var units = ["KB", "MB", "GB", "TB", "PB", "B"];
            var idx = -1;
            var num = 0;
            for (idx = 0; idx < units.length; idx++) {
                if (v.toLowerCase().contains(units[idx].toLowerCase())) {
                    num = v.toLowerCase().replace(units[idx].toLowerCase(), '');
                    break;
                }
            }
            switch (units[idx].toLowerCase()) {
                case 'b':
                    num = parseFloat(num);
                    break;
                case 'kb':
                    num = parseFloat(num) * 1024;
                    break;
                case 'mb':
                    num = parseFloat(num) * 1024 * 1024;
                    break;
                case 'gb':
                    num = parseFloat(num) * 1024 * 1024 * 1024;
                    break;
                case 'tb':
                    num = parseFloat(num) * 1024 * 1024 * 1024 * 1024;
                    break;
                case 'pb':
                    num = parseFloat(num) * 1024 * 1024 * 1024 * 1024 * 1024;
                    break;
                default:
                    break;
            }
            return num;
        },
        random: function (s, e) {
            return parseInt((Math.random() * (e - s) + s));
        },
        getRandomColor: function () {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.round(Math.random() * 15)];
            }
            return color;
        },
        bindSelect: function (data, target, valueField, textField, cacheObj, cacheName, defaultItem, callback) {
            var list = eval(data);
            if (!list) return;
            if (cacheObj && cacheName) {
                cacheObj[cacheName] = list;
            }
            var t = $(target);
            t.empty();
            if (defaultItem) {
                t.append($("<option/>").val(defaultItem.value).attr("selected", true).text(defaultItem.text));
            }
            if (list.length != 0) {
                list.each(function () {
                    t.append($('<option>').val(this[valueField]).text(this[textField]));
                });
                t.attr("disabled", false);
            }
            if (callback) {
                callback(list);
            }
        },
        numberFormatter: function (v) {
            var f = parseFloat(v);
            if (isNaN(f)) {
                return 'N/A';
            }
            return Math.round(f, 2);
        },
        datetimeFormatter: function (v) {
            if (!v) {
                return 'N/A';
            }
            return Date.fromJSON(v).format('MM/dd/yyyy hh:mm');
        },
        dateFormatter: function (v) {
            if (!v) {
                return "N/A";
            }
            return Date.fromJSON(v).format('MM/dd/yyyy');
        },
        max: function (a, b) {
            return a > b ? a : b;
        },
        min: function (a, b) {
            return a > b ? b : a;
        }
    });
    if (!window.$v) {
        window.$v = vstorm;
    }
});

