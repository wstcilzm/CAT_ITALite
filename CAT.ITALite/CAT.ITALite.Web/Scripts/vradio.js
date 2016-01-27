
//vshell menu plugin
(function ($) {
    var methods = {
        'default': {
            label: 'VRadio',
            buttons: null,//[{ value: 'on', text: 'ON' }],
            inputs: null,//[{title:'',dscription:'',value:'',activeHandler:function(g){}}],
            checkboxs: null,//[{ value: 'on', text: 'ON' }],
            onclick: function (g) {
            },
            onchange: function (g) {
            },
            oninputchange:function (g) {
            },
            model: 'single',//'multi'
        },
        init: function (option) {
            return this.each(function () {
                var t = $(this);
                var data = t.data('vradio');
                if (!data) {
                    var g = $.extend({}, methods["default"], option);
                    g.t = t;
                    g.panel = $('<div/>');
                    var label = $('<div/>').addClass('label').text(g.label).appendTo(g.panel);
                    var content = $('<div class="vradio-content"/>');
                    g.panel.addClass('vradio');
                    if (g.buttons && g.buttons.length) {
                        var ul = $('<ul class="buttons"/>');
                        $.each(g.buttons, function () {
                            var li = $('<li></li>');
                            var div = $('<div />');
                            li.attr('vradio-value', this.value);
                            div.html(this.text);
                            li.append(div);
                            li.click(function () {
                                methods._setButtonStatus(g, li, true);
                                g.onclick.call(t, g);
                            });
                            this.element = li;
                            ul.append(li);
                        });
                        content.append(ul);
                    }
                    if (g.checkboxs && g.checkboxs.length) {
                        var ul = $('<ul class="checkboxs"/>');
                        $.each(g.checkboxs, function () {
                            var li = $('<li></li>');
                            var checkbox = $('<input type="checkbox" />');
                            li.attr('vradio-value', this.value);
                            var span = $('<span class="title"/>');
                            span.text(this.text);                            
                            li.append(checkbox.after(span));
                            li.click(function () {
                                methods._setCheckboxStatus(g, li, true);
                                g.onclick.call(t, g);
                            });
                            this.element = li;
                            ul.append(li);
                        });
                        content.append(ul);
                    }
                    if (g.inputs && g.inputs.length) {
                        var ul = $('<ul class="inputs"/>');
                        $.each(g.inputs, function () {
                            var li = $('<li></li>');
                            var title = $('<span class="title"/>').text(this.title);
                            var input = $('<input/>').val(this.value);
                            input.change(function () {
                                g.oninputchange.call(t,g);
                            });
                            var description = $('<span class="description"/>');
                            if (this.description) {
                                description.text("(" + this.description + ")");
                            }
                            li.append(title).append(input).append(description);
                            ul.append(li);
                            this.element = li;
                        });
                        content.append(ul);
                    }

                    g.panel.append(content);
                    t.append(g.panel);

                    t.data('vradio', {
                        setting: g
                    });
                }
            });
        },
        _setInputsEnable: function (g) {
            if (!g.inputs) {
                return;
            }
            $.each(g.inputs, function () {
                if (this.activeHandler) {
                    var enable = this.activeHandler.call(g.t, g);
                    var input = this.element.find('input');
                    if (enable) {
                        input.removeAttr('readonly');
                    } else {
                        input.attr('readonly', true);
                        input.val('');
                    }
                }
            });
        },
        _setButtonStatus: function (g, li, isCheck) {

            if (g.model == 'single') {
                li.siblings('[checked]').removeAttr('checked');
            }
            if (isCheck) {
                li.attr('checked', true);
            } else {
                li.removeAttr('checked');
            }
            if (g.onchange) {
                g.onchange.call(g.t, g);
            }
            methods._setInputsEnable(g);
        },
        _setCheckboxStatus: function (g, li, isCheck) {

            if (g.model == 'single') {
                li.siblings('[checked]').removeAttr('checked');
                li.closest('ul').find('input').removeAttr('checked');
            }
            if (isCheck) {
                li.attr('checked', true);
                li.children('input').attr('checked', true);
            } else {
                li.removeAttr('checked');
                li.children('input').removeAttr('checked');
            }
            if (g.onchange) {
                g.onchange.call(g.t, g);
            }
            methods._setInputsEnable(g);
        },
        buttonValue: function (value) {
            if (arguments.length == 0) {
                var g = $(this).data('vradio').setting;
                if (g.model == 'single') {
                    return $(this).find('.vradio li[checked]').attr('vradio-value');
                } else {
                    var result = [];
                    $(this).find('.vradio li[checked]').each(function () {
                        result.push($(this).attr('vradio-value'));
                    });
                    return result;
                }
            }
            else {
                return $(this).each(function () {
                    var t = $(this);
                    if (value === undefined) {
                        return;
                    }
                    var g = t.data('vradio').setting;
                    var lis;
                    if ($.isArray(value)) {
                        var filter = [];
                        $.each(value, function () {
                            filter.push('li[vradio-value="' + this.valueOf() + '"]');
                        });
                        lis = t.find(filter.join(','));
                    } else {
                        lis = t.find('li[vradio-value="' + value + '"]');
                    }
                    methods._setButtonStatus(g, lis, true);
                });

            }
        },
        checkboxValue: function (value) {
            if (arguments.length == 0) {
                var g = $(this).data('vradio').setting;
                if (g.model == 'single') {
                    return $(this).find('.vradio li[checked]').attr('vradio-value');
                } else {
                    var result = [];
                    $(this).find('.vradio li[checked]').each(function () {
                        result.push($(this).attr('vradio-value'));
                    });
                    return result;
                }
            }
            else {
                return $(this).each(function () {
                    var t = $(this);
                    if (value === undefined) {
                        return;
                    }
                    var g = t.data('vradio').setting;
                    var lis;
                    if ($.isArray(value)) {
                        var filter = [];
                        $.each(value, function () {
                            filter.push('li[vradio-value="' + this.valueOf() + '"]');
                        });
                        lis = t.find(filter.join(','));
                    } else {
                        lis = t.find('li[vradio-value="' + value + '"]');
                    }
                    methods._setCheckboxStatus(g, lis, true);
                });

            }
        },
        inputValue: function (value) {
            if (arguments.length == 0) {
                var g = $(this).data("vradio").setting;
                if (g.inputs) {
                    if (g.inputs.length == 1) {
                        return g.inputs[0].element.find('input').val();
                    } else {
                        var result = [];
                        $.each(g.inputs, function () {
                            result.push(this.element.find('input').val());
                        });
                        return result;
                    }
                } else {
                    return null;
                }
                return $.each(g.inputs, function () {
                });
            } else {
                return $(this).each(function () {
                    //todo:set the inputs value.
                    var t = $(this);
                    if (value === undefined) {
                        return;
                    }
                    if (!$.isArray(value)) {
                        t.find('.vradio input').val(value);
                    } else {
                        $.each(g.inputs, function () {
                            t.find('.vradio input').each(i, data, function () {
                                g.input[i] = data;
                            });
                        });
                    }
                });
            }
        },
        destroy: function () {
            return this.each(function () {
                var $this = $(this);

                var data = $this.data('vradio');
                if (data) {
                    $(window).unbind('.vradio');
                    $this.unbind('.vradio')
                        .removeClass('vradio')
                        .removeData('vradio');
                    data.setting.panel.remove();
                }
            });
        }
    };
    $.fn.vradio = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vradio');
        }
    };
})(jQuery);