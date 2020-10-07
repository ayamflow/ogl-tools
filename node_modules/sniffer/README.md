sniffer.js
===

A browser sniffing util.

## Install

```
npm install watsondg/sniffer -S
```

## Usage

```
var sniffer = require('sniffer');

console.log(sniffer.isDesktop); // true

// If using any app singleton, you can do something like
_.extend(App, sniffer.getInfos());
console.log(App.isDesktop); // true

sniffer.addClasses(document.documentElement);
console.log(document.documentElement.className); // is-desktop
```

## Instance Methods

### addClasses(el)

Add dashed-case sniffing classes to the given element, i.e. `is-ios`, `is-firefox`.
* `el` - the element to add classes to.


### getInfos()

Return an object containing all the sniffing properties.

## Instance Properties

### isEdge
### isIE
### isIE11

### isDroid
### isDroidTablet
### isDroidPhone

### isIos
### isIpad

### isTablet
### isPhone
### isDevice `(isPhone && isTablet)`

### isDesktop
### isFirefox
### isSafari
### isOpera
### isChrome

## License
MIT.
