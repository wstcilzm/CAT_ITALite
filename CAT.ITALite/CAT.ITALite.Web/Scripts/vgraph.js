(function ($) {
    var methods = {
        'default': {
            labels: [],
            values: [[], []],
            lineColor: [],
            legend: [],
            lineWidth: 1,
            width: 400,
            height: 400,
            source: null,
            timmer: 10000,
            axis: { yPos: 'left', xPos: 'bottom', color: '#707070', xTick: false, xTickMarks: false, yTick: true, yTickMarks: true, xSteps: 1, ySteps: 5 },
            showGridLines: false,
            xLins: 20,//the count of x lins
            yLins: 10,//the count of y lins.
            fillRange: true,
            maxY: null,
            fillRangeAlpha: '0.3',
            shadowOffset: 20,
            shadowBlur: 50,
            showLabel: false,
            gutter: { top: 25, right: 25, bottom: 25, left: 25 },
            padding: { top: 30, right: 35, bottom: 0, left: 0 },
            caption: 'V-Line',
            pointer: { width: 6, height: 10 },
            indicator: true,
            indicatorCaptionFont: "bold 13px 'Trebuchet MS', Verdana, sans-serif",
            indicatorValueFont: "bold 13px 'Trebuchet MS', Verdana, sans-serif"
        },
        init: function (option) {
            return this.each(function () {
                var g = $.extend({}, methods["default"], option);
                methods._standardOption(g);
                var t = $(this);
                t.width(g.width).height(g.height).addClass("vline");
                t.append($("<div></div>").addClass("caption").text(g.caption));
                var canvas = document.createElement("canvas");
                g.canvas = canvas;
                var indicator = $("<div></div>").addClass('indicator');
                indicator.append("<div class='title'>Average</div>");
                indicator.append("<div class='value'></div>");
                t.append(indicator);
                canvas.width = g.width;
                canvas.height = g.height - t.find('.caption').outerHeight(true);
                $(canvas).mousemove(function (ev) { methods._mouseMove(ev, g); }).hover(function () {
                }, function (ev) { methods._mouseOver(ev, g); });
                t.append(canvas);
                if (typeof canvas.getContext === 'undefined') return;
                g.target = t;
                t.data("vline", {
                    target: t,
                    setting: g
                });
            });
        },
        destroy: function () {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vline');
                if (data) {
                    $(window).unbind('.vline');
                    data.panel.remove();
                    t.removeData('vline');
                    t.empty();
                }
            });
        },
        value: function (v) {
            if (typeof v == 'undefined') {
                return this.data('vline').setting.values;
            } else {
                return this.each(function () {
                    methods._values(v, g);
                });
            }
        },
        _values: function (v, g) {
            if ($.isArray(v)) {
                if (v.length > 0 && $.isArray(v[0])) {
                    g.values = v;
                } else {
                    g.values = [];
                    g.values.push(v);
                }
            }
        },
        _standardOption: function (g) {
            for (var prop in g) {
                if (prop.contains('.')) {
                    var strs = prop.split('.');
                    g[strs[0]][strs[1]] = g[prop];
                }
            }
        },
        _calcColor: function (color, alpha) {
            if (rgb = color.match(/rgb\((\d+), (\d+), (\d+)/)) {
                return 'rgba({0},{1},{2}{3})'.format(rgb[1], rgb[2], rgb[3], alpha ? "," + alpha : "");
            } else if (hex = color.match(/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/)) {
                return 'rgba({0},{1},{2}{3})'.format(parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16), alpha ? "," + alpha : "");
            } else {
                return color;
            }
        },
        _calcCoord: function (g) {
            var coord = {};
            var axis = g.axis;
            var graphHeight = g.canvas.height - g.gutter.top - g.gutter.bottom;
            var graphWidth = g.canvas.width - g.gutter.left - g.gutter.right;
            // Draw the X axis
            var xPos = yPos = 0;
            if (axis.xPos != 'none') {
                if (axis.xPos == 'top') {
                    yPos = g.gutter.top;
                } else if (axis.xPos == 'center') {
                    yPos = g.gutter.top + Math.floor(graphHeight / 2);
                } else {//default bottom.
                    yPos = g.gutter.top + graphHeight;
                }
                coord.zeroPointY = yPos;
            }
            if (axis.yPos != 'none') {
                if (axis.yPos == 'right') {
                    xPos = g.gutter.left + graphWidth;
                } else if (axis.yPos == 'center') {
                    xPos = g.gutter.left + Math.floor(graphWidth / 2);
                } else {//default - left.
                    xPos = g.gutter.left;
                }
                coord.zeroPointX = xPos;
            }
            coord.width = graphWidth;
            coord.height = graphHeight;
            coord.startX = g.gutter.left;
            coord.startY = g.gutter.top;
            coord.valueHeight = graphHeight - g.padding.top - g.padding.bottom;
            coord.valueWidth = graphWidth - g.padding.left - g.padding.right;
            g.coord = coord;
        },
        _drawGridLines: function (context, g) {
            if (!g.coord) {
                methods._calcCoord(g);
            }
            var coord = g.coord;
            var increment = coord.width / (g.xLins - 1), start = 0;
            context.beginPath();
            context.strokeStyle = "#D9EAF4";
            context.lineWidth = 1;
            for (var idx = 0; idx < g.xLins; idx++) {
                start = coord.startX + idx * increment;
                context.moveTo(start, coord.startY);
                context.lineTo(start, coord.startY + coord.height);
            }
            increment = coord.height / (g.yLins - 1);
            for (var idx = 0; idx < g.xLins; idx++) {
                start = coord.startY + idx * increment;
                context.moveTo(coord.startX, start);
                context.lineTo(coord.startX + coord.width, start);
            }
            context.stroke();
        },
        _drawLegend: function (context, g) {
            if (g.legend && g.legend.length > 0) {

            }
        },
        _maxY: function (g) {
            var maxY = g.maxY;
            if (!maxY) {
                maxY = 0;
                $.each(g.values, function () {
                    var max = this.max();
                    if (maxY < max) {
                        maxY = max;
                    }
                });
            }
            return maxY.valueOf();
        },
        _drawLine: function (context, lineData, lineColor, g) {
            if (!g.coord) {
                methods._calcCoord(g);
            }
            var coord = g.coord;
            var maxY = methods._maxY(g), maxHeight = coord.valueHeight;
            if (maxY <= 0) {
                return;
            }
            var xInterval = (coord.valueWidth) / (lineData.length - 1);
            var maxHeight = coord.valueHeight;
            var yPos, xPos, len = lineData.length, lineCoors = [];
            for (var idx = 0; idx < len; idx++) {
                var lineValue = lineData[idx];
                //todo: check this logic.
                if (isNaN(lineValue)) {
                    return;
                }
                yPos = lineValue / maxY * maxHeight + g.padding.bottom;
                xPos = idx * xInterval + g.padding.left;
                lineCoors.push({ x: xPos, y: yPos });
            }
            context.save();
            context.translate(g.coord.zeroPointX, g.coord.zeroPointY);
            context.scale(1, -1);
            context.beginPath();
            context.lineWidth = g.lineWidth;
            context.lineJoin = "round";
            context.strokeStyle = lineColor;
            context.shadow
            context.moveTo(lineCoors[0].x, lineCoors[0].y);
            for (var idx = 1; idx < len; idx++) {
                context.lineTo(lineCoors[idx].x, lineCoors[idx].y);
            }
            context.stroke();
            if (g.fillRange) {
                context.fillStyle = methods._calcColor(lineColor, g.fillRangeAlpha);
                context.lineTo(lineCoors[len - 1].x, 0);
                context.lineTo(0, 0);
                context.closePath();
                context.fill();
            }
            context.restore();
        },
        _calcStep: function (maxValue, steps) {
            var v = maxValue / steps;
            if (v < 8) {
                v = Math.min(5, Math.floor(v));
            } else {
                v = Math.floor(v / 5) * 5;
            }
            if (v <= 0) {
                v = 1;
            }
            return v;
        },
        _drawAxis: function (context, g) {
            if (!g.axis) {
                return;
            }
            if (!g.coord) {
                methods._calcCoord(g);
            }
            var coord = g.coord;
            var axis = g.axis;
            context.lineWidth = 1;
            context.lineCap = 'butt';
            context.strokeStyle = axis.color;
            context.font = "11pt Calibri";
            context.fillStyle = axis.color;
            context.textAlign = "center";
            context.beginPath();
            context.moveTo(coord.startX, coord.zeroPointY);
            context.lineTo(coord.startX + coord.width, coord.zeroPointY);
            context.moveTo(coord.zeroPointX, coord.startY);
            context.lineTo(coord.zeroPointX, coord.startY + coord.height);
            var increment = 5;
            var interval = 0, idx = 0;
            if (axis.xTick) {
                idx = 0;
                var count = g.values.length > 0 ? g.values[0].length : g.labels.length;
                interval = coord.valueWidth / (count - 1);
                var width = coord.startX + coord.width + 1;
                for (var x = coord.startX; x <= width ; x += interval) {
                    context.moveTo(x, coord.zeroPointY);
                    context.lineTo(x, coord.zeroPointY + increment);
                    if (axis.xTickMarks) {
                        context.fillText(g.labels[idx], x, coord.zeroPointY + increment * 3);
                        idx++;
                    }
                }
            }
            if (axis.yTick) {
                var maxY = methods._maxY(g), maxHeight = coord.valueHeight;
                if (maxY > 0) {
                    var yStep = methods._calcStep(maxY, axis.ySteps);
                    interval = yStep / maxY * coord.valueHeight;
                    idx = 0;
                    for (var y = coord.startY + coord.height; y > coord.startY ; y -= interval) {
                        context.moveTo(coord.zeroPointX, y);
                        context.lineTo(coord.zeroPointX - increment, y);
                        if (axis.yTickMarks) {
                            context.fillText(idx * yStep, coord.zeroPointX - increment * 3, y + increment);
                            idx++;
                        }
                    }
                }
            }
            context.stroke();
        },
        _drawPointer: function (context, x, y, color, g) {
            var p = g.pointer;
            context.save();
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x - p.width / 2, y - p.height);
            context.lineTo(x + p.width / 2, y - p.height);
            context.closePath();
            context.fill();
            context.restore();
        },
        _showIndicator: function (rIdx, cIdx, g) {
            var title = 'Average';
            if (cIdx > 0) {
                title = g.labels[cIdx] ? g.labels[cIdx] : cIdx;
            }
            var d, v, indPnl = g.target.find('.indicator');
            indPnl.find('.title').text(title);
            if (cIdx < 0) {
                d = Math.round(g.values[rIdx].sum() / g.values[rIdx].length * 100) / 100;
            } else {
                d = Math.round(g.values[rIdx][cIdx] * 100) / 100;
            }
            v = indPnl.children('.value:eq(' + rIdx + ')');
            if (v.length == 0) {
                v = $("<div class='value'></div>").appendTo(indPnl);
            }
            v.css('color', g.lineColor[rIdx]);
            v.text(d);
        },
        _mouseOver: function (ev, g) {
            if (g.imageData) {
                g.canvas.getContext('2d').putImageData(g.imageData, 0, 0);
            }
            $.each(g.values, function (idx) {
                methods._showIndicator(idx, -1, g);
            });
        },
        _mouseMove: function (ev, g) {
            var coord = g.coord;
            var offset = $(g.canvas).offset();
            var mouseX = ev.pageX - offset.left;
            var maxY = methods._maxY(g);
            if (maxY <= 0) {
                return;
            }
            var context = g.canvas.getContext('2d');
            if (!g.imageData) {
                g.imageData = context.getImageData(0, 0, g.canvas.width, g.canvas.height);
            } else {
                context.putImageData(g.imageData, 0, 0);
            }
            $.each(g.values, function (dIdx) {
                var xInterval = coord.valueWidth / (this.length - 1);
                if (mouseX > coord.startX && mouseX < coord.startX + coord.valueWidth) {
                    var idx = Math.round((mouseX - coord.startX) / xInterval);
                    var lineValue = this[idx];
                    var yPos = coord.zeroPointY - lineValue / maxY * coord.valueHeight;
                    var xPos = coord.zeroPointX + idx * xInterval;
                    methods._drawPointer(context, xPos, yPos, g.lineColor[dIdx], g);
                    methods._showIndicator(dIdx, idx, g);
                } else {
                    methods._showIndicator(dIdx, -1, g);
                }
            });
        },
        option: function (name, value) {
            if (!value) {
                return this.data('vline').setting[name];
            } else {
                return this.each(function () {
                    var g = $(this).data('vline').setting;
                    if (name.contains('.')) {
                        var strs = name.split('.');
                        g[strs[0]][strs[1]] = value;
                    } else {
                        g[name] = value;
                    }
                });
            }
        },
        draw: function (v) {
            return this.each(function () {
                var data = $(this).data('vline');
                if (data) {
                    var g = data.setting;
                    g.imageData = null;
                    methods._values(v, g);
                    var context = g.canvas.getContext('2d');
                    context.clearRect(0, 0, g.canvas.width, g.canvas.height);
                    methods._drawGridLines(context, g);

                    g.values.each(function (idx) {
                        methods._drawLine(context, this, g.lineColor[idx], g);
                        methods._showIndicator(idx, -1, g);
                    });
                    methods._drawAxis(context, g);
                }
            });
        },
        caption: function (value) {
            return this.find('div.caption').text(value);
        }
    };
    $.fn.vline = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vline');
        }
    };
})(jQuery);