'use strict';

var test = require('tape');
var sniffer = require('../index.js');

test('Desktop test', function(assert) {
    assert.ok(sniffer.isDesktop, 'isDesktop should be true.');
    assert.end();
});

test('Browsers test', function(assert) {
    assert.notOk(sniffer.isDesktop === sniffer.isPhone, 'Shouldnt be both desktop and phone.');

    assert.notOk((sniffer.isChrome || sniffer.isSafari) && sniffer.isChrome === sniffer.isSafari, 'Shouldnt be both chrome and safari.');

    assert.notOk((sniffer.isChrome || sniffer.isFirefox) && sniffer.isChrome === sniffer.isFirefox, 'Shouldnt be both chrome and firefox.');

    assert.notOk((sniffer.isIE || sniffer.isFirefox) && sniffer.isIE === sniffer.isFirefox, 'Shouldnt be both IE and firefox.');

    assert.notOk(sniffer.isIos && sniffer.isWindowsPhone, 'Shouldnt be both iOS and Windows Mobile.');
    assert.notOk(sniffer.isDroid && sniffer.isWindowsPhone, 'Shouldnt be both Android and Windows Mobile.');

    assert.end();
});

test('Freeze test', function(assert) {
    var isDesktop = sniffer.isDesktop;

    try {
        sniffer.isDesktop = Math.random();
    } catch(e) {}

    assert.ok(isDesktop == sniffer.isDesktop, 'Properties should be immutables.');
    assert.end();
});