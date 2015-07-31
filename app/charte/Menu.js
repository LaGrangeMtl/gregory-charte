"use strict";


var ns = require('ns');
var $ = require('jquery');

/* MENUS */
var menuHead;
var menuTabs;
var menuTabsBtns;
var menuTabsContent;
var origTabContentZI;

var handleMenuTabs = function(e) {
	e.preventDefault();
	var tab = $(e.currentTarget).parent();
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
};

var closeMenuTab = function(e){
	e.preventDefault();
	console.log(e);
	var tab = menuTabs.has($(e.currentTarget));
	tab.removeClass('active').promise().done(function(){
		tab.css({zIndex:origTabContentZI});
	});
};

var handleMenuTabsMobile = function(e){
	e.preventDefault();

	var tab = $(e.currentTarget).parent();
	tab.css({zIndex:'3'}).promise().done(function(){
		tab.find('.close-btn')
			.off('click.menu_head')
			.on('click.menu_head', closeMenuTab);

		tab.toggleClass('active');
	});
};

var setupMenuEvents = function(isMobile) {
	menuTabsBtns.off('click.menu_head');
	menuTabsBtns.on('click.menu_head', isMobile ? handleMenuTabsMobile : handleMenuTabs);
};

var checkIfMobile = function(){
	return $(window).width() < 992;
};

var init = function(){
    menuHead = $('[class^=menu-head]');
    menuTabs = menuHead.find('[data-menu-tab]');
    menuTabsBtns = menuTabs.find('> i');
    menuTabsContent = menuTabs.find('.tab-content');
	origTabContentZI = menuTabsContent.eq(0).css('z-index');

	$(window).on('resize.menu_head', function(){
		setupMenuEvents(checkIfMobile());
	}).resize();
};


module.exports = {
    init: init
}
