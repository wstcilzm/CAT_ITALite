(function ($) {
    var methods = {
        'default': {
            width: 600,
            height: 300,
            defaultColors: ['rgb(90, 117, 207)', 'rgb(95, 154, 38)', 'rgb(124, 75, 117)', 'rgb(210, 154, 60)', 'rgb(177, 148, 173)', '#dfdfdf'],
            caption: 'Histogram',
            noDataMsg: 'No Data Available',
            columns: [],//{title:"",value:"",color""},
            topN: 5,
            max: 0,
            colWidth:null,
            colSpacing: null,
            xSpacing: 30,
            ySpacing:30,
            startX:30,
            lineWidth: 1,
            canvasWidth: null,
            canvasHeight: null,
            canvas: null,
            ySteps: 5,
            rectPos:[],
            backgroundColor: "rgb(252, 247, 247)"
        },
        init: function (option) {
            return this.each(function () {
                var t = $(this);
                var g = $.extend({}, methods["default"], option);
                t.width(g.width).height(g.height).addClass("vhistogram");
                t.css('margin-left', '5px').css('margin-bottom', '5px').css('margin-top', '5px').css('background-color', g.backgroundColor);
                var caption = $("<div></div>").addClass("vhistogram-caption").text(g.caption).width(g.width).css('text-align','center');
                t.append(caption);                
                var canvas = document.createElement("canvas");
                g.canvasHeight = g.height - caption.height()-g.ySpacing;
                g.canvasWidth = g.width - g.xSpacing;
                t.append(canvas);
                g.canvas=canvas;
                canvas.width = g.canvasWidth;
                canvas.height = g.canvasHeight;
                if (g.colWidth == null) {
                    g.colWidth = (g.canvasWidth - g.startX) / g.columns.length * 0.4;
                    g.colSpacing = (g.canvasWidth - g.startX) / g.columns.length * 0.6;
                }
                //g.columns.sort(function (a, b) {
                //    return methods._compare(a, b, "value", "number", "desc");
                //});
                //g.columns.length = g.topN;
                g.columns.each(function ()
                {
                    var v = parseInt(this.value);
                    if (v > g.max)
                        g.max = v;
                });
                methods._drawXY(g);
                methods.draw(g);
                //$('canvas').mousemove(function (ev) {
                //    var offset = $(this).offset();
                //    var x = Math.floor(offset.left), y = Math.floor(offset.top);
                //    methods._showHint(x, y,g);
                //}).mouseout(function () {
                //    methods._clearHint();
                //})                
                t.data("vhistogram", {
                    target: t,
                    setting: g
                });
            });
        },
        //_clearHint: function () {
        //   $(this).find('.vhistogram-hint').remove();
        //},
        //_showHint: function (x,y,g) {
        //    var len = g.rectPos.length;
        //    for (var idx = 0; idx < len; idx++) {
        //        var p = { x: Math.floor(g.rectPos[idx].x), y: Math.floor(g.rectPos[idx].y), w: Math.floor(g.rectPos[idx].w), h: Math.floor(g.rectPos[idx].h) };
        //        if (x >=p.x  && x <= p.x + p.w && y <= p.y && y >= p.y - p.h) {
        //            var hint = $('<div class="vhistogram-hint"/>').html(g.columns[idx].value);
        //            $('.vhistogram').append(hint);
        //            return;
        //        }
        //    }
        //    this._clearHint();
        //},
        _drawXY:function(g)
        {
            var ctx = methods._getCanvasContext(g);
            ctx.lineWidth = 1;
            ctx.fillStyle = "gray";
            var xIdent = 10;
            ctx.moveTo(g.xSpacing, 5);
            ctx.lineTo(g.xSpacing, g.canvasHeight-g.ySpacing);
            ctx.lineTo(g.canvasWidth, g.canvasHeight - g.ySpacing);
            var increment = 5;
            var interval = 0, idx = 0;
            var maxY = g.max, maxHeight = g.canvasHeight - g.ySpacing;
            if (maxY > 0) {
                var yStep = methods._calcStep(maxY, g.ySteps);
                interval = yStep / maxY * maxHeight;
                idx = 0;
                for (var y = g.canvasHeight - g.ySpacing; y > 0 ; y -= interval) {
                    if (idx == 0) {
                        ctx.moveTo(g.xSpacing - increment, y);
                        ctx.lineTo(g.canvasWidth, y);
                        ctx.fillText(idx * yStep, g.xSpacing - increment * 3, y + increment);
                    }
                    else {
                        ctx.moveTo(g.xSpacing - increment, y + 5);
                        ctx.lineTo(g.canvasWidth, y + 5);
                        ctx.fillText(idx * yStep, g.xSpacing - increment * 5, y + increment + 5);
                    }
                    idx++;
                }
            }
            ctx.moveTo(g.canvasWidth, g.canvasHeight - g.ySpacing);
            ctx.lineTo(g.canvasWidth, increment);
            ctx.stroke();
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
        draw:function(g)
        {
            var colIndex = 0;
            var ctx = methods._getCanvasContext(g);
            g.columns.each(function (idx) {
                if (this.color == undefined) {
                    this.color = g.defaultColors[colIndex++];
                }
                var x, y, w, h;
                var height = g.canvasHeight - 5-g.ySpacing;
                h = height * parseInt(this.value) / parseInt(g.max);
                y = g.canvasHeight - h - g.lineWidth-g.ySpacing+1;
                x = g.startX + g.colSpacing * idx+g.xSpacing;
                w = g.colWidth;
                ctx.fillStyle = this.color;
                ctx.lineWidth = g.lineWidth;
                ctx.fillRect(x, y, w, h);
                var rect = {};
                rect.x = x;
                rect.y = y;
                rect.w = w;
                rect.h = h;
                g.rectPos.push(rect);
                ctx.fillText(this.title, x, g.canvasHeight-10);
            });
        },
        _getCanvasContext:function(g)
        {
            if (g.canvas.getContext) { 
                ctx = g.canvas.getContext("2d"); 
                return ctx;
            }
            return null;
        },
        _sum: function () {
            var data = arguments[0];
            var field = arguments[1];
            var sum = 0;
            for (var i = 0; i < data.length; i++) {
                sum = parseInt(sum) + parseInt(data[i][field]);
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
                var data = $(this[0]).data('vhistogram');
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
    $.fn.vhistogram = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vhistogram');
        }
    };
})(jQuery);