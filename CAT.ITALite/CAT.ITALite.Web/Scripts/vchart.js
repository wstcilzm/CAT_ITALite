(function ($) {
    var methods = {
        'default': {
            chartSizePercent: 60,
            sliceBorderWidth: 1,
            sliceBorderStyle: "#fff",
            sliceGradientColour: "#ddd",
            maxPullOutDistance: 8,
            pullOutFrameStep: 4,
            pullOutFrameInterval: 40,
            pullOutLabelPadding: 20,
            pullOutLabelValuePadding: 10,
            pullOutLabelFont: "bold 13px 'Trebuchet MS', Verdana, sans-serif",
            pullOutValueFont: "bold 11px 'Trebuchet MS', Verdana, sans-serif",
            pullOutShadowColour: "rgba( 0, 0, 0, .5 )",
            pullOutShadowOffsetX: 5,
            pullOutShadowOffsetY: 5,
            pullOutShadowBlur: 5,
            pullOutBorderWidth: 2,
            pullOutBorderStyle: "#333",
            chartStartAngle: -.5 * Math.PI,
            width: 400,
            height: 300,
            caption: 'V-Chart',
            canvas: null,
            currentPullOutSlice: -1,
            currentPullOutDistance: 0,
            totalValue: 0,
            tableTitle: { category: 'CATEGORY', value: 'VALUE' },
            canvasWidth: null,
            canvasHeight: null,
            centreX: null,
            centreY: null,
            chartRadius: null,
            showTop:5
        },
        init: function (option) {
            return this.each(function () {
                var t = $(this);
                if (t.data('vchart')) {
                    return;
                }
                var g = $.extend({}, methods["default"], option);
                t.width(g.width).height(g.height).addClass("vchart");
                t.append($("<div></div>").addClass("caption").text(g.caption));
                var dt = $("<table></table>");
                t.append(dt);
                dt.addClass("chart-data");
                var dtr = $("<tr></tr>");
                dtr.addClass("title");
                dtr.append("<th>" + g.tableTitle.category + "</th>").append("<th>" + g.tableTitle.value + "</th>");
                dt.append(dtr);
                var data = [];
                g.items.sort(function(a,b)
                {
                    if (a.value < b.value)
                        return 1;
                    if (a.value > b.value)
                        return -1;
                    return 0;
                });
                if (g.showTop && g.items.length>g.showTop)
                {                   
                    g.items.length = g.showTop;
                }
                g.data = data;
                g.totalValue = 0;
                g.items.each(function (idx) {
                    if (typeof this.value != "number") {
                        $.error("The item value can only be number format." + this.value + " is invalid.");
                    }
                    var slice = {};
                    slice.text = this.text;
                    slice.value = this.value;
                    g.totalValue += this.value;
                    if (rgb = this.color.match(/rgb\((\d+), (\d+), (\d+)/)) {
                        slice.color = [rgb[1], rgb[2], rgb[3]];
                    } else if (hex = this.color.match(/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/)) {
                        slice.color = [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
                    } else {
                        $.error("Colour could not be determined! Please specify table colours using the format '#xxxxxx'");
                        return;
                    }
                    dtr = $("<tr></tr>");
                    dtr.attr('dataIdx', idx);
                    dtr.append($("<td title='"+this.text+"'>" + this.text + "</td>").css('color', this.color));
                    dtr.append($("<td>" + this.value + "</td>").css('color', this.color));
                    dt.append(dtr);
                    if (this.current) {
                        g.currentPullOutSlice = slice;
                        g.currentPullOutDistance = g.maxPullOutDistance - 1;
                        dtr.attr('vselected', 'true').siblings().attr('vselected', 'false');
                    }
                    dtr.click(methods._rowClickHandle);
                    data.push(slice);
                });

                methods._calcAngle(g);
                dtr = $("<tr></tr>").addClass("foot");
                dtr.append($("<td>TOTAL</td>"));
                dtr.append($("<td>" + g.totalValue + "</td>"));
                dt.append(dtr);
                var canvas = document.createElement("canvas");
                g.canvas = canvas;
                if (!g.canvasWidth) {
                    g.canvasWidth = t.width() - dt.width();
                }
                if (!g.canvasHeight) {
                    g.canvasHeight = t.height() - t.find(".caption").height();
                }
                canvas.width = g.canvasWidth;
                canvas.height = g.canvasHeight;
                t.append(canvas);
                if (typeof canvas.getContext === 'undefined') return;
                g.centreX = g.canvasWidth / 2;
                g.centreY = g.canvasHeight / 2;
                g.chartRadius = Math.min(g.canvasWidth, g.canvasHeight) / 2 * (g.chartSizePercent / 100);
                g.target = t;
                t.data("vchart", {
                    target: t,
                    setting: g
                });
                $(canvas).click(methods._chartClickHandle);
                methods.draw.call(t);
            });
        },
        data: function () {
            var args = arguments;
            if (args.length == 0) {
                var data = $(this[0]).data('vchart');
                var result = [];
                if (data) {
                    data.setting.data.each(function () {
                        result.push(this.value);
                    });
                }
                return result;
            } else {
                if ($.isArray(args[0])) {
                    args = args[0];
                }
                return this.each(function () {
                    var $t = $(this);
                    var tb = $t.find('.chart-data');
                    var data = $t.data('vchart');
                    var total = 0;
                    if (data) {
                        data.setting.data.each(function (idx) {
                            if (typeof args[idx] == 'number') {
                                //set value, if great than zero.
                                this.value = args[idx] > 0 ? args[idx] : 0;
                                tb.find('tr[dataIdx="' + idx + '"]').children().last().text(this.value);
                            } else {
                                $.error('Value can only be number type.');
                            }
                            total += this.value;
                        });
                    }
                    total = Math.round(total * 100) / 100;
                    data.setting.totalValue = total;
                    tb.find('.foot').children().last().text(total);
                    methods._calcAngle(data.setting);
                    methods.draw.call($t);
                });
            }
        },
        destroy: function () {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('vchart');
                if (data) {
                    $(window).unbind('.vchart');
                    data.panel.remove();
                    $this.removeData('vchart');
                    $this.empty();
                }
            });
        },
        draw: function () {
            return this.each(function () {
                var data = $(this).data('vchart');
                if (data) {
                    var g = data.setting;
                    var context = g.canvas.getContext('2d');
                    context.clearRect(0, 0, g.canvasWidth, g.canvasHeight);
                    g.data.each(function () {
                        if (this != g.currentPullOutDistance) {
                            methods._drawSlice(context, g, this);
                        }
                    });
                    if (g.currentPullOutSlice != -1) {
                        methods._drawSlice(context, g, g.currentPullOutSlice);
                        $(this).find('.chart-data tr[dataIdx="' + g.data.indexOf(g.currentPullOutSlice) + '"]').attr('vselected', 'true').siblings().attr('vselected', 'false');
                    } else {
                        $(this).find('.chart-data tr').attr('vselected', 'false');
                    }
                }
            });
        },
        caption: function (value) {
            if (!value) {
                return this.find('div.caption').text();
            } else {
                return this.each(function () {
                    $(this).find('div.caption').text(value);
                });
            }
        },
        tableTitle: function (value) {
            if (!value) {
                var ths = this.find('.chart-data');
                var obj = { category: ths.find('th:first').text() };
                obj.value = ths.find('th:eq(1)').text();
                return obj;
            } else {
                return this.each(function () {
                    $(this).find('.chart-data').find('th').each(function (idx) {
                        if (idx == 0) {
                            $(this).text(value.category);
                        } else if (idx == 1) {
                            $(this).text(value.value);
                        }
                    });
                });
            }
        },
        _calcAngle: function (g) {
            var currentPos = 0;
            g.data.each(function () {
                this.startAngle = 2 * Math.PI * currentPos;
                this.endAngle = 2 * Math.PI * (currentPos + this.value / g.totalValue);
                currentPos += this.value / g.totalValue;
            });
        },
        _rowClickHandle: function (ev) {
            ev.stopPropagation();
            var $t = $(this);

            var div = $t.parentsUntil('.vchart').parent();
            var data = div.data('vchart');
            if (data) {
                var g = data.setting;
                var dataIdx = $t.attr("dataIdx");
                var slice = g.data[dataIdx];
                if ($t.attr('vselected') == "true") {
                    $t.attr("vselected", "false");
                } else {
                    $t.attr("vselected", "true");
                }
                $t.siblings().attr("vselected", "false");
                methods._toggleSlice(g, slice);
            }
        },
        _chartClickHandle: function (ev) {
            var offset = $(this).offset();
            var mouseX = ev.pageX - offset.left;
            var mouseY = ev.pageY - offset.top;
            var data = $(this).parent().data('vchart');
            var g = data.setting;
            var xFromCentre = mouseX - g.centreX;
            var yFromCentre = mouseY - g.centreY;
            var distanceFromCentre = Math.sqrt(Math.pow(Math.abs(xFromCentre), 2) + Math.pow(Math.abs(yFromCentre), 2));
            if (distanceFromCentre <= g.chartRadius) {
                var clickAngle = Math.atan2(yFromCentre, xFromCentre) - g.chartStartAngle;
                if (clickAngle < 0) clickAngle = 2 * Math.PI + clickAngle;
                var slice = g.data.find(function (v) { return clickAngle >= v.startAngle && clickAngle <= v.endAngle; });
                if (slice) {
                    methods._toggleSlice(g, slice);
                }
            }
            else {
                methods._pushIn(g);
            }
        },
        _toggleSlice: function (g, slice) {
            if (slice == g.currentPullOutSlice) {
                methods._pushIn(g);
            } else {
                methods._pullOut(g, slice);
            }
        },
        _pushIn: function (g) {
            g.currentPullOutSlice = -1;
            g.currentPullOutDistance = 0;
            methods.draw.call(g.target);
        },
        _pullOut: function (g, slice) {
            if (g.currentPullOutSlice == slice) {
                return;
            }
            g.currentPullOutSlice = slice;
            g.currentPullOutDistance = 0;
            methods._animatePullOut(g);
        },
        _animatePullOut: function (g) {
            g.currentPullOutDistance += g.pullOutFrameStep;
            if (g.currentPullOutDistance >= g.maxPullOutDistance) {
                return;
            }
            methods.draw.call(g.target);
            setTimeout(methods._animatePullOut, g.pullOutFrameInterval, g);
        },
        _easeOut: function (ratio, power) {
            return (Math.pow(1 - ratio, power) + 1);
        },
        _drawSlice: function (context, g, slice) {
            var startAngle = slice.startAngle + g.chartStartAngle;
            var endAngle = slice.endAngle + g.chartStartAngle;

            var sliceGradient = context.createLinearGradient(0, 0, g.canvasWidth * .75, g.canvasHeight * .75);
            sliceGradient.addColorStop(0, g.sliceGradientColour);
            sliceGradient.addColorStop(1, 'rgb(' + slice.color.join(',') + ')');
            if (slice == g.currentPullOutSlice) {
                var midAngle = (startAngle + endAngle) / 2;
                var actualPullOutDistance = g.currentPullOutDistance * methods._easeOut(g.currentPullOutDistance / g.maxPullOutDistance, .8);
                var startX = g.centreX + Math.cos(midAngle) * actualPullOutDistance;
                var startY = g.centreY + Math.sin(midAngle) * actualPullOutDistance;
                context.shadowOffsetX = g.pullOutShadowOffsetX;
                context.shadowOffsetY = g.pullOutShadowOffsetY;
                context.shadowBlur = g.pullOutShadowBlur;
            } else {
                startX = g.centreX;
                startY = g.centreY;
            }
            context.beginPath();
            context.moveTo(startX, startY);
            context.arc(startX, startY, g.chartRadius, startAngle, endAngle, false);
            context.lineTo(startX, startY);
            context.closePath();
            context.fillStyle = sliceGradient;
            context.shadowColor = (slice == g.currentPullOutSlice) ? g.pullOutShadowColour : "rgba( 0, 0, 0, 0 )";
            context.fill();
            context.shadowColor = "rgba( 0, 0, 0, 0 )";

            if (slice == g.currentPullOutSlice) {
                context.lineWidth = g.pullOutBorderWidth;
                context.strokeStyle = g.pullOutBorderStyle;
            } else {
                context.lineWidth = g.sliceBorderWidth;
                context.strokeStyle = g.sliceBorderStyle;
            }
            context.stroke();

            if (slice == g.currentPullOutSlice) {
                var fontColor = [];
                for (var idx = 0; idx < slice.color.length; idx++) {
                    fontColor.push(slice.color[idx] < 50 ? 0 : slice.color[idx] - 50);
                }
                context.lineWidth = 0.3;
                context.fillStyle = 'rgb(' + fontColor.join(',') + ')';
                context.textAlign = "center";
                context.font = g.pullOutLabelFont;
                context.fillText(slice.text, g.centreX + Math.cos(midAngle) * (g.chartRadius + g.maxPullOutDistance + g.pullOutLabelPadding), g.centreY + Math.sin(midAngle) * (g.chartRadius + g.maxPullOutDistance + g.pullOutLabelPadding));
                context.font = g.pullOutValueFont;
                context.fillText(slice.value + " (" + (parseInt(slice.value / g.totalValue * 100 + .5)) + "%)", g.centreX + Math.cos(midAngle) * (g.chartRadius + g.maxPullOutDistance + g.pullOutLabelPadding), g.centreY + Math.sin(midAngle) * (g.chartRadius + g.maxPullOutDistance + g.pullOutLabelPadding) + g.pullOutLabelValuePadding);
            }
        }
    };
    $.fn.vchart = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vchart');
        }
    };
})(jQuery);