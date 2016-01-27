(function ($) {
    var methods = {
        'default': {
            height: '300', //default height
            width: 'auto', //auto width
            minwidth: 30, //min width of columns
            url: false,
            searchAction: "Search",
            usePage: true,
            resizable: true,
            rp: 15, //results per page
            rpOptions: [15, 20, 30, 50, 100], //allowed per-page values 
            pagestat: 'Displaying {from} to {to} of {total} items',
            noDataMsg: 'No Data Available',
            caption: 'v-grid',
            showCaption: true,
            checkbox: false,
            checkboxWidth: 25,
            sortable: true,
            columns: [],//statistics:'sum','count','average','max','min',,
            rowProps: [],
            filter: 'auto',//auto|true|false, auto means !usePage
            scaleWidth: false,
            startIdx: 0,//the start index of data list.
            endIdx: 0,//the end index of data list.
            totalCount: 0,//total data count
            page: 1, //current page
            pageCount: 1, //total pages
            primaryColumnClick: null,
            editColumnDbclick: null,
            fixedParams: null,
            onBind: null,//exec after data bind,
            onColumnFilter: null,
            orderBy: '',
            order: 'asc',
            onCreate: null// exec after grid created.,
        },
        init: function (option) {
            return this.each(function () {
                var g = $.extend({}, methods["default"], option);
                var $t = $(this);
                $t.width(g.width);
                $t.vloading();
                g.gDiv = $t;
                g.tDiv = $("<div></div>").width(g.width);//create title container
                g.hDiv = $("<div></div>").width(g.width);//create header container
                g.bDiv = $("<div></div>").width(g.width);//create body container
                g.dDiv = $("<div></div>").width(g.width);//create column drag
                g.pDiv = $("<div></div>").width(g.width);//create pager container
                g.totalDiv = $('<div class="vgrid-total"/>').width(g.width).hide();//crate total bar.
                g.gDiv.addClass('vgrid');
                g.tDiv.addClass('vgrid-caption').append($("<span tp='caption'></span>").html(g.caption));
                if (!g.showCaption) {
                    g.tDiv.hide();
                }

                $t.append(g.tDiv);
                g.hDiv.addClass('vgrid-header').append('<div></div>');
                g.hTable = $('<table cellpadding="0" cellspacing="0"></table>');
                var tr = $('<tr></tr>');
                var baseWidth = g.checkboxWidth;
                var tcwidth = 0;
                var totalWidth = g.width;
                if (g.scaleWidth) {
                    totalWidth -= 50;//for the scroll-bar :y
                    g.columns.each(function () { if (this.width && typeof (this.width) == 'number') { tcwidth += this.width; } else { tcwidth += baseWidth; } });
                }
                if (g.checkbox) {
                    totalWidth -= baseWidth;
                }
                var rw = totalWidth;
                g.columns.each(function (idx) {
                    if (g.scaleWidth) {
                        var w = typeof (this.width) == 'number' ? this.width : baseWidth;
                        if (idx != g.columns.length - 1) {
                            this.rwidth = Math.round(w / tcwidth * totalWidth);
                            rw -= this.rwidth;
                            this.rwidth -= 1;//for the right-border width:1px;
                        } else {
                            this.rwidth = rw - 1;
                        }
                    } else {
                        this.rwidth = this.width;
                    }
                });
                if (g.checkbox) {
                    g.columns.unshift({
                        checkbox: true,
                        width: baseWidth,
                        rwidth: g.scaleWidth ? baseWidth - 1 : baseWidth
                    });
                }
                g.tbWidth = 0;
                g.columns.each(function () {
                    var th = $('<th></th>');
                    if (this.checkbox) {
                        var ck = $("<input type='checkbox'/>");
                        th.append($('<div></div>').width(this.rwidth).append(ck));
                        ck.click(function (ev) {
                            methods._checkAll.call(this, ev, g);
                        });
                        g.checkAllBox = ck;
                    } else {
                        var _hd = $('<div></div>').width(this.rwidth).text(this.caption);
                        if (this.filter) {
                            var _fd = $('<div class="vgrid-column-filter-icon"/>');
                            var _tc = this;
                            _fd.click(function (ev) {
                                ev.stopPropagation();
                                methods._showfilterColumnPanel(_hd, _tc, g);
                            });
                            _hd.append(_fd);
                        }
                        th.append(_hd);
                    }
                    th.attr('field', this.field);
                    g.tbWidth += this.rwidth;
                    if (this.field == g.orderBy) {
                        if (g.order == 'desc') {
                            th.removeClass('sortup').addClass('sortdown');
                        } else {
                            th.removeClass('sortdown').addClass('sortup');
                        }
                        th.siblings().removeClass('sortup').removeClass('sortdown');
                    }
                    if (!this.checkbox && g.sortable && !(this.sortable === false)) {
                        th.click(function (ev) {
                            var $t = $(this);
                            var order = $t.hasClass('sortup') ? "desc" : "asc";
                            methods.order.call(g.gDiv, $t.attr('field'), order);
                        });
                    }
                    tr.append(th);
                });
                //g.hTable.width(g.tbWidth);
                g.hTable.append(tr);
                tr = null;
                $('div', g.hDiv).append(g.hTable);
                $t.append(g.hDiv);
                if (g.filter == 'auto') {
                    g.filter = !g.usePage;
                }
                if (g.filter) {
                    var filterIcon = $('<div class="vgrid-filter-icon"></div>').css('top', g.hDiv.position().top);
                    var toggleFilter = function () {
                        if (filterBox.is(':visible')) {
                            filterBox.hide();
                        } else {
                            var top = filterIcon.offset().top - g.gDiv.offset().top + filterIcon.height() - filterBox.height();
                            filterBox.show().css({ "top": top });
                        }
                    };
                    g.gDiv.append(filterIcon);
                    var filterBox = $('<div class="vgrid-filter-box"></div>');
                    g.gDiv.append(filterBox);
                    filterBox.hide()
                        .append('<input type="text"/>')
                        .click(function (ev) {
                            ev.stopPropagation();
                        }).keyup(function (ev) {
                            if (ev.keyCode == 27) {
                                filterBox.hide();
                                filterBox.find('input').val('');
                            }
                            methods.filter.call($t);
                        });
                    g.filterBox = filterBox;
                    filterIcon.click(function (ev) {
                        ev.stopPropagation();
                        toggleFilter();
                    });
                    $('body').bind('click.vgrid', function () {
                        filterBox.hide();
                        methods._hideFilterColumnPanel(g);
                    });
                }

                g.bDiv.addClass('vgrid-body');
                var bTable = $('<table cellpadding="0" cellspacing="0"></table>');
                //bTable.width(g.tbWidth);
                g.bDiv.append(bTable);
                $t.append(g.bDiv);
                g.bDiv.scroll(function (e) {
                    methods._scroll(g);//scroll function--no-test
                });
                var bHeight = g.height;
                if (g.showCaption) {
                    bHeight = bHeight - g.tDiv.outerHeight(true) - g.hDiv.outerHeight(true);
                }
                if (g.usePage) {
                    g.newp = g.page;
                    g.pDiv.addClass("vgrid-pagebar");
                    var div = $('<div></div>');
                    div.addClass("pageGroup");
                    var sel = $("<select></select>");
                    sel.addClass("pageOption");
                    g.rpOptions.each(function () {
                        var v = this.valueOf();
                        var op = $("<option></option>");
                        if (v == g.rp) {
                            op.attr('selected', true);
                        }
                        sel.append(op.val(v).text(v));
                    });
                    sel.change(function () {
                        g.rp = $(this).val();
                        if ($('.pagination', g.pDiv).val() != 1) {
                            $('.pagination', g.pDiv).val(1);
                            methods._changePage(g, 'input');
                        } else {
                            g.newp = 1;
                            methods.search.call(g.gDiv);
                        }
                    });
                    div.append(sel);
                    g.pDiv.append(div);
                    g.pDiv.append('<div class="btnseparator"></div>');
                    div = $("<div></div>");
                    div.addClass("pageGroup");
                    var refbtn = $('<div class="pageButton pageRefresh"></div>');
                    refbtn.click(function () {
                        methods._reload(g);
                    });
                    div.append(refbtn);
                    g.pDiv.append(div);
                    g.pDiv.append('<div class="btnseparator"></div>');
                    div = $('<div></div>');
                    div.addClass("pageGroup");
                    var fbtn = $("<div></div>");
                    fbtn.addClass("pageButton pageFirst");
                    div.append(fbtn);
                    var pbtn = $("<div></div>");
                    pbtn.addClass("pageButton pagePrev");
                    div.append(pbtn);
                    g.pDiv.append(div);
                    g.pDiv.append('<div class="btnseparator"></div>');

                    div = $("<div></div>");
                    div.addClass("pageGroup");
                    div.append("<div class='pageInfo'>Page</div>");
                    var cpage = $("<input type='text' value='1'/>");
                    cpage.addClass("pagination");
                    div.append(cpage);
                    div.append("<div class='pageInfo'>of <span t='pn'>1<span></div>");
                    g.pDiv.append(div);
                    g.pDiv.append('<div class="btnseparator"></div>');

                    div = $('<div></div>');
                    div.addClass("pageGroup");
                    var nbtn = $("<div></div>");
                    nbtn.addClass("pageButton pageNext");
                    div.append(nbtn);
                    var lbtn = $("<div></div>");
                    lbtn.addClass("pageButton pageLast");
                    div.append(lbtn);
                    g.pDiv.append(div);
                    g.pDiv.append('<div class="btnseparator"></div>');

                    div = $('<div></div>');
                    div.addClass("pageGroup");
                    var pInfo = $("<div></div>");
                    pInfo.addClass("pageInfo");
                    div.append(pInfo);
                    g.pDiv.append(div);
                    fbtn.click(function () {
                        methods._changePage(g, "first");
                    });
                    pbtn.click(function () {
                        methods._changePage(g, "prev");
                    });
                    nbtn.click(function () {
                        methods._changePage(g, "next");
                    });
                    lbtn.click(function () {
                        methods._changePage(g, "last");
                    });
                    cpage.keydown(function (e) {
                        if (e.keyCode == 13) {
                            methods._changePage(g, 'input');
                        }
                    });
                    $t.append(g.pDiv);
                    methods._pageInfo(g);
                    bHeight -= g.pDiv.outerHeight(true);
                }
                g.bDiv.height(bHeight);
                $t.append(g.totalDiv);
                if (g.resizable) {
                    g.dDiv.addClass("vgrid-dragbar").css('top', g.hDiv.position().top);//.outerHeight());
                    var dHeight = g.hDiv.outerHeight();// + g.bHeight;
                    g.hDiv.find('th').each(function () {
                        var bar = $("<div></div>");
                        bar.css({ height: dHeight, left: $(this).position().left + $(this).width() });
                        bar.hover(function (ev) {
                            methods._showDragBar(ev, $(this), g);
                        }, function (ev) {
                            methods._hideDragBar(ev, $(this), g);
                        }).mousedown(function (ev) {
                            methods._dragStart(ev, $(this), g);
                        }).dblclick(function (ev) {
                            methods._autoResizeColumn(ev, $(this), g);
                        });
                        g.dDiv.append(bar);
                    });
                    $("body").mousemove(function (ev) {
                        methods._dragMove(ev, g);
                    });
                    $("body").mouseup(function (ev) {
                        methods._dragEnd(g);
                    });
                    g.bDiv.before(g.dDiv);
                }
                $t.data('vgrid', {
                    setting: g,
                    target: $t,
                    data: null
                });
                if (g.onCreate) {
                    g.onCreate.call($t, g);
                }
            });
        },
        destroy: function () {
            return this.each(function () {
                var $this = $(this);
                $this.vloading("destroy");
                var data = $this.data('vgrid');
                if (data) {
                    $(window).unbind('.vgrid');
                    $this.removeData('vgrid');
                    $this.empty();
                }
            });
        },
        order: function (field, order) {
            return this.each(function () {
                var grid = $(this),
                    d = grid.data('vgrid'),
                    g = d.setting;
                var idx = methods.columnIndex.call($(this), field);
                if (idx < 0) {
                    return;
                }
                if (!g.usePage) {
                    var type = g.columns[idx].type;
                    methods._sort.call(g.gDiv, idx, order, type);
                } else {
                    g.orderBy = field;
                    g.order = order;
                    methods.search.call(g.gDiv);
                }
                var th = grid.find('.vgrid-header tr:first').find('th:eq(' + idx + ')');
                if (order == 'desc') {
                    th.removeClass('sortup').addClass('sortdown');
                } else {
                    th.removeClass('sortdown').addClass('sortup');
                }
                th.siblings().removeClass('sortup').removeClass('sortdown');
            });
        },
        _showfilterColumnPanel: function (headerDiv, column, g) {
            var data = methods.data.call(g.gDiv);
            if (!data || data.length == 0) {
                return;
            }
            var idx = headerDiv.closest('th').index();
            column.visibleIndex = idx;
            var tds = g.bDiv.find('tr').find('td:eq(' + idx + ')'), values = [];
            tds.each(function () {
                values.push($(this).text());
            });
            values = values.distinct();
            if (!g.cfDiv) {
                g.cfDiv = $('<div class="vgrid-column-filter-panel"/>');
                var hd = $('<div class="vgrid-column-filter-header"/>').text('select item to filter');
                var fd = $('<input type="text" class="vgrid-column-filter-search" placeholder="Search"/>');
                fd.bind('keyup', function (ev) {
                    if (ev.keyCode == 27) {
                        g.cfDiv.hide();
                    }
                    var txt = $(this).val().toLowerCase().trim();
                    g.cfDiv.find('ul li:first').siblings().each(function () {
                        if (!$(this).text().toLowerCase().contains(txt)) {
                            $(this).hide();
                        } else {
                            $(this).show();
                        }
                    });
                });
                var ld = $('<div  class="vgrid-column-filter-list"/>');
                var ul = $('<ul/>').appendTo(ld);
                ul.append('<li><div><div><input type="checkbox"/></div><div>(Select All)</div></div></li>');
                var ok = $('<div class="vgrid-column-filter-ok">ok</div>');
                var cancel = $('<div class="vgrid-column-filter-cancel">cancel</div>');
                var ckall = ul.find('input');
                ckall.click(function () {
                    var ck = $(this).is(':checked');
                    ul.find('li:first').siblings().find('input[type="checkbox"]').attr('checked', ck);
                    ok.attr('disable', !ck);
                });
                g.cfDiv.append(hd, fd, ld, cancel, ok).click(function (ev) { ev.stopPropagation(); });
                ok.click(function (ev) {
                    var v = [];
                    ul.find('li:first').siblings().find('input:checked').closest('div').siblings().each(function () {
                        v.push($(this).text());
                    });
                    var icon = headerDiv.find('.vgrid-column-filter-icon');
                    if (v.length == values.length || v.length == 0) {
                        column.filterTexts = null;
                        icon.attr('onfilter', '');
                    } else {
                        column.filterTexts = v;
                        icon.attr('onfilter', 'onfilter');
                    }
                    methods._filterColumns(g);
                    if (g.onColumnFilter) {
                        g.onColumnFilter.call(g.gDiv, g);
                    }
                    methods._hideFilterColumnPanel(g);
                });
                cancel.click(function (ev) {
                    methods._hideFilterColumnPanel(g);
                });
                g.gDiv.append(g.cfDiv);
                g.cfDiv.resizable({
                    create: function (ev, ui) {
                        $(this).find('.ui-resizable-se').addClass('vgrid-column-filter-dragbar');
                    },
                    resize: function (ev, ui) {
                        var el = ui.element;
                        el.find('.vgrid-column-filter-header,.vgrid-column-filter-search,.vgrid-column-filter-list')
                            .width(el.width() - 50);
                        el.find('.vgrid-column-filter-search').css('background-position-x', el.width() - 70);
                        el.find('.vgrid-column-filter-list').height(el.height() - 150);
                    }
                }).draggable();
            }
            var ul = g.cfDiv.find('ul');
            ul.find('li:first').siblings().remove();
            var ckall = ul.find('li:first').find('input');
            $.each(values, function () {
                var li = $('<li/>');
                var ckbox = $('<input type="checkbox"/>');
                li.append($('<div/>').append(ckbox),
                    $('<div></div>').text(this.valueOf()));
                ul.append(li);
                if (!column.filterTexts || column.filterTexts.contains(this.valueOf())) {
                    ckbox.attr('checked', true);
                }
                ckbox.click(function () {
                    if (!$(this).is(":checked")) {
                        ckall.attr('checked', false);
                    }
                    var ok = g.cfDiv.find('.vgrid-column-filter-ok');
                    var cklen = ul.find('input:checked').length;
                    if (cklen == 0) {
                        ok.attr('disable', true);
                    } else {
                        if (cklen == ul.find('li').length - 1) {
                            ckall.attr('checked', true);
                        }
                        ok.attr('disable', false);
                    }
                });
            });
            if (!column.filterTexts || column.filterTexts.length == values.length) {
                ul.find('li:first').find('input').attr('checked', true);
            }
            var iof = headerDiv.find('.vgrid-column-filter-icon').offset(), dof = g.gDiv.offset();
            var top = iof.top - dof.top + 17, left = iof.left - dof.left;
            g.cfDiv.css('top', top);
            if (left + g.cfDiv.width() > dof.left + g.gDiv.width()) {
                g.cfDiv.css('right', left + 17);
            } else {
                g.cfDiv.css('left', left);
            }
            g.cfDiv.show();
            window.g = g;
        },
        _filterColumns: function (g) {
            var hideRows = [];
            g.bDiv.find('tr').each(function () {
                var tr = $(this), clen = g.columns.length;
                for (var idx = 0; idx < clen; idx++) {
                    var col = g.columns[idx];
                    if (col.filter && col.filterTexts) {
                        var v = tr.find('td:eq(' + col.visibleIndex + ')').text();
                        if (!col.filterTexts.contains(v)) {
                            hideRows.push(tr);
                            break;
                        }
                    }
                }
            }).show();
            $.each(hideRows, function () {
                this.hide();
            });
            var vdatas = methods.visibleData.call(g.gDiv);
            methods._drawTotal(g, vdatas);
        },
        _hideFilterColumnPanel: function (g) {
            if (g.cfDiv) {
                g.cfDiv.hide();
            }
        },
        _showDragBar: function (ev, bar, g) {
            var h = g.hDiv.outerHeight(true) + g.bDiv.outerHeight(true);
            bar.height(h);
        },
        _hideDragBar: function (ev, bar, g) {
            var h = g.hDiv.outerHeight(true);
            bar.height(h);
        },
        _dragStart: function (ev, bar, g) {
            ev.preventDefault();
            var n = bar.index();
            var ow = $('th:eq(' + n + ') div:first', g.hDiv).width();
            bar.addClass('dragging').siblings().hide();
            methods._showDragBar(ev, bar, g);
            methods._showDragBar(ev, bar.prev().addClass('dragging').show(), g);
            g.colresize = {
                startX: ev.pageX,
                ol: bar.position().left,
                bar: bar,
                ow: ow,
                n: n
            };
            $('body').vNoSelect();
        },
        _dragMove: function (ev, g) {
            if (g.colresize) {
                var n = g.colresize.n;
                var diff = ev.pageX - g.colresize.startX;
                var nleft = g.colresize.ol + diff;
                var nw = g.colresize.ow + diff;
                if (nw > g.minwidth) {
                    g.colresize.bar.css('left', nleft);
                    g.colresize.nw = nw;
                }
            }
        },
        _dragEnd: function (g) {
            if (g.colresize) {
                var n = g.colresize.n;
                var nw = g.colresize.nw;
                $('th:eq(' + n + ') div:first', g.hDiv).width(nw);
                $('tr', g.bDiv).find('td:eq(' + n + ') div:first').width(nw);
                $('tr', g.totalDiv).find('td:eq(' + n + ') div:first').width(nw);
                g.columns[n].rwidth = nw;
                g.hDiv.scrollLeft(g.bDiv.scrollLeft());
                $('div:eq(' + n + ')', g.dDiv).siblings().show();
                $('.dragging', g.dDiv).removeClass('dragging').each(function () {
                    methods._hideDragBar(null, $(this), g);
                });
                methods._rePosDrag(g);
                g.colresize = false;
            }
            $('body').vNoSelect(false);
        },
        _autoResizeColumn: function (ev, bar, g) {
            if (!g.resizable) {
                return;
            }
            var n = bar.index();
            var span = $("<span></span>");
            span.css({ 'padding': '0px' });
            span.hide();
            var div = g.hDiv.find('th:eq(' + n + ') div:first').clone();
            div.css('width', 'auto');
            span.append(div);
            $('body').children(":first").before(span);
            var nw = span.width();
            $('tr', g.bDiv).each(function () {
                div = $('td:eq(' + n + ') div:first', this).clone();
                div.css('width', 'auto');
                span.empty().append(div);
                nw = (span.width() > nw) ? span.width() : nw;
            });
            span.remove();
            if (g.minwidth > nw) {
                nw = g.minwidth;
            }
            g.colresize = {
                nw: nw,
                n: n
            };
            methods._dragEnd(g);
        },
        _rePosDrag: function (g) {
            g.dDiv.css('top', g.hDiv.position().top);
            g.hDiv.find('th').each(function (idx) {
                var bar = g.dDiv.find('div:eq(' + idx + ')');
                bar.css('left', $(this).position().left + $(this).width());
            });
        },
        _compare: function (tr1, tr2, filter, type) {
            var v1 = $(tr1).find(filter).text().toLowerCase();
            var v2 = $(tr2).find(filter).text().toLowerCase();
            switch (type) {
                case "number":
                    v1 = parseFloat(v1, 10);
                    v2 = parseFloat(v2, 10);
                    break;
                case "date":
                    v1 = new Date(v1);
                    v2 = new Date(v2);
                    break;
                case "size":
                    v1 = vstorm.convertSizeStrToFloat(v1);
                    v2 = vstorm.convertSizeStrToFloat(v2);
                    break;
                case "string":
                default:
                    break;
            }
            return v1 == v2 ? 0 : (v1 > v2 ? 1 : -1);
        },
        _sort: function (idx, order, type) {
            return this.each(function () {
                var t = $(this);
                var tbody = t.find('.vgrid-body table:first');
                var rows = tbody.find('tr');
                var op = order == 'desc' ? -1 : 1;
                var filter = 'td:eq(' + idx + ')';
                var func = function (tr1, tr2) {
                    return op * methods._compare(tr1, tr2, filter, type);
                };
                rows.sort(func);
                var frg = document.createDocumentFragment();
                rows.each(function () {
                    frg.appendChild(this);
                });
                tbody.append(frg);
            });

        },
        _select: function (row, v, g) {
            var trs = row;
            if (typeof row == "string") {
                trs = g.bDiv.find('tr' + row);
            }
            trs.attr({ vselected: v, vchecked: v });
            if (g.checkbox) {
                trs.find('input[type="checkbox"]:first').attr('checked', v);
                g.checkAllBox.attr('checked', trs.parent().children(':visible[vchecked="true"]').length >= trs.parent().children(':visible').length);
            }
            if (trs.length > 0 && g.onSelect) {
                g.onSelect();
            }
        },
        _pageInfo: function (g) {
            g.disableEvent = true;
            g.pDiv.find('span[t="pn"]').text(g.pageCount);
            g.pDiv.find('.pagination').val(g.page);
            var pinfo = g.pagestat;
            pinfo = pinfo.replace(/{from}/, g.startIdx);
            pinfo = pinfo.replace(/{to}/, g.endIdx);
            pinfo = pinfo.replace(/{total}/, g.totalCount);
            g.pDiv.find('.pageInfo:last').text(pinfo);
            g.disableEvent = false;
        },
        _changeSort: function (th) { //change sortorder
            if (this.loading) {
                return true;
            }
            $(g.nDiv).hide();
            $(g.nBtn).hide();
            if (p.sortname == $(th).attr('abbr')) {
                if (p.sortorder == 'asc') {
                    p.sortorder = 'desc';
                } else {
                    p.sortorder = 'asc';
                }
            }
            $(th).addClass('sorted').siblings().removeClass('sorted');
            $('.sdesc', this.hDiv).removeClass('sdesc');
            $('.sasc', this.hDiv).removeClass('sasc');
            $('div', th).addClass('s' + p.sortorder);
            p.sortname = $(th).attr('abbr');
            if (p.onChangeSort) {
                p.onChangeSort(p.sortname, p.sortorder);
            } else {
                this.populate();
            }
        },
        _changePage: function (g, ctype) { //change page
            if (this.loading) {
                return true;
            }
            switch (ctype) {
                case 'first':
                    g.newp = 1;
                    break;
                case 'prev':
                    if (g.page > 1) {
                        g.newp = parseInt(g.page) - 1;
                    }
                    break;
                case 'next':
                    if (g.page < g.pageCount) {
                        g.newp = parseInt(g.page) + 1;
                    }
                    break;
                case 'last':
                    g.newp = g.pageCount;
                    break;
                case 'input':
                    var nv = parseInt($('.pagination', g.pDiv).val());
                    if (isNaN(nv)) {
                        nv = 1;
                    }
                    if (nv < 1) {
                        nv = 1;
                    } else if (nv > g.pageCount) {
                        nv = g.pageCount;
                    }
                    $('.pagination', g.pDiv).val(nv);
                    g.newp = nv;
                    break;
            }
            if (g.newp == g.page) {
                return false;
            }
            if (g.onChangePage) {
                g.onChangePage(g.newp);
            } else {
                methods.search.call(g.gDiv);
            }
        },
        _checkAll: function (ev, g) {
            var ck = $(this).is(':checked');
            methods._select(':visible', ck, g);
        },
        _scroll: function (g) {
            g.hDiv.scrollLeft(g.bDiv.scrollLeft());
            g.totalDiv.scrollLeft(g.bDiv.scrollLeft());
            methods._rePosDrag(g);
        },
        _rowClick: function (g) {
            var tr = $(this);
            if (g.checkbox) {
                var ckb = tr.find('input[type="checkbox"]:first');
                var ck = ckb.attr('checked');
                methods._select(tr, !ck, g);
            } else {
                var slct = tr.attr('vselected') == 'true';
                tr.attr('vselected', !slct);
                tr.siblings("[vchecked!='true']").attr('vselected', 'false');
            }
            if (g.onSelect) {
                g.onSelect();
            }
        },
        _checkSingle: function (ev, g) {
            ev.stopPropagation();
            var tr = $(this).closest('tr');
            var ck = $(this).is(':checked');
            var prop = { vselected: ck, vchecked: ck };
            tr.attr(prop);
            var idx = tr.index();
            if (ev.shiftKey) {
                if (typeof (g.lastCKIndex) != 'undefined') {
                    var ttr = tr
                        , iter = Math.min(g.lastCKIndex, idx)
                        , max = Math.max(g.lastCKIndex, idx)
                        , op = 'prev';

                    if (g.lastCKIndex > idx) {
                        op = 'next';
                    }
                    while (iter < max) {
                        iter++;
                        ttr = ttr[op]();
                        ttr.attr(prop)
                            .find('input[type="checkbox"]').attr('checked', ck);
                    }
                }
            }
            g.lastCKIndex = idx;
            g.checkAllBox.attr('checked', tr.parent().children(':visible[vchecked="true"]').length >= tr.parent().children(':visible').length);

            if (g.onSelect) {
                g.onSelect();
            }
        },
        setDragPosition: function () {
            return this.each(function () {
                var g = methods.setting.call($(this));
                methods._rePosDrag(g);
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
                    $(this).find('div.vgrid-caption span[tp="caption"]').text(v);
                });
            } else {
                return this.find('div.vgrid-caption span[tp="caption"]').text();
            }
        },
        filter: function () {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('vgrid');
                var g = data.setting;
                if (!g.filter) {
                    return;
                }
                var gdata = data.data;
                if (!gdata) {
                    return;
                }
                var key = $this.find('.vgrid-filter-box input').val().toLowerCase();
                var st = g.checkbox ? 1 : 0;
                var trs = g.bDiv.find('tr');
                if (key.length == 0) {
                    trs.show();
                    return;
                }
                var trCount = trs.length;
                var cols = [];
                g.columns.each(function (idx) {
                    if (!(this.filter === false)) {
                        cols.push(idx + st);
                    }
                });
                var colCount = cols.length;
                var hiddens = [];
                var shows = [];
                for (var trIdx = 0; trIdx < trCount; trIdx++) {
                    var tr = trs[trIdx];
                    var res = false;
                    for (var colIdx = 0; colIdx < colCount; colIdx++) {
                        var td = tr.cells[colIdx];
                        if (td.innerText.toLowerCase().contains(key)) {
                            res = true;
                            break;
                        }
                    }
                    if (res) {
                        shows.push(trs[trIdx]);
                    } else {
                        hiddens.push(trs[trIdx]);
                    }
                }
                $(shows).show();
                $(hiddens).hide();
            });
        },
        setting: function () {
            return this.data('vgrid').setting;
        },
        select: function (rowSelector) {
            return this.each(function () {
                var g = methods.setting.call($(this));
                var selector = rowSelector;
                if (typeof rowSelector == 'number') {
                    selector = ':eq({0})'.format(selector);
                }
                methods._select(selector, true, g);
            });
        },
        unSelectAll: function () {
            return this.each(function () {
                var g = methods.setting.call($(this));
                methods._select('[vselected="true"]', false, g);
            });
        },
        unSelectAllVisible: function () {
            return this.each(function () {
                var g = methods.setting.call($(this));
                methods._select(':visible', false, g);
            });
        },
        selectAll: function () {
            return this.each(function () {
                var g = methods.setting.call($(this));
                methods._select('', true, g);
            });
        },
        selectAllVisible: function () {
            return this.each(function () {
                var g = methods.setting.call($(this));
                methods._select(':visible', true, g);
            });
        },
        selectedRows: function () {
            return $(this).find('.vgrid-body tr[vselected="true"]');
        },
        selectedData: function () {
            var d = methods.data.call(this);
            var idx = methods.selectedRows.call(this).attr("didx");
            return d[idx];
        },
        visibleData: function () {
            var datas = methods.data.call(this);
            var result = [];
            var g = this.data('vgrid').setting;
            g.bDiv.find('tr:visible').each(function () {
                var idx = parseInt($(this).attr('didx'), 10);
                result.push(datas[idx]);
            });
            return result;
        },
        checkedDatas: function () {
            var d = methods.data.call(this);
            var sr = methods.selectedRows.call(this);
            var result = [];
            sr.each(function () {
                var idx = parseInt($(this).attr('didx'), 10);
                result.push(d[idx]);
            });
            return result;
        },
        _to$: function (obj) {
            if (obj instanceof jQuery) {
                return obj;
            }
            return $(obj);
        },
        getRow: function (rowIndex) {
            return $(this).find('.vgrid-body tr[didx="' + rowIndex + '"]');
        },
        rowIndex: function (row) {
            return parseInt(methods._to$(row).attr('didx'));
        },
        columnIndex: function (field) {
            if (!field) {
                return -1;
            }
            var columns = methods.setting.call(this).columns;
            if (columns) {
                var len = columns.length;
                for (var idx = 0; idx < len; idx++) {
                    if (columns[idx].field == field) {
                        return idx;
                    }
                }
            }
            return -1;
        },
        data: function (idx) {
            var data = this.data('vgrid').data;
            if (data && typeof (idx) != 'undefined' && idx >= 0) {
                return data[idx];
            }
            return data;
        },
        exportToCsv: function () {
            return this.each(function () {
                var data = $(this).find('.vgrid-header > table');
                var data = $(this).first(); //Only one table
                var csvData = [];
                var tmpArr = [];
                var tmpStr = '';
                data.find("tr").each(function () {
                    if ($(this).find("th").length) {
                        $(this).find("th").each(function () {
                            tmpStr = $(this).text().replace(/"/g, '""');
                            tmpArr.push('"' + tmpStr + '"');
                        });
                        csvData.push(tmpArr);
                    } else {
                        tmpArr = [];
                        $(this).find("td").each(function () {
                            if ($(this).text().match(/^-{0,1}\d*\.{0,1}\d+$/)) {
                                tmpArr.push(parseFloat($(this).text()));
                            } else {
                                tmpStr = $(this).text().replace(/"/g, '""');
                                tmpArr.push('"' + tmpStr + '"');
                            }
                        });
                        csvData.push(tmpArr.join(','));
                    }
                });
                var output = csvData.join('\n');
                if (window.navigator.userAgent.indexOf("Trident") < 0) {
                    var uri = 'data:application/csv;charset=UTF-8,' + encodeURIComponent(output);
                    var downloadLink = document.createElement("a");
                    downloadLink.href = uri;
                    downloadLink.download = $(this).find('div.vgrid-caption span[tp="caption"]').text() + ".csv";
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
                else {
                    var blob = new Blob([output], { type: 'text/plain' });
                    window.navigator.msSaveOrOpenBlob(blob, $(this).find('div.vgrid-caption span[tp="caption"]').text() + ".csv");
                }

                //window.open(uri);
            });
        },
        dataCount: function () {
            var data = this.data('vgrid').data;
            return data ? data.length : -1;
        },
        _createCellContent: function (col, dataRow) {
            if (col.formatter) {
                return col.formatter(dataRow[col.field], dataRow);
            } else {
                var result;
                var d = dataRow[col.field];
                switch (col.dataType) {
                    case 'number':
                        result = vstorm.numberFormatter(d);
                        break;
                    case 'datetime':
                        result = vstorm.datetimeFormatter(d);
                        break;
                    case 'date':
                        result = vstorm.dateFormatter(d);
                        break;
                    case 'url':
                        result = d == null ? 'N/A' : $('<a class="vgrid-datatype-url" target="_blank" />').attr('href', d).text(d);
                        break;
                    case 'text':
                    default:
                        result = d;
                }
                return result == null || result == undefined ? 'N/A' : result;
            }
        },
        _drawRow: function (g, $tr, d) {
            if (g.rowProps && g.rowProps.constructor == Array) {
                g.rowProps.each(function () {
                    $tr.attr(this.name, d[this.field]);
                });
            }
            g.columns.each(function (idx) {
                var v = this;
                var grid = $(this);
                var td = document.createElement("td");
                var $td = $(td);
                var $div = $(document.createElement("div"));
                $div.width(v.rwidth);
                if (v.checkbox) {
                    var ck = $(document.createElement("input")).attr('type', 'checkbox');//; $("<input type='checkbox'/>");
                    ck.click(function (ev) { methods._checkSingle.call(this, ev, g); });
                    td.className = "checkbox";
                    $tr.append(td);
                    $div.append(ck);
                    $div.appendTo(td);
                    return;
                }
                var txt = methods._createCellContent(v, d);// v.formatter ? v.formatter(d[v.field], d) : d[v.field] == undefined ? 'N/A' : d[v.field];
                if (txt instanceof jQuery) {
                    $div.append(txt);
                } else {
                    $div.html(txt);
                }
                if (v.title == 'org') {
                    td.title = d[v.field];
                } else if (v.title == 'formatter') {
                    td.title = $(td).text();
                } else if (typeof v.title == 'function') {
                    td.title = v.title(d[v.field], d);
                }
                $td.append($div);
                if (v.visible === false) {
                    $(td).hide();
                }
                if (v.primary) {
                    $(td).addClass("primary");
                    if (g.primaryColumnClick) {
                        $(td).click(function (ev) {
                            g.primaryColumnClick.call(td, ev, grid);
                        });
                    }
                }
                if (v.newid != '') {
                    $(td).attr('id', v.newid);
                }
                if (v.edit) {
                    if (g.editColumnDbclick) {
                        $(td).dblclick(function (ev) {
                            var objTD = $(td);
                            var oldText = $(td)[0].firstChild.innerHTML;
                            var sid = $(td).parent().attr("sid");
                            var tdid = $(td).attr("id");
                            var input = $("<input type='text' style='width:92px' value='" + oldText + "'/>");
                            objTD.html(input);
                            input.click(function () {
                                return false;
                            });

                            input.blur(function () {
                                var newText = $(this).val();
                                var input_blur = $(this);
                                if (oldText != newText) {
                                    var tdid = $(td).attr("id");
                                    $.ajax({
                                        type: "GET",
                                        url: "/api/ea/changedata",
                                        dataType: "json",
                                        traditional: true,
                                        data: {newText:newText, tdid:tdid, sid:sid},
                                        success: function (d) {
                                            newhtml = "<div>" + newText + "</div>";
                                            objTD.html(newhtml);
                                            objTD.attr('id', tdid);
                                        },
                                        error: function (d) {
                                            alert(d);
                                        }
                                    });
                                }
                            });
                            input.keydown(function () {
                                var tap = event.keyCode;
                                var input_keydown = $(this);
                                var tdid = $(td).attr("id");
                                switch (tap) {
                                    case 13:
                                        var newText = input_keydown.val();
                                        if (oldText != newText) {
                                            $.ajax({
                                                type: "GET",
                                                url: "/api/ea/changedata",
                                                dataType: "json",
                                                traditional: true,
                                                data: { newText: newText, tdid: tdid, sid: sid },
                                                success: function (d) {
                                                    newhtml = "<div>" + newText + "</div>";
                                                    objTD.html(newhtml);
                                                    objTD.attr('id', tdid);
                                                },
                                                error: function (d) {
                                                    alert(d);
                                                }
                                            });
                                        }
                                        else {
                                            newhtml = "<div>" + newText + "</div>";
                                            objTD.html(newhtml);
                                            objTD.attr('id', tdid);
                                        }
                                        break;
                                    case 27: 
                                        newhtml = "<div>" + oldText + "</div>";
                                        objTD.html(newhtml);
                                        objTD.attr('id', tdid);
                                        break;
                                }
                            });
                        })}}
                $tr.append(td);
            });
        },
        _drawTotal: function (g, data) {
            if (!g.columns || g.columns.length == 0) {
                return;
            }
            var totalDiv = g.totalDiv;
            totalDiv.empty().width(g.width).css('margin-top', '0px');
            var tb = $('<table cellpadding="0" cellspacing="0"/>').appendTo(totalDiv);
            var tr = $('<tr/>').appendTo(tb);
            var show = false;
            g.columns.each(function (idx) {
                var div = $("<div/>").width(this.rwidth);
                var inner = $('<div class="vgrid-statistics"/>');
                var td = $('<td/>').appendTo(tr), stati = '';
                if (this.statistics) {
                    show = true;
                }
                div.appendTo(td);
                if (data.length > 0) {
                    switch (this.statistics) {
                        case 'sum':
                            stati = data.pick(this.field).sum();
                            break;
                        case 'count':
                            stati = data.length;
                            break;
                        case 'max':
                            stati = data.pick(this.field).max();
                            break;
                        case 'min':
                            stati = data.pick(this.field).min();
                            break;
                        case 'average':
                            stati = Math.round(data.pick(this.field).sum() / data.length, 2);
                            break;
                        case 'custom':
                            if (this.statisticsHandler) {
                                stati = this.statisticsHandler(data);
                            }
                            break;
                        default:
                            return;
                    }
                }
                if (this.statisticsFormatter) {
                    stati = this.statisticsFormatter(stati);
                }
                if (isNaN(stati)) {
                    inner.text(stati);
                } else {
                    inner.text(Math.round(parseFloat(stati), 2));
                }
                inner.appendTo(div);
            });
            if (show && data.length > 0) {
                totalDiv.show();
            }
            else {
                totalDiv.hide();
            }
        },
        refreshRow: function (idx) {
            return this.each(function () {
                var grid = $(this);
                var gd = grid.data('vgrid');
                var g = gd.setting;
                var $r = methods.getRow.call(grid, idx);
                var data = methods.data.call(grid, idx);
                $r.empty();
                methods._drawRow(g, $r, data);
            });
        },
        bindData: function (data) {
            return this.each(function () {
                var grid = $(this);
                var gd = grid.data('vgrid');
                var g = gd.setting;
                var body = g.bDiv.find('table:first');
                if (g.beforeBind) {
                    g.beforeBind.call(grid, data);
                }
                body.siblings().remove();
                body.empty();
                var rows = data;
                if (data && data.Rows) {
                    rows = data.Rows;
                }
                var total = data.Total;
                if (!total) {
                    total = rows.length;
                }
                var page = data.Page;
                if (!page) {
                    page = g.page;
                }
                if (data && rows && rows.constructor == Array) {
                    gd.data = rows;
                    if (rows.length == 0) {
                        var div = $("<div></div>");
                        div.addClass("vgrid-empty").html(g.noDataMsg);
                        g.bDiv.append(div);
                    } else {
                        var fg = document.createDocumentFragment();
                        var sumData = {};
                        rows.each(function (rIdx) {
                            var tr = document.createElement("tr");
                            var $tr = $(tr);
                            $tr.attr('didx', rIdx);
                            var d = this;
                            methods._drawRow(g, $tr, d);
                            fg.appendChild(tr);
                            $tr.click(function () { methods._rowClick.call(this, g); });
                        });
                        body.append(fg);
                    }
                    g.page = page;
                    g.totalCount = total;
                    g.pageCount = Math.ceil(total / g.rp);// Math.round((total / g.rp) + .5);
                    if (g.pageCount == 0) {
                        g.pageCount = 1;
                    }
                    g.startIdx = (g.page - 1) * g.rp + 1;
                    g.endIdx = Math.min(g.page * g.rp, total);
                    methods._pageInfo(g);
                    if (g.onBind) {
                        g.onBind.call(grid, data);
                    }
                }
                if (g.tbodyMaxHeight) {
                    var $tbody = $('.vgrid-body table>tbody');
                    $tbody.css('height', $tbody.css('height') > g.tbodyMaxHeight ? $tbody.css('height') : g.tbodyMaxHeight);
                }
                methods._filterColumns(g);
            });
        },
        _reload: function (g) {
            methods.search.call(g.gDiv, g.preParas);
        },
        options: function (name, value) {
            if (typeof (value) != 'undefined') {
                return this.each(function () {
                    var g = methods.setting.call($(this));
                    g[name] = value;
                });
            } else {
                var g = methods.setting.call(this);
                return g[name];
            }
        },
        search: function (paras) {
            return this.each(function () {
                var grid = $(this);
                var g = methods.setting.call(grid);
                var params = {};
                if (g.usePage) {
                    params.page = g.newp;
                    params.orderBy = g.orderBy;
                    params.order = g.order;
                    params.rp = g.rp;
                }
                $.extend(params, g.fixedParams);
                $.extend(params, paras);
                grid.vgrid('showLoading');
                $.getJSON(g.url + "/" + g.searchAction, params, function (data) {
                    g.preParas = paras;
                    grid.vgrid('bindData', data);
                    grid.vgrid('hideLoading');
                }).error(function (data) {
                    grid.vgrid('hideLoading');
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
                    $(this).children('.vgrid-body').siblings().each(function () {
                        h -= $(this).outerHeight(true);
                    });
                    $(this).children('.vgrid-body').height(h);
                    //$(this).children('.vgrid-dragbar').children().height(h + $(this).children('.vgrid-header').outerHeight());
                });
            }
        }
    };
    $.fn.vgrid = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vgrid');
        }
    };
})(jQuery);