size.js
===

Small util to centralize and debounce window 'resize' events.

- Avoid accessing a global object (window)
- Avoid triggering [unnecessary repaint/reflow](https://gist.github.com/paulirish/5d52fb081b3570c81e3a)
- Avoid locking the UI by only dispatching one event


## Install

```
npm install watsondg/size -S
```

## Usage

```
var size = require('size');

size.addListener(function(width, height) {
    console.log('resized', width, height);
});
console.log(size.width);
```

## Instance Methods

### addListener(handler[, context])

Bind a function to the resize event
* `handler` - the function to call after a resize event
* `context` - (OPTIONAL) - the context to bind the event callback to


### removeListener(handler[, context])

Unbind a function to the resize event
* `handler` - the function to call after a resize event
* `context` - (OPTIONAL) - the context to bind the event callback to

### bind(options)

Enable the singleton by listen to the window `onresize` event.
* `options` - a hash containing configurable options:
- `debounceTime`: debounce delay for the window `onresize` event. Defaults is 150.

### unbind()

Unbind the window `onresize` event.

## Instance Properties

### width
### height
### isLandscape
### hasBar (experimental)
true on mobile if the browser bar is shown on iOS.

## License
MIT.
