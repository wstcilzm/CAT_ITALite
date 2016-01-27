//vmenu plugin
(function ($) {
    var methods = {
        'default': {
            items: []
        },
        init: function (option) {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vmenu');
                if (!data) {
                    var g = $.extend({}, methods["default"], option);
                    t.empty().addClass("menu");
                    if (g.items.constructor == Array) {
                        g.items.each(function () {
                            var i = this;
                            var m = $("<div></div>").addClass("menu-item");
                            if (!i.url) {
                                i.url = '';
                            }
                            m.attr('url', i.url);
                            m.append($("<div class='menu-icon'></div>").addClass(i.icon));
                            m.append($("<div class='menu-caption'></div>").text(i.caption));
                            var count = $("<div class='menu-count'></div>");
                            if (i.CountUrl) {
                                count.addClass('count-loading');
                                $.getJSON(i.CountUrl, {}, function (data) {
                                    count.removeClass('count-loading');
                                    if (data.Type == 'success') {
                                        count.text(data.Message);
                                    } else {
                                        count.text('N/A');
                                    }
                                });
                                count.attr('countName', i.CountUrl);
                            }
                            m.append(count);
                            m.appendTo(t);
                            if (self.location.pathname.startWith("/" + i.url.replace(/\W*((\w*\W*)*)/g, '$1'))) {
                                m.addClass("menu-item-selected");
                            } else if (self.location.pathname == "/" && i["default"]) {
                                m.addClass('menu-item-selected');
                            }
                            m.click(function () {
                                m.addClass("menu-item-selected").siblings().removeClass("menu-item-selected");
                                if (i.click) {
                                    i.click(m);
                                }
                                if (m.attr('url')) {
                                    window.location = m.attr('Url');
                                }
                            });
                        });
                    }
                    t.data('vmenu', {
                        setting: g
                    });
                }

            });
        },
        destroy: function () {
            return this.each(function() {
                var t = $(this);
                var data = t.data('vmenu');
                if (data) {
                    t.empty().removeData('vmenu');
                    $(window).unbind('.vmenu');
                }
            });
        }
    };
    $.fn.vmenu = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            // Default to "init"
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vmenu');
        }
    };

})(jQuery);
//vwizard plugin.
(function ($) {
    ////todo: add 'on' on event.
    var methods = {
        'default': {
            width: 500,
            height: 500,
            ancorWidth: 30,
            showNavButtons: true,
            showCloseButton: true,
            sideBarColors: ['#53B8E1', '#399EC8', '#4F9DD7', '#1E83AE'],
            change: null,//event 
            beforeChange: null,
            destroy: null,//event
            destroyOnClose: true,
            finish: null,//event
            timmer: 200,
            position: 'center',//center|top|bottom|{top:100,left:100}
            fixPosition: true,
            autoOpen: false,
            onCreate: null,
            onOpen: null,
            onClose: null
        },
        init: function (options) {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vwizard');
                if (!data) {
                    var g = $.extend({}, methods["default"], options);
                    var wizard = $("<div class='vwizard'></div>");
                    var content = $("<div class='content'></div>");
                    var ancorLeft = $("<div class='ancor ancor-left'></div>");
                    var ancorRight = $("<div class='ancor ancor-right'></div>");
                    wizard.appendTo(t.parent());
                    wizard.append(ancorLeft).append(content).append(ancorRight);
                    if (g.showCloseButton) {
                        var close = $("<div class='close' title='close'></div>");
                        content.append(close);
                        close.click(function (ev) { t.vwizard('close'); });
                    }
                    content.append(t);
                    t.addClass('pages');
                    g.disevent = true;
                    content.width(g.width);
                    content.height(g.height);
                    ancorLeft.height(g.height);
                    ancorRight.height(g.height);
                    var ps = t.children('div');
                    if (ps.length == 1) {
                        //only one step, add border.
                        content.css({ border: '8px solid gray', 'border-radius': '4px' });
                        ancorLeft.hide();
                        ancorRight.hide();
                    }
                    var awidth = g.ancorWidth * ps.length;
                    ancorLeft.width(awidth);
                    ancorRight.width(awidth);
                    ancorRight.css('left', awidth + g.width + "px");
                    content.css("left", awidth + "px");
                    if (g.showNavButtons) {
                        var buttons = $("<div class='buttons'></div>");
                        buttons.append("<div class='button prev' title='Prev'></div>");
                        buttons.append("<div class='button next' title='Next'></div>");
                        buttons.append("<div class='button finished' title='Finished'></div>");
                        content.append(buttons);
                        buttons.find('.next').click(function (ev) { t.vwizard('next'); });
                        buttons.find('.prev').click(function (ev) { t.vwizard('prev'); });
                        buttons.find('.finished').click(function (ev) { t.vwizard('finished'); });
                    }
                    var pheight = g.height;
                    if (g.showNavButtons) {
                        pheight -= 100;
                    }
                    ps.each(function (idx) {
                        var $p = $(this);
                        $p.addClass('Page')
                            .width(g.width)
                            .height(pheight);
                        var bclen = g.sideBarColors.length;
                        var bar = $("<div></div>");
                        bar.addClass('bar')
                            .css('background-color', g.sideBarColors[idx % bclen])
                            .append($("<span><span>").text(idx + 1));
                        if (idx == 0) {
                            ancorLeft.append(bar);
                        } else {
                            ancorRight.append(bar);
                        }
                    });
                    var shield = $('<div></div>');
                    if ($.browser.msie) {
                        shield = $('<iframe frameborder="0" scrolling="no" src="#"></iframe>');
                    }
                    shield.addClass('vwizard-shield');
                    $('body').append(shield).append(wizard);
                    t.data('vwizard', {
                        shield: shield,
                        wizard: wizard,
                        target: t,
                        setting: g
                    });
                    $(window).bind('resize.vwizard', function () {
                        if (g.fixPosition) {
                            methods.position.call(t, g.position);
                        }
                    });
                    if (g.autoOpen) {
                        methods.open.call(t);
                    } else {
                        methods.close.call(t, false);
                    }
                    if (g.onCreate) {
                        g.onCreate.call(t);
                    }
                    g.disevent = false;
                }
            });
        },
        destroy: function (option) {
            return this.each(function() {
                var t = $(this);
                var data = t.data('vwizard');
                if (data) {
                    t.find('input[type="text"],input[type="password"],select').vvalidate('destroy');
                    t.find('.vgrid').vgrid('destroy');
                    if (data.setting.destroy) {
                        data.setting.destroy.call(t);
                    }
                    var vw = data.wizard;
                    $(window).unbind('.vwizard');
                    t.removeData('vwizard');
                    data.shield.remove();
                    vw.empty().remove();
                }
            });
        },
        position: function (v) {
            if (typeof (v) == 'undefined') {
                return this.data('vwizard').wizard.position();
            } else {
                return this.each(function () {
                    var wizard = $(this).data('vwizard').wizard;
                    var winWidth = $(window).width(), width = wizard.width() + wizard.find('.ancor').width();
                    var left = 0, top = 0;
                    if (typeof (v) == 'string') {
                        switch (v.toLowerCase()) {
                            case 'top':
                                left = (winWidth - width) / 2;
                                break;
                            case 'left':
                                top = (winWidth - width) / 2;
                                break;
                            case 'center':
                                left = (winWidth - width) / 2;
                                top = ($(window).height() - wizard.height()) / 2;
                                break;
                            default:
                                $.error('{0} is not a valid position of wizard.'.format(v));
                                return;
                        }
                    } else {
                        if (v.left && v.left > 0) {
                            left = v.left;
                        }
                        if (v.top && v.top > 0) {
                            v.top = top;
                        }
                    }
                    wizard.css({ left: left, top: top });
                });
            }
        },
        current: function () {
            return this.children(":visible");
        },
        _showPage: function (selector, timmer, disevent) {
            return this.each(function () {
                var $t = $(this);
                var data = $t.data('vwizard');
                var g = data.setting;
                var curr = methods.current.call($t);
                var cidx = curr.index();
                var target = $t.children(":" + selector);
                var tidx = target.index();
                if (!g.disevent) {
                    if (g.beforeChange) {
                        if (g.beforeChange.call($t, cidx, tidx) === false) {
                            return;
                        }
                    }
                    if (tidx > cidx && g.onClickNext) {
                        if (g.onClickNext.call($t, cidx, tidx) === false) {
                            return;
                        }
                    }
                }
                methods.hideButtons.call($t);
                var $tp = $t.parent();
                if (!timmer && timmer != 0) {
                    timmer = g.timmer;
                }
                var lancor = $tp.siblings(".ancor-left");
                var rancor = $tp.siblings(".ancor-right");
                var bars = $tp.parent().find('.bar');
                bars.each(function (idx) {
                    if (idx <= tidx) {
                        lancor.append(this);
                    } else {
                        rancor.append(this);
                    }
                });
                var widx = tidx + 1;
                if (tidx > cidx) {
                    rancor.css({ left: (lancor.width() + $tp.width() - rancor.width() + g.ancorWidth * (bars.length - widx)) + "px" });
                    lancor.animate({ left: (lancor.width() - tidx * g.ancorWidth) + "px" }, timmer);
                } else {
                    lancor.css({ left: (lancor.width() - tidx * g.ancorWidth) + "px" });
                    rancor.animate({ left: (lancor.width() + $tp.width() - rancor.width() + g.ancorWidth * (bars.length - widx)) + "px" }, timmer);
                }
                curr.fadeOut(timmer, function () {
                    target.fadeIn(timmer, function () {
                        methods._refreshButtons.call($t);
                        if (!g.disevent) {
                            if (g.change) {
                                g.change.call($t, tidx, cidx, target);
                            }
                        }
                    });
                });
            });
        },
        first: function (timmer) {
            return methods._showPage.call(this, "first", timmer);
        },
        last: function (timmer) {
            return methods._showPage.call(this, "last", timmer);
        },
        step: function (stepIdx, timmer) {
            var idx = parseInt(stepIdx, 10);
            if (isNaN(idx)) {
                return methods._showPage.call($(this), stepIdx, timmer);
            } else {
                return methods._showPage.call($(this), "eq({0})".format(stepIdx), timmer);
            }
        },
        hideButtons: function () {
            return this.each(function () {
                var $t = $(this);
                var data = $t.data('vwizard');
                var btns = data.wizard.find('.buttons');
                btns.children().hide();
            });
        },
        _refreshButtons: function () {
            return this.each(function () {
                var $t = $(this);
                var data = $t.data('vwizard');
                var btns = data.wizard.find('.buttons');
                if ($t.children().length == 1) {
                    btns.children().hide();
                    btns.children('.finished').show();
                } else {
                    var cp = methods.current.call($t);
                    var idx = cp.index();
                    btns.children().show();
                    if (idx == 0) {
                        btns.children(".prev").hide();
                    }
                    if (idx != $t.children().length - 1) {
                        btns.children(".finished").hide();
                    } else {
                        btns.children(".next").hide();
                    }
                }
            });
        },
        open: function () {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('vwizard');
                data.setting.disevent = true;
                data.wizard.show();
                data.shield.show();
                methods.position.call($this, data.setting.position);
                methods.first.call($this, 0);
                data.setting.disevent = false;
                if (data.setting.onOpen) {
                    data.setting.onOpen.call($this);
                }
            });
        },
        close: function (destory) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('vwizard');
                if (typeof (destory) == 'undefined') {
                    destory = data.setting.destroyOnClose;
                }
                if (destory) {
                    $this.vwizard("destroy");
                } else {
                    data.setting.disevent = true;
                    data.wizard.hide();
                    data.shield.hide();
                    methods.first.call($this, 0);
                    data.setting.disevent = false;
                }
                if (data.setting.onClose) {
                    data.setting.onClose.call($this);
                }
            });
        },
        next: function () {
            return this.each(function () {
                var $t = $(this);
                var cp = methods.current.call($t);
                var idx = cp.index();
                methods.step.call(this, idx + 1);
            });
        },
        prev: function () {
            return this.each(function () {
                var $t = $(this);
                var cp = methods.current.call($t);
                var idx = cp.index();
                methods.step.call(this, idx - 1);
            });
        },
        pages: function (selector) {
            if (typeof selector == "number") {
                return this.children('div:eq(' + selector + ')');
            } else {
                return this.children(selector).first();
            }
        },
        finished: function () {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('vwizard');
                var g = data.setting;
                if (g.finish) {
                    if (g.finish.call($this) === true) {
                        methods.close.call($this);
                    }
                } else {
                    methods.close.call($this);
                }
            });
        }
    };
    $.fn.vwizard = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            // Default to "init"
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vwizard');
        }
    };
})(jQuery);
//vaction control.
(function ($) {
    var methods = {
        'default': {
            title: '',
            details: '',
            detailHeight: 200,
            titleHeight: 50,
            timmer: 200,
            afterDestroy: null,
            pushCallback: null,
            popCallback: null
        },
        init: function (option) {
            return this.each(function () {
                var g = $.extend({}, methods["default"], option);
                var t = $(this);
                var data = t.data('vaction');
                if (!data) {
                    t.removeClass().addClass("processingbar-item");
                    var title = $("<div></div>");
                    title.addClass("title");
                    title.append('<span class="status"></span>');
                    var caption = $('<div class="caption"></div>');
                    caption.text(g.title);
                    caption.click(function () {
                        t.vaction('toggleDetails');
                    });
                    title.append(caption);
                    var options = $("<div></div>");
                    options.addClass("options");
                    var sd = $('<button class="showdetails" title="Show Details"></button>');

                    sd.click(function () {
                        t.vaction('toggleDetails');
                    });
                    options.append(sd);
                    var close = $('<button class="close" title="Close"></button>');
                    close.click(function () {
                        t.vaction('destroy');
                    });
                    options.append(close);
                    var coll = $('<button class="collapse" title="Collapse"></button>');
                    coll.click(function () {
                        t.vaction('hide');
                    });
                    options.append(coll);
                    title.append(options);
                    t.append(title);
                    t.append('<div class="details"></div>');
                    t.data('vaction', {
                        target: t,
                        setting: g
                    });
                    t.vaction('hideDetails').vaction('hide');
                }
            });
        },
        destroy: function (option) {
            return this.each(function() {
                var t = $(this);
                var data = t.data('vaction');
                if (data) {
                    $(window).unbind('.vaction');
                    if (data.setting.afterDestroy) {
                        data.setting.afterDestroy.call(this);
                    }
                    t.removeData('vaction');
                    t.remove();
                }
            });
        },
        toggleLogItem: function () {
            var t = $(this).parent().find('.log-item-detail');
            if (t.is(':hidden')) {
                t.show();
            } else {
                t.hide();
            }
        },
        push: function (text, internalMsg) {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vaction');
                var g = data.setting;
                if (!g.process) {
                    g.process = [];
                }
                g.process.push(text);
                if (g.pushCallback) {
                    g.pushCallback.call(this);
                }
                t.vaction('log', text, 'info', internalMsg);
                t.find('.title').attr('class', 'title title-processing');
                t.find('.title span:first').attr('class', 'status status-processing');
            });
        },
        pop: function (text, type, internalMsg) {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vaction');
                var g = data.setting;
                if (!g.processResults) {
                    g.processResults = [];
                }
                g.processResults.push(type);
                if (g.popCallback) {
                    g.popCallback.call(this);
                }
                t.vaction('log', text, type, internalMsg);
                var tt = t.find('.title');
                var st = tt.find('span:first');
                if (!g.process) {
                    g.process = [];
                }
                if (g.process.length > g.processResults.length) {
                    tt.attr('class', 'title title-processing');
                    st.attr('class', 'status status-processing');
                } else {
                    tt.attr('class', 'title');
                    st.attr('class', 'status');
                    if (g.processResults.contains('processing')) {
                        st.addClass('status-processing');
                        tt.addClass('title-processing');
                    }
                    else if (g.processResults.contains('error')) {
                        st.addClass('status-error');
                    } else if (g.processResults.contains('warning')) {
                        st.addClass('status-warning');
                    } else {
                        st.addClass('status-success');
                    }
                }
            });
        },
        success: function (text, internalMsg) {
            return methods.pop.call(this, text, 'success', internalMsg);
        },
        error: function (text, internalMsg) {
            return methods.pop.call(this, text, 'error', internalMsg);
        },
        warning: function (text, internalMsg) {
            return methods.pop.call(this, text, 'warning', internalMsg);
        },
        get: function (d) {//d:process, processResults
            var procs = [];
            this.each(function () {
                var t = $(this);
                var data = t.data('vaction');
                var g = data.setting;
                if (g[d]) {
                    procs.addRange(g[d]);
                }
            });
            return procs;
        },
        processResult: function () {
            var results = this.vaction('get', 'processResults');
            var process = this.vaction('get', 'process');
            if (results.length < process.length) {
                return 'processing';
            }
            if (results) {
                if (results.contains('error')) {
                    return 'error';
                } else if (results.contains('warning')) {
                    return 'warning';
                }
            }
            return 'success';
        },
        log: function (text, type, internalMsg) {
            return this.each(function () {
                var details = $(this).find('.details');
                var count = details.children().length;
                var d = $("<div></div>");
                d.addClass('log log-' + type);
                var dt = new Date();
                var msg = "[{1}] {0}".format(text, dt.format("MM/dd/yyyy hh:mm:ss"));
                if (!internalMsg) {
                    d.html(msg);
                } else {
                    var title = $("<div></div>'");
                    title.addClass('log-item-coll');
                    title.html(msg);
                    title.click(methods.toggleLogItem);
                    d.append(title);
                    var imsg = $("<div></div>");
                    imsg.addClass('log-item-detail');
                    imsg.html(internalMsg);
                    d.append(imsg);
                }
                d.prependTo(details);
            });
        },
        hideDetails: function () {
            return this.each(function () {
                $(this).find('.details').css('height', '0px');
            });
        },
        showDetails: function () {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vaction');
                var g = data.setting;
                if (g.showTimeoutID) {
                    clearTimeout(g.showTimeoutID);
                }
                t.find('.details').animate({ height: g.detailHeight + 'px' }, g.timmer);
            });
        },
        toggleDetails: function () {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vaction');
                var g = data.setting;
                if (g.showTimeoutID) {
                    clearTimeout(g.showTimeoutID);
                }
                var d = t.find('.details');
                if (d.height() == 0) {
                    d.animate({ height: g.detailHeight + 'px' }, g.timmer);
                } else if (d.height() == g.detailHeight) {
                    d.height(0);
                }
            });
        },
        hide: function () {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vaction');
                var g = data.setting;
                //t.animate({ 'height': '0px' }, g.timmer);
                t.hide();
            });
        },
        show: function (time) {
            return this.each(function () {
                var t = $(this);
                if (t.is(':hidden')) {
                    var data = t.data('vaction');
                    var g = data.setting;
                    t.find('.details').height(0);
                    t.find('.title').height(0);
                    t.show();
                    t.find('.title').animate({ height: g.titleHeight + 'px' }, g.timmer);
                    if (g.showTimeoutID) {
                        clearTimeout(g.showTimeoutID);
                    }
                    if (time) {
                        g.showTimeoutID = setTimeout(function () {
                            t.vaction('hide');
                        }, time);
                    }
                }
            });
        }
    };
    $.fn.vaction = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vaction');
        }
    };
})(jQuery);
//vaction manager control
(function ($) {
    var methods = {
        'default': {
            maxHeight: 700,
            itemSetting: {
                afterDestroy: function () {
                    var t = $(this);
                    var mgr = t.parent();
                    mgr.vactionMgr('reduceCount');
                },
                pushCallback: function () {
                    var t = $(this);
                    var mgr = t.parent();
                    var data = mgr.data('vactionMgr');
                    var c = $(data.setting.countMarker);
                    c.attr('class', 'processing');
                }, popCallback: function () {
                    var t = $(this);
                    var mgr = t.parent();
                    var pr = mgr.vactionMgr('processResult');
                    var data = mgr.data('vactionMgr');
                    var c = $(data.setting.countMarker);
                    c.attr('class', 'processing');
                    c.addClass(pr);
                }
            },
            countMarker: null
        },
        init: function (option) {
            return this.each(function () {
                var itemSetting = $.extend({}, methods['default'].itemSetting, option.itemSetting);
                var g = $.extend({}, methods["default"], option);
                g.itemSetting = itemSetting;
                var t = $(this);
                var data = t.data('vactionMgr');
                if (!data) {
                    t.removeClass().addClass("processingbar");
                    var c = $(g.countMarker);
                    c.hide().text('');
                    c.click(function () {
                        if (t.find('.processingbar-item:hidden').length > 0) {
                            t.vactionMgr('show');
                        } else {
                            t.vactionMgr('hide');
                        }
                    });
                    t.data('vactionMgr', {
                        target: t,
                        setting: g
                    });
                }
            });
        },
        destroy: function (option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('vactionMgr');
                if (data) {
                    $(window).unbind('.vactionMgr');
                    $this.find('.processingbar-item').vaction('destroy');
                    $this.removeData('vactionMgr');
                    $this.empty();
                }
            });
        },
        show: function () {
            return this.each(function () {
                $(this).find('.processingbar-item').vaction('show');
            });
        },
        hide: function () {
            return this.each(function () {
                $(this).find('.processingbar-item').vaction('hide');
            });
        },
        createItem: function (id, g) {
            var $this = $(this);
            var data = $this.data('vactionMgr');
            return this.each(function () {
                var t = $(this);
                var action = $("<div></div>");
                action.attr('id', id);
                var setting = {};
                $.extend(setting, data.setting.itemSetting, g);
                action.vaction(setting);
                t.prepend(action);
                t.vactionMgr('addCount');
            });
        },
        items: function (id) {
            if (id) {
                var actions = this.find('#' + id);
                return actions;
                if (actions.length > 0) {
                    return actions;
                } else {
                    $.error('Item : ' + id + ' does not exist on vaction mgr.');
                }
            } else {
                return this.children();
            }
        },
        exist: function (id) {
            return this.find('#' + id).length > 0;
        },
        processResult: function () {
            if (this.length > 0) {
                var t = $(this);
                var actions = t.vactionMgr('items');
                return actions.vaction('processResult');
            }
            return null;
        },
        count: function (v) {
            if (this.length > 0) {
                var t = $(this[0]);
                var d = t.data('vactionMgr');
                var tar = $(d.setting.countMarker);
                if (v || v == 0) {
                    if (v > 0) {
                        tar.show().text(v);
                    } else {
                        tar.hide().text(0);
                    }
                } else {
                    var c = parseInt(tar.text());
                    if (isNaN(c)) {
                        return 0;
                    } return c;
                }
            }
            return 0;
        },
        addCount: function () {
            return this.each(function () {
                var t = $(this);
                t.vactionMgr('count', t.vactionMgr('count') + 1);
            });
        },
        reduceCount: function () {
            return this.each(function () {
                var t = $(this);
                t.vactionMgr('count', t.vactionMgr('count') - 1);
            });
        }
    };
    $.fn.vactionMgr = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vactionMgr');
        }
    };
})(jQuery);
//vvalidate extend
(function ($) {
    var methods = {
        'default': {
            alertOffset: { left: -10, top: 0 },
            disabled: false,
            validateEvents: 'default'
        },
        init: function(option) {
            $(window).bind('click.vvalidate', methods.hideAll);
            return this.each(function() {
                var g = $.extend({}, methods['default'], option);
                var $t = $(this);
                $t.unload(function() {
                    methods.destroy.call($t);
                });
                if (g.validateEvents == 'default') {
                    if ($t.is('select')) {
                        $t.change(function() {
                            methods.validate.call($t);
                        });
                    } else if ($t.is('input') || $t.is('textarea')) {
                        $t.blur(function() {
                            methods.validate.call($t);
                        });
                    }
                }
                $t.hover(function() {
                    methods.show.call($t);
                }, function() {
                    methods.hide.call($t);
                });
                var data = $t.data('vvalidate');
                if (!data) {
                    var rules = [];
                    if (g.rules) {
                        g.rules.each(function() {
                            var t = this.valueOf();
                            var rule = {};
                            if (typeof(t) == 'string') {
                                $.extend(rule, methods.rules.base, methods.rules[t]);
                            } else {
                                $.extend(rule, methods.rules.base, methods.rules[t['base']], t);
                            }
                            rule.target = $t;
                            rules.push(rule);
                            if (rule.events) {
                                $t.bind(rule.events);
                            }
                        });
                    }
                    $t.data('vvalidate', {
                        setting: g,
                        rules: rules
                    });
                }
            });
        },
        destroy: function() {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('vvalidate');
                if (data) {
                    $(window).unbind('.vvalidate');
                    if (data.pnl) {
                        data.pnl.remove();
                    }
                    $this.removeData('vvalidate');
                }
            });
        },
        rules: {
            base: {
                name: 'base',
                error: '',
                success: '',
                warning: '',
                valueGetter: null,
                run: function(v) { return "success"; }//there are three result: error, warning, success.
            },
            required: {
                name: 'required',
                error: 'The field is required',
                emptyValues: ['-1', ''],
                run: function(v) {
                    if (!v || this.emptyValues.contains(v)) {
                        return 'error';
                    } else {
                        return 'success';
                    }
                }
            },
            maxlength: {
                name: 'maxlength',
                error: 'The length overflow.',
                length: 0,
                valueGetter: function() { return this.val().length; },
                run: function(v) {
                    return (v > 0 && v > this.length) ? 'error' : 'success';
                }
            },
            minlength: {
                name: 'minlength',
                error: 'The length too small.',
                length: 0,
                valueGetter: function() { return this.val().length; },
                run: function(v) {
                    return (v > 0 && v < this.length) ? 'error' : 'success';
                }
            },
            rangelength: {
                name: 'rangelength',
                error: 'The length error.',
                range: [0, 100],
                valueGetter: function() { return this.val().length; },
                run: function(v) {
                    return (v > 0 && (v < this.range[0] || v > this.range[1])) ? 'error' : 'success';
                }
            },
            alphanumeric: {
                name: 'alphanumeric',
                error: "The value can only be char,number or '-'.",
                run: function(v) {
                    return (v.length == 0 || /^[a-z0-9A-Z\-]*$/.test(v)) ? 'success' : 'error';
                }
            },
            numeric: {
                name: 'numeric',
                error: 'The value can only be numberic.',
                run: function(v) {
                    return (v.length == 0 || /^\d*$/g.test(v)) ? 'success' : 'error';
                }
            },
            equalto: {
                name: 'equalto',
                other: '',
                ignorCase: false,
                error: 'The value do not match.',
                run: function(v) {
                    if (this.ignorCase) {
                        return v.toLowerCase() == $(this.other).val().toLowerCase() ? 'success' : 'error';
                    } else {
                        return v == $(this.other).val() ? 'success' : 'error';
                    }
                }
            },
            regex: {
                name: 'regex',
                match: true,
                regular: '',
                run: function(v) {
                    if (this.regular.constructor != RegExp) {
                        this.regular = new RegExp(this.regular);
                    }
                    if (v.length == 0 || this.regular.test(v) == this.match) {
                        return 'success';
                    }
                    return 'error';
                }
            },
            remote: {
                name: 'remote',
                url: '',
                error: 'The remote validate failed.',
                processing: '',
                cache: {},
                key: 'term',
                result: 'success',
                timeout: 1000,
                events: {
                    keydown: function() {
                        var rules = $(this).data('vvalidate').rules;
                        $.each(rules, function() {
                            if (this.base == 'remote') {
                                this.result = '';
                            }
                        });
                    }
                },
                run: function(v) {
                    if (!this.url) {
                        return 'success';
                    } else {
                        if (this.result) {
                            return this.result;
                        }
                        var d = {};
                        d[this.key] = v;
                        var rule = this;
                        $.getJSON(this.url, d, function(data) {
                            rule.result = data ? data.Type : 'error';
                            if (data && data.Message) {
                                rule.error = data.Message;
                            }
                            methods.validate.call(rule.target);
                        }).error(function() {
                            rule.result = 'error';
                            methods.validate.call(rule.target);
                        });
                        return 'processing';
                    }
                }
            },
            customer: {
                name: 'customer',
                error: 'The value do not match.',
                run: function(v) {
                    return 'success';
                }
            }
        },
        hideAll: function() {
            $('.vvalidate-pop').hide();
        },
        hide: function() {
            return this.each(function() {
                var $t = $(this);
                var data = $t.data('vvalidate');
                if (data && data.pnl) {
                    data.pnl.hide();
                }
            });
        },
        reset: function() {
            return this.each(function() {
                var $t = $(this);
                var data = $t.data('vvalidate');
                $.each(data.rules, function() {
                    if (this.base == 'remote') {
                        this.result = '';
                    }
                });
            });
        },
        show: function() {
            return this.each(function() {
                var $t = $(this);
                var data = $t.data('vvalidate');
                if (data && data.pnl && data.pnl.children().first().html().length > 0) {
                    var off = data.setting.alertOffset;
                    var pos = $t.offset();
                    pos.left = pos.left + $t.width() + off.left;
                    pos.top = pos.top - data.pnl.height() + off.top;
                    data.pnl.css(pos).show();
                }
            });
        },
        disable: function() {
            return this.each(function() {
                var data = $(this).data('vvalidate');
                var g = data.setting;
                g.disabled = true;
                $(this).vvalidate('validate');
            });
        },
        enable: function() {
            return this.each(function() {
                var data = $(this).data('vvalidate');
                var g = data.setting;
                g.disabled = false;
            });
        },
        validate: function(filter) { //filter:name or index of rules. default is all.
            var valid = 'success';
            this.each(function() {
                var $t = $(this);
                if (!$t.is(':visible')) {
                    return;
                }
                var data = $t.data('vvalidate');
                if (!data) {
                    return;
                }
                var g = data.setting;
                var msg = [];
                if (g.disabled === true) {
                    //add the disable logic.
                } else {
                    var rules = data.rules;
                    if (typeof(filter) == 'string') {
                        rules = rules.findAll(function(v) { return v.name == filter; });
                    } else if (typeof(filter) == 'number') {
                        rules = [].push(rules[filter]);
                    }
                    var v = $t.val();
                    if (g.valueGetter) {
                        v = g.valueGetter.call($t);
                    }
                    var er = 'success';
                    rules.each(function() {
                        var rv = v;
                        if (this.valueGetter) {
                            rv = this.valueGetter.call($t);
                        }
                        var r = this.run(rv);
                        if (r != 'success') {
                            msg.push(this[r]);
                            if (er != 'error') {
                                er = r;
                            }
                        }
                    });
                }
                $t.removeClass('vvalidate-success')
                    .removeClass('vvalidate-error')
                    .removeClass('vvalidate-warning')
                    .removeClass('vvalidate-processing')
                    .addClass('vvalidate-' + er);
                if (er != 'success')
                    if (valid != 'error') {
                        valid = er;
                    }
                msg = msg.remove('');
                if (!msg.isEmpty()) {
                    if (!data.pnl) {
                        data.pnl = $("<div class='vvalidate-pop'><div class='content'></div><div class='pointer'></div></div>");
                    }
                    data.pnl.children('.content').html(msg.join('<br/>'));
                    $('body').append(data.pnl);
                    methods.show.call($t);
                } else if (data.pnl) {
                    data.pnl.children('.content').empty();
                    methods.hide.call($t);
                }
            });
            return valid;
        }
    };
    $.fn.vvalidate = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vvalidate');
        }
    };
})(jQuery);
//vballoon extend.
(function ($) {
    var methods = {
        'default': {
            text: 'v-balloon',
            pointer: 'left',//'left,right,middle'
            bgColor: '#4D4D4D'
        },
        init: function (option) {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vballoon');
                if (!data) {
                    var g = $.extend({}, methods["default"], option);
                    t.addClass('vballoon');
                    var content = $("<div></div>");
                    content.text(g.text);
                    content.addClass('content');
                    t.append(content);
                    var pointer = $("<div></div>");
                    t.append(pointer);
                    methods.pointer.call(t, g.pointer);
                    if (g.bgColor) {
                        methods.bgColor.call(t, g.bgColor);
                    }
                    t.data('vballoon', {
                        setting: g
                    });
                }
            });
        },
        destroy: function () {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('vballoon');
                if (data) {
                    $(window).unbind('.vballoon');
                    $this.removeData('vballoon');
                    $this.empty();
                }
            });
        },
        show: function (position, pointer) {
            return this.each(function () {
                var $this = $(this);
                if (pointer) {
                    methods.pointer.call($this, pointer);
                }
                if (position) {
                    $this.css(position);
                }
                $this.show();
            });
        },
        hide: function () {
            return this.each(function () {
                $(this).hide();
            });
        },
        pointer: function (value) {
            if (value) {
                return this.each(function () {
                    var $this = $(this);
                    if (methods.pointer.call($this) == value) {
                        return;
                    }
                    var pointer = $this.children(':eq(1)');
                    pointer.removeClass();
                    switch (value) {
                        case 'right':
                            pointer.addClass('pointer-right');
                            break;
                        case 'middle':
                            pointer.addClass('pointer-middle');
                            pointer.empty().append('<div class="left"></div><div class="right"></div>');
                            break;
                        case 'left':
                            pointer.addClass('pointer-left');
                            break;
                        default:
                            $.error('Pointer style for v-balloon can only be left, right or middle. ' + value + ' is invalid.');
                    }
                    methods.bgColor.call($this, methods.bgColor.call($this));
                });
            } else {
                var v = this.find('div[class*="pointer"]').attr('class');
                if (v && v.contains('-')) {
                    return v.split('-')[1];
                } else {
                    return null;
                }
            }
        },
        bgColor: function (value) {
            if (value) {
                return this.each(function () {
                    var $this = $(this);
                    $this.css('background-color', value);
                    $this.find('.pointer-left, .pointer-middle .right').css({ 'border-top-color': value, 'border-left-color': value, 'border-right-color': '' });
                    $this.find('.pointer-right, .pointer-middle .left').css({ 'border-top-color': value, 'border-left-color': '', 'border-right-color': value });
                });
            } else {
                return this.css('background-color');
            }
        },
        text: function (value) {
            if (value) {
                return this.each(function () {
                    $(this).find('.content').text(value);
                });
            } else {
                return this.find('.content').text();
            }
        }
    };
    $.fn.vballoon = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vballoon');
        }
    };
})(jQuery);
//vloading extend.
(function ($) {
    var methods = {
        'default': {
            iconClas: "icon",
            cover: true
        },
        init: function (option) {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vloading');
                if (!data) {
                    var g = $.extend({}, methods["default"], option);
                    var pnl = $("<div></div>");
                    pnl.addClass("vloading");
                    var icon = $("<div></div>");
                    var iconouter = $("<div><div>").addClass("icon-outer");
                    icon.addClass(g.iconClas);
                    iconouter.append(icon);
                    pnl.append(iconouter);
                    $('body').append(pnl);
                    t.data('vloading', {
                        setting: g,
                        target: t,
                        panel: pnl
                    });
                    methods.hide.call(t);
                }
            });
        },
        destroy: function () {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('vloading');
                if (data) {
                    $(window).unbind('.vloading');
                    data.panel.remove();
                    $this.removeData('vloading');
                }
            });
        },
        show: function () {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data("vloading");
                if (data) {
                    var panel = data.panel;
                    var offset = $this.offset();
                    offset.width = $this.width();
                    offset.height = $this.height();
                    var height = offset.height;
                    if (offset.top + height > $(window).height()) {
                        height = $(window).height() - offset.top;
                    }
                    panel.css(offset);
                    var zIdx = 1, par = $this.parent();
                    while (par.length > 0 && !par.is('body')) {
                        var idx = parseInt(par.css('z-index'));
                        if (!isNaN(idx)) {
                            zIdx += idx;
                        } else {
                            zIdx++;
                        }
                        par = par.parent();
                    }
                    panel.css('z-index', zIdx);
                    panel.show();
                    var icon = $(".icon-outer", panel);
                    icon.css({ left: (offset.width - icon.width()) / 2, top: (height - icon.height()) / 2 });
                }
            });
        },
        hide: function () {
            var $this = $(this);
            var data = $this.data("vloading");
            if (data) {
                var panel = data.panel.hide();
            }
        }
    };
    $.fn.vloading = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vloading');
        }
    };
})(jQuery);
//vnoselect (used only for vgrid plugin currently)
(function ($) {
    $.fn.vNoSelect = function (v) {
        var prevent = !(v === false);
        if (prevent) {
            return this.each(function () {
                if ($.browser.msie || $.browser.safari) $(this).bind('selectstart.vNoSelect', function () {
                    return false;
                });
                else if ($.browser.mozilla) {
                    $(this).css('MozUserSelect', 'none');
                    $('body').trigger('focus');
                } else if ($.browser.opera) $(this).bind('mousedown.vNoSelect', function () {
                    return false;
                });
                else $(this).attr('unselectable', 'on');
            });
        } else {
            return this.each(function () {
                if ($.browser.msie || $.browser.safari) $(this).unbind('.vNoSelect');
                else if ($.browser.mozilla) $(this).css('MozUserSelect', 'inherit');
                else if ($.browser.opera) $(this).unbind('.vNoSelect');
                else $(this).removeAttr('unselectable', 'on');
            });
        }
    };
})(jQuery);
//vtiptext plug in.
(function ($) {
    var methods = {
        'default': {
            tip: 'v-tip',
            onEnter: null,
            onKeyup: null
        },
        init: function (option) {
            return this.each(function () {
                var t = $(this);
                if (!t.is(':text')) {
                    return;
                }
                var data = t.data('vtiptext');
                if (!data) {
                    var g = $.extend({}, methods["default"], option);
                    t.bind('click.vtiptext', function () {
                    }).bind('blur.vtiptext', function () {
                        methods._autoTip(t, g);
                    }).bind('focus.vtiptext', function () {
                        methods._hideTip(t, g);
                        if (t.val() == g.tip) {
                            t.val('');
                        }
                    }).bind('keydown.vtiptext', function (ev) {
                        if (g.onEnter && ev.keyCode == '13') {
                            g.onEnter.call(this, ev);
                        }
                    }).bind('keyup.vtiptext', function (ev) {
                        if (g.onKeyup) {
                            g.onKeyup.call(this, ev);
                        }
                    });
                    methods._autoTip(t, g);
                    t.data('vtiptext', {
                        setting: g
                    });
                }
            });
        },
        show: function () {
            return this.each(function () {
                var data = $(this).data('vtiptext');
                if (data) {
                    methods._showTip($(this), data.setting);
                }
            });
        },
        hide: function () {
            return this.each(function () {
                var data = $(this).data('vtiptext');
                if (data) {
                    methods._hideTip($(this), data.setting);
                }
            });
        },
        _showTip: function (t, g) {
            t.addClass('vtiptext').val(g.tip);
        },
        _hideTip: function (t, g) {
            if (t.val() == g.tip) {
                t.val('');
            }
            t.removeClass('vtiptext');
        },
        _autoTip: function (t, g) {
            if (t.val().length == 0) {
                methods._showTip(t, g);
            } else {
                methods._hideTip(t, g);
            }
        },
        destroy: function () {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('vtiptext');
                if (data) {
                    $(window).unbind('.vtiptext');
                    $this.unbind('.vtiptext')
                        .removeClass('vtiptext')
                        .removeData('vtiptext');
                }
            });
        }
    };
    $.fn.vtiptext = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vtiptext');
        }
    };
})(jQuery);

