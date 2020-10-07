'use strict';

var test = require('tape');
var size = require('../index.js');
var debounceTime = 150;

size.bind({
    debounceTime: debounceTime
});

test('addListener test', function(assert) {
    var resizeHandler = function() {
        size.removeListener(resizeHandler);
        assert.pass('resize handler should be called.');
        assert.end();
    };
    size.addListener(resizeHandler);

    triggerResize();
});

test('removeListener test', function(assert) {
    var resizeHandler = function() {
        assert.fail('resize handler shouldn\'t be called.');
    };
    size.addListener(resizeHandler);
    size.removeListener(resizeHandler);
    triggerResize();

    setTimeout(function() {
        assert.pass('resize handler NOT called.');
        assert.end();
    }, debounceTime + 20);
});

test('instance properties test', function(assert) {
    assert.plan(3);

    var resizeHandler = function() {
        size.removeListener(resizeHandler);
        assert.ok(size.width > 0, 'width should not be null');
        assert.ok(size.height > 0, 'width should not be null');
        assert.ok(size.isLandscape === size.width > size.height ? true : false, 'isLandscape should reflect window ratio.');
    };
    size.addListener(resizeHandler);
    triggerResize();
});

test('width/height test', function(assert) {
    var resizeHandler = function(width, height) {
        assert.ok(width == window.innerWidth, 'Passed width should be same as window width');
        size.removeListener(resizeHandler);
        assert.end();
    };
    size.addListener(resizeHandler);

    triggerResize();
});

function triggerResize() {
    window.dispatchEvent(new Event('resize'));
}

test('unbind test', function(assert) {
    var resizeHandler = function() {
        assert.fail('resize handler shouldn\'t be called.');
    };

    size.unbind();
    triggerResize();

    setTimeout(function() {
        assert.pass('resize handler NOT called.');
        assert.end();
    }, debounceTime + 20);
});