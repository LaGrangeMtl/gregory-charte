"use strict";


var ns = require('ns');
var $ = require('jquery');
var Menu = require('./Menu');
require('selectric');

ns.docReady.then(function(){

	/* SELECT */

	var selects = $('select');
	selects.selectric();

	/* BUTTONS */

	var input_fields = $('input[type=text], input[type=email], input[type=number], input[type=password]');
	input_fields.on('blur change', function(){
		var el = $(this);
		if(el.val() == "") el.addClass('empty');
		else el.removeClass('empty');
	}).trigger('blur');


	Menu.init();
});
