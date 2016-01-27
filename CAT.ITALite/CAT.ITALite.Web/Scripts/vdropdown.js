$.widget("vstorm.vdropdown", {
    options: {
        width: 100,
        items: [{ text: '--select--', value: '-1' }],
        textField: 'text',
        valueField: 'value',
        defaultValue: null,
        value: null,
        onChange: null,
        onClick: null
    },
    _create: function () {
        var el = this.element, op = this.options, t = this;
        el.addClass('vdropdown');
        var ul = $('<ul/>'), vDiv = $('<div class="vdropdown-value"/>'), iconDiv = $('<div class="vdropdown-icon"/>');
        t.ul = ul;
        t.vDiv = vDiv;
        t.iconDiv = iconDiv;
        el.append(vDiv, iconDiv, ul).width(op.width);
        el.bind('click.vdropdown', function (ev) {
            //ev.stopPropagation();
            t._toggle();
        });
        $('body').bind('click.vdropdown', function (ev) {
            if (ev) {
                if (ev.target != el[0] && ev.target != vDiv[0] && ev.target != iconDiv[0]) {
                    t._hide();
                }
            } else {
                t._hide();
            }
        });
        this._bindItems();
        t._setValue(op.defaultValue);
    },
    _setCurrentObj: function (v) {
        var t = this, op = this.options;
        op.currentObj = v;
        if (!v) {
            op.value = null;
            t.vDiv.text('');
            t.ul.find('li').removeClass('vdropdown-current');
        } else {
            op.value = v[op.valueField];
            this.element.find('.vdropdown-value').text(v[op.textField]);
            this.element.find('li a[_value="' + op.value + '"]')
                .parent().addClass('vdropdown-current')
                .siblings().removeClass('vdropdown-current');
        }
        if (op.onChange) {
            op.onChange(v);
        }
    },
    _setValue: function (v) {
        var t = this;
        if (v !== null && v !== undefined) {
            var op = t.options;
            $.each(op.items, function () {
                if (this[op.valueField] == v) {
                    t._setCurrentObj(this);
                }
            });
        } else {
            t._setCurrentObj(v);
        }
    },
    _show: function () {
        this.ul.show();
    },
    _hide: function () {
        this.ul.hide();
    },
    _toggle: function () {
        this.ul.toggle();
    },
    _setOption: function (key, value) {
        var t = this, op = this.options;
        t._super(key, value);
        if (key === "items") {
            value = this._bindItems(value);
        } if (key == "value") {
            $.each(op.items, function () {
                if (this[op.valueField] == value) {
                    t._setCurrentObj(this);
                }
            });
        }
    },
    _setOptions: function (options) {
        this._super(options);
    },
    _bindItems: function () {
        var $t = this, op = this.options;
        $t.ul.empty();
        $.each(this.options.items, function () {
            var t = this, li = $('<li/>');
            li.append($('<a href="#"/>').text(t[op.textField]).attr('_value', t[op.valueField]));
            li.bind('click.vdropdown', function (ev) {
                $t._setCurrentObj(t);
                if (op.onClick) {
                    op.onClick(t, ev);
                }
            });
            $t.ul.append(li);
        });
        $t._setValue(op.value);
    }
});