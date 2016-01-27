$.widget("vstorm.vdateRange", {
    options: {
        width: 960,
        duration: "PT1y",
        scale: "PT1M",
        step: "PT1d",
        start: new Date(2013, 0, 1),
        values: [new Date(2013, 0, 1), new Date(2013, 1, 1)],
        change: function () {

        }
    },
    _create: function () {
        var t = this;
        window.lc = this;
        var el = t.element, op = t.options;
        el.vloading().addClass('dateRange').width(op.width);
        t.bar = $("<div/>").addClass('dateRange-bar').appendTo(el);
        t.scales = $('<div class="dateRange-scales"/>').appendTo(el);
        t.minIndicator = $('<div class="dateRange-indicator"/>').appendTo(el);
        t.maxIndicator = $('<div class="dateRange-indicator"/>').appendTo(el);
        t._draw();

        t._initlized = true;
    },
    _splitUnit: function (unit) {
        var reg = /PT(\d+)([mhdwMy])/g;
        var match = reg.exec(unit);
        if (match) {
            var v = parseInt(match[1], 10), u = match[2];
            return { value: v, unit: u };
        }
        return null;
    },
    _showIndicators: function (value0, value1) {
        var t = this;
        var op = this.options, values = t.bar.slider('values');
        var v = t._splitUnit(op.step);
        op.values[0] = op.start.add(values[0] * v.value, v.unit);
        op.values[1] = op.start.add(values[1] * v.value, v.unit);
        var txt1 = op.values[0].format('MM-dd'), txt2 = op.values[1].format('MM-dd');
        var h1 = t.bar.find('.dateRange-bar-handle:first'), h2 = t.bar.find('.dateRange-bar-handle:last');
        var ind1 = t.minIndicator, ind2 = t.maxIndicator;
        var l1 = h1.position().left - ind1.outerWidth(true) / 2, l2 = h2.position().left - ind2.outerWidth(true) / 2;
        if (l1 + ind1.outerWidth(true) > l2) {
            var space = l1 + ind1.outerWidth(true) - l2;
            l1 = l1 - space / 2;
            l2 = l2 + space / 2;
        }
        ind1.text(txt1).css('left', l1);
        ind2.text(txt2).css('left', l2);
    },
    _calcBarValues: function () {
        var op = this.options, stu = this._splitUnit(op.step);
        if (op.values) {
            op._values = [];
            $.each(op.values, function (idx) {
                if ($.type(this) == 'date' && this.isValid()) {
                    op._values[idx] = op.start.duration(this, stu.unit);
                } else {
                    op._values[idx] = 0;
                }
            })
        }

        if (!op._values || op._values.length < 2) {
            op._values = [0, 0];
        }
    },
    _calcValues: function () {
        var op = this.options;
        var du = this._splitUnit(op.duration);
        var stu = this._splitUnit(op.step);
        op.end = op.start.add(du.value, du.unit);
        op.max = op.end.duration(op.start, stu.unit) * -1;
        var scu = this._splitUnit(op.scale);
        var start = op.start.accurate(scu.unit), ul = op.width / op.max;
        var spl = start.duration(op.start, stu.unit) * -1 * ul;//start scale padding left.
        this._calcBarValues();
        op.scales = [];
        var next = start;
        while (next < op.end) {
            var nextPadding = op.start.duration(next, stu.unit) * ul + spl;
            var scale = { padding: nextPadding, value: next, text: next.value(scu.unit) + 1 };
            if (next.daysOfYear() == 1) {
                scale.longText = next.value('y');
            }
            next = next.add(scu.value, scu.unit);
            op.scales.push(scale);
        }
    },
    disableEvents: function (v) {
        this.options.fireEvents = !v;
    },
    values: function (values) {
        if (!values) {
            return this.options.values;
        }
        if (values.length == 2 && $.type(values[0]) == 'date' && values[0].isValid() && $.type(values[1]) == 'date' && values[1].isValid()) {
            this.options.values = values;
            this._calcBarValues();
            this.bar.slider('values', 0, this.options._values[0]).slider('values', 1, this.options._values[1]);
            this._showIndicators();
        }
    },
    _draw: function () {
        window.t = this;
        var t = this, op = this.options;
        t.scales.empty();
        t._calcValues();
        if (t._initlized) {
            t.bar.slider("destroy");
        }
        t.bar.slider({
            range: true,
            width: op.width,
            max: op.max,
            min: 0,
            values: op._values,
            create: function () {
                $(this).find('.ui-slider-handle').addClass('dateRange-bar-handle').append('<div class="dateRange-bar-handle-bar"/>');
                $(this).find('.ui-slider-range').addClass('dateRange-bar-range');
            },
            change: function (ev, ui) {
                if (op.change && op.fireEvents !== false) {
                    op.change.call(t, ev);
                }
            },
            slide: function (ev, ui) {
                t._showIndicators(ui.values[0], ui.values[1]);
            }
        })
        $.each(op.scales, function () {
            var div = $('<div class="dateRange-scale"/>');
            var text = $('<span class="dateRange-scale-text">').text(this.text).css({ 'left': this.padding });
            var line = $('<span class="dateRange-scale-line"/>').text('|').css({ 'left': this.padding });
            div.append(text, line);
            if (this.longText) {
                line.addClass('dateRange-scale-line-long');
                var ltext = $('<span class="dateRange-scale-text-long"/>').text(this.longText).css({ 'left': this.padding });
                div.append(ltext);
            }
            t.scales.append(div);
        })
        t._showIndicators();
    }

});