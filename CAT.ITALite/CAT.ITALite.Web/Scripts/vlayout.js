$(function () {
    var layout = {
        contant: '.g-body',
        contantWidth: $('.g-body').width(),
        contantHeight: $(window).height() - $('.eyebow-small').outerHeight(true) - $('.command-title').outerHeight(true),
        toolbar: '#command-toolbar',
        provDesc: {
            createavm: "Upload virtual machine images to Windows Azure",
            createhvm: 'Create virtual machines running on Lab Windows Hyper-V Servers',
            createlabenv: 'Create a bench of virtual machines with flexible configuration'
        },
        collapseCmdPanel: function () {
            $(".command .command-body").animate({ height: "0px" }, 100, function () {
                $(this).animate({ top: '0px' }, 100);
            });
        },
        onGetJsonError: function (id, title, data) {
            layout.action.create(id, { title: title });
            var div = $('<div/>').html(data.responseText);
            var msg = div.find('title').text();
            div.remove();
            layout.action.error(id, data.statusText, msg);
        },
        toolbar: {
            pool: {},
            height: function () {
                return this.bar.outerHeight(true);
            },
            bar: $('#command-toolbar'),
            subBar: $('#command-subtoolbar'),
            init: function (buttons) {
                if (typeof (this.bar) == 'string') {
                    this.bar = $(this.bar);
                    this.subBar = $(this.subBar);
                    this.pool = {};
                }
                if (buttons) {
                    var len = buttons.length;
                    for (var idx = 0; idx < len; idx++) {
                        var btn = buttons[idx];
                        this.addbutton(btn);
                    }
                }
            },
            get: function (caption) {
                if (this.has(caption)) {
                    return this.pool[caption];
                } else {
                    return null;
                }
            },
            has: function (caption) {
                return this.pool[caption];
            },
            empty: function () {
                this.bar.empty();
                this.pool = {};
                return this;
            },
            addbutton: function (button) {
                if (!button.css) {
                    button.css = 'toolbar-' + button.caption.replace(/\s/g, "").toLowerCase();
                }
                if (!button.id) {
                    button.id = button.caption;
                }
                var btn = $("<button>");
                button.button = btn;
                btn.text(button.caption).addClass(button.css);
                this.bar.append(btn);
                btn.click(function (ev) {
                    if ($(this).hasClass('disable')) {
                        return;
                    }
                    ev.stopPropagation();
                    var $t = $(this);
                    var pool = layout.toolbar.pool;
                    var btn = pool[button.id];
                    var subBar = layout.toolbar.subBar.empty();
                    if (btn) {
                        if (btn.handler) {
                            pool[button.id].handler(ev, this);
                        } else if (btn.buttons) {
                            var len = btn.buttons.length;
                            for (var idx = 0; idx < len; idx++) {
                                (function () {
                                    var subBtn = btn.buttons[idx];
                                    var div = $('<div/>');
                                    subBar.append(div);
                                    div.text(subBtn.caption);
                                    var handler = subBtn.handler;
                                    if (handler) {
                                        div.click(function () {
                                            handler(subBtn);
                                        });
                                    }
                                })();
                            }
                            var offset = $t.offset();
                            var duration = (subBar.width() - $t.width()) / 2;
                            subBar.css({ left: offset.left - duration }).slideToggle();
                        }
                    }
                });

                this.pool[button.id] = button;
                return this;
            },
            add: function (id, caption, css, handler, refreshCallback) {
                if (!css) {
                    css = 'toolbar-' + caption.replace(/\s/g, "").toLowerCase();
                }
                var tool = { id: id, caption: caption, handler: handler };
                if (typeof (refreshCallback) == "function") {
                    tool.refreshCallback = refreshCallback;
                }
                var btn = $("<button>");
                btn.text(caption).addClass(css);
                this.bar.append(btn);
                tool.button = btn;
                btn.click(function (ev) {
                    if ($(this).hasClass('disable')) {
                        return;
                    }
                    var pool = layout.toolbar.pool;
                    var btn = pool[id];
                    if (btn) {
                        if (btn.handler) {
                            pool[id].handler(ev, this);
                        } else if (btn.buttons) {
                            //todo:show the sub button.
                            var subBar = layout.subBar.empty();
                            var len = btn.buttons.length;
                            for (var idx = 0; idx < len; idx++) {
                                var subBtn = btn.buttons[idx];
                                var div = $('<div/>');
                                div.text(subBtn.caption);
                                if (subBtn.handler) {
                                    div.click(function () {

                                        subBtn.handler(subBtn);
                                    });
                                }
                            }
                            subBar.slideToggle();
                        }
                    }
                });

                this.pool[id] = tool;
                return this;
            },
            remove: function (id) {
                if (id) {
                    if (this.has(id)) {
                        this.pool[id].button.remove();
                        delete this.pool[id];
                    }
                } else {
                    this.empty();
                }
                return this;
            },
            _do: function (id, fun) {
                if (id) {
                    if (this.has(id)) {
                        fun(this.pool[id].button);
                    }
                } else {
                    fun(this.bar.find('button'));
                }
                return this;
            },
            disable: function (id) {
                return this._do(id, function (t) { t.addClass('disable'); });
            },
            enable: function (id) {
                return this._do(id, function (t) { t.removeClass('disable'); });
            },
            hide: function (id) {
                return this._do(id, function (t) { t.hide(); });
            },
            show: function (id) {
                return this._do(id, function (t) { t.show(); });
            },
            refresh: function () {
                var pool = this.pool;
                var toolbar = this;
                var arg = arguments;
                $.each(pool, function (id) {
                    //{ id: id, caption: caption, handler: handler }
                    toolbar.enable(id);
                    if (this.refreshCallback) {
                        var res = this.refreshCallback.apply(this, arg);
                        if (!res) {
                            toolbar.disable(id);
                        }
                    }
                });
            },
            refreshdetail: function () {
                var pool = this.pool;
                var toolbar = this;
                var arg = arguments;
                $.each(pool, function (id) {
                    //{ id: id, caption: caption, handler: handler }
                    toolbar.enable(id);
                    toolbar.show(id);
                    if (this.refreshCallback) {
                        var res = this.refreshCallback.apply(this, arg);
                        if (!res) {
                            toolbar.disable(id);
                            toolbar.hide(id);
                        }
                    }
                });
            }
        },
        changeGroup: function () {
            $("#groupChanger").load('../../User/UserRoleList');
        },
        initEvent: function () {
            this.command.initEvent();
        },
        loading: function (v) {
            $(this.contant).vloading(v);
        },
        confirm: function (text, yes, no) {
            $('.confirm-title').text(text);
            $('.confirm-no').parent().unbind().click(function () {
                if (no && no() === false) {
                    return;
                } else {
                    $('.confirmbar-shield').hide();
                }
            });
            $('.confirm-yes').parent().unbind().click(function () {
                if (yes) {
                    yes();
                }
                $('.confirmbar-shield').hide();
            });
            $('.confirmbar-shield').show();
        },
        action: {
            init: function () {
                this.console = $('#vstormActions');
                this.console.vactionMgr({
                    countMarker: '#command-actionCount'
                });
            },
            console: $('#vstormActions'),
            create: function (id, params) {
                var act = null;
                if (this.exist(id)) {
                    act = this.item(id);
                } else {
                    this.console.vactionMgr('createItem', id, params);
                    act = this.item(id);
                }
                //auto hide the action bar after 5 seconds.
                act.vaction('show', 5000);
                return act;
            },
            exist: function (id) {
                return this.console.vactionMgr('exist', id);
            },
            item: function (id) {
                return this.console.vactionMgr('items', id);
            },
            push: function (id, msg) {
                return this.item(id).vaction('push', msg);
            },
            pop: function (id, msg, type, detail) {
                return this.item(id).vaction('pop', msg, type, detail);
            },
            success: function (id, msg, detail) {
                return this.item(id).vaction('success', msg, detail);
            },
            warning: function (id, msg, detail) {
                return this.item(id).vaction('warning', msg, detail);
            },
            error: function (id, msg, detail) {
                return this.item(id).vaction('error', msg, detail);
            }
        },
        user: {
            userType: $('#userType').val(),
            currentGroupID: $('.eyebow-small .user .summary .group').attr('roleID'),
            summary: $('.eyebow-small .user .summary'),
            menu: $('.eyebow-small .user .usermenu'),
            groupList: $('.eyebow-small .user .usermenu #usergrouplist'),
            isAdmin: function () {
                return this.userType == 'admin';
            },
            isSuperAdmin: function () {
                return this.userType == 'superAdmin';
            },
            loadUserGroup: function () {
                $.getJSON('../User/GetUserRoleList', null, function (data) {
                    if (data && data.length > 0) {
                        var ul = layout.user.groupList.find('ul');
                        layout.user.groupList.find('.editor-loading').remove();
                        data = data.sort(function (a, b) {
                            return a.RoleName < b.RoleName ? -1 : 1;
                        });
                        $.each(data, function () {
                            if (layout.user.isSuperAdmin() || this.IsAdmin == 2 || this.IsCustomer == 2) {
                                var li = $('<li></li>');
                                li.attr('roleId', this.RoleId);
                                if (this.RoleId == layout.user.currentGroupID) {
                                    li.addClass('menu-active');
                                }
                                li.append('<a href="#">' + this.RoleName + '</a>');
                                if (!this.IsExternalGroup) {
                                    ul.append(li);
                                } else {
                                    $('a', li).css("color", "#71B1D1");
                                    ul.prepend(li);
                                }
                            }
                        });
                        $('ul li', layout.user.groupList).click(function () {
                            if (!$(this).hasClass('menu-active')) {
                                var roleId = $(this).attr('roleID');
                                self.location = "../../User/ChangeGroup?roleId=" + roleId;
                            }
                        });
                        if (layout.user.currentGroupID == guid.empty && !layout.user.isSuperAdmin()) {
                            layout.changeGroup();
                        }
                    }
                }).error(function () {
                    var ul = layout.user.groupList.find('ul');
                    layout.user.groupList.find('.editor-loading').remove();
                    var li = $('<li></li>');
                    li.addClass('menu-active');
                    li.append('<a href="#">Load Group Error</a>');
                    ul.append(li);
                });
            },
            init: function () {
                this.menu.hide();
                this.summary.click(function (ev) {
                    ev.stopPropagation();
                    layout.user.menu.slideToggle(200, function () {
                        if ($(this).is(':visible')) {
                            layout.user.summary.addClass('summary-active');
                        } else {
                            layout.user.summary.removeClass('summary-active');
                        }
                    });
                });
                $('body').click(function () {
                    layout.user.menu.slideUp(200, function () { layout.user.summary.removeClass('summary-active'); });
                    layout.toolbar.subBar.slideUp();
                });

                this.menu.find('#applygroup').click(function () {
                    layout.changeGroup();
                });
                this.loadUserGroup();
            }
        },

        init: function () {
            this.toolbar.init();

            $(".command-title .open").click(function () {
                $(".command .command-body").animate({ height: "500px" }, 200, function () {
                    $(this).animate({ top: '-60px' }, 100);
                });
            });

            $(".command-body .caption .button-close").click(function () {
                layout.collapseCmdPanel();
            });
            $('.command-introduce').hide();
            function popupCreationView(url) {
                if (url.length > 0) {
                    $(layout.contant).vloading('show');
                    $('#vmCreator').load(url,{id:-1,isEdit:false} ,function () {
                        $(layout.contant).vloading('hide');
                    });
                }
                layout.collapseCmdPanel();
            }

            $(this.contant).vloading();
            $.getJSON('../scripts/menu.js', function (data) {
                $('#gmenu').vmenu({
                    items: data
                });
                //todo:move the shell menu logic to back code.
                $('.command-menu').vshellmenu({
                    features: data,
                    disableDescription: 'This feature is not enable, please contact group admin to enable it on Administrator page Feature tab',
                    //introductionOfITA:'<br>Why ITALite? <br> - Centralized Authentication and Authorization service for all Apps relying on same AAD (from MS ITA product) <br>- Intelligent AAD explorer for AAD/ARM management and operations with auto syncing and graph mining.<br>- Portal based configure and wizard enabling fast deploy and integration for apps of all language ',
                    menus: [
                        {
                            feature: 'AAD Apps',
                            text: 'AAD APP',
                            css: 'item-hyperv-vm',
                            description: 'Create an AAD APP.' + '<br><br>Why ITALite? <br>- Centralized Authentication and Authorization service for all Apps relying on same AAD (from MS ITA product) <br>- Intelligent AAD explorer for AAD/ARM management and operations with auto syncing and graph minign.<br>- Portal based configure and wizard enabling fast deploy and integration for apps of all language',
                            menus: [{
                                    text: 'Quick Create', css: 'item-quickcreate',
                                    description: 'Quick create an AAD APP.',
                                    url: '../Home/QuickCreateAADApp',
                            },
                            //{
                            //    text: 'Custom Create', css: 'item-customcreate',
                            //    description: 'Create an AAD APP follow a wizard.',
                            //    handler: function () {
                            //        popupCreationView('../Home/AddApp');
                            //    }
                            //}
                            ]
                        },
                        {
                            feature: 'AAD Groups',
                            text: 'AAD GROUP',
                            css: 'item-hyperv-vm',
                            description: 'Create an AAD GROUP.' + '<br><br>Why ITALite? <br>- Centralized Authentication and Authorization service for all Apps relying on same AAD (from MS ITA product) <br>- Intelligent AAD explorer for AAD/ARM management and operations with auto syncing and graph minign.<br>- Portal based configure and wizard enabling fast deploy and integration for apps of all language',
                            menus: [ {
                                    text: 'Quick Create', css: 'item-quickcreate',
                                    description: 'Quick create an AAD GROUP.',
                                    url: '../Home/QuickCreateAADGroup',
                            },
                            //{
                            //    text: 'Custom Create', css: 'item-customcreate',
                            //    description: 'Create an AAD GROUP follow a wizard.',
                            //    handler: function () {
                            //        popupCreationView('../Home/AddGroup');
                            //    }
                            //}
                            ]
                        },
                        {
                            feature: 'AAD Users',
                            text: 'AAD USER',
                            css: 'item-hyperv-vm',
                            description: 'Create an AAD User.' + '<br><br>Why ITALite? <br>- Centralized Authentication and Authorization service for all Apps relying on same AAD (from MS ITA product) <br>- Intelligent AAD explorer for AAD/ARM management and operations with auto syncing and graph minign.<br>- Portal based configure and wizard enabling fast deploy and integration for apps of all language',
                            menus: [{
                                    text: 'Quick Create', css: 'item-quickcreate',
                                    description: 'Quick create an AAD User.',
                                    url: '../Home/QuickCreateAADUser',
                            },
                            //{
                            //    text: 'Custom Create', css: 'item-customcreate',
                            //    description: 'Create an AAD User follow a wizard.',
                            //    handler: function () {
                            //        popupCreationView('../Home/AddUser');
                            //    }
                            //}
                            ]
                        }, {
                            feature: 'Roles',
                            text: 'AAD AdminRole',
                            css: 'item-hyperv-vm',
                            description: 'Create an AAD AdminRole.' + '<br><br>Why ITALite? <br>- Centralized Authentication and Authorization service for all Apps relying on same AAD (from MS ITA product) <br>- Intelligent AAD explorer for AAD/ARM management and operations with auto syncing and graph minign.<br>- Portal based configure and wizard enabling fast deploy and integration for apps of all language',
                            menus: [{
                                text: 'Quick Create', css: 'item-quickcreate',
                                description: 'Quick create an AAD AdminRole.',
                                url: '../Home/QuickCreateAdminRole',
                            },
                            //{
                            //    text: 'Custom Create', css: 'item-customcreate',
                            //    description: 'Create an AAD AdminRole follow a wizard.',
                            //    handler: function () {
                            //        popupCreationView('../Home/AddAdminRole');
                            //    }
                            //}
                            ]
                        }, {
                            feature: 'Roles',
                            text: 'RBAC Role',
                            css: 'item-hyperv-vm',
                            description: 'Create a RBAC Role.' + '<br><br>Why ITALite? <br>- Centralized Authentication and Authorization service for all Apps relying on same AAD (from MS ITA product) <br>- Intelligent AAD explorer for AAD/ARM management and operations with auto syncing and graph minign.<br>- Portal based configure and wizard enabling fast deploy and integration for apps of all language',
                            menus: [{
                                text: 'Quick Create', css: 'item-quickcreate',
                                description: 'Quick create a RBAC Role.',
                                url: '../Home/QuickCreateRBACRole',
                            },
                            //{
                            //    text: 'Custom Create', css: 'item-customcreate',
                            //    description: 'Create a RBAC Role follow a wizard.',
                            //    handler: function () {
                            //        popupCreationView('../Home/AddRBACRole');
                            //    }
                            //}
                            ]
                        }, {
                            feature: 'RM Groups',
                            text: 'RM Group',
                            css: 'item-hyperv-vm',
                            description: 'Create a RM Group.' + '<br><br>Why ITALite? <br>- Centralized Authentication and Authorization service for all Apps relying on same AAD (from MS ITA product) <br>- Intelligent AAD explorer for AAD/ARM management and operations with auto syncing and graph minign.<br>- Portal based configure and wizard enabling fast deploy and integration for apps of all language',
                            menus: [{
                                text: 'Quick Create', css: 'item-quickcreate',
                                description: 'Quick create a RM Group.',
                                url: '../Home/QuickCreateARMResources',
                            },
                            //{
                            //    text: 'Custom Create', css: 'item-customcreate',
                            //    description: 'Create an ARM Resource follow a wizard.',
                            //    handler: function () {
                            //        popupCreationView('../Home/AddARMResources');
                            //    }
                            //}
                            ]
                        }
                        
                    ]
                });
            });

            var bg = $("<div class='background-shadow'></div>");
            $('body').append(bg);
            var setBgSize = function () {
                var left = ($(window).width() - bg.width()) / 2;
                bg.css({ left: left });
                $('.vstormlogo').css({ right: left + 30 });
            };
            setBgSize();
            $(window).resize(setBgSize);
            this.command.init();
            this.action.init();
            this.user.init();
            this.initEvent();
        },
        command: {
            panel: '.vshell-container',
            body: '.command .command-body',
            wowbody: '.command .command-title .wow-body',
            wowmenu: $('.vshell-container .command .command-title .wow-body .wow-menu'),
            title: '.command .command-title',
            height: 500,
            open: function (ev) {
                ev.stopPropagation();
                $('.command-menu').vshellmenu('show');
                $(this.body).animate({ height: this.height + "px" }, 200, function () {
                    $(this).animate({ top: '-60px' }, 100);
                });
            },
            close: function (ev) {
                ev.stopPropagation();
                $(this.body).animate({ height: "0px" }, 200, function () {
                    $(this).animate({ top: '0px' }, 100);
                });
            },

            initEvent: function () {
                $(this.title).find('.tools button.toolbar-wow').click(layout.command.open);
                $('body').click(layout.command.close);
                $(this.body).click(function (ev) { ev.stopPropagation(); });
                $('.global-bg').click(function (ev) {
                    if ($(ev.target).closest('.command').length > 0) {
                        return;
                    }
                    layout.command.close(ev);
                    $('body').trigger('click');
                });
                $('body').keyup(function (ev) {
                    if (ev.keyCode == 27) {
                        $('body').trigger('click');
                    }
                });
            },
            init: function () {
                if ($.browser.msie) {
                    var masker = $('<iframe></iframe');
                    masker.css({ position: 'absolute', top: 0, border: 'none', left: 0, width: $(this.panel).width(), height: $(window).height() });
                    $(this.panel).before(masker);
                }
            }
        }
    };
    if ($.browser.msie && $.browser.version < 8.0) {
        self.location = "../../Error/Unsupported";
    } else {
        $.ajaxSetup({
            cache: false
        });
        layout.init();
    }
    window.layout = layout;
});
