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