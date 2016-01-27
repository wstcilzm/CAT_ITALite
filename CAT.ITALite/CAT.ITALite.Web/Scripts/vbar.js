(function ($) {
    var methods = {
        'default': {
            width: 'auto',
            height: 'auto',
            defaultColors: ['#7C4B75', '#5A75CF', '#43A39E', '#D29A3C', '#B194AD', '#A8A8A8'],
            caption: 'V-TopLine',
            noDataMsg: 'No Data Available',
            columns: [],//{title:"",value:"",color"",titleFormat},
            topN: 5,
            summaryTexts:[], //[{key:xxx,handler:xxx}],
            sum: 0,
            titleFormat: null
        },
        init: function (option) {
            return this.each(function () {
                var t = $(this);
                var g = $.extend({}, methods["default"], option);
                t.width(g.width).height(g.height).addClass("vbar");
                divCap = $("<div></div>").addClass("caption").text(g.caption);
                t.append(divCap);
                var legendDiv = $("<div class='vbar-legend'></div>");
                var ul = $("<ul></ul>");
                t.append($('<div>').addClass('chart').width('80%').append(legendDiv).append(ul));
                var summaryTexts = $("<div></div>").appendTo(t).addClass('vbar-summary-text');
                var legendlist = $("<ul class='vbar-legend-list'></ul>");
                var quotali = $("<li class='vbar-quota'></li>").appendTo(ul);
                var container = $("<div class='vbar-quota-container'></div>").appendTo(quotali);
                legendDiv.append(legendlist);
                g.sum = methods._sum(g.columns, 'value');
                var colIndex = 0;
                var otherWidth = 100;
                g.columns.sort(function (a, b) {
                    return methods._compare(a, b, "value", "number", "desc");
                });
                var otherValue = g.sum;
                if (g.columns == null || g.columns.length == 0) {
                    //container.append($("<div></div>").addClass("empty").text(g.noDataMsg));
                }
                else {
                    g.columns.each(function (idx) {
                        if (idx >= g.topN)
                            return false;
                        if (this.color == undefined) {
                            this.color = g.defaultColors[colIndex++];
                        }
                        var li = $("<li class='vbar-legend-list-item'/>").appendTo(legendlist);
                        var span = $("<span class='vbar-legend-lable'/>").appendTo(li);
                        var indicator = $("<span class='vbar-legend-indicator'/>").appendTo(span);
                        indicator.css("background-color", this.color);
                        var textSpan = $("<span class='vbar-legend-text'/>").appendTo(span);
                        textSpan.text(this.title);
                        var width = parseInt(this.value) / parseInt(g.sum) * 100;
                        var formatValue = this.value;
                        if (g.titleFormat) {
                            formatValue = g.titleFormat(this.value);
                        }
                        var strTitle = "{0}:{1}% {2}".format(this.title, width.toFixed(2), formatValue);
                        span.attr('title', strTitle);
                        otherWidth = otherWidth - width;
                        otherValue = otherValue - this.value;
                        if (width.toFixed(2) > 0) {
                            var div = $("<div/>").appendTo(container);
                            div.width(width + "%");
                            div.css("background-color", this.color);
                            div.text(width.toFixed(0) + "%");
                            div.attr('title', strTitle);
                        }
                    });
                }
                if (g.columns.length > g.topN)
                    methods._drawOther(g, legendlist, container, g.defaultColors[colIndex], otherWidth, "Others", otherValue);
                if (g.summaryTexts && summaryTexts.length > 0) {
                    g.summaryTexts.each(function () {
                        switch (this.toString()) {
                            case 'total count':
                                var capdiv = $("<div></div>").text('Total Count');
                                var div = $("<div></div>").text(g.sum);
                                summaryTexts.append(capdiv).append(div);
                                break;
                            
                            case 'total size':
                                var capdiv = $("<div></div>").text('Total Size');
                                var div = $("<div></div>").text(vstorm.getSizeStr(g.sum));
                                summaryTexts.append(capdiv).append(div);
                                break;
                            default: break;
                        }
                    });
                }
                t.data("vtopLin", {
                    target: t,
                    setting: g
                });
            });
        },
        _drawOther: function (g, legendlist, container, color, otherWidth, title, otherValue) {
            var li = $("<li class='vbar-legend-list-item'/>").appendTo(legendlist);
            var span = $("<span class='vbar-legend-lable'/>").appendTo(li);
            var indicator = $("<span class='vbar-legend-indicator'/>").appendTo(span);
            indicator.css("background-color", color);
            var textSpan = $("<span class='vbar-legend-text'/>").appendTo(span);
            var formatValue = otherValue;
            if (g.titleFormat) {
                formatValue = g.titleFormat(otherValue);
            }
            var strTitle = "{0}:{1}% {2}".format(title, otherWidth.toFixed(2), formatValue);
            textSpan.text(title);
            if (otherWidth.toFixed(2) > 0) {
                var div = $("<div/>").appendTo(container);
                div.width(otherWidth + "%");
                div.css("background-color", color);
                div.text(otherWidth.toFixed(0) + "%");
                div.attr('title', strTitle);
            }
            span.attr('title', strTitle);
        },
        _sum: function () {
            var data = arguments[0];
            var field = arguments[1];
            var sum = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i][field] != null) {
                    sum = parseInt(sum) + parseInt(data[i][field]);
                }
            }
            return sum;
        },
        _compare: function (a, b, filed, type, order) {
            v1 = a[filed];
            v2 = b[filed];
            switch (type) {
                case "number":
                    v1 = parseFloat(v1, 10);
                    v2 = parseFloat(v2, 10);
                    break;
                case "date":
                    v1 = new Date(v1);
                    v2 = new Date(v2);
                    break;
                case "string":
                default:
                    break;
            }
            if (order == 'asc')
                return v1 == v2 ? 0 : (v1 > v2 ? 1 : -1);
            else {
                return v1 == v2 ? 0 : (v1 > v2 ? -1 : 1);
            }
        },
        data: function () {
            var args = arguments;
            if (args.length == 0) {
                var data = $(this[0]).data('vbar');
                var result = [];
                if (data) {
                    data.setting.data.each(function () {
                        result.push(this.value);
                    });
                }
                return result;
            } else {
                return this.each(function () {
                    var $t = $(this);
                    var data = $t.data('vtopLine');

                });
            }
        },
        destroy: function () {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('vtopLine');
                if (data) {
                    $(window).unbind('.vtopLine');
                    data.panel.remove();
                    $this.removeData('.vtopLine');
                    $this.empty();
                }
            });
        }
    };
    $.fn.vbar = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vbar');
        }
    };
})(jQuery);