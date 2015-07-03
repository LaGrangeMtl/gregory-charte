//Puts jQuery in global scope for non-commonjs plugins
window.$ = window.jQuery = (window.jQuery || require('jquery'));

window.GreenSockGlobals = {};


require('es5-shim');
require('console-polyfill');