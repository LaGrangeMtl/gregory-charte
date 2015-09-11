"use strict";


var ns = require('ns');
var $ = require('jquery');

/* MENUS */
var menuHead;
var menuTabs;
var menuTabsBtns;
var menuTabsContent;
var parentMenuItems;
var origTabContentZI;
var toggleMenuBtn;
var navSection;

var toggleMenu = function(e) {
	e.preventDefault();

	var pageWrap = $('.page-wrap');
	pageWrap.off('click.menu_head');
	pageWrap.toggleClass('opened');

	if(pageWrap.hasClass('opened')){
		pageWrap.on('click.menu_head', function(e){
			//e.stopPropagation();
			//e.preventDefault();
			//toggleMenu(e);
		});
	}
};

var toggleChildItem = function(item, callbacks){
	var callbacks = callbacks || {};
	var _item = $(item);

	if(_item.is(':visible')){
		navSection.removeClass('slide-out');
		setTimeout(function(){
			_item.hide();

			if(callbacks.onHide) { callbacks.onHide(); }
		}, 300);
	}
	else {
		_item.show();
		navSection.addClass('slide-out');

		if(callbacks.onShow) { callbacks.onShow(); }
	}
};

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

var handleMenuTabsMobile = function(e){
	e.preventDefault();
	var tab = $(e.currentTarget).parent();
	var tabContent = tab.find('.tab-content');

	toggleChildItem(tabContent, {
		onShow:function(){
			tabContent.find('.close-btn')
				.off('click.menu_head')
				.on('click.menu_head', function(e){
					e.preventDefault();
					toggleChildItem(tabContent);
				});
		}
	});
};

var setupMenuEvents = function(isMobile) {
	menuTabsBtns.off('click.menu_head');
	menuTabsBtns.on('click.menu_head', isMobile ? handleMenuTabsMobile : handleMenuTabs);

	toggleMenuBtn.off('click.menu_head');
	parentMenuItems.off('click.menu_head');

	if(isMobile) {
		parentMenuItems.on('click.menu_head', function(e){
			e.preventDefault();

			var childItems = $(this).parent().find('ul');
			toggleChildItem(childItems, {
				onShow:function(){
					childItems.find('.back-btn')
						.off('click.menu_head')
						.on('click.menu_head', function(e){
							e.preventDefault();
							toggleChildItem(childItems);
						});
				}
			});
		});
		toggleMenuBtn.on('click.menu_head', toggleMenu);
	}
};

var checkIfMobile = function(){
	return $(window).width() < 992;
};

var init = function(){
    menuHead = $('[class^=menu-head]');
	navSection = menuHead.find('.navigation-row');
    menuTabs = menuHead.find('[data-menu-tab]');
    menuTabsBtns = menuTabs.find('> i');
    menuTabsContent = menuTabs.find('.tab-content');
	parentMenuItems = menuHead.find('[class^=menu-item][class*=-parent] > a');
	origTabContentZI = menuTabsContent.eq(0).css('z-index');
	toggleMenuBtn = $('.menu-btn');

	$(window).on('resize.menu_head', function(){
		setupMenuEvents(checkIfMobile());
	}).resize();
};


module.exports = {
    init: init
}
