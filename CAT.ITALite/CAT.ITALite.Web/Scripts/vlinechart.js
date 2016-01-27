$.widget("vstorm.vlineChart", {
    options: {
        width: 960,
        cHeight: 250,
        gutter: { top: 0, bottom: 30, left: 10, right: 10 },//gutter left will changed (to 30) when the value of 'isRelative' is false.
        padding: { top: 30, bottom: 0, left: 5, right: 5 },
        axisStyle: { strokeStyle: "#D3D3D3", lineWidth: 1, cycle: false },
        axisFormat: 'H',
        lineStyle: { lineCap: "round", strokeStyle: '#D3D3D3', lineWidth: 3 },
        hintAlpha: 0.7,
        visibleLineCount: 5,
        chartScale: 'relative',//relative|absolute
        timeRange: [
            {
                name: '24 Hours', timeGrain: 'PT1h',
                startTime: function () {
                    return Date.now().add(-24, 'h');
                },
                endTime: function () { return Date.now('h'); },
                axisFormat: 'H'
            },
            {
                name: '7 Days', timeGrain: 'PT1d',
                startTime: function () { return new Date(Date.now().add(-7, 'd').setHours(23, 59, 59)) },
                endTime: function () { return Date.now(); },
                axisFormat: 'd'
            },
            {
                name: '30 Days', timeGrain: 'PT1d',
                startTime: function () { return new Date(Date.now().add(-30, 'd').setHours(23, 59, 59)) },
                endTime: function () { return Date.now(); },
                axisFormat: 'd'
            },
            {
                name: '60 Days', timeGrain: 'PT1d',
                startTime: function () { return new Date(Date.now().add(-60, 'd').setHours(23, 59, 59)) },
                endTime: function () { return Date.now(); },
                axisFormat: 'd'
            },
            {
                name: '3 Months', timeGrain: 'PT1w',
                startTime: function () {
                    var now = new Date();
                    var fix = -now.getDay();
                    var end = now.add(fix, 'd');
                    var start = end.add(-11, 'w');
                    return start;
                },
                endTime: function () {
                    var now = new Date();
                    var fix = -now.getDay();
                    var end = now.add(fix, 'd');
                    return end;
                },
                axisFormat: 'w'
            },
            {
                name: '1 Year', timeGrain: 'PT1M',
                startTime: function () { return new Date(Date.now().add(-1, 'y').add(15 - Date.now().getDate(), 'd').add(-1,'M').setHours(23, 59, 59)) },
                endTime: function () { return Date.now().add(15 - Date.now().getDate(), 'd').add(-1, 'M'); },
                axisFormat: 'M'
            }
        ],
        onLoad: function (metrics) {
        },
        paddingBottom: 30,
        url: '',
        caption: '',
        showGrid: true,
        startTime: new Date(),
        endTime: null,
        timeGrain: "PT1h",//PT(<?num>\d+)(<?unit>\w) unit:m minutes, h hour, d day, M month, y year, w week.
        metrics: [],
        colors: ['#817936', '#444693', '#4285F4', '#b2d235', '#4e72b8', '#4e72b8', '#96582a', '#009ad6', '#96582a', '#401c44', '#aa2116', '#b76f40', '#f15a22', '#2585a6', '#2585a6', '#2f271d', '#1d1626']
    },
    _create: function () {
        var t = this;
        window.lc = this;
        var el = t.element, op = t.options;
        el.vloading().addClass('linechart').width(op.width);
        t.body = $("<div/>").addClass('linechart-body');
        t.header = $('<div/>').addClass('linechart-header');
        t.xAxisBar = $('<div/>').addClass('linechart-xaxis');
        t.yAxisBar = $('<div/>').addClass('linechart-yaxis');
        t.grid = $('<div/>').addClass('linechart-grid');
        t.chart = $('<canvas></canvas>').addClass('linechart-chart');
        t.overly = $('<canvas></canvas>').addClass('linechart-overly');
        t.chart.attr('width', op.width).attr('height', op.cHeight);
        t.overly.attr('width', op.width).attr('height', op.cHeight);
        el.append(t.header, t.body, t.grid);
        t.caption = $('<div>').text(op.caption).addClass('linechart-caption').appendTo(t.header);
        t.refreshDiv = $('<div class="linechart-refreshicon"/>')
            .appendTo(t.header)
            .bind('click.vlinechart', function () {
                t.refresh();
            });
        var i;
        if (op.specialTimeRange) {
            var newRange = [];
            for (i = 0; i < op.specialTimeRange.length; i++) {
                newRange.push(op.timeRange[op.specialTimeRange[i]]);
            }
            op.timeRange = newRange;
        }
        t.rangeDiv = $('<div class="linechart-timerange"/>').appendTo(t.header)
            .vdropdown({
                width: 100,
                items: op.timeRange,
                textField: 'name',
                valueField: 'name',
                defaultValue: op.timeRange.first().name,
                onChange: function (v) {
                    if (v) {
                        op.startTime = typeof (v.startTime == 'function') ? v.startTime() : v.startTime;
                        op.endTime = typeof (v.endTime == 'function') ? v.endTime() : v.endTime;
                        op.timeGrain = v.timeGrain;
                        op.axisFormat = v.axisFormat;
                        if (t.inited) {
                            t.refresh();
                        }
                    }
                }
            });
        t.scaleDiv = $('<div class="linechart-chartscale"/>')
            .appendTo(t.header)
            .vdropdown({
                width: 100,
                items: [{ name: 'relative' }, { name: 'absolute' }],
                textField: 'name',
                valueField: 'name',
                defaultValue: op.chartScale,
                onClick: function (v) {
                    if (v) {
                        op.chartScale = v.name;
                        t.draw();
                    }
                }
            });
        this.body.append(this.chart, this.overly, this.xAxisBar, this.yAxisBar).width(op.width).height(op.cHeight);
        this.xAxisBar.css('padding-left', op.gutter.left);
        var chart = this;
        this.overly.mousemove(function (ev) {
            var offset = $(this).offset();
            var x = Math.floor(ev.clientX - offset.left), y = Math.floor(ev.clientY - offset.top);
            chart._showHint({ x: x, y: y });
        }).mouseout(function () {
            chart._clearHint();
        });
        var setIcon = function (div, r) {
            if (r.visible === false) {
                div.attr("class", "linechart-unchecked");
                div.css({ 'background-color': '' });
            } else {
                div.attr("class", "linechart-checked");
                div.css({ 'background-color': r.style.strokeStyle });
            }
        };
        var iconColumn = {
            caption: '',
            field: 'visible',
            width: 1,
            formatter: function (v, r) {
                var div = $('<div/>');
                setIcon(div, r);
                div.click(function () {
                    r.visible = r.visible === false ? true : false;
                    setIcon(div, r);
                    t.drawCurve();
                });
                return div;
            }
        };
        var postColumns = [
            {
                caption: 'Max', width: 3, field: 'max', type: 'number', formatter: function (v, r) {
                    var value = Math.round(r.data.max(), 2);
                    return r.unit ? value + " " + r.unit : value;
                }
            },
            {
                caption: 'Min', width: 3, field: 'min', type: 'number', formatter: function (v, r) {
                    var value = Math.round(r.data.min(), 2);
                    return r.unit ? value + " " + r.unit : value;
                }
            },
            {
                caption: 'Avg', width: 3, field: 'avg', type: 'number', formatter: function (v, r) {
                    var vl = r.data.sum();
                    var value = Math.round(vl.valueOf() / r.data.countOf(function (v) { return v != null && v != undefined }), 2);
                    return r.unit ? value + " " + r.unit : value;
                }
            }
            //,
            //{
            //    caption: 'Total', width: 3, field: 'total', formatter: function (v, r) {
            //        return Math.round(r.data.sum(), 2);
            //    }
            //}
        ];
        var gridColumns = [];
        gridColumns.push(iconColumn);
        gridColumns = gridColumns.concat(op.gridColumns).concat(postColumns);
        var gridSetting = {
            width: op.width,
            height: 'auto',
            usePage: false,
            scaleWidth: true,
            caption: op.caption,
            showCaption: false,
            tbodyMaxHeight: op.vgridMaxHeight ? op.vgridMaxHeight : undefined,
            columns: gridColumns
        }
        this.grid.vgrid(gridSetting);
        t.inited = true;
    },
    _clearHint: function () {
        var o = this.overly[0], c = this._getContext(true);
        c.beginPath();
        c.closePath();
        c.clearRect(0, 0, o.width, o.height);
        this.body.find('.linechart-hint').remove();
        this.chintPoint = null;
    },
    _showHint: function (point) {
        var len = this.points.length;
        for (var idx = 0; idx < len; idx++) {
            var p = { x: Math.floor(this.points[idx].x), y: Math.floor(this.points[idx].y) };
            var ix = 5;
            if (p.x >= point.x - ix && p.x <= point.x + ix && p.y >= point.y - ix && p.y <= point.y + ix) {
                var context = this.overly[0].getContext("2d");
                var cp = this.points[idx];
                if (this.chintPoint == cp) {
                    return;
                }
                this._clearHint();
                this.chintPoint = cp;
                context.fillStyle = cp.source.style.hintStyle;
                context.arc(p.x, p.y, 4, 0, 2 * Math.PI);
                context.fill();
                var hint = $('<div class="linechart-hint"/>').html("{0} = {1}{2}<br/>{3}".format(cp.source.name, cp.value, cp.source.unit ? (' ' + cp.source.unit) : '', cp.time.format('MM/yyyy')));
                this.body.append(hint);
                if ((point.x + hint.width()) > this.body.width()) {
                    hint.css({ top: point.y + 5, left: point.x - 5 - hint.width(), background: cp.source.style.hintStyle });
                } else {
                    hint.css({ top: point.y + 5, left: point.x + 5, background: cp.source.style.hintStyle });
                }
                return;
            }
        }
        this._clearHint();
    },
    _calcZeroPoint: function () {
        var op = this.options;
        var tlx = op.gutter.left, tly = op.gutter.top;
        var brx = op.width - op.gutter.right, bry = op.cHeight - op.gutter.bottom;
        op.area = { zero: { x: tlx, y: bry }, height: bry - tly, width: brx - tlx };
    },
    _getAxisPoint: function (x, y) {
        if (typeof (x) == 'object') {
            return this._getAxisPoint(x.x, x.y);
        }
        var z = this.options.area.zero;
        return { x: z.x + x, y: z.y - y };
    },
    _drawLines: function (style) {//pass at least two points, style is optional.
        if (arguments.length > 2) {
            var context = this.chart[0].getContext('2d'), len = arguments.length, begin = 0, point, cycle = true;
            context.beginPath();
            if (style.x === undefined) {//style is realy a style, not a point.
                begin = 1;
                $.extend(context, this.options.lineStyle, style);
                if (style.cycle === false) {
                    cycle = false;
                }
            }
            point = this._getAxisPoint(arguments[begin]);
            context.moveTo(point.x, point.y);
            for (var idx = begin; idx < len; idx++) {
                var a = arguments[idx];
                point = this._getAxisPoint(a);
                context.lineTo(point.x, point.y);
                if (cycle) {
                    context.arc(point.x, point.y, 1, 0, 2 * Math.PI);
                    context.moveTo(point.x, point.y);
                }
                if (this.points == undefined) {
                    this.points = [];
                }
                if (a.showLabel) {
                    $('<div class="linechart-label"/>').css({ left: point.x + 2, top: point.y - 30 }).appendTo(this.body).vballoon({
                        text: Math.round(a.value, 2) + (a.source.unit == undefined ? '' : (' ' + a.source.unit)),
                        bgColor: a.source.style.strokeStyle
                    }).vballoon('show');
                }
                this.points.push($.extend({}, a, point));
            }
            context.stroke();
        }
    },
    _getContext: function (isOverly) {
        if (isOverly) {
            return this.overly[0].getContext('2d');
        } else {
            return this.chart[0].getContext('2d');
        }
    },
    _clearChart: function () {
        this.chart[0].width = this.options.width;
        this.body.find('.vballoon').vballoon('destroy').remove();
    },
    _calcInterval: function () {
        var reg = /PT(\d+)([mhdwMy])/g;
        var op = this.options;
        var match = reg.exec(op.timeGrain);
        if (match) {
            var v = parseInt(match[1], 10), u = match[2];
            this.options.interval = v;
            this.options.datepart = u;
            return true;
        }
        return false;
    },
    _drawAxis: function () {
        var op = this.options;
        if (this._calcInterval()) {
            this.xAxis = [];
            this.xAxisBar.empty();
            var v = op.interval, u = op.datepart;
            var zero = op.area.zero;
            var count = Math.ceil(op.startTime.duration(op.endTime, u) / v), interval = op.area.width / count;
            this.interval = interval;
            for (var idx = 0; idx <= count; idx++) {
                var time = op.startTime.add(idx * v, u);
                this.xAxis.push(time);
                this._drawLines(op.axisStyle, { x: idx * interval, y: 0 }, { x: idx * interval, y: op.area.height });
                var span = $('<span/>');
                if (idx == 0 || idx == count) {
                    span.width(Math.round(interval / 2, 2));
                } else {
                    span.width(Math.round(interval), 2);
                }
                if (typeof (op.axisFormat) == 'function') {
                    spa.text(op.axisFormat(time));
                } else {
                    span.text(time.format(op.axisFormat));
                }
                this.xAxisBar.append(span);
            }
            this.axisData = this._getContext().getImageData(0, 0, op.width, op.cHeight);
        }
    },
    _drawBorder: function () {
        var op = this.options, points = [];
        points.push(op.axisStyle);
        points.push({ x: 0, y: 0 });
        points.push({ x: 0, y: op.area.height });
        points.push({ x: op.area.width, y: op.area.height });
        points.push({ x: op.area.width, y: 0 });
        points.push({ x: 0, y: 0 });
        this._drawLines.apply(this, points);
    },
    _calcMetricsHintStyle: function () {
        var alpha = this.options.hintAlpha;
        $.each(this.options.metrics, function (idx) {
            var strokeStyle = this.style.strokeStyle;
            if (rgb = strokeStyle.match(/rgb\((\d+), (\d+), (\d+)/)) {
                this.style.hintStyle = 'rgba({0},{1},{2}{3})'.format(rgb[1], rgb[2], rgb[3], alpha ? "," + alpha : "");
            } else if (hex = strokeStyle.match(/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/)) {
                this.style.hintStyle = 'rgba({0},{1},{2}{3})'.format(parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16), alpha ? "," + alpha : "");
            } else {
                this.style.hintStyle = color;
            }
        });
    },
    _drawGrid: function () {
        this.grid.vgrid('bindData', this.options.metrics);
    },
    _drawCurve: function (isRelative) {
        var op = this.options, chart = this, times = this.xAxis;
        var maxY = op.area.height - op.padding.top, maxData = 0;
        $.each(op.metrics, function (idx) {
            if (this.visible !== false) {
                var m = this.data.max();
                if (m > maxData) {
                    maxData = m;
                }
            }
        });
        this.points = [];
        this._calcMetricsHintStyle();
        $.each(op.metrics, function (idx) {
            var m = this, max, maxMarked = false;
            if (isRelative) {
                max = this.data.max();
            } else {
                max = maxData;
            }
            if (max == 0) {
                max = 1;
            }
            if (m.visible === false) {
                return;
            }
            var cmax = Array.prototype.slice.call(m.data).max();
            var x = 0, points = [];
            points.push($.extend({}, op.lineStyle, m.style));
            $.each(m.data, function (idx) {
                if (this != null || this != undefined) {
                    var p = { x: x, y: this.valueOf() / max * maxY, source: m, value: this.valueOf(), time: times[idx] };
                    if (!maxMarked && this.valueOf() == cmax) {
                        maxMarked = true;
                        p.showLabel = true;
                    }
                    points.push(p);
                }
                x += chart.interval;
            });
            chart._drawLines.apply(chart, points);
        });
    },
    drawRelativeCurve: function () {
        this._drawCurve(true);
    },
    drawAbsoluteCurve: function () {
        this._drawCurve(false);
    },
    drawCurve: function () {
        this._clearChart();
        this._getContext().putImageData(this.axisData, 0, 0);
        switch (this.options.chartScale) {
            case "relative":
                this.drawRelativeCurve();
                break;
            case "absolute":
                this.drawAbsoluteCurve();
                break;
            default:
                //todo:error;
                break;
        }
    },
    draw: function () {
        this.chart[0].width = this.chart[0].width;
        this._calcZeroPoint();
        this._drawBorder();
        this._drawAxis();
        this.drawCurve();
        this._drawGrid();
    },
    metrics: function (metrics) {
        if (metrics === undefined) {
            return this.options.metrics;
        } else {
            this.options.metrics = metrics;
            this.draw();
        }
    },
    refresh: function () {
        this.load(this.lastParams);
    },
    load: function (params) {
        var t = this, op = this.options;
        t.lastParams = params;
        t._calcInterval();
        var ps = { startTime: op.startTime.toUtc().format('MM/dd/yyyy HH:mm'), endTime: op.endTime.toUtc().format('MM/dd/yyyy hh:mm'), interval: op.interval, datepart: op.datepart }
        if (params) {
            $.extend(ps, params);
        }
        t.element.vloading('show');
        $.getJSON(op.url, ps, function (data) {
            var c = 0, cl = op.colors.length;
            var d = data[0];
            //if (d.startTime) {
            //    t.options.startTime = new Date(d.startTime).add(14, 'd');
            //}
            //if (d.endTime) {
            //    t.options.endTime = new Date(d.endTime).add(15, 'd');
            //}
            $.each(data, function () {
                if (c >= op.visibleLineCount) {
                    this.visible = false;
                }
                this.style = $.extend({}, t.options.lineStyle, this.style);
                this.style.strokeStyle = op.colors[c % cl];
                c++;
            });
            if (op.onLoad) {
                op.onLoad.call(t, data);
            }
            t.metrics(data);
            t.element.vloading('hide');
        });
    }
});