//vshell menu plugin
(function ($) {
    var methods = {
        'default': {
            features: [],
            disableDescription: '',
            menus: [],
            timmer: 300
        },
        init: function (option) {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vshellmenu');
                if (!data) {
                    var g = $.extend({}, methods["default"], option);
                    g.menuPanel = $('<div class="menu-panel"></div>');
                    g.infoPanel = $('<div class="info-panel"></div>');
                    g.contentPanel = $('<div class="content-panel"></div>');
                    t.append(g.menuPanel).append(g.infoPanel).append(g.contentPanel);
                    g.rootMenu = methods._createLevel(g.menus, 0, g);
                    methods._showLevel(0, g.rootMenu, g);
                    t.data('vshellmenu', {
                        setting: g
                    });
                }
            });
        },
        _isEnabled: function (g, menu) {
            return g.features.contains(menu.feature, function (v) {
                return v.caption;
            });
        },
        show: function () {
            return this.each(function () {
                var data = $(this).data('vshellmenu');
                if (data) {
                    var g = data.setting;
                    methods._showLevel(0, g.rootMenu, g);
                    g.infoPanel.hide();
                    g.contentPanel.empty().hide();
                }
            });
        },
        _showLevel: function (level, list, g) {
            for (var idx = level; idx <= g.maxLevel; idx++) {
                methods._hideLevel(idx, g);
            }
            var pnl = g.menuPanel.find('.command-menu-panel[level="' + level + '"]');
            list.show().siblings().hide();
            if (!pnl.is(':visible')) {
                var w = pnl.width();
                pnl.width(0).show().animate({ 'width': w }, g.timmer);
            }
        },
        _hideLevel: function (level, g) {
            var pnl = g.menuPanel.find('.command-menu-panel[level="' + level + '"]');
            pnl.hide();
            pnl.find('li[vselected="true"]').attr('vselected', 'false');
        },
        _createLevel: function (menus, level, g) {
            var panel = $('.command-menu-panel[level="' + level + '"]');
            if (panel.length == 0) {
                panel = $('<div class="command-menu-panel"></div>');
                panel.attr('level', level);
            }
            g.menuPanel.append(panel);
            g.maxLevel = level;
            var ul = $('<ul></ul>');
            panel.append(ul);
            menus.list = ul;
            $.each(menus, function (idx) {
                var li = $('<li></li>');
                var item = $('<div></div>');
                li.append(item);
                ul.append(li);
                var menu = this;
                item.attr('id', menu.id).addClass('item').addClass(menu.css).text(menu.text);
                var disable = level === 0 && !methods._isEnabled(g, menu);
                if (disable) {
                    li.addClass('disable');
                }
                li.hover(function (ev) {
                    if (!g.contentPanel.is(':visible')) {
                        if (disable) {
                            g.infoPanel.text(g.disableDescription);
                        } else {
                            g.infoPanel.text(menu.description);
                        }
                        g.infoPanel.show();
                    }
                }, function (ev) {
                    g.infoPanel.hide();
                }).click(function (ev) {
                    if (disable) {
                        return;
                    }
                    var $t = $(this);
                    $t.siblings().attr('vselected', "false");
                    $t.attr('vselected', "true");
                    if (!menu.handler) {
                        if (menu.menus) {
                            methods._showLevel(level + 1, menu.menus.list, g);
                            //todo:show sub menus.
                        } else if (menu.url) {
                            g.infoPanel.hide();
                            g.contentPanel.show().load(menu.url);
                        }
                    } else {
                        menu.handler(g);
                    }
                });
                if (menu.menus) {
                    menu.subPanel = methods._createLevel(menu.menus, level + 1, g);
                }
            });
            return panel;
        },
        destroy: function () {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('vshellmenu');
                if (data) {
                    $(window).unbind('.vshellmenu');
                    $this.unbind('.vshellmenu')
                        .removeClass('vshellmenu')
                        .removeData('vshellmenu')
                        .empty();
                }
            });
        }
    };
    $.fn.vshellmenu = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vshellmenu');
        }
    };
})(jQuery);