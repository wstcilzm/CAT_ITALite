(function ($) {
    
    var methods = {
        'default': {
            effect: 'random',
            blinds: 15,
            boxCols: 8,
            boxRows: 4,
            animSpeed: 500,
            sleep: 3000,//sleep time for auto play.
            startSlide: 0,// positive number|'random'
            showCtrlButtons: true,
            showNavBar: true,
            autoPlay: true,
            pauseOnHover: true,
            loop: true
        },
        init: function (option) {
            return this.each(function () {
                var t = $(this);
                if (!t.data('vslide')) {
                    t.addClass('vslide');
                    var g = $.extend({}, methods["default"], option);
                    var pages = t.children();
                    var console = {
                        pages: pages,
                        presentSlide: $('<img class="vslide-present-slide" src="#"/>'),
                        currentIdx: -1,
                        Timecount:-1,
                        currentImg: '',
                        count: pages.length,
                        running: false,
                        hover: false,
                        paused: !g.autoPlay,
                        captionBar: $('<div class="vslide-caption"/>'),
                        navBar: null,
                        btnPrev: null,
                        btnNext: null,
                        btnPause: null,
                        btnPlay: null
                    };
                    if (!g.width) {
                        g.width = pages.width();
                    }
                    if (!g.height) {
                        g.height = pages.height();
                    }
                    t.width(g.width).height(g.height);
                    pages.hide();
                    if (g.startSlide == 'random') {
                        g.startSlide = Math.floor(Math.random() * console.count);
                    } else {
                        g.startSlide = parseInt(g.startSlide, 10);
                        if (isNaN(g.startSlide) || g.startSlide < 0) {
                            g.startSlide = 0;
                        } else if (g.startSlide >= console.count) {
                            g.startSlide = console.count - 1;
                        }
                    }
                    t.append(console.presentSlide);
                    if (g.showNavBar) {
                        console.navBar = $("<div class='vslide-navbar'></div>");
                        for (var idx = 0; idx < console.count; idx++) {
                            console.navBar.append($("<div class='vslide-navbar-item'></div>").attr('idx', idx));
                        }
                        console.navBar.children().click(function () {
                            var idx = $(this).attr('idx');
                            methods._goto.call(t, idx);
                        });
                        t.append(console.navBar);
                    }
                    if (g.showCtrlButtons) {
                        var toolbar = $("<div class='vslide-toolbar'></div>");
                        console.btnPrev = $("<div class='vslide-toolbar-prev'></div>");
                        console.btnNext = $("<div class='vslide-toolbar-next'></div>");
                        console.btnPause = $("<div class='vslide-toolbar-pause'></div>");
                        console.btnPlay = $("<div class='vslide-toolbar-play'></div>");
                        toolbar.append(console.btnPrev)
                            .append(console.btnNext)
                            .append(console.btnPause)
                            .append(console.btnPlay)
                            .appendTo(t);
                        console.btnNext.click(function () {
                            methods.next.call(t);
                        });
                        console.btnPrev.click(function () {
                            methods.prev.call(t);
                        });
                        console.btnPause.click(function () {
                            methods.pause.call(t);
                        });
                        console.btnPlay.click(function () {
                            methods.play.call(t);
                        });
                        toolbar.children().css({ top: (g.height - toolbar.children().height()) / 2 });
                        console.btnPrev.css('left', 0);
                        console.btnNext.css('right', 0);
                        console.btnPlay.css('left', (g.width - console.btnPlay.width()) / 2);
                        console.btnPause.css('left', (g.width - console.btnPlay.width()) / 2);
                        if (g.autoPlay) {
                            console.btnPlay.hide();
                        } else {
                            console.btnPause.hide();
                        }
                    }
                    if (g.pauseOnHover) {
                        t.hover(function () {
                            console.hover = true;
                        }, function () {
                            console.hover = false;
                        });
                    }
                    t.data("vslide", {
                        target: t,
                        console: console,
                        setting: g
                    });
                    methods._goto.call(t, g.startSlide, 'none');
                }
            });
        },
        destroy: function () {
            return this.each(function() {
                var t = $(this);
                var data = t.data('vslide');
                if (data) {
                    $(window).unbind('.vslide');
                    $('.vslide-blind,.vslide-box,vslide-navbar,vslide-toolbar', t).remove();
                    t.removeData('vslide');
                }
            });
        },
        _createBlinds: function (t, g, console) {
            var height = g.height;
            var width = g.width;
            var lw = width, bw = Math.floor(width / g.blinds), left = 0;
            for (var idx = 0; idx < g.blinds; idx++) {
                var blind = $('<div></div>');
                blind.addClass('vslide-blind');
                w = bw;
                if (idx == g.blinds - 1) {
                    w = lw;
                }
                var img = $('<img/>');
                img.attr('src', console.currentImg.attr('src'));
                img.css({
                    position: 'absolute',
                    height: height,
                    display: 'block',
                    top: 0,
                    left: left * -1
                });
                blind.css({
                    left: left,
                    width: w,
                    height: height,
                    opacity: 0,
                    overflow: 'hidden'
                }).append(img);
                left += bw;
                lw -= bw;
                t.append(blind);
            }
        },
        _createBox: function (t, g, console) {
            var boxHeight = Math.floor(g.height / g.boxRows), boxWidth = Math.floor(g.width / g.boxCols);
            for (var rows = 0; rows < g.boxRows; rows++) {
                var lw = g.width;
                for (var cols = 0; cols < g.boxCols; cols++) {
                    var box = $('<div></div>');
                    box.addClass('vslide-box').attr('rel', rows);
                    var img = $('<img />');
                    var bw = boxWidth;

                    if (cols == g.boxCols - 1) {
                        bw = lw;
                    }
                    img.attr('src', console.currentImg.attr('src'))
                        .css({
                            position: 'absolute',
                            width: g.width,
                            height: g.height,
                            display: 'block',
                            top: -1 * (boxHeight * rows),
                            left: -1 * (boxWidth * cols)
                        });
                    box.css({
                        opacity: 0,
                        left: boxWidth * cols,
                        top: boxHeight * rows,
                        height: boxHeight,
                        width: bw
                    }).append(img);
                    lw -= boxWidth;
                    t.append(box);
                }
            }
        },
        next: function () {
            return this.each(function () {
                var data = $(this).data('vslide');
                if (data) {
                    var idx = data.console.currentIdx + 1;
                    if (idx >= data.console.count) {
                        idx = 0;
                    }
                    methods._goto.call($(this), idx);
                }
            });
        },
        prev: function () {
            return this.each(function () {
                var data = $(this).data('vslide');
                if (data) {
                    var idx = data.console.currentIdx - 1;
                    if (idx < 0) {
                        idx = data.console.count - 1;
                    }
                    methods._goto.call($(this), idx);
                }
            });
        },
        play: function () {
            return this.each(function () {
                var data = $(this).data('vslide');
                if (data) {
                    var console = data.console;
                    console.btnPlay.hide();
                    console.btnPause.show();
                    console.paused = false;
                    // methods.next.call(this);

                    var idx = data.console.currentIdx + 1;
                    if (idx >= data.console.count) {
                        idx = 0;
                    }

                    methods._goto.call($(this), idx);
                }


            });
        },
        pause: function () {
           
            return this.each(function () {
                var data = $(this).data('vslide');
          
               
                if (data) {
                    var console = data.console;
                    console.btnPause.hide();
                    console.btnPlay.show();
                    console.paused = true;
                    clearTimeout(data.Timecount);
                }
            });
        },
        goto: function (idx) {
            return this.each(function () {
                methods._goto.call($(this), idx);
            });
        },
        option: function (name, value) {
            if (!name) {
                return this.data('vslide').setting;
            } else if (!value) {
                return this.data('vslide').setting[name];
            } else {
                return this.each(function () {
                    $(this).data('vslide').setting[name] = value;
                });
            }
        },
        _goto: function (idx, effect) {
            

           
            var t = this;
            var data = t.data('vslide');
            if (!data) {
                return;
            }
            var g = data.setting;
            var console = data.console;
            if (console.running) {
                return;
            }
            if (!effect) {
                effect = g.effect;
            }
            idx = parseInt(idx);
            if (isNaN(idx)) {
                idx = 0;
            }
            if (g.loop) {
                idx = Math.abs(idx % console.count);
            }
            idx = Math.min(console.count - 1, Math.max(0, idx));
            if (idx == console.currentIdx) {
                return;
            }
            
            var cpage = $(console.pages[idx]);
            console.currentIdx = idx;
            if (cpage.is('img')) {
                console.currentImg = cpage;
            } else {
                console.currentImg = cpage.find('img:first');
            }
            methods._showCaption(g, console);

            $('.vslide-blind', t).remove();
            $('.vslide-box', t).remove();

            if (effect === 'random') {
                effects = ['blindRight', 'blindLeft', 'fold', 'fade',
                'boxRandom', 'boxRain', 'boxRainReverse', 'boxRainGrow', 'boxRainGrowReverse'];
                effect = effects[Math.floor(Math.random() * (effects.length + 1))];
            } else if (effect.contains(',')) {
                var effs = effect.split(',');
                effect = effs[Math.floor(Math.random() * (effs.length + 1))];
            }
            if (effect === undefined) { effect = 'fold'; }

            console.running = true;
            var timeBuff = 0,
                i = 0,
                firstSlice = '',
                totalBoxes = '',
                boxes = '';
            var showImg = function () {
                console.running = false;
                if (console.navBar) {
                    console.navBar.children(":eq(" + idx + ")")
                        .attr('active', 'active')
                        .siblings().attr('active', '');
                }
                console.presentSlide.attr('src', console.currentImg.attr('src')).show();
                

                if (!console.paused) {
                     data.Timecount=setTimeout(function () {
                         methods._goto.call(t, idx + 1);
                     }, g.sleep);
                 }

             
                    
            




            };

            if (effect == 'none') {
                showImg();
            } else if (effect.startWith('blind')) {
                methods._createBlinds(t, g, console);
                var blinds = $('.vslide-blind', t);
                if (effect.contains('Left')) {
                    blinds = blinds._reverse();
                }
                blinds.each(function (_idx_) {
                    var blind = $(this);
                    setTimeout(function () {
                        blind.animate({ opacity: '1.0' }, g.animSpeed, function () {
                            if (_idx_ == blinds.length - 1) {
                                showImg();
                            }
                        });
                    }, (100 + timeBuff));
                    timeBuff += 50;
                });
            }
            else if (effect.startWith('fold')) {
                methods._createBlinds(t, g, console);
                timeBuff = 0;
                i = 0;
                var blinds = $('.vslide-blind', t);
                if (effect.contains("Left")) {
                    blinds = blinds._reverse();
                }
                blinds.each(function (_idx_) {
                    var blind = $(this);
                    var orgw = blind.width();
                    blind.css({ top: 0, width: 0 });
                    setTimeout(function () {
                        blind.animate({ width: orgw, opacity: '1.0' }, g.animSpeed, function () {
                            if (_idx_ == blinds.length - 1) {
                                showImg();
                            }
                        });
                    }, (100 + timeBuff));
                    timeBuff += 50;
                });
            } else if (effect === 'fade') {
                methods._createBlinds(t, g, console);
                var blind = $('.vslide-blind:first', t);
                blind.css('opacity', '0')
                    .width(g.width)
                    .animate({ opacity: '1.0' }, (g.animSpeed * 2), showImg);
            } else if (effect === 'slideInRight') {
                methods._createBlinds(t, g, console);
                var blind = $('.vslide-blind:first', t);
                blind.width(0)
                    .css('opacity', '1.0')
                    .animate({ width: g.width + 'px' }, (g.animSpeed * 2), showImg);
            } else if (effect === 'slideInLeft') {
                methods._createBlinds(t, g, console);
                var blind = $('.vslide-blind:first', t);
                blind.width(0)
                    .css({
                        opacity: '1',
                        left: '',
                        right: 0
                    })
                    .animate({ width: g.width }, (g.animSpeed * 2), '', function () {
                        // Reset positioning
                        blind.css({
                            'left': '0px',
                            'right': ''
                        });
                        showImg();
                    });
            } else if (effect === 'boxRandom') {
                methods._createBox(t, g, console);
                timeBuff = 0;
                var shuffle = function (arr) {
                    for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i, 10), x = arr[--i], arr[i] = arr[j], arr[j] = x);
                    return arr;
                };
                boxes = shuffle($('.vslide-box', t));
                boxes.each(function (_idx_) {
                    var box = $(this);
                    setTimeout(function () {
                        box.animate({ opacity: '1' }, g.animSpeed, function () {
                            if (_idx_ == boxes.length - 1) {
                                showImg();
                            }
                        });
                    }, (100 + timeBuff));
                    timeBuff += 20;
                });
            } else if (effect === 'boxRain' || effect === 'boxRainReverse' || effect === 'boxRainGrow' || effect === 'boxRainGrowReverse') {
                methods._createBox(t, g, console);
                timeBuff = 0;

                totalBoxes = g.boxCols * g.boxRows;

                // Split boxes into 2D array
                var rowIndex = 0;
                var colIndex = 0;
                var box2Darr = [];
                box2Darr[rowIndex] = [];
                boxes = $('.vslide-box', t);
                if (effect === 'boxRainReverse' || effect === 'boxRainGrowReverse') {
                    boxes = boxes._reverse();
                }
                boxes.each(function () {
                    box2Darr[rowIndex][colIndex] = $(this);
                    colIndex++;
                    if (colIndex === g.boxCols) {
                        rowIndex++;
                        colIndex = 0;
                        box2Darr[rowIndex] = [];
                    }
                });

                // Run animation
                i = 0;
                for (var cols = 0; cols < (g.boxCols * 2) ; cols++) {
                    var prevCol = cols;
                    for (var rows = 0; rows < g.boxRows; rows++) {
                        if (prevCol >= 0 && prevCol < g.boxCols) {
                            /* Due to some weird JS bug with loop vars 
                            being used in setTimeout, this is wrapped
                            with an anonymous function call */
                            (function (row, col, time, totalBoxes) {
                                var box = $(box2Darr[row][col]);
                                var w = box.width();
                                var h = box.height();
                                if (effect === 'boxRainGrow' || effect === 'boxRainGrowReverse') {
                                    box.width(0).height(0);
                                }
                                setTimeout(function () {
                                    box.animate({ opacity: '1', width: w, height: h }, g.animSpeed / 1.3,
                                        function () {
                                            if (i == totalBoxes - 1) {
                                                showImg();
                                            }
                                        });
                                }, (100 + time));
                            })(rows, prevCol, timeBuff, totalBoxes);
                        }
                        prevCol--;
                        i++;
                    }
                    timeBuff += 100;
                    if (cols == g.boxCols * 2 - 1) {
                        showImg();
                    }
                }
            }
        },
        _showCaption: function (g, console) {
            var title = console.currentImg.attr('title');
            if (title) {
                if (title.startWith('#')) {
                    title = $(title).html();
                }
                if (console.captionBar.is(':visible')) {
                    setTimeout(function () { console.captionBar.html(title); }, g.animSpeed);
                } else {
                    console.captionBar.html('').stop().fadeIn(g.animSpeed);
                }
            } else {
                console.captionBar.stop().fadeOut(g.animSpeed);
            }
        }
    };
    $.fn.vslide = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vslide');
        }
    };
    $.fn._reverse = [].reverse;
})(jQuery);