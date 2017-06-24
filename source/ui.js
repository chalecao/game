/*
JSNES, based on Jamie Sanders' vNES
Copyright (C) 2010 Ben Firshman

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

JSNES.DummyUI = function (nes) {
    this.nes = nes;
    this.enable = function () {};
    this.updateStatus = function () {};
    this.writeAudio = function () {};
    this.writeFrame = function () {};
};

if (typeof Zepto !== 'undefined') {
    (function ($) {
        $.fn.JSNESUI = function (roms) {
            var parent = this;
            var UI = function (nes) {
                var self = this;
                self.nes = nes;

                /*
                 * Create UI
                 */
                self.root = $('<div></div>');
                self.screen = $('<canvas class="nes-screen" width="256" height="240"></canvas>').appendTo(self.root);
                self.intro = $('<div class="nes-intro"></div>').appendTo(self.root);
                if (!self.screen[0].getContext) {
                    parent.html("Your browser doesn't support the <code>&lt;canvas&gt;</code> tag. Try Google Chrome, Safari, Opera or Firefox!");
                    return;
                }

                self.romContainer = $('<div class="nes-roms"></div>').appendTo(self.intro);
                self.romSelect = $('<select></select>').appendTo(self.romContainer);

                self.controls = $('<div class="nes-controls"></div>').appendTo(self.intro);
                self.buttons = {
                    pause: $('<input type="button" value="暂停" class="nes-pause" disabled="disabled">').appendTo(self.controls),
                    restart: $('<input type="button" value="重新开始" class="nes-restart" disabled="disabled">').appendTo(self.controls),
                    sound: $('<input type="button" value="关闭声音" class="nes-enablesound">').appendTo(self.controls),
                    hide: $('<input type="button" value="收起设置" class="nes-hide">').appendTo(self.controls),
                    show: $('<input type="button" value="设置" class="nes-show">').appendTo(self.root),
                    weixin: $('<img src="/ctrl/img/weixin.jpg" class="weixin">').appendTo(self.intro),
                    alipay: $('<img src="/ctrl/img/alipay.jpg" class="alipay">').appendTo(self.intro),
                    payTips: $('<h4 class="pay-tips">微信或支付宝打赏一下，努力改进么么哒！</h4>').appendTo(self.intro)
                };
                self.status = $('<p class="nes-status">loading...</p>').appendTo(self.intro);
                self.root.appendTo(parent);
                var _H = document.documentElement.clientHeight;
                var _ch = document.documentElement.clientWidth / 256 * 240;
                self.screen.css({
                    width: document.documentElement.clientWidth,
                    height: _H > _ch ? _ch : _H
                });
                $(window).resize(function () {
                    var _H = document.documentElement.clientHeight;
                    var _ch = document.documentElement.clientWidth / 256 * 240;
                    self.screen.css({
                        width: document.documentElement.clientWidth,
                        height: _H > _ch ? _ch : _H
                    });
                });

                //place joy stick
                var joystickView = new JoystickView(150, function (callbackView) {
                    $("#joystickContent").append(callbackView.render().el);
                    setTimeout(function () {
                        callbackView.renderSprite();
                    }, 0);
                });
                joystickView.start = $('<input type="button" value="start" class="ctrl-start">').appendTo($("#joystickContent"));
                joystickView.select = $('<input type="button" value="select" class="ctrl-select">').appendTo($("#joystickContent"));
                joystickView.btnA = $('<div type="button" class="ctrl-btnA">A</div>').appendTo($("#joystickContent"));
                joystickView.btnAB = $('<div type="button" class="ctrl-btnAB">AB</div>').appendTo($("#joystickContent"));
                joystickView.btnB = $('<div type="button" class="ctrl-btnB">B</div>').appendTo($("#joystickContent"));
                joystickView.start.bind("touchstart click", function (e) {
                    self.nes.keyboard.setKey(13, 0x41)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(13, 0x40)
                    }, 300)
                    e.preventDefault();
                });
                joystickView.select.bind("touchstart click", function (e) {
                    self.nes.keyboard.setKey(17, 0x41)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(17, 0x40)
                    }, 300)
                    e.preventDefault();
                });
                joystickView.btnA.bind("touchstart click", function (e) {

                    self.nes.keyboard.setKey(88, 0x41)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(88, 0x40)
                    }, 300)
                    e.preventDefault();
                });
                joystickView.btnAB.bind("touchstart click", function (e) {
                    self.nes.keyboard.setKey(88, 0x41)
                    self.nes.keyboard.setKey(89, 0x41)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(88, 0x40)
                    }, 300)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(89, 0x40)
                    }, 300)
                    e.preventDefault();
                });
                joystickView.btnB.bind("touchstart click", function (e) {
                    self.nes.keyboard.setKey(89, 0x41)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(89, 0x40)
                    }, 300)
                    e.preventDefault();
                });
                joystickView.bind("verticalMove", function (y) {
                    if (y > 0.5) {
                        self.nes.keyboard.setKey(38, 0x41) //up
                        setTimeout(function () {
                            self.nes.keyboard.setKey(38, 0x40)
                        }, 300)
                    }
                    if (y < -0.5) {
                        self.nes.keyboard.setKey(40, 0x41) //down
                        setTimeout(function () {
                            self.nes.keyboard.setKey(40, 0x40)
                        }, 300)
                    }

                });
                joystickView.bind("horizontalMove", function (x) {
                    if (x > 0.5) {
                        self.nes.keyboard.setKey(39, 0x41) //right
                        setTimeout(function () {
                            self.nes.keyboard.setKey(39, 0x40)
                        }, 300)
                    }
                    if (x < -0.5) {
                        self.nes.keyboard.setKey(37, 0x41) //left
                        setTimeout(function () {
                            self.nes.keyboard.setKey(37, 0x40)
                        }, 300)
                    }
                });

                /*
                 * ROM loading
                 */
                self.romSelect.change(function () {
                    self.loadROM();
                });

                /*
                 * Buttons
                 */
                self.buttons.pause.click(function () {
                    if (self.nes.isRunning) {
                        self.nes.stop();
                        self.updateStatus("Paused");
                        self.buttons.pause.attr("value", "恢复");
                    } else {
                        self.nes.start();
                        self.buttons.pause.attr("value", "暂停");
                    }
                });

                self.buttons.restart.click(function () {
                    self.nes.reloadRom();
                    self.nes.start();
                });

                self.buttons.sound.click(function () {
                    if (self.nes.opts.emulateSound) {
                        self.nes.opts.emulateSound = false;
                        self.buttons.sound.attr("value", "开启声音");
                    } else {
                        self.nes.opts.emulateSound = true;
                        self.buttons.sound.attr("value", "关闭声音");
                    }
                });

                self.buttons.hide.click(function () {
                    self.intro.hide();
                });
                self.buttons.show.click(function () {
                    self.intro.show();
                });

                /*
                 * Lightgun experiments with mouse
                 * (Requires jquery.dimensions.js)
                 */
                if ($.offset) {
                    self.screen.mousedown(function (e) {
                        if (self.nes.mmap) {
                            self.nes.mmap.mousePressed = true;
                            // FIXME: does not take into account zoom
                            self.nes.mmap.mouseX = e.pageX - self.screen.offset().left;
                            self.nes.mmap.mouseY = e.pageY - self.screen.offset().top;
                        }
                    }).mouseup(function () {
                        setTimeout(function () {
                            if (self.nes.mmap) {
                                self.nes.mmap.mousePressed = false;
                                self.nes.mmap.mouseX = 0;
                                self.nes.mmap.mouseY = 0;
                            }
                        }, 500);
                    });
                }

                if (typeof roms != 'undefined') {
                    self.setRoms(roms);
                }

                /*
                 * Canvas
                 */
                self.canvasContext = self.screen[0].getContext('2d');

                if (!self.canvasContext.getImageData) {
                    parent.html("Your browser doesn't support writing pixels directly to the <code>&lt;canvas&gt;</code> tag. Try the latest versions of Google Chrome, Safari, Opera or Firefox!");
                    return;
                }

                self.canvasImageData = self.canvasContext.getImageData(0, 0, 256, 240);
                self.resetCanvas();

                /*
                 * Keyboard
                 */
                $(document).
                bind('keydown', function (evt) {
                    self.nes.keyboard.keyDown(evt);
                }).
                bind('keyup', function (evt) {
                    self.nes.keyboard.keyUp(evt);
                }).
                bind('keypress', function (evt) {
                    self.nes.keyboard.keyPress(evt);
                });

                /*
                 * Sound
                 */
                self.dynamicaudio = new DynamicAudio({
                    swf: nes.opts.swfPath + 'dynamicaudio.swf'
                });
            };

            UI.prototype = {
                loadROM: function () {
                    var self = this;
                    self.updateStatus("Downloading...");
                    $.ajax({
                        url: self.romSelect.val(),
                        xhr: function () {
                            var xhr = $.ajaxSettings.xhr();
                            if (typeof xhr.overrideMimeType !== 'undefined') {
                                // Download as binary
                                xhr.overrideMimeType('text/plain; charset=x-user-defined');
                            }
                            self.xhr = xhr;
                            return xhr;
                        },
                        complete: function (xhr, status) {
                            var i, data;
                            if (JSNES.Utils.isIE()) {
                                var charCodes = JSNESBinaryToArray(
                                    xhr.responseBody
                                ).toArray();
                                data = String.fromCharCode.apply(
                                    undefined,
                                    charCodes
                                );
                            } else {
                                data = xhr.responseText;
                            }
                            self.intro.hide();
                            self.nes.loadRom(data);
                            self.nes.start();
                            self.enable();
                        }
                    });
                },

                resetCanvas: function () {
                    this.canvasContext.fillStyle = 'black';
                    // set alpha to opaque
                    this.canvasContext.fillRect(0, 0, 256, 240);

                    // Set alpha
                    for (var i = 3; i < this.canvasImageData.data.length - 3; i += 4) {
                        this.canvasImageData.data[i] = 0xFF;
                    }
                },

                /*
                 *
                 * nes.ui.screenshot() --> return <img> element :)
                 */
                screenshot: function () {
                    var data = this.screen[0].toDataURL("image/png"),
                        img = new Image();
                    img.src = data;
                    return img;
                },

                /*
                 * Enable and reset UI elements
                 */
                enable: function () {
                    this.buttons.pause.attr("disabled", null);
                    if (this.nes.isRunning) {
                        this.buttons.pause.attr("value", "暂停");
                    } else {
                        this.buttons.pause.attr("value", "恢复");
                    }
                    this.buttons.restart.attr("disabled", null);
                    if (this.nes.opts.emulateSound) {
                        this.buttons.sound.attr("value", "关闭声音");
                    } else {
                        this.buttons.sound.attr("value", "开启声音");
                    }
                },

                updateStatus: function (s) {
                    this.status.text(s);
                },

                setRoms: function (roms) {
                    this.romSelect.children().remove();
                    $("<option>请选择游戏</option>").appendTo(this.romSelect);
                    for (var groupName in roms) {
                        if (roms.hasOwnProperty(groupName)) {
                            var optgroup = $('<optgroup></optgroup>').
                            attr("label", groupName);
                            for (var i = 0; i < roms[groupName].length; i++) {
                                $('<option>' + roms[groupName][i][0] + '</option>')
                                    .attr("value", roms[groupName][i][1])
                                    .appendTo(optgroup);
                            }
                            this.romSelect.append(optgroup);
                        }
                    }
                },

                writeAudio: function (samples) {
                    return this.dynamicaudio.writeInt(samples);
                },

                writeFrame: function (buffer, prevBuffer) {
                    var imageData = this.canvasImageData.data;
                    var pixel, i, j;

                    for (i = 0; i < 256 * 240; i++) {
                        pixel = buffer[i];

                        if (pixel != prevBuffer[i]) {
                            j = i * 4;
                            imageData[j] = pixel & 0xFF;
                            imageData[j + 1] = (pixel >> 8) & 0xFF;
                            imageData[j + 2] = (pixel >> 16) & 0xFF;
                            prevBuffer[i] = pixel;
                        }
                    }

                    this.canvasContext.putImageData(this.canvasImageData, 0, 0);
                }
            };

            return UI;
        };
    })(Zepto);
}