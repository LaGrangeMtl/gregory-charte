(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";


var ns = require('ns');
var $ = require('jquery');
var Menu = require('./Menu');
require('selectric');
var Slick = require('../vendor/slick');

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


	$('.slider').slick({
		dots:true,
		arrows:true
	});

	Menu.init();
});

},{"../vendor/slick":6,"./Menu":3,"jquery":"jquery","ns":4,"selectric":"selectric"}],2:[function(require,module,exports){

"use strict";
var ns = require('ns');
var validationEngine = require('validate');

module.exports = {
	getPost : function(form, capsule){
		var post = {};
		if(capsule !== undefined)
			post[capsule] = {};

		form.find(':input').not('[type=radio]').each(function() {
			var inp = $(this);
			var inpVal = inp.val();

			if (inp.attr('type') == 'checkbox') {
				if (inp.is(':checked')) {
					inpVal = inpVal;
				} else {
					inpVal = null;
				}
			}

			var n = inp.attr('name');
			if (n) {
				if(capsule !== undefined && !inp.hasClass('dontEncapsulate'))
					post[capsule][n] = inpVal;
				else
					post[n] = inpVal;
			}
		});

		form.find(':radio').filter(':checked').each(function() {
			var inp = $(this);
			var inpVal = inp.val();
			
			if(capsule !== undefined && !inp.hasClass('dontEncapsulate'))
				post[capsule][inp.attr('name')] = inpVal;
			else
				post[inp.attr('name')] = inpVal;
		});
		//console.dir(post);
		return post;
	},

	attachValidation: function(form){
		form.validationEngine('detach');
		form.validationEngine('attach', {binded:false, scroll: false});
		return form;
	},
	validate : function(form){
		//met les emails en minuscule
		$('[type="email"]', form).each(function(i, el){
			el = $(el);
			var val = el.val();
			el.val(val && val.toLowerCase());
		});
		return form.validationEngine('validate');
	}
}
},{"ns":4,"validate":5}],3:[function(require,module,exports){
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
	e.stopPropagation();

	var pageWrap = $('.page-wrap');
	pageWrap.off('click.menu_head');
	pageWrap.toggleClass('opened');

	if(pageWrap.hasClass('opened')){
		pageWrap
			.off('click.menu_head')
			.on('click.menu_head', function(e){
			toggleMenu(e);
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

},{"jquery":"jquery","ns":4}],4:[function(require,module,exports){
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
},{"./FormUtils.js":2,"jquery":"jquery","promise":"promise","validate":5}],5:[function(require,module,exports){


require('jquery.validationEngine');

var langRules = {};

require('jquery.validationEngine-fr');
langRules.fr = $.validationEngineLanguage.allRules;
require('jquery.validationEngine-en');
langRules.en = $.validationEngineLanguage.allRules;

//console.log(langRules);

module.exports = {
	setLanguage : function(lang) {
		$.validationEngineLanguage.allRules = langRules[lang];
	}
};
},{"jquery.validationEngine":7,"jquery.validationEngine-en":8,"jquery.validationEngine-fr":9}],6:[function(require,module,exports){
/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.5.8
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function() {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return '<button type="button" data-role="none" role="button" aria-required="false" tabindex="0">' + (i + 1) + '</button>';
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: false,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.hidden = 'hidden';
            _.paused = false;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, dataSettings, settings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);
            _.checkResponsive(true);

        }

        return Slick;

    }());

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function(markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function(index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function() {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function(targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.asNavFor = function(index) {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if ( asNavFor && asNavFor !== null ) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        if ( asNavFor !== null && typeof asNavFor === 'object' ) {
            asNavFor.each(function() {
                var target = $(this).slick('getSlick');
                if(!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function(slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

        if (_.slideCount > _.options.slidesToShow && _.paused !== true) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator,
                _.options.autoplaySpeed);
        }

    };

    Slick.prototype.autoPlayClear = function() {

        var _ = this;
        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function() {

        var _ = this;

        if (_.options.infinite === false) {

            if (_.direction === 1) {

                if ((_.currentSlide + 1) === _.slideCount -
                    1) {
                    _.direction = 0;
                }

                _.slideHandler(_.currentSlide + _.options.slidesToScroll);

            } else {

                if ((_.currentSlide - 1 === 0)) {

                    _.direction = 1;

                }

                _.slideHandler(_.currentSlide - _.options.slidesToScroll);

            }

        } else {

            _.slideHandler(_.currentSlide + _.options.slidesToScroll);

        }

    };

    Slick.prototype.buildArrows = function() {

        var _ = this;

        if (_.options.arrows === true ) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if( _.slideCount > _.options.slidesToShow ) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add( _.$nextArrow )

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function() {

        var _ = this,
            i, dotString;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            dotString = '<ul class="' + _.options.dotsClass + '">';

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dotString += '<li>' + _.options.customPaging.call(this, _, i) + '</li>';
            }

            dotString += '</ul>';

            _.$dots = $(dotString).appendTo(
                _.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.buildOut = function() {

        var _ = this;

        _.$slides =
            _.$slider
                .children( _.options.slide + ':not(.slick-cloned)')
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function(index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slidesCache = _.$slides;

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div aria-live="polite" class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function() {

        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides,slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if(_.options.rows > 1) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for(a = 0; a < numOfSlides; a++){
                var slide = document.createElement('div');
                for(b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for(c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.html(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width':(100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function(initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if ( _.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                    targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if( !initial && triggerBreakpoint !== false ) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function(event, dontAnimate) {

        var _ = this,
            $target = $(event.target),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if(!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function(index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function() {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots).off('click.slick', _.changeSlide);

            if (_.options.pauseOnDotsHover === true && _.options.autoplay === true) {

                $('li', _.$dots)
                    .off('mouseenter.slick', $.proxy(_.setPaused, _, true))
                    .off('mouseleave.slick', $.proxy(_.setPaused, _, false));

            }

        }

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.$list.off('mouseenter.slick', $.proxy(_.setPaused, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.setPaused, _, false));

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);
    };

    Slick.prototype.cleanUpRows = function() {

        var _ = this, originalSlides;

        if(_.options.rows > 1) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.html(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function(event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function(refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }


        if ( _.$prevArrow && _.$prevArrow.length ) {

            _.$prevArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css("display","");

            if ( _.htmlExpr.test( _.options.prevArrow )) {
                _.$prevArrow.remove();
            }
        }

        if ( _.$nextArrow && _.$nextArrow.length ) {

            _.$nextArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css("display","");

            if ( _.htmlExpr.test( _.options.nextArrow )) {
                _.$nextArrow.remove();
            }

        }


        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function(){
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');

        _.unslicked = true;

        if(!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function(slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function(slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function() {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function(slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function(filter) {

        var _ = this;

        if (filter !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function() {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function() {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToShow;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToShow;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function(slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function(option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function() {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function() {

        return this;

    };

    Slick.prototype.getSlideCount = function() {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function(index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function(slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function(creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

    };

    Slick.prototype.initArrowEvents = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.on('click.slick', {
                message: 'previous'
            }, _.changeSlide);
            _.$nextArrow.on('click.slick', {
                message: 'next'
            }, _.changeSlide);
        }

    };

    Slick.prototype.initDotEvents = function() {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.setPaused, _, true))
                .on('mouseleave.slick', $.proxy(_.setPaused, _, false));
        }

    };

    Slick.prototype.initializeEvents = function() {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        _.$list.on('mouseenter.slick', $.proxy(_.setPaused, _, true));
        _.$list.on('mouseleave.slick', $.proxy(_.setPaused, _, false));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.initUI = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

        if (_.options.autoplay === true) {

            _.autoPlay();

        }

    };

    Slick.prototype.keyHandler = function(event) {

        var _ = this;
         //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if(!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: 'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function() {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {
            $('img[data-lazy]', imagesScope).each(function() {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function() {
                    image
                        .animate({ opacity: 0 }, 100, function() {
                            image
                                .attr('src', imageSource)
                                .animate({ opacity: 1 }, 200, function() {
                                    image
                                        .removeAttr('data-lazy')
                                        .removeClass('slick-loading');
                                });
                        });
                };

                imageToLoad.src = imageSource;

            });
        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = rangeStart + _.options.slidesToShow;
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function() {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function() {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function() {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function() {

        var _ = this;

        _.paused = false;
        _.autoPlay();

    };

    Slick.prototype.postSlide = function(index) {

        var _ = this;

        _.$slider.trigger('afterChange', [_, index]);

        _.animating = false;

        _.setPosition();

        _.swipeLeft = null;

        if (_.options.autoplay === true && _.paused === false) {
            _.autoPlay();
        }
        if (_.options.accessibility === true) {
            _.initADA();
        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function(event) {
        event.preventDefault();
    };

    Slick.prototype.progressiveLazyLoad = function() {

        var _ = this,
            imgCount, targetImage;

        imgCount = $('img[data-lazy]', _.$slider).length;

        if (imgCount > 0) {
            targetImage = $('img[data-lazy]', _.$slider).first();
            targetImage.attr('src', null);
            targetImage.attr('src', targetImage.attr('data-lazy')).removeClass('slick-loading').load(function() {
                    targetImage.removeAttr('data-lazy');
                    _.progressiveLazyLoad();

                    if (_.options.adaptiveHeight === true) {
                        _.setPosition();
                    }
                })
                .error(function() {
                    targetImage.removeAttr('data-lazy');
                    _.progressiveLazyLoad();
                });
        }

    };

    Slick.prototype.refresh = function( initializing ) {

        var _ = this, currentSlide, firstVisible;

        firstVisible = _.slideCount - _.options.slidesToShow;

        // check that the new breakpoint can actually accept the
        // "current slide" as the current slide, otherwise we need
        // to set it to the closest possible value.
        if ( !_.options.infinite ) {
            if ( _.slideCount <= _.options.slidesToShow ) {
                _.currentSlide = 0;
            } else if ( _.currentSlide > firstVisible ) {
                _.currentSlide = firstVisible;
            }
        }

         currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if( !initializing ) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function() {

        var _ = this, breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ( $.type(responsiveSettings) === "array" && responsiveSettings.length ) {

            _.respondTo = _.options.respondTo || 'window';

            for ( breakpoint in responsiveSettings ) {

                l = _.breakpoints.length-1;
                currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while( l >= 0 ) {
                        if( _.breakpoints[l] && _.breakpoints[l] === currentBreakpoint ) {
                            _.breakpoints.splice(l,1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function(a, b) {
                return ( _.options.mobileFirst ) ? a-b : b-a;
            });

        }

    };

    Slick.prototype.reinit = function() {

        var _ = this;

        _.$slides =
            _.$slideTrack
                .children(_.options.slide)
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(0);

        _.setPosition();

        _.$slider.trigger('reInit', [_]);

        if (_.options.autoplay === true) {
            _.focusHandler();
        }

    };

    Slick.prototype.resize = function() {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function() {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if( !_.unslicked ) { _.setPosition(); }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function(index, removeBefore, removeAll) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function(position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function() {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function() {

        var _ = this,
            targetLeft;

        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function() {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption = Slick.prototype.slickSetOption = function(option, value, refresh) {

        var _ = this, l, item;

        if( option === "responsive" && $.type(value) === "array" ) {
            for ( item in value ) {
                if( $.type( _.options.responsive ) !== "array" ) {
                    _.options.responsive = [ value[item] ];
                } else {
                    l = _.options.responsive.length-1;
                    // loop through the responsive object and splice out duplicates.
                    while( l >= 0 ) {
                        if( _.options.responsive[l].breakpoint === value[item].breakpoint ) {
                            _.options.responsive.splice(l,1);
                        }
                        l--;
                    }
                    _.options.responsive.push( value[item] );
                }
            }
        } else {
            _.options[option] = value;
        }

        if (refresh === true) {
            _.unload();
            _.reinit();
        }

    };

    Slick.prototype.setPosition = function() {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function() {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if ( _.options.fade ) {
            if ( typeof _.options.zIndex === 'number' ) {
                if( _.options.zIndex < 3 ) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };


    Slick.prototype.setSlideClasses = function(index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {

                    _.$slides
                        .slice(index - centerOffset, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }

    };

    Slick.prototype.setupInfinite = function() {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                        infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.setPaused = function(paused) {

        var _ = this;

        if (_.options.autoplay === true && _.options.pauseOnHover === true) {
            _.paused = paused;
            if (!paused) {
                _.autoPlay();
            } else {
                _.autoPlayClear();
            }
        }
    };

    Slick.prototype.selectHandler = function(event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
                $(event.target) :
                $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.setSlideClasses(index);
            _.asNavFor(index);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function(index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if (_.options.autoplay === true) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function() {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true) {
            _.animateSlide(targetLeft, function() {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'left';
            } else {
                return 'right';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function(event) {

        var _ = this,
            slideCount;

        _.dragging = false;

        _.shouldClick = (_.touchObject.swipeLength > 10) ? false : true;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger('edge', [_, _.swipeDirection()]);
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

            switch (_.swipeDirection()) {
                case 'left':
                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();
                    _.slideHandler(slideCount);
                    _.currentDirection = 0;
                    _.touchObject = {};
                    _.$slider.trigger('swipe', [_, 'left']);
                    break;

                case 'right':
                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();
                    _.slideHandler(slideCount);
                    _.currentDirection = 1;
                    _.touchObject = {};
                    _.$slider.trigger('swipe', [_, 'right']);
                    break;
            }
        } else {
            if (_.touchObject.startX !== _.touchObject.curX) {
                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }

    };

    Slick.prototype.swipeHandler = function(event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function(event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = Math.round(Math.sqrt(
                Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
        }

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function(event) {

        var _ = this,
            touches;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function() {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function() {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function(fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function() {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if ( _.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite ) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function() {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                .removeClass('slick-active')
                .attr('aria-hidden', 'true');

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active')
                .attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.visibility = function() {

        var _ = this;

        if (document[_.hidden]) {
            _.paused = true;
            _.autoPlayClear();
        } else {
            if (_.options.autoplay === true) {
                _.paused = false;
                _.autoPlay();
            }
        }

    };
    Slick.prototype.initADA = function() {
        var _ = this;
        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        _.$slideTrack.attr('role', 'listbox');

        _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function(i) {
            $(this).attr({
                'role': 'option',
                'aria-describedby': 'slick-slide' + _.instanceUid + i + ''
            });
        });

        if (_.$dots !== null) {
            _.$dots.attr('role', 'tablist').find('li').each(function(i) {
                $(this).attr({
                    'role': 'presentation',
                    'aria-selected': 'false',
                    'aria-controls': 'navigation' + _.instanceUid + i + '',
                    'id': 'slick-slide' + _.instanceUid + i + ''
                });
            })
                .first().attr('aria-selected', 'true').end()
                .find('button').attr('role', 'button').end()
                .closest('div').attr('role', 'toolbar');
        }
        _.activateADA();

    };

    Slick.prototype.activateADA = function() {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

    };

    Slick.prototype.focusHandler = function() {
        var _ = this;
        _.$slider.on('focus.slick blur.slick', '*', function(event) {
            event.stopImmediatePropagation();
            var sf = $(this);
            setTimeout(function() {
                if (_.isPlay) {
                    if (sf.is(':focus')) {
                        _.autoPlayClear();
                        _.paused = true;
                    } else {
                        _.paused = false;
                        _.autoPlay();
                    }
                }
            }, 0);
        });
    };

    $.fn.slick = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));

},{"jquery":"jquery"}],7:[function(require,module,exports){
/*
 * Inline Form Validation Engine 2.6.2, jQuery plugin
 *
 * Copyright(c) 2010, Cedric Dugas
 * http://www.position-absolute.com
 *
 * 2.0 Rewrite by Olivier Refalo
 * http://www.crionics.com
 *
 * Form validation engine allowing custom regex rules to be added.
 * Licensed under the MIT License
 */
 (function($) {

	"use strict";

	var methods = {

		/**
		* Kind of the constructor, called before any action
		* @param {Map} user options
		*/
		init: function(options) {
			var form = this;
			if (!form.data('jqv') || form.data('jqv') == null ) {
				options = methods._saveOptions(form, options);
				// bind all formError elements to close on click
				$(document).on("click", ".formError", function() {
					$(this).fadeOut(150, function() {
						// remove prompt once invisible
						$(this).parent('.formErrorOuter').remove();
						$(this).remove();
					});
				});
			}
			return this;
		 },
		/**
		* Attachs jQuery.validationEngine to form.submit and field.blur events
		* Takes an optional params: a list of options
		* ie. jQuery("#formID1").validationEngine('attach', {promptPosition : "centerRight"});
		*/
		attach: function(userOptions) {

			var form = this;
			var options;

			if(userOptions)
				options = methods._saveOptions(form, userOptions);
			else
				options = form.data('jqv');

			options.validateAttribute = (form.find("[data-validation-engine*=validate]").length) ? "data-validation-engine" : "class";
			if (options.binded) {

				// delegate fields
				form.on(options.validationEventTrigger, "["+options.validateAttribute+"*=validate]:not([type=checkbox]):not([type=radio]):not(.datepicker)", methods._onFieldEvent);
				form.on("click", "["+options.validateAttribute+"*=validate][type=checkbox],["+options.validateAttribute+"*=validate][type=radio]", methods._onFieldEvent);
				form.on(options.validationEventTrigger,"["+options.validateAttribute+"*=validate][class*=datepicker]", {"delay": 300}, methods._onFieldEvent);
			}
			if (options.autoPositionUpdate) {
				$(window).bind("resize", {
					"noAnimation": true,
					"formElem": form
				}, methods.updatePromptsPosition);
			}
			form.on("click","a[data-validation-engine-skip], a[class*='validate-skip'], button[data-validation-engine-skip], button[class*='validate-skip'], input[data-validation-engine-skip], input[class*='validate-skip']", methods._submitButtonClick);
			form.removeData('jqv_submitButton');

			// bind form.submit
			form.on("submit", methods._onSubmitEvent);
			return this;
		},
		/**
		* Unregisters any bindings that may point to jQuery.validaitonEngine
		*/
		detach: function() {

			var form = this;
			var options = form.data('jqv');

			// unbind fields
			form.find("["+options.validateAttribute+"*=validate]").not("[type=checkbox]").off(options.validationEventTrigger, methods._onFieldEvent);
			form.find("["+options.validateAttribute+"*=validate][type=checkbox],[class*=validate][type=radio]").off("click", methods._onFieldEvent);

			// unbind form.submit
			form.off("submit", methods.onAjaxFormComplete);

			// unbind form.submit
			form.off("submit", methods.onAjaxFormComplete);
			form.removeData('jqv');
            
			form.off("click", "a[data-validation-engine-skip], a[class*='validate-skip'], button[data-validation-engine-skip], button[class*='validate-skip'], input[data-validation-engine-skip], input[class*='validate-skip']", methods._submitButtonClick);
			form.removeData('jqv_submitButton');

			if (options.autoPositionUpdate)
				$(window).unbind("resize", methods.updatePromptsPosition);

			return this;
		},
		/**
		* Validates either a form or a list of fields, shows prompts accordingly.
		* Note: There is no ajax form validation with this method, only field ajax validation are evaluated
		*
		* @return true if the form validates, false if it fails
		*/
		validate: function() {
			var element = $(this);
			var valid = null;

			if (element.is("form") || element.hasClass("validationEngineContainer")) {
				if (element.hasClass('validating')) {
					// form is already validating.
					// Should abort old validation and start new one. I don't know how to implement it.
					return false;
				} else {				
					element.addClass('validating');
					var options = element.data('jqv');
					var valid = methods._validateFields(this);

					// If the form doesn't validate, clear the 'validating' class before the user has a chance to submit again
					setTimeout(function(){
						element.removeClass('validating');
					}, 100);
					if (valid && options.onSuccess) {
						options.onSuccess();
					} else if (!valid && options.onFailure) {
						options.onFailure();
					}
				}
			} else if (element.is('form') || element.hasClass('validationEngineContainer')) {
				element.removeClass('validating');
			} else {
				// field validation
				var form = element.closest('form, .validationEngineContainer'),
					options = (form.data('jqv')) ? form.data('jqv') : $.validationEngine.defaults,
					valid = methods._validateField(element, options);

				if (valid && options.onFieldSuccess)
					options.onFieldSuccess();
				else if (options.onFieldFailure && options.InvalidFields.length > 0) {
					options.onFieldFailure();
				}
			}
			if(options.onValidationComplete) {
				// !! ensures that an undefined return is interpreted as return false but allows a onValidationComplete() to possibly return true and have form continue processing
				return !!options.onValidationComplete(form, valid);
			}
			return valid;
		},
		/**
		*  Redraw prompts position, useful when you change the DOM state when validating
		*/
		updatePromptsPosition: function(event) {

			if (event && this == window) {
				var form = event.data.formElem;
				var noAnimation = event.data.noAnimation;
			}
			else
				var form = $(this.closest('form, .validationEngineContainer'));

			var options = form.data('jqv');
			// No option, take default one
			form.find('['+options.validateAttribute+'*=validate]').not(":disabled").each(function(){
				var field = $(this);
				if (options.prettySelect && field.is(":hidden"))
				  field = form.find("#" + options.usePrefix + field.attr('id') + options.useSuffix);
				var prompt = methods._getPrompt(field);
				var promptText = $(prompt).find(".formErrorContent").html();

				if(prompt)
					methods._updatePrompt(field, $(prompt), promptText, undefined, false, options, noAnimation);
			});
			return this;
		},
		/**
		* Displays a prompt on a element.
		* Note that the element needs an id!
		*
		* @param {String} promptText html text to display type
		* @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
		* @param {String} possible values topLeft, topRight, bottomLeft, centerRight, bottomRight
		*/
		showPrompt: function(promptText, type, promptPosition, showArrow) {
			var form = this.closest('form, .validationEngineContainer');
			var options = form.data('jqv');
			// No option, take default one
			if(!options)
				options = methods._saveOptions(this, options);
			if(promptPosition)
				options.promptPosition=promptPosition;
			options.showArrow = showArrow==true;

			methods._showPrompt(this, promptText, type, false, options);
			return this;
		},
		/**
		* Closes form error prompts, CAN be invidual
		*/
		hide: function() {
			 var form = $(this).closest('form, .validationEngineContainer');
			 var options = form.data('jqv');
			 var fadeDuration = (options && options.fadeDuration) ? options.fadeDuration : 0.3;
			 var closingtag;
			 
			 if($(this).is("form") || $(this).hasClass("validationEngineContainer")) {
				 closingtag = "parentForm"+methods._getClassName($(this).attr("id"));
			 } else {
				 closingtag = methods._getClassName($(this).attr("id")) +"formError";
			 }
			 $('.'+closingtag).fadeTo(fadeDuration, 0.3, function() {
				 $(this).parent('.formErrorOuter').remove();
				 $(this).remove();
			 });
			 return this;
		 },
		 /**
		 * Closes all error prompts on the page
		 */
		 hideAll: function() {

			 var form = this;
			 var options = form.data('jqv');
			 var duration = options ? options.fadeDuration:300;
			 $('.formError').fadeTo(duration, 300, function() {
				 $(this).parent('.formErrorOuter').remove();
				 $(this).remove();
			 });
			 return this;
		 },
		/**
		* Typically called when user exists a field using tab or a mouse click, triggers a field
		* validation
		*/
		_onFieldEvent: function(event) {
			var field = $(this);
			var form = field.closest('form, .validationEngineContainer');
			var options = form.data('jqv');
			options.eventTrigger = "field";
			// validate the current field
			window.setTimeout(function() {
				methods._validateField(field, options);
				if (options.InvalidFields.length == 0 && options.onFieldSuccess) {
					options.onFieldSuccess();
				} else if (options.InvalidFields.length > 0 && options.onFieldFailure) {
					options.onFieldFailure();
				}
			}, (event.data) ? event.data.delay : 0);

		},
		/**
		* Called when the form is submited, shows prompts accordingly
		*
		* @param {jqObject}
		*            form
		* @return false if form submission needs to be cancelled
		*/
		_onSubmitEvent: function() {
			var form = $(this);
			var options = form.data('jqv');
			
			//check if it is trigger from skipped button
			if (form.data("jqv_submitButton")){
				var submitButton = $("#" + form.data("jqv_submitButton"));
				if (submitButton){
					if (submitButton.length > 0){
						if (submitButton.hasClass("validate-skip") || submitButton.attr("data-validation-engine-skip") == "true")
							return true;
					}
				}
			}

			options.eventTrigger = "submit";

			// validate each field 
			// (- skip field ajax validation, not necessary IF we will perform an ajax form validation)
			var r=methods._validateFields(form);

			if (r && options.ajaxFormValidation) {
				methods._validateFormWithAjax(form, options);
				// cancel form auto-submission - process with async call onAjaxFormComplete
				return false;
			}

			if(options.onValidationComplete) {
				// !! ensures that an undefined return is interpreted as return false but allows a onValidationComplete() to possibly return true and have form continue processing
				return !!options.onValidationComplete(form, r);
			}
			return r;
		},
		/**
		* Return true if the ajax field validations passed so far
		* @param {Object} options
		* @return true, is all ajax validation passed so far (remember ajax is async)
		*/
		_checkAjaxStatus: function(options) {
			var status = true;
			$.each(options.ajaxValidCache, function(key, value) {
				if (!value) {
					status = false;
					// break the each
					return false;
				}
			});
			return status;
		},
		
		/**
		* Return true if the ajax field is validated
		* @param {String} fieldid
		* @param {Object} options
		* @return true, if validation passed, false if false or doesn't exist
		*/
		_checkAjaxFieldStatus: function(fieldid, options) {
			return options.ajaxValidCache[fieldid] == true;
		},
		/**
		* Validates form fields, shows prompts accordingly
		*
		* @param {jqObject}
		*            form
		* @param {skipAjaxFieldValidation}
		*            boolean - when set to true, ajax field validation is skipped, typically used when the submit button is clicked
		*
		* @return true if form is valid, false if not, undefined if ajax form validation is done
		*/
		_validateFields: function(form) {
			var options = form.data('jqv');

			// this variable is set to true if an error is found
			var errorFound = false;

			// Trigger hook, start validation
			form.trigger("jqv.form.validating");
			// first, evaluate status of non ajax fields
			var first_err=null;
			form.find('['+options.validateAttribute+'*=validate]').not(":disabled").each( function() {
				var field = $(this);
				var names = [];
				if ($.inArray(field.attr('name'), names) < 0) {
					errorFound |= methods._validateField(field, options);
					if (errorFound && first_err==null)
						if (field.is(":hidden") && options.prettySelect)
										 first_err = field = form.find("#" + options.usePrefix + methods._jqSelector(field.attr('id')) + options.useSuffix);
									else
										 first_err=field;
					if (options.doNotShowAllErrosOnSubmit)
						return false;
					names.push(field.attr('name'));

					//if option set, stop checking validation rules after one error is found
					if(options.showOneMessage == true && errorFound){
						return false;
					}
				}
			});

			// second, check to see if all ajax calls completed ok
			// errorFound |= !methods._checkAjaxStatus(options);

			// third, check status and scroll the container accordingly
			form.trigger("jqv.form.result", [errorFound]);

			if (errorFound) {
				if (options.scroll) {
					var destination=first_err.offset().top;
					var fixleft = first_err.offset().left;

					//prompt positioning adjustment support. Usage: positionType:Xshift,Yshift (for ex.: bottomLeft:+20 or bottomLeft:-20,+10)
					var positionType=options.promptPosition;
					if (typeof(positionType)=='string' && positionType.indexOf(":")!=-1)
						positionType=positionType.substring(0,positionType.indexOf(":"));

					if (positionType!="bottomRight" && positionType!="bottomLeft") {
						var prompt_err= methods._getPrompt(first_err);
						if (prompt_err) {
							destination=prompt_err.offset().top;
						}
					}
					
					// Offset the amount the page scrolls by an amount in px to accomodate fixed elements at top of page
					if (options.scrollOffset) {
						destination -= options.scrollOffset;
					}

					// get the position of the first error, there should be at least one, no need to check this
					//var destination = form.find(".formError:not('.greenPopup'):first").offset().top;
					if (options.isOverflown) {
						var overflowDIV = $(options.overflownDIV);
						if(!overflowDIV.length) return false;
						var scrollContainerScroll = overflowDIV.scrollTop();
						var scrollContainerPos = -parseInt(overflowDIV.offset().top);

						destination += scrollContainerScroll + scrollContainerPos - 5;
						var scrollContainer = $(options.overflownDIV + ":not(:animated)");

						scrollContainer.animate({ scrollTop: destination }, 1100, function(){
							if(options.focusFirstField) first_err.focus();
						});

					} else {
						$("html, body").animate({
							scrollTop: destination
						}, 1100, function(){
							if(options.focusFirstField) first_err.focus();
						});
						$("html, body").animate({scrollLeft: fixleft},1100)
					}

				} else if(options.focusFirstField)
					first_err.focus();
				return false;
			}
			return true;
		},
		/**
		* This method is called to perform an ajax form validation.
		* During this process all the (field, value) pairs are sent to the server which returns a list of invalid fields or true
		*
		* @param {jqObject} form
		* @param {Map} options
		*/
		_validateFormWithAjax: function(form, options) {

			var data = form.serialize();
									var type = (options.ajaxFormValidationMethod) ? options.ajaxFormValidationMethod : "GET";
			var url = (options.ajaxFormValidationURL) ? options.ajaxFormValidationURL : form.attr("action");
									var dataType = (options.dataType) ? options.dataType : "json";
			$.ajax({
				type: type,
				url: url,
				cache: false,
				dataType: dataType,
				data: data,
				form: form,
				methods: methods,
				options: options,
				beforeSend: function() {
					return options.onBeforeAjaxFormValidation(form, options);
				},
				error: function(data, transport) {
					methods._ajaxError(data, transport);
				},
				success: function(json) {
					if ((dataType == "json") && (json !== true)) {
						// getting to this case doesn't necessary means that the form is invalid
						// the server may return green or closing prompt actions
						// this flag helps figuring it out
						var errorInForm=false;
						for (var i = 0; i < json.length; i++) {
							var value = json[i];

							var errorFieldId = value[0];
							var errorField = $($("#" + errorFieldId)[0]);

							// make sure we found the element
							if (errorField.length == 1) {

								// promptText or selector
								var msg = value[2];
								// if the field is valid
								if (value[1] == true) {

									if (msg == ""  || !msg){
										// if for some reason, status==true and error="", just close the prompt
										methods._closePrompt(errorField);
									} else {
										// the field is valid, but we are displaying a green prompt
										if (options.allrules[msg]) {
											var txt = options.allrules[msg].alertTextOk;
											if (txt)
												msg = txt;
										}
										if (options.showPrompts) methods._showPrompt(errorField, msg, "pass", false, options, true);
									}
								} else {
									// the field is invalid, show the red error prompt
									errorInForm|=true;
									if (options.allrules[msg]) {
										var txt = options.allrules[msg].alertText;
										if (txt)
											msg = txt;
									}
									if(options.showPrompts) methods._showPrompt(errorField, msg, "", false, options, true);
								}
							}
						}
						options.onAjaxFormComplete(!errorInForm, form, json, options);
					} else
						options.onAjaxFormComplete(true, form, json, options);

				}
			});

		},
		/**
		* Validates field, shows prompts accordingly
		*
		* @param {jqObject}
		*            field
		* @param {Array[String]}
		*            field's validation rules
		* @param {Map}
		*            user options
		* @return false if field is valid (It is inversed for *fields*, it return false on validate and true on errors.)
		*/
		_validateField: function(field, options, skipAjaxValidation) {
			if (!field.attr("id")) {
				field.attr("id", "form-validation-field-" + $.validationEngine.fieldIdCounter);
				++$.validationEngine.fieldIdCounter;
			}

           if (!options.validateNonVisibleFields && (field.is(":hidden") && !options.prettySelect || field.parent().is(":hidden")))
				return false;

			var rulesParsing = field.attr(options.validateAttribute);
			var getRules = /validate\[(.*)\]/.exec(rulesParsing);

			if (!getRules)
				return false;
			var str = getRules[1];
			var rules = str.split(/\[|,|\]/);

			// true if we ran the ajax validation, tells the logic to stop messing with prompts
			var isAjaxValidator = false;
			var fieldName = field.attr("name");
			var promptText = "";
			var promptType = "";
			var required = false;
			var limitErrors = false;
			options.isError = false;
			options.showArrow = true;
			
			// If the programmer wants to limit the amount of error messages per field,
			if (options.maxErrorsPerField > 0) {
				limitErrors = true;
			}

			var form = $(field.closest("form, .validationEngineContainer"));
			// Fix for adding spaces in the rules
			for (var i = 0; i < rules.length; i++) {
				rules[i] = rules[i].replace(" ", "");
				// Remove any parsing errors
				if (rules[i] === '') {
					delete rules[i];
				}
			}

			for (var i = 0, field_errors = 0; i < rules.length; i++) {
				
				// If we are limiting errors, and have hit the max, break
				if (limitErrors && field_errors >= options.maxErrorsPerField) {
					// If we haven't hit a required yet, check to see if there is one in the validation rules for this
					// field and that it's index is greater or equal to our current index
					if (!required) {
						var have_required = $.inArray('required', rules);
						required = (have_required != -1 &&  have_required >= i);
					}
					break;
				}
				
				
				var errorMsg = undefined;
				switch (rules[i]) {

					case "required":
						required = true;
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._required);
						break;
					case "custom":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._custom);
						break;
					case "groupRequired":
						// Check is its the first of group, if not, reload validation with first field
						// AND continue normal validation on present field
						var classGroup = "["+options.validateAttribute+"*=" +rules[i + 1] +"]";
						var firstOfGroup = form.find(classGroup).eq(0);
						if(firstOfGroup[0] != field[0]){

							methods._validateField(firstOfGroup, options, skipAjaxValidation); 
							options.showArrow = true;

						}
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._groupRequired);
						if(errorMsg)  required = true;
						options.showArrow = false;
						break;
					case "ajax":
						// AJAX defaults to returning it's loading message
						errorMsg = methods._ajax(field, rules, i, options);
						if (errorMsg) {
							promptType = "load";
						}
						break;
					case "minSize":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._minSize);
						break;
					case "maxSize":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._maxSize);
						break;
					case "min":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._min);
						break;
					case "max":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._max);
						break;
					case "past":
						errorMsg = methods._getErrorMessage(form, field,rules[i], rules, i, options, methods._past);
						break;
					case "future":
						errorMsg = methods._getErrorMessage(form, field,rules[i], rules, i, options, methods._future);
						break;
					case "dateRange":
						var classGroup = "["+options.validateAttribute+"*=" + rules[i + 1] + "]";
						options.firstOfGroup = form.find(classGroup).eq(0);
						options.secondOfGroup = form.find(classGroup).eq(1);

						//if one entry out of the pair has value then proceed to run through validation
						if (options.firstOfGroup[0].value || options.secondOfGroup[0].value) {
							errorMsg = methods._getErrorMessage(form, field,rules[i], rules, i, options, methods._dateRange);
						}
						if (errorMsg) required = true;
						options.showArrow = false;
						break;

					case "dateTimeRange":
						var classGroup = "["+options.validateAttribute+"*=" + rules[i + 1] + "]";
						options.firstOfGroup = form.find(classGroup).eq(0);
						options.secondOfGroup = form.find(classGroup).eq(1);

						//if one entry out of the pair has value then proceed to run through validation
						if (options.firstOfGroup[0].value || options.secondOfGroup[0].value) {
							errorMsg = methods._getErrorMessage(form, field,rules[i], rules, i, options, methods._dateTimeRange);
						}
						if (errorMsg) required = true;
						options.showArrow = false;
						break;
					case "maxCheckbox":
						field = $(form.find("input[name='" + fieldName + "']"));
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._maxCheckbox);
						break;
					case "minCheckbox":
						field = $(form.find("input[name='" + fieldName + "']"));
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._minCheckbox);
						break;
					case "equals":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._equals);
						break;
					case "funcCall":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._funcCall);
						break;
					case "creditCard":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._creditCard);
						break;
					case "condRequired":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._condRequired);
						if (errorMsg !== undefined) {
							required = true;
						}
						break;

					default:
				}
				
				var end_validation = false;
				
				// If we were passed back an message object, check what the status was to determine what to do
				if (typeof errorMsg == "object") {
					switch (errorMsg.status) {
						case "_break":
							end_validation = true;
							break;
						// If we have an error message, set errorMsg to the error message
						case "_error":
							errorMsg = errorMsg.message;
							break;
						// If we want to throw an error, but not show a prompt, return early with true
						case "_error_no_prompt":
							return true;
							break;
						// Anything else we continue on
						default:
							break;
					}
				}
				
				// If it has been specified that validation should end now, break
				if (end_validation) {
					break;
				}
				
				// If we have a string, that means that we have an error, so add it to the error message.
				if (typeof errorMsg == 'string') {
					promptText += errorMsg + "<br/>";
					options.isError = true;
					field_errors++;
				}	
			}
			// If the rules required is not added, an empty field is not validated
			if(!required && !(field.val()) && field.val().length < 1) options.isError = false;

			// Hack for radio/checkbox group button, the validation go into the
			// first radio/checkbox of the group
			var fieldType = field.prop("type");
			var positionType=field.data("promptPosition") || options.promptPosition;

			if ((fieldType == "radio" || fieldType == "checkbox") && form.find("input[name='" + fieldName + "']").size() > 1) {
				if(positionType === 'inline') {
					field = $(form.find("input[name='" + fieldName + "'][type!=hidden]:last"));
				} else {
				field = $(form.find("input[name='" + fieldName + "'][type!=hidden]:first"));
				}
				options.showArrow = false;
			}

			if(field.is(":hidden") && options.prettySelect) {
				field = form.find("#" + options.usePrefix + methods._jqSelector(field.attr('id')) + options.useSuffix);
			}

			if (options.isError && options.showPrompts){
				methods._showPrompt(field, promptText, promptType, false, options);
			}else{
				if (!isAjaxValidator) methods._closePrompt(field);
			}

			if (!isAjaxValidator) {
				field.trigger("jqv.field.result", [field, options.isError, promptText]);
			}

			/* Record error */
			var errindex = $.inArray(field[0], options.InvalidFields);
			if (errindex == -1) {
				if (options.isError)
				options.InvalidFields.push(field[0]);
			} else if (!options.isError) {
				options.InvalidFields.splice(errindex, 1);
			}
				
			methods._handleStatusCssClasses(field, options);
	
			/* run callback function for each field */
			if (options.isError && options.onFieldFailure)
				options.onFieldFailure(field);

			if (!options.isError && options.onFieldSuccess)
				options.onFieldSuccess(field);

			return options.isError;
		},
		/**
		* Handling css classes of fields indicating result of validation 
		*
		* @param {jqObject}
		*            field
		* @param {Array[String]}
		*            field's validation rules            
		* @private
		*/
		_handleStatusCssClasses: function(field, options) {
			/* remove all classes */
			if(options.addSuccessCssClassToField)
				field.removeClass(options.addSuccessCssClassToField);
			
			if(options.addFailureCssClassToField)
				field.removeClass(options.addFailureCssClassToField);
			
			/* Add classes */
			if (options.addSuccessCssClassToField && !options.isError)
				field.addClass(options.addSuccessCssClassToField);
			
			if (options.addFailureCssClassToField && options.isError)
				field.addClass(options.addFailureCssClassToField);		
		},
		
		 /********************
		  * _getErrorMessage
		  *
		  * @param form
		  * @param field
		  * @param rule
		  * @param rules
		  * @param i
		  * @param options
		  * @param originalValidationMethod
		  * @return {*}
		  * @private
		  */
		 _getErrorMessage:function (form, field, rule, rules, i, options, originalValidationMethod) {
			 // If we are using the custon validation type, build the index for the rule.
			 // Otherwise if we are doing a function call, make the call and return the object
			 // that is passed back.
	 		 var rule_index = jQuery.inArray(rule, rules);
			 if (rule === "custom" || rule === "funcCall") {
				 var custom_validation_type = rules[rule_index + 1];
				 rule = rule + "[" + custom_validation_type + "]";
				 // Delete the rule from the rules array so that it doesn't try to call the
			    // same rule over again
			    delete(rules[rule_index]);
			 }
			 // Change the rule to the composite rule, if it was different from the original
			 var alteredRule = rule;


			 var element_classes = (field.attr("data-validation-engine")) ? field.attr("data-validation-engine") : field.attr("class");
			 var element_classes_array = element_classes.split(" ");

			 // Call the original validation method. If we are dealing with dates or checkboxes, also pass the form
			 var errorMsg;
			 if (rule == "future" || rule == "past"  || rule == "maxCheckbox" || rule == "minCheckbox") {
				 errorMsg = originalValidationMethod(form, field, rules, i, options);
			 } else {
				 errorMsg = originalValidationMethod(field, rules, i, options);
			 }

			 // If the original validation method returned an error and we have a custom error message,
			 // return the custom message instead. Otherwise return the original error message.
			 if (errorMsg != undefined) {
				 var custom_message = methods._getCustomErrorMessage($(field), element_classes_array, alteredRule, options);
				 if (custom_message) errorMsg = custom_message;
			 }
			 return errorMsg;

		 },
		 _getCustomErrorMessage:function (field, classes, rule, options) {
			var custom_message = false;
			var validityProp = /^custom\[.*\]$/.test(rule) ? methods._validityProp["custom"] : methods._validityProp[rule];
			 // If there is a validityProp for this rule, check to see if the field has an attribute for it
			if (validityProp != undefined) {
				custom_message = field.attr("data-errormessage-"+validityProp);
				// If there was an error message for it, return the message
				if (custom_message != undefined) 
					return custom_message;
			}
			custom_message = field.attr("data-errormessage");
			 // If there is an inline custom error message, return it
			if (custom_message != undefined) 
				return custom_message;
			var id = '#' + field.attr("id");
			// If we have custom messages for the element's id, get the message for the rule from the id.
			// Otherwise, if we have custom messages for the element's classes, use the first class message we find instead.
			if (typeof options.custom_error_messages[id] != "undefined" &&
				typeof options.custom_error_messages[id][rule] != "undefined" ) {
						  custom_message = options.custom_error_messages[id][rule]['message'];
			} else if (classes.length > 0) {
				for (var i = 0; i < classes.length && classes.length > 0; i++) {
					 var element_class = "." + classes[i];
					if (typeof options.custom_error_messages[element_class] != "undefined" &&
						typeof options.custom_error_messages[element_class][rule] != "undefined") {
							custom_message = options.custom_error_messages[element_class][rule]['message'];
							break;
					}
				}
			}
			if (!custom_message &&
				typeof options.custom_error_messages[rule] != "undefined" &&
				typeof options.custom_error_messages[rule]['message'] != "undefined"){
					 custom_message = options.custom_error_messages[rule]['message'];
			 }
			 return custom_message;
		 },
		 _validityProp: {
			 "required": "value-missing",
			 "custom": "custom-error",
			 "groupRequired": "value-missing",
			 "ajax": "custom-error",
			 "minSize": "range-underflow",
			 "maxSize": "range-overflow",
			 "min": "range-underflow",
			 "max": "range-overflow",
			 "past": "type-mismatch",
			 "future": "type-mismatch",
			 "dateRange": "type-mismatch",
			 "dateTimeRange": "type-mismatch",
			 "maxCheckbox": "range-overflow",
			 "minCheckbox": "range-underflow",
			 "equals": "pattern-mismatch",
			 "funcCall": "custom-error",
			 "creditCard": "pattern-mismatch",
			 "condRequired": "value-missing"
		 },
		/**
		* Required validation
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @param {bool} condRequired flag when method is used for internal purpose in condRequired check
		* @return an error string if validation failed
		*/
		_required: function(field, rules, i, options, condRequired) {
			switch (field.prop("type")) {
				case "text":
				case "password":
				case "textarea":
				case "file":
				case "select-one":
				case "select-multiple":
				default:
					var field_val      = $.trim( field.val()                               );
					var dv_placeholder = $.trim( field.attr("data-validation-placeholder") );
					var placeholder    = $.trim( field.attr("placeholder")                 );
					if (
						   ( !field_val                                    )
						|| ( dv_placeholder && field_val == dv_placeholder )
						|| ( placeholder    && field_val == placeholder    )
					) {
						return options.allrules[rules[i]].alertText;
					}
					break;
				case "radio":
				case "checkbox":
					// new validation style to only check dependent field
					if (condRequired) {
						if (!field.attr('checked')) {
							return options.allrules[rules[i]].alertTextCheckboxMultiple;
						}
						break;
					}
					// old validation style
					var form = field.closest("form, .validationEngineContainer");
					var name = field.attr("name");
					if (form.find("input[name='" + name + "']:checked").size() == 0) {
						if (form.find("input[name='" + name + "']:visible").size() == 1)
							return options.allrules[rules[i]].alertTextCheckboxe;
						else
							return options.allrules[rules[i]].alertTextCheckboxMultiple;
					}
					break;
			}
		},
		/**
		* Validate that 1 from the group field is required
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_groupRequired: function(field, rules, i, options) {
			var classGroup = "["+options.validateAttribute+"*=" +rules[i + 1] +"]";
			var isValid = false;
			// Check all fields from the group
			field.closest("form, .validationEngineContainer").find(classGroup).each(function(){
				if(!methods._required($(this), rules, i, options)){
					isValid = true;
					return false;
				}
			}); 

			if(!isValid) {
		  return options.allrules[rules[i]].alertText;
		}
		},
		/**
		* Validate rules
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_custom: function(field, rules, i, options) {
			var customRule = rules[i + 1];
			var rule = options.allrules[customRule];
			var fn;
			if(!rule) {
				alert("jqv:custom rule not found - "+customRule);
				return;
			}
			
			if(rule["regex"]) {
				 var ex=rule.regex;
					if(!ex) {
						alert("jqv:custom regex not found - "+customRule);
						return;
					}
					var pattern = new RegExp(ex);

					if (!pattern.test(field.val())) return options.allrules[customRule].alertText;
					
			} else if(rule["func"]) {
				fn = rule["func"]; 
				 
				if (typeof(fn) !== "function") {
					alert("jqv:custom parameter 'function' is no function - "+customRule);
						return;
				}
				 
				if (!fn(field, rules, i, options))
					return options.allrules[customRule].alertText;
			} else {
				alert("jqv:custom type not allowed "+customRule);
					return;
			}
		},
		/**
		* Validate custom function outside of the engine scope
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_funcCall: function(field, rules, i, options) {
			var functionName = rules[i + 1];
			var fn;
			if(functionName.indexOf('.') >-1)
			{
				var namespaces = functionName.split('.');
				var scope = window;
				while(namespaces.length)
				{
					scope = scope[namespaces.shift()];
				}
				fn = scope;
			}
			else
				fn = window[functionName] || options.customFunctions[functionName];
			if (typeof(fn) == 'function')
				return fn(field, rules, i, options);

		},
		/**
		* Field match
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_equals: function(field, rules, i, options) {
			var equalsField = rules[i + 1];

			if (field.val() != $("#" + equalsField).val())
				return options.allrules.equals.alertText;
		},
		/**
		* Check the maximum size (in characters)
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_maxSize: function(field, rules, i, options) {
			var max = rules[i + 1];
			var len = field.val().length;

			if (len > max) {
				var rule = options.allrules.maxSize;
				return rule.alertText + max + rule.alertText2;
			}
		},
		/**
		* Check the minimum size (in characters)
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_minSize: function(field, rules, i, options) {
			var min = rules[i + 1];
			var len = field.val().length;

			if (len < min) {
				var rule = options.allrules.minSize;
				return rule.alertText + min + rule.alertText2;
			}
		},
		/**
		* Check number minimum value
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_min: function(field, rules, i, options) {
			var min = parseFloat(rules[i + 1]);
			var len = parseFloat(field.val());

			if (len < min) {
				var rule = options.allrules.min;
				if (rule.alertText2) return rule.alertText + min + rule.alertText2;
				return rule.alertText + min;
			}
		},
		/**
		* Check number maximum value
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_max: function(field, rules, i, options) {
			var max = parseFloat(rules[i + 1]);
			var len = parseFloat(field.val());

			if (len >max ) {
				var rule = options.allrules.max;
				if (rule.alertText2) return rule.alertText + max + rule.alertText2;
				//orefalo: to review, also do the translations
				return rule.alertText + max;
			}
		},
		/**
		* Checks date is in the past
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_past: function(form, field, rules, i, options) {

			var p=rules[i + 1];
			var fieldAlt = $(form.find("input[name='" + p.replace(/^#+/, '') + "']"));
			var pdate;

			if (p.toLowerCase() == "now") {
				pdate = new Date();
			} else if (undefined != fieldAlt.val()) {
				if (fieldAlt.is(":disabled"))
					return;
				pdate = methods._parseDate(fieldAlt.val());
			} else {
				pdate = methods._parseDate(p);
			}
			var vdate = methods._parseDate(field.val());

			if (vdate > pdate ) {
				var rule = options.allrules.past;
				if (rule.alertText2) return rule.alertText + methods._dateToString(pdate) + rule.alertText2;
				return rule.alertText + methods._dateToString(pdate);
			}
		},
		/**
		* Checks date is in the future
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_future: function(form, field, rules, i, options) {

			var p=rules[i + 1];
			var fieldAlt = $(form.find("input[name='" + p.replace(/^#+/, '') + "']"));
			var pdate;

			if (p.toLowerCase() == "now") {
				pdate = new Date();
			} else if (undefined != fieldAlt.val()) {
				if (fieldAlt.is(":disabled"))
					return;
				pdate = methods._parseDate(fieldAlt.val());
			} else {
				pdate = methods._parseDate(p);
			}
			var vdate = methods._parseDate(field.val());

			if (vdate < pdate ) {
				var rule = options.allrules.future;
				if (rule.alertText2)
					return rule.alertText + methods._dateToString(pdate) + rule.alertText2;
				return rule.alertText + methods._dateToString(pdate);
			}
		},
		/**
		* Checks if valid date
		*
		* @param {string} date string
		* @return a bool based on determination of valid date
		*/
		_isDate: function (value) {
			var dateRegEx = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|1\d|2[0-8]))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(0?2(\/|-)29)(\/|-)(?:(?:0[48]00|[13579][26]00|[2468][048]00)|(?:\d\d)?(?:0[48]|[2468][048]|[13579][26]))$/);
			return dateRegEx.test(value);
		},
		/**
		* Checks if valid date time
		*
		* @param {string} date string
		* @return a bool based on determination of valid date time
		*/
		_isDateTime: function (value){
			var dateTimeRegEx = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1}$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^((1[012]|0?[1-9]){1}\/(0?[1-9]|[12][0-9]|3[01]){1}\/\d{2,4}\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1})$/);
			return dateTimeRegEx.test(value);
		},
		//Checks if the start date is before the end date
		//returns true if end is later than start
		_dateCompare: function (start, end) {
			return (new Date(start.toString()) < new Date(end.toString()));
		},
		/**
		* Checks date range
		*
		* @param {jqObject} first field name
		* @param {jqObject} second field name
		* @return an error string if validation failed
		*/
		_dateRange: function (field, rules, i, options) {
			//are not both populated
			if ((!options.firstOfGroup[0].value && options.secondOfGroup[0].value) || (options.firstOfGroup[0].value && !options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}

			//are not both dates
			if (!methods._isDate(options.firstOfGroup[0].value) || !methods._isDate(options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}

			//are both dates but range is off
			if (!methods._dateCompare(options.firstOfGroup[0].value, options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}
		},
		/**
		* Checks date time range
		*
		* @param {jqObject} first field name
		* @param {jqObject} second field name
		* @return an error string if validation failed
		*/
		_dateTimeRange: function (field, rules, i, options) {
			//are not both populated
			if ((!options.firstOfGroup[0].value && options.secondOfGroup[0].value) || (options.firstOfGroup[0].value && !options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}
			//are not both dates
			if (!methods._isDateTime(options.firstOfGroup[0].value) || !methods._isDateTime(options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}
			//are both dates but range is off
			if (!methods._dateCompare(options.firstOfGroup[0].value, options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}
		},
		/**
		* Max number of checkbox selected
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_maxCheckbox: function(form, field, rules, i, options) {

			var nbCheck = rules[i + 1];
			var groupname = field.attr("name");
			var groupSize = form.find("input[name='" + groupname + "']:checked").size();
			if (groupSize > nbCheck) {
				options.showArrow = false;
				if (options.allrules.maxCheckbox.alertText2)
					 return options.allrules.maxCheckbox.alertText + " " + nbCheck + " " + options.allrules.maxCheckbox.alertText2;
				return options.allrules.maxCheckbox.alertText;
			}
		},
		/**
		* Min number of checkbox selected
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_minCheckbox: function(form, field, rules, i, options) {

			var nbCheck = rules[i + 1];
			var groupname = field.attr("name");
			var groupSize = form.find("input[name='" + groupname + "']:checked").size();
			if (groupSize < nbCheck) {
				options.showArrow = false;
				return options.allrules.minCheckbox.alertText + " " + nbCheck + " " + options.allrules.minCheckbox.alertText2;
			}
		},
		/**
		* Checks that it is a valid credit card number according to the
		* Luhn checksum algorithm.
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_creditCard: function(field, rules, i, options) {
			//spaces and dashes may be valid characters, but must be stripped to calculate the checksum.
			var valid = false, cardNumber = field.val().replace(/ +/g, '').replace(/-+/g, '');

			var numDigits = cardNumber.length;
			if (numDigits >= 14 && numDigits <= 16 && parseInt(cardNumber) > 0) {

				var sum = 0, i = numDigits - 1, pos = 1, digit, luhn = new String();
				do {
					digit = parseInt(cardNumber.charAt(i));
					luhn += (pos++ % 2 == 0) ? digit * 2 : digit;
				} while (--i >= 0)

				for (i = 0; i < luhn.length; i++) {
					sum += parseInt(luhn.charAt(i));
				}
				valid = sum % 10 == 0;
			}
			if (!valid) return options.allrules.creditCard.alertText;
		},
		/**
		* Ajax field validation
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return nothing! the ajax validator handles the prompts itself
		*/
		 _ajax: function(field, rules, i, options) {

			 var errorSelector = rules[i + 1];
			 var rule = options.allrules[errorSelector];
			 var extraData = rule.extraData;
			 var extraDataDynamic = rule.extraDataDynamic;
			 var data = {
				"fieldId" : field.attr("id"),
				"fieldValue" : field.val()
			 };

			 if (typeof extraData === "object") {
				$.extend(data, extraData);
			 } else if (typeof extraData === "string") {
				var tempData = extraData.split("&");
				for(var i = 0; i < tempData.length; i++) {
					var values = tempData[i].split("=");
					if (values[0] && values[0]) {
						data[values[0]] = values[1];
					}
				}
			 }

			 if (extraDataDynamic) {
				 var tmpData = [];
				 var domIds = String(extraDataDynamic).split(",");
				 for (var i = 0; i < domIds.length; i++) {
					 var id = domIds[i];
					 if ($(id).length) {
						 var inputValue = field.closest("form, .validationEngineContainer").find(id).val();
						 var keyValue = id.replace('#', '') + '=' + escape(inputValue);
						 data[id.replace('#', '')] = inputValue;
					 }
				 }
			 }
			 
			 // If a field change event triggered this we want to clear the cache for this ID
			 if (options.eventTrigger == "field") {
				delete(options.ajaxValidCache[field.attr("id")]);
			 }

			 // If there is an error or if the the field is already validated, do not re-execute AJAX
			 if (!options.isError && !methods._checkAjaxFieldStatus(field.attr("id"), options)) {
				 $.ajax({
					 type: options.ajaxFormValidationMethod,
					 url: rule.url,
					 cache: false,
					 dataType: "json",
					 data: data,
					 field: field,
					 rule: rule,
					 methods: methods,
					 options: options,
					 beforeSend: function() {},
					 error: function(data, transport) {
						 methods._ajaxError(data, transport);
					 },
					 success: function(json) {

						 // asynchronously called on success, data is the json answer from the server
						 var errorFieldId = json[0];
						 //var errorField = $($("#" + errorFieldId)[0]);
						 var errorField = $("#"+ errorFieldId).eq(0);

						 // make sure we found the element
						 if (errorField.length == 1) {
							 var status = json[1];
							 // read the optional msg from the server
							 var msg = json[2];
							 if (!status) {
								 // Houston we got a problem - display an red prompt
								 options.ajaxValidCache[errorFieldId] = false;
								 options.isError = true;

								 // resolve the msg prompt
								 if(msg) {
									 if (options.allrules[msg]) {
										 var txt = options.allrules[msg].alertText;
										 if (txt) {
											msg = txt;
							}
									 }
								 }
								 else
									msg = rule.alertText;

								 if (options.showPrompts) methods._showPrompt(errorField, msg, "", true, options);
							 } else {
								 options.ajaxValidCache[errorFieldId] = true;

								 // resolves the msg prompt
								 if(msg) {
									 if (options.allrules[msg]) {
										 var txt = options.allrules[msg].alertTextOk;
										 if (txt) {
											msg = txt;
							}
									 }
								 }
								 else
								 msg = rule.alertTextOk;

								 if (options.showPrompts) {
									 // see if we should display a green prompt
									 if (msg)
										methods._showPrompt(errorField, msg, "pass", true, options);
									 else
										methods._closePrompt(errorField);
								}
								
								 // If a submit form triggered this, we want to re-submit the form
								 if (options.eventTrigger == "submit")
									field.closest("form").submit();
							 }
						 }
						 errorField.trigger("jqv.field.result", [errorField, options.isError, msg]);
					 }
				 });
				 
				 return rule.alertTextLoad;
			 }
		 },
		/**
		* Common method to handle ajax errors
		*
		* @param {Object} data
		* @param {Object} transport
		*/
		_ajaxError: function(data, transport) {
			if(data.status == 0 && transport == null)
				alert("The page is not served from a server! ajax call failed");
			else if(typeof console != "undefined")
				console.log("Ajax error: " + data.status + " " + transport);
		},
		/**
		* date -> string
		*
		* @param {Object} date
		*/
		_dateToString: function(date) {
			return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
		},
		/**
		* Parses an ISO date
		* @param {String} d
		*/
		_parseDate: function(d) {

			var dateParts = d.split("-");
			if(dateParts==d)
				dateParts = d.split("/");
			if(dateParts==d) {
				dateParts = d.split(".");
				return new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
			}
			return new Date(dateParts[0], (dateParts[1] - 1) ,dateParts[2]);
		},
		/**
		* Builds or updates a prompt with the given information
		*
		* @param {jqObject} field
		* @param {String} promptText html text to display type
		* @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
		* @param {boolean} ajaxed - use to mark fields than being validated with ajax
		* @param {Map} options user options
		*/
		 _showPrompt: function(field, promptText, type, ajaxed, options, ajaxform) {
			 var prompt = methods._getPrompt(field);
			 // The ajax submit errors are not see has an error in the form,
			 // When the form errors are returned, the engine see 2 bubbles, but those are ebing closed by the engine at the same time
			 // Because no error was found befor submitting
			 if(ajaxform) prompt = false;
			 // Check that there is indded text
			 if($.trim(promptText)){ 
				 if (prompt)
					methods._updatePrompt(field, prompt, promptText, type, ajaxed, options);
				 else
					methods._buildPrompt(field, promptText, type, ajaxed, options);
			}
		 },
		/**
		* Builds and shades a prompt for the given field.
		*
		* @param {jqObject} field
		* @param {String} promptText html text to display type
		* @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
		* @param {boolean} ajaxed - use to mark fields than being validated with ajax
		* @param {Map} options user options
		*/
		_buildPrompt: function(field, promptText, type, ajaxed, options) {

			// create the prompt
			var prompt = $('<div>');
			prompt.addClass(methods._getClassName(field.attr("id")) + "formError");
			// add a class name to identify the parent form of the prompt
			prompt.addClass("parentForm"+methods._getClassName(field.closest('form, .validationEngineContainer').attr("id")));
			prompt.addClass("formError");

			switch (type) {
				case "pass":
					prompt.addClass("greenPopup");
					break;
				case "load":
					prompt.addClass("blackPopup");
					break;
				default:
					/* it has error  */
					//alert("unknown popup type:"+type);
			}
			if (ajaxed)
				prompt.addClass("ajaxed");

			// create the prompt content
			var promptContent = $('<div>').addClass("formErrorContent").html(promptText).appendTo(prompt);

			// determine position type
			var positionType=field.data("promptPosition") || options.promptPosition;

			// create the css arrow pointing at the field
			// note that there is no triangle on max-checkbox and radio
			if (options.showArrow) {
				var arrow = $('<div>').addClass("formErrorArrow");

				//prompt positioning adjustment support. Usage: positionType:Xshift,Yshift (for ex.: bottomLeft:+20 or bottomLeft:-20,+10)
				if (typeof(positionType)=='string') 
				{
					var pos=positionType.indexOf(":");
					if(pos!=-1)
						positionType=positionType.substring(0,pos);
				}

				switch (positionType) {
					case "bottomLeft":
					case "bottomRight":
						prompt.find(".formErrorContent").before(arrow);
						arrow.addClass("formErrorArrowBottom").html('<div class="line1"><!-- --></div><div class="line2"><!-- --></div><div class="line3"><!-- --></div><div class="line4"><!-- --></div><div class="line5"><!-- --></div><div class="line6"><!-- --></div><div class="line7"><!-- --></div><div class="line8"><!-- --></div><div class="line9"><!-- --></div><div class="line10"><!-- --></div>');
						break;
					case "topLeft":
					case "topRight":
						arrow.html('<div class="line10"><!-- --></div><div class="line9"><!-- --></div><div class="line8"><!-- --></div><div class="line7"><!-- --></div><div class="line6"><!-- --></div><div class="line5"><!-- --></div><div class="line4"><!-- --></div><div class="line3"><!-- --></div><div class="line2"><!-- --></div><div class="line1"><!-- --></div>');
						prompt.append(arrow);
						break;
				}
			}
			// Add custom prompt class
			if (options.addPromptClass)
				prompt.addClass(options.addPromptClass);

            // Add custom prompt class defined in element
            var requiredOverride = field.attr('data-required-class');
            if(requiredOverride !== undefined) {
                prompt.addClass(requiredOverride);
            } else {
                if(options.prettySelect) {
                    if($('#' + field.attr('id')).next().is('select')) {
                        var prettyOverrideClass = $('#' + field.attr('id').substr(options.usePrefix.length).substring(options.useSuffix.length)).attr('data-required-class');
                        if(prettyOverrideClass !== undefined) {
                            prompt.addClass(prettyOverrideClass);
                        }
                    }
                }
            }

			prompt.css({
				"opacity": 0
			});
			if(positionType === 'inline') {
				prompt.addClass("inline");
				if(typeof field.attr('data-prompt-target') !== 'undefined' && $('#'+field.attr('data-prompt-target')).length > 0) {
					prompt.appendTo($('#'+field.attr('data-prompt-target')));
				} else {
					field.after(prompt);
				}
			} else {
				field.before(prompt);				
			}
			
			var pos = methods._calculatePosition(field, prompt, options);
			prompt.css({
				'position': positionType === 'inline' ? 'relative' : 'absolute',
				"top": pos.callerTopPosition,
				"left": pos.callerleftPosition,
				"marginTop": pos.marginTopSize,
				"opacity": 0
			}).data("callerField", field);
			

			if (options.autoHidePrompt) {
				setTimeout(function(){
					prompt.animate({
						"opacity": 0
					},function(){
						prompt.closest('.formErrorOuter').remove();
						prompt.remove();
					});
				}, options.autoHideDelay);
			} 
			return prompt.animate({
				"opacity": 0.87
			});
		},
		/**
		* Updates the prompt text field - the field for which the prompt
		* @param {jqObject} field
		* @param {String} promptText html text to display type
		* @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
		* @param {boolean} ajaxed - use to mark fields than being validated with ajax
		* @param {Map} options user options
		*/
		_updatePrompt: function(field, prompt, promptText, type, ajaxed, options, noAnimation) {

			if (prompt) {
				if (typeof type !== "undefined") {
					if (type == "pass")
						prompt.addClass("greenPopup");
					else
						prompt.removeClass("greenPopup");

					if (type == "load")
						prompt.addClass("blackPopup");
					else
						prompt.removeClass("blackPopup");
				}
				if (ajaxed)
					prompt.addClass("ajaxed");
				else
					prompt.removeClass("ajaxed");

				prompt.find(".formErrorContent").html(promptText);

				var pos = methods._calculatePosition(field, prompt, options);
				var css = {"top": pos.callerTopPosition,
				"left": pos.callerleftPosition,
				"marginTop": pos.marginTopSize};

				if (noAnimation)
					prompt.css(css);
				else
					prompt.animate(css);
			}
		},
		/**
		* Closes the prompt associated with the given field
		*
		* @param {jqObject}
		*            field
		*/
		 _closePrompt: function(field) {
			 var prompt = methods._getPrompt(field);
			 if (prompt)
				 prompt.fadeTo("fast", 0, function() {
					 prompt.parent('.formErrorOuter').remove();
					 prompt.remove();
				 });
		 },
		 closePrompt: function(field) {
			 return methods._closePrompt(field);
		 },
		/**
		* Returns the error prompt matching the field if any
		*
		* @param {jqObject}
		*            field
		* @return undefined or the error prompt (jqObject)
		*/
		_getPrompt: function(field) {
				var formId = $(field).closest('form, .validationEngineContainer').attr('id');
			var className = methods._getClassName(field.attr("id")) + "formError";
				var match = $("." + methods._escapeExpression(className) + '.parentForm' + formId)[0];
			if (match)
			return $(match);
		},
		/**
		  * Returns the escapade classname
		  *
		  * @param {selector}
		  *            className
		  */
		  _escapeExpression: function (selector) {
			  return selector.replace(/([#;&,\.\+\*\~':"\!\^$\[\]\(\)=>\|])/g, "\\$1");
		  },
		/**
		 * returns true if we are in a RTLed document
		 *
		 * @param {jqObject} field
		 */
		isRTL: function(field)
		{
			var $document = $(document);
			var $body = $('body');
			var rtl =
				(field && field.hasClass('rtl')) ||
				(field && (field.attr('dir') || '').toLowerCase()==='rtl') ||
				$document.hasClass('rtl') ||
				($document.attr('dir') || '').toLowerCase()==='rtl' ||
				$body.hasClass('rtl') ||
				($body.attr('dir') || '').toLowerCase()==='rtl';
			return Boolean(rtl);
		},
		/**
		* Calculates prompt position
		*
		* @param {jqObject}
		*            field
		* @param {jqObject}
		*            the prompt
		* @param {Map}
		*            options
		* @return positions
		*/
		_calculatePosition: function (field, promptElmt, options) {

			var promptTopPosition, promptleftPosition, marginTopSize;
			var fieldWidth 	= field.width();
			var fieldLeft 	= field.position().left; 
			var fieldTop 	=  field.position().top;
			var fieldHeight 	=  field.height();	
			var promptHeight = promptElmt.height();


			// is the form contained in an overflown container?
			promptTopPosition = promptleftPosition = 0;
			// compensation for the arrow
			marginTopSize = -promptHeight;
		

			//prompt positioning adjustment support
			//now you can adjust prompt position
			//usage: positionType:Xshift,Yshift
			//for example:
			//   bottomLeft:+20 means bottomLeft position shifted by 20 pixels right horizontally
			//   topRight:20, -15 means topRight position shifted by 20 pixels to right and 15 pixels to top
			//You can use +pixels, - pixels. If no sign is provided than + is default.
			var positionType=field.data("promptPosition") || options.promptPosition;
			var shift1="";
			var shift2="";
			var shiftX=0;
			var shiftY=0;
			if (typeof(positionType)=='string') {
				//do we have any position adjustments ?
				if (positionType.indexOf(":")!=-1) {
					shift1=positionType.substring(positionType.indexOf(":")+1);
					positionType=positionType.substring(0,positionType.indexOf(":"));

					//if any advanced positioning will be needed (percents or something else) - parser should be added here
					//for now we use simple parseInt()

					//do we have second parameter?
					if (shift1.indexOf(",") !=-1) {
						shift2=shift1.substring(shift1.indexOf(",") +1);
						shift1=shift1.substring(0,shift1.indexOf(","));
						shiftY=parseInt(shift2);
						if (isNaN(shiftY)) shiftY=0;
					};

					shiftX=parseInt(shift1);
					if (isNaN(shift1)) shift1=0;

				};
			};

			
			switch (positionType) {
				default:
				case "topRight":
					promptleftPosition +=  fieldLeft + fieldWidth - 30;
					promptTopPosition +=  fieldTop;
					break;

				case "topLeft":
					promptTopPosition +=  fieldTop;
					promptleftPosition += fieldLeft; 
					break;

				case "centerRight":
					promptTopPosition = fieldTop+4;
					marginTopSize = 0;
					promptleftPosition= fieldLeft + field.outerWidth(true)+5;
					break;
				case "centerLeft":
					promptleftPosition = fieldLeft - (promptElmt.width() + 2);
					promptTopPosition = fieldTop+4;
					marginTopSize = 0;
					
					break;

				case "bottomLeft":
					promptTopPosition = fieldTop + field.height() + 5;
					marginTopSize = 0;
					promptleftPosition = fieldLeft;
					break;
				case "bottomRight":
					promptleftPosition = fieldLeft + fieldWidth - 30;
					promptTopPosition =  fieldTop +  field.height() + 5;
					marginTopSize = 0;
					break;
				case "inline":
					promptleftPosition = 0;
					promptTopPosition = 0;
					marginTopSize = 0;
			};

		

			//apply adjusments if any
			promptleftPosition += shiftX;
			promptTopPosition  += shiftY;

			return {
				"callerTopPosition": promptTopPosition + "px",
				"callerleftPosition": promptleftPosition + "px",
				"marginTopSize": marginTopSize + "px"
			};
		},
		/**
		* Saves the user options and variables in the form.data
		*
		* @param {jqObject}
		*            form - the form where the user option should be saved
		* @param {Map}
		*            options - the user options
		* @return the user options (extended from the defaults)
		*/
		 _saveOptions: function(form, options) {

			 // is there a language localisation ?
			 if ($.validationEngineLanguage)
			 var allRules = $.validationEngineLanguage.allRules;
			 else
			 $.error("jQuery.validationEngine rules are not loaded, plz add localization files to the page");
			 // --- Internals DO NOT TOUCH or OVERLOAD ---
			 // validation rules and i18
			 $.validationEngine.defaults.allrules = allRules;

			 var userOptions = $.extend(true,{},$.validationEngine.defaults,options);

			 form.data('jqv', userOptions);
			 return userOptions;
		 },

		 /**
		 * Removes forbidden characters from class name
		 * @param {String} className
		 */
		 _getClassName: function(className) {
			 if(className)
				 return className.replace(/:/g, "_").replace(/\./g, "_");
					  },
		/**
		 * Escape special character for jQuery selector
		 * http://totaldev.com/content/escaping-characters-get-valid-jquery-id
		 * @param {String} selector
		 */
		 _jqSelector: function(str){
			return str.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
		},
		/**
		* Conditionally required field
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		* user options
		* @return an error string if validation failed
		*/
		_condRequired: function(field, rules, i, options) {
			var idx, dependingField;

			for(idx = (i + 1); idx < rules.length; idx++) {
				dependingField = jQuery("#" + rules[idx]).first();

				/* Use _required for determining wether dependingField has a value.
				 * There is logic there for handling all field types, and default value; so we won't replicate that here
				 * Indicate this special use by setting the last parameter to true so we only validate the dependingField on chackboxes and radio buttons (#462)
				 */
				if (dependingField.length && methods._required(dependingField, ["required"], 0, options, true) == undefined) {
					/* We now know any of the depending fields has a value,
					 * so we can validate this field as per normal required code
					 */
					return methods._required(field, ["required"], 0, options);
				}
			}
		},

	    _submitButtonClick: function(event) {
	        var button = $(this);
	        var form = button.closest('form, .validationEngineContainer');
	        form.data("jqv_submitButton", button.attr("id"));
	    }
		  };

	 /**
	 * Plugin entry point.
	 * You may pass an action as a parameter or a list of options.
	 * if none, the init and attach methods are being called.
	 * Remember: if you pass options, the attached method is NOT called automatically
	 *
	 * @param {String}
	 *            method (optional) action
	 */
	 $.fn.validationEngine = function(method) {

		 var form = $(this);
		 if(!form[0]) return form;  // stop here if the form does not exist

		 if (typeof(method) == 'string' && method.charAt(0) != '_' && methods[method]) {

			 // make sure init is called once
			 if(method != "showPrompt" && method != "hide" && method != "hideAll")
			 methods.init.apply(form);

			 return methods[method].apply(form, Array.prototype.slice.call(arguments, 1));
		 } else if (typeof method == 'object' || !method) {

			 // default constructor with or without arguments
			 methods.init.apply(form, arguments);
			 return methods.attach.apply(form);
		 } else {
			 $.error('Method ' + method + ' does not exist in jQuery.validationEngine');
		 }
	};



	// LEAK GLOBAL OPTIONS
	$.validationEngine= {fieldIdCounter: 0,defaults:{

		// Name of the event triggering field validation
		validationEventTrigger: "blur",
		// Automatically scroll viewport to the first error
		scroll: true,
		// Focus on the first input
		focusFirstField:true,
		// Show prompts, set to false to disable prompts
		showPrompts: true,
       // Should we attempt to validate non-visible input fields contained in the form? (Useful in cases of tabbed containers, e.g. jQuery-UI tabs)
       validateNonVisibleFields: false,
		// Opening box position, possible locations are: topLeft,
		// topRight, bottomLeft, centerRight, bottomRight, inline
		// inline gets inserted after the validated field or into an element specified in data-prompt-target
		promptPosition: "topRight",
		bindMethod:"bind",
		// internal, automatically set to true when it parse a _ajax rule
		inlineAjax: false,
		// if set to true, the form data is sent asynchronously via ajax to the form.action url (get)
		ajaxFormValidation: false,
		// The url to send the submit ajax validation (default to action)
		ajaxFormValidationURL: false,
		// HTTP method used for ajax validation
		ajaxFormValidationMethod: 'get',
		// Ajax form validation callback method: boolean onComplete(form, status, errors, options)
		// retuns false if the form.submit event needs to be canceled.
		onAjaxFormComplete: $.noop,
		// called right before the ajax call, may return false to cancel
		onBeforeAjaxFormValidation: $.noop,
		// Stops form from submitting and execute function assiciated with it
		onValidationComplete: false,

		// Used when you have a form fields too close and the errors messages are on top of other disturbing viewing messages
		doNotShowAllErrosOnSubmit: false,
		// Object where you store custom messages to override the default error messages
		custom_error_messages:{},
		// true if you want to vind the input fields
		binded: true,
		// set to true, when the prompt arrow needs to be displayed
		showArrow: true,
		// did one of the validation fail ? kept global to stop further ajax validations
		isError: false,
		// Limit how many displayed errors a field can have
		maxErrorsPerField: false,
		
		// Caches field validation status, typically only bad status are created.
		// the array is used during ajax form validation to detect issues early and prevent an expensive submit
		ajaxValidCache: {},
		// Auto update prompt position after window resize
		autoPositionUpdate: false,

		InvalidFields: [],
		onFieldSuccess: false,
		onFieldFailure: false,
		onSuccess: false,
		onFailure: false,
		validateAttribute: "class",
		addSuccessCssClassToField: "",
		addFailureCssClassToField: "",
		
		// Auto-hide prompt
		autoHidePrompt: false,
		// Delay before auto-hide
		autoHideDelay: 10000,
		// Fade out duration while hiding the validations
		fadeDuration: 0.3,
	 // Use Prettify select library
	 prettySelect: false,
	 // Add css class on prompt
	 addPromptClass : "",
	 // Custom ID uses prefix
	 usePrefix: "",
	 // Custom ID uses suffix
	 useSuffix: "",
	 // Only show one message per error prompt
	 showOneMessage: false
	}};
	$(function(){$.validationEngine.defaults.promptPosition = methods.isRTL()?'topLeft':"topRight"});
})(jQuery);



},{}],8:[function(require,module,exports){
(function($){
    $.fn.validationEngineLanguage = function(){
    };
    $.validationEngineLanguage = {
        newLang: function(){
            $.validationEngineLanguage.allRules = {
                "required": { // Add your regex rules here, you can take telephone as an example
                    "regex": "none",
                    "alertText": "* This field is required",
                    "alertTextCheckboxMultiple": "* Please select an option",
                    "alertTextCheckboxe": "* This checkbox is required",
                    "alertTextDateRange": "* Both date range fields are required"
                },
                "requiredInFunction": { 
                    "func": function(field, rules, i, options){
                        return (field.val() == "test") ? true : false;
                    },
                    "alertText": "* Field must equal test"
                },
                "dateRange": {
                    "regex": "none",
                    "alertText": "* Invalid ",
                    "alertText2": "Date Range"
                },
                "dateTimeRange": {
                    "regex": "none",
                    "alertText": "* Invalid ",
                    "alertText2": "Date Time Range"
                },
                "minSize": {
                    "regex": "none",
                    "alertText": "* Minimum ",
                    "alertText2": " characters required"
                },
                "maxSize": {
                    "regex": "none",
                    "alertText": "* Maximum ",
                    "alertText2": " characters allowed"
                },
				"groupRequired": {
                    "regex": "none",
                    "alertText": "* You must fill one of the following fields"
                },
                "min": {
                    "regex": "none",
                    "alertText": "* Minimum value is "
                },
                "max": {
                    "regex": "none",
                    "alertText": "* Maximum value is "
                },
                "past": {
                    "regex": "none",
                    "alertText": "* Date prior to "
                },
                "future": {
                    "regex": "none",
                    "alertText": "* Date past "
                },	
                "maxCheckbox": {
                    "regex": "none",
                    "alertText": "* Maximum ",
                    "alertText2": " options allowed"
                },
                "minCheckbox": {
                    "regex": "none",
                    "alertText": "* Please select ",
                    "alertText2": " options"
                },
                "equals": {
                    "regex": "none",
                    "alertText": "* Fields do not match"
                },
                "creditCard": {
                    "regex": "none",
                    "alertText": "* Invalid credit card number"
                },
                "phone": {
                    // credit: jquery.h5validate.js / orefalo
                    "regex": /^([\+][0-9]{1,3}[\ \.\-])?([\(]{1}[0-9]{2,6}[\)])?([0-9\ \.\-\/]{3,20})((x|ext|extension)[\ ]?[0-9]{1,4})?$/,
                    "alertText": "* Invalid phone number"
                },
                "email": {
                    // HTML5 compatible email regex ( http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#    e-mail-state-%28type=email%29 )
                    "regex": /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    "alertText": "* Invalid email address"
                },
                "integer": {
                    "regex": /^[\-\+]?\d+$/,
                    "alertText": "* Not a valid integer"
                },
                "number": {
                    // Number, including positive, negative, and floating decimal. credit: orefalo
                    "regex": /^[\-\+]?((([0-9]{1,3})([,][0-9]{3})*)|([0-9]+))?([\.]([0-9]+))?$/,
                    "alertText": "* Invalid floating decimal number"
                },
                "date": {                    
                    //	Check if date is valid by leap year
			"func": function (field) {
					var pattern = new RegExp(/^(\d{4})[\/\-\.](0?[1-9]|1[012])[\/\-\.](0?[1-9]|[12][0-9]|3[01])$/);
					var match = pattern.exec(field.val());
					if (match == null)
					   return false;
	
					var year = match[1];
					var month = match[2]*1;
					var day = match[3]*1;					
					var date = new Date(year, month - 1, day); // because months starts from 0.
	
					return (date.getFullYear() == year && date.getMonth() == (month - 1) && date.getDate() == day);
				},                		
			 "alertText": "* Invalid date, must be in YYYY-MM-DD format"
                },
                "ipv4": {
                    "regex": /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/,
                    "alertText": "* Invalid IP address"
                },
                "url": {
                    "regex": /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
                    "alertText": "* Invalid URL"
                },
                "onlyNumberSp": {
                    "regex": /^[0-9\ ]+$/,
                    "alertText": "* Numbers only"
                },
                "onlyLetterSp": {
                    "regex": /^[a-zA-Z\ \']+$/,
                    "alertText": "* Letters only"
                },
                "onlyLetterNumber": {
                    "regex": /^[0-9a-zA-Z]+$/,
                    "alertText": "* No special characters allowed"
                },
                // --- CUSTOM RULES -- Those are specific to the demos, they can be removed or changed to your likings
                "ajaxUserCall": {
                    "url": "ajaxValidateFieldUser",
                    // you may want to pass extra data on the ajax call
                    "extraData": "name=eric",
                    "alertText": "* This user is already taken",
                    "alertTextLoad": "* Validating, please wait"
                },
				"ajaxUserCallPhp": {
                    "url": "phpajax/ajaxValidateFieldUser.php",
                    // you may want to pass extra data on the ajax call
                    "extraData": "name=eric",
                    // if you provide an "alertTextOk", it will show as a green prompt when the field validates
                    "alertTextOk": "* This username is available",
                    "alertText": "* This user is already taken",
                    "alertTextLoad": "* Validating, please wait"
                },
                "ajaxNameCall": {
                    // remote json service location
                    "url": "ajaxValidateFieldName",
                    // error
                    "alertText": "* This name is already taken",
                    // if you provide an "alertTextOk", it will show as a green prompt when the field validates
                    "alertTextOk": "* This name is available",
                    // speaks by itself
                    "alertTextLoad": "* Validating, please wait"
                },
				 "ajaxNameCallPhp": {
	                    // remote json service location
	                    "url": "phpajax/ajaxValidateFieldName.php",
	                    // error
	                    "alertText": "* This name is already taken",
	                    // speaks by itself
	                    "alertTextLoad": "* Validating, please wait"
	                },
                "validate2fields": {
                    "alertText": "* Please input HELLO"
                },
	            //tls warning:homegrown not fielded 
                "dateFormat":{
                    "regex": /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|1\d|2[0-8]))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(0?2(\/|-)29)(\/|-)(?:(?:0[48]00|[13579][26]00|[2468][048]00)|(?:\d\d)?(?:0[48]|[2468][048]|[13579][26]))$/,
                    "alertText": "* Invalid Date"
                },
                //tls warning:homegrown not fielded 
				"dateTimeFormat": {
	                "regex": /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1}$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^((1[012]|0?[1-9]){1}\/(0?[1-9]|[12][0-9]|3[01]){1}\/\d{2,4}\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1})$/,
                    "alertText": "* Invalid Date or Date Format",
                    "alertText2": "Expected Format: ",
                    "alertText3": "mm/dd/yyyy hh:mm:ss AM|PM or ", 
                    "alertText4": "yyyy-mm-dd hh:mm:ss AM|PM"
	            }
            };
            
        }
    };

    $.validationEngineLanguage.newLang();
    
})(jQuery);

},{}],9:[function(require,module,exports){
(function($){
    $.fn.validationEngineLanguage = function(){
    };
    $.validationEngineLanguage = {
        newLang: function(){
            $.validationEngineLanguage.allRules = {
                "required": {
                    "regex": "none",
                    "alertText": "* Ce champ est requis",
                    "alertTextCheckboxMultiple": "* Choisir une option",
                    "alertTextCheckboxe": "* Cette option est requise"
                },
                "requiredInFunction": { 
                    "func": function(field, rules, i, options){
                        return (field.val() == "test") ? true : false;
                    },
                    "alertText": "* Field must equal test"
                },
               "minSize": {
                    "regex": "none",
                    "alertText": "* Minimum ",
                    "alertText2": " caractères requis"
                },
				"groupRequired": {
                    "regex": "none",
                    "alertText": "* Vous devez remplir un des champs suivant"
                },
                "maxSize": {
                    "regex": "none",
                    "alertText": "* Maximum ",
                    "alertText2": " caractères requis"
                },
		        "min": {
                    "regex": "none",
                    "alertText": "* Valeur minimum requise "
                },
                "max": {
                    "regex": "none",
                    "alertText": "* Valeur maximum requise "
                },
		        "past": {
                    "regex": "none",
                    "alertText": "* Date antérieure au "
                },
                "future": {
                    "regex": "none",
                    "alertText": "* Date postérieure au "
                },
                "maxCheckbox": {
                    "regex": "none",
                    "alertText": "* Nombre max de choix excédé"
                },
                "minCheckbox": {
                    "regex": "none",
                    "alertText": "* Veuillez choisir ",
                    "alertText2": " options"
                },
                "equals": {
                    "regex": "none",
                    "alertText": "* Votre champ n'est pas identique"
                },
                "creditCard": {
                    "regex": "none",
                    "alertText": "* Numéro de carte bancaire valide"
                },
                "phone": {
                    // credit: jquery.h5validate.js / orefalo
                    "regex": /^([\+][0-9]{1,3}[ \.\-])?([\(]{1}[0-9]{2,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
                    "alertText": "* Numéro de téléphone invalide"
                },
                "email": {
                    // Shamelessly lifted from Scott Gonzalez via the Bassistance Validation plugin http://projects.scottsplayground.com/email_address_validation/
                    "regex": /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
                    "alertText": "* Adresse email invalide"
                },
                "integer": {
                    "regex": /^[\-\+]?\d+$/,
                    "alertText": "* Nombre entier invalide"
                },
                "number": {
                    // Number, including positive, negative, and floating decimal. credit: orefalo
                    "regex": /^[\-\+]?((([0-9]{1,3})([,][0-9]{3})*)|([0-9]+))?([\.]([0-9]+))?$/,
                    "alertText": "* Nombre flottant invalide"
                },
                "date": {
                    "regex": /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/,
                    "alertText": "* Date invalide, format YYYY-MM-DD requis"
                },
                "ipv4": {
                	"regex": /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/,
                    "alertText": "* Adresse IP invalide"
                },
                "url": {
                    "regex": /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
                    "alertText": "* URL invalide"
                },
                "onlyNumberSp": {
                    "regex": /^[0-9\ ]+$/,
                    "alertText": "* Seuls les chiffres sont acceptés"
                },
                "onlyLetterSp": {
                    "regex": /^[a-zA-Z\u00C0-\u00D6\u00D9-\u00F6\u00F9-\u00FD\ \']+$/,
                    "alertText": "* Seules les lettres sont acceptées"
                },
                "onlyLetterNumber": {
                    "regex": /^[0-9a-zA-Z\u00C0-\u00D6\u00D9-\u00F6\u00F9-\u00FD]+$/,
                    "alertText": "* Aucun caractère spécial n'est accepté"
                },
				// --- CUSTOM RULES -- Those are specific to the demos, they can be removed or changed to your likings
                "ajaxUserCall": {
                    "url": "ajaxValidateFieldUser",
                    "extraData": "name=eric",
                    "alertTextLoad": "* Chargement, veuillez attendre",
                    "alertText": "* Ce nom est déjà pris"
                },
                "ajaxNameCall": {
                    "url": "ajaxValidateFieldName",
                    "alertText": "* Ce nom est déjà pris",
                    "alertTextOk": "*Ce nom est disponible",
                    "alertTextLoad": "* Chargement, veuillez attendre"
                },
                "validate2fields": {
                    "alertText": "Veuillez taper le mot HELLO"
                }
            };
        }
    };
    $.validationEngineLanguage.newLang();
})(jQuery);
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvY2hhcnRlL0FwcC5qcyIsImFwcC9jaGFydGUvRm9ybVV0aWxzLmpzIiwiYXBwL2NoYXJ0ZS9NZW51LmpzIiwiYXBwL2NoYXJ0ZS9OYW1lU3BhY2UuanMiLCJhcHAvbGFncmFuZ2UvalF1ZXJ5LXZhbGlkYXRpb24tZW5naW5lLmJyb3dzZXJpZnkuanMiLCJhcHAvdmVuZG9yL3NsaWNrLmpzIiwiYm93ZXJfY29tcG9uZW50cy92YWxpZGF0aW9uZW5naW5lL2pzL2pxdWVyeS52YWxpZGF0aW9uRW5naW5lLmpzIiwiYm93ZXJfY29tcG9uZW50cy92YWxpZGF0aW9uZW5naW5lL2pzL2xhbmd1YWdlcy9qcXVlcnkudmFsaWRhdGlvbkVuZ2luZS1lbi5qcyIsImJvd2VyX2NvbXBvbmVudHMvdmFsaWRhdGlvbmVuZ2luZS9qcy9sYW5ndWFnZXMvanF1ZXJ5LnZhbGlkYXRpb25FbmdpbmUtZnIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1bEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbnZhciBucyA9IHJlcXVpcmUoJ25zJyk7XHJcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XHJcbnZhciBNZW51ID0gcmVxdWlyZSgnLi9NZW51Jyk7XHJcbnJlcXVpcmUoJ3NlbGVjdHJpYycpO1xyXG52YXIgU2xpY2sgPSByZXF1aXJlKCcuLi92ZW5kb3Ivc2xpY2snKTtcclxuXHJcbm5zLmRvY1JlYWR5LnRoZW4oZnVuY3Rpb24oKXtcclxuXHJcblx0LyogU0VMRUNUICovXHJcblxyXG5cdHZhciBzZWxlY3RzID0gJCgnc2VsZWN0Jyk7XHJcblx0c2VsZWN0cy5zZWxlY3RyaWMoKTtcclxuXHJcblx0LyogQlVUVE9OUyAqL1xyXG5cclxuXHR2YXIgaW5wdXRfZmllbGRzID0gJCgnaW5wdXRbdHlwZT10ZXh0XSwgaW5wdXRbdHlwZT1lbWFpbF0sIGlucHV0W3R5cGU9bnVtYmVyXSwgaW5wdXRbdHlwZT1wYXNzd29yZF0nKTtcclxuXHRpbnB1dF9maWVsZHMub24oJ2JsdXIgY2hhbmdlJywgZnVuY3Rpb24oKXtcclxuXHRcdHZhciBlbCA9ICQodGhpcyk7XHJcblx0XHRpZihlbC52YWwoKSA9PSBcIlwiKSBlbC5hZGRDbGFzcygnZW1wdHknKTtcclxuXHRcdGVsc2UgZWwucmVtb3ZlQ2xhc3MoJ2VtcHR5Jyk7XHJcblx0fSkudHJpZ2dlcignYmx1cicpO1xyXG5cclxuXHJcblx0JCgnLnNsaWRlcicpLnNsaWNrKHtcclxuXHRcdGRvdHM6dHJ1ZSxcclxuXHRcdGFycm93czp0cnVlXHJcblx0fSk7XHJcblxyXG5cdE1lbnUuaW5pdCgpO1xyXG59KTtcclxuIiwiXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgbnMgPSByZXF1aXJlKCducycpO1xyXG52YXIgdmFsaWRhdGlvbkVuZ2luZSA9IHJlcXVpcmUoJ3ZhbGlkYXRlJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRnZXRQb3N0IDogZnVuY3Rpb24oZm9ybSwgY2Fwc3VsZSl7XHJcblx0XHR2YXIgcG9zdCA9IHt9O1xyXG5cdFx0aWYoY2Fwc3VsZSAhPT0gdW5kZWZpbmVkKVxyXG5cdFx0XHRwb3N0W2NhcHN1bGVdID0ge307XHJcblxyXG5cdFx0Zm9ybS5maW5kKCc6aW5wdXQnKS5ub3QoJ1t0eXBlPXJhZGlvXScpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBpbnAgPSAkKHRoaXMpO1xyXG5cdFx0XHR2YXIgaW5wVmFsID0gaW5wLnZhbCgpO1xyXG5cclxuXHRcdFx0aWYgKGlucC5hdHRyKCd0eXBlJykgPT0gJ2NoZWNrYm94Jykge1xyXG5cdFx0XHRcdGlmIChpbnAuaXMoJzpjaGVja2VkJykpIHtcclxuXHRcdFx0XHRcdGlucFZhbCA9IGlucFZhbDtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0aW5wVmFsID0gbnVsbDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBuID0gaW5wLmF0dHIoJ25hbWUnKTtcclxuXHRcdFx0aWYgKG4pIHtcclxuXHRcdFx0XHRpZihjYXBzdWxlICE9PSB1bmRlZmluZWQgJiYgIWlucC5oYXNDbGFzcygnZG9udEVuY2Fwc3VsYXRlJykpXHJcblx0XHRcdFx0XHRwb3N0W2NhcHN1bGVdW25dID0gaW5wVmFsO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHBvc3Rbbl0gPSBpbnBWYWw7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdGZvcm0uZmluZCgnOnJhZGlvJykuZmlsdGVyKCc6Y2hlY2tlZCcpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBpbnAgPSAkKHRoaXMpO1xyXG5cdFx0XHR2YXIgaW5wVmFsID0gaW5wLnZhbCgpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoY2Fwc3VsZSAhPT0gdW5kZWZpbmVkICYmICFpbnAuaGFzQ2xhc3MoJ2RvbnRFbmNhcHN1bGF0ZScpKVxyXG5cdFx0XHRcdHBvc3RbY2Fwc3VsZV1baW5wLmF0dHIoJ25hbWUnKV0gPSBpbnBWYWw7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRwb3N0W2lucC5hdHRyKCduYW1lJyldID0gaW5wVmFsO1xyXG5cdFx0fSk7XHJcblx0XHQvL2NvbnNvbGUuZGlyKHBvc3QpO1xyXG5cdFx0cmV0dXJuIHBvc3Q7XHJcblx0fSxcclxuXHJcblx0YXR0YWNoVmFsaWRhdGlvbjogZnVuY3Rpb24oZm9ybSl7XHJcblx0XHRmb3JtLnZhbGlkYXRpb25FbmdpbmUoJ2RldGFjaCcpO1xyXG5cdFx0Zm9ybS52YWxpZGF0aW9uRW5naW5lKCdhdHRhY2gnLCB7YmluZGVkOmZhbHNlLCBzY3JvbGw6IGZhbHNlfSk7XHJcblx0XHRyZXR1cm4gZm9ybTtcclxuXHR9LFxyXG5cdHZhbGlkYXRlIDogZnVuY3Rpb24oZm9ybSl7XHJcblx0XHQvL21ldCBsZXMgZW1haWxzIGVuIG1pbnVzY3VsZVxyXG5cdFx0JCgnW3R5cGU9XCJlbWFpbFwiXScsIGZvcm0pLmVhY2goZnVuY3Rpb24oaSwgZWwpe1xyXG5cdFx0XHRlbCA9ICQoZWwpO1xyXG5cdFx0XHR2YXIgdmFsID0gZWwudmFsKCk7XHJcblx0XHRcdGVsLnZhbCh2YWwgJiYgdmFsLnRvTG93ZXJDYXNlKCkpO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gZm9ybS52YWxpZGF0aW9uRW5naW5lKCd2YWxpZGF0ZScpO1xyXG5cdH1cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbnZhciBucyA9IHJlcXVpcmUoJ25zJyk7XHJcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XHJcblxyXG4vKiBNRU5VUyAqL1xyXG52YXIgbWVudUhlYWQ7XHJcbnZhciBtZW51VGFicztcclxudmFyIG1lbnVUYWJzQnRucztcclxudmFyIG1lbnVUYWJzQ29udGVudDtcclxudmFyIHBhcmVudE1lbnVJdGVtcztcclxudmFyIG9yaWdUYWJDb250ZW50Wkk7XHJcbnZhciB0b2dnbGVNZW51QnRuO1xyXG52YXIgbmF2U2VjdGlvbjtcclxuXHJcbnZhciB0b2dnbGVNZW51ID0gZnVuY3Rpb24oZSkge1xyXG5cdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuXHR2YXIgcGFnZVdyYXAgPSAkKCcucGFnZS13cmFwJyk7XHJcblx0cGFnZVdyYXAub2ZmKCdjbGljay5tZW51X2hlYWQnKTtcclxuXHRwYWdlV3JhcC50b2dnbGVDbGFzcygnb3BlbmVkJyk7XHJcblxyXG5cdGlmKHBhZ2VXcmFwLmhhc0NsYXNzKCdvcGVuZWQnKSl7XHJcblx0XHRwYWdlV3JhcFxyXG5cdFx0XHQub2ZmKCdjbGljay5tZW51X2hlYWQnKVxyXG5cdFx0XHQub24oJ2NsaWNrLm1lbnVfaGVhZCcsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHR0b2dnbGVNZW51KGUpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59O1xyXG5cclxudmFyIHRvZ2dsZUNoaWxkSXRlbSA9IGZ1bmN0aW9uKGl0ZW0sIGNhbGxiYWNrcyl7XHJcblx0dmFyIGNhbGxiYWNrcyA9IGNhbGxiYWNrcyB8fCB7fTtcclxuXHR2YXIgX2l0ZW0gPSAkKGl0ZW0pO1xyXG5cclxuXHRpZihfaXRlbS5pcygnOnZpc2libGUnKSl7XHJcblx0XHRuYXZTZWN0aW9uLnJlbW92ZUNsYXNzKCdzbGlkZS1vdXQnKTtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuXHRcdFx0X2l0ZW0uaGlkZSgpO1xyXG5cclxuXHRcdFx0aWYoY2FsbGJhY2tzLm9uSGlkZSkgeyBjYWxsYmFja3Mub25IaWRlKCk7IH1cclxuXHRcdH0sIDMwMCk7XHJcblx0fVxyXG5cdGVsc2Uge1xyXG5cdFx0X2l0ZW0uc2hvdygpO1xyXG5cdFx0bmF2U2VjdGlvbi5hZGRDbGFzcygnc2xpZGUtb3V0Jyk7XHJcblxyXG5cdFx0aWYoY2FsbGJhY2tzLm9uU2hvdykgeyBjYWxsYmFja3Mub25TaG93KCk7IH1cclxuXHR9XHJcbn07XHJcblxyXG52YXIgaGFuZGxlTWVudVRhYnMgPSBmdW5jdGlvbihlKSB7XHJcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdHZhciB0YWIgPSAkKGUuY3VycmVudFRhcmdldCkucGFyZW50KCk7XHJcblx0dmFyIHRhYkNvbnRlbnQgPSB0YWIuZmluZCgnLnRhYi1jb250ZW50Jyk7XHJcblxyXG5cdGlmKHRhYi5oYXNDbGFzcygnYWN0aXZlJykpe1xyXG5cdFx0dGFiLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHRcdHRhYkNvbnRlbnQuY3NzKHtib3R0b206MH0pO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0dmFyIHdhaXQgPSBtZW51VGFicy5maWx0ZXIoJy5hY3RpdmUnKS5sZW5ndGggPiAwID8gMzAwIDogMDtcclxuXHJcblx0bWVudVRhYnMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdG1lbnVUYWJzLm5vdCh0YWIpLmZpbmQoJy50YWItY29udGVudCcpLmNzcyh7Ym90dG9tOjB9KTtcclxuXHJcblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0dGFiLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdHZhciB0YWJDb250ZW50SGVpZ2h0ID0gdGFiQ29udGVudC5vdXRlckhlaWdodCgpO1xyXG5cdFx0dGFiQ29udGVudC5jc3Moe2JvdHRvbTotdGFiQ29udGVudEhlaWdodCsncHgnfSk7XHJcblx0fSwgd2FpdCk7XHJcbn07XHJcblxyXG52YXIgaGFuZGxlTWVudVRhYnNNb2JpbGUgPSBmdW5jdGlvbihlKXtcclxuXHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0dmFyIHRhYiA9ICQoZS5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKTtcclxuXHR2YXIgdGFiQ29udGVudCA9IHRhYi5maW5kKCcudGFiLWNvbnRlbnQnKTtcclxuXHJcblx0dG9nZ2xlQ2hpbGRJdGVtKHRhYkNvbnRlbnQsIHtcclxuXHRcdG9uU2hvdzpmdW5jdGlvbigpe1xyXG5cdFx0XHR0YWJDb250ZW50LmZpbmQoJy5jbG9zZS1idG4nKVxyXG5cdFx0XHRcdC5vZmYoJ2NsaWNrLm1lbnVfaGVhZCcpXHJcblx0XHRcdFx0Lm9uKCdjbGljay5tZW51X2hlYWQnLCBmdW5jdGlvbihlKXtcclxuXHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdHRvZ2dsZUNoaWxkSXRlbSh0YWJDb250ZW50KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9KTtcclxufTtcclxuXHJcbnZhciBzZXR1cE1lbnVFdmVudHMgPSBmdW5jdGlvbihpc01vYmlsZSkge1xyXG5cdG1lbnVUYWJzQnRucy5vZmYoJ2NsaWNrLm1lbnVfaGVhZCcpO1xyXG5cdG1lbnVUYWJzQnRucy5vbignY2xpY2subWVudV9oZWFkJywgaXNNb2JpbGUgPyBoYW5kbGVNZW51VGFic01vYmlsZSA6IGhhbmRsZU1lbnVUYWJzKTtcclxuXHJcblx0dG9nZ2xlTWVudUJ0bi5vZmYoJ2NsaWNrLm1lbnVfaGVhZCcpO1xyXG5cdHBhcmVudE1lbnVJdGVtcy5vZmYoJ2NsaWNrLm1lbnVfaGVhZCcpO1xyXG5cclxuXHRpZihpc01vYmlsZSkge1xyXG5cdFx0cGFyZW50TWVudUl0ZW1zLm9uKCdjbGljay5tZW51X2hlYWQnLCBmdW5jdGlvbihlKXtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRcdFx0dmFyIGNoaWxkSXRlbXMgPSAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJ3VsJyk7XHJcblx0XHRcdHRvZ2dsZUNoaWxkSXRlbShjaGlsZEl0ZW1zLCB7XHJcblx0XHRcdFx0b25TaG93OmZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRjaGlsZEl0ZW1zLmZpbmQoJy5iYWNrLWJ0bicpXHJcblx0XHRcdFx0XHRcdC5vZmYoJ2NsaWNrLm1lbnVfaGVhZCcpXHJcblx0XHRcdFx0XHRcdC5vbignY2xpY2subWVudV9oZWFkJywgZnVuY3Rpb24oZSl7XHJcblx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdHRvZ2dsZUNoaWxkSXRlbShjaGlsZEl0ZW1zKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdFx0dG9nZ2xlTWVudUJ0bi5vbignY2xpY2subWVudV9oZWFkJywgdG9nZ2xlTWVudSk7XHJcblx0fVxyXG59O1xyXG5cclxudmFyIGNoZWNrSWZNb2JpbGUgPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiAkKHdpbmRvdykud2lkdGgoKSA8IDk5MjtcclxufTtcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIG1lbnVIZWFkID0gJCgnW2NsYXNzXj1tZW51LWhlYWRdJyk7XHJcblx0bmF2U2VjdGlvbiA9IG1lbnVIZWFkLmZpbmQoJy5uYXZpZ2F0aW9uLXJvdycpO1xyXG4gICAgbWVudVRhYnMgPSBtZW51SGVhZC5maW5kKCdbZGF0YS1tZW51LXRhYl0nKTtcclxuICAgIG1lbnVUYWJzQnRucyA9IG1lbnVUYWJzLmZpbmQoJz4gaScpO1xyXG4gICAgbWVudVRhYnNDb250ZW50ID0gbWVudVRhYnMuZmluZCgnLnRhYi1jb250ZW50Jyk7XHJcblx0cGFyZW50TWVudUl0ZW1zID0gbWVudUhlYWQuZmluZCgnW2NsYXNzXj1tZW51LWl0ZW1dW2NsYXNzKj0tcGFyZW50XSA+IGEnKTtcclxuXHRvcmlnVGFiQ29udGVudFpJID0gbWVudVRhYnNDb250ZW50LmVxKDApLmNzcygnei1pbmRleCcpO1xyXG5cdHRvZ2dsZU1lbnVCdG4gPSAkKCcubWVudS1idG4nKTtcclxuXHJcblx0JCh3aW5kb3cpLm9uKCdyZXNpemUubWVudV9oZWFkJywgZnVuY3Rpb24oKXtcclxuXHRcdHNldHVwTWVudUV2ZW50cyhjaGVja0lmTW9iaWxlKCkpO1xyXG5cdH0pLnJlc2l6ZSgpO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgaW5pdDogaW5pdFxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIG5hbWUgPSAnY2hhcnRlJztcclxuXHJcbnZhciBQcm9taXNlID0gcmVxdWlyZSgncHJvbWlzZScpO1xyXG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xyXG52YXIgdmFsaWRhdGlvbkVuZ2luZSA9IHJlcXVpcmUoJ3ZhbGlkYXRlJyk7XHJcbnZhciBGb3JtVXRpbHMgPSByZXF1aXJlKCcuL0Zvcm1VdGlscy5qcycpO1xyXG5cclxudmFyIG5zID0gd2luZG93W25hbWVdID0gKHdpbmRvd1tuYW1lXSB8fCB7fSk7XHJcblxyXG5ucy5kb2NSZWFkeSA9IChmdW5jdGlvbigpe1xyXG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdCQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XHJcblx0XHRcdHJlc29sdmUoKTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG59KSgpO1xyXG5cclxubnMuZG9jUmVhZHkudGhlbihmdW5jdGlvbigpe1xyXG5cdHZhbGlkYXRpb25FbmdpbmUuc2V0TGFuZ3VhZ2UobnMubGFuZyk7XHJcblxyXG5cdCQoJ2Zvcm0nKS5lYWNoKGZ1bmN0aW9uKGksIGVsKXtcclxuXHRcdEZvcm1VdGlscy5hdHRhY2hWYWxpZGF0aW9uKCQoZWwpKTtcclxuXHR9KS5vbignc3VibWl0JywgZnVuY3Rpb24oZSl7XHJcblx0XHRGb3JtVXRpbHMudmFsaWRhdGUoJCh0aGlzKSk7XHJcblx0fSk7XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuczsiLCJcclxuXHJcbnJlcXVpcmUoJ2pxdWVyeS52YWxpZGF0aW9uRW5naW5lJyk7XHJcblxyXG52YXIgbGFuZ1J1bGVzID0ge307XHJcblxyXG5yZXF1aXJlKCdqcXVlcnkudmFsaWRhdGlvbkVuZ2luZS1mcicpO1xyXG5sYW5nUnVsZXMuZnIgPSAkLnZhbGlkYXRpb25FbmdpbmVMYW5ndWFnZS5hbGxSdWxlcztcclxucmVxdWlyZSgnanF1ZXJ5LnZhbGlkYXRpb25FbmdpbmUtZW4nKTtcclxubGFuZ1J1bGVzLmVuID0gJC52YWxpZGF0aW9uRW5naW5lTGFuZ3VhZ2UuYWxsUnVsZXM7XHJcblxyXG4vL2NvbnNvbGUubG9nKGxhbmdSdWxlcyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRzZXRMYW5ndWFnZSA6IGZ1bmN0aW9uKGxhbmcpIHtcclxuXHRcdCQudmFsaWRhdGlvbkVuZ2luZUxhbmd1YWdlLmFsbFJ1bGVzID0gbGFuZ1J1bGVzW2xhbmddO1xyXG5cdH1cclxufTsiLCIvKlxyXG4gICAgIF8gXyAgICAgIF8gICAgICAgX1xyXG4gX19ffCAoXykgX19ffCB8IF9fICAoXylfX19cclxuLyBfX3wgfCB8LyBfX3wgfC8gLyAgfCAvIF9ffFxyXG5cXF9fIFxcIHwgfCAoX198ICAgPCBfIHwgXFxfXyBcXFxyXG58X19fL198X3xcXF9fX3xffFxcXyhfKS8gfF9fXy9cclxuICAgICAgICAgICAgICAgICAgIHxfXy9cclxuXHJcbiBWZXJzaW9uOiAxLjUuOFxyXG4gIEF1dGhvcjogS2VuIFdoZWVsZXJcclxuIFdlYnNpdGU6IGh0dHA6Ly9rZW53aGVlbGVyLmdpdGh1Yi5pb1xyXG4gICAgRG9jczogaHR0cDovL2tlbndoZWVsZXIuZ2l0aHViLmlvL3NsaWNrXHJcbiAgICBSZXBvOiBodHRwOi8vZ2l0aHViLmNvbS9rZW53aGVlbGVyL3NsaWNrXHJcbiAgSXNzdWVzOiBodHRwOi8vZ2l0aHViLmNvbS9rZW53aGVlbGVyL3NsaWNrL2lzc3Vlc1xyXG5cclxuICovXHJcbi8qIGdsb2JhbCB3aW5kb3csIGRvY3VtZW50LCBkZWZpbmUsIGpRdWVyeSwgc2V0SW50ZXJ2YWwsIGNsZWFySW50ZXJ2YWwgKi9cclxuKGZ1bmN0aW9uKGZhY3RvcnkpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcclxuICAgIH1cclxuXHJcbn0oZnVuY3Rpb24oJCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgdmFyIFNsaWNrID0gd2luZG93LlNsaWNrIHx8IHt9O1xyXG5cclxuICAgIFNsaWNrID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgaW5zdGFuY2VVaWQgPSAwO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBTbGljayhlbGVtZW50LCBzZXR0aW5ncykge1xyXG5cclxuICAgICAgICAgICAgdmFyIF8gPSB0aGlzLCBkYXRhU2V0dGluZ3M7XHJcblxyXG4gICAgICAgICAgICBfLmRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgICAgICAgYWNjZXNzaWJpbGl0eTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFwcGVuZEFycm93czogJChlbGVtZW50KSxcclxuICAgICAgICAgICAgICAgIGFwcGVuZERvdHM6ICQoZWxlbWVudCksXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhc05hdkZvcjogbnVsbCxcclxuICAgICAgICAgICAgICAgIHByZXZBcnJvdzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIiBjbGFzcz1cInNsaWNrLXByZXZcIiBhcmlhLWxhYmVsPVwiUHJldmlvdXNcIiB0YWJpbmRleD1cIjBcIiByb2xlPVwiYnV0dG9uXCI+UHJldmlvdXM8L2J1dHRvbj4nLFxyXG4gICAgICAgICAgICAgICAgbmV4dEFycm93OiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1yb2xlPVwibm9uZVwiIGNsYXNzPVwic2xpY2stbmV4dFwiIGFyaWEtbGFiZWw9XCJOZXh0XCIgdGFiaW5kZXg9XCIwXCIgcm9sZT1cImJ1dHRvblwiPk5leHQ8L2J1dHRvbj4nLFxyXG4gICAgICAgICAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXV0b3BsYXlTcGVlZDogMzAwMCxcclxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzUwcHgnLFxyXG4gICAgICAgICAgICAgICAgY3NzRWFzZTogJ2Vhc2UnLFxyXG4gICAgICAgICAgICAgICAgY3VzdG9tUGFnaW5nOiBmdW5jdGlvbihzbGlkZXIsIGkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIiByb2xlPVwiYnV0dG9uXCIgYXJpYS1yZXF1aXJlZD1cImZhbHNlXCIgdGFiaW5kZXg9XCIwXCI+JyArIChpICsgMSkgKyAnPC9idXR0b24+JztcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMnLFxyXG4gICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZWFzaW5nOiAnbGluZWFyJyxcclxuICAgICAgICAgICAgICAgIGVkZ2VGcmljdGlvbjogMC4zNSxcclxuICAgICAgICAgICAgICAgIGZhZGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGluaXRpYWxTbGlkZTogMCxcclxuICAgICAgICAgICAgICAgIGxhenlMb2FkOiAnb25kZW1hbmQnLFxyXG4gICAgICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgcGF1c2VPbkhvdmVyOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcGF1c2VPbkRvdHNIb3ZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICByZXNwb25kVG86ICd3aW5kb3cnLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogbnVsbCxcclxuICAgICAgICAgICAgICAgIHJvd3M6IDEsXHJcbiAgICAgICAgICAgICAgICBydGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGU6ICcnLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyUm93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBzcGVlZDogNTAwLFxyXG4gICAgICAgICAgICAgICAgc3dpcGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzd2lwZVRvU2xpZGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdG91Y2hNb3ZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgdG91Y2hUaHJlc2hvbGQ6IDUsXHJcbiAgICAgICAgICAgICAgICB1c2VDU1M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB1c2VUcmFuc2Zvcm06IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdmFyaWFibGVXaWR0aDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbFN3aXBpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgd2FpdEZvckFuaW1hdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDEwMDBcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIF8uaW5pdGlhbHMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXV0b1BsYXlUaW1lcjogbnVsbCxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnREaXJlY3Rpb246IDAsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50TGVmdDogbnVsbCxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTbGlkZTogMCxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMSxcclxuICAgICAgICAgICAgICAgICRkb3RzOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgbGlzdFdpZHRoOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgbGlzdEhlaWdodDogbnVsbCxcclxuICAgICAgICAgICAgICAgIGxvYWRJbmRleDogMCxcclxuICAgICAgICAgICAgICAgICRuZXh0QXJyb3c6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAkcHJldkFycm93OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVDb3VudDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHNsaWRlV2lkdGg6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAkc2xpZGVUcmFjazogbnVsbCxcclxuICAgICAgICAgICAgICAgICRzbGlkZXM6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBzbGlkaW5nOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0OiAwLFxyXG4gICAgICAgICAgICAgICAgc3dpcGVMZWZ0OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgJGxpc3Q6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB0b3VjaE9iamVjdDoge30sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1zRW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB1bnNsaWNrZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkLmV4dGVuZChfLCBfLmluaXRpYWxzKTtcclxuXHJcbiAgICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9IG51bGw7XHJcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSBudWxsO1xyXG4gICAgICAgICAgICBfLmFuaW1Qcm9wID0gbnVsbDtcclxuICAgICAgICAgICAgXy5icmVha3BvaW50cyA9IFtdO1xyXG4gICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5ncyA9IFtdO1xyXG4gICAgICAgICAgICBfLmNzc1RyYW5zaXRpb25zID0gZmFsc2U7XHJcbiAgICAgICAgICAgIF8uaGlkZGVuID0gJ2hpZGRlbic7XHJcbiAgICAgICAgICAgIF8ucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIF8ucG9zaXRpb25Qcm9wID0gbnVsbDtcclxuICAgICAgICAgICAgXy5yZXNwb25kVG8gPSBudWxsO1xyXG4gICAgICAgICAgICBfLnJvd0NvdW50ID0gMTtcclxuICAgICAgICAgICAgXy5zaG91bGRDbGljayA9IHRydWU7XHJcbiAgICAgICAgICAgIF8uJHNsaWRlciA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlID0gbnVsbDtcclxuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gbnVsbDtcclxuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9IG51bGw7XHJcbiAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICd2aXNpYmlsaXR5Y2hhbmdlJztcclxuICAgICAgICAgICAgXy53aW5kb3dXaWR0aCA9IDA7XHJcbiAgICAgICAgICAgIF8ud2luZG93VGltZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgZGF0YVNldHRpbmdzID0gJChlbGVtZW50KS5kYXRhKCdzbGljaycpIHx8IHt9O1xyXG5cclxuICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8uZGVmYXVsdHMsIGRhdGFTZXR0aW5ncywgc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xyXG5cclxuICAgICAgICAgICAgXy5vcmlnaW5hbFNldHRpbmdzID0gXy5vcHRpb25zO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkb2N1bWVudC5tb3pIaWRkZW4gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBfLmhpZGRlbiA9ICdtb3pIaWRkZW4nO1xyXG4gICAgICAgICAgICAgICAgXy52aXNpYmlsaXR5Q2hhbmdlID0gJ21venZpc2liaWxpdHljaGFuZ2UnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC53ZWJraXRIaWRkZW4gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBfLmhpZGRlbiA9ICd3ZWJraXRIaWRkZW4nO1xyXG4gICAgICAgICAgICAgICAgXy52aXNpYmlsaXR5Q2hhbmdlID0gJ3dlYmtpdHZpc2liaWxpdHljaGFuZ2UnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfLmF1dG9QbGF5ID0gJC5wcm94eShfLmF1dG9QbGF5LCBfKTtcclxuICAgICAgICAgICAgXy5hdXRvUGxheUNsZWFyID0gJC5wcm94eShfLmF1dG9QbGF5Q2xlYXIsIF8pO1xyXG4gICAgICAgICAgICBfLmNoYW5nZVNsaWRlID0gJC5wcm94eShfLmNoYW5nZVNsaWRlLCBfKTtcclxuICAgICAgICAgICAgXy5jbGlja0hhbmRsZXIgPSAkLnByb3h5KF8uY2xpY2tIYW5kbGVyLCBfKTtcclxuICAgICAgICAgICAgXy5zZWxlY3RIYW5kbGVyID0gJC5wcm94eShfLnNlbGVjdEhhbmRsZXIsIF8pO1xyXG4gICAgICAgICAgICBfLnNldFBvc2l0aW9uID0gJC5wcm94eShfLnNldFBvc2l0aW9uLCBfKTtcclxuICAgICAgICAgICAgXy5zd2lwZUhhbmRsZXIgPSAkLnByb3h5KF8uc3dpcGVIYW5kbGVyLCBfKTtcclxuICAgICAgICAgICAgXy5kcmFnSGFuZGxlciA9ICQucHJveHkoXy5kcmFnSGFuZGxlciwgXyk7XHJcbiAgICAgICAgICAgIF8ua2V5SGFuZGxlciA9ICQucHJveHkoXy5rZXlIYW5kbGVyLCBfKTtcclxuICAgICAgICAgICAgXy5hdXRvUGxheUl0ZXJhdG9yID0gJC5wcm94eShfLmF1dG9QbGF5SXRlcmF0b3IsIF8pO1xyXG5cclxuICAgICAgICAgICAgXy5pbnN0YW5jZVVpZCA9IGluc3RhbmNlVWlkKys7XHJcblxyXG4gICAgICAgICAgICAvLyBBIHNpbXBsZSB3YXkgdG8gY2hlY2sgZm9yIEhUTUwgc3RyaW5nc1xyXG4gICAgICAgICAgICAvLyBTdHJpY3QgSFRNTCByZWNvZ25pdGlvbiAobXVzdCBzdGFydCB3aXRoIDwpXHJcbiAgICAgICAgICAgIC8vIEV4dHJhY3RlZCBmcm9tIGpRdWVyeSB2MS4xMSBzb3VyY2VcclxuICAgICAgICAgICAgXy5odG1sRXhwciA9IC9eKD86XFxzKig8W1xcd1xcV10rPilbXj5dKikkLztcclxuXHJcblxyXG4gICAgICAgICAgICBfLnJlZ2lzdGVyQnJlYWtwb2ludHMoKTtcclxuICAgICAgICAgICAgXy5pbml0KHRydWUpO1xyXG4gICAgICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZSh0cnVlKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gU2xpY2s7XHJcblxyXG4gICAgfSgpKTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuYWRkU2xpZGUgPSBTbGljay5wcm90b3R5cGUuc2xpY2tBZGQgPSBmdW5jdGlvbihtYXJrdXAsIGluZGV4LCBhZGRCZWZvcmUpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mKGluZGV4KSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICAgIGFkZEJlZm9yZSA9IGluZGV4O1xyXG4gICAgICAgICAgICBpbmRleCA9IG51bGw7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpbmRleCA8IDAgfHwgKGluZGV4ID49IF8uc2xpZGVDb3VudCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXy51bmxvYWQoKTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCAmJiBfLiRzbGlkZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWRkQmVmb3JlKSB7XHJcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuaW5zZXJ0QmVmb3JlKF8uJHNsaWRlcy5lcShpbmRleCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChtYXJrdXApLmluc2VydEFmdGVyKF8uJHNsaWRlcy5lcShpbmRleCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGFkZEJlZm9yZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgJChtYXJrdXApLnByZXBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQobWFya3VwKS5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXy4kc2xpZGVzID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpO1xyXG5cclxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XHJcblxyXG4gICAgICAgIF8uJHNsaWRlVHJhY2suYXBwZW5kKF8uJHNsaWRlcyk7XHJcblxyXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICQoZWxlbWVudCkuYXR0cignZGF0YS1zbGljay1pbmRleCcsIGluZGV4KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XHJcblxyXG4gICAgICAgIF8ucmVpbml0KCk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuYW5pbWF0ZUhlaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuICAgICAgICBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PT0gMSAmJiBfLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5vdXRlckhlaWdodCh0cnVlKTtcclxuICAgICAgICAgICAgXy4kbGlzdC5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgIGhlaWdodDogdGFyZ2V0SGVpZ2h0XHJcbiAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuYW5pbWF0ZVNsaWRlID0gZnVuY3Rpb24odGFyZ2V0TGVmdCwgY2FsbGJhY2spIHtcclxuXHJcbiAgICAgICAgdmFyIGFuaW1Qcm9wcyA9IHt9LFxyXG4gICAgICAgICAgICBfID0gdGhpcztcclxuXHJcbiAgICAgICAgXy5hbmltYXRlSGVpZ2h0KCk7XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlICYmIF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IC10YXJnZXRMZWZ0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoXy50cmFuc2Zvcm1zRW5hYmxlZCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGFyZ2V0TGVmdFxyXG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGFyZ2V0TGVmdFxyXG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRMZWZ0ID0gLShfLmN1cnJlbnRMZWZ0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoe1xyXG4gICAgICAgICAgICAgICAgICAgIGFuaW1TdGFydDogXy5jdXJyZW50TGVmdFxyXG4gICAgICAgICAgICAgICAgfSkuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbVN0YXJ0OiB0YXJnZXRMZWZ0XHJcbiAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IF8ub3B0aW9ucy5zcGVlZCxcclxuICAgICAgICAgICAgICAgICAgICBlYXNpbmc6IF8ub3B0aW9ucy5lYXNpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RlcDogZnVuY3Rpb24obm93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IE1hdGguY2VpbChub3cpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZSgnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgKyAncHgsIDBweCknO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoYW5pbVByb3BzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUoMHB4LCcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyArICdweCknO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoYW5pbVByb3BzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICBfLmFwcGx5VHJhbnNpdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IE1hdGguY2VpbCh0YXJnZXRMZWZ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUzZCgnICsgdGFyZ2V0TGVmdCArICdweCwgMHB4LCAwcHgpJztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZTNkKDBweCwnICsgdGFyZ2V0TGVmdCArICdweCwgMHB4KSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhhbmltUHJvcHMpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfLmRpc2FibGVUcmFuc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmFzTmF2Rm9yID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxyXG4gICAgICAgICAgICBhc05hdkZvciA9IF8ub3B0aW9ucy5hc05hdkZvcjtcclxuXHJcbiAgICAgICAgaWYgKCBhc05hdkZvciAmJiBhc05hdkZvciAhPT0gbnVsbCApIHtcclxuICAgICAgICAgICAgYXNOYXZGb3IgPSAkKGFzTmF2Rm9yKS5ub3QoXy4kc2xpZGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggYXNOYXZGb3IgIT09IG51bGwgJiYgdHlwZW9mIGFzTmF2Rm9yID09PSAnb2JqZWN0JyApIHtcclxuICAgICAgICAgICAgYXNOYXZGb3IuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKHRoaXMpLnNsaWNrKCdnZXRTbGljaycpO1xyXG4gICAgICAgICAgICAgICAgaWYoIXRhcmdldC51bnNsaWNrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuc2xpZGVIYW5kbGVyKGluZGV4LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmFwcGx5VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKHNsaWRlKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcyxcclxuICAgICAgICAgICAgdHJhbnNpdGlvbiA9IHt9O1xyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSBfLnRyYW5zZm9ybVR5cGUgKyAnICcgKyBfLm9wdGlvbnMuc3BlZWQgKyAnbXMgJyArIF8ub3B0aW9ucy5jc3NFYXNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSAnb3BhY2l0eSAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3ModHJhbnNpdGlvbik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlKS5jc3ModHJhbnNpdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmF1dG9QbGF5ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKF8uYXV0b1BsYXlUaW1lcikge1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKF8uYXV0b1BsYXlUaW1lcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAmJiBfLnBhdXNlZCAhPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBfLmF1dG9QbGF5VGltZXIgPSBzZXRJbnRlcnZhbChfLmF1dG9QbGF5SXRlcmF0b3IsXHJcbiAgICAgICAgICAgICAgICBfLm9wdGlvbnMuYXV0b3BsYXlTcGVlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmF1dG9QbGF5Q2xlYXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG4gICAgICAgIGlmIChfLmF1dG9QbGF5VGltZXIpIHtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChfLmF1dG9QbGF5VGltZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5hdXRvUGxheUl0ZXJhdG9yID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChfLmRpcmVjdGlvbiA9PT0gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgKyAxKSA9PT0gXy5zbGlkZUNvdW50IC1cclxuICAgICAgICAgICAgICAgICAgICAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXy5kaXJlY3Rpb24gPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKChfLmN1cnJlbnRTbGlkZSAtIDEgPT09IDApKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIF8uZGlyZWN0aW9uID0gMTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgLSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGRBcnJvd3MgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSApIHtcclxuXHJcbiAgICAgICAgICAgIF8uJHByZXZBcnJvdyA9ICQoXy5vcHRpb25zLnByZXZBcnJvdykuYWRkQ2xhc3MoJ3NsaWNrLWFycm93Jyk7XHJcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdyA9ICQoXy5vcHRpb25zLm5leHRBcnJvdykuYWRkQ2xhc3MoJ3NsaWNrLWFycm93Jyk7XHJcblxyXG4gICAgICAgICAgICBpZiggXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWhpZGRlbicpLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIHRhYmluZGV4Jyk7XHJcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWhpZGRlbicpLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIHRhYmluZGV4Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMucHJldkFycm93KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5wcmVwZW5kVG8oXy5vcHRpb25zLmFwcGVuZEFycm93cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMubmV4dEFycm93KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5hcHBlbmRUbyhfLm9wdGlvbnMuYXBwZW5kQXJyb3dzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXy4kcHJldkFycm93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stZGlzYWJsZWQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5hZGQoIF8uJG5leHRBcnJvdyApXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2staGlkZGVuJylcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdhcmlhLWRpc2FibGVkJzogJ3RydWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAndGFiaW5kZXgnOiAnLTEnXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5idWlsZERvdHMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxyXG4gICAgICAgICAgICBpLCBkb3RTdHJpbmc7XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XHJcblxyXG4gICAgICAgICAgICBkb3RTdHJpbmcgPSAnPHVsIGNsYXNzPVwiJyArIF8ub3B0aW9ucy5kb3RzQ2xhc3MgKyAnXCI+JztcclxuXHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPD0gXy5nZXREb3RDb3VudCgpOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGRvdFN0cmluZyArPSAnPGxpPicgKyBfLm9wdGlvbnMuY3VzdG9tUGFnaW5nLmNhbGwodGhpcywgXywgaSkgKyAnPC9saT4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkb3RTdHJpbmcgKz0gJzwvdWw+JztcclxuXHJcbiAgICAgICAgICAgIF8uJGRvdHMgPSAkKGRvdFN0cmluZykuYXBwZW5kVG8oXHJcbiAgICAgICAgICAgICAgICBfLm9wdGlvbnMuYXBwZW5kRG90cyk7XHJcblxyXG4gICAgICAgICAgICBfLiRkb3RzLmZpbmQoJ2xpJykuZmlyc3QoKS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkT3V0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgXy4kc2xpZGVzID1cclxuICAgICAgICAgICAgXy4kc2xpZGVyXHJcbiAgICAgICAgICAgICAgICAuY2hpbGRyZW4oIF8ub3B0aW9ucy5zbGlkZSArICc6bm90KC5zbGljay1jbG9uZWQpJylcclxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stc2xpZGUnKTtcclxuXHJcbiAgICAgICAgXy5zbGlkZUNvdW50ID0gXy4kc2xpZGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgXy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgJChlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBpbmRleClcclxuICAgICAgICAgICAgICAgIC5kYXRhKCdvcmlnaW5hbFN0eWxpbmcnLCAkKGVsZW1lbnQpLmF0dHIoJ3N0eWxlJykgfHwgJycpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcclxuXHJcbiAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1zbGlkZXInKTtcclxuXHJcbiAgICAgICAgXy4kc2xpZGVUcmFjayA9IChfLnNsaWRlQ291bnQgPT09IDApID9cclxuICAgICAgICAgICAgJCgnPGRpdiBjbGFzcz1cInNsaWNrLXRyYWNrXCIvPicpLmFwcGVuZFRvKF8uJHNsaWRlcikgOlxyXG4gICAgICAgICAgICBfLiRzbGlkZXMud3JhcEFsbCgnPGRpdiBjbGFzcz1cInNsaWNrLXRyYWNrXCIvPicpLnBhcmVudCgpO1xyXG5cclxuICAgICAgICBfLiRsaXN0ID0gXy4kc2xpZGVUcmFjay53cmFwKFxyXG4gICAgICAgICAgICAnPGRpdiBhcmlhLWxpdmU9XCJwb2xpdGVcIiBjbGFzcz1cInNsaWNrLWxpc3RcIi8+JykucGFyZW50KCk7XHJcbiAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoJ29wYWNpdHknLCAwKTtcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlIHx8IF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQoJ2ltZ1tkYXRhLWxhenldJywgXy4kc2xpZGVyKS5ub3QoJ1tzcmNdJykuYWRkQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKTtcclxuXHJcbiAgICAgICAgXy5zZXR1cEluZmluaXRlKCk7XHJcblxyXG4gICAgICAgIF8uYnVpbGRBcnJvd3MoKTtcclxuXHJcbiAgICAgICAgXy5idWlsZERvdHMoKTtcclxuXHJcbiAgICAgICAgXy51cGRhdGVEb3RzKCk7XHJcblxyXG5cclxuICAgICAgICBfLnNldFNsaWRlQ2xhc3Nlcyh0eXBlb2YgXy5jdXJyZW50U2xpZGUgPT09ICdudW1iZXInID8gXy5jdXJyZW50U2xpZGUgOiAwKTtcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kcmFnZ2FibGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgXy4kbGlzdC5hZGRDbGFzcygnZHJhZ2dhYmxlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkUm93cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXMsIGEsIGIsIGMsIG5ld1NsaWRlcywgbnVtT2ZTbGlkZXMsIG9yaWdpbmFsU2xpZGVzLHNsaWRlc1BlclNlY3Rpb247XHJcblxyXG4gICAgICAgIG5ld1NsaWRlcyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgICAgICBvcmlnaW5hbFNsaWRlcyA9IF8uJHNsaWRlci5jaGlsZHJlbigpO1xyXG5cclxuICAgICAgICBpZihfLm9wdGlvbnMucm93cyA+IDEpIHtcclxuXHJcbiAgICAgICAgICAgIHNsaWRlc1BlclNlY3Rpb24gPSBfLm9wdGlvbnMuc2xpZGVzUGVyUm93ICogXy5vcHRpb25zLnJvd3M7XHJcbiAgICAgICAgICAgIG51bU9mU2xpZGVzID0gTWF0aC5jZWlsKFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxTbGlkZXMubGVuZ3RoIC8gc2xpZGVzUGVyU2VjdGlvblxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgZm9yKGEgPSAwOyBhIDwgbnVtT2ZTbGlkZXM7IGErKyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgICAgIGZvcihiID0gMDsgYiA8IF8ub3B0aW9ucy5yb3dzOyBiKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGMgPSAwOyBjIDwgXy5vcHRpb25zLnNsaWRlc1BlclJvdzsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAoYSAqIHNsaWRlc1BlclNlY3Rpb24gKyAoKGIgKiBfLm9wdGlvbnMuc2xpZGVzUGVyUm93KSArIGMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsU2xpZGVzLmdldCh0YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlLmFwcGVuZENoaWxkKHJvdyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZXdTbGlkZXMuYXBwZW5kQ2hpbGQoc2xpZGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfLiRzbGlkZXIuaHRtbChuZXdTbGlkZXMpO1xyXG4gICAgICAgICAgICBfLiRzbGlkZXIuY2hpbGRyZW4oKS5jaGlsZHJlbigpLmNoaWxkcmVuKClcclxuICAgICAgICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICd3aWR0aCc6KDEwMCAvIF8ub3B0aW9ucy5zbGlkZXNQZXJSb3cpICsgJyUnLFxyXG4gICAgICAgICAgICAgICAgICAgICdkaXNwbGF5JzogJ2lubGluZS1ibG9jaydcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuY2hlY2tSZXNwb25zaXZlID0gZnVuY3Rpb24oaW5pdGlhbCwgZm9yY2VVcGRhdGUpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxyXG4gICAgICAgICAgICBicmVha3BvaW50LCB0YXJnZXRCcmVha3BvaW50LCByZXNwb25kVG9XaWR0aCwgdHJpZ2dlckJyZWFrcG9pbnQgPSBmYWxzZTtcclxuICAgICAgICB2YXIgc2xpZGVyV2lkdGggPSBfLiRzbGlkZXIud2lkdGgoKTtcclxuICAgICAgICB2YXIgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkKHdpbmRvdykud2lkdGgoKTtcclxuXHJcbiAgICAgICAgaWYgKF8ucmVzcG9uZFRvID09PSAnd2luZG93Jykge1xyXG4gICAgICAgICAgICByZXNwb25kVG9XaWR0aCA9IHdpbmRvd1dpZHRoO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoXy5yZXNwb25kVG8gPT09ICdzbGlkZXInKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbmRUb1dpZHRoID0gc2xpZGVyV2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIGlmIChfLnJlc3BvbmRUbyA9PT0gJ21pbicpIHtcclxuICAgICAgICAgICAgcmVzcG9uZFRvV2lkdGggPSBNYXRoLm1pbih3aW5kb3dXaWR0aCwgc2xpZGVyV2lkdGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBfLm9wdGlvbnMucmVzcG9uc2l2ZSAmJlxyXG4gICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZS5sZW5ndGggJiZcclxuICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUgIT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgZm9yIChicmVha3BvaW50IGluIF8uYnJlYWtwb2ludHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8ub3JpZ2luYWxTZXR0aW5ncy5tb2JpbGVGaXJzdCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbmRUb1dpZHRoIDwgXy5icmVha3BvaW50c1ticmVha3BvaW50XSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPiBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50ID0gXy5icmVha3BvaW50c1ticmVha3BvaW50XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRhcmdldEJyZWFrcG9pbnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGlmIChfLmFjdGl2ZUJyZWFrcG9pbnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0QnJlYWtwb2ludCAhPT0gXy5hY3RpdmVCcmVha3BvaW50IHx8IGZvcmNlVXBkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy51bnNsaWNrKHRhcmdldEJyZWFrcG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXy5hY3RpdmVCcmVha3BvaW50ID0gdGFyZ2V0QnJlYWtwb2ludDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfLnVuc2xpY2sodGFyZ2V0QnJlYWtwb2ludCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludFNldHRpbmdzW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnRdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXJCcmVha3BvaW50ID0gdGFyZ2V0QnJlYWtwb2ludDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChfLmFjdGl2ZUJyZWFrcG9pbnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucyA9IF8ub3JpZ2luYWxTZXR0aW5ncztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF8ucmVmcmVzaChpbml0aWFsKTtcclxuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIG9ubHkgdHJpZ2dlciBicmVha3BvaW50cyBkdXJpbmcgYW4gYWN0dWFsIGJyZWFrLiBub3Qgb24gaW5pdGlhbGl6ZS5cclxuICAgICAgICAgICAgaWYoICFpbml0aWFsICYmIHRyaWdnZXJCcmVha3BvaW50ICE9PSBmYWxzZSApIHtcclxuICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdicmVha3BvaW50JywgW18sIHRyaWdnZXJCcmVha3BvaW50XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuY2hhbmdlU2xpZGUgPSBmdW5jdGlvbihldmVudCwgZG9udEFuaW1hdGUpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxyXG4gICAgICAgICAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxyXG4gICAgICAgICAgICBpbmRleE9mZnNldCwgc2xpZGVPZmZzZXQsIHVuZXZlbk9mZnNldDtcclxuXHJcbiAgICAgICAgLy8gSWYgdGFyZ2V0IGlzIGEgbGluaywgcHJldmVudCBkZWZhdWx0IGFjdGlvbi5cclxuICAgICAgICBpZigkdGFyZ2V0LmlzKCdhJykpIHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRhcmdldCBpcyBub3QgdGhlIDxsaT4gZWxlbWVudCAoaWU6IGEgY2hpbGQpLCBmaW5kIHRoZSA8bGk+LlxyXG4gICAgICAgIGlmKCEkdGFyZ2V0LmlzKCdsaScpKSB7XHJcbiAgICAgICAgICAgICR0YXJnZXQgPSAkdGFyZ2V0LmNsb3Nlc3QoJ2xpJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1bmV2ZW5PZmZzZXQgPSAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKTtcclxuICAgICAgICBpbmRleE9mZnNldCA9IHVuZXZlbk9mZnNldCA/IDAgOiAoXy5zbGlkZUNvdW50IC0gXy5jdXJyZW50U2xpZGUpICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmRhdGEubWVzc2FnZSkge1xyXG5cclxuICAgICAgICAgICAgY2FzZSAncHJldmlvdXMnOlxyXG4gICAgICAgICAgICAgICAgc2xpZGVPZmZzZXQgPSBpbmRleE9mZnNldCA9PT0gMCA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSBpbmRleE9mZnNldDtcclxuICAgICAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgLSBzbGlkZU9mZnNldCwgZmFsc2UsIGRvbnRBbmltYXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSAnbmV4dCc6XHJcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldCA9IGluZGV4T2Zmc2V0ID09PSAwID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogaW5kZXhPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xyXG4gICAgICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlICsgc2xpZGVPZmZzZXQsIGZhbHNlLCBkb250QW5pbWF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ2luZGV4JzpcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGV2ZW50LmRhdGEuaW5kZXggPT09IDAgPyAwIDpcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5kYXRhLmluZGV4IHx8ICR0YXJnZXQuaW5kZXgoKSAqIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcclxuXHJcbiAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmNoZWNrTmF2aWdhYmxlKGluZGV4KSwgZmFsc2UsIGRvbnRBbmltYXRlKTtcclxuICAgICAgICAgICAgICAgICR0YXJnZXQuY2hpbGRyZW4oKS50cmlnZ2VyKCdmb2N1cycpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5jaGVja05hdmlnYWJsZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcyxcclxuICAgICAgICAgICAgbmF2aWdhYmxlcywgcHJldk5hdmlnYWJsZTtcclxuXHJcbiAgICAgICAgbmF2aWdhYmxlcyA9IF8uZ2V0TmF2aWdhYmxlSW5kZXhlcygpO1xyXG4gICAgICAgIHByZXZOYXZpZ2FibGUgPSAwO1xyXG4gICAgICAgIGlmIChpbmRleCA+IG5hdmlnYWJsZXNbbmF2aWdhYmxlcy5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICBpbmRleCA9IG5hdmlnYWJsZXNbbmF2aWdhYmxlcy5sZW5ndGggLSAxXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBuIGluIG5hdmlnYWJsZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IG5hdmlnYWJsZXNbbl0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IHByZXZOYXZpZ2FibGU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwcmV2TmF2aWdhYmxlID0gbmF2aWdhYmxlc1tuXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGluZGV4O1xyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZG90cyAmJiBfLiRkb3RzICE9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICAkKCdsaScsIF8uJGRvdHMpLm9mZignY2xpY2suc2xpY2snLCBfLmNoYW5nZVNsaWRlKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucGF1c2VPbkRvdHNIb3ZlciA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCdsaScsIF8uJGRvdHMpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9mZignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5zZXRQYXVzZWQsIF8sIHRydWUpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vZmYoJ21vdXNlbGVhdmUuc2xpY2snLCAkLnByb3h5KF8uc2V0UGF1c2VkLCBfLCBmYWxzZSkpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcclxuICAgICAgICAgICAgXy4kcHJldkFycm93ICYmIF8uJHByZXZBcnJvdy5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jaGFuZ2VTbGlkZSk7XHJcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdyAmJiBfLiRuZXh0QXJyb3cub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNoc3RhcnQuc2xpY2sgbW91c2Vkb3duLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xyXG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaG1vdmUuc2xpY2sgbW91c2Vtb3ZlLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xyXG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaGVuZC5zbGljayBtb3VzZXVwLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xyXG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaGNhbmNlbC5zbGljayBtb3VzZWxlYXZlLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xyXG5cclxuICAgICAgICBfLiRsaXN0Lm9mZignY2xpY2suc2xpY2snLCBfLmNsaWNrSGFuZGxlcik7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9mZihfLnZpc2liaWxpdHlDaGFuZ2UsIF8udmlzaWJpbGl0eSk7XHJcblxyXG4gICAgICAgIF8uJGxpc3Qub2ZmKCdtb3VzZWVudGVyLnNsaWNrJywgJC5wcm94eShfLnNldFBhdXNlZCwgXywgdHJ1ZSkpO1xyXG4gICAgICAgIF8uJGxpc3Qub2ZmKCdtb3VzZWxlYXZlLnNsaWNrJywgJC5wcm94eShfLnNldFBhdXNlZCwgXywgZmFsc2UpKTtcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIF8uJGxpc3Qub2ZmKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAkKF8uJHNsaWRlVHJhY2spLmNoaWxkcmVuKCkub2ZmKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKHdpbmRvdykub2ZmKCdvcmllbnRhdGlvbmNoYW5nZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5vcmllbnRhdGlvbkNoYW5nZSk7XHJcblxyXG4gICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5yZXNpemUpO1xyXG5cclxuICAgICAgICAkKCdbZHJhZ2dhYmxlIT10cnVlXScsIF8uJHNsaWRlVHJhY2spLm9mZignZHJhZ3N0YXJ0JywgXy5wcmV2ZW50RGVmYXVsdCk7XHJcblxyXG4gICAgICAgICQod2luZG93KS5vZmYoJ2xvYWQuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8uc2V0UG9zaXRpb24pO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm9mZigncmVhZHkuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8uc2V0UG9zaXRpb24pO1xyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcFJvd3MgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzLCBvcmlnaW5hbFNsaWRlcztcclxuXHJcbiAgICAgICAgaWYoXy5vcHRpb25zLnJvd3MgPiAxKSB7XHJcbiAgICAgICAgICAgIG9yaWdpbmFsU2xpZGVzID0gXy4kc2xpZGVzLmNoaWxkcmVuKCkuY2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgb3JpZ2luYWxTbGlkZXMucmVtb3ZlQXR0cignc3R5bGUnKTtcclxuICAgICAgICAgICAgXy4kc2xpZGVyLmh0bWwob3JpZ2luYWxTbGlkZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGlja0hhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmIChfLnNob3VsZENsaWNrID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihyZWZyZXNoKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XHJcblxyXG4gICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcclxuXHJcbiAgICAgICAgXy5jbGVhblVwRXZlbnRzKCk7XHJcblxyXG4gICAgICAgICQoJy5zbGljay1jbG9uZWQnLCBfLiRzbGlkZXIpLmRldGFjaCgpO1xyXG5cclxuICAgICAgICBpZiAoXy4kZG90cykge1xyXG4gICAgICAgICAgICBfLiRkb3RzLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGlmICggXy4kcHJldkFycm93ICYmIF8uJHByZXZBcnJvdy5sZW5ndGggKSB7XHJcblxyXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3dcclxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQgc2xpY2stYXJyb3cgc2xpY2staGlkZGVuJylcclxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiBhcmlhLWRpc2FibGVkIHRhYmluZGV4JylcclxuICAgICAgICAgICAgICAgIC5jc3MoXCJkaXNwbGF5XCIsXCJcIik7XHJcblxyXG4gICAgICAgICAgICBpZiAoIF8uaHRtbEV4cHIudGVzdCggXy5vcHRpb25zLnByZXZBcnJvdyApKSB7XHJcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggXy4kbmV4dEFycm93ICYmIF8uJG5leHRBcnJvdy5sZW5ndGggKSB7XHJcblxyXG4gICAgICAgICAgICBfLiRuZXh0QXJyb3dcclxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQgc2xpY2stYXJyb3cgc2xpY2staGlkZGVuJylcclxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiBhcmlhLWRpc2FibGVkIHRhYmluZGV4JylcclxuICAgICAgICAgICAgICAgIC5jc3MoXCJkaXNwbGF5XCIsXCJcIik7XHJcblxyXG4gICAgICAgICAgICBpZiAoIF8uaHRtbEV4cHIudGVzdCggXy5vcHRpb25zLm5leHRBcnJvdyApKSB7XHJcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgaWYgKF8uJHNsaWRlcykge1xyXG5cclxuICAgICAgICAgICAgXy4kc2xpZGVzXHJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLXNsaWRlIHNsaWNrLWFjdGl2ZSBzbGljay1jZW50ZXIgc2xpY2stdmlzaWJsZSBzbGljay1jdXJyZW50JylcclxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbicpXHJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1zbGljay1pbmRleCcpXHJcbiAgICAgICAgICAgICAgICAuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYXR0cignc3R5bGUnLCAkKHRoaXMpLmRhdGEoJ29yaWdpbmFsU3R5bGluZycpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xyXG5cclxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5kZXRhY2goKTtcclxuXHJcbiAgICAgICAgICAgIF8uJGxpc3QuZGV0YWNoKCk7XHJcblxyXG4gICAgICAgICAgICBfLiRzbGlkZXIuYXBwZW5kKF8uJHNsaWRlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBfLmNsZWFuVXBSb3dzKCk7XHJcblxyXG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGVyJyk7XHJcbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1pbml0aWFsaXplZCcpO1xyXG5cclxuICAgICAgICBfLnVuc2xpY2tlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCFyZWZyZXNoKSB7XHJcbiAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdkZXN0cm95JywgW19dKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuZGlzYWJsZVRyYW5zaXRpb24gPSBmdW5jdGlvbihzbGlkZSkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXMsXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb24gPSB7fTtcclxuXHJcbiAgICAgICAgdHJhbnNpdGlvbltfLnRyYW5zaXRpb25UeXBlXSA9ICcnO1xyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZSkuY3NzKHRyYW5zaXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5mYWRlU2xpZGUgPSBmdW5jdGlvbihzbGlkZUluZGV4LCBjYWxsYmFjaykge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xyXG5cclxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXhcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXHJcbiAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZywgY2FsbGJhY2spO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgXy5hcHBseVRyYW5zaXRpb24oc2xpZGVJbmRleCk7XHJcblxyXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuY3NzKHtcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDEsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXhcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIF8uZGlzYWJsZVRyYW5zaXRpb24oc2xpZGVJbmRleCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcclxuICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmZhZGVTbGlkZU91dCA9IGZ1bmN0aW9uKHNsaWRlSW5kZXgpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAoXy5jc3NUcmFuc2l0aW9ucyA9PT0gZmFsc2UpIHtcclxuXHJcbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyXHJcbiAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZyk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBfLmFwcGx5VHJhbnNpdGlvbihzbGlkZUluZGV4KTtcclxuXHJcbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleCAtIDJcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5maWx0ZXJTbGlkZXMgPSBTbGljay5wcm90b3R5cGUuc2xpY2tGaWx0ZXIgPSBmdW5jdGlvbihmaWx0ZXIpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAoZmlsdGVyICE9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBfLnVubG9hZCgpO1xyXG5cclxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xyXG5cclxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuZmlsdGVyKGZpbHRlcikuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XHJcblxyXG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuZ2V0Q3VycmVudCA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0N1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIF8uY3VycmVudFNsaWRlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmdldERvdENvdW50ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIGJyZWFrUG9pbnQgPSAwO1xyXG4gICAgICAgIHZhciBjb3VudGVyID0gMDtcclxuICAgICAgICB2YXIgcGFnZXJRdHkgPSAwO1xyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHdoaWxlIChicmVha1BvaW50IDwgXy5zbGlkZUNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICArK3BhZ2VyUXR5O1xyXG4gICAgICAgICAgICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xyXG4gICAgICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHBhZ2VyUXR5ID0gXy5zbGlkZUNvdW50O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdoaWxlIChicmVha1BvaW50IDwgXy5zbGlkZUNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICArK3BhZ2VyUXR5O1xyXG4gICAgICAgICAgICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xyXG4gICAgICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwYWdlclF0eSAtIDE7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuZ2V0TGVmdCA9IGZ1bmN0aW9uKHNsaWRlSW5kZXgpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxyXG4gICAgICAgICAgICB0YXJnZXRMZWZ0LFxyXG4gICAgICAgICAgICB2ZXJ0aWNhbEhlaWdodCxcclxuICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAwLFxyXG4gICAgICAgICAgICB0YXJnZXRTbGlkZTtcclxuXHJcbiAgICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XHJcbiAgICAgICAgdmVydGljYWxIZWlnaHQgPSBfLiRzbGlkZXMuZmlyc3QoKS5vdXRlckhlaWdodCh0cnVlKTtcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xyXG4gICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IChfLnNsaWRlV2lkdGggKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAqIC0xO1xyXG4gICAgICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAodmVydGljYWxIZWlnaHQgKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAqIC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsID4gXy5zbGlkZUNvdW50ICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2xpZGVJbmRleCA+IF8uc2xpZGVDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gKChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gKHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpKSAqIF8uc2xpZGVXaWR0aCkgKiAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAoKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSAoc2xpZGVJbmRleCAtIF8uc2xpZGVDb3VudCkpICogdmVydGljYWxIZWlnaHQpICogLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSAqIF8uc2xpZGVXaWR0aCkgKiAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAoKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkgKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPiBfLnNsaWRlQ291bnQpIHtcclxuICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAtIF8uc2xpZGVDb3VudCkgKiBfLnNsaWRlV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIC0gXy5zbGlkZUNvdW50KSAqIHZlcnRpY2FsSGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcclxuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCArPSBfLnNsaWRlV2lkdGggKiBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKSAtIF8uc2xpZGVXaWR0aDtcclxuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ICs9IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9ICgoc2xpZGVJbmRleCAqIF8uc2xpZGVXaWR0aCkgKiAtMSkgKyBfLnNsaWRlT2Zmc2V0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAoKHNsaWRlSW5kZXggKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMSkgKyB2ZXJ0aWNhbE9mZnNldDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93IHx8IF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IHRhcmdldFNsaWRlWzBdID8gdGFyZ2V0U2xpZGVbMF0ub2Zmc2V0TGVmdCAqIC0xIDogMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93IHx8IF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gdGFyZ2V0U2xpZGVbMF0gPyB0YXJnZXRTbGlkZVswXS5vZmZzZXRMZWZ0ICogLTEgOiAwO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCArPSAoXy4kbGlzdC53aWR0aCgpIC0gdGFyZ2V0U2xpZGUub3V0ZXJXaWR0aCgpKSAvIDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0YXJnZXRMZWZ0O1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmdldE9wdGlvbiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0dldE9wdGlvbiA9IGZ1bmN0aW9uKG9wdGlvbikge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiBfLm9wdGlvbnNbb3B0aW9uXTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXROYXZpZ2FibGVJbmRleGVzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcyxcclxuICAgICAgICAgICAgYnJlYWtQb2ludCA9IDAsXHJcbiAgICAgICAgICAgIGNvdW50ZXIgPSAwLFxyXG4gICAgICAgICAgICBpbmRleGVzID0gW10sXHJcbiAgICAgICAgICAgIG1heDtcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgbWF4ID0gXy5zbGlkZUNvdW50O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgKiAtMTtcclxuICAgICAgICAgICAgY291bnRlciA9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAqIC0xO1xyXG4gICAgICAgICAgICBtYXggPSBfLnNsaWRlQ291bnQgKiAyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2hpbGUgKGJyZWFrUG9pbnQgPCBtYXgpIHtcclxuICAgICAgICAgICAgaW5kZXhlcy5wdXNoKGJyZWFrUG9pbnQpO1xyXG4gICAgICAgICAgICBicmVha1BvaW50ID0gY291bnRlciArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcclxuICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaW5kZXhlcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRTbGljayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRTbGlkZUNvdW50ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcyxcclxuICAgICAgICAgICAgc2xpZGVzVHJhdmVyc2VkLCBzd2lwZWRTbGlkZSwgY2VudGVyT2Zmc2V0O1xyXG5cclxuICAgICAgICBjZW50ZXJPZmZzZXQgPSBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSA/IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpIDogMDtcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stc2xpZGUnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBzbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlLm9mZnNldExlZnQgLSBjZW50ZXJPZmZzZXQgKyAoJChzbGlkZSkub3V0ZXJXaWR0aCgpIC8gMikgPiAoXy5zd2lwZUxlZnQgKiAtMSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2lwZWRTbGlkZSA9IHNsaWRlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzbGlkZXNUcmF2ZXJzZWQgPSBNYXRoLmFicygkKHN3aXBlZFNsaWRlKS5hdHRyKCdkYXRhLXNsaWNrLWluZGV4JykgLSBfLmN1cnJlbnRTbGlkZSkgfHwgMTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzbGlkZXNUcmF2ZXJzZWQ7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmdvVG8gPSBTbGljay5wcm90b3R5cGUuc2xpY2tHb1RvID0gZnVuY3Rpb24oc2xpZGUsIGRvbnRBbmltYXRlKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdpbmRleCcsXHJcbiAgICAgICAgICAgICAgICBpbmRleDogcGFyc2VJbnQoc2xpZGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCBkb250QW5pbWF0ZSk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGNyZWF0aW9uKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKCEkKF8uJHNsaWRlcikuaGFzQ2xhc3MoJ3NsaWNrLWluaXRpYWxpemVkJykpIHtcclxuXHJcbiAgICAgICAgICAgICQoXy4kc2xpZGVyKS5hZGRDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKTtcclxuXHJcbiAgICAgICAgICAgIF8uYnVpbGRSb3dzKCk7XHJcbiAgICAgICAgICAgIF8uYnVpbGRPdXQoKTtcclxuICAgICAgICAgICAgXy5zZXRQcm9wcygpO1xyXG4gICAgICAgICAgICBfLnN0YXJ0TG9hZCgpO1xyXG4gICAgICAgICAgICBfLmxvYWRTbGlkZXIoKTtcclxuICAgICAgICAgICAgXy5pbml0aWFsaXplRXZlbnRzKCk7XHJcbiAgICAgICAgICAgIF8udXBkYXRlQXJyb3dzKCk7XHJcbiAgICAgICAgICAgIF8udXBkYXRlRG90cygpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjcmVhdGlvbikge1xyXG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignaW5pdCcsIFtfXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgXy5pbml0QURBKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRBcnJvd0V2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcclxuICAgICAgICAgICAgXy4kcHJldkFycm93Lm9uKCdjbGljay5zbGljaycsIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cydcclxuICAgICAgICAgICAgfSwgXy5jaGFuZ2VTbGlkZSk7XHJcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5vbignY2xpY2suc2xpY2snLCB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcclxuICAgICAgICAgICAgfSwgXy5jaGFuZ2VTbGlkZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXREb3RFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xyXG4gICAgICAgICAgICAkKCdsaScsIF8uJGRvdHMpLm9uKCdjbGljay5zbGljaycsIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdpbmRleCdcclxuICAgICAgICAgICAgfSwgXy5jaGFuZ2VTbGlkZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5vcHRpb25zLnBhdXNlT25Eb3RzSG92ZXIgPT09IHRydWUgJiYgXy5vcHRpb25zLmF1dG9wbGF5ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICQoJ2xpJywgXy4kZG90cylcclxuICAgICAgICAgICAgICAgIC5vbignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5zZXRQYXVzZWQsIF8sIHRydWUpKVxyXG4gICAgICAgICAgICAgICAgLm9uKCdtb3VzZWxlYXZlLnNsaWNrJywgJC5wcm94eShfLnNldFBhdXNlZCwgXywgZmFsc2UpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuaW5pdGlhbGl6ZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIF8uaW5pdEFycm93RXZlbnRzKCk7XHJcblxyXG4gICAgICAgIF8uaW5pdERvdEV2ZW50cygpO1xyXG5cclxuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaHN0YXJ0LnNsaWNrIG1vdXNlZG93bi5zbGljaycsIHtcclxuICAgICAgICAgICAgYWN0aW9uOiAnc3RhcnQnXHJcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xyXG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNobW92ZS5zbGljayBtb3VzZW1vdmUuc2xpY2snLCB7XHJcbiAgICAgICAgICAgIGFjdGlvbjogJ21vdmUnXHJcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xyXG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNoZW5kLnNsaWNrIG1vdXNldXAuc2xpY2snLCB7XHJcbiAgICAgICAgICAgIGFjdGlvbjogJ2VuZCdcclxuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XHJcbiAgICAgICAgXy4kbGlzdC5vbigndG91Y2hjYW5jZWwuc2xpY2sgbW91c2VsZWF2ZS5zbGljaycsIHtcclxuICAgICAgICAgICAgYWN0aW9uOiAnZW5kJ1xyXG4gICAgICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgXy4kbGlzdC5vbignY2xpY2suc2xpY2snLCBfLmNsaWNrSGFuZGxlcik7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKF8udmlzaWJpbGl0eUNoYW5nZSwgJC5wcm94eShfLnZpc2liaWxpdHksIF8pKTtcclxuXHJcbiAgICAgICAgXy4kbGlzdC5vbignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5zZXRQYXVzZWQsIF8sIHRydWUpKTtcclxuICAgICAgICBfLiRsaXN0Lm9uKCdtb3VzZWxlYXZlLnNsaWNrJywgJC5wcm94eShfLnNldFBhdXNlZCwgXywgZmFsc2UpKTtcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIF8uJGxpc3Qub24oJ2tleWRvd24uc2xpY2snLCBfLmtleUhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mb2N1c09uU2VsZWN0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICQoXy4kc2xpZGVUcmFjaykuY2hpbGRyZW4oKS5vbignY2xpY2suc2xpY2snLCBfLnNlbGVjdEhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdvcmllbnRhdGlvbmNoYW5nZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgJC5wcm94eShfLm9yaWVudGF0aW9uQ2hhbmdlLCBfKSk7XHJcblxyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCAkLnByb3h5KF8ucmVzaXplLCBfKSk7XHJcblxyXG4gICAgICAgICQoJ1tkcmFnZ2FibGUhPXRydWVdJywgXy4kc2xpZGVUcmFjaykub24oJ2RyYWdzdGFydCcsIF8ucHJldmVudERlZmF1bHQpO1xyXG5cclxuICAgICAgICAkKHdpbmRvdykub24oJ2xvYWQuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8uc2V0UG9zaXRpb24pO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdyZWFkeS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuaW5pdFVJID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xyXG5cclxuICAgICAgICAgICAgXy4kcHJldkFycm93LnNob3coKTtcclxuICAgICAgICAgICAgXy4kbmV4dEFycm93LnNob3coKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xyXG5cclxuICAgICAgICAgICAgXy4kZG90cy5zaG93KCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hdXRvcGxheSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUua2V5SGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuICAgICAgICAgLy9Eb250IHNsaWRlIGlmIHRoZSBjdXJzb3IgaXMgaW5zaWRlIHRoZSBmb3JtIGZpZWxkcyBhbmQgYXJyb3cga2V5cyBhcmUgcHJlc3NlZFxyXG4gICAgICAgIGlmKCFldmVudC50YXJnZXQudGFnTmFtZS5tYXRjaCgnVEVYVEFSRUF8SU5QVVR8U0VMRUNUJykpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM3ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBfLmNoYW5nZVNsaWRlKHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cydcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSAzOSAmJiBfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5sYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXMsXHJcbiAgICAgICAgICAgIGxvYWRSYW5nZSwgY2xvbmVSYW5nZSwgcmFuZ2VTdGFydCwgcmFuZ2VFbmQ7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRJbWFnZXMoaW1hZ2VzU2NvcGUpIHtcclxuICAgICAgICAgICAgJCgnaW1nW2RhdGEtbGF6eV0nLCBpbWFnZXNTY29wZSkuZWFjaChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlU291cmNlID0gJCh0aGlzKS5hdHRyKCdkYXRhLWxhenknKSxcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cclxuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgb3BhY2l0eTogMCB9LCAxMDAsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3JjJywgaW1hZ2VTb3VyY2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sIDIwMCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1sYXp5JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQuc3JjID0gaW1hZ2VTb3VyY2U7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5jdXJyZW50U2xpZGUgKyAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKTtcclxuICAgICAgICAgICAgICAgIHJhbmdlRW5kID0gcmFuZ2VTdGFydCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmFuZ2VTdGFydCA9IE1hdGgubWF4KDAsIF8uY3VycmVudFNsaWRlIC0gKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyICsgMSkpO1xyXG4gICAgICAgICAgICAgICAgcmFuZ2VFbmQgPSAyICsgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyICsgMSkgKyBfLmN1cnJlbnRTbGlkZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJhbmdlU3RhcnQgPSBfLm9wdGlvbnMuaW5maW5pdGUgPyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgXy5jdXJyZW50U2xpZGUgOiBfLmN1cnJlbnRTbGlkZTtcclxuICAgICAgICAgICAgcmFuZ2VFbmQgPSByYW5nZVN0YXJ0ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcclxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VTdGFydCA+IDApIHJhbmdlU3RhcnQtLTtcclxuICAgICAgICAgICAgICAgIGlmIChyYW5nZUVuZCA8PSBfLnNsaWRlQ291bnQpIHJhbmdlRW5kKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxvYWRSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKS5zbGljZShyYW5nZVN0YXJ0LCByYW5nZUVuZCk7XHJcbiAgICAgICAgbG9hZEltYWdlcyhsb2FkUmFuZ2UpO1xyXG5cclxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcclxuICAgICAgICAgICAgY2xvbmVSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKTtcclxuICAgICAgICAgICAgbG9hZEltYWdlcyhjbG9uZVJhbmdlKTtcclxuICAgICAgICB9IGVsc2VcclxuICAgICAgICBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xyXG4gICAgICAgICAgICBjbG9uZVJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1jbG9uZWQnKS5zbGljZSgwLCBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcclxuICAgICAgICAgICAgbG9hZEltYWdlcyhjbG9uZVJhbmdlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKF8uY3VycmVudFNsaWRlID09PSAwKSB7XHJcbiAgICAgICAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLWNsb25lZCcpLnNsaWNlKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKiAtMSk7XHJcbiAgICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmxvYWRTbGlkZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHtcclxuICAgICAgICAgICAgb3BhY2l0eTogMVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKTtcclxuXHJcbiAgICAgICAgXy5pbml0VUkoKTtcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5sYXp5TG9hZCA9PT0gJ3Byb2dyZXNzaXZlJykge1xyXG4gICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUubmV4dCA9IFNsaWNrLnByb3RvdHlwZS5zbGlja05leHQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICBfLmNoYW5nZVNsaWRlKHtcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ25leHQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5vcmllbnRhdGlvbkNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIF8uY2hlY2tSZXNwb25zaXZlKCk7XHJcbiAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnBhdXNlID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUGF1c2UgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICBfLmF1dG9QbGF5Q2xlYXIoKTtcclxuICAgICAgICBfLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUucGxheSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1BsYXkgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICBfLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgIF8uYXV0b1BsYXkoKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5wb3N0U2xpZGUgPSBmdW5jdGlvbihpbmRleCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdhZnRlckNoYW5nZScsIFtfLCBpbmRleF0pO1xyXG5cclxuICAgICAgICBfLmFuaW1hdGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgIF8uc3dpcGVMZWZ0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hdXRvcGxheSA9PT0gdHJ1ZSAmJiBfLnBhdXNlZCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgXy5pbml0QURBKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnByZXYgPSBTbGljay5wcm90b3R5cGUuc2xpY2tQcmV2ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUucHJvZ3Jlc3NpdmVMYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXMsXHJcbiAgICAgICAgICAgIGltZ0NvdW50LCB0YXJnZXRJbWFnZTtcclxuXHJcbiAgICAgICAgaW1nQ291bnQgPSAkKCdpbWdbZGF0YS1sYXp5XScsIF8uJHNsaWRlcikubGVuZ3RoO1xyXG5cclxuICAgICAgICBpZiAoaW1nQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIHRhcmdldEltYWdlID0gJCgnaW1nW2RhdGEtbGF6eV0nLCBfLiRzbGlkZXIpLmZpcnN0KCk7XHJcbiAgICAgICAgICAgIHRhcmdldEltYWdlLmF0dHIoJ3NyYycsIG51bGwpO1xyXG4gICAgICAgICAgICB0YXJnZXRJbWFnZS5hdHRyKCdzcmMnLCB0YXJnZXRJbWFnZS5hdHRyKCdkYXRhLWxhenknKSkucmVtb3ZlQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKS5sb2FkKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEltYWdlLnJlbW92ZUF0dHIoJ2RhdGEtbGF6eScpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uc2V0UG9zaXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEltYWdlLnJlbW92ZUF0dHIoJ2RhdGEtbGF6eScpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiggaW5pdGlhbGl6aW5nICkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXMsIGN1cnJlbnRTbGlkZSwgZmlyc3RWaXNpYmxlO1xyXG5cclxuICAgICAgICBmaXJzdFZpc2libGUgPSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xyXG5cclxuICAgICAgICAvLyBjaGVjayB0aGF0IHRoZSBuZXcgYnJlYWtwb2ludCBjYW4gYWN0dWFsbHkgYWNjZXB0IHRoZVxyXG4gICAgICAgIC8vIFwiY3VycmVudCBzbGlkZVwiIGFzIHRoZSBjdXJyZW50IHNsaWRlLCBvdGhlcndpc2Ugd2UgbmVlZFxyXG4gICAgICAgIC8vIHRvIHNldCBpdCB0byB0aGUgY2xvc2VzdCBwb3NzaWJsZSB2YWx1ZS5cclxuICAgICAgICBpZiAoICFfLm9wdGlvbnMuaW5maW5pdGUgKSB7XHJcbiAgICAgICAgICAgIGlmICggXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKSB7XHJcbiAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIF8uY3VycmVudFNsaWRlID4gZmlyc3RWaXNpYmxlICkge1xyXG4gICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBmaXJzdFZpc2libGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICBjdXJyZW50U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcclxuXHJcbiAgICAgICAgXy5kZXN0cm95KHRydWUpO1xyXG5cclxuICAgICAgICAkLmV4dGVuZChfLCBfLmluaXRpYWxzLCB7IGN1cnJlbnRTbGlkZTogY3VycmVudFNsaWRlIH0pO1xyXG5cclxuICAgICAgICBfLmluaXQoKTtcclxuXHJcbiAgICAgICAgaWYoICFpbml0aWFsaXppbmcgKSB7XHJcblxyXG4gICAgICAgICAgICBfLmNoYW5nZVNsaWRlKHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnaW5kZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBjdXJyZW50U2xpZGVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUucmVnaXN0ZXJCcmVha3BvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXMsIGJyZWFrcG9pbnQsIGN1cnJlbnRCcmVha3BvaW50LCBsLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlU2V0dGluZ3MgPSBfLm9wdGlvbnMucmVzcG9uc2l2ZSB8fCBudWxsO1xyXG5cclxuICAgICAgICBpZiAoICQudHlwZShyZXNwb25zaXZlU2V0dGluZ3MpID09PSBcImFycmF5XCIgJiYgcmVzcG9uc2l2ZVNldHRpbmdzLmxlbmd0aCApIHtcclxuXHJcbiAgICAgICAgICAgIF8ucmVzcG9uZFRvID0gXy5vcHRpb25zLnJlc3BvbmRUbyB8fCAnd2luZG93JztcclxuXHJcbiAgICAgICAgICAgIGZvciAoIGJyZWFrcG9pbnQgaW4gcmVzcG9uc2l2ZVNldHRpbmdzICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGwgPSBfLmJyZWFrcG9pbnRzLmxlbmd0aC0xO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEJyZWFrcG9pbnQgPSByZXNwb25zaXZlU2V0dGluZ3NbYnJlYWtwb2ludF0uYnJlYWtwb2ludDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2l2ZVNldHRpbmdzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgYnJlYWtwb2ludHMgYW5kIGN1dCBvdXQgYW55IGV4aXN0aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb25lcyB3aXRoIHRoZSBzYW1lIGJyZWFrcG9pbnQgbnVtYmVyLCB3ZSBkb24ndCB3YW50IGR1cGVzLlxyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBsID49IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBfLmJyZWFrcG9pbnRzW2xdICYmIF8uYnJlYWtwb2ludHNbbF0gPT09IGN1cnJlbnRCcmVha3BvaW50ICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50cy5zcGxpY2UobCwxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsLS07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnB1c2goY3VycmVudEJyZWFrcG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludFNldHRpbmdzW2N1cnJlbnRCcmVha3BvaW50XSA9IHJlc3BvbnNpdmVTZXR0aW5nc1ticmVha3BvaW50XS5zZXR0aW5ncztcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICggXy5vcHRpb25zLm1vYmlsZUZpcnN0ICkgPyBhLWIgOiBiLWE7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUucmVpbml0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgXy4kc2xpZGVzID1cclxuICAgICAgICAgICAgXy4kc2xpZGVUcmFja1xyXG4gICAgICAgICAgICAgICAgLmNoaWxkcmVuKF8ub3B0aW9ucy5zbGlkZSlcclxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stc2xpZGUnKTtcclxuXHJcbiAgICAgICAgXy5zbGlkZUNvdW50ID0gXy4kc2xpZGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAmJiBfLmN1cnJlbnRTbGlkZSAhPT0gMCkge1xyXG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8uY3VycmVudFNsaWRlIC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XHJcbiAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF8ucmVnaXN0ZXJCcmVha3BvaW50cygpO1xyXG5cclxuICAgICAgICBfLnNldFByb3BzKCk7XHJcbiAgICAgICAgXy5zZXR1cEluZmluaXRlKCk7XHJcbiAgICAgICAgXy5idWlsZEFycm93cygpO1xyXG4gICAgICAgIF8udXBkYXRlQXJyb3dzKCk7XHJcbiAgICAgICAgXy5pbml0QXJyb3dFdmVudHMoKTtcclxuICAgICAgICBfLmJ1aWxkRG90cygpO1xyXG4gICAgICAgIF8udXBkYXRlRG90cygpO1xyXG4gICAgICAgIF8uaW5pdERvdEV2ZW50cygpO1xyXG5cclxuICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZShmYWxzZSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAkKF8uJHNsaWRlVHJhY2spLmNoaWxkcmVuKCkub24oJ2NsaWNrLnNsaWNrJywgXy5zZWxlY3RIYW5kbGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF8uc2V0U2xpZGVDbGFzc2VzKDApO1xyXG5cclxuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdyZUluaXQnLCBbX10pO1xyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmF1dG9wbGF5ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIF8uZm9jdXNIYW5kbGVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSAhPT0gXy53aW5kb3dXaWR0aCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoXy53aW5kb3dEZWxheSk7XHJcbiAgICAgICAgICAgIF8ud2luZG93RGVsYXkgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIF8ud2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcclxuICAgICAgICAgICAgICAgIF8uY2hlY2tSZXNwb25zaXZlKCk7XHJcbiAgICAgICAgICAgICAgICBpZiggIV8udW5zbGlja2VkICkgeyBfLnNldFBvc2l0aW9uKCk7IH1cclxuICAgICAgICAgICAgfSwgNTApO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnJlbW92ZVNsaWRlID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUmVtb3ZlID0gZnVuY3Rpb24oaW5kZXgsIHJlbW92ZUJlZm9yZSwgcmVtb3ZlQWxsKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICByZW1vdmVCZWZvcmUgPSBpbmRleDtcclxuICAgICAgICAgICAgaW5kZXggPSByZW1vdmVCZWZvcmUgPT09IHRydWUgPyAwIDogXy5zbGlkZUNvdW50IC0gMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbmRleCA9IHJlbW92ZUJlZm9yZSA9PT0gdHJ1ZSA/IC0taW5kZXggOiBpbmRleDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPCAxIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+IF8uc2xpZGVDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXy51bmxvYWQoKTtcclxuXHJcbiAgICAgICAgaWYgKHJlbW92ZUFsbCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCkucmVtb3ZlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmVxKGluZGV4KS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKTtcclxuXHJcbiAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xyXG5cclxuICAgICAgICBfLiRzbGlkZVRyYWNrLmFwcGVuZChfLiRzbGlkZXMpO1xyXG5cclxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcclxuXHJcbiAgICAgICAgXy5yZWluaXQoKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRDU1MgPSBmdW5jdGlvbihwb3NpdGlvbikge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXMsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fSxcclxuICAgICAgICAgICAgeCwgeTtcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgcG9zaXRpb24gPSAtcG9zaXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHggPSBfLnBvc2l0aW9uUHJvcCA9PSAnbGVmdCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xyXG4gICAgICAgIHkgPSBfLnBvc2l0aW9uUHJvcCA9PSAndG9wJyA/IE1hdGguY2VpbChwb3NpdGlvbikgKyAncHgnIDogJzBweCc7XHJcblxyXG4gICAgICAgIHBvc2l0aW9uUHJvcHNbXy5wb3NpdGlvblByb3BdID0gcG9zaXRpb247XHJcblxyXG4gICAgICAgIGlmIChfLnRyYW5zZm9ybXNFbmFibGVkID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwb3NpdGlvblByb3BzID0ge307XHJcbiAgICAgICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUoJyArIHggKyAnLCAnICsgeSArICcpJztcclxuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHBvc2l0aW9uUHJvcHMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUzZCgnICsgeCArICcsICcgKyB5ICsgJywgMHB4KSc7XHJcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXREaW1lbnNpb25zID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBfLiRsaXN0LmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogKCcwcHggJyArIF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBfLiRsaXN0LmhlaWdodChfLiRzbGlkZXMuZmlyc3QoKS5vdXRlckhlaWdodCh0cnVlKSAqIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xyXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIF8uJGxpc3QuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAoXy5vcHRpb25zLmNlbnRlclBhZGRpbmcgKyAnIDBweCcpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXy5saXN0V2lkdGggPSBfLiRsaXN0LndpZHRoKCk7XHJcbiAgICAgICAgXy5saXN0SGVpZ2h0ID0gXy4kbGlzdC5oZWlnaHQoKTtcclxuXHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlICYmIF8ub3B0aW9ucy52YXJpYWJsZVdpZHRoID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBfLnNsaWRlV2lkdGggPSBNYXRoLmNlaWwoXy5saXN0V2lkdGggLyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcclxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay53aWR0aChNYXRoLmNlaWwoKF8uc2xpZGVXaWR0aCAqIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmxlbmd0aCkpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLndpZHRoKDUwMDAgKiBfLnNsaWRlQ291bnQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIF8uc2xpZGVXaWR0aCA9IE1hdGguY2VpbChfLmxpc3RXaWR0aCk7XHJcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suaGVpZ2h0KE1hdGguY2VpbCgoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5sZW5ndGgpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgb2Zmc2V0ID0gXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJXaWR0aCh0cnVlKSAtIF8uJHNsaWRlcy5maXJzdCgpLndpZHRoKCk7XHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy52YXJpYWJsZVdpZHRoID09PSBmYWxzZSkgXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykud2lkdGgoXy5zbGlkZVdpZHRoIC0gb2Zmc2V0KTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRGYWRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcyxcclxuICAgICAgICAgICAgdGFyZ2V0TGVmdDtcclxuXHJcbiAgICAgICAgXy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IChfLnNsaWRlV2lkdGggKiBpbmRleCkgKiAtMTtcclxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICQoZWxlbWVudCkuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICAgICAgICAgICAgICByaWdodDogdGFyZ2V0TGVmdCxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMixcclxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoZWxlbWVudCkuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRMZWZ0LFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMCxcclxuICAgICAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyLFxyXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIF8uJHNsaWRlcy5lcShfLmN1cnJlbnRTbGlkZSkuY3NzKHtcclxuICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnNldEhlaWdodCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09PSAxICYmIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXRIZWlnaHQgPSBfLiRzbGlkZXMuZXEoXy5jdXJyZW50U2xpZGUpLm91dGVySGVpZ2h0KHRydWUpO1xyXG4gICAgICAgICAgICBfLiRsaXN0LmNzcygnaGVpZ2h0JywgdGFyZ2V0SGVpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuc2V0T3B0aW9uID0gU2xpY2sucHJvdG90eXBlLnNsaWNrU2V0T3B0aW9uID0gZnVuY3Rpb24ob3B0aW9uLCB2YWx1ZSwgcmVmcmVzaCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXMsIGwsIGl0ZW07XHJcblxyXG4gICAgICAgIGlmKCBvcHRpb24gPT09IFwicmVzcG9uc2l2ZVwiICYmICQudHlwZSh2YWx1ZSkgPT09IFwiYXJyYXlcIiApIHtcclxuICAgICAgICAgICAgZm9yICggaXRlbSBpbiB2YWx1ZSApIHtcclxuICAgICAgICAgICAgICAgIGlmKCAkLnR5cGUoIF8ub3B0aW9ucy5yZXNwb25zaXZlICkgIT09IFwiYXJyYXlcIiApIHtcclxuICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZSA9IFsgdmFsdWVbaXRlbV0gXTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbCA9IF8ub3B0aW9ucy5yZXNwb25zaXZlLmxlbmd0aC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgcmVzcG9uc2l2ZSBvYmplY3QgYW5kIHNwbGljZSBvdXQgZHVwbGljYXRlcy5cclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSggbCA+PSAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggXy5vcHRpb25zLnJlc3BvbnNpdmVbbF0uYnJlYWtwb2ludCA9PT0gdmFsdWVbaXRlbV0uYnJlYWtwb2ludCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlLnNwbGljZShsLDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGwtLTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUucHVzaCggdmFsdWVbaXRlbV0gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIF8ub3B0aW9uc1tvcHRpb25dID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocmVmcmVzaCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBfLnVubG9hZCgpO1xyXG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIF8uc2V0RGltZW5zaW9ucygpO1xyXG5cclxuICAgICAgICBfLnNldEhlaWdodCgpO1xyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIF8uc2V0Q1NTKF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIF8uc2V0RmFkZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ3NldFBvc2l0aW9uJywgW19dKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRQcm9wcyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXMsXHJcbiAgICAgICAgICAgIGJvZHlTdHlsZSA9IGRvY3VtZW50LmJvZHkuc3R5bGU7XHJcblxyXG4gICAgICAgIF8ucG9zaXRpb25Qcm9wID0gXy5vcHRpb25zLnZlcnRpY2FsID09PSB0cnVlID8gJ3RvcCcgOiAnbGVmdCc7XHJcblxyXG4gICAgICAgIGlmIChfLnBvc2l0aW9uUHJvcCA9PT0gJ3RvcCcpIHtcclxuICAgICAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay12ZXJ0aWNhbCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stdmVydGljYWwnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChib2R5U3R5bGUuV2Via2l0VHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgIGJvZHlTdHlsZS5Nb3pUcmFuc2l0aW9uICE9PSB1bmRlZmluZWQgfHxcclxuICAgICAgICAgICAgYm9keVN0eWxlLm1zVHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudXNlQ1NTID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBfLmNzc1RyYW5zaXRpb25zID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuZmFkZSApIHtcclxuICAgICAgICAgICAgaWYgKCB0eXBlb2YgXy5vcHRpb25zLnpJbmRleCA9PT0gJ251bWJlcicgKSB7XHJcbiAgICAgICAgICAgICAgICBpZiggXy5vcHRpb25zLnpJbmRleCA8IDMgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnpJbmRleCA9IDM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBfLm9wdGlvbnMuekluZGV4ID0gXy5kZWZhdWx0cy56SW5kZXg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChib2R5U3R5bGUuT1RyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAnT1RyYW5zZm9ybSc7XHJcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctby10cmFuc2Zvcm0nO1xyXG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ09UcmFuc2l0aW9uJztcclxuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZS5wZXJzcGVjdGl2ZVByb3BlcnR5ID09PSB1bmRlZmluZWQgJiYgYm9keVN0eWxlLndlYmtpdFBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJvZHlTdHlsZS5Nb3pUcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ01velRyYW5zZm9ybSc7XHJcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbW96LXRyYW5zZm9ybSc7XHJcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnTW96VHJhbnNpdGlvbic7XHJcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUucGVyc3BlY3RpdmVQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkICYmIGJvZHlTdHlsZS5Nb3pQZXJzcGVjdGl2ZSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChib2R5U3R5bGUud2Via2l0VHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICd3ZWJraXRUcmFuc2Zvcm0nO1xyXG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLXdlYmtpdC10cmFuc2Zvcm0nO1xyXG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ3dlYmtpdFRyYW5zaXRpb24nO1xyXG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLnBlcnNwZWN0aXZlUHJvcGVydHkgPT09IHVuZGVmaW5lZCAmJiBib2R5U3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYm9keVN0eWxlLm1zVHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICdtc1RyYW5zZm9ybSc7XHJcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbXMtdHJhbnNmb3JtJztcclxuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdtc1RyYW5zaXRpb24nO1xyXG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLm1zVHJhbnNmb3JtID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJvZHlTdHlsZS50cmFuc2Zvcm0gIT09IHVuZGVmaW5lZCAmJiBfLmFuaW1UeXBlICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ3RyYW5zZm9ybSc7XHJcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICd0cmFuc2Zvcm0nO1xyXG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ3RyYW5zaXRpb24nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBfLnRyYW5zZm9ybXNFbmFibGVkID0gXy5vcHRpb25zLnVzZVRyYW5zZm9ybSAmJiAoXy5hbmltVHlwZSAhPT0gbnVsbCAmJiBfLmFuaW1UeXBlICE9PSBmYWxzZSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuc2V0U2xpZGVDbGFzc2VzID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxyXG4gICAgICAgICAgICBjZW50ZXJPZmZzZXQsIGFsbFNsaWRlcywgaW5kZXhPZmZzZXQsIHJlbWFpbmRlcjtcclxuXHJcbiAgICAgICAgYWxsU2xpZGVzID0gXy4kc2xpZGVyXHJcbiAgICAgICAgICAgIC5maW5kKCcuc2xpY2stc2xpZGUnKVxyXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWFjdGl2ZSBzbGljay1jZW50ZXIgc2xpY2stY3VycmVudCcpXHJcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XHJcblxyXG4gICAgICAgIF8uJHNsaWRlc1xyXG4gICAgICAgICAgICAuZXEoaW5kZXgpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stY3VycmVudCcpO1xyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGNlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSBjZW50ZXJPZmZzZXQgJiYgaW5kZXggPD0gKF8uc2xpZGVDb3VudCAtIDEpIC0gY2VudGVyT2Zmc2V0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXggLSBjZW50ZXJPZmZzZXQsIGluZGV4ICsgY2VudGVyT2Zmc2V0ICsgMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbmRleE9mZnNldCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyBpbmRleDtcclxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4T2Zmc2V0IC0gY2VudGVyT2Zmc2V0ICsgMSwgaW5kZXhPZmZzZXQgKyBjZW50ZXJPZmZzZXQgKyAyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lcShhbGxTbGlkZXMubGVuZ3RoIC0gMSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stY2VudGVyJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA9PT0gXy5zbGlkZUNvdW50IC0gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmVxKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stY2VudGVyJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgXy4kc2xpZGVzXHJcbiAgICAgICAgICAgICAgICAuZXEoaW5kZXgpXHJcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPD0gKF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgXy4kc2xpZGVzXHJcbiAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4LCBpbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXHJcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbGxTbGlkZXMubGVuZ3RoIDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBhbGxTbGlkZXNcclxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIHJlbWFpbmRlciA9IF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XHJcbiAgICAgICAgICAgICAgICBpbmRleE9mZnNldCA9IF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSA/IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyBpbmRleCA6IGluZGV4O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAmJiAoXy5zbGlkZUNvdW50IC0gaW5kZXgpIDwgXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4T2Zmc2V0IC0gKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSByZW1haW5kZXIpLCBpbmRleE9mZnNldCArIHJlbWFpbmRlcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4T2Zmc2V0LCBpbmRleE9mZnNldCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMubGF6eUxvYWQgPT09ICdvbmRlbWFuZCcpIHtcclxuICAgICAgICAgICAgXy5sYXp5TG9hZCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXR1cEluZmluaXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcyxcclxuICAgICAgICAgICAgaSwgc2xpZGVJbmRleCwgaW5maW5pdGVDb3VudDtcclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIF8ub3B0aW9ucy5jZW50ZXJNb2RlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlICYmIF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xyXG5cclxuICAgICAgICAgICAgc2xpZGVJbmRleCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZmluaXRlQ291bnQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5maW5pdGVDb3VudCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gXy5zbGlkZUNvdW50OyBpID4gKF8uc2xpZGVDb3VudCAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZmluaXRlQ291bnQpOyBpIC09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZUluZGV4ID0gaSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkYXRhLXNsaWNrLWluZGV4Jywgc2xpZGVJbmRleCAtIF8uc2xpZGVDb3VudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnByZXBlbmRUbyhfLiRzbGlkZVRyYWNrKS5hZGRDbGFzcygnc2xpY2stY2xvbmVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5maW5pdGVDb3VudDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVJbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkYXRhLXNsaWNrLWluZGV4Jywgc2xpZGVJbmRleCArIF8uc2xpZGVDb3VudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLWNsb25lZCcpLmZpbmQoJ1tpZF0nKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYXR0cignaWQnLCAnJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFBhdXNlZCA9IGZ1bmN0aW9uKHBhdXNlZCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUgJiYgXy5vcHRpb25zLnBhdXNlT25Ib3ZlciA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBfLnBhdXNlZCA9IHBhdXNlZDtcclxuICAgICAgICAgICAgaWYgKCFwYXVzZWQpIHtcclxuICAgICAgICAgICAgICAgIF8uYXV0b1BsYXkoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuc2VsZWN0SGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIHRhcmdldEVsZW1lbnQgPVxyXG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuaXMoJy5zbGljay1zbGlkZScpID9cclxuICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KSA6XHJcbiAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkucGFyZW50cygnLnNsaWNrLXNsaWRlJyk7XHJcblxyXG4gICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KHRhcmdldEVsZW1lbnQuYXR0cignZGF0YS1zbGljay1pbmRleCcpKTtcclxuXHJcbiAgICAgICAgaWYgKCFpbmRleCkgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcclxuXHJcbiAgICAgICAgICAgIF8uc2V0U2xpZGVDbGFzc2VzKGluZGV4KTtcclxuICAgICAgICAgICAgXy5hc05hdkZvcihpbmRleCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBfLnNsaWRlSGFuZGxlcihpbmRleCk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuc2xpZGVIYW5kbGVyID0gZnVuY3Rpb24oaW5kZXgsIHN5bmMsIGRvbnRBbmltYXRlKSB7XHJcblxyXG4gICAgICAgIHZhciB0YXJnZXRTbGlkZSwgYW5pbVNsaWRlLCBvbGRTbGlkZSwgc2xpZGVMZWZ0LCB0YXJnZXRMZWZ0ID0gbnVsbCxcclxuICAgICAgICAgICAgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIHN5bmMgPSBzeW5jIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoXy5hbmltYXRpbmcgPT09IHRydWUgJiYgXy5vcHRpb25zLndhaXRGb3JBbmltYXRlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gdHJ1ZSAmJiBfLmN1cnJlbnRTbGlkZSA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzeW5jID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBfLmFzTmF2Rm9yKGluZGV4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRhcmdldFNsaWRlID0gaW5kZXg7XHJcbiAgICAgICAgdGFyZ2V0TGVmdCA9IF8uZ2V0TGVmdCh0YXJnZXRTbGlkZSk7XHJcbiAgICAgICAgc2xpZGVMZWZ0ID0gXy5nZXRMZWZ0KF8uY3VycmVudFNsaWRlKTtcclxuXHJcbiAgICAgICAgXy5jdXJyZW50TGVmdCA9IF8uc3dpcGVMZWZ0ID09PSBudWxsID8gc2xpZGVMZWZ0IDogXy5zd2lwZUxlZnQ7XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSAmJiAoaW5kZXggPCAwIHx8IGluZGV4ID4gXy5nZXREb3RDb3VudCgpICogXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSkge1xyXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUoc2xpZGVMZWZ0LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSAmJiAoaW5kZXggPCAwIHx8IGluZGV4ID4gKF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkpKSB7XHJcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy5jdXJyZW50U2xpZGU7XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBfLmFuaW1hdGVTbGlkZShzbGlkZUxlZnQsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmF1dG9wbGF5ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoXy5hdXRvUGxheVRpbWVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0YXJnZXRTbGlkZSA8IDApIHtcclxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gXy5zbGlkZUNvdW50IC0gKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSBfLnNsaWRlQ291bnQgKyB0YXJnZXRTbGlkZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0U2xpZGUgPj0gXy5zbGlkZUNvdW50KSB7XHJcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSB0YXJnZXRTbGlkZSAtIF8uc2xpZGVDb3VudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFuaW1TbGlkZSA9IHRhcmdldFNsaWRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXy5hbmltYXRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignYmVmb3JlQ2hhbmdlJywgW18sIF8uY3VycmVudFNsaWRlLCBhbmltU2xpZGVdKTtcclxuXHJcbiAgICAgICAgb2xkU2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcclxuICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IGFuaW1TbGlkZTtcclxuXHJcbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXMoXy5jdXJyZW50U2xpZGUpO1xyXG5cclxuICAgICAgICBfLnVwZGF0ZURvdHMoKTtcclxuICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgXy5mYWRlU2xpZGVPdXQob2xkU2xpZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIF8uZmFkZVNsaWRlKGFuaW1TbGlkZSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKGFuaW1TbGlkZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXy5hbmltYXRlSGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBfLmFuaW1hdGVTbGlkZSh0YXJnZXRMZWZ0LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKGFuaW1TbGlkZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIF8ucG9zdFNsaWRlKGFuaW1TbGlkZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnN0YXJ0TG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcclxuXHJcbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5oaWRlKCk7XHJcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5oaWRlKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcclxuXHJcbiAgICAgICAgICAgIF8uJGRvdHMuaGlkZSgpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF8uJHNsaWRlci5hZGRDbGFzcygnc2xpY2stbG9hZGluZycpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlRGlyZWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciB4RGlzdCwgeURpc3QsIHIsIHN3aXBlQW5nbGUsIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICB4RGlzdCA9IF8udG91Y2hPYmplY3Quc3RhcnRYIC0gXy50b3VjaE9iamVjdC5jdXJYO1xyXG4gICAgICAgIHlEaXN0ID0gXy50b3VjaE9iamVjdC5zdGFydFkgLSBfLnRvdWNoT2JqZWN0LmN1clk7XHJcbiAgICAgICAgciA9IE1hdGguYXRhbjIoeURpc3QsIHhEaXN0KTtcclxuXHJcbiAgICAgICAgc3dpcGVBbmdsZSA9IE1hdGgucm91bmQociAqIDE4MCAvIE1hdGguUEkpO1xyXG4gICAgICAgIGlmIChzd2lwZUFuZ2xlIDwgMCkge1xyXG4gICAgICAgICAgICBzd2lwZUFuZ2xlID0gMzYwIC0gTWF0aC5hYnMoc3dpcGVBbmdsZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPD0gNDUpICYmIChzd2lwZUFuZ2xlID49IDApKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAnbGVmdCcgOiAncmlnaHQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKChzd2lwZUFuZ2xlIDw9IDM2MCkgJiYgKHN3aXBlQW5nbGUgPj0gMzE1KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gJ2xlZnQnIDogJ3JpZ2h0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgoc3dpcGVBbmdsZSA+PSAxMzUpICYmIChzd2lwZUFuZ2xlIDw9IDIyNSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/ICdyaWdodCcgOiAnbGVmdCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPj0gMzUpICYmIChzd2lwZUFuZ2xlIDw9IDEzNSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnbGVmdCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3JpZ2h0JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICd2ZXJ0aWNhbCc7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVFbmQgPSBmdW5jdGlvbihldmVudCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXMsXHJcbiAgICAgICAgICAgIHNsaWRlQ291bnQ7XHJcblxyXG4gICAgICAgIF8uZHJhZ2dpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgXy5zaG91bGRDbGljayA9IChfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID4gMTApID8gZmFsc2UgOiB0cnVlO1xyXG5cclxuICAgICAgICBpZiAoXy50b3VjaE9iamVjdC5jdXJYID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF8udG91Y2hPYmplY3QuZWRnZUhpdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignZWRnZScsIFtfLCBfLnN3aXBlRGlyZWN0aW9uKCldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID49IF8udG91Y2hPYmplY3QubWluU3dpcGUpIHtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAoXy5zd2lwZURpcmVjdGlvbigpKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZUNvdW50ID0gXy5vcHRpb25zLnN3aXBlVG9TbGlkZSA/IF8uY2hlY2tOYXZpZ2FibGUoXy5jdXJyZW50U2xpZGUgKyBfLmdldFNsaWRlQ291bnQoKSkgOiBfLmN1cnJlbnRTbGlkZSArIF8uZ2V0U2xpZGVDb3VudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKHNsaWRlQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8uY3VycmVudERpcmVjdGlvbiA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdzd2lwZScsIFtfLCAnbGVmdCddKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVDb3VudCA9IF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPyBfLmNoZWNrTmF2aWdhYmxlKF8uY3VycmVudFNsaWRlIC0gXy5nZXRTbGlkZUNvdW50KCkpIDogXy5jdXJyZW50U2xpZGUgLSBfLmdldFNsaWRlQ291bnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihzbGlkZUNvdW50KTtcclxuICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnREaXJlY3Rpb24gPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignc3dpcGUnLCBbXywgJ3JpZ2h0J10pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKF8udG91Y2hPYmplY3Quc3RhcnRYICE9PSBfLnRvdWNoT2JqZWN0LmN1clgpIHtcclxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlKTtcclxuICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZUhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICgoXy5vcHRpb25zLnN3aXBlID09PSBmYWxzZSkgfHwgKCdvbnRvdWNoZW5kJyBpbiBkb2N1bWVudCAmJiBfLm9wdGlvbnMuc3dpcGUgPT09IGZhbHNlKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuZHJhZ2dhYmxlID09PSBmYWxzZSAmJiBldmVudC50eXBlLmluZGV4T2YoJ21vdXNlJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF8udG91Y2hPYmplY3QuZmluZ2VyQ291bnQgPSBldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyAhPT0gdW5kZWZpbmVkID9cclxuICAgICAgICAgICAgZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzLmxlbmd0aCA6IDE7XHJcblxyXG4gICAgICAgIF8udG91Y2hPYmplY3QubWluU3dpcGUgPSBfLmxpc3RXaWR0aCAvIF8ub3B0aW9uc1xyXG4gICAgICAgICAgICAudG91Y2hUaHJlc2hvbGQ7XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIF8udG91Y2hPYmplY3QubWluU3dpcGUgPSBfLmxpc3RIZWlnaHQgLyBfLm9wdGlvbnNcclxuICAgICAgICAgICAgICAgIC50b3VjaFRocmVzaG9sZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQuZGF0YS5hY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ3N0YXJ0JzpcclxuICAgICAgICAgICAgICAgIF8uc3dpcGVTdGFydChldmVudCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ21vdmUnOlxyXG4gICAgICAgICAgICAgICAgXy5zd2lwZU1vdmUoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlICdlbmQnOlxyXG4gICAgICAgICAgICAgICAgXy5zd2lwZUVuZChldmVudCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlTW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcyxcclxuICAgICAgICAgICAgZWRnZVdhc0hpdCA9IGZhbHNlLFxyXG4gICAgICAgICAgICBjdXJMZWZ0LCBzd2lwZURpcmVjdGlvbiwgc3dpcGVMZW5ndGgsIHBvc2l0aW9uT2Zmc2V0LCB0b3VjaGVzO1xyXG5cclxuICAgICAgICB0b3VjaGVzID0gZXZlbnQub3JpZ2luYWxFdmVudCAhPT0gdW5kZWZpbmVkID8gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzIDogbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKCFfLmRyYWdnaW5nIHx8IHRvdWNoZXMgJiYgdG91Y2hlcy5sZW5ndGggIT09IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3VyTGVmdCA9IF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSk7XHJcblxyXG4gICAgICAgIF8udG91Y2hPYmplY3QuY3VyWCA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXNbMF0ucGFnZVggOiBldmVudC5jbGllbnRYO1xyXG4gICAgICAgIF8udG91Y2hPYmplY3QuY3VyWSA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXNbMF0ucGFnZVkgOiBldmVudC5jbGllbnRZO1xyXG5cclxuICAgICAgICBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID0gTWF0aC5yb3VuZChNYXRoLnNxcnQoXHJcbiAgICAgICAgICAgIE1hdGgucG93KF8udG91Y2hPYmplY3QuY3VyWCAtIF8udG91Y2hPYmplY3Quc3RhcnRYLCAyKSkpO1xyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID0gTWF0aC5yb3VuZChNYXRoLnNxcnQoXHJcbiAgICAgICAgICAgICAgICBNYXRoLnBvdyhfLnRvdWNoT2JqZWN0LmN1clkgLSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSwgMikpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN3aXBlRGlyZWN0aW9uID0gXy5zd2lwZURpcmVjdGlvbigpO1xyXG5cclxuICAgICAgICBpZiAoc3dpcGVEaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID4gNCkge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcG9zaXRpb25PZmZzZXQgPSAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAxIDogLTEpICogKF8udG91Y2hPYmplY3QuY3VyWCA+IF8udG91Y2hPYmplY3Quc3RhcnRYID8gMSA6IC0xKTtcclxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBwb3NpdGlvbk9mZnNldCA9IF8udG91Y2hPYmplY3QuY3VyWSA+IF8udG91Y2hPYmplY3Quc3RhcnRZID8gMSA6IC0xO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHN3aXBlTGVuZ3RoID0gXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aDtcclxuXHJcbiAgICAgICAgXy50b3VjaE9iamVjdC5lZGdlSGl0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgPT09IDAgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdyaWdodCcpIHx8IChfLmN1cnJlbnRTbGlkZSA+PSBfLmdldERvdENvdW50KCkgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdsZWZ0JykpIHtcclxuICAgICAgICAgICAgICAgIHN3aXBlTGVuZ3RoID0gXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCAqIF8ub3B0aW9ucy5lZGdlRnJpY3Rpb247XHJcbiAgICAgICAgICAgICAgICBfLnRvdWNoT2JqZWN0LmVkZ2VIaXQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyBzd2lwZUxlbmd0aCAqIHBvc2l0aW9uT2Zmc2V0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gY3VyTGVmdCArIChzd2lwZUxlbmd0aCAqIChfLiRsaXN0LmhlaWdodCgpIC8gXy5saXN0V2lkdGgpKSAqIHBvc2l0aW9uT2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyBzd2lwZUxlbmd0aCAqIHBvc2l0aW9uT2Zmc2V0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlIHx8IF8ub3B0aW9ucy50b3VjaE1vdmUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLmFuaW1hdGluZyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IG51bGw7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF8uc2V0Q1NTKF8uc3dpcGVMZWZ0KTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZVN0YXJ0ID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxyXG4gICAgICAgICAgICB0b3VjaGVzO1xyXG5cclxuICAgICAgICBpZiAoXy50b3VjaE9iamVjdC5maW5nZXJDb3VudCAhPT0gMSB8fCBfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xyXG4gICAgICAgICAgICBfLnRvdWNoT2JqZWN0ID0ge307XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdG91Y2hlcyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF8udG91Y2hPYmplY3Quc3RhcnRYID0gXy50b3VjaE9iamVjdC5jdXJYID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWCA6IGV2ZW50LmNsaWVudFg7XHJcbiAgICAgICAgXy50b3VjaE9iamVjdC5zdGFydFkgPSBfLnRvdWNoT2JqZWN0LmN1clkgPSB0b3VjaGVzICE9PSB1bmRlZmluZWQgPyB0b3VjaGVzLnBhZ2VZIDogZXZlbnQuY2xpZW50WTtcclxuXHJcbiAgICAgICAgXy5kcmFnZ2luZyA9IHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUudW5maWx0ZXJTbGlkZXMgPSBTbGljay5wcm90b3R5cGUuc2xpY2tVbmZpbHRlciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmIChfLiRzbGlkZXNDYWNoZSAhPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgXy51bmxvYWQoKTtcclxuXHJcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcclxuXHJcbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xyXG5cclxuICAgICAgICAgICAgXy5yZWluaXQoKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnVubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcblxyXG4gICAgICAgICQoJy5zbGljay1jbG9uZWQnLCBfLiRzbGlkZXIpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICBpZiAoXy4kZG90cykge1xyXG4gICAgICAgICAgICBfLiRkb3RzLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF8uJHByZXZBcnJvdyAmJiBfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLnByZXZBcnJvdykpIHtcclxuICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF8uJG5leHRBcnJvdyAmJiBfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLm5leHRBcnJvdykpIHtcclxuICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXy4kc2xpZGVzXHJcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGUgc2xpY2stYWN0aXZlIHNsaWNrLXZpc2libGUgc2xpY2stY3VycmVudCcpXHJcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcclxuICAgICAgICAgICAgLmNzcygnd2lkdGgnLCAnJyk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTbGljay5wcm90b3R5cGUudW5zbGljayA9IGZ1bmN0aW9uKGZyb21CcmVha3BvaW50KSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcigndW5zbGljaycsIFtfLCBmcm9tQnJlYWtwb2ludF0pO1xyXG4gICAgICAgIF8uZGVzdHJveSgpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnVwZGF0ZUFycm93cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgXyA9IHRoaXMsXHJcbiAgICAgICAgICAgIGNlbnRlck9mZnNldDtcclxuXHJcbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XHJcblxyXG4gICAgICAgIGlmICggXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJlxyXG4gICAgICAgICAgICBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmXHJcbiAgICAgICAgICAgICFfLm9wdGlvbnMuaW5maW5pdGUgKSB7XHJcblxyXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xyXG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xyXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gZmFsc2UpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSAxICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xyXG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLnVwZGF0ZURvdHMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAoXy4kZG90cyAhPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgXy4kZG90c1xyXG4gICAgICAgICAgICAgICAgLmZpbmQoJ2xpJylcclxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stYWN0aXZlJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XHJcblxyXG4gICAgICAgICAgICBfLiRkb3RzXHJcbiAgICAgICAgICAgICAgICAuZmluZCgnbGknKVxyXG4gICAgICAgICAgICAgICAgLmVxKE1hdGguZmxvb3IoXy5jdXJyZW50U2xpZGUgLyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpKVxyXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS52aXNpYmlsaXR5ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBfID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKGRvY3VtZW50W18uaGlkZGVuXSkge1xyXG4gICAgICAgICAgICBfLnBhdXNlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIF8ucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBfLmF1dG9QbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0QURBID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG4gICAgICAgIF8uJHNsaWRlcy5hZGQoXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stY2xvbmVkJykpLmF0dHIoe1xyXG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiAndHJ1ZScsXHJcbiAgICAgICAgICAgICd0YWJpbmRleCc6ICctMSdcclxuICAgICAgICB9KS5maW5kKCdhLCBpbnB1dCwgYnV0dG9uLCBzZWxlY3QnKS5hdHRyKHtcclxuICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBfLiRzbGlkZVRyYWNrLmF0dHIoJ3JvbGUnLCAnbGlzdGJveCcpO1xyXG5cclxuICAgICAgICBfLiRzbGlkZXMubm90KF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLWNsb25lZCcpKS5lYWNoKGZ1bmN0aW9uKGkpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5hdHRyKHtcclxuICAgICAgICAgICAgICAgICdyb2xlJzogJ29wdGlvbicsXHJcbiAgICAgICAgICAgICAgICAnYXJpYS1kZXNjcmliZWRieSc6ICdzbGljay1zbGlkZScgKyBfLmluc3RhbmNlVWlkICsgaSArICcnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoXy4kZG90cyAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBfLiRkb3RzLmF0dHIoJ3JvbGUnLCAndGFibGlzdCcpLmZpbmQoJ2xpJykuZWFjaChmdW5jdGlvbihpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoe1xyXG4gICAgICAgICAgICAgICAgICAgICdyb2xlJzogJ3ByZXNlbnRhdGlvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiAnZmFsc2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICdhcmlhLWNvbnRyb2xzJzogJ25hdmlnYXRpb24nICsgXy5pbnN0YW5jZVVpZCArIGkgKyAnJyxcclxuICAgICAgICAgICAgICAgICAgICAnaWQnOiAnc2xpY2stc2xpZGUnICsgXy5pbnN0YW5jZVVpZCArIGkgKyAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZmlyc3QoKS5hdHRyKCdhcmlhLXNlbGVjdGVkJywgJ3RydWUnKS5lbmQoKVxyXG4gICAgICAgICAgICAgICAgLmZpbmQoJ2J1dHRvbicpLmF0dHIoJ3JvbGUnLCAnYnV0dG9uJykuZW5kKClcclxuICAgICAgICAgICAgICAgIC5jbG9zZXN0KCdkaXYnKS5hdHRyKCdyb2xlJywgJ3Rvb2xiYXInKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXy5hY3RpdmF0ZUFEQSgpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgU2xpY2sucHJvdG90eXBlLmFjdGl2YXRlQURBID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xyXG5cclxuICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1hY3RpdmUnKS5hdHRyKHtcclxuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ2ZhbHNlJ1xyXG4gICAgICAgIH0pLmZpbmQoJ2EsIGlucHV0LCBidXR0b24sIHNlbGVjdCcpLmF0dHIoe1xyXG4gICAgICAgICAgICAndGFiaW5kZXgnOiAnMCdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNsaWNrLnByb3RvdHlwZS5mb2N1c0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgXyA9IHRoaXM7XHJcbiAgICAgICAgXy4kc2xpZGVyLm9uKCdmb2N1cy5zbGljayBibHVyLnNsaWNrJywgJyonLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgdmFyIHNmID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChfLmlzUGxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZi5pcygnOmZvY3VzJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfLmF1dG9QbGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgJC5mbi5zbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBfID0gdGhpcyxcclxuICAgICAgICAgICAgb3B0ID0gYXJndW1lbnRzWzBdLFxyXG4gICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcclxuICAgICAgICAgICAgbCA9IF8ubGVuZ3RoLFxyXG4gICAgICAgICAgICBpLFxyXG4gICAgICAgICAgICByZXQ7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2Ygb3B0ID09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICAgICAgX1tpXS5zbGljayA9IG5ldyBTbGljayhfW2ldLCBvcHQpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXQgPSBfW2ldLnNsaWNrW29wdF0uYXBwbHkoX1tpXS5zbGljaywgYXJncyk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmV0ICE9ICd1bmRlZmluZWQnKSByZXR1cm4gcmV0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gXztcclxuICAgIH07XHJcblxyXG59KSk7XHJcbiIsIi8qXHJcbiAqIElubGluZSBGb3JtIFZhbGlkYXRpb24gRW5naW5lIDIuNi4yLCBqUXVlcnkgcGx1Z2luXHJcbiAqXHJcbiAqIENvcHlyaWdodChjKSAyMDEwLCBDZWRyaWMgRHVnYXNcclxuICogaHR0cDovL3d3dy5wb3NpdGlvbi1hYnNvbHV0ZS5jb21cclxuICpcclxuICogMi4wIFJld3JpdGUgYnkgT2xpdmllciBSZWZhbG9cclxuICogaHR0cDovL3d3dy5jcmlvbmljcy5jb21cclxuICpcclxuICogRm9ybSB2YWxpZGF0aW9uIGVuZ2luZSBhbGxvd2luZyBjdXN0b20gcmVnZXggcnVsZXMgdG8gYmUgYWRkZWQuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxyXG4gKi9cclxuIChmdW5jdGlvbigkKSB7XHJcblxyXG5cdFwidXNlIHN0cmljdFwiO1xyXG5cclxuXHR2YXIgbWV0aG9kcyA9IHtcclxuXHJcblx0XHQvKipcclxuXHRcdCogS2luZCBvZiB0aGUgY29uc3RydWN0b3IsIGNhbGxlZCBiZWZvcmUgYW55IGFjdGlvblxyXG5cdFx0KiBAcGFyYW0ge01hcH0gdXNlciBvcHRpb25zXHJcblx0XHQqL1xyXG5cdFx0aW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cdFx0XHR2YXIgZm9ybSA9IHRoaXM7XHJcblx0XHRcdGlmICghZm9ybS5kYXRhKCdqcXYnKSB8fCBmb3JtLmRhdGEoJ2pxdicpID09IG51bGwgKSB7XHJcblx0XHRcdFx0b3B0aW9ucyA9IG1ldGhvZHMuX3NhdmVPcHRpb25zKGZvcm0sIG9wdGlvbnMpO1xyXG5cdFx0XHRcdC8vIGJpbmQgYWxsIGZvcm1FcnJvciBlbGVtZW50cyB0byBjbG9zZSBvbiBjbGlja1xyXG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuZm9ybUVycm9yXCIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5mYWRlT3V0KDE1MCwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdC8vIHJlbW92ZSBwcm9tcHQgb25jZSBpbnZpc2libGVcclxuXHRcdFx0XHRcdFx0JCh0aGlzKS5wYXJlbnQoJy5mb3JtRXJyb3JPdXRlcicpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHQgfSxcclxuXHRcdC8qKlxyXG5cdFx0KiBBdHRhY2hzIGpRdWVyeS52YWxpZGF0aW9uRW5naW5lIHRvIGZvcm0uc3VibWl0IGFuZCBmaWVsZC5ibHVyIGV2ZW50c1xyXG5cdFx0KiBUYWtlcyBhbiBvcHRpb25hbCBwYXJhbXM6IGEgbGlzdCBvZiBvcHRpb25zXHJcblx0XHQqIGllLiBqUXVlcnkoXCIjZm9ybUlEMVwiKS52YWxpZGF0aW9uRW5naW5lKCdhdHRhY2gnLCB7cHJvbXB0UG9zaXRpb24gOiBcImNlbnRlclJpZ2h0XCJ9KTtcclxuXHRcdCovXHJcblx0XHRhdHRhY2g6IGZ1bmN0aW9uKHVzZXJPcHRpb25zKSB7XHJcblxyXG5cdFx0XHR2YXIgZm9ybSA9IHRoaXM7XHJcblx0XHRcdHZhciBvcHRpb25zO1xyXG5cclxuXHRcdFx0aWYodXNlck9wdGlvbnMpXHJcblx0XHRcdFx0b3B0aW9ucyA9IG1ldGhvZHMuX3NhdmVPcHRpb25zKGZvcm0sIHVzZXJPcHRpb25zKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdG9wdGlvbnMgPSBmb3JtLmRhdGEoJ2pxdicpO1xyXG5cclxuXHRcdFx0b3B0aW9ucy52YWxpZGF0ZUF0dHJpYnV0ZSA9IChmb3JtLmZpbmQoXCJbZGF0YS12YWxpZGF0aW9uLWVuZ2luZSo9dmFsaWRhdGVdXCIpLmxlbmd0aCkgPyBcImRhdGEtdmFsaWRhdGlvbi1lbmdpbmVcIiA6IFwiY2xhc3NcIjtcclxuXHRcdFx0aWYgKG9wdGlvbnMuYmluZGVkKSB7XHJcblxyXG5cdFx0XHRcdC8vIGRlbGVnYXRlIGZpZWxkc1xyXG5cdFx0XHRcdGZvcm0ub24ob3B0aW9ucy52YWxpZGF0aW9uRXZlbnRUcmlnZ2VyLCBcIltcIitvcHRpb25zLnZhbGlkYXRlQXR0cmlidXRlK1wiKj12YWxpZGF0ZV06bm90KFt0eXBlPWNoZWNrYm94XSk6bm90KFt0eXBlPXJhZGlvXSk6bm90KC5kYXRlcGlja2VyKVwiLCBtZXRob2RzLl9vbkZpZWxkRXZlbnQpO1xyXG5cdFx0XHRcdGZvcm0ub24oXCJjbGlja1wiLCBcIltcIitvcHRpb25zLnZhbGlkYXRlQXR0cmlidXRlK1wiKj12YWxpZGF0ZV1bdHlwZT1jaGVja2JveF0sW1wiK29wdGlvbnMudmFsaWRhdGVBdHRyaWJ1dGUrXCIqPXZhbGlkYXRlXVt0eXBlPXJhZGlvXVwiLCBtZXRob2RzLl9vbkZpZWxkRXZlbnQpO1xyXG5cdFx0XHRcdGZvcm0ub24ob3B0aW9ucy52YWxpZGF0aW9uRXZlbnRUcmlnZ2VyLFwiW1wiK29wdGlvbnMudmFsaWRhdGVBdHRyaWJ1dGUrXCIqPXZhbGlkYXRlXVtjbGFzcyo9ZGF0ZXBpY2tlcl1cIiwge1wiZGVsYXlcIjogMzAwfSwgbWV0aG9kcy5fb25GaWVsZEV2ZW50KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAob3B0aW9ucy5hdXRvUG9zaXRpb25VcGRhdGUpIHtcclxuXHRcdFx0XHQkKHdpbmRvdykuYmluZChcInJlc2l6ZVwiLCB7XHJcblx0XHRcdFx0XHRcIm5vQW5pbWF0aW9uXCI6IHRydWUsXHJcblx0XHRcdFx0XHRcImZvcm1FbGVtXCI6IGZvcm1cclxuXHRcdFx0XHR9LCBtZXRob2RzLnVwZGF0ZVByb21wdHNQb3NpdGlvbik7XHJcblx0XHRcdH1cclxuXHRcdFx0Zm9ybS5vbihcImNsaWNrXCIsXCJhW2RhdGEtdmFsaWRhdGlvbi1lbmdpbmUtc2tpcF0sIGFbY2xhc3MqPSd2YWxpZGF0ZS1za2lwJ10sIGJ1dHRvbltkYXRhLXZhbGlkYXRpb24tZW5naW5lLXNraXBdLCBidXR0b25bY2xhc3MqPSd2YWxpZGF0ZS1za2lwJ10sIGlucHV0W2RhdGEtdmFsaWRhdGlvbi1lbmdpbmUtc2tpcF0sIGlucHV0W2NsYXNzKj0ndmFsaWRhdGUtc2tpcCddXCIsIG1ldGhvZHMuX3N1Ym1pdEJ1dHRvbkNsaWNrKTtcclxuXHRcdFx0Zm9ybS5yZW1vdmVEYXRhKCdqcXZfc3VibWl0QnV0dG9uJyk7XHJcblxyXG5cdFx0XHQvLyBiaW5kIGZvcm0uc3VibWl0XHJcblx0XHRcdGZvcm0ub24oXCJzdWJtaXRcIiwgbWV0aG9kcy5fb25TdWJtaXRFdmVudCk7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBVbnJlZ2lzdGVycyBhbnkgYmluZGluZ3MgdGhhdCBtYXkgcG9pbnQgdG8galF1ZXJ5LnZhbGlkYWl0b25FbmdpbmVcclxuXHRcdCovXHJcblx0XHRkZXRhY2g6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0dmFyIGZvcm0gPSB0aGlzO1xyXG5cdFx0XHR2YXIgb3B0aW9ucyA9IGZvcm0uZGF0YSgnanF2Jyk7XHJcblxyXG5cdFx0XHQvLyB1bmJpbmQgZmllbGRzXHJcblx0XHRcdGZvcm0uZmluZChcIltcIitvcHRpb25zLnZhbGlkYXRlQXR0cmlidXRlK1wiKj12YWxpZGF0ZV1cIikubm90KFwiW3R5cGU9Y2hlY2tib3hdXCIpLm9mZihvcHRpb25zLnZhbGlkYXRpb25FdmVudFRyaWdnZXIsIG1ldGhvZHMuX29uRmllbGRFdmVudCk7XHJcblx0XHRcdGZvcm0uZmluZChcIltcIitvcHRpb25zLnZhbGlkYXRlQXR0cmlidXRlK1wiKj12YWxpZGF0ZV1bdHlwZT1jaGVja2JveF0sW2NsYXNzKj12YWxpZGF0ZV1bdHlwZT1yYWRpb11cIikub2ZmKFwiY2xpY2tcIiwgbWV0aG9kcy5fb25GaWVsZEV2ZW50KTtcclxuXHJcblx0XHRcdC8vIHVuYmluZCBmb3JtLnN1Ym1pdFxyXG5cdFx0XHRmb3JtLm9mZihcInN1Ym1pdFwiLCBtZXRob2RzLm9uQWpheEZvcm1Db21wbGV0ZSk7XHJcblxyXG5cdFx0XHQvLyB1bmJpbmQgZm9ybS5zdWJtaXRcclxuXHRcdFx0Zm9ybS5vZmYoXCJzdWJtaXRcIiwgbWV0aG9kcy5vbkFqYXhGb3JtQ29tcGxldGUpO1xyXG5cdFx0XHRmb3JtLnJlbW92ZURhdGEoJ2pxdicpO1xyXG4gICAgICAgICAgICBcclxuXHRcdFx0Zm9ybS5vZmYoXCJjbGlja1wiLCBcImFbZGF0YS12YWxpZGF0aW9uLWVuZ2luZS1za2lwXSwgYVtjbGFzcyo9J3ZhbGlkYXRlLXNraXAnXSwgYnV0dG9uW2RhdGEtdmFsaWRhdGlvbi1lbmdpbmUtc2tpcF0sIGJ1dHRvbltjbGFzcyo9J3ZhbGlkYXRlLXNraXAnXSwgaW5wdXRbZGF0YS12YWxpZGF0aW9uLWVuZ2luZS1za2lwXSwgaW5wdXRbY2xhc3MqPSd2YWxpZGF0ZS1za2lwJ11cIiwgbWV0aG9kcy5fc3VibWl0QnV0dG9uQ2xpY2spO1xyXG5cdFx0XHRmb3JtLnJlbW92ZURhdGEoJ2pxdl9zdWJtaXRCdXR0b24nKTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmF1dG9Qb3NpdGlvblVwZGF0ZSlcclxuXHRcdFx0XHQkKHdpbmRvdykudW5iaW5kKFwicmVzaXplXCIsIG1ldGhvZHMudXBkYXRlUHJvbXB0c1Bvc2l0aW9uKTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBWYWxpZGF0ZXMgZWl0aGVyIGEgZm9ybSBvciBhIGxpc3Qgb2YgZmllbGRzLCBzaG93cyBwcm9tcHRzIGFjY29yZGluZ2x5LlxyXG5cdFx0KiBOb3RlOiBUaGVyZSBpcyBubyBhamF4IGZvcm0gdmFsaWRhdGlvbiB3aXRoIHRoaXMgbWV0aG9kLCBvbmx5IGZpZWxkIGFqYXggdmFsaWRhdGlvbiBhcmUgZXZhbHVhdGVkXHJcblx0XHQqXHJcblx0XHQqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgZm9ybSB2YWxpZGF0ZXMsIGZhbHNlIGlmIGl0IGZhaWxzXHJcblx0XHQqL1xyXG5cdFx0dmFsaWRhdGU6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgZWxlbWVudCA9ICQodGhpcyk7XHJcblx0XHRcdHZhciB2YWxpZCA9IG51bGw7XHJcblxyXG5cdFx0XHRpZiAoZWxlbWVudC5pcyhcImZvcm1cIikgfHwgZWxlbWVudC5oYXNDbGFzcyhcInZhbGlkYXRpb25FbmdpbmVDb250YWluZXJcIikpIHtcclxuXHRcdFx0XHRpZiAoZWxlbWVudC5oYXNDbGFzcygndmFsaWRhdGluZycpKSB7XHJcblx0XHRcdFx0XHQvLyBmb3JtIGlzIGFscmVhZHkgdmFsaWRhdGluZy5cclxuXHRcdFx0XHRcdC8vIFNob3VsZCBhYm9ydCBvbGQgdmFsaWRhdGlvbiBhbmQgc3RhcnQgbmV3IG9uZS4gSSBkb24ndCBrbm93IGhvdyB0byBpbXBsZW1lbnQgaXQuXHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fSBlbHNlIHtcdFx0XHRcdFxyXG5cdFx0XHRcdFx0ZWxlbWVudC5hZGRDbGFzcygndmFsaWRhdGluZycpO1xyXG5cdFx0XHRcdFx0dmFyIG9wdGlvbnMgPSBlbGVtZW50LmRhdGEoJ2pxdicpO1xyXG5cdFx0XHRcdFx0dmFyIHZhbGlkID0gbWV0aG9kcy5fdmFsaWRhdGVGaWVsZHModGhpcyk7XHJcblxyXG5cdFx0XHRcdFx0Ly8gSWYgdGhlIGZvcm0gZG9lc24ndCB2YWxpZGF0ZSwgY2xlYXIgdGhlICd2YWxpZGF0aW5nJyBjbGFzcyBiZWZvcmUgdGhlIHVzZXIgaGFzIGEgY2hhbmNlIHRvIHN1Ym1pdCBhZ2FpblxyXG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRlbGVtZW50LnJlbW92ZUNsYXNzKCd2YWxpZGF0aW5nJyk7XHJcblx0XHRcdFx0XHR9LCAxMDApO1xyXG5cdFx0XHRcdFx0aWYgKHZhbGlkICYmIG9wdGlvbnMub25TdWNjZXNzKSB7XHJcblx0XHRcdFx0XHRcdG9wdGlvbnMub25TdWNjZXNzKCk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCF2YWxpZCAmJiBvcHRpb25zLm9uRmFpbHVyZSkge1xyXG5cdFx0XHRcdFx0XHRvcHRpb25zLm9uRmFpbHVyZSgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIGlmIChlbGVtZW50LmlzKCdmb3JtJykgfHwgZWxlbWVudC5oYXNDbGFzcygndmFsaWRhdGlvbkVuZ2luZUNvbnRhaW5lcicpKSB7XHJcblx0XHRcdFx0ZWxlbWVudC5yZW1vdmVDbGFzcygndmFsaWRhdGluZycpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIGZpZWxkIHZhbGlkYXRpb25cclxuXHRcdFx0XHR2YXIgZm9ybSA9IGVsZW1lbnQuY2xvc2VzdCgnZm9ybSwgLnZhbGlkYXRpb25FbmdpbmVDb250YWluZXInKSxcclxuXHRcdFx0XHRcdG9wdGlvbnMgPSAoZm9ybS5kYXRhKCdqcXYnKSkgPyBmb3JtLmRhdGEoJ2pxdicpIDogJC52YWxpZGF0aW9uRW5naW5lLmRlZmF1bHRzLFxyXG5cdFx0XHRcdFx0dmFsaWQgPSBtZXRob2RzLl92YWxpZGF0ZUZpZWxkKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG5cclxuXHRcdFx0XHRpZiAodmFsaWQgJiYgb3B0aW9ucy5vbkZpZWxkU3VjY2VzcylcclxuXHRcdFx0XHRcdG9wdGlvbnMub25GaWVsZFN1Y2Nlc3MoKTtcclxuXHRcdFx0XHRlbHNlIGlmIChvcHRpb25zLm9uRmllbGRGYWlsdXJlICYmIG9wdGlvbnMuSW52YWxpZEZpZWxkcy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRvcHRpb25zLm9uRmllbGRGYWlsdXJlKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmKG9wdGlvbnMub25WYWxpZGF0aW9uQ29tcGxldGUpIHtcclxuXHRcdFx0XHQvLyAhISBlbnN1cmVzIHRoYXQgYW4gdW5kZWZpbmVkIHJldHVybiBpcyBpbnRlcnByZXRlZCBhcyByZXR1cm4gZmFsc2UgYnV0IGFsbG93cyBhIG9uVmFsaWRhdGlvbkNvbXBsZXRlKCkgdG8gcG9zc2libHkgcmV0dXJuIHRydWUgYW5kIGhhdmUgZm9ybSBjb250aW51ZSBwcm9jZXNzaW5nXHJcblx0XHRcdFx0cmV0dXJuICEhb3B0aW9ucy5vblZhbGlkYXRpb25Db21wbGV0ZShmb3JtLCB2YWxpZCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHZhbGlkO1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiAgUmVkcmF3IHByb21wdHMgcG9zaXRpb24sIHVzZWZ1bCB3aGVuIHlvdSBjaGFuZ2UgdGhlIERPTSBzdGF0ZSB3aGVuIHZhbGlkYXRpbmdcclxuXHRcdCovXHJcblx0XHR1cGRhdGVQcm9tcHRzUG9zaXRpb246IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblxyXG5cdFx0XHRpZiAoZXZlbnQgJiYgdGhpcyA9PSB3aW5kb3cpIHtcclxuXHRcdFx0XHR2YXIgZm9ybSA9IGV2ZW50LmRhdGEuZm9ybUVsZW07XHJcblx0XHRcdFx0dmFyIG5vQW5pbWF0aW9uID0gZXZlbnQuZGF0YS5ub0FuaW1hdGlvbjtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0dmFyIGZvcm0gPSAkKHRoaXMuY2xvc2VzdCgnZm9ybSwgLnZhbGlkYXRpb25FbmdpbmVDb250YWluZXInKSk7XHJcblxyXG5cdFx0XHR2YXIgb3B0aW9ucyA9IGZvcm0uZGF0YSgnanF2Jyk7XHJcblx0XHRcdC8vIE5vIG9wdGlvbiwgdGFrZSBkZWZhdWx0IG9uZVxyXG5cdFx0XHRmb3JtLmZpbmQoJ1snK29wdGlvbnMudmFsaWRhdGVBdHRyaWJ1dGUrJyo9dmFsaWRhdGVdJykubm90KFwiOmRpc2FibGVkXCIpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR2YXIgZmllbGQgPSAkKHRoaXMpO1xyXG5cdFx0XHRcdGlmIChvcHRpb25zLnByZXR0eVNlbGVjdCAmJiBmaWVsZC5pcyhcIjpoaWRkZW5cIikpXHJcblx0XHRcdFx0ICBmaWVsZCA9IGZvcm0uZmluZChcIiNcIiArIG9wdGlvbnMudXNlUHJlZml4ICsgZmllbGQuYXR0cignaWQnKSArIG9wdGlvbnMudXNlU3VmZml4KTtcclxuXHRcdFx0XHR2YXIgcHJvbXB0ID0gbWV0aG9kcy5fZ2V0UHJvbXB0KGZpZWxkKTtcclxuXHRcdFx0XHR2YXIgcHJvbXB0VGV4dCA9ICQocHJvbXB0KS5maW5kKFwiLmZvcm1FcnJvckNvbnRlbnRcIikuaHRtbCgpO1xyXG5cclxuXHRcdFx0XHRpZihwcm9tcHQpXHJcblx0XHRcdFx0XHRtZXRob2RzLl91cGRhdGVQcm9tcHQoZmllbGQsICQocHJvbXB0KSwgcHJvbXB0VGV4dCwgdW5kZWZpbmVkLCBmYWxzZSwgb3B0aW9ucywgbm9BbmltYXRpb24pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIERpc3BsYXlzIGEgcHJvbXB0IG9uIGEgZWxlbWVudC5cclxuXHRcdCogTm90ZSB0aGF0IHRoZSBlbGVtZW50IG5lZWRzIGFuIGlkIVxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge1N0cmluZ30gcHJvbXB0VGV4dCBodG1sIHRleHQgdG8gZGlzcGxheSB0eXBlXHJcblx0XHQqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIHRoZSB0eXBlIG9mIGJ1YmJsZTogJ3Bhc3MnIChncmVlbiksICdsb2FkJyAoYmxhY2spIGFueXRoaW5nIGVsc2UgKHJlZClcclxuXHRcdCogQHBhcmFtIHtTdHJpbmd9IHBvc3NpYmxlIHZhbHVlcyB0b3BMZWZ0LCB0b3BSaWdodCwgYm90dG9tTGVmdCwgY2VudGVyUmlnaHQsIGJvdHRvbVJpZ2h0XHJcblx0XHQqL1xyXG5cdFx0c2hvd1Byb21wdDogZnVuY3Rpb24ocHJvbXB0VGV4dCwgdHlwZSwgcHJvbXB0UG9zaXRpb24sIHNob3dBcnJvdykge1xyXG5cdFx0XHR2YXIgZm9ybSA9IHRoaXMuY2xvc2VzdCgnZm9ybSwgLnZhbGlkYXRpb25FbmdpbmVDb250YWluZXInKTtcclxuXHRcdFx0dmFyIG9wdGlvbnMgPSBmb3JtLmRhdGEoJ2pxdicpO1xyXG5cdFx0XHQvLyBObyBvcHRpb24sIHRha2UgZGVmYXVsdCBvbmVcclxuXHRcdFx0aWYoIW9wdGlvbnMpXHJcblx0XHRcdFx0b3B0aW9ucyA9IG1ldGhvZHMuX3NhdmVPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cdFx0XHRpZihwcm9tcHRQb3NpdGlvbilcclxuXHRcdFx0XHRvcHRpb25zLnByb21wdFBvc2l0aW9uPXByb21wdFBvc2l0aW9uO1xyXG5cdFx0XHRvcHRpb25zLnNob3dBcnJvdyA9IHNob3dBcnJvdz09dHJ1ZTtcclxuXHJcblx0XHRcdG1ldGhvZHMuX3Nob3dQcm9tcHQodGhpcywgcHJvbXB0VGV4dCwgdHlwZSwgZmFsc2UsIG9wdGlvbnMpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ2xvc2VzIGZvcm0gZXJyb3IgcHJvbXB0cywgQ0FOIGJlIGludmlkdWFsXHJcblx0XHQqL1xyXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdCB2YXIgZm9ybSA9ICQodGhpcykuY2xvc2VzdCgnZm9ybSwgLnZhbGlkYXRpb25FbmdpbmVDb250YWluZXInKTtcclxuXHRcdFx0IHZhciBvcHRpb25zID0gZm9ybS5kYXRhKCdqcXYnKTtcclxuXHRcdFx0IHZhciBmYWRlRHVyYXRpb24gPSAob3B0aW9ucyAmJiBvcHRpb25zLmZhZGVEdXJhdGlvbikgPyBvcHRpb25zLmZhZGVEdXJhdGlvbiA6IDAuMztcclxuXHRcdFx0IHZhciBjbG9zaW5ndGFnO1xyXG5cdFx0XHQgXHJcblx0XHRcdCBpZigkKHRoaXMpLmlzKFwiZm9ybVwiKSB8fCAkKHRoaXMpLmhhc0NsYXNzKFwidmFsaWRhdGlvbkVuZ2luZUNvbnRhaW5lclwiKSkge1xyXG5cdFx0XHRcdCBjbG9zaW5ndGFnID0gXCJwYXJlbnRGb3JtXCIrbWV0aG9kcy5fZ2V0Q2xhc3NOYW1lKCQodGhpcykuYXR0cihcImlkXCIpKTtcclxuXHRcdFx0IH0gZWxzZSB7XHJcblx0XHRcdFx0IGNsb3Npbmd0YWcgPSBtZXRob2RzLl9nZXRDbGFzc05hbWUoJCh0aGlzKS5hdHRyKFwiaWRcIikpICtcImZvcm1FcnJvclwiO1xyXG5cdFx0XHQgfVxyXG5cdFx0XHQgJCgnLicrY2xvc2luZ3RhZykuZmFkZVRvKGZhZGVEdXJhdGlvbiwgMC4zLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQgJCh0aGlzKS5wYXJlbnQoJy5mb3JtRXJyb3JPdXRlcicpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdCAkKHRoaXMpLnJlbW92ZSgpO1xyXG5cdFx0XHQgfSk7XHJcblx0XHRcdCByZXR1cm4gdGhpcztcclxuXHRcdCB9LFxyXG5cdFx0IC8qKlxyXG5cdFx0ICogQ2xvc2VzIGFsbCBlcnJvciBwcm9tcHRzIG9uIHRoZSBwYWdlXHJcblx0XHQgKi9cclxuXHRcdCBoaWRlQWxsOiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdCB2YXIgZm9ybSA9IHRoaXM7XHJcblx0XHRcdCB2YXIgb3B0aW9ucyA9IGZvcm0uZGF0YSgnanF2Jyk7XHJcblx0XHRcdCB2YXIgZHVyYXRpb24gPSBvcHRpb25zID8gb3B0aW9ucy5mYWRlRHVyYXRpb246MzAwO1xyXG5cdFx0XHQgJCgnLmZvcm1FcnJvcicpLmZhZGVUbyhkdXJhdGlvbiwgMzAwLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQgJCh0aGlzKS5wYXJlbnQoJy5mb3JtRXJyb3JPdXRlcicpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdCAkKHRoaXMpLnJlbW92ZSgpO1xyXG5cdFx0XHQgfSk7XHJcblx0XHRcdCByZXR1cm4gdGhpcztcclxuXHRcdCB9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFR5cGljYWxseSBjYWxsZWQgd2hlbiB1c2VyIGV4aXN0cyBhIGZpZWxkIHVzaW5nIHRhYiBvciBhIG1vdXNlIGNsaWNrLCB0cmlnZ2VycyBhIGZpZWxkXHJcblx0XHQqIHZhbGlkYXRpb25cclxuXHRcdCovXHJcblx0XHRfb25GaWVsZEV2ZW50OiBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHR2YXIgZmllbGQgPSAkKHRoaXMpO1xyXG5cdFx0XHR2YXIgZm9ybSA9IGZpZWxkLmNsb3Nlc3QoJ2Zvcm0sIC52YWxpZGF0aW9uRW5naW5lQ29udGFpbmVyJyk7XHJcblx0XHRcdHZhciBvcHRpb25zID0gZm9ybS5kYXRhKCdqcXYnKTtcclxuXHRcdFx0b3B0aW9ucy5ldmVudFRyaWdnZXIgPSBcImZpZWxkXCI7XHJcblx0XHRcdC8vIHZhbGlkYXRlIHRoZSBjdXJyZW50IGZpZWxkXHJcblx0XHRcdHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdG1ldGhvZHMuX3ZhbGlkYXRlRmllbGQoZmllbGQsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdGlmIChvcHRpb25zLkludmFsaWRGaWVsZHMubGVuZ3RoID09IDAgJiYgb3B0aW9ucy5vbkZpZWxkU3VjY2Vzcykge1xyXG5cdFx0XHRcdFx0b3B0aW9ucy5vbkZpZWxkU3VjY2VzcygpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAob3B0aW9ucy5JbnZhbGlkRmllbGRzLmxlbmd0aCA+IDAgJiYgb3B0aW9ucy5vbkZpZWxkRmFpbHVyZSkge1xyXG5cdFx0XHRcdFx0b3B0aW9ucy5vbkZpZWxkRmFpbHVyZSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwgKGV2ZW50LmRhdGEpID8gZXZlbnQuZGF0YS5kZWxheSA6IDApO1xyXG5cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ2FsbGVkIHdoZW4gdGhlIGZvcm0gaXMgc3VibWl0ZWQsIHNob3dzIHByb21wdHMgYWNjb3JkaW5nbHlcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH1cclxuXHRcdCogICAgICAgICAgICBmb3JtXHJcblx0XHQqIEByZXR1cm4gZmFsc2UgaWYgZm9ybSBzdWJtaXNzaW9uIG5lZWRzIHRvIGJlIGNhbmNlbGxlZFxyXG5cdFx0Ki9cclxuXHRcdF9vblN1Ym1pdEV2ZW50OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIGZvcm0gPSAkKHRoaXMpO1xyXG5cdFx0XHR2YXIgb3B0aW9ucyA9IGZvcm0uZGF0YSgnanF2Jyk7XHJcblx0XHRcdFxyXG5cdFx0XHQvL2NoZWNrIGlmIGl0IGlzIHRyaWdnZXIgZnJvbSBza2lwcGVkIGJ1dHRvblxyXG5cdFx0XHRpZiAoZm9ybS5kYXRhKFwianF2X3N1Ym1pdEJ1dHRvblwiKSl7XHJcblx0XHRcdFx0dmFyIHN1Ym1pdEJ1dHRvbiA9ICQoXCIjXCIgKyBmb3JtLmRhdGEoXCJqcXZfc3VibWl0QnV0dG9uXCIpKTtcclxuXHRcdFx0XHRpZiAoc3VibWl0QnV0dG9uKXtcclxuXHRcdFx0XHRcdGlmIChzdWJtaXRCdXR0b24ubGVuZ3RoID4gMCl7XHJcblx0XHRcdFx0XHRcdGlmIChzdWJtaXRCdXR0b24uaGFzQ2xhc3MoXCJ2YWxpZGF0ZS1za2lwXCIpIHx8IHN1Ym1pdEJ1dHRvbi5hdHRyKFwiZGF0YS12YWxpZGF0aW9uLWVuZ2luZS1za2lwXCIpID09IFwidHJ1ZVwiKVxyXG5cdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0b3B0aW9ucy5ldmVudFRyaWdnZXIgPSBcInN1Ym1pdFwiO1xyXG5cclxuXHRcdFx0Ly8gdmFsaWRhdGUgZWFjaCBmaWVsZCBcclxuXHRcdFx0Ly8gKC0gc2tpcCBmaWVsZCBhamF4IHZhbGlkYXRpb24sIG5vdCBuZWNlc3NhcnkgSUYgd2Ugd2lsbCBwZXJmb3JtIGFuIGFqYXggZm9ybSB2YWxpZGF0aW9uKVxyXG5cdFx0XHR2YXIgcj1tZXRob2RzLl92YWxpZGF0ZUZpZWxkcyhmb3JtKTtcclxuXHJcblx0XHRcdGlmIChyICYmIG9wdGlvbnMuYWpheEZvcm1WYWxpZGF0aW9uKSB7XHJcblx0XHRcdFx0bWV0aG9kcy5fdmFsaWRhdGVGb3JtV2l0aEFqYXgoZm9ybSwgb3B0aW9ucyk7XHJcblx0XHRcdFx0Ly8gY2FuY2VsIGZvcm0gYXV0by1zdWJtaXNzaW9uIC0gcHJvY2VzcyB3aXRoIGFzeW5jIGNhbGwgb25BamF4Rm9ybUNvbXBsZXRlXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihvcHRpb25zLm9uVmFsaWRhdGlvbkNvbXBsZXRlKSB7XHJcblx0XHRcdFx0Ly8gISEgZW5zdXJlcyB0aGF0IGFuIHVuZGVmaW5lZCByZXR1cm4gaXMgaW50ZXJwcmV0ZWQgYXMgcmV0dXJuIGZhbHNlIGJ1dCBhbGxvd3MgYSBvblZhbGlkYXRpb25Db21wbGV0ZSgpIHRvIHBvc3NpYmx5IHJldHVybiB0cnVlIGFuZCBoYXZlIGZvcm0gY29udGludWUgcHJvY2Vzc2luZ1xyXG5cdFx0XHRcdHJldHVybiAhIW9wdGlvbnMub25WYWxpZGF0aW9uQ29tcGxldGUoZm9ybSwgcik7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHI7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFJldHVybiB0cnVlIGlmIHRoZSBhamF4IGZpZWxkIHZhbGlkYXRpb25zIHBhc3NlZCBzbyBmYXJcclxuXHRcdCogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuXHRcdCogQHJldHVybiB0cnVlLCBpcyBhbGwgYWpheCB2YWxpZGF0aW9uIHBhc3NlZCBzbyBmYXIgKHJlbWVtYmVyIGFqYXggaXMgYXN5bmMpXHJcblx0XHQqL1xyXG5cdFx0X2NoZWNrQWpheFN0YXR1czogZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cdFx0XHR2YXIgc3RhdHVzID0gdHJ1ZTtcclxuXHRcdFx0JC5lYWNoKG9wdGlvbnMuYWpheFZhbGlkQ2FjaGUsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcclxuXHRcdFx0XHRpZiAoIXZhbHVlKSB7XHJcblx0XHRcdFx0XHRzdGF0dXMgPSBmYWxzZTtcclxuXHRcdFx0XHRcdC8vIGJyZWFrIHRoZSBlYWNoXHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIHN0YXR1cztcclxuXHRcdH0sXHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0KiBSZXR1cm4gdHJ1ZSBpZiB0aGUgYWpheCBmaWVsZCBpcyB2YWxpZGF0ZWRcclxuXHRcdCogQHBhcmFtIHtTdHJpbmd9IGZpZWxkaWRcclxuXHRcdCogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuXHRcdCogQHJldHVybiB0cnVlLCBpZiB2YWxpZGF0aW9uIHBhc3NlZCwgZmFsc2UgaWYgZmFsc2Ugb3IgZG9lc24ndCBleGlzdFxyXG5cdFx0Ki9cclxuXHRcdF9jaGVja0FqYXhGaWVsZFN0YXR1czogZnVuY3Rpb24oZmllbGRpZCwgb3B0aW9ucykge1xyXG5cdFx0XHRyZXR1cm4gb3B0aW9ucy5hamF4VmFsaWRDYWNoZVtmaWVsZGlkXSA9PSB0cnVlO1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBWYWxpZGF0ZXMgZm9ybSBmaWVsZHMsIHNob3dzIHByb21wdHMgYWNjb3JkaW5nbHlcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH1cclxuXHRcdCogICAgICAgICAgICBmb3JtXHJcblx0XHQqIEBwYXJhbSB7c2tpcEFqYXhGaWVsZFZhbGlkYXRpb259XHJcblx0XHQqICAgICAgICAgICAgYm9vbGVhbiAtIHdoZW4gc2V0IHRvIHRydWUsIGFqYXggZmllbGQgdmFsaWRhdGlvbiBpcyBza2lwcGVkLCB0eXBpY2FsbHkgdXNlZCB3aGVuIHRoZSBzdWJtaXQgYnV0dG9uIGlzIGNsaWNrZWRcclxuXHRcdCpcclxuXHRcdCogQHJldHVybiB0cnVlIGlmIGZvcm0gaXMgdmFsaWQsIGZhbHNlIGlmIG5vdCwgdW5kZWZpbmVkIGlmIGFqYXggZm9ybSB2YWxpZGF0aW9uIGlzIGRvbmVcclxuXHRcdCovXHJcblx0XHRfdmFsaWRhdGVGaWVsZHM6IGZ1bmN0aW9uKGZvcm0pIHtcclxuXHRcdFx0dmFyIG9wdGlvbnMgPSBmb3JtLmRhdGEoJ2pxdicpO1xyXG5cclxuXHRcdFx0Ly8gdGhpcyB2YXJpYWJsZSBpcyBzZXQgdG8gdHJ1ZSBpZiBhbiBlcnJvciBpcyBmb3VuZFxyXG5cdFx0XHR2YXIgZXJyb3JGb3VuZCA9IGZhbHNlO1xyXG5cclxuXHRcdFx0Ly8gVHJpZ2dlciBob29rLCBzdGFydCB2YWxpZGF0aW9uXHJcblx0XHRcdGZvcm0udHJpZ2dlcihcImpxdi5mb3JtLnZhbGlkYXRpbmdcIik7XHJcblx0XHRcdC8vIGZpcnN0LCBldmFsdWF0ZSBzdGF0dXMgb2Ygbm9uIGFqYXggZmllbGRzXHJcblx0XHRcdHZhciBmaXJzdF9lcnI9bnVsbDtcclxuXHRcdFx0Zm9ybS5maW5kKCdbJytvcHRpb25zLnZhbGlkYXRlQXR0cmlidXRlKycqPXZhbGlkYXRlXScpLm5vdChcIjpkaXNhYmxlZFwiKS5lYWNoKCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgZmllbGQgPSAkKHRoaXMpO1xyXG5cdFx0XHRcdHZhciBuYW1lcyA9IFtdO1xyXG5cdFx0XHRcdGlmICgkLmluQXJyYXkoZmllbGQuYXR0cignbmFtZScpLCBuYW1lcykgPCAwKSB7XHJcblx0XHRcdFx0XHRlcnJvckZvdW5kIHw9IG1ldGhvZHMuX3ZhbGlkYXRlRmllbGQoZmllbGQsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdFx0aWYgKGVycm9yRm91bmQgJiYgZmlyc3RfZXJyPT1udWxsKVxyXG5cdFx0XHRcdFx0XHRpZiAoZmllbGQuaXMoXCI6aGlkZGVuXCIpICYmIG9wdGlvbnMucHJldHR5U2VsZWN0KVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCBmaXJzdF9lcnIgPSBmaWVsZCA9IGZvcm0uZmluZChcIiNcIiArIG9wdGlvbnMudXNlUHJlZml4ICsgbWV0aG9kcy5fanFTZWxlY3RvcihmaWVsZC5hdHRyKCdpZCcpKSArIG9wdGlvbnMudXNlU3VmZml4KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCBmaXJzdF9lcnI9ZmllbGQ7XHJcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5kb05vdFNob3dBbGxFcnJvc09uU3VibWl0KVxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHRuYW1lcy5wdXNoKGZpZWxkLmF0dHIoJ25hbWUnKSk7XHJcblxyXG5cdFx0XHRcdFx0Ly9pZiBvcHRpb24gc2V0LCBzdG9wIGNoZWNraW5nIHZhbGlkYXRpb24gcnVsZXMgYWZ0ZXIgb25lIGVycm9yIGlzIGZvdW5kXHJcblx0XHRcdFx0XHRpZihvcHRpb25zLnNob3dPbmVNZXNzYWdlID09IHRydWUgJiYgZXJyb3JGb3VuZCl7XHJcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Ly8gc2Vjb25kLCBjaGVjayB0byBzZWUgaWYgYWxsIGFqYXggY2FsbHMgY29tcGxldGVkIG9rXHJcblx0XHRcdC8vIGVycm9yRm91bmQgfD0gIW1ldGhvZHMuX2NoZWNrQWpheFN0YXR1cyhvcHRpb25zKTtcclxuXHJcblx0XHRcdC8vIHRoaXJkLCBjaGVjayBzdGF0dXMgYW5kIHNjcm9sbCB0aGUgY29udGFpbmVyIGFjY29yZGluZ2x5XHJcblx0XHRcdGZvcm0udHJpZ2dlcihcImpxdi5mb3JtLnJlc3VsdFwiLCBbZXJyb3JGb3VuZF0pO1xyXG5cclxuXHRcdFx0aWYgKGVycm9yRm91bmQpIHtcclxuXHRcdFx0XHRpZiAob3B0aW9ucy5zY3JvbGwpIHtcclxuXHRcdFx0XHRcdHZhciBkZXN0aW5hdGlvbj1maXJzdF9lcnIub2Zmc2V0KCkudG9wO1xyXG5cdFx0XHRcdFx0dmFyIGZpeGxlZnQgPSBmaXJzdF9lcnIub2Zmc2V0KCkubGVmdDtcclxuXHJcblx0XHRcdFx0XHQvL3Byb21wdCBwb3NpdGlvbmluZyBhZGp1c3RtZW50IHN1cHBvcnQuIFVzYWdlOiBwb3NpdGlvblR5cGU6WHNoaWZ0LFlzaGlmdCAoZm9yIGV4LjogYm90dG9tTGVmdDorMjAgb3IgYm90dG9tTGVmdDotMjAsKzEwKVxyXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uVHlwZT1vcHRpb25zLnByb21wdFBvc2l0aW9uO1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZihwb3NpdGlvblR5cGUpPT0nc3RyaW5nJyAmJiBwb3NpdGlvblR5cGUuaW5kZXhPZihcIjpcIikhPS0xKVxyXG5cdFx0XHRcdFx0XHRwb3NpdGlvblR5cGU9cG9zaXRpb25UeXBlLnN1YnN0cmluZygwLHBvc2l0aW9uVHlwZS5pbmRleE9mKFwiOlwiKSk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKHBvc2l0aW9uVHlwZSE9XCJib3R0b21SaWdodFwiICYmIHBvc2l0aW9uVHlwZSE9XCJib3R0b21MZWZ0XCIpIHtcclxuXHRcdFx0XHRcdFx0dmFyIHByb21wdF9lcnI9IG1ldGhvZHMuX2dldFByb21wdChmaXJzdF9lcnIpO1xyXG5cdFx0XHRcdFx0XHRpZiAocHJvbXB0X2Vycikge1xyXG5cdFx0XHRcdFx0XHRcdGRlc3RpbmF0aW9uPXByb21wdF9lcnIub2Zmc2V0KCkudG9wO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdC8vIE9mZnNldCB0aGUgYW1vdW50IHRoZSBwYWdlIHNjcm9sbHMgYnkgYW4gYW1vdW50IGluIHB4IHRvIGFjY29tb2RhdGUgZml4ZWQgZWxlbWVudHMgYXQgdG9wIG9mIHBhZ2VcclxuXHRcdFx0XHRcdGlmIChvcHRpb25zLnNjcm9sbE9mZnNldCkge1xyXG5cdFx0XHRcdFx0XHRkZXN0aW5hdGlvbiAtPSBvcHRpb25zLnNjcm9sbE9mZnNldDtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHQvLyBnZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBlcnJvciwgdGhlcmUgc2hvdWxkIGJlIGF0IGxlYXN0IG9uZSwgbm8gbmVlZCB0byBjaGVjayB0aGlzXHJcblx0XHRcdFx0XHQvL3ZhciBkZXN0aW5hdGlvbiA9IGZvcm0uZmluZChcIi5mb3JtRXJyb3I6bm90KCcuZ3JlZW5Qb3B1cCcpOmZpcnN0XCIpLm9mZnNldCgpLnRvcDtcclxuXHRcdFx0XHRcdGlmIChvcHRpb25zLmlzT3ZlcmZsb3duKSB7XHJcblx0XHRcdFx0XHRcdHZhciBvdmVyZmxvd0RJViA9ICQob3B0aW9ucy5vdmVyZmxvd25ESVYpO1xyXG5cdFx0XHRcdFx0XHRpZighb3ZlcmZsb3dESVYubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHRcdHZhciBzY3JvbGxDb250YWluZXJTY3JvbGwgPSBvdmVyZmxvd0RJVi5zY3JvbGxUb3AoKTtcclxuXHRcdFx0XHRcdFx0dmFyIHNjcm9sbENvbnRhaW5lclBvcyA9IC1wYXJzZUludChvdmVyZmxvd0RJVi5vZmZzZXQoKS50b3ApO1xyXG5cclxuXHRcdFx0XHRcdFx0ZGVzdGluYXRpb24gKz0gc2Nyb2xsQ29udGFpbmVyU2Nyb2xsICsgc2Nyb2xsQ29udGFpbmVyUG9zIC0gNTtcclxuXHRcdFx0XHRcdFx0dmFyIHNjcm9sbENvbnRhaW5lciA9ICQob3B0aW9ucy5vdmVyZmxvd25ESVYgKyBcIjpub3QoOmFuaW1hdGVkKVwiKTtcclxuXHJcblx0XHRcdFx0XHRcdHNjcm9sbENvbnRhaW5lci5hbmltYXRlKHsgc2Nyb2xsVG9wOiBkZXN0aW5hdGlvbiB9LCAxMTAwLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdGlmKG9wdGlvbnMuZm9jdXNGaXJzdEZpZWxkKSBmaXJzdF9lcnIuZm9jdXMoKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0JChcImh0bWwsIGJvZHlcIikuYW5pbWF0ZSh7XHJcblx0XHRcdFx0XHRcdFx0c2Nyb2xsVG9wOiBkZXN0aW5hdGlvblxyXG5cdFx0XHRcdFx0XHR9LCAxMTAwLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdGlmKG9wdGlvbnMuZm9jdXNGaXJzdEZpZWxkKSBmaXJzdF9lcnIuZm9jdXMoKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdCQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoe3Njcm9sbExlZnQ6IGZpeGxlZnR9LDExMDApXHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdH0gZWxzZSBpZihvcHRpb25zLmZvY3VzRmlyc3RGaWVsZClcclxuXHRcdFx0XHRcdGZpcnN0X2Vyci5mb2N1cygpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogVGhpcyBtZXRob2QgaXMgY2FsbGVkIHRvIHBlcmZvcm0gYW4gYWpheCBmb3JtIHZhbGlkYXRpb24uXHJcblx0XHQqIER1cmluZyB0aGlzIHByb2Nlc3MgYWxsIHRoZSAoZmllbGQsIHZhbHVlKSBwYWlycyBhcmUgc2VudCB0byB0aGUgc2VydmVyIHdoaWNoIHJldHVybnMgYSBsaXN0IG9mIGludmFsaWQgZmllbGRzIG9yIHRydWVcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZm9ybVxyXG5cdFx0KiBAcGFyYW0ge01hcH0gb3B0aW9uc1xyXG5cdFx0Ki9cclxuXHRcdF92YWxpZGF0ZUZvcm1XaXRoQWpheDogZnVuY3Rpb24oZm9ybSwgb3B0aW9ucykge1xyXG5cclxuXHRcdFx0dmFyIGRhdGEgPSBmb3JtLnNlcmlhbGl6ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgdHlwZSA9IChvcHRpb25zLmFqYXhGb3JtVmFsaWRhdGlvbk1ldGhvZCkgPyBvcHRpb25zLmFqYXhGb3JtVmFsaWRhdGlvbk1ldGhvZCA6IFwiR0VUXCI7XHJcblx0XHRcdHZhciB1cmwgPSAob3B0aW9ucy5hamF4Rm9ybVZhbGlkYXRpb25VUkwpID8gb3B0aW9ucy5hamF4Rm9ybVZhbGlkYXRpb25VUkwgOiBmb3JtLmF0dHIoXCJhY3Rpb25cIik7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBkYXRhVHlwZSA9IChvcHRpb25zLmRhdGFUeXBlKSA/IG9wdGlvbnMuZGF0YVR5cGUgOiBcImpzb25cIjtcclxuXHRcdFx0JC5hamF4KHtcclxuXHRcdFx0XHR0eXBlOiB0eXBlLFxyXG5cdFx0XHRcdHVybDogdXJsLFxyXG5cdFx0XHRcdGNhY2hlOiBmYWxzZSxcclxuXHRcdFx0XHRkYXRhVHlwZTogZGF0YVR5cGUsXHJcblx0XHRcdFx0ZGF0YTogZGF0YSxcclxuXHRcdFx0XHRmb3JtOiBmb3JtLFxyXG5cdFx0XHRcdG1ldGhvZHM6IG1ldGhvZHMsXHJcblx0XHRcdFx0b3B0aW9uczogb3B0aW9ucyxcclxuXHRcdFx0XHRiZWZvcmVTZW5kOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHJldHVybiBvcHRpb25zLm9uQmVmb3JlQWpheEZvcm1WYWxpZGF0aW9uKGZvcm0sIG9wdGlvbnMpO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKGRhdGEsIHRyYW5zcG9ydCkge1xyXG5cdFx0XHRcdFx0bWV0aG9kcy5fYWpheEVycm9yKGRhdGEsIHRyYW5zcG9ydCk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihqc29uKSB7XHJcblx0XHRcdFx0XHRpZiAoKGRhdGFUeXBlID09IFwianNvblwiKSAmJiAoanNvbiAhPT0gdHJ1ZSkpIHtcclxuXHRcdFx0XHRcdFx0Ly8gZ2V0dGluZyB0byB0aGlzIGNhc2UgZG9lc24ndCBuZWNlc3NhcnkgbWVhbnMgdGhhdCB0aGUgZm9ybSBpcyBpbnZhbGlkXHJcblx0XHRcdFx0XHRcdC8vIHRoZSBzZXJ2ZXIgbWF5IHJldHVybiBncmVlbiBvciBjbG9zaW5nIHByb21wdCBhY3Rpb25zXHJcblx0XHRcdFx0XHRcdC8vIHRoaXMgZmxhZyBoZWxwcyBmaWd1cmluZyBpdCBvdXRcclxuXHRcdFx0XHRcdFx0dmFyIGVycm9ySW5Gb3JtPWZhbHNlO1xyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGpzb24ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgdmFsdWUgPSBqc29uW2ldO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR2YXIgZXJyb3JGaWVsZElkID0gdmFsdWVbMF07XHJcblx0XHRcdFx0XHRcdFx0dmFyIGVycm9yRmllbGQgPSAkKCQoXCIjXCIgKyBlcnJvckZpZWxkSWQpWzBdKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gbWFrZSBzdXJlIHdlIGZvdW5kIHRoZSBlbGVtZW50XHJcblx0XHRcdFx0XHRcdFx0aWYgKGVycm9yRmllbGQubGVuZ3RoID09IDEpIHtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHQvLyBwcm9tcHRUZXh0IG9yIHNlbGVjdG9yXHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgbXNnID0gdmFsdWVbMl07XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBpZiB0aGUgZmllbGQgaXMgdmFsaWRcclxuXHRcdFx0XHRcdFx0XHRcdGlmICh2YWx1ZVsxXSA9PSB0cnVlKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAobXNnID09IFwiXCIgIHx8ICFtc2cpe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGlmIGZvciBzb21lIHJlYXNvbiwgc3RhdHVzPT10cnVlIGFuZCBlcnJvcj1cIlwiLCBqdXN0IGNsb3NlIHRoZSBwcm9tcHRcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtZXRob2RzLl9jbG9zZVByb21wdChlcnJvckZpZWxkKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyB0aGUgZmllbGQgaXMgdmFsaWQsIGJ1dCB3ZSBhcmUgZGlzcGxheWluZyBhIGdyZWVuIHByb21wdFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChvcHRpb25zLmFsbHJ1bGVzW21zZ10pIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZhciB0eHQgPSBvcHRpb25zLmFsbHJ1bGVzW21zZ10uYWxlcnRUZXh0T2s7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAodHh0KVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtc2cgPSB0eHQ7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChvcHRpb25zLnNob3dQcm9tcHRzKSBtZXRob2RzLl9zaG93UHJvbXB0KGVycm9yRmllbGQsIG1zZywgXCJwYXNzXCIsIGZhbHNlLCBvcHRpb25zLCB0cnVlKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gdGhlIGZpZWxkIGlzIGludmFsaWQsIHNob3cgdGhlIHJlZCBlcnJvciBwcm9tcHRcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3JJbkZvcm18PXRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChvcHRpb25zLmFsbHJ1bGVzW21zZ10pIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgdHh0ID0gb3B0aW9ucy5hbGxydWxlc1ttc2ddLmFsZXJ0VGV4dDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAodHh0KVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bXNnID0gdHh0O1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmKG9wdGlvbnMuc2hvd1Byb21wdHMpIG1ldGhvZHMuX3Nob3dQcm9tcHQoZXJyb3JGaWVsZCwgbXNnLCBcIlwiLCBmYWxzZSwgb3B0aW9ucywgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdG9wdGlvbnMub25BamF4Rm9ybUNvbXBsZXRlKCFlcnJvckluRm9ybSwgZm9ybSwganNvbiwgb3B0aW9ucyk7XHJcblx0XHRcdFx0XHR9IGVsc2VcclxuXHRcdFx0XHRcdFx0b3B0aW9ucy5vbkFqYXhGb3JtQ29tcGxldGUodHJ1ZSwgZm9ybSwganNvbiwgb3B0aW9ucyk7XHJcblxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBWYWxpZGF0ZXMgZmllbGQsIHNob3dzIHByb21wdHMgYWNjb3JkaW5nbHlcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH1cclxuXHRcdCogICAgICAgICAgICBmaWVsZFxyXG5cdFx0KiBAcGFyYW0ge0FycmF5W1N0cmluZ119XHJcblx0XHQqICAgICAgICAgICAgZmllbGQncyB2YWxpZGF0aW9uIHJ1bGVzXHJcblx0XHQqIEBwYXJhbSB7TWFwfVxyXG5cdFx0KiAgICAgICAgICAgIHVzZXIgb3B0aW9uc1xyXG5cdFx0KiBAcmV0dXJuIGZhbHNlIGlmIGZpZWxkIGlzIHZhbGlkIChJdCBpcyBpbnZlcnNlZCBmb3IgKmZpZWxkcyosIGl0IHJldHVybiBmYWxzZSBvbiB2YWxpZGF0ZSBhbmQgdHJ1ZSBvbiBlcnJvcnMuKVxyXG5cdFx0Ki9cclxuXHRcdF92YWxpZGF0ZUZpZWxkOiBmdW5jdGlvbihmaWVsZCwgb3B0aW9ucywgc2tpcEFqYXhWYWxpZGF0aW9uKSB7XHJcblx0XHRcdGlmICghZmllbGQuYXR0cihcImlkXCIpKSB7XHJcblx0XHRcdFx0ZmllbGQuYXR0cihcImlkXCIsIFwiZm9ybS12YWxpZGF0aW9uLWZpZWxkLVwiICsgJC52YWxpZGF0aW9uRW5naW5lLmZpZWxkSWRDb3VudGVyKTtcclxuXHRcdFx0XHQrKyQudmFsaWRhdGlvbkVuZ2luZS5maWVsZElkQ291bnRlcjtcclxuXHRcdFx0fVxyXG5cclxuICAgICAgICAgICBpZiAoIW9wdGlvbnMudmFsaWRhdGVOb25WaXNpYmxlRmllbGRzICYmIChmaWVsZC5pcyhcIjpoaWRkZW5cIikgJiYgIW9wdGlvbnMucHJldHR5U2VsZWN0IHx8IGZpZWxkLnBhcmVudCgpLmlzKFwiOmhpZGRlblwiKSkpXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdFx0dmFyIHJ1bGVzUGFyc2luZyA9IGZpZWxkLmF0dHIob3B0aW9ucy52YWxpZGF0ZUF0dHJpYnV0ZSk7XHJcblx0XHRcdHZhciBnZXRSdWxlcyA9IC92YWxpZGF0ZVxcWyguKilcXF0vLmV4ZWMocnVsZXNQYXJzaW5nKTtcclxuXHJcblx0XHRcdGlmICghZ2V0UnVsZXMpXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR2YXIgc3RyID0gZ2V0UnVsZXNbMV07XHJcblx0XHRcdHZhciBydWxlcyA9IHN0ci5zcGxpdCgvXFxbfCx8XFxdLyk7XHJcblxyXG5cdFx0XHQvLyB0cnVlIGlmIHdlIHJhbiB0aGUgYWpheCB2YWxpZGF0aW9uLCB0ZWxscyB0aGUgbG9naWMgdG8gc3RvcCBtZXNzaW5nIHdpdGggcHJvbXB0c1xyXG5cdFx0XHR2YXIgaXNBamF4VmFsaWRhdG9yID0gZmFsc2U7XHJcblx0XHRcdHZhciBmaWVsZE5hbWUgPSBmaWVsZC5hdHRyKFwibmFtZVwiKTtcclxuXHRcdFx0dmFyIHByb21wdFRleHQgPSBcIlwiO1xyXG5cdFx0XHR2YXIgcHJvbXB0VHlwZSA9IFwiXCI7XHJcblx0XHRcdHZhciByZXF1aXJlZCA9IGZhbHNlO1xyXG5cdFx0XHR2YXIgbGltaXRFcnJvcnMgPSBmYWxzZTtcclxuXHRcdFx0b3B0aW9ucy5pc0Vycm9yID0gZmFsc2U7XHJcblx0XHRcdG9wdGlvbnMuc2hvd0Fycm93ID0gdHJ1ZTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIElmIHRoZSBwcm9ncmFtbWVyIHdhbnRzIHRvIGxpbWl0IHRoZSBhbW91bnQgb2YgZXJyb3IgbWVzc2FnZXMgcGVyIGZpZWxkLFxyXG5cdFx0XHRpZiAob3B0aW9ucy5tYXhFcnJvcnNQZXJGaWVsZCA+IDApIHtcclxuXHRcdFx0XHRsaW1pdEVycm9ycyA9IHRydWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBmb3JtID0gJChmaWVsZC5jbG9zZXN0KFwiZm9ybSwgLnZhbGlkYXRpb25FbmdpbmVDb250YWluZXJcIikpO1xyXG5cdFx0XHQvLyBGaXggZm9yIGFkZGluZyBzcGFjZXMgaW4gdGhlIHJ1bGVzXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRydWxlc1tpXSA9IHJ1bGVzW2ldLnJlcGxhY2UoXCIgXCIsIFwiXCIpO1xyXG5cdFx0XHRcdC8vIFJlbW92ZSBhbnkgcGFyc2luZyBlcnJvcnNcclxuXHRcdFx0XHRpZiAocnVsZXNbaV0gPT09ICcnKSB7XHJcblx0XHRcdFx0XHRkZWxldGUgcnVsZXNbaV07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMCwgZmllbGRfZXJyb3JzID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gSWYgd2UgYXJlIGxpbWl0aW5nIGVycm9ycywgYW5kIGhhdmUgaGl0IHRoZSBtYXgsIGJyZWFrXHJcblx0XHRcdFx0aWYgKGxpbWl0RXJyb3JzICYmIGZpZWxkX2Vycm9ycyA+PSBvcHRpb25zLm1heEVycm9yc1BlckZpZWxkKSB7XHJcblx0XHRcdFx0XHQvLyBJZiB3ZSBoYXZlbid0IGhpdCBhIHJlcXVpcmVkIHlldCwgY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGlzIG9uZSBpbiB0aGUgdmFsaWRhdGlvbiBydWxlcyBmb3IgdGhpc1xyXG5cdFx0XHRcdFx0Ly8gZmllbGQgYW5kIHRoYXQgaXQncyBpbmRleCBpcyBncmVhdGVyIG9yIGVxdWFsIHRvIG91ciBjdXJyZW50IGluZGV4XHJcblx0XHRcdFx0XHRpZiAoIXJlcXVpcmVkKSB7XHJcblx0XHRcdFx0XHRcdHZhciBoYXZlX3JlcXVpcmVkID0gJC5pbkFycmF5KCdyZXF1aXJlZCcsIHJ1bGVzKTtcclxuXHRcdFx0XHRcdFx0cmVxdWlyZWQgPSAoaGF2ZV9yZXF1aXJlZCAhPSAtMSAmJiAgaGF2ZV9yZXF1aXJlZCA+PSBpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgZXJyb3JNc2cgPSB1bmRlZmluZWQ7XHJcblx0XHRcdFx0c3dpdGNoIChydWxlc1tpXSkge1xyXG5cclxuXHRcdFx0XHRcdGNhc2UgXCJyZXF1aXJlZFwiOlxyXG5cdFx0XHRcdFx0XHRyZXF1aXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdGVycm9yTXNnID0gbWV0aG9kcy5fZ2V0RXJyb3JNZXNzYWdlKGZvcm0sIGZpZWxkLCBydWxlc1tpXSwgcnVsZXMsIGksIG9wdGlvbnMsIG1ldGhvZHMuX3JlcXVpcmVkKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFwiY3VzdG9tXCI6XHJcblx0XHRcdFx0XHRcdGVycm9yTXNnID0gbWV0aG9kcy5fZ2V0RXJyb3JNZXNzYWdlKGZvcm0sIGZpZWxkLCBydWxlc1tpXSwgcnVsZXMsIGksIG9wdGlvbnMsIG1ldGhvZHMuX2N1c3RvbSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcImdyb3VwUmVxdWlyZWRcIjpcclxuXHRcdFx0XHRcdFx0Ly8gQ2hlY2sgaXMgaXRzIHRoZSBmaXJzdCBvZiBncm91cCwgaWYgbm90LCByZWxvYWQgdmFsaWRhdGlvbiB3aXRoIGZpcnN0IGZpZWxkXHJcblx0XHRcdFx0XHRcdC8vIEFORCBjb250aW51ZSBub3JtYWwgdmFsaWRhdGlvbiBvbiBwcmVzZW50IGZpZWxkXHJcblx0XHRcdFx0XHRcdHZhciBjbGFzc0dyb3VwID0gXCJbXCIrb3B0aW9ucy52YWxpZGF0ZUF0dHJpYnV0ZStcIio9XCIgK3J1bGVzW2kgKyAxXSArXCJdXCI7XHJcblx0XHRcdFx0XHRcdHZhciBmaXJzdE9mR3JvdXAgPSBmb3JtLmZpbmQoY2xhc3NHcm91cCkuZXEoMCk7XHJcblx0XHRcdFx0XHRcdGlmKGZpcnN0T2ZHcm91cFswXSAhPSBmaWVsZFswXSl7XHJcblxyXG5cdFx0XHRcdFx0XHRcdG1ldGhvZHMuX3ZhbGlkYXRlRmllbGQoZmlyc3RPZkdyb3VwLCBvcHRpb25zLCBza2lwQWpheFZhbGlkYXRpb24pOyBcclxuXHRcdFx0XHRcdFx0XHRvcHRpb25zLnNob3dBcnJvdyA9IHRydWU7XHJcblxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGVycm9yTXNnID0gbWV0aG9kcy5fZ2V0RXJyb3JNZXNzYWdlKGZvcm0sIGZpZWxkLCBydWxlc1tpXSwgcnVsZXMsIGksIG9wdGlvbnMsIG1ldGhvZHMuX2dyb3VwUmVxdWlyZWQpO1xyXG5cdFx0XHRcdFx0XHRpZihlcnJvck1zZykgIHJlcXVpcmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0b3B0aW9ucy5zaG93QXJyb3cgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFwiYWpheFwiOlxyXG5cdFx0XHRcdFx0XHQvLyBBSkFYIGRlZmF1bHRzIHRvIHJldHVybmluZyBpdCdzIGxvYWRpbmcgbWVzc2FnZVxyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2FqYXgoZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKTtcclxuXHRcdFx0XHRcdFx0aWYgKGVycm9yTXNnKSB7XHJcblx0XHRcdFx0XHRcdFx0cHJvbXB0VHlwZSA9IFwibG9hZFwiO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcIm1pblNpemVcIjpcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fbWluU2l6ZSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcIm1heFNpemVcIjpcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fbWF4U2l6ZSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcIm1pblwiOlxyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCwgcnVsZXNbaV0sIHJ1bGVzLCBpLCBvcHRpb25zLCBtZXRob2RzLl9taW4pO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJtYXhcIjpcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fbWF4KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFwicGFzdFwiOlxyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCxydWxlc1tpXSwgcnVsZXMsIGksIG9wdGlvbnMsIG1ldGhvZHMuX3Bhc3QpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJmdXR1cmVcIjpcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQscnVsZXNbaV0sIHJ1bGVzLCBpLCBvcHRpb25zLCBtZXRob2RzLl9mdXR1cmUpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJkYXRlUmFuZ2VcIjpcclxuXHRcdFx0XHRcdFx0dmFyIGNsYXNzR3JvdXAgPSBcIltcIitvcHRpb25zLnZhbGlkYXRlQXR0cmlidXRlK1wiKj1cIiArIHJ1bGVzW2kgKyAxXSArIFwiXVwiO1xyXG5cdFx0XHRcdFx0XHRvcHRpb25zLmZpcnN0T2ZHcm91cCA9IGZvcm0uZmluZChjbGFzc0dyb3VwKS5lcSgwKTtcclxuXHRcdFx0XHRcdFx0b3B0aW9ucy5zZWNvbmRPZkdyb3VwID0gZm9ybS5maW5kKGNsYXNzR3JvdXApLmVxKDEpO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly9pZiBvbmUgZW50cnkgb3V0IG9mIHRoZSBwYWlyIGhhcyB2YWx1ZSB0aGVuIHByb2NlZWQgdG8gcnVuIHRocm91Z2ggdmFsaWRhdGlvblxyXG5cdFx0XHRcdFx0XHRpZiAob3B0aW9ucy5maXJzdE9mR3JvdXBbMF0udmFsdWUgfHwgb3B0aW9ucy5zZWNvbmRPZkdyb3VwWzBdLnZhbHVlKSB7XHJcblx0XHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQscnVsZXNbaV0sIHJ1bGVzLCBpLCBvcHRpb25zLCBtZXRob2RzLl9kYXRlUmFuZ2UpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmIChlcnJvck1zZykgcmVxdWlyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRvcHRpb25zLnNob3dBcnJvdyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0XHRjYXNlIFwiZGF0ZVRpbWVSYW5nZVwiOlxyXG5cdFx0XHRcdFx0XHR2YXIgY2xhc3NHcm91cCA9IFwiW1wiK29wdGlvbnMudmFsaWRhdGVBdHRyaWJ1dGUrXCIqPVwiICsgcnVsZXNbaSArIDFdICsgXCJdXCI7XHJcblx0XHRcdFx0XHRcdG9wdGlvbnMuZmlyc3RPZkdyb3VwID0gZm9ybS5maW5kKGNsYXNzR3JvdXApLmVxKDApO1xyXG5cdFx0XHRcdFx0XHRvcHRpb25zLnNlY29uZE9mR3JvdXAgPSBmb3JtLmZpbmQoY2xhc3NHcm91cCkuZXEoMSk7XHJcblxyXG5cdFx0XHRcdFx0XHQvL2lmIG9uZSBlbnRyeSBvdXQgb2YgdGhlIHBhaXIgaGFzIHZhbHVlIHRoZW4gcHJvY2VlZCB0byBydW4gdGhyb3VnaCB2YWxpZGF0aW9uXHJcblx0XHRcdFx0XHRcdGlmIChvcHRpb25zLmZpcnN0T2ZHcm91cFswXS52YWx1ZSB8fCBvcHRpb25zLnNlY29uZE9mR3JvdXBbMF0udmFsdWUpIHtcclxuXHRcdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCxydWxlc1tpXSwgcnVsZXMsIGksIG9wdGlvbnMsIG1ldGhvZHMuX2RhdGVUaW1lUmFuZ2UpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmIChlcnJvck1zZykgcmVxdWlyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRvcHRpb25zLnNob3dBcnJvdyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJtYXhDaGVja2JveFwiOlxyXG5cdFx0XHRcdFx0XHRmaWVsZCA9ICQoZm9ybS5maW5kKFwiaW5wdXRbbmFtZT0nXCIgKyBmaWVsZE5hbWUgKyBcIiddXCIpKTtcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fbWF4Q2hlY2tib3gpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJtaW5DaGVja2JveFwiOlxyXG5cdFx0XHRcdFx0XHRmaWVsZCA9ICQoZm9ybS5maW5kKFwiaW5wdXRbbmFtZT0nXCIgKyBmaWVsZE5hbWUgKyBcIiddXCIpKTtcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fbWluQ2hlY2tib3gpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJlcXVhbHNcIjpcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fZXF1YWxzKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFwiZnVuY0NhbGxcIjpcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fZnVuY0NhbGwpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJjcmVkaXRDYXJkXCI6XHJcblx0XHRcdFx0XHRcdGVycm9yTXNnID0gbWV0aG9kcy5fZ2V0RXJyb3JNZXNzYWdlKGZvcm0sIGZpZWxkLCBydWxlc1tpXSwgcnVsZXMsIGksIG9wdGlvbnMsIG1ldGhvZHMuX2NyZWRpdENhcmQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJjb25kUmVxdWlyZWRcIjpcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fY29uZFJlcXVpcmVkKTtcclxuXHRcdFx0XHRcdFx0aWYgKGVycm9yTXNnICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXF1aXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGVuZF92YWxpZGF0aW9uID0gZmFsc2U7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gSWYgd2Ugd2VyZSBwYXNzZWQgYmFjayBhbiBtZXNzYWdlIG9iamVjdCwgY2hlY2sgd2hhdCB0aGUgc3RhdHVzIHdhcyB0byBkZXRlcm1pbmUgd2hhdCB0byBkb1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgZXJyb3JNc2cgPT0gXCJvYmplY3RcIikge1xyXG5cdFx0XHRcdFx0c3dpdGNoIChlcnJvck1zZy5zdGF0dXMpIHtcclxuXHRcdFx0XHRcdFx0Y2FzZSBcIl9icmVha1wiOlxyXG5cdFx0XHRcdFx0XHRcdGVuZF92YWxpZGF0aW9uID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0Ly8gSWYgd2UgaGF2ZSBhbiBlcnJvciBtZXNzYWdlLCBzZXQgZXJyb3JNc2cgdG8gdGhlIGVycm9yIG1lc3NhZ2VcclxuXHRcdFx0XHRcdFx0Y2FzZSBcIl9lcnJvclwiOlxyXG5cdFx0XHRcdFx0XHRcdGVycm9yTXNnID0gZXJyb3JNc2cubWVzc2FnZTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0Ly8gSWYgd2Ugd2FudCB0byB0aHJvdyBhbiBlcnJvciwgYnV0IG5vdCBzaG93IGEgcHJvbXB0LCByZXR1cm4gZWFybHkgd2l0aCB0cnVlXHJcblx0XHRcdFx0XHRcdGNhc2UgXCJfZXJyb3Jfbm9fcHJvbXB0XCI6XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdC8vIEFueXRoaW5nIGVsc2Ugd2UgY29udGludWUgb25cclxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gSWYgaXQgaGFzIGJlZW4gc3BlY2lmaWVkIHRoYXQgdmFsaWRhdGlvbiBzaG91bGQgZW5kIG5vdywgYnJlYWtcclxuXHRcdFx0XHRpZiAoZW5kX3ZhbGlkYXRpb24pIHtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvLyBJZiB3ZSBoYXZlIGEgc3RyaW5nLCB0aGF0IG1lYW5zIHRoYXQgd2UgaGF2ZSBhbiBlcnJvciwgc28gYWRkIGl0IHRvIHRoZSBlcnJvciBtZXNzYWdlLlxyXG5cdFx0XHRcdGlmICh0eXBlb2YgZXJyb3JNc2cgPT0gJ3N0cmluZycpIHtcclxuXHRcdFx0XHRcdHByb21wdFRleHQgKz0gZXJyb3JNc2cgKyBcIjxici8+XCI7XHJcblx0XHRcdFx0XHRvcHRpb25zLmlzRXJyb3IgPSB0cnVlO1xyXG5cdFx0XHRcdFx0ZmllbGRfZXJyb3JzKys7XHJcblx0XHRcdFx0fVx0XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8gSWYgdGhlIHJ1bGVzIHJlcXVpcmVkIGlzIG5vdCBhZGRlZCwgYW4gZW1wdHkgZmllbGQgaXMgbm90IHZhbGlkYXRlZFxyXG5cdFx0XHRpZighcmVxdWlyZWQgJiYgIShmaWVsZC52YWwoKSkgJiYgZmllbGQudmFsKCkubGVuZ3RoIDwgMSkgb3B0aW9ucy5pc0Vycm9yID0gZmFsc2U7XHJcblxyXG5cdFx0XHQvLyBIYWNrIGZvciByYWRpby9jaGVja2JveCBncm91cCBidXR0b24sIHRoZSB2YWxpZGF0aW9uIGdvIGludG8gdGhlXHJcblx0XHRcdC8vIGZpcnN0IHJhZGlvL2NoZWNrYm94IG9mIHRoZSBncm91cFxyXG5cdFx0XHR2YXIgZmllbGRUeXBlID0gZmllbGQucHJvcChcInR5cGVcIik7XHJcblx0XHRcdHZhciBwb3NpdGlvblR5cGU9ZmllbGQuZGF0YShcInByb21wdFBvc2l0aW9uXCIpIHx8IG9wdGlvbnMucHJvbXB0UG9zaXRpb247XHJcblxyXG5cdFx0XHRpZiAoKGZpZWxkVHlwZSA9PSBcInJhZGlvXCIgfHwgZmllbGRUeXBlID09IFwiY2hlY2tib3hcIikgJiYgZm9ybS5maW5kKFwiaW5wdXRbbmFtZT0nXCIgKyBmaWVsZE5hbWUgKyBcIiddXCIpLnNpemUoKSA+IDEpIHtcclxuXHRcdFx0XHRpZihwb3NpdGlvblR5cGUgPT09ICdpbmxpbmUnKSB7XHJcblx0XHRcdFx0XHRmaWVsZCA9ICQoZm9ybS5maW5kKFwiaW5wdXRbbmFtZT0nXCIgKyBmaWVsZE5hbWUgKyBcIiddW3R5cGUhPWhpZGRlbl06bGFzdFwiKSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRmaWVsZCA9ICQoZm9ybS5maW5kKFwiaW5wdXRbbmFtZT0nXCIgKyBmaWVsZE5hbWUgKyBcIiddW3R5cGUhPWhpZGRlbl06Zmlyc3RcIikpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRvcHRpb25zLnNob3dBcnJvdyA9IGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihmaWVsZC5pcyhcIjpoaWRkZW5cIikgJiYgb3B0aW9ucy5wcmV0dHlTZWxlY3QpIHtcclxuXHRcdFx0XHRmaWVsZCA9IGZvcm0uZmluZChcIiNcIiArIG9wdGlvbnMudXNlUHJlZml4ICsgbWV0aG9kcy5fanFTZWxlY3RvcihmaWVsZC5hdHRyKCdpZCcpKSArIG9wdGlvbnMudXNlU3VmZml4KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuaXNFcnJvciAmJiBvcHRpb25zLnNob3dQcm9tcHRzKXtcclxuXHRcdFx0XHRtZXRob2RzLl9zaG93UHJvbXB0KGZpZWxkLCBwcm9tcHRUZXh0LCBwcm9tcHRUeXBlLCBmYWxzZSwgb3B0aW9ucyk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdGlmICghaXNBamF4VmFsaWRhdG9yKSBtZXRob2RzLl9jbG9zZVByb21wdChmaWVsZCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICghaXNBamF4VmFsaWRhdG9yKSB7XHJcblx0XHRcdFx0ZmllbGQudHJpZ2dlcihcImpxdi5maWVsZC5yZXN1bHRcIiwgW2ZpZWxkLCBvcHRpb25zLmlzRXJyb3IsIHByb21wdFRleHRdKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0LyogUmVjb3JkIGVycm9yICovXHJcblx0XHRcdHZhciBlcnJpbmRleCA9ICQuaW5BcnJheShmaWVsZFswXSwgb3B0aW9ucy5JbnZhbGlkRmllbGRzKTtcclxuXHRcdFx0aWYgKGVycmluZGV4ID09IC0xKSB7XHJcblx0XHRcdFx0aWYgKG9wdGlvbnMuaXNFcnJvcilcclxuXHRcdFx0XHRvcHRpb25zLkludmFsaWRGaWVsZHMucHVzaChmaWVsZFswXSk7XHJcblx0XHRcdH0gZWxzZSBpZiAoIW9wdGlvbnMuaXNFcnJvcikge1xyXG5cdFx0XHRcdG9wdGlvbnMuSW52YWxpZEZpZWxkcy5zcGxpY2UoZXJyaW5kZXgsIDEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdG1ldGhvZHMuX2hhbmRsZVN0YXR1c0Nzc0NsYXNzZXMoZmllbGQsIG9wdGlvbnMpO1xyXG5cdFxyXG5cdFx0XHQvKiBydW4gY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGVhY2ggZmllbGQgKi9cclxuXHRcdFx0aWYgKG9wdGlvbnMuaXNFcnJvciAmJiBvcHRpb25zLm9uRmllbGRGYWlsdXJlKVxyXG5cdFx0XHRcdG9wdGlvbnMub25GaWVsZEZhaWx1cmUoZmllbGQpO1xyXG5cclxuXHRcdFx0aWYgKCFvcHRpb25zLmlzRXJyb3IgJiYgb3B0aW9ucy5vbkZpZWxkU3VjY2VzcylcclxuXHRcdFx0XHRvcHRpb25zLm9uRmllbGRTdWNjZXNzKGZpZWxkKTtcclxuXHJcblx0XHRcdHJldHVybiBvcHRpb25zLmlzRXJyb3I7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIEhhbmRsaW5nIGNzcyBjbGFzc2VzIG9mIGZpZWxkcyBpbmRpY2F0aW5nIHJlc3VsdCBvZiB2YWxpZGF0aW9uIFxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fVxyXG5cdFx0KiAgICAgICAgICAgIGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX1cclxuXHRcdCogICAgICAgICAgICBmaWVsZCdzIHZhbGlkYXRpb24gcnVsZXMgICAgICAgICAgICBcclxuXHRcdCogQHByaXZhdGVcclxuXHRcdCovXHJcblx0XHRfaGFuZGxlU3RhdHVzQ3NzQ2xhc3NlczogZnVuY3Rpb24oZmllbGQsIG9wdGlvbnMpIHtcclxuXHRcdFx0LyogcmVtb3ZlIGFsbCBjbGFzc2VzICovXHJcblx0XHRcdGlmKG9wdGlvbnMuYWRkU3VjY2Vzc0Nzc0NsYXNzVG9GaWVsZClcclxuXHRcdFx0XHRmaWVsZC5yZW1vdmVDbGFzcyhvcHRpb25zLmFkZFN1Y2Nlc3NDc3NDbGFzc1RvRmllbGQpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYob3B0aW9ucy5hZGRGYWlsdXJlQ3NzQ2xhc3NUb0ZpZWxkKVxyXG5cdFx0XHRcdGZpZWxkLnJlbW92ZUNsYXNzKG9wdGlvbnMuYWRkRmFpbHVyZUNzc0NsYXNzVG9GaWVsZCk7XHJcblx0XHRcdFxyXG5cdFx0XHQvKiBBZGQgY2xhc3NlcyAqL1xyXG5cdFx0XHRpZiAob3B0aW9ucy5hZGRTdWNjZXNzQ3NzQ2xhc3NUb0ZpZWxkICYmICFvcHRpb25zLmlzRXJyb3IpXHJcblx0XHRcdFx0ZmllbGQuYWRkQ2xhc3Mob3B0aW9ucy5hZGRTdWNjZXNzQ3NzQ2xhc3NUb0ZpZWxkKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmIChvcHRpb25zLmFkZEZhaWx1cmVDc3NDbGFzc1RvRmllbGQgJiYgb3B0aW9ucy5pc0Vycm9yKVxyXG5cdFx0XHRcdGZpZWxkLmFkZENsYXNzKG9wdGlvbnMuYWRkRmFpbHVyZUNzc0NsYXNzVG9GaWVsZCk7XHRcdFxyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0IC8qKioqKioqKioqKioqKioqKioqKlxyXG5cdFx0ICAqIF9nZXRFcnJvck1lc3NhZ2VcclxuXHRcdCAgKlxyXG5cdFx0ICAqIEBwYXJhbSBmb3JtXHJcblx0XHQgICogQHBhcmFtIGZpZWxkXHJcblx0XHQgICogQHBhcmFtIHJ1bGVcclxuXHRcdCAgKiBAcGFyYW0gcnVsZXNcclxuXHRcdCAgKiBAcGFyYW0gaVxyXG5cdFx0ICAqIEBwYXJhbSBvcHRpb25zXHJcblx0XHQgICogQHBhcmFtIG9yaWdpbmFsVmFsaWRhdGlvbk1ldGhvZFxyXG5cdFx0ICAqIEByZXR1cm4geyp9XHJcblx0XHQgICogQHByaXZhdGVcclxuXHRcdCAgKi9cclxuXHRcdCBfZ2V0RXJyb3JNZXNzYWdlOmZ1bmN0aW9uIChmb3JtLCBmaWVsZCwgcnVsZSwgcnVsZXMsIGksIG9wdGlvbnMsIG9yaWdpbmFsVmFsaWRhdGlvbk1ldGhvZCkge1xyXG5cdFx0XHQgLy8gSWYgd2UgYXJlIHVzaW5nIHRoZSBjdXN0b24gdmFsaWRhdGlvbiB0eXBlLCBidWlsZCB0aGUgaW5kZXggZm9yIHRoZSBydWxlLlxyXG5cdFx0XHQgLy8gT3RoZXJ3aXNlIGlmIHdlIGFyZSBkb2luZyBhIGZ1bmN0aW9uIGNhbGwsIG1ha2UgdGhlIGNhbGwgYW5kIHJldHVybiB0aGUgb2JqZWN0XHJcblx0XHRcdCAvLyB0aGF0IGlzIHBhc3NlZCBiYWNrLlxyXG5cdCBcdFx0IHZhciBydWxlX2luZGV4ID0galF1ZXJ5LmluQXJyYXkocnVsZSwgcnVsZXMpO1xyXG5cdFx0XHQgaWYgKHJ1bGUgPT09IFwiY3VzdG9tXCIgfHwgcnVsZSA9PT0gXCJmdW5jQ2FsbFwiKSB7XHJcblx0XHRcdFx0IHZhciBjdXN0b21fdmFsaWRhdGlvbl90eXBlID0gcnVsZXNbcnVsZV9pbmRleCArIDFdO1xyXG5cdFx0XHRcdCBydWxlID0gcnVsZSArIFwiW1wiICsgY3VzdG9tX3ZhbGlkYXRpb25fdHlwZSArIFwiXVwiO1xyXG5cdFx0XHRcdCAvLyBEZWxldGUgdGhlIHJ1bGUgZnJvbSB0aGUgcnVsZXMgYXJyYXkgc28gdGhhdCBpdCBkb2Vzbid0IHRyeSB0byBjYWxsIHRoZVxyXG5cdFx0XHQgICAgLy8gc2FtZSBydWxlIG92ZXIgYWdhaW5cclxuXHRcdFx0ICAgIGRlbGV0ZShydWxlc1tydWxlX2luZGV4XSk7XHJcblx0XHRcdCB9XHJcblx0XHRcdCAvLyBDaGFuZ2UgdGhlIHJ1bGUgdG8gdGhlIGNvbXBvc2l0ZSBydWxlLCBpZiBpdCB3YXMgZGlmZmVyZW50IGZyb20gdGhlIG9yaWdpbmFsXHJcblx0XHRcdCB2YXIgYWx0ZXJlZFJ1bGUgPSBydWxlO1xyXG5cclxuXHJcblx0XHRcdCB2YXIgZWxlbWVudF9jbGFzc2VzID0gKGZpZWxkLmF0dHIoXCJkYXRhLXZhbGlkYXRpb24tZW5naW5lXCIpKSA/IGZpZWxkLmF0dHIoXCJkYXRhLXZhbGlkYXRpb24tZW5naW5lXCIpIDogZmllbGQuYXR0cihcImNsYXNzXCIpO1xyXG5cdFx0XHQgdmFyIGVsZW1lbnRfY2xhc3Nlc19hcnJheSA9IGVsZW1lbnRfY2xhc3Nlcy5zcGxpdChcIiBcIik7XHJcblxyXG5cdFx0XHQgLy8gQ2FsbCB0aGUgb3JpZ2luYWwgdmFsaWRhdGlvbiBtZXRob2QuIElmIHdlIGFyZSBkZWFsaW5nIHdpdGggZGF0ZXMgb3IgY2hlY2tib3hlcywgYWxzbyBwYXNzIHRoZSBmb3JtXHJcblx0XHRcdCB2YXIgZXJyb3JNc2c7XHJcblx0XHRcdCBpZiAocnVsZSA9PSBcImZ1dHVyZVwiIHx8IHJ1bGUgPT0gXCJwYXN0XCIgIHx8IHJ1bGUgPT0gXCJtYXhDaGVja2JveFwiIHx8IHJ1bGUgPT0gXCJtaW5DaGVja2JveFwiKSB7XHJcblx0XHRcdFx0IGVycm9yTXNnID0gb3JpZ2luYWxWYWxpZGF0aW9uTWV0aG9kKGZvcm0sIGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucyk7XHJcblx0XHRcdCB9IGVsc2Uge1xyXG5cdFx0XHRcdCBlcnJvck1zZyA9IG9yaWdpbmFsVmFsaWRhdGlvbk1ldGhvZChmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpO1xyXG5cdFx0XHQgfVxyXG5cclxuXHRcdFx0IC8vIElmIHRoZSBvcmlnaW5hbCB2YWxpZGF0aW9uIG1ldGhvZCByZXR1cm5lZCBhbiBlcnJvciBhbmQgd2UgaGF2ZSBhIGN1c3RvbSBlcnJvciBtZXNzYWdlLFxyXG5cdFx0XHQgLy8gcmV0dXJuIHRoZSBjdXN0b20gbWVzc2FnZSBpbnN0ZWFkLiBPdGhlcndpc2UgcmV0dXJuIHRoZSBvcmlnaW5hbCBlcnJvciBtZXNzYWdlLlxyXG5cdFx0XHQgaWYgKGVycm9yTXNnICE9IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdCB2YXIgY3VzdG9tX21lc3NhZ2UgPSBtZXRob2RzLl9nZXRDdXN0b21FcnJvck1lc3NhZ2UoJChmaWVsZCksIGVsZW1lbnRfY2xhc3Nlc19hcnJheSwgYWx0ZXJlZFJ1bGUsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdCBpZiAoY3VzdG9tX21lc3NhZ2UpIGVycm9yTXNnID0gY3VzdG9tX21lc3NhZ2U7XHJcblx0XHRcdCB9XHJcblx0XHRcdCByZXR1cm4gZXJyb3JNc2c7XHJcblxyXG5cdFx0IH0sXHJcblx0XHQgX2dldEN1c3RvbUVycm9yTWVzc2FnZTpmdW5jdGlvbiAoZmllbGQsIGNsYXNzZXMsIHJ1bGUsIG9wdGlvbnMpIHtcclxuXHRcdFx0dmFyIGN1c3RvbV9tZXNzYWdlID0gZmFsc2U7XHJcblx0XHRcdHZhciB2YWxpZGl0eVByb3AgPSAvXmN1c3RvbVxcWy4qXFxdJC8udGVzdChydWxlKSA/IG1ldGhvZHMuX3ZhbGlkaXR5UHJvcFtcImN1c3RvbVwiXSA6IG1ldGhvZHMuX3ZhbGlkaXR5UHJvcFtydWxlXTtcclxuXHRcdFx0IC8vIElmIHRoZXJlIGlzIGEgdmFsaWRpdHlQcm9wIGZvciB0aGlzIHJ1bGUsIGNoZWNrIHRvIHNlZSBpZiB0aGUgZmllbGQgaGFzIGFuIGF0dHJpYnV0ZSBmb3IgaXRcclxuXHRcdFx0aWYgKHZhbGlkaXR5UHJvcCAhPSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRjdXN0b21fbWVzc2FnZSA9IGZpZWxkLmF0dHIoXCJkYXRhLWVycm9ybWVzc2FnZS1cIit2YWxpZGl0eVByb3ApO1xyXG5cdFx0XHRcdC8vIElmIHRoZXJlIHdhcyBhbiBlcnJvciBtZXNzYWdlIGZvciBpdCwgcmV0dXJuIHRoZSBtZXNzYWdlXHJcblx0XHRcdFx0aWYgKGN1c3RvbV9tZXNzYWdlICE9IHVuZGVmaW5lZCkgXHJcblx0XHRcdFx0XHRyZXR1cm4gY3VzdG9tX21lc3NhZ2U7XHJcblx0XHRcdH1cclxuXHRcdFx0Y3VzdG9tX21lc3NhZ2UgPSBmaWVsZC5hdHRyKFwiZGF0YS1lcnJvcm1lc3NhZ2VcIik7XHJcblx0XHRcdCAvLyBJZiB0aGVyZSBpcyBhbiBpbmxpbmUgY3VzdG9tIGVycm9yIG1lc3NhZ2UsIHJldHVybiBpdFxyXG5cdFx0XHRpZiAoY3VzdG9tX21lc3NhZ2UgIT0gdW5kZWZpbmVkKSBcclxuXHRcdFx0XHRyZXR1cm4gY3VzdG9tX21lc3NhZ2U7XHJcblx0XHRcdHZhciBpZCA9ICcjJyArIGZpZWxkLmF0dHIoXCJpZFwiKTtcclxuXHRcdFx0Ly8gSWYgd2UgaGF2ZSBjdXN0b20gbWVzc2FnZXMgZm9yIHRoZSBlbGVtZW50J3MgaWQsIGdldCB0aGUgbWVzc2FnZSBmb3IgdGhlIHJ1bGUgZnJvbSB0aGUgaWQuXHJcblx0XHRcdC8vIE90aGVyd2lzZSwgaWYgd2UgaGF2ZSBjdXN0b20gbWVzc2FnZXMgZm9yIHRoZSBlbGVtZW50J3MgY2xhc3NlcywgdXNlIHRoZSBmaXJzdCBjbGFzcyBtZXNzYWdlIHdlIGZpbmQgaW5zdGVhZC5cclxuXHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmN1c3RvbV9lcnJvcl9tZXNzYWdlc1tpZF0gIT0gXCJ1bmRlZmluZWRcIiAmJlxyXG5cdFx0XHRcdHR5cGVvZiBvcHRpb25zLmN1c3RvbV9lcnJvcl9tZXNzYWdlc1tpZF1bcnVsZV0gIT0gXCJ1bmRlZmluZWRcIiApIHtcclxuXHRcdFx0XHRcdFx0ICBjdXN0b21fbWVzc2FnZSA9IG9wdGlvbnMuY3VzdG9tX2Vycm9yX21lc3NhZ2VzW2lkXVtydWxlXVsnbWVzc2FnZSddO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGNsYXNzZXMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGggJiYgY2xhc3Nlcy5sZW5ndGggPiAwOyBpKyspIHtcclxuXHRcdFx0XHRcdCB2YXIgZWxlbWVudF9jbGFzcyA9IFwiLlwiICsgY2xhc3Nlc1tpXTtcclxuXHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jdXN0b21fZXJyb3JfbWVzc2FnZXNbZWxlbWVudF9jbGFzc10gIT0gXCJ1bmRlZmluZWRcIiAmJlxyXG5cdFx0XHRcdFx0XHR0eXBlb2Ygb3B0aW9ucy5jdXN0b21fZXJyb3JfbWVzc2FnZXNbZWxlbWVudF9jbGFzc11bcnVsZV0gIT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHRcdFx0XHRcdGN1c3RvbV9tZXNzYWdlID0gb3B0aW9ucy5jdXN0b21fZXJyb3JfbWVzc2FnZXNbZWxlbWVudF9jbGFzc11bcnVsZV1bJ21lc3NhZ2UnXTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCFjdXN0b21fbWVzc2FnZSAmJlxyXG5cdFx0XHRcdHR5cGVvZiBvcHRpb25zLmN1c3RvbV9lcnJvcl9tZXNzYWdlc1tydWxlXSAhPSBcInVuZGVmaW5lZFwiICYmXHJcblx0XHRcdFx0dHlwZW9mIG9wdGlvbnMuY3VzdG9tX2Vycm9yX21lc3NhZ2VzW3J1bGVdWydtZXNzYWdlJ10gIT0gXCJ1bmRlZmluZWRcIil7XHJcblx0XHRcdFx0XHQgY3VzdG9tX21lc3NhZ2UgPSBvcHRpb25zLmN1c3RvbV9lcnJvcl9tZXNzYWdlc1tydWxlXVsnbWVzc2FnZSddO1xyXG5cdFx0XHQgfVxyXG5cdFx0XHQgcmV0dXJuIGN1c3RvbV9tZXNzYWdlO1xyXG5cdFx0IH0sXHJcblx0XHQgX3ZhbGlkaXR5UHJvcDoge1xyXG5cdFx0XHQgXCJyZXF1aXJlZFwiOiBcInZhbHVlLW1pc3NpbmdcIixcclxuXHRcdFx0IFwiY3VzdG9tXCI6IFwiY3VzdG9tLWVycm9yXCIsXHJcblx0XHRcdCBcImdyb3VwUmVxdWlyZWRcIjogXCJ2YWx1ZS1taXNzaW5nXCIsXHJcblx0XHRcdCBcImFqYXhcIjogXCJjdXN0b20tZXJyb3JcIixcclxuXHRcdFx0IFwibWluU2l6ZVwiOiBcInJhbmdlLXVuZGVyZmxvd1wiLFxyXG5cdFx0XHQgXCJtYXhTaXplXCI6IFwicmFuZ2Utb3ZlcmZsb3dcIixcclxuXHRcdFx0IFwibWluXCI6IFwicmFuZ2UtdW5kZXJmbG93XCIsXHJcblx0XHRcdCBcIm1heFwiOiBcInJhbmdlLW92ZXJmbG93XCIsXHJcblx0XHRcdCBcInBhc3RcIjogXCJ0eXBlLW1pc21hdGNoXCIsXHJcblx0XHRcdCBcImZ1dHVyZVwiOiBcInR5cGUtbWlzbWF0Y2hcIixcclxuXHRcdFx0IFwiZGF0ZVJhbmdlXCI6IFwidHlwZS1taXNtYXRjaFwiLFxyXG5cdFx0XHQgXCJkYXRlVGltZVJhbmdlXCI6IFwidHlwZS1taXNtYXRjaFwiLFxyXG5cdFx0XHQgXCJtYXhDaGVja2JveFwiOiBcInJhbmdlLW92ZXJmbG93XCIsXHJcblx0XHRcdCBcIm1pbkNoZWNrYm94XCI6IFwicmFuZ2UtdW5kZXJmbG93XCIsXHJcblx0XHRcdCBcImVxdWFsc1wiOiBcInBhdHRlcm4tbWlzbWF0Y2hcIixcclxuXHRcdFx0IFwiZnVuY0NhbGxcIjogXCJjdXN0b20tZXJyb3JcIixcclxuXHRcdFx0IFwiY3JlZGl0Q2FyZFwiOiBcInBhdHRlcm4tbWlzbWF0Y2hcIixcclxuXHRcdFx0IFwiY29uZFJlcXVpcmVkXCI6IFwidmFsdWUtbWlzc2luZ1wiXHJcblx0XHQgfSxcclxuXHRcdC8qKlxyXG5cdFx0KiBSZXF1aXJlZCB2YWxpZGF0aW9uXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gcnVsZXNcclxuXHRcdCogQHBhcmFtIHtpbnR9IGkgcnVsZXMgaW5kZXhcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgdXNlciBvcHRpb25zXHJcblx0XHQqIEBwYXJhbSB7Ym9vbH0gY29uZFJlcXVpcmVkIGZsYWcgd2hlbiBtZXRob2QgaXMgdXNlZCBmb3IgaW50ZXJuYWwgcHVycG9zZSBpbiBjb25kUmVxdWlyZWQgY2hlY2tcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfcmVxdWlyZWQ6IGZ1bmN0aW9uKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucywgY29uZFJlcXVpcmVkKSB7XHJcblx0XHRcdHN3aXRjaCAoZmllbGQucHJvcChcInR5cGVcIikpIHtcclxuXHRcdFx0XHRjYXNlIFwidGV4dFwiOlxyXG5cdFx0XHRcdGNhc2UgXCJwYXNzd29yZFwiOlxyXG5cdFx0XHRcdGNhc2UgXCJ0ZXh0YXJlYVwiOlxyXG5cdFx0XHRcdGNhc2UgXCJmaWxlXCI6XHJcblx0XHRcdFx0Y2FzZSBcInNlbGVjdC1vbmVcIjpcclxuXHRcdFx0XHRjYXNlIFwic2VsZWN0LW11bHRpcGxlXCI6XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdHZhciBmaWVsZF92YWwgICAgICA9ICQudHJpbSggZmllbGQudmFsKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuXHRcdFx0XHRcdHZhciBkdl9wbGFjZWhvbGRlciA9ICQudHJpbSggZmllbGQuYXR0cihcImRhdGEtdmFsaWRhdGlvbi1wbGFjZWhvbGRlclwiKSApO1xyXG5cdFx0XHRcdFx0dmFyIHBsYWNlaG9sZGVyICAgID0gJC50cmltKCBmaWVsZC5hdHRyKFwicGxhY2Vob2xkZXJcIikgICAgICAgICAgICAgICAgICk7XHJcblx0XHRcdFx0XHRpZiAoXHJcblx0XHRcdFx0XHRcdCAgICggIWZpZWxkX3ZhbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuXHRcdFx0XHRcdFx0fHwgKCBkdl9wbGFjZWhvbGRlciAmJiBmaWVsZF92YWwgPT0gZHZfcGxhY2Vob2xkZXIgKVxyXG5cdFx0XHRcdFx0XHR8fCAoIHBsYWNlaG9sZGVyICAgICYmIGZpZWxkX3ZhbCA9PSBwbGFjZWhvbGRlciAgICApXHJcblx0XHRcdFx0XHQpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuYWxscnVsZXNbcnVsZXNbaV1dLmFsZXJ0VGV4dDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgXCJyYWRpb1wiOlxyXG5cdFx0XHRcdGNhc2UgXCJjaGVja2JveFwiOlxyXG5cdFx0XHRcdFx0Ly8gbmV3IHZhbGlkYXRpb24gc3R5bGUgdG8gb25seSBjaGVjayBkZXBlbmRlbnQgZmllbGRcclxuXHRcdFx0XHRcdGlmIChjb25kUmVxdWlyZWQpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCFmaWVsZC5hdHRyKCdjaGVja2VkJykpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0Q2hlY2tib3hNdWx0aXBsZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vIG9sZCB2YWxpZGF0aW9uIHN0eWxlXHJcblx0XHRcdFx0XHR2YXIgZm9ybSA9IGZpZWxkLmNsb3Nlc3QoXCJmb3JtLCAudmFsaWRhdGlvbkVuZ2luZUNvbnRhaW5lclwiKTtcclxuXHRcdFx0XHRcdHZhciBuYW1lID0gZmllbGQuYXR0cihcIm5hbWVcIik7XHJcblx0XHRcdFx0XHRpZiAoZm9ybS5maW5kKFwiaW5wdXRbbmFtZT0nXCIgKyBuYW1lICsgXCInXTpjaGVja2VkXCIpLnNpemUoKSA9PSAwKSB7XHJcblx0XHRcdFx0XHRcdGlmIChmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPSdcIiArIG5hbWUgKyBcIiddOnZpc2libGVcIikuc2l6ZSgpID09IDEpXHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuYWxscnVsZXNbcnVsZXNbaV1dLmFsZXJ0VGV4dENoZWNrYm94ZTtcclxuXHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHRDaGVja2JveE11bHRpcGxlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogVmFsaWRhdGUgdGhhdCAxIGZyb20gdGhlIGdyb3VwIGZpZWxkIGlzIHJlcXVpcmVkXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gcnVsZXNcclxuXHRcdCogQHBhcmFtIHtpbnR9IGkgcnVsZXMgaW5kZXhcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gYW4gZXJyb3Igc3RyaW5nIGlmIHZhbGlkYXRpb24gZmFpbGVkXHJcblx0XHQqL1xyXG5cdFx0X2dyb3VwUmVxdWlyZWQ6IGZ1bmN0aW9uKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cdFx0XHR2YXIgY2xhc3NHcm91cCA9IFwiW1wiK29wdGlvbnMudmFsaWRhdGVBdHRyaWJ1dGUrXCIqPVwiICtydWxlc1tpICsgMV0gK1wiXVwiO1xyXG5cdFx0XHR2YXIgaXNWYWxpZCA9IGZhbHNlO1xyXG5cdFx0XHQvLyBDaGVjayBhbGwgZmllbGRzIGZyb20gdGhlIGdyb3VwXHJcblx0XHRcdGZpZWxkLmNsb3Nlc3QoXCJmb3JtLCAudmFsaWRhdGlvbkVuZ2luZUNvbnRhaW5lclwiKS5maW5kKGNsYXNzR3JvdXApLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRpZighbWV0aG9kcy5fcmVxdWlyZWQoJCh0aGlzKSwgcnVsZXMsIGksIG9wdGlvbnMpKXtcclxuXHRcdFx0XHRcdGlzVmFsaWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7IFxyXG5cclxuXHRcdFx0aWYoIWlzVmFsaWQpIHtcclxuXHRcdCAgcmV0dXJuIG9wdGlvbnMuYWxscnVsZXNbcnVsZXNbaV1dLmFsZXJ0VGV4dDtcclxuXHRcdH1cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogVmFsaWRhdGUgcnVsZXNcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfY3VzdG9tOiBmdW5jdGlvbihmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpIHtcclxuXHRcdFx0dmFyIGN1c3RvbVJ1bGUgPSBydWxlc1tpICsgMV07XHJcblx0XHRcdHZhciBydWxlID0gb3B0aW9ucy5hbGxydWxlc1tjdXN0b21SdWxlXTtcclxuXHRcdFx0dmFyIGZuO1xyXG5cdFx0XHRpZighcnVsZSkge1xyXG5cdFx0XHRcdGFsZXJ0KFwianF2OmN1c3RvbSBydWxlIG5vdCBmb3VuZCAtIFwiK2N1c3RvbVJ1bGUpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYocnVsZVtcInJlZ2V4XCJdKSB7XHJcblx0XHRcdFx0IHZhciBleD1ydWxlLnJlZ2V4O1xyXG5cdFx0XHRcdFx0aWYoIWV4KSB7XHJcblx0XHRcdFx0XHRcdGFsZXJ0KFwianF2OmN1c3RvbSByZWdleCBub3QgZm91bmQgLSBcIitjdXN0b21SdWxlKTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dmFyIHBhdHRlcm4gPSBuZXcgUmVnRXhwKGV4KTtcclxuXHJcblx0XHRcdFx0XHRpZiAoIXBhdHRlcm4udGVzdChmaWVsZC52YWwoKSkpIHJldHVybiBvcHRpb25zLmFsbHJ1bGVzW2N1c3RvbVJ1bGVdLmFsZXJ0VGV4dDtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHR9IGVsc2UgaWYocnVsZVtcImZ1bmNcIl0pIHtcclxuXHRcdFx0XHRmbiA9IHJ1bGVbXCJmdW5jXCJdOyBcclxuXHRcdFx0XHQgXHJcblx0XHRcdFx0aWYgKHR5cGVvZihmbikgIT09IFwiZnVuY3Rpb25cIikge1xyXG5cdFx0XHRcdFx0YWxlcnQoXCJqcXY6Y3VzdG9tIHBhcmFtZXRlciAnZnVuY3Rpb24nIGlzIG5vIGZ1bmN0aW9uIC0gXCIrY3VzdG9tUnVsZSk7XHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0IFxyXG5cdFx0XHRcdGlmICghZm4oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSlcclxuXHRcdFx0XHRcdHJldHVybiBvcHRpb25zLmFsbHJ1bGVzW2N1c3RvbVJ1bGVdLmFsZXJ0VGV4dDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRhbGVydChcImpxdjpjdXN0b20gdHlwZSBub3QgYWxsb3dlZCBcIitjdXN0b21SdWxlKTtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBWYWxpZGF0ZSBjdXN0b20gZnVuY3Rpb24gb3V0c2lkZSBvZiB0aGUgZW5naW5lIHNjb3BlXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gcnVsZXNcclxuXHRcdCogQHBhcmFtIHtpbnR9IGkgcnVsZXMgaW5kZXhcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gYW4gZXJyb3Igc3RyaW5nIGlmIHZhbGlkYXRpb24gZmFpbGVkXHJcblx0XHQqL1xyXG5cdFx0X2Z1bmNDYWxsOiBmdW5jdGlvbihmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpIHtcclxuXHRcdFx0dmFyIGZ1bmN0aW9uTmFtZSA9IHJ1bGVzW2kgKyAxXTtcclxuXHRcdFx0dmFyIGZuO1xyXG5cdFx0XHRpZihmdW5jdGlvbk5hbWUuaW5kZXhPZignLicpID4tMSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBuYW1lc3BhY2VzID0gZnVuY3Rpb25OYW1lLnNwbGl0KCcuJyk7XHJcblx0XHRcdFx0dmFyIHNjb3BlID0gd2luZG93O1xyXG5cdFx0XHRcdHdoaWxlKG5hbWVzcGFjZXMubGVuZ3RoKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHNjb3BlID0gc2NvcGVbbmFtZXNwYWNlcy5zaGlmdCgpXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Zm4gPSBzY29wZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Zm4gPSB3aW5kb3dbZnVuY3Rpb25OYW1lXSB8fCBvcHRpb25zLmN1c3RvbUZ1bmN0aW9uc1tmdW5jdGlvbk5hbWVdO1xyXG5cdFx0XHRpZiAodHlwZW9mKGZuKSA9PSAnZnVuY3Rpb24nKVxyXG5cdFx0XHRcdHJldHVybiBmbihmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpO1xyXG5cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogRmllbGQgbWF0Y2hcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfZXF1YWxzOiBmdW5jdGlvbihmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpIHtcclxuXHRcdFx0dmFyIGVxdWFsc0ZpZWxkID0gcnVsZXNbaSArIDFdO1xyXG5cclxuXHRcdFx0aWYgKGZpZWxkLnZhbCgpICE9ICQoXCIjXCIgKyBlcXVhbHNGaWVsZCkudmFsKCkpXHJcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuYWxscnVsZXMuZXF1YWxzLmFsZXJ0VGV4dDtcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ2hlY2sgdGhlIG1heGltdW0gc2l6ZSAoaW4gY2hhcmFjdGVycylcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfbWF4U2l6ZTogZnVuY3Rpb24oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblx0XHRcdHZhciBtYXggPSBydWxlc1tpICsgMV07XHJcblx0XHRcdHZhciBsZW4gPSBmaWVsZC52YWwoKS5sZW5ndGg7XHJcblxyXG5cdFx0XHRpZiAobGVuID4gbWF4KSB7XHJcblx0XHRcdFx0dmFyIHJ1bGUgPSBvcHRpb25zLmFsbHJ1bGVzLm1heFNpemU7XHJcblx0XHRcdFx0cmV0dXJuIHJ1bGUuYWxlcnRUZXh0ICsgbWF4ICsgcnVsZS5hbGVydFRleHQyO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENoZWNrIHRoZSBtaW5pbXVtIHNpemUgKGluIGNoYXJhY3RlcnMpXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gcnVsZXNcclxuXHRcdCogQHBhcmFtIHtpbnR9IGkgcnVsZXMgaW5kZXhcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gYW4gZXJyb3Igc3RyaW5nIGlmIHZhbGlkYXRpb24gZmFpbGVkXHJcblx0XHQqL1xyXG5cdFx0X21pblNpemU6IGZ1bmN0aW9uKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cdFx0XHR2YXIgbWluID0gcnVsZXNbaSArIDFdO1xyXG5cdFx0XHR2YXIgbGVuID0gZmllbGQudmFsKCkubGVuZ3RoO1xyXG5cclxuXHRcdFx0aWYgKGxlbiA8IG1pbikge1xyXG5cdFx0XHRcdHZhciBydWxlID0gb3B0aW9ucy5hbGxydWxlcy5taW5TaXplO1xyXG5cdFx0XHRcdHJldHVybiBydWxlLmFsZXJ0VGV4dCArIG1pbiArIHJ1bGUuYWxlcnRUZXh0MjtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBDaGVjayBudW1iZXIgbWluaW11bSB2YWx1ZVxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmaWVsZFxyXG5cdFx0KiBAcGFyYW0ge0FycmF5W1N0cmluZ119IHJ1bGVzXHJcblx0XHQqIEBwYXJhbSB7aW50fSBpIHJ1bGVzIGluZGV4XHJcblx0XHQqIEBwYXJhbSB7TWFwfVxyXG5cdFx0KiAgICAgICAgICAgIHVzZXIgb3B0aW9uc1xyXG5cdFx0KiBAcmV0dXJuIGFuIGVycm9yIHN0cmluZyBpZiB2YWxpZGF0aW9uIGZhaWxlZFxyXG5cdFx0Ki9cclxuXHRcdF9taW46IGZ1bmN0aW9uKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cdFx0XHR2YXIgbWluID0gcGFyc2VGbG9hdChydWxlc1tpICsgMV0pO1xyXG5cdFx0XHR2YXIgbGVuID0gcGFyc2VGbG9hdChmaWVsZC52YWwoKSk7XHJcblxyXG5cdFx0XHRpZiAobGVuIDwgbWluKSB7XHJcblx0XHRcdFx0dmFyIHJ1bGUgPSBvcHRpb25zLmFsbHJ1bGVzLm1pbjtcclxuXHRcdFx0XHRpZiAocnVsZS5hbGVydFRleHQyKSByZXR1cm4gcnVsZS5hbGVydFRleHQgKyBtaW4gKyBydWxlLmFsZXJ0VGV4dDI7XHJcblx0XHRcdFx0cmV0dXJuIHJ1bGUuYWxlcnRUZXh0ICsgbWluO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENoZWNrIG51bWJlciBtYXhpbXVtIHZhbHVlXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gcnVsZXNcclxuXHRcdCogQHBhcmFtIHtpbnR9IGkgcnVsZXMgaW5kZXhcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gYW4gZXJyb3Igc3RyaW5nIGlmIHZhbGlkYXRpb24gZmFpbGVkXHJcblx0XHQqL1xyXG5cdFx0X21heDogZnVuY3Rpb24oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblx0XHRcdHZhciBtYXggPSBwYXJzZUZsb2F0KHJ1bGVzW2kgKyAxXSk7XHJcblx0XHRcdHZhciBsZW4gPSBwYXJzZUZsb2F0KGZpZWxkLnZhbCgpKTtcclxuXHJcblx0XHRcdGlmIChsZW4gPm1heCApIHtcclxuXHRcdFx0XHR2YXIgcnVsZSA9IG9wdGlvbnMuYWxscnVsZXMubWF4O1xyXG5cdFx0XHRcdGlmIChydWxlLmFsZXJ0VGV4dDIpIHJldHVybiBydWxlLmFsZXJ0VGV4dCArIG1heCArIHJ1bGUuYWxlcnRUZXh0MjtcclxuXHRcdFx0XHQvL29yZWZhbG86IHRvIHJldmlldywgYWxzbyBkbyB0aGUgdHJhbnNsYXRpb25zXHJcblx0XHRcdFx0cmV0dXJuIHJ1bGUuYWxlcnRUZXh0ICsgbWF4O1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENoZWNrcyBkYXRlIGlzIGluIHRoZSBwYXN0XHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gcnVsZXNcclxuXHRcdCogQHBhcmFtIHtpbnR9IGkgcnVsZXMgaW5kZXhcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gYW4gZXJyb3Igc3RyaW5nIGlmIHZhbGlkYXRpb24gZmFpbGVkXHJcblx0XHQqL1xyXG5cdFx0X3Bhc3Q6IGZ1bmN0aW9uKGZvcm0sIGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cclxuXHRcdFx0dmFyIHA9cnVsZXNbaSArIDFdO1xyXG5cdFx0XHR2YXIgZmllbGRBbHQgPSAkKGZvcm0uZmluZChcImlucHV0W25hbWU9J1wiICsgcC5yZXBsYWNlKC9eIysvLCAnJykgKyBcIiddXCIpKTtcclxuXHRcdFx0dmFyIHBkYXRlO1xyXG5cclxuXHRcdFx0aWYgKHAudG9Mb3dlckNhc2UoKSA9PSBcIm5vd1wiKSB7XHJcblx0XHRcdFx0cGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHVuZGVmaW5lZCAhPSBmaWVsZEFsdC52YWwoKSkge1xyXG5cdFx0XHRcdGlmIChmaWVsZEFsdC5pcyhcIjpkaXNhYmxlZFwiKSlcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRwZGF0ZSA9IG1ldGhvZHMuX3BhcnNlRGF0ZShmaWVsZEFsdC52YWwoKSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cGRhdGUgPSBtZXRob2RzLl9wYXJzZURhdGUocCk7XHJcblx0XHRcdH1cclxuXHRcdFx0dmFyIHZkYXRlID0gbWV0aG9kcy5fcGFyc2VEYXRlKGZpZWxkLnZhbCgpKTtcclxuXHJcblx0XHRcdGlmICh2ZGF0ZSA+IHBkYXRlICkge1xyXG5cdFx0XHRcdHZhciBydWxlID0gb3B0aW9ucy5hbGxydWxlcy5wYXN0O1xyXG5cdFx0XHRcdGlmIChydWxlLmFsZXJ0VGV4dDIpIHJldHVybiBydWxlLmFsZXJ0VGV4dCArIG1ldGhvZHMuX2RhdGVUb1N0cmluZyhwZGF0ZSkgKyBydWxlLmFsZXJ0VGV4dDI7XHJcblx0XHRcdFx0cmV0dXJuIHJ1bGUuYWxlcnRUZXh0ICsgbWV0aG9kcy5fZGF0ZVRvU3RyaW5nKHBkYXRlKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBDaGVja3MgZGF0ZSBpcyBpbiB0aGUgZnV0dXJlXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gcnVsZXNcclxuXHRcdCogQHBhcmFtIHtpbnR9IGkgcnVsZXMgaW5kZXhcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gYW4gZXJyb3Igc3RyaW5nIGlmIHZhbGlkYXRpb24gZmFpbGVkXHJcblx0XHQqL1xyXG5cdFx0X2Z1dHVyZTogZnVuY3Rpb24oZm9ybSwgZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblxyXG5cdFx0XHR2YXIgcD1ydWxlc1tpICsgMV07XHJcblx0XHRcdHZhciBmaWVsZEFsdCA9ICQoZm9ybS5maW5kKFwiaW5wdXRbbmFtZT0nXCIgKyBwLnJlcGxhY2UoL14jKy8sICcnKSArIFwiJ11cIikpO1xyXG5cdFx0XHR2YXIgcGRhdGU7XHJcblxyXG5cdFx0XHRpZiAocC50b0xvd2VyQ2FzZSgpID09IFwibm93XCIpIHtcclxuXHRcdFx0XHRwZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRcdH0gZWxzZSBpZiAodW5kZWZpbmVkICE9IGZpZWxkQWx0LnZhbCgpKSB7XHJcblx0XHRcdFx0aWYgKGZpZWxkQWx0LmlzKFwiOmRpc2FibGVkXCIpKVxyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdHBkYXRlID0gbWV0aG9kcy5fcGFyc2VEYXRlKGZpZWxkQWx0LnZhbCgpKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRwZGF0ZSA9IG1ldGhvZHMuX3BhcnNlRGF0ZShwKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR2YXIgdmRhdGUgPSBtZXRob2RzLl9wYXJzZURhdGUoZmllbGQudmFsKCkpO1xyXG5cclxuXHRcdFx0aWYgKHZkYXRlIDwgcGRhdGUgKSB7XHJcblx0XHRcdFx0dmFyIHJ1bGUgPSBvcHRpb25zLmFsbHJ1bGVzLmZ1dHVyZTtcclxuXHRcdFx0XHRpZiAocnVsZS5hbGVydFRleHQyKVxyXG5cdFx0XHRcdFx0cmV0dXJuIHJ1bGUuYWxlcnRUZXh0ICsgbWV0aG9kcy5fZGF0ZVRvU3RyaW5nKHBkYXRlKSArIHJ1bGUuYWxlcnRUZXh0MjtcclxuXHRcdFx0XHRyZXR1cm4gcnVsZS5hbGVydFRleHQgKyBtZXRob2RzLl9kYXRlVG9TdHJpbmcocGRhdGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENoZWNrcyBpZiB2YWxpZCBkYXRlXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7c3RyaW5nfSBkYXRlIHN0cmluZ1xyXG5cdFx0KiBAcmV0dXJuIGEgYm9vbCBiYXNlZCBvbiBkZXRlcm1pbmF0aW9uIG9mIHZhbGlkIGRhdGVcclxuXHRcdCovXHJcblx0XHRfaXNEYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuXHRcdFx0dmFyIGRhdGVSZWdFeCA9IG5ldyBSZWdFeHAoL15cXGR7NH1bXFwvXFwtXSgwP1sxLTldfDFbMDEyXSlbXFwvXFwtXSgwP1sxLTldfFsxMl1bMC05XXwzWzAxXSkkfF4oPzooPzooPzowP1sxMzU3OF18MVswMl0pKFxcL3wtKTMxKXwoPzooPzowP1sxLDMtOV18MVswLTJdKShcXC98LSkoPzoyOXwzMCkpKShcXC98LSkoPzpbMS05XVxcZFxcZFxcZHxcXGRbMS05XVxcZFxcZHxcXGRcXGRbMS05XVxcZHxcXGRcXGRcXGRbMS05XSkkfF4oPzooPzowP1sxLTldfDFbMC0yXSkoXFwvfC0pKD86MD9bMS05XXwxXFxkfDJbMC04XSkpKFxcL3wtKSg/OlsxLTldXFxkXFxkXFxkfFxcZFsxLTldXFxkXFxkfFxcZFxcZFsxLTldXFxkfFxcZFxcZFxcZFsxLTldKSR8XigwPzIoXFwvfC0pMjkpKFxcL3wtKSg/Oig/OjBbNDhdMDB8WzEzNTc5XVsyNl0wMHxbMjQ2OF1bMDQ4XTAwKXwoPzpcXGRcXGQpPyg/OjBbNDhdfFsyNDY4XVswNDhdfFsxMzU3OV1bMjZdKSkkLyk7XHJcblx0XHRcdHJldHVybiBkYXRlUmVnRXgudGVzdCh2YWx1ZSk7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENoZWNrcyBpZiB2YWxpZCBkYXRlIHRpbWVcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtzdHJpbmd9IGRhdGUgc3RyaW5nXHJcblx0XHQqIEByZXR1cm4gYSBib29sIGJhc2VkIG9uIGRldGVybWluYXRpb24gb2YgdmFsaWQgZGF0ZSB0aW1lXHJcblx0XHQqL1xyXG5cdFx0X2lzRGF0ZVRpbWU6IGZ1bmN0aW9uICh2YWx1ZSl7XHJcblx0XHRcdHZhciBkYXRlVGltZVJlZ0V4ID0gbmV3IFJlZ0V4cCgvXlxcZHs0fVtcXC9cXC1dKDA/WzEtOV18MVswMTJdKVtcXC9cXC1dKDA/WzEtOV18WzEyXVswLTldfDNbMDFdKVxccysoMVswMTJdfDA/WzEtOV0pezF9OigwP1sxLTVdfFswLTZdWzAtOV0pezF9OigwP1swLTZdfFswLTZdWzAtOV0pezF9XFxzKyhhbXxwbXxBTXxQTSl7MX0kfF4oPzooPzooPzowP1sxMzU3OF18MVswMl0pKFxcL3wtKTMxKXwoPzooPzowP1sxLDMtOV18MVswLTJdKShcXC98LSkoPzoyOXwzMCkpKShcXC98LSkoPzpbMS05XVxcZFxcZFxcZHxcXGRbMS05XVxcZFxcZHxcXGRcXGRbMS05XVxcZHxcXGRcXGRcXGRbMS05XSkkfF4oKDFbMDEyXXwwP1sxLTldKXsxfVxcLygwP1sxLTldfFsxMl1bMC05XXwzWzAxXSl7MX1cXC9cXGR7Miw0fVxccysoMVswMTJdfDA/WzEtOV0pezF9OigwP1sxLTVdfFswLTZdWzAtOV0pezF9OigwP1swLTZdfFswLTZdWzAtOV0pezF9XFxzKyhhbXxwbXxBTXxQTSl7MX0pJC8pO1xyXG5cdFx0XHRyZXR1cm4gZGF0ZVRpbWVSZWdFeC50ZXN0KHZhbHVlKTtcclxuXHRcdH0sXHJcblx0XHQvL0NoZWNrcyBpZiB0aGUgc3RhcnQgZGF0ZSBpcyBiZWZvcmUgdGhlIGVuZCBkYXRlXHJcblx0XHQvL3JldHVybnMgdHJ1ZSBpZiBlbmQgaXMgbGF0ZXIgdGhhbiBzdGFydFxyXG5cdFx0X2RhdGVDb21wYXJlOiBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG5cdFx0XHRyZXR1cm4gKG5ldyBEYXRlKHN0YXJ0LnRvU3RyaW5nKCkpIDwgbmV3IERhdGUoZW5kLnRvU3RyaW5nKCkpKTtcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ2hlY2tzIGRhdGUgcmFuZ2VcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmlyc3QgZmllbGQgbmFtZVxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBzZWNvbmQgZmllbGQgbmFtZVxyXG5cdFx0KiBAcmV0dXJuIGFuIGVycm9yIHN0cmluZyBpZiB2YWxpZGF0aW9uIGZhaWxlZFxyXG5cdFx0Ki9cclxuXHRcdF9kYXRlUmFuZ2U6IGZ1bmN0aW9uIChmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpIHtcclxuXHRcdFx0Ly9hcmUgbm90IGJvdGggcG9wdWxhdGVkXHJcblx0XHRcdGlmICgoIW9wdGlvbnMuZmlyc3RPZkdyb3VwWzBdLnZhbHVlICYmIG9wdGlvbnMuc2Vjb25kT2ZHcm91cFswXS52YWx1ZSkgfHwgKG9wdGlvbnMuZmlyc3RPZkdyb3VwWzBdLnZhbHVlICYmICFvcHRpb25zLnNlY29uZE9mR3JvdXBbMF0udmFsdWUpKSB7XHJcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuYWxscnVsZXNbcnVsZXNbaV1dLmFsZXJ0VGV4dCArIG9wdGlvbnMuYWxscnVsZXNbcnVsZXNbaV1dLmFsZXJ0VGV4dDI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vYXJlIG5vdCBib3RoIGRhdGVzXHJcblx0XHRcdGlmICghbWV0aG9kcy5faXNEYXRlKG9wdGlvbnMuZmlyc3RPZkdyb3VwWzBdLnZhbHVlKSB8fCAhbWV0aG9kcy5faXNEYXRlKG9wdGlvbnMuc2Vjb25kT2ZHcm91cFswXS52YWx1ZSkpIHtcclxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0ICsgb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0MjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly9hcmUgYm90aCBkYXRlcyBidXQgcmFuZ2UgaXMgb2ZmXHJcblx0XHRcdGlmICghbWV0aG9kcy5fZGF0ZUNvbXBhcmUob3B0aW9ucy5maXJzdE9mR3JvdXBbMF0udmFsdWUsIG9wdGlvbnMuc2Vjb25kT2ZHcm91cFswXS52YWx1ZSkpIHtcclxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0ICsgb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0MjtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBDaGVja3MgZGF0ZSB0aW1lIHJhbmdlXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpcnN0IGZpZWxkIG5hbWVcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gc2Vjb25kIGZpZWxkIG5hbWVcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfZGF0ZVRpbWVSYW5nZTogZnVuY3Rpb24gKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cdFx0XHQvL2FyZSBub3QgYm90aCBwb3B1bGF0ZWRcclxuXHRcdFx0aWYgKCghb3B0aW9ucy5maXJzdE9mR3JvdXBbMF0udmFsdWUgJiYgb3B0aW9ucy5zZWNvbmRPZkdyb3VwWzBdLnZhbHVlKSB8fCAob3B0aW9ucy5maXJzdE9mR3JvdXBbMF0udmFsdWUgJiYgIW9wdGlvbnMuc2Vjb25kT2ZHcm91cFswXS52YWx1ZSkpIHtcclxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0ICsgb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0MjtcclxuXHRcdFx0fVxyXG5cdFx0XHQvL2FyZSBub3QgYm90aCBkYXRlc1xyXG5cdFx0XHRpZiAoIW1ldGhvZHMuX2lzRGF0ZVRpbWUob3B0aW9ucy5maXJzdE9mR3JvdXBbMF0udmFsdWUpIHx8ICFtZXRob2RzLl9pc0RhdGVUaW1lKG9wdGlvbnMuc2Vjb25kT2ZHcm91cFswXS52YWx1ZSkpIHtcclxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0ICsgb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0MjtcclxuXHRcdFx0fVxyXG5cdFx0XHQvL2FyZSBib3RoIGRhdGVzIGJ1dCByYW5nZSBpcyBvZmZcclxuXHRcdFx0aWYgKCFtZXRob2RzLl9kYXRlQ29tcGFyZShvcHRpb25zLmZpcnN0T2ZHcm91cFswXS52YWx1ZSwgb3B0aW9ucy5zZWNvbmRPZkdyb3VwWzBdLnZhbHVlKSkge1xyXG5cdFx0XHRcdHJldHVybiBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHQgKyBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHQyO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIE1heCBudW1iZXIgb2YgY2hlY2tib3ggc2VsZWN0ZWRcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfbWF4Q2hlY2tib3g6IGZ1bmN0aW9uKGZvcm0sIGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cclxuXHRcdFx0dmFyIG5iQ2hlY2sgPSBydWxlc1tpICsgMV07XHJcblx0XHRcdHZhciBncm91cG5hbWUgPSBmaWVsZC5hdHRyKFwibmFtZVwiKTtcclxuXHRcdFx0dmFyIGdyb3VwU2l6ZSA9IGZvcm0uZmluZChcImlucHV0W25hbWU9J1wiICsgZ3JvdXBuYW1lICsgXCInXTpjaGVja2VkXCIpLnNpemUoKTtcclxuXHRcdFx0aWYgKGdyb3VwU2l6ZSA+IG5iQ2hlY2spIHtcclxuXHRcdFx0XHRvcHRpb25zLnNob3dBcnJvdyA9IGZhbHNlO1xyXG5cdFx0XHRcdGlmIChvcHRpb25zLmFsbHJ1bGVzLm1heENoZWNrYm94LmFsZXJ0VGV4dDIpXHJcblx0XHRcdFx0XHQgcmV0dXJuIG9wdGlvbnMuYWxscnVsZXMubWF4Q2hlY2tib3guYWxlcnRUZXh0ICsgXCIgXCIgKyBuYkNoZWNrICsgXCIgXCIgKyBvcHRpb25zLmFsbHJ1bGVzLm1heENoZWNrYm94LmFsZXJ0VGV4dDI7XHJcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuYWxscnVsZXMubWF4Q2hlY2tib3guYWxlcnRUZXh0O1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIE1pbiBudW1iZXIgb2YgY2hlY2tib3ggc2VsZWN0ZWRcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfbWluQ2hlY2tib3g6IGZ1bmN0aW9uKGZvcm0sIGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cclxuXHRcdFx0dmFyIG5iQ2hlY2sgPSBydWxlc1tpICsgMV07XHJcblx0XHRcdHZhciBncm91cG5hbWUgPSBmaWVsZC5hdHRyKFwibmFtZVwiKTtcclxuXHRcdFx0dmFyIGdyb3VwU2l6ZSA9IGZvcm0uZmluZChcImlucHV0W25hbWU9J1wiICsgZ3JvdXBuYW1lICsgXCInXTpjaGVja2VkXCIpLnNpemUoKTtcclxuXHRcdFx0aWYgKGdyb3VwU2l6ZSA8IG5iQ2hlY2spIHtcclxuXHRcdFx0XHRvcHRpb25zLnNob3dBcnJvdyA9IGZhbHNlO1xyXG5cdFx0XHRcdHJldHVybiBvcHRpb25zLmFsbHJ1bGVzLm1pbkNoZWNrYm94LmFsZXJ0VGV4dCArIFwiIFwiICsgbmJDaGVjayArIFwiIFwiICsgb3B0aW9ucy5hbGxydWxlcy5taW5DaGVja2JveC5hbGVydFRleHQyO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENoZWNrcyB0aGF0IGl0IGlzIGEgdmFsaWQgY3JlZGl0IGNhcmQgbnVtYmVyIGFjY29yZGluZyB0byB0aGVcclxuXHRcdCogTHVobiBjaGVja3N1bSBhbGdvcml0aG0uXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gcnVsZXNcclxuXHRcdCogQHBhcmFtIHtpbnR9IGkgcnVsZXMgaW5kZXhcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gYW4gZXJyb3Igc3RyaW5nIGlmIHZhbGlkYXRpb24gZmFpbGVkXHJcblx0XHQqL1xyXG5cdFx0X2NyZWRpdENhcmQ6IGZ1bmN0aW9uKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cdFx0XHQvL3NwYWNlcyBhbmQgZGFzaGVzIG1heSBiZSB2YWxpZCBjaGFyYWN0ZXJzLCBidXQgbXVzdCBiZSBzdHJpcHBlZCB0byBjYWxjdWxhdGUgdGhlIGNoZWNrc3VtLlxyXG5cdFx0XHR2YXIgdmFsaWQgPSBmYWxzZSwgY2FyZE51bWJlciA9IGZpZWxkLnZhbCgpLnJlcGxhY2UoLyArL2csICcnKS5yZXBsYWNlKC8tKy9nLCAnJyk7XHJcblxyXG5cdFx0XHR2YXIgbnVtRGlnaXRzID0gY2FyZE51bWJlci5sZW5ndGg7XHJcblx0XHRcdGlmIChudW1EaWdpdHMgPj0gMTQgJiYgbnVtRGlnaXRzIDw9IDE2ICYmIHBhcnNlSW50KGNhcmROdW1iZXIpID4gMCkge1xyXG5cclxuXHRcdFx0XHR2YXIgc3VtID0gMCwgaSA9IG51bURpZ2l0cyAtIDEsIHBvcyA9IDEsIGRpZ2l0LCBsdWhuID0gbmV3IFN0cmluZygpO1xyXG5cdFx0XHRcdGRvIHtcclxuXHRcdFx0XHRcdGRpZ2l0ID0gcGFyc2VJbnQoY2FyZE51bWJlci5jaGFyQXQoaSkpO1xyXG5cdFx0XHRcdFx0bHVobiArPSAocG9zKysgJSAyID09IDApID8gZGlnaXQgKiAyIDogZGlnaXQ7XHJcblx0XHRcdFx0fSB3aGlsZSAoLS1pID49IDApXHJcblxyXG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBsdWhuLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRzdW0gKz0gcGFyc2VJbnQobHVobi5jaGFyQXQoaSkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR2YWxpZCA9IHN1bSAlIDEwID09IDA7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCF2YWxpZCkgcmV0dXJuIG9wdGlvbnMuYWxscnVsZXMuY3JlZGl0Q2FyZC5hbGVydFRleHQ7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIEFqYXggZmllbGQgdmFsaWRhdGlvblxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmaWVsZFxyXG5cdFx0KiBAcGFyYW0ge0FycmF5W1N0cmluZ119IHJ1bGVzXHJcblx0XHQqIEBwYXJhbSB7aW50fSBpIHJ1bGVzIGluZGV4XHJcblx0XHQqIEBwYXJhbSB7TWFwfVxyXG5cdFx0KiAgICAgICAgICAgIHVzZXIgb3B0aW9uc1xyXG5cdFx0KiBAcmV0dXJuIG5vdGhpbmchIHRoZSBhamF4IHZhbGlkYXRvciBoYW5kbGVzIHRoZSBwcm9tcHRzIGl0c2VsZlxyXG5cdFx0Ki9cclxuXHRcdCBfYWpheDogZnVuY3Rpb24oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblxyXG5cdFx0XHQgdmFyIGVycm9yU2VsZWN0b3IgPSBydWxlc1tpICsgMV07XHJcblx0XHRcdCB2YXIgcnVsZSA9IG9wdGlvbnMuYWxscnVsZXNbZXJyb3JTZWxlY3Rvcl07XHJcblx0XHRcdCB2YXIgZXh0cmFEYXRhID0gcnVsZS5leHRyYURhdGE7XHJcblx0XHRcdCB2YXIgZXh0cmFEYXRhRHluYW1pYyA9IHJ1bGUuZXh0cmFEYXRhRHluYW1pYztcclxuXHRcdFx0IHZhciBkYXRhID0ge1xyXG5cdFx0XHRcdFwiZmllbGRJZFwiIDogZmllbGQuYXR0cihcImlkXCIpLFxyXG5cdFx0XHRcdFwiZmllbGRWYWx1ZVwiIDogZmllbGQudmFsKClcclxuXHRcdFx0IH07XHJcblxyXG5cdFx0XHQgaWYgKHR5cGVvZiBleHRyYURhdGEgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0XHQkLmV4dGVuZChkYXRhLCBleHRyYURhdGEpO1xyXG5cdFx0XHQgfSBlbHNlIGlmICh0eXBlb2YgZXh0cmFEYXRhID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0dmFyIHRlbXBEYXRhID0gZXh0cmFEYXRhLnNwbGl0KFwiJlwiKTtcclxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGVtcERhdGEubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdHZhciB2YWx1ZXMgPSB0ZW1wRGF0YVtpXS5zcGxpdChcIj1cIik7XHJcblx0XHRcdFx0XHRpZiAodmFsdWVzWzBdICYmIHZhbHVlc1swXSkge1xyXG5cdFx0XHRcdFx0XHRkYXRhW3ZhbHVlc1swXV0gPSB2YWx1ZXNbMV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQgfVxyXG5cclxuXHRcdFx0IGlmIChleHRyYURhdGFEeW5hbWljKSB7XHJcblx0XHRcdFx0IHZhciB0bXBEYXRhID0gW107XHJcblx0XHRcdFx0IHZhciBkb21JZHMgPSBTdHJpbmcoZXh0cmFEYXRhRHluYW1pYykuc3BsaXQoXCIsXCIpO1xyXG5cdFx0XHRcdCBmb3IgKHZhciBpID0gMDsgaSA8IGRvbUlkcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0IHZhciBpZCA9IGRvbUlkc1tpXTtcclxuXHRcdFx0XHRcdCBpZiAoJChpZCkubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdCB2YXIgaW5wdXRWYWx1ZSA9IGZpZWxkLmNsb3Nlc3QoXCJmb3JtLCAudmFsaWRhdGlvbkVuZ2luZUNvbnRhaW5lclwiKS5maW5kKGlkKS52YWwoKTtcclxuXHRcdFx0XHRcdFx0IHZhciBrZXlWYWx1ZSA9IGlkLnJlcGxhY2UoJyMnLCAnJykgKyAnPScgKyBlc2NhcGUoaW5wdXRWYWx1ZSk7XHJcblx0XHRcdFx0XHRcdCBkYXRhW2lkLnJlcGxhY2UoJyMnLCAnJyldID0gaW5wdXRWYWx1ZTtcclxuXHRcdFx0XHRcdCB9XHJcblx0XHRcdFx0IH1cclxuXHRcdFx0IH1cclxuXHRcdFx0IFxyXG5cdFx0XHQgLy8gSWYgYSBmaWVsZCBjaGFuZ2UgZXZlbnQgdHJpZ2dlcmVkIHRoaXMgd2Ugd2FudCB0byBjbGVhciB0aGUgY2FjaGUgZm9yIHRoaXMgSURcclxuXHRcdFx0IGlmIChvcHRpb25zLmV2ZW50VHJpZ2dlciA9PSBcImZpZWxkXCIpIHtcclxuXHRcdFx0XHRkZWxldGUob3B0aW9ucy5hamF4VmFsaWRDYWNoZVtmaWVsZC5hdHRyKFwiaWRcIildKTtcclxuXHRcdFx0IH1cclxuXHJcblx0XHRcdCAvLyBJZiB0aGVyZSBpcyBhbiBlcnJvciBvciBpZiB0aGUgdGhlIGZpZWxkIGlzIGFscmVhZHkgdmFsaWRhdGVkLCBkbyBub3QgcmUtZXhlY3V0ZSBBSkFYXHJcblx0XHRcdCBpZiAoIW9wdGlvbnMuaXNFcnJvciAmJiAhbWV0aG9kcy5fY2hlY2tBamF4RmllbGRTdGF0dXMoZmllbGQuYXR0cihcImlkXCIpLCBvcHRpb25zKSkge1xyXG5cdFx0XHRcdCAkLmFqYXgoe1xyXG5cdFx0XHRcdFx0IHR5cGU6IG9wdGlvbnMuYWpheEZvcm1WYWxpZGF0aW9uTWV0aG9kLFxyXG5cdFx0XHRcdFx0IHVybDogcnVsZS51cmwsXHJcblx0XHRcdFx0XHQgY2FjaGU6IGZhbHNlLFxyXG5cdFx0XHRcdFx0IGRhdGFUeXBlOiBcImpzb25cIixcclxuXHRcdFx0XHRcdCBkYXRhOiBkYXRhLFxyXG5cdFx0XHRcdFx0IGZpZWxkOiBmaWVsZCxcclxuXHRcdFx0XHRcdCBydWxlOiBydWxlLFxyXG5cdFx0XHRcdFx0IG1ldGhvZHM6IG1ldGhvZHMsXHJcblx0XHRcdFx0XHQgb3B0aW9uczogb3B0aW9ucyxcclxuXHRcdFx0XHRcdCBiZWZvcmVTZW5kOiBmdW5jdGlvbigpIHt9LFxyXG5cdFx0XHRcdFx0IGVycm9yOiBmdW5jdGlvbihkYXRhLCB0cmFuc3BvcnQpIHtcclxuXHRcdFx0XHRcdFx0IG1ldGhvZHMuX2FqYXhFcnJvcihkYXRhLCB0cmFuc3BvcnQpO1xyXG5cdFx0XHRcdFx0IH0sXHJcblx0XHRcdFx0XHQgc3VjY2VzczogZnVuY3Rpb24oanNvbikge1xyXG5cclxuXHRcdFx0XHRcdFx0IC8vIGFzeW5jaHJvbm91c2x5IGNhbGxlZCBvbiBzdWNjZXNzLCBkYXRhIGlzIHRoZSBqc29uIGFuc3dlciBmcm9tIHRoZSBzZXJ2ZXJcclxuXHRcdFx0XHRcdFx0IHZhciBlcnJvckZpZWxkSWQgPSBqc29uWzBdO1xyXG5cdFx0XHRcdFx0XHQgLy92YXIgZXJyb3JGaWVsZCA9ICQoJChcIiNcIiArIGVycm9yRmllbGRJZClbMF0pO1xyXG5cdFx0XHRcdFx0XHQgdmFyIGVycm9yRmllbGQgPSAkKFwiI1wiKyBlcnJvckZpZWxkSWQpLmVxKDApO1xyXG5cclxuXHRcdFx0XHRcdFx0IC8vIG1ha2Ugc3VyZSB3ZSBmb3VuZCB0aGUgZWxlbWVudFxyXG5cdFx0XHRcdFx0XHQgaWYgKGVycm9yRmllbGQubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0XHQgdmFyIHN0YXR1cyA9IGpzb25bMV07XHJcblx0XHRcdFx0XHRcdFx0IC8vIHJlYWQgdGhlIG9wdGlvbmFsIG1zZyBmcm9tIHRoZSBzZXJ2ZXJcclxuXHRcdFx0XHRcdFx0XHQgdmFyIG1zZyA9IGpzb25bMl07XHJcblx0XHRcdFx0XHRcdFx0IGlmICghc3RhdHVzKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQgLy8gSG91c3RvbiB3ZSBnb3QgYSBwcm9ibGVtIC0gZGlzcGxheSBhbiByZWQgcHJvbXB0XHJcblx0XHRcdFx0XHRcdFx0XHQgb3B0aW9ucy5hamF4VmFsaWRDYWNoZVtlcnJvckZpZWxkSWRdID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdFx0XHQgb3B0aW9ucy5pc0Vycm9yID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHQgLy8gcmVzb2x2ZSB0aGUgbXNnIHByb21wdFxyXG5cdFx0XHRcdFx0XHRcdFx0IGlmKG1zZykge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQgaWYgKG9wdGlvbnMuYWxscnVsZXNbbXNnXSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCB2YXIgdHh0ID0gb3B0aW9ucy5hbGxydWxlc1ttc2ddLmFsZXJ0VGV4dDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQgaWYgKHR4dCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bXNnID0gdHh0O1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFx0IH1cclxuXHRcdFx0XHRcdFx0XHRcdCB9XHJcblx0XHRcdFx0XHRcdFx0XHQgZWxzZVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRtc2cgPSBydWxlLmFsZXJ0VGV4dDtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHQgaWYgKG9wdGlvbnMuc2hvd1Byb21wdHMpIG1ldGhvZHMuX3Nob3dQcm9tcHQoZXJyb3JGaWVsZCwgbXNnLCBcIlwiLCB0cnVlLCBvcHRpb25zKTtcclxuXHRcdFx0XHRcdFx0XHQgfSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdCBvcHRpb25zLmFqYXhWYWxpZENhY2hlW2Vycm9yRmllbGRJZF0gPSB0cnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdCAvLyByZXNvbHZlcyB0aGUgbXNnIHByb21wdFxyXG5cdFx0XHRcdFx0XHRcdFx0IGlmKG1zZykge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQgaWYgKG9wdGlvbnMuYWxscnVsZXNbbXNnXSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCB2YXIgdHh0ID0gb3B0aW9ucy5hbGxydWxlc1ttc2ddLmFsZXJ0VGV4dE9rO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCBpZiAodHh0KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtc2cgPSB0eHQ7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQgfVxyXG5cdFx0XHRcdFx0XHRcdFx0IH1cclxuXHRcdFx0XHRcdFx0XHRcdCBlbHNlXHJcblx0XHRcdFx0XHRcdFx0XHQgbXNnID0gcnVsZS5hbGVydFRleHRPaztcclxuXHJcblx0XHRcdFx0XHRcdFx0XHQgaWYgKG9wdGlvbnMuc2hvd1Byb21wdHMpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0IC8vIHNlZSBpZiB3ZSBzaG91bGQgZGlzcGxheSBhIGdyZWVuIHByb21wdFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQgaWYgKG1zZylcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtZXRob2RzLl9zaG93UHJvbXB0KGVycm9yRmllbGQsIG1zZywgXCJwYXNzXCIsIHRydWUsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQgZWxzZVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1ldGhvZHMuX2Nsb3NlUHJvbXB0KGVycm9yRmllbGQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0XHQgLy8gSWYgYSBzdWJtaXQgZm9ybSB0cmlnZ2VyZWQgdGhpcywgd2Ugd2FudCB0byByZS1zdWJtaXQgdGhlIGZvcm1cclxuXHRcdFx0XHRcdFx0XHRcdCBpZiAob3B0aW9ucy5ldmVudFRyaWdnZXIgPT0gXCJzdWJtaXRcIilcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZmllbGQuY2xvc2VzdChcImZvcm1cIikuc3VibWl0KCk7XHJcblx0XHRcdFx0XHRcdFx0IH1cclxuXHRcdFx0XHRcdFx0IH1cclxuXHRcdFx0XHRcdFx0IGVycm9yRmllbGQudHJpZ2dlcihcImpxdi5maWVsZC5yZXN1bHRcIiwgW2Vycm9yRmllbGQsIG9wdGlvbnMuaXNFcnJvciwgbXNnXSk7XHJcblx0XHRcdFx0XHQgfVxyXG5cdFx0XHRcdCB9KTtcclxuXHRcdFx0XHQgXHJcblx0XHRcdFx0IHJldHVybiBydWxlLmFsZXJ0VGV4dExvYWQ7XHJcblx0XHRcdCB9XHJcblx0XHQgfSxcclxuXHRcdC8qKlxyXG5cdFx0KiBDb21tb24gbWV0aG9kIHRvIGhhbmRsZSBhamF4IGVycm9yc1xyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG5cdFx0KiBAcGFyYW0ge09iamVjdH0gdHJhbnNwb3J0XHJcblx0XHQqL1xyXG5cdFx0X2FqYXhFcnJvcjogZnVuY3Rpb24oZGF0YSwgdHJhbnNwb3J0KSB7XHJcblx0XHRcdGlmKGRhdGEuc3RhdHVzID09IDAgJiYgdHJhbnNwb3J0ID09IG51bGwpXHJcblx0XHRcdFx0YWxlcnQoXCJUaGUgcGFnZSBpcyBub3Qgc2VydmVkIGZyb20gYSBzZXJ2ZXIhIGFqYXggY2FsbCBmYWlsZWRcIik7XHJcblx0XHRcdGVsc2UgaWYodHlwZW9mIGNvbnNvbGUgIT0gXCJ1bmRlZmluZWRcIilcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIkFqYXggZXJyb3I6IFwiICsgZGF0YS5zdGF0dXMgKyBcIiBcIiArIHRyYW5zcG9ydCk7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIGRhdGUgLT4gc3RyaW5nXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7T2JqZWN0fSBkYXRlXHJcblx0XHQqL1xyXG5cdFx0X2RhdGVUb1N0cmluZzogZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRyZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpK1wiLVwiKyhkYXRlLmdldE1vbnRoKCkrMSkrXCItXCIrZGF0ZS5nZXREYXRlKCk7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFBhcnNlcyBhbiBJU08gZGF0ZVxyXG5cdFx0KiBAcGFyYW0ge1N0cmluZ30gZFxyXG5cdFx0Ki9cclxuXHRcdF9wYXJzZURhdGU6IGZ1bmN0aW9uKGQpIHtcclxuXHJcblx0XHRcdHZhciBkYXRlUGFydHMgPSBkLnNwbGl0KFwiLVwiKTtcclxuXHRcdFx0aWYoZGF0ZVBhcnRzPT1kKVxyXG5cdFx0XHRcdGRhdGVQYXJ0cyA9IGQuc3BsaXQoXCIvXCIpO1xyXG5cdFx0XHRpZihkYXRlUGFydHM9PWQpIHtcclxuXHRcdFx0XHRkYXRlUGFydHMgPSBkLnNwbGl0KFwiLlwiKTtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IERhdGUoZGF0ZVBhcnRzWzJdLCAoZGF0ZVBhcnRzWzFdIC0gMSksIGRhdGVQYXJ0c1swXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKGRhdGVQYXJ0c1swXSwgKGRhdGVQYXJ0c1sxXSAtIDEpICxkYXRlUGFydHNbMl0pO1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBCdWlsZHMgb3IgdXBkYXRlcyBhIHByb21wdCB3aXRoIHRoZSBnaXZlbiBpbmZvcm1hdGlvblxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmaWVsZFxyXG5cdFx0KiBAcGFyYW0ge1N0cmluZ30gcHJvbXB0VGV4dCBodG1sIHRleHQgdG8gZGlzcGxheSB0eXBlXHJcblx0XHQqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIHRoZSB0eXBlIG9mIGJ1YmJsZTogJ3Bhc3MnIChncmVlbiksICdsb2FkJyAoYmxhY2spIGFueXRoaW5nIGVsc2UgKHJlZClcclxuXHRcdCogQHBhcmFtIHtib29sZWFufSBhamF4ZWQgLSB1c2UgdG8gbWFyayBmaWVsZHMgdGhhbiBiZWluZyB2YWxpZGF0ZWQgd2l0aCBhamF4XHJcblx0XHQqIEBwYXJhbSB7TWFwfSBvcHRpb25zIHVzZXIgb3B0aW9uc1xyXG5cdFx0Ki9cclxuXHRcdCBfc2hvd1Byb21wdDogZnVuY3Rpb24oZmllbGQsIHByb21wdFRleHQsIHR5cGUsIGFqYXhlZCwgb3B0aW9ucywgYWpheGZvcm0pIHtcclxuXHRcdFx0IHZhciBwcm9tcHQgPSBtZXRob2RzLl9nZXRQcm9tcHQoZmllbGQpO1xyXG5cdFx0XHQgLy8gVGhlIGFqYXggc3VibWl0IGVycm9ycyBhcmUgbm90IHNlZSBoYXMgYW4gZXJyb3IgaW4gdGhlIGZvcm0sXHJcblx0XHRcdCAvLyBXaGVuIHRoZSBmb3JtIGVycm9ycyBhcmUgcmV0dXJuZWQsIHRoZSBlbmdpbmUgc2VlIDIgYnViYmxlcywgYnV0IHRob3NlIGFyZSBlYmluZyBjbG9zZWQgYnkgdGhlIGVuZ2luZSBhdCB0aGUgc2FtZSB0aW1lXHJcblx0XHRcdCAvLyBCZWNhdXNlIG5vIGVycm9yIHdhcyBmb3VuZCBiZWZvciBzdWJtaXR0aW5nXHJcblx0XHRcdCBpZihhamF4Zm9ybSkgcHJvbXB0ID0gZmFsc2U7XHJcblx0XHRcdCAvLyBDaGVjayB0aGF0IHRoZXJlIGlzIGluZGRlZCB0ZXh0XHJcblx0XHRcdCBpZigkLnRyaW0ocHJvbXB0VGV4dCkpeyBcclxuXHRcdFx0XHQgaWYgKHByb21wdClcclxuXHRcdFx0XHRcdG1ldGhvZHMuX3VwZGF0ZVByb21wdChmaWVsZCwgcHJvbXB0LCBwcm9tcHRUZXh0LCB0eXBlLCBhamF4ZWQsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdCBlbHNlXHJcblx0XHRcdFx0XHRtZXRob2RzLl9idWlsZFByb21wdChmaWVsZCwgcHJvbXB0VGV4dCwgdHlwZSwgYWpheGVkLCBvcHRpb25zKTtcclxuXHRcdFx0fVxyXG5cdFx0IH0sXHJcblx0XHQvKipcclxuXHRcdCogQnVpbGRzIGFuZCBzaGFkZXMgYSBwcm9tcHQgZm9yIHRoZSBnaXZlbiBmaWVsZC5cclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtTdHJpbmd9IHByb21wdFRleHQgaHRtbCB0ZXh0IHRvIGRpc3BsYXkgdHlwZVxyXG5cdFx0KiBAcGFyYW0ge1N0cmluZ30gdHlwZSB0aGUgdHlwZSBvZiBidWJibGU6ICdwYXNzJyAoZ3JlZW4pLCAnbG9hZCcgKGJsYWNrKSBhbnl0aGluZyBlbHNlIChyZWQpXHJcblx0XHQqIEBwYXJhbSB7Ym9vbGVhbn0gYWpheGVkIC0gdXNlIHRvIG1hcmsgZmllbGRzIHRoYW4gYmVpbmcgdmFsaWRhdGVkIHdpdGggYWpheFxyXG5cdFx0KiBAcGFyYW0ge01hcH0gb3B0aW9ucyB1c2VyIG9wdGlvbnNcclxuXHRcdCovXHJcblx0XHRfYnVpbGRQcm9tcHQ6IGZ1bmN0aW9uKGZpZWxkLCBwcm9tcHRUZXh0LCB0eXBlLCBhamF4ZWQsIG9wdGlvbnMpIHtcclxuXHJcblx0XHRcdC8vIGNyZWF0ZSB0aGUgcHJvbXB0XHJcblx0XHRcdHZhciBwcm9tcHQgPSAkKCc8ZGl2PicpO1xyXG5cdFx0XHRwcm9tcHQuYWRkQ2xhc3MobWV0aG9kcy5fZ2V0Q2xhc3NOYW1lKGZpZWxkLmF0dHIoXCJpZFwiKSkgKyBcImZvcm1FcnJvclwiKTtcclxuXHRcdFx0Ly8gYWRkIGEgY2xhc3MgbmFtZSB0byBpZGVudGlmeSB0aGUgcGFyZW50IGZvcm0gb2YgdGhlIHByb21wdFxyXG5cdFx0XHRwcm9tcHQuYWRkQ2xhc3MoXCJwYXJlbnRGb3JtXCIrbWV0aG9kcy5fZ2V0Q2xhc3NOYW1lKGZpZWxkLmNsb3Nlc3QoJ2Zvcm0sIC52YWxpZGF0aW9uRW5naW5lQ29udGFpbmVyJykuYXR0cihcImlkXCIpKSk7XHJcblx0XHRcdHByb21wdC5hZGRDbGFzcyhcImZvcm1FcnJvclwiKTtcclxuXHJcblx0XHRcdHN3aXRjaCAodHlwZSkge1xyXG5cdFx0XHRcdGNhc2UgXCJwYXNzXCI6XHJcblx0XHRcdFx0XHRwcm9tcHQuYWRkQ2xhc3MoXCJncmVlblBvcHVwXCIpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcImxvYWRcIjpcclxuXHRcdFx0XHRcdHByb21wdC5hZGRDbGFzcyhcImJsYWNrUG9wdXBcIik7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0LyogaXQgaGFzIGVycm9yICAqL1xyXG5cdFx0XHRcdFx0Ly9hbGVydChcInVua25vd24gcG9wdXAgdHlwZTpcIit0eXBlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoYWpheGVkKVxyXG5cdFx0XHRcdHByb21wdC5hZGRDbGFzcyhcImFqYXhlZFwiKTtcclxuXHJcblx0XHRcdC8vIGNyZWF0ZSB0aGUgcHJvbXB0IGNvbnRlbnRcclxuXHRcdFx0dmFyIHByb21wdENvbnRlbnQgPSAkKCc8ZGl2PicpLmFkZENsYXNzKFwiZm9ybUVycm9yQ29udGVudFwiKS5odG1sKHByb21wdFRleHQpLmFwcGVuZFRvKHByb21wdCk7XHJcblxyXG5cdFx0XHQvLyBkZXRlcm1pbmUgcG9zaXRpb24gdHlwZVxyXG5cdFx0XHR2YXIgcG9zaXRpb25UeXBlPWZpZWxkLmRhdGEoXCJwcm9tcHRQb3NpdGlvblwiKSB8fCBvcHRpb25zLnByb21wdFBvc2l0aW9uO1xyXG5cclxuXHRcdFx0Ly8gY3JlYXRlIHRoZSBjc3MgYXJyb3cgcG9pbnRpbmcgYXQgdGhlIGZpZWxkXHJcblx0XHRcdC8vIG5vdGUgdGhhdCB0aGVyZSBpcyBubyB0cmlhbmdsZSBvbiBtYXgtY2hlY2tib3ggYW5kIHJhZGlvXHJcblx0XHRcdGlmIChvcHRpb25zLnNob3dBcnJvdykge1xyXG5cdFx0XHRcdHZhciBhcnJvdyA9ICQoJzxkaXY+JykuYWRkQ2xhc3MoXCJmb3JtRXJyb3JBcnJvd1wiKTtcclxuXHJcblx0XHRcdFx0Ly9wcm9tcHQgcG9zaXRpb25pbmcgYWRqdXN0bWVudCBzdXBwb3J0LiBVc2FnZTogcG9zaXRpb25UeXBlOlhzaGlmdCxZc2hpZnQgKGZvciBleC46IGJvdHRvbUxlZnQ6KzIwIG9yIGJvdHRvbUxlZnQ6LTIwLCsxMClcclxuXHRcdFx0XHRpZiAodHlwZW9mKHBvc2l0aW9uVHlwZSk9PSdzdHJpbmcnKSBcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHR2YXIgcG9zPXBvc2l0aW9uVHlwZS5pbmRleE9mKFwiOlwiKTtcclxuXHRcdFx0XHRcdGlmKHBvcyE9LTEpXHJcblx0XHRcdFx0XHRcdHBvc2l0aW9uVHlwZT1wb3NpdGlvblR5cGUuc3Vic3RyaW5nKDAscG9zKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHN3aXRjaCAocG9zaXRpb25UeXBlKSB7XHJcblx0XHRcdFx0XHRjYXNlIFwiYm90dG9tTGVmdFwiOlxyXG5cdFx0XHRcdFx0Y2FzZSBcImJvdHRvbVJpZ2h0XCI6XHJcblx0XHRcdFx0XHRcdHByb21wdC5maW5kKFwiLmZvcm1FcnJvckNvbnRlbnRcIikuYmVmb3JlKGFycm93KTtcclxuXHRcdFx0XHRcdFx0YXJyb3cuYWRkQ2xhc3MoXCJmb3JtRXJyb3JBcnJvd0JvdHRvbVwiKS5odG1sKCc8ZGl2IGNsYXNzPVwibGluZTFcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lMlwiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmUzXCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZTRcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lNVwiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmU2XCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZTdcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lOFwiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmU5XCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZTEwXCI+PCEtLSAtLT48L2Rpdj4nKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFwidG9wTGVmdFwiOlxyXG5cdFx0XHRcdFx0Y2FzZSBcInRvcFJpZ2h0XCI6XHJcblx0XHRcdFx0XHRcdGFycm93Lmh0bWwoJzxkaXYgY2xhc3M9XCJsaW5lMTBcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lOVwiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmU4XCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZTdcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lNlwiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmU1XCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZTRcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lM1wiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmUyXCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZTFcIj48IS0tIC0tPjwvZGl2PicpO1xyXG5cdFx0XHRcdFx0XHRwcm9tcHQuYXBwZW5kKGFycm93KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vIEFkZCBjdXN0b20gcHJvbXB0IGNsYXNzXHJcblx0XHRcdGlmIChvcHRpb25zLmFkZFByb21wdENsYXNzKVxyXG5cdFx0XHRcdHByb21wdC5hZGRDbGFzcyhvcHRpb25zLmFkZFByb21wdENsYXNzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBjdXN0b20gcHJvbXB0IGNsYXNzIGRlZmluZWQgaW4gZWxlbWVudFxyXG4gICAgICAgICAgICB2YXIgcmVxdWlyZWRPdmVycmlkZSA9IGZpZWxkLmF0dHIoJ2RhdGEtcmVxdWlyZWQtY2xhc3MnKTtcclxuICAgICAgICAgICAgaWYocmVxdWlyZWRPdmVycmlkZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9tcHQuYWRkQ2xhc3MocmVxdWlyZWRPdmVycmlkZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZihvcHRpb25zLnByZXR0eVNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCQoJyMnICsgZmllbGQuYXR0cignaWQnKSkubmV4dCgpLmlzKCdzZWxlY3QnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJldHR5T3ZlcnJpZGVDbGFzcyA9ICQoJyMnICsgZmllbGQuYXR0cignaWQnKS5zdWJzdHIob3B0aW9ucy51c2VQcmVmaXgubGVuZ3RoKS5zdWJzdHJpbmcob3B0aW9ucy51c2VTdWZmaXgubGVuZ3RoKSkuYXR0cignZGF0YS1yZXF1aXJlZC1jbGFzcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihwcmV0dHlPdmVycmlkZUNsYXNzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21wdC5hZGRDbGFzcyhwcmV0dHlPdmVycmlkZUNsYXNzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHRcdFx0cHJvbXB0LmNzcyh7XHJcblx0XHRcdFx0XCJvcGFjaXR5XCI6IDBcclxuXHRcdFx0fSk7XHJcblx0XHRcdGlmKHBvc2l0aW9uVHlwZSA9PT0gJ2lubGluZScpIHtcclxuXHRcdFx0XHRwcm9tcHQuYWRkQ2xhc3MoXCJpbmxpbmVcIik7XHJcblx0XHRcdFx0aWYodHlwZW9mIGZpZWxkLmF0dHIoJ2RhdGEtcHJvbXB0LXRhcmdldCcpICE9PSAndW5kZWZpbmVkJyAmJiAkKCcjJytmaWVsZC5hdHRyKCdkYXRhLXByb21wdC10YXJnZXQnKSkubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0cHJvbXB0LmFwcGVuZFRvKCQoJyMnK2ZpZWxkLmF0dHIoJ2RhdGEtcHJvbXB0LXRhcmdldCcpKSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGZpZWxkLmFmdGVyKHByb21wdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGZpZWxkLmJlZm9yZShwcm9tcHQpO1x0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHZhciBwb3MgPSBtZXRob2RzLl9jYWxjdWxhdGVQb3NpdGlvbihmaWVsZCwgcHJvbXB0LCBvcHRpb25zKTtcclxuXHRcdFx0cHJvbXB0LmNzcyh7XHJcblx0XHRcdFx0J3Bvc2l0aW9uJzogcG9zaXRpb25UeXBlID09PSAnaW5saW5lJyA/ICdyZWxhdGl2ZScgOiAnYWJzb2x1dGUnLFxyXG5cdFx0XHRcdFwidG9wXCI6IHBvcy5jYWxsZXJUb3BQb3NpdGlvbixcclxuXHRcdFx0XHRcImxlZnRcIjogcG9zLmNhbGxlcmxlZnRQb3NpdGlvbixcclxuXHRcdFx0XHRcIm1hcmdpblRvcFwiOiBwb3MubWFyZ2luVG9wU2l6ZSxcclxuXHRcdFx0XHRcIm9wYWNpdHlcIjogMFxyXG5cdFx0XHR9KS5kYXRhKFwiY2FsbGVyRmllbGRcIiwgZmllbGQpO1xyXG5cdFx0XHRcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmF1dG9IaWRlUHJvbXB0KSB7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0cHJvbXB0LmFuaW1hdGUoe1xyXG5cdFx0XHRcdFx0XHRcIm9wYWNpdHlcIjogMFxyXG5cdFx0XHRcdFx0fSxmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRwcm9tcHQuY2xvc2VzdCgnLmZvcm1FcnJvck91dGVyJykucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRcdHByb21wdC5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0sIG9wdGlvbnMuYXV0b0hpZGVEZWxheSk7XHJcblx0XHRcdH0gXHJcblx0XHRcdHJldHVybiBwcm9tcHQuYW5pbWF0ZSh7XHJcblx0XHRcdFx0XCJvcGFjaXR5XCI6IDAuODdcclxuXHRcdFx0fSk7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFVwZGF0ZXMgdGhlIHByb21wdCB0ZXh0IGZpZWxkIC0gdGhlIGZpZWxkIGZvciB3aGljaCB0aGUgcHJvbXB0XHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7U3RyaW5nfSBwcm9tcHRUZXh0IGh0bWwgdGV4dCB0byBkaXNwbGF5IHR5cGVcclxuXHRcdCogQHBhcmFtIHtTdHJpbmd9IHR5cGUgdGhlIHR5cGUgb2YgYnViYmxlOiAncGFzcycgKGdyZWVuKSwgJ2xvYWQnIChibGFjaykgYW55dGhpbmcgZWxzZSAocmVkKVxyXG5cdFx0KiBAcGFyYW0ge2Jvb2xlYW59IGFqYXhlZCAtIHVzZSB0byBtYXJrIGZpZWxkcyB0aGFuIGJlaW5nIHZhbGlkYXRlZCB3aXRoIGFqYXhcclxuXHRcdCogQHBhcmFtIHtNYXB9IG9wdGlvbnMgdXNlciBvcHRpb25zXHJcblx0XHQqL1xyXG5cdFx0X3VwZGF0ZVByb21wdDogZnVuY3Rpb24oZmllbGQsIHByb21wdCwgcHJvbXB0VGV4dCwgdHlwZSwgYWpheGVkLCBvcHRpb25zLCBub0FuaW1hdGlvbikge1xyXG5cclxuXHRcdFx0aWYgKHByb21wdCkge1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgdHlwZSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHRcdFx0aWYgKHR5cGUgPT0gXCJwYXNzXCIpXHJcblx0XHRcdFx0XHRcdHByb21wdC5hZGRDbGFzcyhcImdyZWVuUG9wdXBcIik7XHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdHByb21wdC5yZW1vdmVDbGFzcyhcImdyZWVuUG9wdXBcIik7XHJcblxyXG5cdFx0XHRcdFx0aWYgKHR5cGUgPT0gXCJsb2FkXCIpXHJcblx0XHRcdFx0XHRcdHByb21wdC5hZGRDbGFzcyhcImJsYWNrUG9wdXBcIik7XHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdHByb21wdC5yZW1vdmVDbGFzcyhcImJsYWNrUG9wdXBcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChhamF4ZWQpXHJcblx0XHRcdFx0XHRwcm9tcHQuYWRkQ2xhc3MoXCJhamF4ZWRcIik7XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0cHJvbXB0LnJlbW92ZUNsYXNzKFwiYWpheGVkXCIpO1xyXG5cclxuXHRcdFx0XHRwcm9tcHQuZmluZChcIi5mb3JtRXJyb3JDb250ZW50XCIpLmh0bWwocHJvbXB0VGV4dCk7XHJcblxyXG5cdFx0XHRcdHZhciBwb3MgPSBtZXRob2RzLl9jYWxjdWxhdGVQb3NpdGlvbihmaWVsZCwgcHJvbXB0LCBvcHRpb25zKTtcclxuXHRcdFx0XHR2YXIgY3NzID0ge1widG9wXCI6IHBvcy5jYWxsZXJUb3BQb3NpdGlvbixcclxuXHRcdFx0XHRcImxlZnRcIjogcG9zLmNhbGxlcmxlZnRQb3NpdGlvbixcclxuXHRcdFx0XHRcIm1hcmdpblRvcFwiOiBwb3MubWFyZ2luVG9wU2l6ZX07XHJcblxyXG5cdFx0XHRcdGlmIChub0FuaW1hdGlvbilcclxuXHRcdFx0XHRcdHByb21wdC5jc3MoY3NzKTtcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRwcm9tcHQuYW5pbWF0ZShjc3MpO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENsb3NlcyB0aGUgcHJvbXB0IGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gZmllbGRcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH1cclxuXHRcdCogICAgICAgICAgICBmaWVsZFxyXG5cdFx0Ki9cclxuXHRcdCBfY2xvc2VQcm9tcHQ6IGZ1bmN0aW9uKGZpZWxkKSB7XHJcblx0XHRcdCB2YXIgcHJvbXB0ID0gbWV0aG9kcy5fZ2V0UHJvbXB0KGZpZWxkKTtcclxuXHRcdFx0IGlmIChwcm9tcHQpXHJcblx0XHRcdFx0IHByb21wdC5mYWRlVG8oXCJmYXN0XCIsIDAsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0IHByb21wdC5wYXJlbnQoJy5mb3JtRXJyb3JPdXRlcicpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdFx0IHByb21wdC5yZW1vdmUoKTtcclxuXHRcdFx0XHQgfSk7XHJcblx0XHQgfSxcclxuXHRcdCBjbG9zZVByb21wdDogZnVuY3Rpb24oZmllbGQpIHtcclxuXHRcdFx0IHJldHVybiBtZXRob2RzLl9jbG9zZVByb21wdChmaWVsZCk7XHJcblx0XHQgfSxcclxuXHRcdC8qKlxyXG5cdFx0KiBSZXR1cm5zIHRoZSBlcnJvciBwcm9tcHQgbWF0Y2hpbmcgdGhlIGZpZWxkIGlmIGFueVxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fVxyXG5cdFx0KiAgICAgICAgICAgIGZpZWxkXHJcblx0XHQqIEByZXR1cm4gdW5kZWZpbmVkIG9yIHRoZSBlcnJvciBwcm9tcHQgKGpxT2JqZWN0KVxyXG5cdFx0Ki9cclxuXHRcdF9nZXRQcm9tcHQ6IGZ1bmN0aW9uKGZpZWxkKSB7XHJcblx0XHRcdFx0dmFyIGZvcm1JZCA9ICQoZmllbGQpLmNsb3Nlc3QoJ2Zvcm0sIC52YWxpZGF0aW9uRW5naW5lQ29udGFpbmVyJykuYXR0cignaWQnKTtcclxuXHRcdFx0dmFyIGNsYXNzTmFtZSA9IG1ldGhvZHMuX2dldENsYXNzTmFtZShmaWVsZC5hdHRyKFwiaWRcIikpICsgXCJmb3JtRXJyb3JcIjtcclxuXHRcdFx0XHR2YXIgbWF0Y2ggPSAkKFwiLlwiICsgbWV0aG9kcy5fZXNjYXBlRXhwcmVzc2lvbihjbGFzc05hbWUpICsgJy5wYXJlbnRGb3JtJyArIGZvcm1JZClbMF07XHJcblx0XHRcdGlmIChtYXRjaClcclxuXHRcdFx0cmV0dXJuICQobWF0Y2gpO1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0ICAqIFJldHVybnMgdGhlIGVzY2FwYWRlIGNsYXNzbmFtZVxyXG5cdFx0ICAqXHJcblx0XHQgICogQHBhcmFtIHtzZWxlY3Rvcn1cclxuXHRcdCAgKiAgICAgICAgICAgIGNsYXNzTmFtZVxyXG5cdFx0ICAqL1xyXG5cdFx0ICBfZXNjYXBlRXhwcmVzc2lvbjogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcblx0XHRcdCAgcmV0dXJuIHNlbGVjdG9yLnJlcGxhY2UoLyhbIzsmLFxcLlxcK1xcKlxcfic6XCJcXCFcXF4kXFxbXFxdXFwoXFwpPT5cXHxdKS9nLCBcIlxcXFwkMVwiKTtcclxuXHRcdCAgfSxcclxuXHRcdC8qKlxyXG5cdFx0ICogcmV0dXJucyB0cnVlIGlmIHdlIGFyZSBpbiBhIFJUTGVkIGRvY3VtZW50XHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCAqL1xyXG5cdFx0aXNSVEw6IGZ1bmN0aW9uKGZpZWxkKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgJGRvY3VtZW50ID0gJChkb2N1bWVudCk7XHJcblx0XHRcdHZhciAkYm9keSA9ICQoJ2JvZHknKTtcclxuXHRcdFx0dmFyIHJ0bCA9XHJcblx0XHRcdFx0KGZpZWxkICYmIGZpZWxkLmhhc0NsYXNzKCdydGwnKSkgfHxcclxuXHRcdFx0XHQoZmllbGQgJiYgKGZpZWxkLmF0dHIoJ2RpcicpIHx8ICcnKS50b0xvd2VyQ2FzZSgpPT09J3J0bCcpIHx8XHJcblx0XHRcdFx0JGRvY3VtZW50Lmhhc0NsYXNzKCdydGwnKSB8fFxyXG5cdFx0XHRcdCgkZG9jdW1lbnQuYXR0cignZGlyJykgfHwgJycpLnRvTG93ZXJDYXNlKCk9PT0ncnRsJyB8fFxyXG5cdFx0XHRcdCRib2R5Lmhhc0NsYXNzKCdydGwnKSB8fFxyXG5cdFx0XHRcdCgkYm9keS5hdHRyKCdkaXInKSB8fCAnJykudG9Mb3dlckNhc2UoKT09PSdydGwnO1xyXG5cdFx0XHRyZXR1cm4gQm9vbGVhbihydGwpO1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBDYWxjdWxhdGVzIHByb21wdCBwb3NpdGlvblxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fVxyXG5cdFx0KiAgICAgICAgICAgIGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9XHJcblx0XHQqICAgICAgICAgICAgdGhlIHByb21wdFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gcG9zaXRpb25zXHJcblx0XHQqL1xyXG5cdFx0X2NhbGN1bGF0ZVBvc2l0aW9uOiBmdW5jdGlvbiAoZmllbGQsIHByb21wdEVsbXQsIG9wdGlvbnMpIHtcclxuXHJcblx0XHRcdHZhciBwcm9tcHRUb3BQb3NpdGlvbiwgcHJvbXB0bGVmdFBvc2l0aW9uLCBtYXJnaW5Ub3BTaXplO1xyXG5cdFx0XHR2YXIgZmllbGRXaWR0aCBcdD0gZmllbGQud2lkdGgoKTtcclxuXHRcdFx0dmFyIGZpZWxkTGVmdCBcdD0gZmllbGQucG9zaXRpb24oKS5sZWZ0OyBcclxuXHRcdFx0dmFyIGZpZWxkVG9wIFx0PSAgZmllbGQucG9zaXRpb24oKS50b3A7XHJcblx0XHRcdHZhciBmaWVsZEhlaWdodCBcdD0gIGZpZWxkLmhlaWdodCgpO1x0XHJcblx0XHRcdHZhciBwcm9tcHRIZWlnaHQgPSBwcm9tcHRFbG10LmhlaWdodCgpO1xyXG5cclxuXHJcblx0XHRcdC8vIGlzIHRoZSBmb3JtIGNvbnRhaW5lZCBpbiBhbiBvdmVyZmxvd24gY29udGFpbmVyP1xyXG5cdFx0XHRwcm9tcHRUb3BQb3NpdGlvbiA9IHByb21wdGxlZnRQb3NpdGlvbiA9IDA7XHJcblx0XHRcdC8vIGNvbXBlbnNhdGlvbiBmb3IgdGhlIGFycm93XHJcblx0XHRcdG1hcmdpblRvcFNpemUgPSAtcHJvbXB0SGVpZ2h0O1xyXG5cdFx0XHJcblxyXG5cdFx0XHQvL3Byb21wdCBwb3NpdGlvbmluZyBhZGp1c3RtZW50IHN1cHBvcnRcclxuXHRcdFx0Ly9ub3cgeW91IGNhbiBhZGp1c3QgcHJvbXB0IHBvc2l0aW9uXHJcblx0XHRcdC8vdXNhZ2U6IHBvc2l0aW9uVHlwZTpYc2hpZnQsWXNoaWZ0XHJcblx0XHRcdC8vZm9yIGV4YW1wbGU6XHJcblx0XHRcdC8vICAgYm90dG9tTGVmdDorMjAgbWVhbnMgYm90dG9tTGVmdCBwb3NpdGlvbiBzaGlmdGVkIGJ5IDIwIHBpeGVscyByaWdodCBob3Jpem9udGFsbHlcclxuXHRcdFx0Ly8gICB0b3BSaWdodDoyMCwgLTE1IG1lYW5zIHRvcFJpZ2h0IHBvc2l0aW9uIHNoaWZ0ZWQgYnkgMjAgcGl4ZWxzIHRvIHJpZ2h0IGFuZCAxNSBwaXhlbHMgdG8gdG9wXHJcblx0XHRcdC8vWW91IGNhbiB1c2UgK3BpeGVscywgLSBwaXhlbHMuIElmIG5vIHNpZ24gaXMgcHJvdmlkZWQgdGhhbiArIGlzIGRlZmF1bHQuXHJcblx0XHRcdHZhciBwb3NpdGlvblR5cGU9ZmllbGQuZGF0YShcInByb21wdFBvc2l0aW9uXCIpIHx8IG9wdGlvbnMucHJvbXB0UG9zaXRpb247XHJcblx0XHRcdHZhciBzaGlmdDE9XCJcIjtcclxuXHRcdFx0dmFyIHNoaWZ0Mj1cIlwiO1xyXG5cdFx0XHR2YXIgc2hpZnRYPTA7XHJcblx0XHRcdHZhciBzaGlmdFk9MDtcclxuXHRcdFx0aWYgKHR5cGVvZihwb3NpdGlvblR5cGUpPT0nc3RyaW5nJykge1xyXG5cdFx0XHRcdC8vZG8gd2UgaGF2ZSBhbnkgcG9zaXRpb24gYWRqdXN0bWVudHMgP1xyXG5cdFx0XHRcdGlmIChwb3NpdGlvblR5cGUuaW5kZXhPZihcIjpcIikhPS0xKSB7XHJcblx0XHRcdFx0XHRzaGlmdDE9cG9zaXRpb25UeXBlLnN1YnN0cmluZyhwb3NpdGlvblR5cGUuaW5kZXhPZihcIjpcIikrMSk7XHJcblx0XHRcdFx0XHRwb3NpdGlvblR5cGU9cG9zaXRpb25UeXBlLnN1YnN0cmluZygwLHBvc2l0aW9uVHlwZS5pbmRleE9mKFwiOlwiKSk7XHJcblxyXG5cdFx0XHRcdFx0Ly9pZiBhbnkgYWR2YW5jZWQgcG9zaXRpb25pbmcgd2lsbCBiZSBuZWVkZWQgKHBlcmNlbnRzIG9yIHNvbWV0aGluZyBlbHNlKSAtIHBhcnNlciBzaG91bGQgYmUgYWRkZWQgaGVyZVxyXG5cdFx0XHRcdFx0Ly9mb3Igbm93IHdlIHVzZSBzaW1wbGUgcGFyc2VJbnQoKVxyXG5cclxuXHRcdFx0XHRcdC8vZG8gd2UgaGF2ZSBzZWNvbmQgcGFyYW1ldGVyP1xyXG5cdFx0XHRcdFx0aWYgKHNoaWZ0MS5pbmRleE9mKFwiLFwiKSAhPS0xKSB7XHJcblx0XHRcdFx0XHRcdHNoaWZ0Mj1zaGlmdDEuc3Vic3RyaW5nKHNoaWZ0MS5pbmRleE9mKFwiLFwiKSArMSk7XHJcblx0XHRcdFx0XHRcdHNoaWZ0MT1zaGlmdDEuc3Vic3RyaW5nKDAsc2hpZnQxLmluZGV4T2YoXCIsXCIpKTtcclxuXHRcdFx0XHRcdFx0c2hpZnRZPXBhcnNlSW50KHNoaWZ0Mik7XHJcblx0XHRcdFx0XHRcdGlmIChpc05hTihzaGlmdFkpKSBzaGlmdFk9MDtcclxuXHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdFx0c2hpZnRYPXBhcnNlSW50KHNoaWZ0MSk7XHJcblx0XHRcdFx0XHRpZiAoaXNOYU4oc2hpZnQxKSkgc2hpZnQxPTA7XHJcblxyXG5cdFx0XHRcdH07XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRcclxuXHRcdFx0c3dpdGNoIChwb3NpdGlvblR5cGUpIHtcclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGNhc2UgXCJ0b3BSaWdodFwiOlxyXG5cdFx0XHRcdFx0cHJvbXB0bGVmdFBvc2l0aW9uICs9ICBmaWVsZExlZnQgKyBmaWVsZFdpZHRoIC0gMzA7XHJcblx0XHRcdFx0XHRwcm9tcHRUb3BQb3NpdGlvbiArPSAgZmllbGRUb3A7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBcInRvcExlZnRcIjpcclxuXHRcdFx0XHRcdHByb21wdFRvcFBvc2l0aW9uICs9ICBmaWVsZFRvcDtcclxuXHRcdFx0XHRcdHByb21wdGxlZnRQb3NpdGlvbiArPSBmaWVsZExlZnQ7IFxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdGNhc2UgXCJjZW50ZXJSaWdodFwiOlxyXG5cdFx0XHRcdFx0cHJvbXB0VG9wUG9zaXRpb24gPSBmaWVsZFRvcCs0O1xyXG5cdFx0XHRcdFx0bWFyZ2luVG9wU2l6ZSA9IDA7XHJcblx0XHRcdFx0XHRwcm9tcHRsZWZ0UG9zaXRpb249IGZpZWxkTGVmdCArIGZpZWxkLm91dGVyV2lkdGgodHJ1ZSkrNTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgXCJjZW50ZXJMZWZ0XCI6XHJcblx0XHRcdFx0XHRwcm9tcHRsZWZ0UG9zaXRpb24gPSBmaWVsZExlZnQgLSAocHJvbXB0RWxtdC53aWR0aCgpICsgMik7XHJcblx0XHRcdFx0XHRwcm9tcHRUb3BQb3NpdGlvbiA9IGZpZWxkVG9wKzQ7XHJcblx0XHRcdFx0XHRtYXJnaW5Ub3BTaXplID0gMDtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdGNhc2UgXCJib3R0b21MZWZ0XCI6XHJcblx0XHRcdFx0XHRwcm9tcHRUb3BQb3NpdGlvbiA9IGZpZWxkVG9wICsgZmllbGQuaGVpZ2h0KCkgKyA1O1xyXG5cdFx0XHRcdFx0bWFyZ2luVG9wU2l6ZSA9IDA7XHJcblx0XHRcdFx0XHRwcm9tcHRsZWZ0UG9zaXRpb24gPSBmaWVsZExlZnQ7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwiYm90dG9tUmlnaHRcIjpcclxuXHRcdFx0XHRcdHByb21wdGxlZnRQb3NpdGlvbiA9IGZpZWxkTGVmdCArIGZpZWxkV2lkdGggLSAzMDtcclxuXHRcdFx0XHRcdHByb21wdFRvcFBvc2l0aW9uID0gIGZpZWxkVG9wICsgIGZpZWxkLmhlaWdodCgpICsgNTtcclxuXHRcdFx0XHRcdG1hcmdpblRvcFNpemUgPSAwO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcImlubGluZVwiOlxyXG5cdFx0XHRcdFx0cHJvbXB0bGVmdFBvc2l0aW9uID0gMDtcclxuXHRcdFx0XHRcdHByb21wdFRvcFBvc2l0aW9uID0gMDtcclxuXHRcdFx0XHRcdG1hcmdpblRvcFNpemUgPSAwO1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFxyXG5cclxuXHRcdFx0Ly9hcHBseSBhZGp1c21lbnRzIGlmIGFueVxyXG5cdFx0XHRwcm9tcHRsZWZ0UG9zaXRpb24gKz0gc2hpZnRYO1xyXG5cdFx0XHRwcm9tcHRUb3BQb3NpdGlvbiAgKz0gc2hpZnRZO1xyXG5cclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcImNhbGxlclRvcFBvc2l0aW9uXCI6IHByb21wdFRvcFBvc2l0aW9uICsgXCJweFwiLFxyXG5cdFx0XHRcdFwiY2FsbGVybGVmdFBvc2l0aW9uXCI6IHByb21wdGxlZnRQb3NpdGlvbiArIFwicHhcIixcclxuXHRcdFx0XHRcIm1hcmdpblRvcFNpemVcIjogbWFyZ2luVG9wU2l6ZSArIFwicHhcIlxyXG5cdFx0XHR9O1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBTYXZlcyB0aGUgdXNlciBvcHRpb25zIGFuZCB2YXJpYWJsZXMgaW4gdGhlIGZvcm0uZGF0YVxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fVxyXG5cdFx0KiAgICAgICAgICAgIGZvcm0gLSB0aGUgZm9ybSB3aGVyZSB0aGUgdXNlciBvcHRpb24gc2hvdWxkIGJlIHNhdmVkXHJcblx0XHQqIEBwYXJhbSB7TWFwfVxyXG5cdFx0KiAgICAgICAgICAgIG9wdGlvbnMgLSB0aGUgdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gdGhlIHVzZXIgb3B0aW9ucyAoZXh0ZW5kZWQgZnJvbSB0aGUgZGVmYXVsdHMpXHJcblx0XHQqL1xyXG5cdFx0IF9zYXZlT3B0aW9uczogZnVuY3Rpb24oZm9ybSwgb3B0aW9ucykge1xyXG5cclxuXHRcdFx0IC8vIGlzIHRoZXJlIGEgbGFuZ3VhZ2UgbG9jYWxpc2F0aW9uID9cclxuXHRcdFx0IGlmICgkLnZhbGlkYXRpb25FbmdpbmVMYW5ndWFnZSlcclxuXHRcdFx0IHZhciBhbGxSdWxlcyA9ICQudmFsaWRhdGlvbkVuZ2luZUxhbmd1YWdlLmFsbFJ1bGVzO1xyXG5cdFx0XHQgZWxzZVxyXG5cdFx0XHQgJC5lcnJvcihcImpRdWVyeS52YWxpZGF0aW9uRW5naW5lIHJ1bGVzIGFyZSBub3QgbG9hZGVkLCBwbHogYWRkIGxvY2FsaXphdGlvbiBmaWxlcyB0byB0aGUgcGFnZVwiKTtcclxuXHRcdFx0IC8vIC0tLSBJbnRlcm5hbHMgRE8gTk9UIFRPVUNIIG9yIE9WRVJMT0FEIC0tLVxyXG5cdFx0XHQgLy8gdmFsaWRhdGlvbiBydWxlcyBhbmQgaTE4XHJcblx0XHRcdCAkLnZhbGlkYXRpb25FbmdpbmUuZGVmYXVsdHMuYWxscnVsZXMgPSBhbGxSdWxlcztcclxuXHJcblx0XHRcdCB2YXIgdXNlck9wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLHt9LCQudmFsaWRhdGlvbkVuZ2luZS5kZWZhdWx0cyxvcHRpb25zKTtcclxuXHJcblx0XHRcdCBmb3JtLmRhdGEoJ2pxdicsIHVzZXJPcHRpb25zKTtcclxuXHRcdFx0IHJldHVybiB1c2VyT3B0aW9ucztcclxuXHRcdCB9LFxyXG5cclxuXHRcdCAvKipcclxuXHRcdCAqIFJlbW92ZXMgZm9yYmlkZGVuIGNoYXJhY3RlcnMgZnJvbSBjbGFzcyBuYW1lXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lXHJcblx0XHQgKi9cclxuXHRcdCBfZ2V0Q2xhc3NOYW1lOiBmdW5jdGlvbihjbGFzc05hbWUpIHtcclxuXHRcdFx0IGlmKGNsYXNzTmFtZSlcclxuXHRcdFx0XHQgcmV0dXJuIGNsYXNzTmFtZS5yZXBsYWNlKC86L2csIFwiX1wiKS5yZXBsYWNlKC9cXC4vZywgXCJfXCIpO1xyXG5cdFx0XHRcdFx0ICB9LFxyXG5cdFx0LyoqXHJcblx0XHQgKiBFc2NhcGUgc3BlY2lhbCBjaGFyYWN0ZXIgZm9yIGpRdWVyeSBzZWxlY3RvclxyXG5cdFx0ICogaHR0cDovL3RvdGFsZGV2LmNvbS9jb250ZW50L2VzY2FwaW5nLWNoYXJhY3RlcnMtZ2V0LXZhbGlkLWpxdWVyeS1pZFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXHJcblx0XHQgKi9cclxuXHRcdCBfanFTZWxlY3RvcjogZnVuY3Rpb24oc3RyKXtcclxuXHRcdFx0cmV0dXJuIHN0ci5yZXBsYWNlKC8oWzsmLFxcLlxcK1xcKlxcfic6XCJcXCFcXF4jJCVAXFxbXFxdXFwoXFwpPT5cXHxdKS9nLCAnXFxcXCQxJyk7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENvbmRpdGlvbmFsbHkgcmVxdWlyZWQgZmllbGRcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gYW4gZXJyb3Igc3RyaW5nIGlmIHZhbGlkYXRpb24gZmFpbGVkXHJcblx0XHQqL1xyXG5cdFx0X2NvbmRSZXF1aXJlZDogZnVuY3Rpb24oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblx0XHRcdHZhciBpZHgsIGRlcGVuZGluZ0ZpZWxkO1xyXG5cclxuXHRcdFx0Zm9yKGlkeCA9IChpICsgMSk7IGlkeCA8IHJ1bGVzLmxlbmd0aDsgaWR4KyspIHtcclxuXHRcdFx0XHRkZXBlbmRpbmdGaWVsZCA9IGpRdWVyeShcIiNcIiArIHJ1bGVzW2lkeF0pLmZpcnN0KCk7XHJcblxyXG5cdFx0XHRcdC8qIFVzZSBfcmVxdWlyZWQgZm9yIGRldGVybWluaW5nIHdldGhlciBkZXBlbmRpbmdGaWVsZCBoYXMgYSB2YWx1ZS5cclxuXHRcdFx0XHQgKiBUaGVyZSBpcyBsb2dpYyB0aGVyZSBmb3IgaGFuZGxpbmcgYWxsIGZpZWxkIHR5cGVzLCBhbmQgZGVmYXVsdCB2YWx1ZTsgc28gd2Ugd29uJ3QgcmVwbGljYXRlIHRoYXQgaGVyZVxyXG5cdFx0XHRcdCAqIEluZGljYXRlIHRoaXMgc3BlY2lhbCB1c2UgYnkgc2V0dGluZyB0aGUgbGFzdCBwYXJhbWV0ZXIgdG8gdHJ1ZSBzbyB3ZSBvbmx5IHZhbGlkYXRlIHRoZSBkZXBlbmRpbmdGaWVsZCBvbiBjaGFja2JveGVzIGFuZCByYWRpbyBidXR0b25zICgjNDYyKVxyXG5cdFx0XHRcdCAqL1xyXG5cdFx0XHRcdGlmIChkZXBlbmRpbmdGaWVsZC5sZW5ndGggJiYgbWV0aG9kcy5fcmVxdWlyZWQoZGVwZW5kaW5nRmllbGQsIFtcInJlcXVpcmVkXCJdLCAwLCBvcHRpb25zLCB0cnVlKSA9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdC8qIFdlIG5vdyBrbm93IGFueSBvZiB0aGUgZGVwZW5kaW5nIGZpZWxkcyBoYXMgYSB2YWx1ZSxcclxuXHRcdFx0XHRcdCAqIHNvIHdlIGNhbiB2YWxpZGF0ZSB0aGlzIGZpZWxkIGFzIHBlciBub3JtYWwgcmVxdWlyZWQgY29kZVxyXG5cdFx0XHRcdFx0ICovXHJcblx0XHRcdFx0XHRyZXR1cm4gbWV0aG9kcy5fcmVxdWlyZWQoZmllbGQsIFtcInJlcXVpcmVkXCJdLCAwLCBvcHRpb25zKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdCAgICBfc3VibWl0QnV0dG9uQ2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0ICAgICAgICB2YXIgYnV0dG9uID0gJCh0aGlzKTtcclxuXHQgICAgICAgIHZhciBmb3JtID0gYnV0dG9uLmNsb3Nlc3QoJ2Zvcm0sIC52YWxpZGF0aW9uRW5naW5lQ29udGFpbmVyJyk7XHJcblx0ICAgICAgICBmb3JtLmRhdGEoXCJqcXZfc3VibWl0QnV0dG9uXCIsIGJ1dHRvbi5hdHRyKFwiaWRcIikpO1xyXG5cdCAgICB9XHJcblx0XHQgIH07XHJcblxyXG5cdCAvKipcclxuXHQgKiBQbHVnaW4gZW50cnkgcG9pbnQuXHJcblx0ICogWW91IG1heSBwYXNzIGFuIGFjdGlvbiBhcyBhIHBhcmFtZXRlciBvciBhIGxpc3Qgb2Ygb3B0aW9ucy5cclxuXHQgKiBpZiBub25lLCB0aGUgaW5pdCBhbmQgYXR0YWNoIG1ldGhvZHMgYXJlIGJlaW5nIGNhbGxlZC5cclxuXHQgKiBSZW1lbWJlcjogaWYgeW91IHBhc3Mgb3B0aW9ucywgdGhlIGF0dGFjaGVkIG1ldGhvZCBpcyBOT1QgY2FsbGVkIGF1dG9tYXRpY2FsbHlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfVxyXG5cdCAqICAgICAgICAgICAgbWV0aG9kIChvcHRpb25hbCkgYWN0aW9uXHJcblx0ICovXHJcblx0ICQuZm4udmFsaWRhdGlvbkVuZ2luZSA9IGZ1bmN0aW9uKG1ldGhvZCkge1xyXG5cclxuXHRcdCB2YXIgZm9ybSA9ICQodGhpcyk7XHJcblx0XHQgaWYoIWZvcm1bMF0pIHJldHVybiBmb3JtOyAgLy8gc3RvcCBoZXJlIGlmIHRoZSBmb3JtIGRvZXMgbm90IGV4aXN0XHJcblxyXG5cdFx0IGlmICh0eXBlb2YobWV0aG9kKSA9PSAnc3RyaW5nJyAmJiBtZXRob2QuY2hhckF0KDApICE9ICdfJyAmJiBtZXRob2RzW21ldGhvZF0pIHtcclxuXHJcblx0XHRcdCAvLyBtYWtlIHN1cmUgaW5pdCBpcyBjYWxsZWQgb25jZVxyXG5cdFx0XHQgaWYobWV0aG9kICE9IFwic2hvd1Byb21wdFwiICYmIG1ldGhvZCAhPSBcImhpZGVcIiAmJiBtZXRob2QgIT0gXCJoaWRlQWxsXCIpXHJcblx0XHRcdCBtZXRob2RzLmluaXQuYXBwbHkoZm9ybSk7XHJcblxyXG5cdFx0XHQgcmV0dXJuIG1ldGhvZHNbbWV0aG9kXS5hcHBseShmb3JtLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcclxuXHRcdCB9IGVsc2UgaWYgKHR5cGVvZiBtZXRob2QgPT0gJ29iamVjdCcgfHwgIW1ldGhvZCkge1xyXG5cclxuXHRcdFx0IC8vIGRlZmF1bHQgY29uc3RydWN0b3Igd2l0aCBvciB3aXRob3V0IGFyZ3VtZW50c1xyXG5cdFx0XHQgbWV0aG9kcy5pbml0LmFwcGx5KGZvcm0sIGFyZ3VtZW50cyk7XHJcblx0XHRcdCByZXR1cm4gbWV0aG9kcy5hdHRhY2guYXBwbHkoZm9ybSk7XHJcblx0XHQgfSBlbHNlIHtcclxuXHRcdFx0ICQuZXJyb3IoJ01ldGhvZCAnICsgbWV0aG9kICsgJyBkb2VzIG5vdCBleGlzdCBpbiBqUXVlcnkudmFsaWRhdGlvbkVuZ2luZScpO1xyXG5cdFx0IH1cclxuXHR9O1xyXG5cclxuXHJcblxyXG5cdC8vIExFQUsgR0xPQkFMIE9QVElPTlNcclxuXHQkLnZhbGlkYXRpb25FbmdpbmU9IHtmaWVsZElkQ291bnRlcjogMCxkZWZhdWx0czp7XHJcblxyXG5cdFx0Ly8gTmFtZSBvZiB0aGUgZXZlbnQgdHJpZ2dlcmluZyBmaWVsZCB2YWxpZGF0aW9uXHJcblx0XHR2YWxpZGF0aW9uRXZlbnRUcmlnZ2VyOiBcImJsdXJcIixcclxuXHRcdC8vIEF1dG9tYXRpY2FsbHkgc2Nyb2xsIHZpZXdwb3J0IHRvIHRoZSBmaXJzdCBlcnJvclxyXG5cdFx0c2Nyb2xsOiB0cnVlLFxyXG5cdFx0Ly8gRm9jdXMgb24gdGhlIGZpcnN0IGlucHV0XHJcblx0XHRmb2N1c0ZpcnN0RmllbGQ6dHJ1ZSxcclxuXHRcdC8vIFNob3cgcHJvbXB0cywgc2V0IHRvIGZhbHNlIHRvIGRpc2FibGUgcHJvbXB0c1xyXG5cdFx0c2hvd1Byb21wdHM6IHRydWUsXHJcbiAgICAgICAvLyBTaG91bGQgd2UgYXR0ZW1wdCB0byB2YWxpZGF0ZSBub24tdmlzaWJsZSBpbnB1dCBmaWVsZHMgY29udGFpbmVkIGluIHRoZSBmb3JtPyAoVXNlZnVsIGluIGNhc2VzIG9mIHRhYmJlZCBjb250YWluZXJzLCBlLmcuIGpRdWVyeS1VSSB0YWJzKVxyXG4gICAgICAgdmFsaWRhdGVOb25WaXNpYmxlRmllbGRzOiBmYWxzZSxcclxuXHRcdC8vIE9wZW5pbmcgYm94IHBvc2l0aW9uLCBwb3NzaWJsZSBsb2NhdGlvbnMgYXJlOiB0b3BMZWZ0LFxyXG5cdFx0Ly8gdG9wUmlnaHQsIGJvdHRvbUxlZnQsIGNlbnRlclJpZ2h0LCBib3R0b21SaWdodCwgaW5saW5lXHJcblx0XHQvLyBpbmxpbmUgZ2V0cyBpbnNlcnRlZCBhZnRlciB0aGUgdmFsaWRhdGVkIGZpZWxkIG9yIGludG8gYW4gZWxlbWVudCBzcGVjaWZpZWQgaW4gZGF0YS1wcm9tcHQtdGFyZ2V0XHJcblx0XHRwcm9tcHRQb3NpdGlvbjogXCJ0b3BSaWdodFwiLFxyXG5cdFx0YmluZE1ldGhvZDpcImJpbmRcIixcclxuXHRcdC8vIGludGVybmFsLCBhdXRvbWF0aWNhbGx5IHNldCB0byB0cnVlIHdoZW4gaXQgcGFyc2UgYSBfYWpheCBydWxlXHJcblx0XHRpbmxpbmVBamF4OiBmYWxzZSxcclxuXHRcdC8vIGlmIHNldCB0byB0cnVlLCB0aGUgZm9ybSBkYXRhIGlzIHNlbnQgYXN5bmNocm9ub3VzbHkgdmlhIGFqYXggdG8gdGhlIGZvcm0uYWN0aW9uIHVybCAoZ2V0KVxyXG5cdFx0YWpheEZvcm1WYWxpZGF0aW9uOiBmYWxzZSxcclxuXHRcdC8vIFRoZSB1cmwgdG8gc2VuZCB0aGUgc3VibWl0IGFqYXggdmFsaWRhdGlvbiAoZGVmYXVsdCB0byBhY3Rpb24pXHJcblx0XHRhamF4Rm9ybVZhbGlkYXRpb25VUkw6IGZhbHNlLFxyXG5cdFx0Ly8gSFRUUCBtZXRob2QgdXNlZCBmb3IgYWpheCB2YWxpZGF0aW9uXHJcblx0XHRhamF4Rm9ybVZhbGlkYXRpb25NZXRob2Q6ICdnZXQnLFxyXG5cdFx0Ly8gQWpheCBmb3JtIHZhbGlkYXRpb24gY2FsbGJhY2sgbWV0aG9kOiBib29sZWFuIG9uQ29tcGxldGUoZm9ybSwgc3RhdHVzLCBlcnJvcnMsIG9wdGlvbnMpXHJcblx0XHQvLyByZXR1bnMgZmFsc2UgaWYgdGhlIGZvcm0uc3VibWl0IGV2ZW50IG5lZWRzIHRvIGJlIGNhbmNlbGVkLlxyXG5cdFx0b25BamF4Rm9ybUNvbXBsZXRlOiAkLm5vb3AsXHJcblx0XHQvLyBjYWxsZWQgcmlnaHQgYmVmb3JlIHRoZSBhamF4IGNhbGwsIG1heSByZXR1cm4gZmFsc2UgdG8gY2FuY2VsXHJcblx0XHRvbkJlZm9yZUFqYXhGb3JtVmFsaWRhdGlvbjogJC5ub29wLFxyXG5cdFx0Ly8gU3RvcHMgZm9ybSBmcm9tIHN1Ym1pdHRpbmcgYW5kIGV4ZWN1dGUgZnVuY3Rpb24gYXNzaWNpYXRlZCB3aXRoIGl0XHJcblx0XHRvblZhbGlkYXRpb25Db21wbGV0ZTogZmFsc2UsXHJcblxyXG5cdFx0Ly8gVXNlZCB3aGVuIHlvdSBoYXZlIGEgZm9ybSBmaWVsZHMgdG9vIGNsb3NlIGFuZCB0aGUgZXJyb3JzIG1lc3NhZ2VzIGFyZSBvbiB0b3Agb2Ygb3RoZXIgZGlzdHVyYmluZyB2aWV3aW5nIG1lc3NhZ2VzXHJcblx0XHRkb05vdFNob3dBbGxFcnJvc09uU3VibWl0OiBmYWxzZSxcclxuXHRcdC8vIE9iamVjdCB3aGVyZSB5b3Ugc3RvcmUgY3VzdG9tIG1lc3NhZ2VzIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IGVycm9yIG1lc3NhZ2VzXHJcblx0XHRjdXN0b21fZXJyb3JfbWVzc2FnZXM6e30sXHJcblx0XHQvLyB0cnVlIGlmIHlvdSB3YW50IHRvIHZpbmQgdGhlIGlucHV0IGZpZWxkc1xyXG5cdFx0YmluZGVkOiB0cnVlLFxyXG5cdFx0Ly8gc2V0IHRvIHRydWUsIHdoZW4gdGhlIHByb21wdCBhcnJvdyBuZWVkcyB0byBiZSBkaXNwbGF5ZWRcclxuXHRcdHNob3dBcnJvdzogdHJ1ZSxcclxuXHRcdC8vIGRpZCBvbmUgb2YgdGhlIHZhbGlkYXRpb24gZmFpbCA/IGtlcHQgZ2xvYmFsIHRvIHN0b3AgZnVydGhlciBhamF4IHZhbGlkYXRpb25zXHJcblx0XHRpc0Vycm9yOiBmYWxzZSxcclxuXHRcdC8vIExpbWl0IGhvdyBtYW55IGRpc3BsYXllZCBlcnJvcnMgYSBmaWVsZCBjYW4gaGF2ZVxyXG5cdFx0bWF4RXJyb3JzUGVyRmllbGQ6IGZhbHNlLFxyXG5cdFx0XHJcblx0XHQvLyBDYWNoZXMgZmllbGQgdmFsaWRhdGlvbiBzdGF0dXMsIHR5cGljYWxseSBvbmx5IGJhZCBzdGF0dXMgYXJlIGNyZWF0ZWQuXHJcblx0XHQvLyB0aGUgYXJyYXkgaXMgdXNlZCBkdXJpbmcgYWpheCBmb3JtIHZhbGlkYXRpb24gdG8gZGV0ZWN0IGlzc3VlcyBlYXJseSBhbmQgcHJldmVudCBhbiBleHBlbnNpdmUgc3VibWl0XHJcblx0XHRhamF4VmFsaWRDYWNoZToge30sXHJcblx0XHQvLyBBdXRvIHVwZGF0ZSBwcm9tcHQgcG9zaXRpb24gYWZ0ZXIgd2luZG93IHJlc2l6ZVxyXG5cdFx0YXV0b1Bvc2l0aW9uVXBkYXRlOiBmYWxzZSxcclxuXHJcblx0XHRJbnZhbGlkRmllbGRzOiBbXSxcclxuXHRcdG9uRmllbGRTdWNjZXNzOiBmYWxzZSxcclxuXHRcdG9uRmllbGRGYWlsdXJlOiBmYWxzZSxcclxuXHRcdG9uU3VjY2VzczogZmFsc2UsXHJcblx0XHRvbkZhaWx1cmU6IGZhbHNlLFxyXG5cdFx0dmFsaWRhdGVBdHRyaWJ1dGU6IFwiY2xhc3NcIixcclxuXHRcdGFkZFN1Y2Nlc3NDc3NDbGFzc1RvRmllbGQ6IFwiXCIsXHJcblx0XHRhZGRGYWlsdXJlQ3NzQ2xhc3NUb0ZpZWxkOiBcIlwiLFxyXG5cdFx0XHJcblx0XHQvLyBBdXRvLWhpZGUgcHJvbXB0XHJcblx0XHRhdXRvSGlkZVByb21wdDogZmFsc2UsXHJcblx0XHQvLyBEZWxheSBiZWZvcmUgYXV0by1oaWRlXHJcblx0XHRhdXRvSGlkZURlbGF5OiAxMDAwMCxcclxuXHRcdC8vIEZhZGUgb3V0IGR1cmF0aW9uIHdoaWxlIGhpZGluZyB0aGUgdmFsaWRhdGlvbnNcclxuXHRcdGZhZGVEdXJhdGlvbjogMC4zLFxyXG5cdCAvLyBVc2UgUHJldHRpZnkgc2VsZWN0IGxpYnJhcnlcclxuXHQgcHJldHR5U2VsZWN0OiBmYWxzZSxcclxuXHQgLy8gQWRkIGNzcyBjbGFzcyBvbiBwcm9tcHRcclxuXHQgYWRkUHJvbXB0Q2xhc3MgOiBcIlwiLFxyXG5cdCAvLyBDdXN0b20gSUQgdXNlcyBwcmVmaXhcclxuXHQgdXNlUHJlZml4OiBcIlwiLFxyXG5cdCAvLyBDdXN0b20gSUQgdXNlcyBzdWZmaXhcclxuXHQgdXNlU3VmZml4OiBcIlwiLFxyXG5cdCAvLyBPbmx5IHNob3cgb25lIG1lc3NhZ2UgcGVyIGVycm9yIHByb21wdFxyXG5cdCBzaG93T25lTWVzc2FnZTogZmFsc2VcclxuXHR9fTtcclxuXHQkKGZ1bmN0aW9uKCl7JC52YWxpZGF0aW9uRW5naW5lLmRlZmF1bHRzLnByb21wdFBvc2l0aW9uID0gbWV0aG9kcy5pc1JUTCgpPyd0b3BMZWZ0JzpcInRvcFJpZ2h0XCJ9KTtcclxufSkoalF1ZXJ5KTtcclxuXHJcblxyXG4iLCIoZnVuY3Rpb24oJCl7XHJcbiAgICAkLmZuLnZhbGlkYXRpb25FbmdpbmVMYW5ndWFnZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB9O1xyXG4gICAgJC52YWxpZGF0aW9uRW5naW5lTGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgbmV3TGFuZzogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJC52YWxpZGF0aW9uRW5naW5lTGFuZ3VhZ2UuYWxsUnVsZXMgPSB7XHJcbiAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IHsgLy8gQWRkIHlvdXIgcmVnZXggcnVsZXMgaGVyZSwgeW91IGNhbiB0YWtlIHRlbGVwaG9uZSBhcyBhbiBleGFtcGxlXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogVGhpcyBmaWVsZCBpcyByZXF1aXJlZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0Q2hlY2tib3hNdWx0aXBsZVwiOiBcIiogUGxlYXNlIHNlbGVjdCBhbiBvcHRpb25cIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dENoZWNrYm94ZVwiOiBcIiogVGhpcyBjaGVja2JveCBpcyByZXF1aXJlZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0RGF0ZVJhbmdlXCI6IFwiKiBCb3RoIGRhdGUgcmFuZ2UgZmllbGRzIGFyZSByZXF1aXJlZFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJyZXF1aXJlZEluRnVuY3Rpb25cIjogeyBcclxuICAgICAgICAgICAgICAgICAgICBcImZ1bmNcIjogZnVuY3Rpb24oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChmaWVsZC52YWwoKSA9PSBcInRlc3RcIikgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogRmllbGQgbXVzdCBlcXVhbCB0ZXN0XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImRhdGVSYW5nZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogSW52YWxpZCBcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dDJcIjogXCJEYXRlIFJhbmdlXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImRhdGVUaW1lUmFuZ2VcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIEludmFsaWQgXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHQyXCI6IFwiRGF0ZSBUaW1lIFJhbmdlXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm1pblNpemVcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIE1pbmltdW0gXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHQyXCI6IFwiIGNoYXJhY3RlcnMgcmVxdWlyZWRcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibWF4U2l6ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTWF4aW11bSBcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dDJcIjogXCIgY2hhcmFjdGVycyBhbGxvd2VkXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcblx0XHRcdFx0XCJncm91cFJlcXVpcmVkXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBZb3UgbXVzdCBmaWxsIG9uZSBvZiB0aGUgZm9sbG93aW5nIGZpZWxkc1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJtaW5cIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIE1pbmltdW0gdmFsdWUgaXMgXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm1heFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTWF4aW11bSB2YWx1ZSBpcyBcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwicGFzdFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogRGF0ZSBwcmlvciB0byBcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiZnV0dXJlXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBEYXRlIHBhc3QgXCJcclxuICAgICAgICAgICAgICAgIH0sXHRcclxuICAgICAgICAgICAgICAgIFwibWF4Q2hlY2tib3hcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIE1heGltdW0gXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHQyXCI6IFwiIG9wdGlvbnMgYWxsb3dlZFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJtaW5DaGVja2JveFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogUGxlYXNlIHNlbGVjdCBcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dDJcIjogXCIgb3B0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJlcXVhbHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIEZpZWxkcyBkbyBub3QgbWF0Y2hcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiY3JlZGl0Q2FyZFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogSW52YWxpZCBjcmVkaXQgY2FyZCBudW1iZXJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwicGhvbmVcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNyZWRpdDoganF1ZXJ5Lmg1dmFsaWRhdGUuanMgLyBvcmVmYWxvXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiAvXihbXFwrXVswLTldezEsM31bXFwgXFwuXFwtXSk/KFtcXChdezF9WzAtOV17Miw2fVtcXCldKT8oWzAtOVxcIFxcLlxcLVxcL117MywyMH0pKCh4fGV4dHxleHRlbnNpb24pW1xcIF0/WzAtOV17MSw0fSk/JC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIEludmFsaWQgcGhvbmUgbnVtYmVyXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImVtYWlsXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBIVE1MNSBjb21wYXRpYmxlIGVtYWlsIHJlZ2V4ICggaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2Uvc3RhdGVzLW9mLXRoZS10eXBlLWF0dHJpYnV0ZS5odG1sIyAgICBlLW1haWwtc3RhdGUtJTI4dHlwZT1lbWFpbCUyOSApXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFxdKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogSW52YWxpZCBlbWFpbCBhZGRyZXNzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImludGVnZXJcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL15bXFwtXFwrXT9cXGQrJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIE5vdCBhIHZhbGlkIGludGVnZXJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibnVtYmVyXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBOdW1iZXIsIGluY2x1ZGluZyBwb3NpdGl2ZSwgbmVnYXRpdmUsIGFuZCBmbG9hdGluZyBkZWNpbWFsLiBjcmVkaXQ6IG9yZWZhbG9cclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eW1xcLVxcK10/KCgoWzAtOV17MSwzfSkoWyxdWzAtOV17M30pKil8KFswLTldKykpPyhbXFwuXShbMC05XSspKT8kLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogSW52YWxpZCBmbG9hdGluZyBkZWNpbWFsIG51bWJlclwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJkYXRlXCI6IHsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vXHRDaGVjayBpZiBkYXRlIGlzIHZhbGlkIGJ5IGxlYXAgeWVhclxyXG5cdFx0XHRcImZ1bmNcIjogZnVuY3Rpb24gKGZpZWxkKSB7XHJcblx0XHRcdFx0XHR2YXIgcGF0dGVybiA9IG5ldyBSZWdFeHAoL14oXFxkezR9KVtcXC9cXC1cXC5dKDA/WzEtOV18MVswMTJdKVtcXC9cXC1cXC5dKDA/WzEtOV18WzEyXVswLTldfDNbMDFdKSQvKTtcclxuXHRcdFx0XHRcdHZhciBtYXRjaCA9IHBhdHRlcm4uZXhlYyhmaWVsZC52YWwoKSk7XHJcblx0XHRcdFx0XHRpZiAobWF0Y2ggPT0gbnVsbClcclxuXHRcdFx0XHRcdCAgIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHRcdFx0XHRcdHZhciB5ZWFyID0gbWF0Y2hbMV07XHJcblx0XHRcdFx0XHR2YXIgbW9udGggPSBtYXRjaFsyXSoxO1xyXG5cdFx0XHRcdFx0dmFyIGRheSA9IG1hdGNoWzNdKjE7XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dmFyIGRhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIGRheSk7IC8vIGJlY2F1c2UgbW9udGhzIHN0YXJ0cyBmcm9tIDAuXHJcblx0XHJcblx0XHRcdFx0XHRyZXR1cm4gKGRhdGUuZ2V0RnVsbFllYXIoKSA9PSB5ZWFyICYmIGRhdGUuZ2V0TW9udGgoKSA9PSAobW9udGggLSAxKSAmJiBkYXRlLmdldERhdGUoKSA9PSBkYXkpO1xyXG5cdFx0XHRcdH0sICAgICAgICAgICAgICAgIFx0XHRcclxuXHRcdFx0IFwiYWxlcnRUZXh0XCI6IFwiKiBJbnZhbGlkIGRhdGUsIG11c3QgYmUgaW4gWVlZWS1NTS1ERCBmb3JtYXRcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiaXB2NFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiAvXigoKFswMV0/WzAtOV17MSwyfSl8KDJbMC00XVswLTldKXwoMjVbMC01XSkpWy5dKXszfSgoWzAtMV0/WzAtOV17MSwyfSl8KDJbMC00XVswLTldKXwoMjVbMC01XSkpJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIEludmFsaWQgSVAgYWRkcmVzc1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJ1cmxcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL14oaHR0cHM/fGZ0cCk6XFwvXFwvKCgoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDopKkApPygoKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKSl8KCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuPykoOlxcZCopPykoXFwvKCgoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKSsoXFwvKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKikqKT8pPyhcXD8oKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApfFtcXHVFMDAwLVxcdUY4RkZdfFxcL3xcXD8pKik/KFxcIygoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8XFwvfFxcPykqKT8kL2ksXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIEludmFsaWQgVVJMXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm9ubHlOdW1iZXJTcFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiAvXlswLTlcXCBdKyQvLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBOdW1iZXJzIG9ubHlcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwib25seUxldHRlclNwXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eW2EtekEtWlxcIFxcJ10rJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIExldHRlcnMgb25seVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJvbmx5TGV0dGVyTnVtYmVyXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eWzAtOWEtekEtWl0rJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIE5vIHNwZWNpYWwgY2hhcmFjdGVycyBhbGxvd2VkXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAvLyAtLS0gQ1VTVE9NIFJVTEVTIC0tIFRob3NlIGFyZSBzcGVjaWZpYyB0byB0aGUgZGVtb3MsIHRoZXkgY2FuIGJlIHJlbW92ZWQgb3IgY2hhbmdlZCB0byB5b3VyIGxpa2luZ3NcclxuICAgICAgICAgICAgICAgIFwiYWpheFVzZXJDYWxsXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInVybFwiOiBcImFqYXhWYWxpZGF0ZUZpZWxkVXNlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHlvdSBtYXkgd2FudCB0byBwYXNzIGV4dHJhIGRhdGEgb24gdGhlIGFqYXggY2FsbFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXh0cmFEYXRhXCI6IFwibmFtZT1lcmljXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIFRoaXMgdXNlciBpcyBhbHJlYWR5IHRha2VuXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRMb2FkXCI6IFwiKiBWYWxpZGF0aW5nLCBwbGVhc2Ugd2FpdFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cdFx0XHRcdFwiYWpheFVzZXJDYWxsUGhwXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInVybFwiOiBcInBocGFqYXgvYWpheFZhbGlkYXRlRmllbGRVc2VyLnBocFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHlvdSBtYXkgd2FudCB0byBwYXNzIGV4dHJhIGRhdGEgb24gdGhlIGFqYXggY2FsbFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXh0cmFEYXRhXCI6IFwibmFtZT1lcmljXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgeW91IHByb3ZpZGUgYW4gXCJhbGVydFRleHRPa1wiLCBpdCB3aWxsIHNob3cgYXMgYSBncmVlbiBwcm9tcHQgd2hlbiB0aGUgZmllbGQgdmFsaWRhdGVzXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRPa1wiOiBcIiogVGhpcyB1c2VybmFtZSBpcyBhdmFpbGFibGVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogVGhpcyB1c2VyIGlzIGFscmVhZHkgdGFrZW5cIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dExvYWRcIjogXCIqIFZhbGlkYXRpbmcsIHBsZWFzZSB3YWl0XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImFqYXhOYW1lQ2FsbFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3RlIGpzb24gc2VydmljZSBsb2NhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6IFwiYWpheFZhbGlkYXRlRmllbGROYW1lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZXJyb3JcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogVGhpcyBuYW1lIGlzIGFscmVhZHkgdGFrZW5cIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB5b3UgcHJvdmlkZSBhbiBcImFsZXJ0VGV4dE9rXCIsIGl0IHdpbGwgc2hvdyBhcyBhIGdyZWVuIHByb21wdCB3aGVuIHRoZSBmaWVsZCB2YWxpZGF0ZXNcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dE9rXCI6IFwiKiBUaGlzIG5hbWUgaXMgYXZhaWxhYmxlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc3BlYWtzIGJ5IGl0c2VsZlxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0TG9hZFwiOiBcIiogVmFsaWRhdGluZywgcGxlYXNlIHdhaXRcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuXHRcdFx0XHQgXCJhamF4TmFtZUNhbGxQaHBcIjoge1xyXG5cdCAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3RlIGpzb24gc2VydmljZSBsb2NhdGlvblxyXG5cdCAgICAgICAgICAgICAgICAgICAgXCJ1cmxcIjogXCJwaHBhamF4L2FqYXhWYWxpZGF0ZUZpZWxkTmFtZS5waHBcIixcclxuXHQgICAgICAgICAgICAgICAgICAgIC8vIGVycm9yXHJcblx0ICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogVGhpcyBuYW1lIGlzIGFscmVhZHkgdGFrZW5cIixcclxuXHQgICAgICAgICAgICAgICAgICAgIC8vIHNwZWFrcyBieSBpdHNlbGZcclxuXHQgICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0TG9hZFwiOiBcIiogVmFsaWRhdGluZywgcGxlYXNlIHdhaXRcIlxyXG5cdCAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJ2YWxpZGF0ZTJmaWVsZHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBQbGVhc2UgaW5wdXQgSEVMTE9cIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuXHQgICAgICAgICAgICAvL3RscyB3YXJuaW5nOmhvbWVncm93biBub3QgZmllbGRlZCBcclxuICAgICAgICAgICAgICAgIFwiZGF0ZUZvcm1hdFwiOntcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eXFxkezR9W1xcL1xcLV0oMD9bMS05XXwxWzAxMl0pW1xcL1xcLV0oMD9bMS05XXxbMTJdWzAtOV18M1swMV0pJHxeKD86KD86KD86MD9bMTM1NzhdfDFbMDJdKShcXC98LSkzMSl8KD86KD86MD9bMSwzLTldfDFbMC0yXSkoXFwvfC0pKD86Mjl8MzApKSkoXFwvfC0pKD86WzEtOV1cXGRcXGRcXGR8XFxkWzEtOV1cXGRcXGR8XFxkXFxkWzEtOV1cXGR8XFxkXFxkXFxkWzEtOV0pJHxeKD86KD86MD9bMS05XXwxWzAtMl0pKFxcL3wtKSg/OjA/WzEtOV18MVxcZHwyWzAtOF0pKShcXC98LSkoPzpbMS05XVxcZFxcZFxcZHxcXGRbMS05XVxcZFxcZHxcXGRcXGRbMS05XVxcZHxcXGRcXGRcXGRbMS05XSkkfF4oMD8yKFxcL3wtKTI5KShcXC98LSkoPzooPzowWzQ4XTAwfFsxMzU3OV1bMjZdMDB8WzI0NjhdWzA0OF0wMCl8KD86XFxkXFxkKT8oPzowWzQ4XXxbMjQ2OF1bMDQ4XXxbMTM1NzldWzI2XSkpJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIEludmFsaWQgRGF0ZVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgLy90bHMgd2FybmluZzpob21lZ3Jvd24gbm90IGZpZWxkZWQgXHJcblx0XHRcdFx0XCJkYXRlVGltZUZvcm1hdFwiOiB7XHJcblx0ICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL15cXGR7NH1bXFwvXFwtXSgwP1sxLTldfDFbMDEyXSlbXFwvXFwtXSgwP1sxLTldfFsxMl1bMC05XXwzWzAxXSlcXHMrKDFbMDEyXXwwP1sxLTldKXsxfTooMD9bMS01XXxbMC02XVswLTldKXsxfTooMD9bMC02XXxbMC02XVswLTldKXsxfVxccysoYW18cG18QU18UE0pezF9JHxeKD86KD86KD86MD9bMTM1NzhdfDFbMDJdKShcXC98LSkzMSl8KD86KD86MD9bMSwzLTldfDFbMC0yXSkoXFwvfC0pKD86Mjl8MzApKSkoXFwvfC0pKD86WzEtOV1cXGRcXGRcXGR8XFxkWzEtOV1cXGRcXGR8XFxkXFxkWzEtOV1cXGR8XFxkXFxkXFxkWzEtOV0pJHxeKCgxWzAxMl18MD9bMS05XSl7MX1cXC8oMD9bMS05XXxbMTJdWzAtOV18M1swMV0pezF9XFwvXFxkezIsNH1cXHMrKDFbMDEyXXwwP1sxLTldKXsxfTooMD9bMS01XXxbMC02XVswLTldKXsxfTooMD9bMC02XXxbMC02XVswLTldKXsxfVxccysoYW18cG18QU18UE0pezF9KSQvLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBJbnZhbGlkIERhdGUgb3IgRGF0ZSBGb3JtYXRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dDJcIjogXCJFeHBlY3RlZCBGb3JtYXQ6IFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0M1wiOiBcIm1tL2RkL3l5eXkgaGg6bW06c3MgQU18UE0gb3IgXCIsIFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0NFwiOiBcInl5eXktbW0tZGQgaGg6bW06c3MgQU18UE1cIlxyXG5cdCAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkLnZhbGlkYXRpb25FbmdpbmVMYW5ndWFnZS5uZXdMYW5nKCk7XHJcbiAgICBcclxufSkoalF1ZXJ5KTtcclxuIiwiKGZ1bmN0aW9uKCQpe1xyXG4gICAgJC5mbi52YWxpZGF0aW9uRW5naW5lTGFuZ3VhZ2UgPSBmdW5jdGlvbigpe1xyXG4gICAgfTtcclxuICAgICQudmFsaWRhdGlvbkVuZ2luZUxhbmd1YWdlID0ge1xyXG4gICAgICAgIG5ld0xhbmc6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICQudmFsaWRhdGlvbkVuZ2luZUxhbmd1YWdlLmFsbFJ1bGVzID0ge1xyXG4gICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogQ2UgY2hhbXAgZXN0IHJlcXVpc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0Q2hlY2tib3hNdWx0aXBsZVwiOiBcIiogQ2hvaXNpciB1bmUgb3B0aW9uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRDaGVja2JveGVcIjogXCIqIENldHRlIG9wdGlvbiBlc3QgcmVxdWlzZVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJyZXF1aXJlZEluRnVuY3Rpb25cIjogeyBcclxuICAgICAgICAgICAgICAgICAgICBcImZ1bmNcIjogZnVuY3Rpb24oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChmaWVsZC52YWwoKSA9PSBcInRlc3RcIikgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogRmllbGQgbXVzdCBlcXVhbCB0ZXN0XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgIFwibWluU2l6ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTWluaW11bSBcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dDJcIjogXCIgY2FyYWN0w6hyZXMgcmVxdWlzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcblx0XHRcdFx0XCJncm91cFJlcXVpcmVkXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBWb3VzIGRldmV6IHJlbXBsaXIgdW4gZGVzIGNoYW1wcyBzdWl2YW50XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm1heFNpemVcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIE1heGltdW0gXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHQyXCI6IFwiIGNhcmFjdMOocmVzIHJlcXVpc1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cdFx0ICAgICAgICBcIm1pblwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogVmFsZXVyIG1pbmltdW0gcmVxdWlzZSBcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibWF4XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBWYWxldXIgbWF4aW11bSByZXF1aXNlIFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cdFx0ICAgICAgICBcInBhc3RcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIERhdGUgYW50w6lyaWV1cmUgYXUgXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImZ1dHVyZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogRGF0ZSBwb3N0w6lyaWV1cmUgYXUgXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm1heENoZWNrYm94XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBOb21icmUgbWF4IGRlIGNob2l4IGV4Y8OpZMOpXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm1pbkNoZWNrYm94XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBWZXVpbGxleiBjaG9pc2lyIFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0MlwiOiBcIiBvcHRpb25zXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImVxdWFsc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogVm90cmUgY2hhbXAgbidlc3QgcGFzIGlkZW50aXF1ZVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJjcmVkaXRDYXJkXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBOdW3DqXJvIGRlIGNhcnRlIGJhbmNhaXJlIHZhbGlkZVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJwaG9uZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlZGl0OiBqcXVlcnkuaDV2YWxpZGF0ZS5qcyAvIG9yZWZhbG9cclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eKFtcXCtdWzAtOV17MSwzfVsgXFwuXFwtXSk/KFtcXChdezF9WzAtOV17Miw2fVtcXCldKT8oWzAtOSBcXC5cXC1cXC9dezMsMjB9KSgoeHxleHR8ZXh0ZW5zaW9uKVsgXT9bMC05XXsxLDR9KT8kLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTnVtw6lybyBkZSB0w6lsw6lwaG9uZSBpbnZhbGlkZVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJlbWFpbFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2hhbWVsZXNzbHkgbGlmdGVkIGZyb20gU2NvdHQgR29uemFsZXogdmlhIHRoZSBCYXNzaXN0YW5jZSBWYWxpZGF0aW9uIHBsdWdpbiBodHRwOi8vcHJvamVjdHMuc2NvdHRzcGxheWdyb3VuZC5jb20vZW1haWxfYWRkcmVzc192YWxpZGF0aW9uL1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL14oKChbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKFxcLihbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKSopfCgoXFx4MjIpKCgoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oKFtcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDdmXXxcXHgyMXxbXFx4MjMtXFx4NWJdfFtcXHg1ZC1cXHg3ZV18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfChcXFxcKFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZC1cXHg3Zl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSkpKigoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oXFx4MjIpKSlAKCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuPyQvaSxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogQWRyZXNzZSBlbWFpbCBpbnZhbGlkZVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJpbnRlZ2VyXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eW1xcLVxcK10/XFxkKyQvLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBOb21icmUgZW50aWVyIGludmFsaWRlXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm51bWJlclwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTnVtYmVyLCBpbmNsdWRpbmcgcG9zaXRpdmUsIG5lZ2F0aXZlLCBhbmQgZmxvYXRpbmcgZGVjaW1hbC4gY3JlZGl0OiBvcmVmYWxvXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiAvXltcXC1cXCtdPygoKFswLTldezEsM30pKFssXVswLTldezN9KSopfChbMC05XSspKT8oW1xcLl0oWzAtOV0rKSk/JC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIE5vbWJyZSBmbG90dGFudCBpbnZhbGlkZVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJkYXRlXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eXFxkezR9W1xcL1xcLV0oMD9bMS05XXwxWzAxMl0pW1xcL1xcLV0oMD9bMS05XXxbMTJdWzAtOV18M1swMV0pJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIERhdGUgaW52YWxpZGUsIGZvcm1hdCBZWVlZLU1NLUREIHJlcXVpc1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJpcHY0XCI6IHtcclxuICAgICAgICAgICAgICAgIFx0XCJyZWdleFwiOiAvXigoKFswMV0/WzAtOV17MSwyfSl8KDJbMC00XVswLTldKXwoMjVbMC01XSkpWy5dKXszfSgoWzAtMV0/WzAtOV17MSwyfSl8KDJbMC00XVswLTldKXwoMjVbMC01XSkpJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIEFkcmVzc2UgSVAgaW52YWxpZGVcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwidXJsXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eKGh0dHBzP3xmdHApOlxcL1xcLygoKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6KSpAKT8oKChcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSkpfCgoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4pKygoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLj8pKDpcXGQqKT8pKFxcLygoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCkrKFxcLygoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKSopKik/KT8oXFw/KCgoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKXxbXFx1RTAwMC1cXHVGOEZGXXxcXC98XFw/KSopPyhcXCMoKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApfFxcL3xcXD8pKik/JC9pLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBVUkwgaW52YWxpZGVcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwib25seU51bWJlclNwXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eWzAtOVxcIF0rJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIFNldWxzIGxlcyBjaGlmZnJlcyBzb250IGFjY2VwdMOpc1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJvbmx5TGV0dGVyU3BcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL15bYS16QS1aXFx1MDBDMC1cXHUwMEQ2XFx1MDBEOS1cXHUwMEY2XFx1MDBGOS1cXHUwMEZEXFwgXFwnXSskLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogU2V1bGVzIGxlcyBsZXR0cmVzIHNvbnQgYWNjZXB0w6llc1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJvbmx5TGV0dGVyTnVtYmVyXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eWzAtOWEtekEtWlxcdTAwQzAtXFx1MDBENlxcdTAwRDktXFx1MDBGNlxcdTAwRjktXFx1MDBGRF0rJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIEF1Y3VuIGNhcmFjdMOocmUgc3DDqWNpYWwgbidlc3QgYWNjZXB0w6lcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuXHRcdFx0XHQvLyAtLS0gQ1VTVE9NIFJVTEVTIC0tIFRob3NlIGFyZSBzcGVjaWZpYyB0byB0aGUgZGVtb3MsIHRoZXkgY2FuIGJlIHJlbW92ZWQgb3IgY2hhbmdlZCB0byB5b3VyIGxpa2luZ3NcclxuICAgICAgICAgICAgICAgIFwiYWpheFVzZXJDYWxsXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInVybFwiOiBcImFqYXhWYWxpZGF0ZUZpZWxkVXNlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXh0cmFEYXRhXCI6IFwibmFtZT1lcmljXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRMb2FkXCI6IFwiKiBDaGFyZ2VtZW50LCB2ZXVpbGxleiBhdHRlbmRyZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBDZSBub20gZXN0IGTDqWrDoCBwcmlzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImFqYXhOYW1lQ2FsbFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ1cmxcIjogXCJhamF4VmFsaWRhdGVGaWVsZE5hbWVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogQ2Ugbm9tIGVzdCBkw6lqw6AgcHJpc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0T2tcIjogXCIqQ2Ugbm9tIGVzdCBkaXNwb25pYmxlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRMb2FkXCI6IFwiKiBDaGFyZ2VtZW50LCB2ZXVpbGxleiBhdHRlbmRyZVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJ2YWxpZGF0ZTJmaWVsZHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiVmV1aWxsZXogdGFwZXIgbGUgbW90IEhFTExPXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgJC52YWxpZGF0aW9uRW5naW5lTGFuZ3VhZ2UubmV3TGFuZygpO1xyXG59KShqUXVlcnkpOyJdfQ==
