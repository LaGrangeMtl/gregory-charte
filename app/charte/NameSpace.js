"use strict";

var name = 'charte';

var Promise = require('promise');
var $ = require('jquery');
var validationEngine = require('validate');
var FormUtils = require('./FormUtils.js');

var ns = window[name] = (window[name] || {});

ns.docReady = (function(){
	return new Promise(function(resolve, reject) {
		$(document).ready(function(){
			resolve();
		});
	});
})();

ns.docReady.then(function(){
	validationEngine.setLanguage(ns.lang);

	$('form').each(function(i, el){
		FormUtils.attachValidation($(el));
	}).on('submit', function(e){
		FormUtils.validate($(this));
	});
});

module.exports = ns;