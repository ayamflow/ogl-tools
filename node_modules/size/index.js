'use strict';

var Emitter = require('tiny-emitter');
var debounce = require('debounce');
var EVENT_NAME = 'resize';

var emitter = new Emitter();
var debounceTime;
var debounced;
var isiOS = (/ip(hone|od|ad)/i).test(window.navigator.userAgent.toLowerCase()) && !window.MSStream;

var size = module.exports = {
    width: 0,
    height: 0,
    hasBar: false,
    isLandscape: false,

    addListener: function(listener, context) {
        emitter.on(EVENT_NAME, listener, context);
    },

    removeListener: function(listener, context) {
        if(listener) emitter.off(EVENT_NAME, listener, context);
    },

    bind: function(opts) {
        opts = opts || {};
        size.unbind();
        debounceTime = opts.debounceTime || 150;
        debounced = debounce(onEvent, debounceTime);
        window.addEventListener(EVENT_NAME, debounced);
    },

    unbind: function() {
        window.removeEventListener(EVENT_NAME, debounced);
    }
};

function onEvent() {
    if (isiOS) {
        size.hasBar = size.width > size.height && size.height > window.innerHeight;
    }

    size.width = window.innerWidth;
    size.height = window.innerHeight;

    size.isLandscape = size.width > size.height;
    emitter.emit(EVENT_NAME, size.width, size.height);
}

onEvent();
size.bind();