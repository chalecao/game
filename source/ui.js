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
    this.enable = function () { };
    this.updateStatus = function () { };
    this.writeAudio = function () { };
    this.writeFrame = function () { };
};
JSNES.store = {
    set: function (k, v) {
        if (window.localStorage) {
            window.localStorage.setItem(k, v);
        } else {
            $.fn.cookie(k, v + "");
        }
    },
    get: function (k) {
        if (window.localStorage) {
            return window.localStorage.getItem(k);
        } else {
            return $.fn.cookie(k);
        }
    }
};
var imageData, pixel, i, j;
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
                    resolution: $('<input type="button" value="高分辨率" class="nes-resolution">').appendTo(self.controls),
                    restart: $('<input type="button" value="重新开始" class="nes-restart" disabled="disabled">').appendTo(self.controls),
                    sound: $('<input type="button" value="开启声音" class="nes-enablesound">').appendTo(self.controls),
                    hide: $('<input type="button" value="收起" class="nes-hide">').appendTo(self.controls),
                    show: $('<input type="button" value="设置" class="nes-show">').appendTo(self.root),
                    payTips: $('<h4 class="pay-tips">FED123出品</h4>').appendTo(self.intro)
                };
                self.resolution = 2; //高分辨率
                self.status = $('<p class="nes-status">加载中，请稍后...</p>').appendTo(self.intro);
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
                joystickView.btnAA = $('<div type="button" class="ctrl-btnAA">AA</div>').appendTo($("#joystickContent"));
                joystickView.btnAB = $('<div type="button" class="ctrl-btnAB">AB</div>').appendTo($("#joystickContent"));
                joystickView.btnAABB = $('<div type="button" class="ctrl-btnAABB">A2B</div>').appendTo($("#joystickContent"));
                joystickView.btnB = $('<div type="button" class="ctrl-btnB">B</div>').appendTo($("#joystickContent"));
                joystickView.btnBB = $('<div type="button" class="ctrl-btnBB">BB</div>').appendTo($("#joystickContent"));
                joystickView.btnUp = $('<div type="button" class="ctrl-btn-up">上</div>').appendTo($("#joystickContent"));
                joystickView.btnDown = $('<div type="button" class="ctrl-btn-down">下</div>').appendTo($("#joystickContent"));
                joystickView.btnLeft = $('<div type="button" class="ctrl-btn-left">左</div>').appendTo($("#joystickContent"));
                joystickView.btnRight = $('<div type="button" class="ctrl-btn-right">右</div>').appendTo($("#joystickContent"));
                joystickView.start.bind("touchstart click touchmove", function (e) {
                    self.nes.keyboard.setKey(13, 0x41)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(13, 0x40)
                    }, 300)
                    e.preventDefault();
                    e.stopPropagation();
                });
                joystickView.select.bind("touchstart click touchmove", function (e) {
                    self.nes.keyboard.setKey(17, 0x41)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(17, 0x40)
                    }, 300)
                    e.preventDefault();
                    e.stopPropagation();
                });
                joystickView.btnA.bind("touchstart click touchmove", function (e) {

                    self.nes.keyboard.setKey(88, 0x41)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(88, 0x40)
                    }, 300)
                    e.preventDefault();
                    e.stopPropagation();
                });
                joystickView.btnAA.bind("touchstart click touchmove", function (e) {
                    if (!joystickView.btnAAFlag) {
                        joystickView.btnAAFlag = true;
                        self.nes.keyboard.setKey(88, 0x41)
                        setTimeout(function () {
                            self.nes.keyboard.setKey(88, 0x40)

                            self.nes.keyboard.setKey(88, 0x41)
                            setTimeout(function () {
                                self.nes.keyboard.setKey(88, 0x40)
                                joystickView.btnAAFlag = false;
                            }, 200)
                        }, 200)
                    }
                    e.preventDefault();
                    e.stopPropagation();
                });
                joystickView.btnAB.bind("touchstart click touchmove", function (e) {
                    self.nes.keyboard.setKey(88, 0x41)
                    self.nes.keyboard.setKey(89, 0x41)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(88, 0x40)
                    }, 300)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(89, 0x40)
                    }, 300)
                    e.preventDefault();
                    e.stopPropagation();
                });
                joystickView.btnAABB.bind("touchstart click touchmove", function (e) {
                    if (!joystickView.btnAABBFlag) {
                        joystickView.btnAABBFlag = true;
                        self.nes.keyboard.setKey(88, 0x41)
                        self.nes.keyboard.setKey(89, 0x41)
                        setTimeout(function () {
                            self.nes.keyboard.setKey(88, 0x40)
                        }, 200)
                        setTimeout(function () {
                            self.nes.keyboard.setKey(89, 0x40)

                            self.nes.keyboard.setKey(88, 0x41)
                            self.nes.keyboard.setKey(89, 0x41)
                            setTimeout(function () {
                                self.nes.keyboard.setKey(88, 0x40)
                            }, 200)
                            setTimeout(function () {
                                self.nes.keyboard.setKey(89, 0x40)
                                joystickView.btnAABBFlag = false;
                            }, 200)
                        }, 200)
                    }
                    e.preventDefault();
                    e.stopPropagation();
                });
                joystickView.btnB.bind("touchstart click touchmove", function (e) {
                    self.nes.keyboard.setKey(89, 0x41)
                    setTimeout(function () {
                        self.nes.keyboard.setKey(89, 0x40)
                    }, 300)
                    e.preventDefault();
                    e.stopPropagation();
                });
                joystickView.btnBB.bind("touchstart click touchmove", function (e) {
                    if (!joystickView.btnBBFlag) {
                        joystickView.btnBBFlag = true;
                        self.nes.keyboard.setKey(89, 0x41)
                        setTimeout(function () {
                            self.nes.keyboard.setKey(89, 0x40)
                            self.nes.keyboard.setKey(89, 0x41)
                            setTimeout(function () {
                                self.nes.keyboard.setKey(89, 0x40)
                                joystickView.btnBBFlag = false;
                            }, 200)
                        }, 200)
                    }
                    e.preventDefault();
                    e.stopPropagation();
                });
                joystickView.btnRight.bind("touchstart click touchmove", function (e) {
                    self.nes.keyboard.setKey(39, 0x41) //right
                    setTimeout(function () {
                        self.nes.keyboard.setKey(39, 0x40)
                    }, 200)
                    e.preventDefault();
                    e.stopPropagation();
                });
                joystickView.btnLeft.bind("touchstart click touchmove", function (e) {
                    self.nes.keyboard.setKey(37, 0x41) //left
                    setTimeout(function () {
                        self.nes.keyboard.setKey(37, 0x40)
                    }, 200)
                    e.preventDefault();
                    e.stopPropagation();
                });
                joystickView.btnUp.bind("touchstart click touchmove", function (e) {
                    self.nes.keyboard.setKey(38, 0x41) //up
                    setTimeout(function () {
                        self.nes.keyboard.setKey(38, 0x40)
                    }, 200)
                    e.preventDefault();
                    e.stopPropagation();
                });
                joystickView.btnDown.bind("touchstart click touchmove", function (e) {
                    self.nes.keyboard.setKey(40, 0x41) //down
                    setTimeout(function () {
                        self.nes.keyboard.setKey(40, 0x40)
                    }, 200)
                    e.preventDefault();
                    e.stopPropagation();
                });
                // joystickView.bind("verticalMove", function (y) {
                //     if (y > 0.5) {
                //         self.nes.keyboard.setKey(38, 0x41) //up
                //         setTimeout(function () {
                //             self.nes.keyboard.setKey(38, 0x40)
                //         }, 200)
                //     }
                //     if (y < -0.5) {
                //         self.nes.keyboard.setKey(40, 0x41) //down
                //         setTimeout(function () {
                //             self.nes.keyboard.setKey(40, 0x40)
                //         }, 200)
                //     }

                // });
                // joystickView.bind("horizontalMove", function (x) {
                //     if (x > 0.5) {
                //         self.nes.keyboard.setKey(39, 0x41) //right
                //         setTimeout(function () {
                //             self.nes.keyboard.setKey(39, 0x40)
                //         }, 200)
                //     }
                //     if (x < -0.5) {
                //         self.nes.keyboard.setKey(37, 0x41) //left
                //         setTimeout(function () {
                //             self.nes.keyboard.setKey(37, 0x40)
                //         }, 200)
                //     }
                // });

                self.buttons.payTips.bind("click", function (x) {
                    JSNES.store.set("gameCnt", 1)
                })

                /*
                 * ROM loading
                 * 每隔24小时只能玩6次
                 * 
                 */
                self.romSelect.change(function () {
                    // var _st = +JSNES.store.get("startTime");
                    // if (!JSNES.store.get("startTime")) {
                    //     JSNES.store.set("startTime", +new Date())
                    //     JSNES.store.set("gameCnt", 1)
                    // }
                    // if (+new Date() - _st < 24 * 60 * 60 * 1000) {
                    //     var _cnt = +JSNES.store.get("gameCnt");
                    //     if (!_cnt) {
                    //         JSNES.store.set("gameCnt", 1)
                    //     } else {
                    //         JSNES.store.set("gameCnt", _cnt + 1)
                    //     }
                        // if (_cnt > 6 || self.romSelect.val() == "local") {
                        //     if (_cnt > 6) {
                        //         self.updateStatus("每天只能玩6次哦，点亮github小星星玩更多(⊙o⊙)哦");
                        //     } else {
                        //         self.updateStatus("点亮github小星星后才能使用该功能(⊙o⊙)哦");
                        //     }
                        // } else {
                        // self.romSelect.val() && self.loadROM();
                        // }
                    // } else {
                        JSNES.store.set("startTime", +new Date())
                        JSNES.store.set("gameCnt", 1)
                        self.romSelect.val() && self.loadROM();
                    // }
                });

                /*
                 * Buttons
                 */
                self.buttons.resolution.click(function () {
                    if (self.buttons.resolution.val() != "低分辨率") {
                        self.buttons.resolution.val("低分辨率")
                        self.resolution = 1;
                    } else {
                        self.buttons.resolution.val("高分辨率")
                        self.resolution = 2;
                    }
                });
                self.buttons.pause.click(function () {
                    if (self.nes.isRunning) {
                        self.nes.stop();
                        self.updateStatus("暂停中...");
                        self.buttons.pause.attr("value", "恢复");
                    } else {
                        self.nes.start();
                        self.buttons.pause.attr("value", "暂停");
                    }
                });

                self.buttons.restart.click(function () {
                    self.intro.hide();
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
                    self.updateStatus("加载中，请稍后...");
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
                            $("#joystickContent").css("opacity", 0.8);
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
                    $("<option value='local'>加载本地nes游戏</option>").appendTo(this.romSelect);
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
                    imageData = this.canvasImageData.data;
                    //这里没有用256*240 而是减少了采样
                    for (i = 0; i < 256 * 240;) {
                        pixel = buffer[i];
                        if (pixel != prevBuffer[i]) {
                            j = i * 4;
                            //只填 第0第1第2这三个颜色信息，第3个应该是透明度信息，默认255
                            imageData[j] = pixel & 0xFF;
                            imageData[j + 1] = (pixel >> 8) & 0xFF;
                            imageData[j + 2] = (pixel >> 16) & 0xFF;
                            if (this.resolution == 1) {
                                j = (i + 1) * 4;
                                //只填 第0第1第2这三个颜色信息，第3个应该是透明度信息，默认255
                                imageData[j] = pixel & 0xFF;
                                imageData[j + 1] = (pixel >> 8) & 0xFF;
                                imageData[j + 2] = (pixel >> 16) & 0xFF;
                            }
                            prevBuffer[i] = pixel;
                        }
                        i++;
                        if (this.resolution == 1) {
                            i++;
                        }
                    }

                    this.canvasContext.putImageData(this.canvasImageData, 0, 0);
                }
            };

            return UI;
        };
    })(Zepto);
}