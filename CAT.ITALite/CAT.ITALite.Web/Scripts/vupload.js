(function ($) {
    $.extend($.fn, {
        jnupload: function (target, setting) {
            var g = {
                action: '',
                success: null,
                error: null,
                beforUpload: null,
                showHint: false
            };
            $.extend(g, setting);
            var create = function (g) {
                this.setting = g;
                this.form = $("<form></form>").attr('method', 'post')
                    .attr('enctype', 'multipart/form-data')
                    .attr('action', g.action);
                this.file = $("<input />").attr('type', 'file').attr('name', 'jnupload').attr('id', 'jnupload');
                this.form.append(this.file);
                $(target).append(this.form); //.css("display", "none");
                var t = this;
                this.upload = function () {
                    if (g.beforeUpload) {
                        g.beforeUpload.call(this);
                    }
                    if (g.showHint) {
                        this.showLoading();
                    }
                    this.form.ajaxSubmit({
                        success: function (data) {
                            t.hideLoading();
                            //t.file.val("");
                            if (g.success) {
                                g.success(data);
                            }
                        },
                        error: function () {
                            t.hideLoading();
                            //t.file.val("");
                            if (g.error) {
                                g.error(data);
                            }
                        }
                    });
                };
                this.showLoading = function () {
                    if (!this.loadingPanel) {
                        this.loadingPanel = $("<div class='jnupload-loading'><div class='icon'></div><div>文件上传中...</div></div>");
                        $(target).append(this.loadingPanel);
                        this.loadingPanel.dialog({
                            modal: true,
                            width: 'auto',
                            autoOpen: true
                        });
                    } else {
                        this.loadingPanel.dialog('open');
                    }
                };
                this.hideLoading = function () {
                    if (this.loadingPanel) {
                        this.loadingPanel.dialog("close");
                    }
                };
                this.open = function () {
                    this.file.click();
                };
                this.file.change(function () {
                    if ($(this).val()) {
                        var isXml = (/\.xml$/.test($('#jnupload').val())) ? 1 : 0;
                        if (isXml == '1') {
                            t.upload();
                        }
                    }
                });
            };
            return new create(g);
        }
    });
})(jQuery);