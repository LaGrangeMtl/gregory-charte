(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";


var ns = require('ns');
var $ = require('jquery');
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


	/* MENUS */

	var menuHead = $('[class^=menu-head]');
	var menuTabs = menuHead.find('[data-menu-tab]');
	var menuTabsContent = menuTabs.find('.tab-content');

	var handleMenuTabs = function(e) {
		e.preventDefault();
		var tab = $(e.currentTarget);
		var tabContent = tab.find('.tab-content');

		if(tab.hasClass('active')){
			tab.removeClass('active');
			tabContent.css({bottom:0});
			return;
		}

		var wait = menuTabs.filter('.active').length > 0 ? 300 : 0;

		menuTabs.removeClass('active');
		menuTabs.not(tab).find('.tab-content').css({bottom:0});

		setTimeout(function(){
			tab.addClass('active');
			var tabContentHeight = tabContent.outerHeight();
			tabContent.css({bottom:-tabContentHeight+'px'});
		}, wait);
	}

	var handleMenuTabsContent = function(e){
		e.preventDefault();
		e.stopPropagation();
	}

	menuTabs.on('click.menu_head', handleMenuTabs);
	menuTabsContent.on('click.menu_head', handleMenuTabsContent);

});
},{"jquery":"jquery","ns":2,"selectric":"selectric"}],2:[function(require,module,exports){
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
},{"jquery":"jquery","promise":"promise"}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvY2hhcnRlL0FwcC5qcyIsImFwcC9jaGFydGUvTmFtZVNwYWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5cbnZhciBucyA9IHJlcXVpcmUoJ25zJyk7XG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xucmVxdWlyZSgnc2VsZWN0cmljJyk7XG5cbm5zLmRvY1JlYWR5LnRoZW4oZnVuY3Rpb24oKXtcblxuXHQvKiBTRUxFQ1QgKi9cblxuXHR2YXIgc2VsZWN0cyA9ICQoJ3NlbGVjdCcpO1xuXHRzZWxlY3RzLnNlbGVjdHJpYygpO1xuXG5cdC8qIEJVVFRPTlMgKi9cblxuXHR2YXIgaW5wdXRfZmllbGRzID0gJCgnaW5wdXRbdHlwZT10ZXh0XSwgaW5wdXRbdHlwZT1lbWFpbF0sIGlucHV0W3R5cGU9bnVtYmVyXSwgaW5wdXRbdHlwZT1wYXNzd29yZF0nKTtcblx0aW5wdXRfZmllbGRzLm9uKCdibHVyIGNoYW5nZScsIGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGVsID0gJCh0aGlzKTtcblx0XHRpZihlbC52YWwoKSA9PSBcIlwiKSBlbC5hZGRDbGFzcygnZW1wdHknKTtcblx0XHRlbHNlIGVsLnJlbW92ZUNsYXNzKCdlbXB0eScpO1xuXHR9KS50cmlnZ2VyKCdibHVyJyk7XG5cblxuXHQvKiBNRU5VUyAqL1xuXG5cdHZhciBtZW51SGVhZCA9ICQoJ1tjbGFzc149bWVudS1oZWFkXScpO1xuXHR2YXIgbWVudVRhYnMgPSBtZW51SGVhZC5maW5kKCdbZGF0YS1tZW51LXRhYl0nKTtcblx0dmFyIG1lbnVUYWJzQ29udGVudCA9IG1lbnVUYWJzLmZpbmQoJy50YWItY29udGVudCcpO1xuXG5cdHZhciBoYW5kbGVNZW51VGFicyA9IGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dmFyIHRhYiA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcblx0XHR2YXIgdGFiQ29udGVudCA9IHRhYi5maW5kKCcudGFiLWNvbnRlbnQnKTtcblxuXHRcdGlmKHRhYi5oYXNDbGFzcygnYWN0aXZlJykpe1xuXHRcdFx0dGFiLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0XHRcdHRhYkNvbnRlbnQuY3NzKHtib3R0b206MH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciB3YWl0ID0gbWVudVRhYnMuZmlsdGVyKCcuYWN0aXZlJykubGVuZ3RoID4gMCA/IDMwMCA6IDA7XG5cblx0XHRtZW51VGFicy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0bWVudVRhYnMubm90KHRhYikuZmluZCgnLnRhYi1jb250ZW50JykuY3NzKHtib3R0b206MH0pO1xuXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0dGFiLmFkZENsYXNzKCdhY3RpdmUnKTtcblx0XHRcdHZhciB0YWJDb250ZW50SGVpZ2h0ID0gdGFiQ29udGVudC5vdXRlckhlaWdodCgpO1xuXHRcdFx0dGFiQ29udGVudC5jc3Moe2JvdHRvbTotdGFiQ29udGVudEhlaWdodCsncHgnfSk7XG5cdFx0fSwgd2FpdCk7XG5cdH1cblxuXHR2YXIgaGFuZGxlTWVudVRhYnNDb250ZW50ID0gZnVuY3Rpb24oZSl7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdH1cblxuXHRtZW51VGFicy5vbignY2xpY2subWVudV9oZWFkJywgaGFuZGxlTWVudVRhYnMpO1xuXHRtZW51VGFic0NvbnRlbnQub24oJ2NsaWNrLm1lbnVfaGVhZCcsIGhhbmRsZU1lbnVUYWJzQ29udGVudCk7XG5cbn0pOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbmFtZSA9ICdjaGFydGUnO1xuXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ3Byb21pc2UnKTtcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbnZhciBucyA9IHdpbmRvd1tuYW1lXSA9ICh3aW5kb3dbbmFtZV0gfHwge30pO1xuXG5ucy5kb2NSZWFkeSA9IChmdW5jdGlvbigpe1xuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0JChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblx0XHRcdHJlc29sdmUoKTtcblx0XHR9KTtcblx0fSk7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5zOyJdfQ==
