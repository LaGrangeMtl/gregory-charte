"use strict";

var name = 'charte';

var Promise = require('promise');
var $ = require('jquery');

var ns = window[name] = (window[name] || {});

ns.docReady = (function(){
	return new Promise(function(resolve, reject) {
		$(document).ready(function(){
			resolve();
		});
	});
})();

module.exports = ns;