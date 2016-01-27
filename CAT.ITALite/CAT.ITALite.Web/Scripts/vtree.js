(function ($) {
    var methods = {
        'default': {
            url: false,
            searchAction: "Search",
            caption: 'v-tree',
            showCaption: true,
            checkbox: true,
            checkSubTree: true,
            multiCheck: true,
            onSelect: null,
            onBind: null,
            keyField: 'ID',
            parentField: 'ParentID',
            textField: 'Name',
            expend: true,
            onCheck: null,
            onCreate: null // exec after grid created.
        },
        init: function (option) {
            return this.each(function () {
                if (!$(this).data('vtree')) {
                    var g = $.extend({}, methods["default"], option);
                    var $t = $(this);
                    $t.width(g.width);
                    $t.vloading();
                    g.gDiv = $t;
                    g.tDiv = $("<div></div>").width(g.width); //create title container
                    g.bDiv = $("<div></div>").width(g.width); //create body container
                    g.gDiv.addClass('vtree');
                    g.tDiv.addClass('vtree-caption').append($("<span></span>").text(g.caption));
                    $t.append(g.tDiv);
                    if (!g.showCaption) {
                        g.tDiv.hide();
                    }
                    g.bDiv.addClass('vtree-body');
                    $t.append(g.bDiv);
                    $t.data('vtree', {
                        setting: g,
                        target: $t
                    });
                    if (g.onCreate) {
                        g.onCreate.call($t, g);
                    }
                }
            });
        },
        destroy: function () {
            return this.each(function () {
                var t = $(this);
                t.vloading("destroy");
                var data = t.data('vtree');
                if (data) {
                    $(window).unbind('.vtree');
                    t.removeData('vtree');
                    t.empty();
                }
            });
        },
        showLoading: function () {
            return this.each(function () {
                $(this).vloading('show');
            });
        },
        hideLoading: function () {
            return this.each(function () {
                $(this).vloading('hide');
            });
        },
        caption: function (v) {
            if (v) {
                return this.each(function () {
                    $(this).find('div.vtree-caption span:first').text(v);
                });
            } else {
                return this.find('div.vtree-caption span:first').text();
            }
        },
        showCaption: function () {
            $(this).find('div.vtree-caption').show();
        },
        hideCaption: function () {
            $(this).find('div.vtree-caption').hide();
        },
        data: function () {
            return this.data('vtree').data;
        },
        _check: function (g) {
            var ck = $(this).is(':checked');
            if (ck) {
                if (!g.multiCheck) {
                    $(this).closest('.vtree-body').find('input:checked').attr('checked', false);
                    $(this).attr('checked', true);
                }
            }
            if (g.checkSubTree) {
                $(this).closest('li').find('ul li').find('input[type="checkbox"]:first').attr('checked', ck);
            } else {
            }
            if (g.onCheck) {
                g.onCheck.call($(this).closest('li'), g.gDiv, g);
            }
        },
        checkedData: function () {
            var d = $(this).data('vtree');
            var data = d.data, g = d.setting;
            if (!data) {
                return [];
            }
            var res = [], len = data.length;
            $(this).find('li').find('input[type="checkbox"]:first').filter(':checked').each(function () {
                var key = $(this).closest('li').attr('key');
                for (var idx = 0; idx < len; idx++) {
                    if (data[idx][g.keyField] == key) {
                        res.push(data[idx]);
                        break;
                    }
                }
            });
            return res;
        },
        _iconClick: function (g) {
            var $t = $(this);
            var exp = $t.hasClass('vtree-minus');
            var body = $t.closest('li').find('ul:first');
            if (exp) {
                $t.removeClass('vtree-minus').addClass('vtree-plus');
                body.hide();
            } else {
                $t.removeClass('vtree-plus').addClass('vtree-minus');
                body.show();
            }
        },
        bindData: function (data) {
            return this.each(function () {
                var tree = $(this);
                var gd = tree.data('vtree');
                var g = gd.setting;
                var rows = data;
                if (data && data.Rows) {
                    rows = data.Rows;
                }
                if (data && rows && rows.constructor == Array) {
                    gd.data = rows;
                    var findChildren = function (parent) {
                        return rows.findAll(function (v) {
                            return v[g.parentField] == parent;
                        });
                    };
                    var roots = rows.findAll(function (v) {
                        return !v[g.parentField];
                    });
                    var creater = function (nodes) {
                        var ul = $('<ul class="vtree-group"></ul>');
                        $.each(nodes, function () {
                            var cNodes = findChildren(this[g.keyField]);
                            var li = $('<li></li>');
                            li.attr('key', this[g.keyField]);
                            if (g.checkbox) {
                                var ck = $("<input type='checkbox'/>");
                                ck.click(function () {
                                    methods._check.call(this, g);
                                });
                                $('<span class="vtree-checkbox"></span>').append(ck).appendTo(li);
                            }
                            var txt = $("<span class='vtree-text'></span>");
                            if (g.textFormatter) {
                                txt.append(g.textFormatter(this[g.textField], this));
                            } else {
                                txt.text(this[g.textField]);
                            }
                            txt.appendTo(li);
                            if (cNodes.length > 0) {
                                var icon = $('<span class="vtree-icon"></span>');
                                icon.click(function () {
                                    methods._iconClick.call(this, g);
                                });
                                var cbody = creater(cNodes);
                                if (g.expend) {
                                    icon.addClass('vtree-minus');
                                } else {
                                    icon.addClass('vtree-plus');
                                    cbody.hide();
                                }
                                li.prepend(icon).append(cbody);
                            }
                            ul.append(li);
                        });
                        return ul;
                    };
                    g.bDiv.empty().append(creater(roots));

                    if (g.onBind) {
                        g.onBind.call(tree, data);
                    }
                }
            });
        },
        search: function (paras) {
            return this.each(function () {
                var tree = $(this);
                var g = tree.data('vtree').setting;
                var params = {};
                $.extend(params, g.fixedParams);
                $.extend(params, paras);
                tree.vtree('showLoading');
                $.getJSON(g.url + "/" + g.searchAction, params, function (data) {
                    tree.vtree('bindData', data);
                    tree.vtree('hideLoading');
                }).error(function (data) {
                    tree.vtree('hideLoading');
                    if (g.onLoadError) {
                        g.onLoadError(data);
                    }
                });
            });
        },
        width: function (v) {
            if (!v) {
                return $(this).width();
            } else {
                return this.each(function () {
                    $(this).width(v);
                    $(this).children().width(v);
                });
            }
        },
        height: function (v) {
            if (!v) {
                return $(this).height();
            } else {
                return this.each(function () {
                    var h = v;
                    $(this).children('.vtree-body').siblings().each(function () {
                        h -= $(this).outerHeight(true);
                    });
                    $(this).children('.vtree-body').height(h);
                });
            }
        }
    };
    $.fn.vtree = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vtree');
        }
    };
})(jQuery);