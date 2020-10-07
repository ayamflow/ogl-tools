'use strict';

var dashify = require('dashify');

module.exports = new Sniffer();

function Sniffer() {
    var ua = navigator.userAgent.toLowerCase();
    var av = navigator.appVersion.toLowerCase();

    var isWindowsPhone = /windows phone|iemobile|wpdesktop/.test(ua);

    var isDroidPhone = !isWindowsPhone && /android.*mobile/.test(ua);
    var isDroidTablet = !isWindowsPhone && !isDroidPhone && (/android/i).test(ua);
    var isDroid = isDroidPhone || isDroidTablet;

    var isIos = !isWindowsPhone && (/ip(hone|od|ad)/i).test(ua) && !window.MSStream;
    var isIpad = !isWindowsPhone && (/ipad/i).test(ua) && isIos;

    var isTablet = isDroidTablet || isIpad;
    var isPhone = isDroidPhone || (isIos && !isIpad) || isWindowsPhone;
    var isDevice = isPhone || isTablet;

    var isFirefox = ua.indexOf('firefox') > -1;
    var isSafari = !!ua.match(/version\/[\d\.]+.*safari/);
    var isOpera = ua.indexOf('opr') > -1;
    var isIE11 = !(window.ActiveXObject) && "ActiveXObject" in window;
    var isIE = av.indexOf('msie') > -1 || isIE11 || av.indexOf('edge') > -1;
    var isEdge = ua.indexOf('edge') > -1;
    var isChrome = window.chrome !== null && window.chrome !== undefined && navigator.vendor.toLowerCase() == 'google inc.' && !isOpera && !isEdge;

    this.infos = {
        isDroid: isDroid,
        isDroidPhone: isDroidPhone,
        isDroidTablet: isDroidTablet,
        isWindowsPhone: isWindowsPhone,
        isIos: isIos,
        isIpad: isIpad,
        isDevice: isDevice,
        isEdge: isEdge,
        isIE: isIE,
        isIE11: isIE11,
        isPhone: isPhone,
        isTablet: isTablet,
        isFirefox: isFirefox,
        isSafari: isSafari,
        isOpera: isOpera,
        isChrome: isChrome,
        isDesktop: !isPhone && !isTablet
    };

    Object.keys(this.infos).forEach(function(info) {
        Object.defineProperty(this, info, {
            get: function () {
                return this.infos[info];
            }
        });
    }, this);

    Object.freeze(this);

    // TODO: add getVersion() to get IE/Safari/... version
}

Sniffer.prototype.addClasses = function(el) {
    Object.keys(this.infos).forEach(function(info) {
        if (this.infos[info]) addClass(el, dashify(info));
    }, this);
};

Sniffer.prototype.getInfos = function() {
    return clone(this.infos);
};

function addClass(el, className) {
    if (el.addClass) el.addClass(className);
    else if (el.classList) el.classList.add(className);
    else el.className += ' ' + className;
}

function clone(source) {
    return JSON.parse(JSON.stringify(source));
}