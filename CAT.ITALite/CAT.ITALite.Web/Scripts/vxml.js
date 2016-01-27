(function ($) {
    var methods = {
        'default': {
            rootNodeName: 'root',
            width: 960,
            height: 820
        },
        init: function (option) {
            return this.each(function () {
                if (!$(this).data('vxml')) {
                    var g = $.extend({}, methods["default"], option);
                    if (!g.remoteSourceCache) {
                        g.remoteSourceCache = {};
                    }
                    var $t = $(this);
                    $t.width(g.width).height(g.height).addClass("vxml");
                    methods._initPath(g.template);
                    g.$t = $t;
                    g.nodeMode = {};
                    g.$n = g.nodeMode;
                    g.$n.div = $('<div vxmltype="node"></div>');
                    g.$n.tDiv = $('<div class="vxml-toolbar"></div>');//toolbar;
                    g.$n.bDiv = $('<div class="vxml-body"></div>');//body.
                    g.pDiv = $('<div class="vxml-popup"></div>');//popup div.
                    g.$n.div.append(g.$n.tDiv).append(g.$n.bDiv);
                    g.$n.root = $('<div class="vxml-node-root" path=""><div class="vxml-node-body"></div></div>');
                    for (var prop in g.template.nodes) {
                        g.$n.root.attr('path', prop);
                    }
                    g.$n.bDiv.append(g.$n.root);
                    var top = $('<div class="vxml-toolbar-top"></div>');
                    var bottom = $('<div class="vxml-toolbar-bottom"></div>');
                    var add = $('<div class="vxml-toolbar-item vxml-toolbar-add" active="active"><span></span><div>Add</div></div>');
                    var del = $('<div class="vxml-toolbar-item vxml-toolbar-delete">Delete</div>');
                    var copyAdd = $('<div class="vxml-toolbar-item vxml-toolbar-copyadd">Copy and add</div>');
                    var xml = $('<div class="vxml-toolbar-item vxml-toolbar-xml">From XML</div>');

                    del.click(function () {
                        var cnode = methods.$n._getSelectedOrRootElement(g);
                        if (methods.$n._isRoot(cnode)) {
                            alert('please select the node you want to delete.');
                        } else {
                            var next = cnode.next();
                            cnode.remove();
                            methods.$n._selectOneElement(g, next);
                        }
                        methods.$n._setToolbarState(g);
                    });
                    xml.click(function () {
                        methods.$x._show(g);
                    });

                    copyAdd.click(function () {
                        methods.$n._copyAndAdd(g);
                    });
                    $('body').bind('click.vxml', function () {
                        g.pDiv.hide();
                    });
                    top.append(add).append(del).append(copyAdd).append(xml);
                    bottom.append(methods.$n._createRibbonBar(g));
                    g.$n.tDiv.append(top).append(bottom);
                    $t.append(g.$n.div).append(g.pDiv);
                    methods.$n._setToolbarState(g);
                    methods.$n._initNodes(g);
                    var _getcliInPopup = function (ele) {
                        return $(ele).closest('li', g.pDiv.get(0));
                    };
                    g.pDiv.click(function (ev) {
                        ev.stopPropagation();
                        var li = _getcliInPopup(ev.target);
                        if (li.length > 0) {
                            var values = g.popuper.editor.val().split(';');
                            var node = g.popuper.node;
                            values[values.length - 1] = li.text();
                            if (ev.target.tagName != 'INPUT') {//check box
                                g.pDiv.hide();
                            }
                            if (node.type == 'multi') {
                                values.push('');
                            }
                            g.popuper.editor.val(values.join(';'));
                        }
                    }).hover(function (ev) {
                        g.pDiv.find('li[active="active"]').attr('active', '');
                    });
                    g.$x = g.xmlMode = {};
                    g.$x.div = $('<div vxmltype="xml"></div>');
                    g.$x.toolbar = $('<div class="vxml-toolbar"><div class="vxml-toolbar-top"></div></div>');
                    var format = $('<div class="vxml-toolbar-item"><span></span><div>Format</div></div>');
                    var ok = $('<div class="vxml-toolbar-item"><span></span><div>OK</div></div>');
                    var cancel = $('<div class="vxml-toolbar-item"><span></span><div>Cancel</div></div>');
                    format.click(function () {
                        methods.$x._format(g);
                    });
                    ok.click(function () {
                        methods.$x._toNode(g);
                        methods.$x._hide(g);
                    });
                    cancel.click(function () {
                        methods.$x._hide(g);
                    });
                    g.$x.toolbar.children(':first').append(format).append(ok).append(cancel);
                    g.$x.body = $('<div contenteditable="true"  class="vxml-body"></div>');
                    g.$x.div.append(g.$x.toolbar).append(g.$x.body);
                    g.$x.div.height(g.height).width(g.width);
                    $t.append(g.$x.div);
                    g.$x.body.height(g.height - g.$x.toolbar.outerHeight(true));
                    g.$n.bDiv.height(g.height - g.$n.tDiv.outerHeight(true));
                    methods.$x._hide(g);
                    $t.data('vxml', {
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
            return this.each(function() {
                var t = $(this);
                var data = t.data('vxml');
                if (data) {
                    $(window).unbind('.vxml');
                    t.removeData('vxml');
                    t.empty();
                }
            });
        },
        _getSource: function (g, source, key) {
            if (!source) {
                return null;
            }
            if (source.startWith('local:')) {
                var result = [];
                g.$n.bDiv.find('.vxml-node[path="' + source.substr(6) + '"]').each(function () {
                    result.push(methods.$n._getValue($(this)));
                });
                return result;
            }
            else if (source.startWith('remote:')) {
                var url = source.substr(7)
                    , pool = g.remoteSourceCache[url];
                if (pool) {
                    key = key.toLowerCase();
                    for (var k in pool) {
                        if (key.startWith(k.toLowerCase())) {
                            return pool[k];//todo:filter.
                        }
                    }
                }
                return 'remote_load';
            }
            else {
                return source.split(',');
            }
        },
        _createPopupContent: function (source, value, multi) {
            var ul = $('<ul></ul>');
            value = value.split(',');
            $.each(source, function () {
                var li = $('<li></li>');
                //todo:hightlight current value.
                li.append('<span>' + this.valueOf() + '</span>');
                if (multi) {
                    li.prepend('<input type="checkbox"/>');
                }
                ul.append(li);
            });
            return ul;
        },
        _getNode: function (template, nodePath) {
            var path = typeof (nodePath) == 'string' ? nodePath.split('.') : nodePath;
            var node = template;
            $.each(path, function () {
                node = node.nodes[this.valueOf()];
            });
            return node;
        },
        data: function (type) {//json|xml
            var g = this.data('vxml').setting;
            switch (type) {
                case 'xml':
                    return methods.$n._xml(g);
                case 'json':
                    return methods.$n._json(g);
                default:
                    return null;

            }
        },
        height: function (value) {
            if (value) {
                return this.each(function () {
                    var g = $(this).data('vxml').setting;
                    $(this).height(value);
                    g.$x.body.height(value - g.$x.toolbar.outerHeight(true));
                    g.$n.bDiv.height(value - g.$n.tDiv.outerHeight(true));
                });
            } else {
                return this.height();
            }
        },
        _lastName: function (path) {
            return path.split('.').last();
        },
        _firstNode: function (pnode) {
            for (var name in pnode.nodes) {
                return pnode.nodes[name];
            }
        },
        _initPath: function (template) {
            function calPath(prefix, name, node) {
                prefix = prefix ? prefix + '.' + name : name;
                node.path = prefix;
                if (node.nodes) {
                    $.each(node.nodes, function (name) {
                        calPath(prefix, name, this);
                    });
                }
            }
            $.each(template.nodes, function (name) {
                calPath('', name, this);
            });
        },
        value: function () {
            var g = this.data('vxml').setting;
            if (g.$n.bDiv.is(':visible')) {//node model
                return methods.$n._xml(g);
            } else {//xml model
                return methods.$x._value(g);
            }
        },
        encode: function () {
            var value = methods.value.call(this);
            return $('<div/>').text(value).html();
        },
        $n: {
            _show: function (g) {
                g.$n.tDiv.show();
                g.$n.bDiv.show();
                g.pDiv.hide();
            },
            _hide: function (g) {
                g.$n.tDiv.hide();
                g.$n.bDiv.hide();
                g.pDiv.hide();
            },
            _isRoot: function (node) {
                return node.hasClass('vxml-node-root');
            },
            _selectElement: function (element) {
                element.addClass('vxml-node-active');
            },
            _unselectElement: function (element) {
                element.removeClass('vxml-node-active');
            },
            _getSelectedElement: function (g) {
                return $('.vxml-node-active', g.$n.bDiv);
            },
            _getSelectedOrRootElement: function (g) {
                var element = this._getSelectedElement(g);
                if (!element || element.length == 0) {
                    return g.$n.root;
                } else {
                    return element;
                }
            },
            _isElementSelected: function (element) {
                return element.hasClass('vxml-node-active');
            },
            _selectOneElement: function (g, element) {
                this._unselectElement(this._getSelectedElement(g));
                this._selectElement(element);
            },
            _createRibbonBar: function (g) {
                var pool = [], bar = $('<table></table>'), tr = $('<tr></tr>');
                $.each(g.template.nodes, function (name) {
                    if (this.nodes) {
                        pool.push(this);
                    }
                });
                while (pool.length > 0) {
                    var node = pool.shift();
                    tr.append($('<td></td>').append(methods.$n._createRibbon(node, g)));
                    if (node.nodes) {
                        var prePath = node.path;
                        $.each(node.nodes, function (name) {
                            if (this.nodes) {
                                pool.push(this);
                            }
                        });
                    }
                }
                bar.append(tr);
                return bar;
            },
            _createRibbon: function (node, g) {
                var div = $('<div class="vxml-toolbar-ribbon"></div>')
                    , top = $('<div class="vxml-toolbar-ribbon-item"></div>')
                    , bottom = $('<div class="vxml-toolbar-ribbon-title"></div>');
                div.attr('path', node.path);
                $.each(node.nodes, function (name) {
                    var span = $('<span></span>');
                    span.attr('path', this.path);
                    span.text(this.display ? this.display : name);
                    span.click(function () {
                        if ($(this).attr('disable') == 'disable') {
                            return;
                        }

                        methods.$n._addNode(g, methods._getNode(g.template, $(this).attr('path')));
                        methods.$n._setToolbarState(g);
                    });
                    top.append(span);
                });
                bottom.text(node.display);
                div.append(top).append(bottom);
                return div;
            },
            _clear: function (element) {
                element.children('.vxml-node-body:first').empty();
            },
            _createNode: function (g, node, level) {
                var div = $('<div class="vxml-node"></div>');
                var name = methods._lastName(node.path);
                var display = $('<span class="vxml-node-display"></span>').text((node.display ? node.display : name) + ":");
                div.attr('path', node.path);
                var editor = $('<div></div>');
                div.append(display).append(editor);;
                if (node.nodes) {
                    editor.addClass('vxml-node-summary').html('&nbsp;');
                    var icon = $('<span class="vxml-node-handle"></span>');
                    icon.click(function (ev) {
                        ev.stopPropagation();
                        var t = $(this), p = t.parent();
                        if (t.attr("collapse") == "true") {
                            t.attr('collapse', '');
                            p.children('.vxml-node-body').show();
                            p.children('.vxml-node-summary').html('&nbsp;');
                        } else {
                            t.attr('collapse', 'true');
                            p.children('.vxml-node-body').hide();
                            var summary = methods.$n._getSummary(g, t.parent());
                            if (summary) {
                                p.children('.vxml-node-summary').text(summary);
                            } else {
                                p.children('.vxml-node-summary').html('&nbsp;');
                            }
                        }
                    });
                    div.prepend(icon);
                    var body = $('<div class="vxml-node-body"></div>');
                    if (level != 'single') {//do not add child nodes.
                        $.each(node.nodes, function (name) {
                            switch (level) {
                                case 'all'://all child.
                                    body.append(methods.$n._createNode(g, this, level));
                                    break;
                                case 'required'://only required child.
                                default:
                                    if (this.required) {
                                        body.append(methods.$n._createNode(g, this, level));
                                    }
                                    break;
                            }
                        });
                    }
                    div.append(body);
                } else {
                    editor.addClass('vxml-node-editor').append(methods.$n._createEditor(g, node, node.value));
                }
                div.click(function (ev) {
                    ev.stopPropagation();
                    var target = $(ev.target);
                    while (true) {
                        if (target.hasClass('vxml-node-editor')) {
                            return;
                        }
                        if (target.hasClass('vxml-node') || target.hasClass('vxml')) {
                            break;
                        }
                        target = target.parent();
                    }
                    var $t = $(this);
                    if (methods.$n._isElementSelected($t)) {
                        methods.$n._unselectElement($t);
                    } else {
                        methods.$n._selectOneElement(g, $t);
                    }
                    methods.$n._setToolbarState(g);
                });
                return div;
            },
            _createEditor: function (g, node, value) {
                switch (node.type) {
                    case 'boolean':
                        return $('<input type="checkbox"/>').val(value);
                        break;
                    case 'multi':
                    case 'single':
                        return $('<input type="text" />').val(value)
                            .keyup(function () {
                                var control = $(this);
                                if (control.val().trim().length > 0) {
                                    var path = control.closest('.vxml-node').attr('path');
                                    methods.$n._popup(g, path, control);
                                } else if (control.val().trim().length == 0) {
                                    g.pDiv.hide();
                                }
                            });
                    case 'text':
                    default:
                        return $('<input type="text"/>').val(value);
                        break;
                }
            },
            _popup: function (g, nodePath, control) {
                var node = methods._getNode(g.template, nodePath)
                    , key = control.val()
                    , position = control.position();
                if (!g.popuper) {
                    g.popuper = {};
                }
                g.popuper.editor = control;
                g.popuper.node = node;
                position.top += control.height();
                position.width = control.width();
                if (node.type == 'multi') {
                    key = key.split(';').remove('', true).last();
                }
                var source = methods._getSource(g, node.source, key);
                g.pDiv.hide();
                if (!source) {
                    return;
                }
                g.pDiv.empty().append(methods._createPopupContent(source, control.val(), node.type == 'multi'));
                if (source == 'remote_load') {
                    var url = node.source.substr(7);
                    $.getJSON(url, { keyword: key }, function (data) {
                        if (!g.remoteSourceCache[url]) {
                            g.remoteSourceCache[url] = {};
                            g.remoteSourceCache[url][key] = data;
                        }
                        if (g.popuper.editor.is(control)) {
                            g.pDiv.empty().append(methods._createPopupContent(data, control.val(), node.type == 'multi'));
                        }
                    }).error(function (data) {
                        if (g.onLoadError) {
                            g.onLoadError(data);
                        }
                    });
                }
                g.pDiv.show().css(position);
            },
            _getSubnodePathList: function (node) {
                var path = [];
                if (node.nodes) {
                    $.each(node.nodes, function () {
                        path.push(this.path);
                    });
                }
                return path;
            },
            _getSubelementPathList: function (element) {
                var path = [];
                element.children('.vxml-node-body:first')
                    .children('.vxml-node')
                    .each(function () {
                        path.push($(this).attr('path'));
                    });
                return path;
            },
            _getSummary: function (g, element) {
                var node = methods._getNode(g.template, element.attr('path'));
                if (node.nodes) {
                    var summary = node.summary ? node.summary.split(',') : null, result = [];
                    $.each(node.nodes, function (name) {
                        if (summary && !summary.contains(name)) {
                            return;
                        }
                        var subElement = element.children('.vxml-node-body:first').children('.vxml-node[path="' + this.path + '"]');
                        if (subElement.length > 0) {
                            result.push(methods.$n._getSummary(g, subElement));
                        }
                    });
                    return result.remove('', true).join(';');
                } else {
                    return this._getValue(element);
                }
            },
            _setToolbarState: function (g) {
                var element = methods.$n._getSelectedOrRootElement(g);
                var path = element.attr('path');
                var node = methods._getNode(g.template, path);
                var tpath = this._getSubnodePathList(node),
                    epath = this._getSubelementPathList(element);
                if (node.depend) {
                    $.each(node.depend.split(','), function () {
                        var dnode = methods._getNode(g.template, this.valueOf());
                        if (dnode) {
                            tpath.addRange(methods.$n._getSubnodePathList(dnode));
                        }
                    });
                }
                var pathFilter = [];
                $.each(tpath, function () {
                    var p = this.valueOf();
                    if (methods._getNode(g.template, p).single) {
                        if (!epath.contains(this.valueOf())) {
                            pathFilter.push('[path="' + p + '"]');
                        }
                    } else {
                        pathFilter.push('[path="' + p + '"]');
                    }
                });
                g.$n.tDiv.find('.vxml-toolbar-ribbon-item span')
                    .attr('disable', 'disable')
                    .filter(pathFilter.join(','))
                    .attr('disable', '');
                if (methods.$n._isRoot) {
                    //todo:disable the delete and copy and add button.
                }
            },
            _addNode: function (g, node, element, level) {
                if (!element) {
                    element = methods.$n._getSelectedOrRootElement(g);
                }
                element = element.find('.vxml-node-body:first');
                var newEle = methods.$n._createNode(g, node, level);
                element.append(newEle);
                return newEle;
            },
            _initNodes: function (g) {
                g.$n.root.children(".vxml-node-body:first").empty();
                var root = g.template.nodes[g.$n.root.attr('path')];
                if (root.nodes) {
                    $.each(root.nodes, function () {
                        if (this.required) {
                            methods.$n._addNode(g, methods._getNode(g.template, this.path), g.$n.root);
                        }
                    });
                }
                methods.$n._setToolbarState(g);
            },
            _copyAndAdd: function (g) {
                var cnode = methods.$n._getSelectedOrRootElement(g);
                var pnode = cnode.closest('.vxml-node-body');
                if (methods.$n._isRoot(cnode)) {
                    pnode = cnode.children('.vxml-node-body');
                    cnode = pnode.children('.vxml-node');
                }
                pnode.append(cnode.clone(true).removeClass('vxml-node-active'));
            },
            _getValue: function (element) {
                var control = element.children('.vxml-node-editor').children(':first');
                if (control.is(':checkbox')) {
                    return control.is(':checked');
                } else {
                    return control.val();
                }
            },
            _xml: function (g) {
                var xml = [], root = g.$n.bDiv.find('.vxml-node-root');
                var fill = function (node) {
                    var tagName = methods._lastName(node.attr('path'));
                    xml.push('<' + tagName + '>');
                    var sub = node.children('.vxml-node-body').children('.vxml-node');
                    if (sub.length > 0) {
                        sub.each(function () {
                            fill($(this));
                        });
                    } else {
                        xml.push(methods.$n._getValue(node));
                    }
                    xml.push('</' + tagName + '>');
                };
                fill(root);
                return xml.join('');
            },
            _json: function (g) {
                var json = {}, root = g.$n.bDiv.find('.vxml-node-root');
                var fill = function (obj, node) {
                    var tagName = methods._lastName(node.attr('path'));

                    var sub = node.children('.vxml-node-body').children('.vxml-node');
                    if (sub.length > 0) {
                        obj[tagName] = {};
                        sub.each(function () {
                            fill(obj[tagName], $(this));
                        });
                    } else {
                        obj[tagName] = methods.$n._getValue(node);
                    }
                };
                fill(json, root);
                return json;
            }
        },
        $x: {
            _show: function (g) {
                methods.$n._hide(g);
                g.$x.div.show();
                g.$x.body.text(methods.$n._xml(g));
                this._format(g);
                methods.height.call(g.$t, g.height);
            },
            _hide: function (g) {
                g.$x.div.hide();
                methods.$n._show(g);
            },
            _value: function (g, value) {
                if (value) {
                    g.$x.body.text(value);
                } else {
                    return g.$x.body.text();
                }
            },
            _toNode: function (g) {
                this._xmlToNode(g, g.$x.body.text());
            },
            _format: function (g) {
                try {
                    var xml = g.$x.body.text();
                    var buffer = []
                        , doc = $($.parseXML(xml));
                    if (doc) {
                        function fillBuffer(ele, tab) {
                            var name = ele.get(0).tagName;
                            if (ele.children().length > 0) {
                                buffer.push('<div style="padding-left:{0}px;">'.format(tab));
                                buffer.push('&lt;{0}&gt;'.format(name));
                                buffer.push('</div>');
                                ele.children().each(function () {
                                    fillBuffer($(this), tab + 20);
                                });
                                buffer.push('<div style="padding-left:{0}px;">'.format(tab));
                                buffer.push('&lt;/{0}&gt;'.format(name));
                                buffer.push('</div>');
                            } else {
                                buffer.push('<div style="padding-left:{0}px;">'.format(tab));
                                buffer.push('&lt;{0}&gt;{1}&lt;/{0}&gt;'.format(name, ele.text()));
                                buffer.push('</div>');
                            }
                        }
                        doc.children().each(function () {
                            fillBuffer($(this), 0);
                        });
                    }
                    g.$x.body.html(buffer.join(''));
                } catch (err) {
                    alert('invalid xml');
                }
            },
            _xmlToNode: function (g, xml) {
                var doc = $.parseXML(xml);
                function createEle(ele, target, path) {
                    var name = ele.tagName;
                    path = path ? path + '.' + name : name;
                    var node = {};
                    node.path = path;
                    ele = $(ele);
                    var children = ele.children();
                    if (children.length == 0) {
                        node.value = ele.text();
                    }
                    var tnode = methods._getNode(g.template, path);
                    if (tnode) {
                        $.extend(true, node, $.extend(true, {}, tnode, node));
                    }
                    var element = methods.$n._addNode(g, node, target, 'single');
                    if (ele.children().length > 0) {
                        ele.children().each(function () {
                            createEle(this, element, path);
                        });
                    }
                };
                methods.$n._clear(g.$n.root);
                doc = $(doc);
                if (doc.children().length > 0) {
                    var path = doc.children().get(0).tagName;
                    $(doc).children(':first').children().each(function () {
                        createEle(this, g.$n.root, path);
                    });
                }
                methods.$n._setToolbarState(g);
            }
        },
        _xmlMode: function (g) {

        }
    };
    $.fn.vxml = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vxml');
        }
    };
})(jQuery);