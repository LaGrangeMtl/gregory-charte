(function($) {

	$(document).ready(function(){

		var menuHead = $('[class^=menu-head]');
		var menuTabs = menuHead.find('[data-menu-tab]');

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









		menuTabs.on('click.menu_head', handleMenuTabs);
	});

})(jQuery)