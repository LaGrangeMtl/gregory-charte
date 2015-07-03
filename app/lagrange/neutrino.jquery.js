/*The MIT License (MIT)

Copyright (c) 2013 Nicolas Poirier-Barolet

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

;(function($) {
	// Polyfill for IE8
	if (typeof Object.create !== 'function') {
	    Object.create = function (o) {
	        function F() {}
	        F.prototype = o;
	        return new F();
	    };
	}

	var Neutrino = {
		//=====================================================================
		// init : Public Function
		//
		// @params : options
		//		Custom settings of the user. May be an empty object.
		//
		// @params : context
		//		Element that will be defined as the root of the slideshow
		//
		// This function initialize the slideshow process. Variables are set up 
		// here and the Parameters of the whole slideshow also. After the 
		// setting is done, it starts the timer.
		//=====================================================================
		init : function(options, context) {
			this.TWEENER = (window.GreenSockGlobals || window).TweenMax;
			this.root = $(context);
			this.slides = this.root.find('.slide');

			this.originalWidth = this.root.width();

			// Default values
			this.options = {
				transitionType: 'slide',
				transitionTime: 0.75,
				slideWidth: this.slides.eq(0).width(),
				timer: 3500,
				hasArrows: false,
				hasTimer: true,
				hasNav: false,
				slidesPerPage: 1,
				slidePerSteps: false,
				isResponsive: false,
				usesAbstractTransition:false,
				navRoot: this.root
			};

			this.options = $.extend({},this.options,options);

			if(options.navRoot) {
				this.options.navRoot = this.root.find(options.navRoot);
			}

			if(this.slides.length <= 1){
				this.options.hasNav = false;
				this.options.hasArrows = false;
			}
			
			this._build();

			if(this.options.isResponsive){
				var _self = this;
				$(window).on('resize.neutrino', function(){
					_self._updateProperties();
				}).resize();
			}

			return this;
		},

		_updateProperties:function(){
			this.options.slideWidth = this.slides.eq(0).width();

			if(this.options.centerContent){
				var stopCenteringAt = this.options.isResponsive.stopCenteringAt;
				var stopCentering = (this.options.isResponsive && stopCenteringAt && $(window).width() <= stopCenteringAt);

				this._centerContent(stopCentering);
			}

			if(this.options.isResponsive.removeArrowsAt && $(window).width() <= this.options.isResponsive.removeArrowsAt){
				this.arrows.off('.neutrino');
				this.arrows.hide();
			}
			else if(this.options.isResponsive.removeArrowsAt && !this.arrows.is(':visible')){
				this._setArrowEvents();
				this.arrows.show();
			}
		},

		//=====================================================================
		// _build : Private Function
		//
		// Sets various properties to the Neutrino object that will be used
		// later. Creates Navigation and Arrows if needed and starts the slider
		// with a timer or not, depending of the options. 
		//=====================================================================
		_build : function() {
			this.arrows = this.root.find('.arrow');
			this.nav = this.root.find('nav');
			this.navButtons = undefined;
			this.timer = undefined;

			this.currentIndex = 0;
			this.direction = 1;

			// FAKE PAGINATION
			if(this.options.slidesPerPage > 1){
				this._paginate();
			}

			if(this.options.hasArrows) {
				this._createArrows();
			}

			if(this.options.hasNav) {
				this._createNav();
				this._updateNav();
			}

			if(this.options.centerContent){
				this._centerContent();
			}

			if(this.options.buildHook){
				this.options.buildHook.call(this);
			}

			if((this.options.timer > 0 || this.options == undefined) && this.slides.length > 1) {
				this._initSlides();
				this._setTimer();
			}
			else {
				this.options.timer = false;
				this._initSlides();
			}
		},

		_centerContent : function(stopCentering){
			for(var i = 0; i < this.slides.length; i++){
				var posTop;
				var _slide = this.slides.eq(i);
				_slide.show();
				var content = _slide.find('.content');
				
				if(content.length > 0 && !stopCentering){
					if(this.options.centerContent.inBetweenNavAndTop){
						var navPadding = (this.nav.height() - this.nav.find('li').eq(0).height()) / 2;
						var availableSpace = this.root.height() - this.nav.height() + navPadding;

						posTop = Math.round((availableSpace / 2) - (content.height() / 2));
					}
					else {
						posTop = Math.round((this.root.height() / 2) - (content.height() / 2));
					}

					content.css({
						position:'absolute',
						left:'0',
						top:posTop+'px',
						width:'100%'
					})
				}
				else if(content.length > 0) {
					content.css({
						position:'absolute',
						left:'0',
						top:'0',
						width:'100%'
					})
				}
			}

			this.slides.hide();
			this.slides.eq(this.currentIndex).show();
		},

		//=====================================================================
		// _paginate : Private Function
		//
		// Paginates the slideshow if the options : slidesPerPage was changed
		// by the user. Will set slides in containers and deal with their width
		//=====================================================================
		_paginate : function(){
			this.slides.addClass('floating');
			
			var nSlideContainersNeeded = this.slides.length / this.options.slidesPerPage;
			var slidesTemp = [];
			var slideContainers = [];
			var slideContainerIndex = 0;
			var _height = this.slides.eq(0).height();
			var lastSlideContainerChildren;

			if(this.slides.length % this.options.slidesPerPage > 0){
				this.options.slidePerSteps = false;
				nSlideContainersNeeded = Math.floor(nSlideContainersNeeded) + 1;
			}

			if(this.options.slidePerSteps){
				this.options.hasNav = false;
			}

			for (var i = 0; i < nSlideContainersNeeded; i++) {
				slideContainers.push($('<div class="slideContainer"></div>'));
			};

			for (var i = 0; i < this.slides.length; i++) {
				slidesTemp.push(this.slides[i]);

				if(((i + 1) % this.options.slidesPerPage == 0) || (i == this.slides.length - 1)){
					for (var j = 0; j < slidesTemp.length; j++) {
						var _slide = $(slidesTemp[j]);
						_slide.css({
							width:(100/this.options.slidesPerPage) + '%'
						});
						slideContainers[slideContainerIndex].append(_slide);
					};

					slideContainerIndex++;
					for(var k = 0; k < this.options.slidesPerPage; k++){
						slidesTemp.shift();
					}
				}
			};

			lastSlideContainerChildren = slideContainers[slideContainers.length - 1].children();
			if(lastSlideContainerChildren.length < this.options.slidesPerPage){
				for(var i = 0; i < lastSlideContainerChildren.length; i++){	
					lastSlideContainerChildren.css({
						width:(100/lastSlideContainerChildren.length) + '%'
					});
				}
			}

			this.root.append(slideContainers);
			this.slides = this.root.find('.slideContainer');
			this.slides.eq(0).show();
			this.options.slideWidth = this.slides.eq(0).outerWidth();
		},

		//=====================================================================
		// _setArrowEvents : Private Function
		//
		// Will set the click events on the arrows. Direction is set by the
		// data attribute on the tags.
		//=====================================================================
		_setArrowEvents : function() {
			var _self = this;
			this.arrows.on('click.neutrino', function(e){
				clearTimeout(_self.timer);
				//deactivate timer altogether on navig, if requested by the options
				_self.options.hasTimer = !_self.options.clearTimerOnNav;

				_self.direction = $(e.target).data('direction');

				_self.arrows.off('.neutrino');
				_self._initSlides(e);
				_self._changeSlide();
			})
		},

		//=====================================================================
		// _createArrows : Private Function
		//
		// Creates the arrows for the slideshow. Uses <div> tags, 
		// and sets the direction by using the data attribute.
		//=====================================================================
		_createArrows : function(){
			var arrowsMarkup = '<div class="arrow left" data-direction="-1"></div>';
			arrowsMarkup += '<div class="arrow right" data-direction="1"></div>';

			this.root.append(arrowsMarkup);
			this.arrows = this.root.find('.arrow');

			this._setArrowEvents();
		},

		//=====================================================================
		// _setNavEvents : Private Function
		//
		// Will set the click events on the nav. If you click on an already
		// active slide, the function will return, thus making the whole
		// process wait for another click or the timer to change the slide.
		//=====================================================================
		_setNavEvents : function() {
			var _self = this;
			this.navButtons.on('click.neutrino', function(e){
				// If is already active, wait for the timer to change slide
				if($(e.target).hasClass('active')){
					return;
				}
				else {
					clearTimeout(_self.timer);
					//deactivate timer altogether on navig, if requested by the options
					_self.options.hasTimer = !_self.options.clearTimerOnNav;

					_self.direction = 0;

					_self._initSlides(e);
					_self._changeSlide();
				}
			});
		},

		//=====================================================================
		// _updateNav : Private Function
		//
		// Updates the navButtons style.
		//=====================================================================
		_updateNav : function() {
			this.navButtons.removeClass('active');
			this.navButtons.eq(this.currentIndex).addClass('active');
		},

		//=====================================================================
		// _createNav : Private Function
		//
		// Creates the navigation for the slideshow. Uses <li> tags, 
		// and sets the width of the <ul> for it to be centered.
		//=====================================================================
		_createNav : function(){
			var nbOfSlides = this.slides.length;
			var nav = '<nav><ul>';

			for(var i=0; i < this.slides.length; i++) {
				nav += '<li></li>';
			}

			nav += '</ul></nav>';

			this.options.navRoot.append(nav);
			this.nav = this.root.find('nav');
			this.navButtons = this.nav.find('li');

			var liWidth = this.navButtons.eq(0).width();
			var liMargin = this.navButtons.eq(1).css('margin-left');
			liMargin = liMargin.substring(0, liMargin.length - 2);

			var ulPadding = this.nav.find('ul').css('padding-left');
			ulPadding = ulPadding.substring(0, ulPadding.length - 2);

			this.nav.find('ul').css({width: (liWidth * nbOfSlides) + (liMargin * (nbOfSlides - 1)) + (ulPadding * 2) + "px"})

			this._setNavEvents();
		},

		//=====================================================================
		// _initSlides : Private Function
		//
		// @params : e
		//		If not defined, it means no click event was done to get here
		//		therefore, the direction should be 1, which is equal to right
		//		to left. Please note that not all of the animations will make
		//		use of the direction parameter. i.e. Fade in/out
		//
		//		If e is defined, a click was made. If it was on the nav, the
		//		direction property will be of 0. The nextIndex will then become
		//		the targeted nav button. Otherwise, the direction will be equal
		//		to what the arrow event set it to [see _setArrowEvents()]
		//=====================================================================
		_initSlides : function(e){
			this.currentSlide = this.slides.eq(this.currentIndex);
			this.nextIndex = this.currentIndex + this.direction;

			if(e){
				// If this direction == 0, it means that we clicked on the nav
				// buttons
				if(this.direction == 0) {
					this.nextIndex = this.navButtons.index($(e.target));

					if(this.nextIndex < this.currentIndex)
						this.direction = -1;
					else
						this.direction = 1;
				}
			}
			else {
				this.direction = 1;
			}

			if(this.nextIndex >= this.slides.length)
				this.nextIndex = 0;
			else if (this.nextIndex < 0)
				this.nextIndex = this.slides.length - 1;

			this.nextSlide = this.slides.eq(this.nextIndex);

			switch(this.options.transitionType) {
				case 'slide': break;
				case 'fade': break;
				case 'slideFluid': this._setupSlideFluidHeight(); break;
				case 'custom':break;
				default: console.error('Neutrino: Unknown animation type.'); return;
			}

			this.slides.hide();
			this.currentSlide.show();
		},

		//=====================================================================
		// goToSlide : Public Function
		//
		// @params : slideIndex
		//		Index of the slide you want to go to.
		//
		// Go directly to a slide. The direction will be calculated depending
		// on the slide you want to go to.
		//=====================================================================
		goToSlide : function(slideIndex){
			var targetIndex = slideIndex;
			if(typeof slideIndex == 'object')
				targetIndex = slideIndex[0];

			var _self = this;
			clearTimeout(_self.timer);
			this.currentSlide = this.slides.eq(this.currentIndex);
			this.nextIndex = targetIndex;

			if(this.nextIndex >= this.slides.length)
				this.nextIndex = 0;
			else if (this.nextIndex < 0)
				this.nextIndex = this.slides.length - 1;

			if(this.nextIndex == this.currentIndex)
				return;
			
			this.nextSlide = this.slides.eq(this.nextIndex);
			this.direction = (this.nextIndex > this.currentIndex) ? 1 : -1;

			switch(this.options.transitionType) {
				case 'slide': break;
				case 'fade': break;
				case 'custom': break;
				case 'slideFluid': this._setupSlideFluidHeight(); break;
				default: console.error('Neutrino: Unknown animation type.'); return;
			}

			this._changeSlide();
		},

		//=====================================================================
		// _changeSlide : Private Function
		//
		// This is where the slides are changed. For the whole process, the 
		// arrows and the nav buttons will be disabled. They will be enabled
		// again after the animations are done. Depending on the transitionType
		// property of the slideshow, it will call the right animation function
		//=====================================================================
		_changeSlide : function(){
			var animation = $.Deferred();

			if(this.options.hasNav)
				this.navButtons.off('.neutrino');

			if(this.options.hasArrows)
				this.arrows.off('.neutrino');

			switch(this.options.transitionType) {
				case 'slide': animation = this._slide(); break;
				case 'slideFluid': animation = this._slideFluidHeight(); break;
				case 'fade': animation = this._fade(); break;
				case 'custom': animation = this._customAnimation(); break;
				default: console.error('Neutrino: Unknown animation type.'); return;
			}

			var _self = this;
			animation.done(function(){
				if(_self.options.hasNav){
					_self._updateNav();
					_self._setNavEvents();
				}

				if(_self.options.hasArrows)
					_self._setArrowEvents();
				
				if(_self.options.timer) {
					_self.direction = 1;
					_self._setTimer();
				}
			})
		},

		_customAnimation:function(){
			if(this.options.usesAbstractTransition){
				var animationDfd = this.options.userCustomTransition.call(this, this.currentSlide, this.nextSlide);
				this.currentIndex = this.nextIndex;
			}
			else {
				var animationDfd = this.options.userCustomTransition.call(this);
			}

			return animationDfd;
		},

		//=====================================================================
		// _fade : Private Function
		//
		// @returns : $.Deferred();
		//
		// Function to be called when the transitionType property is set to
		// 'fade'.
		//=====================================================================
		_fade : function(){
			var firstSlide = $.Deferred();
			var secondSlide = $.Deferred();
			var animationDeferred = $.Deferred();

			this.nextSlide.css({zIndex:1, opacity:0}).show();

			this.currentSlide.css({zIndex:2})

			//this._updateNav();

			var _self = this;
			this.TWEENER.to(this.currentSlide, this.options.transitionTime, {
				opacity: 0,
				
				onComplete:function(){
					firstSlide.resolve();

					_self.currentSlide.hide().css({zIndex:1});
				}
			});

			this.TWEENER.to(this.nextSlide, this.options.transitionTime, {
				opacity: 1,
				
				onComplete:function(){
					secondSlide.resolve();
				}
			});

			this.currentIndex = _self.nextIndex;
			this._updateNav();
			
			_self = this;
			$.when(firstSlide, secondSlide).then(function(){
				animationDeferred.resolve();
			});

			return animationDeferred;
		},

		//=====================================================================
		// _slide : Private Function
		//
		// @returns : $.Deferred();
		//
		// Function to be called when the transitionType property is set to
		// 'slide'.
		//=====================================================================
		_slide : function(){
			var firstSlide = $.Deferred();
			var secondSlide = $.Deferred();
			var animationDeferred = $.Deferred();

			if(this.options.slidePerSteps){
				var slideWidth = this.slides.find('.slide').eq(0).width();

				var nextSlidePos = this.nextSlide.css('left');
				nextSlidePos = parseInt(nextSlidePos.substring(0, nextSlidePos.length - 2));

				var currentSlidePos = this.currentSlide.css('left');
				currentSlidePos = parseInt(currentSlidePos.substring(0, currentSlidePos.length - 2));



				// MOVE NEXT SLIDE BEFORE TWEEN
				if(nextSlidePos <= -this.options.slideWidth || (nextSlidePos == 0 && !this.nextSlideWasMoved) && this.direction == 1){
					nextSlidePos = this.options.slideWidth;

					this.nextSlideWasMoved = true;
				}
				else if(nextSlidePos >= this.options.slideWidth && this.direction == -1){
					nextSlidePos = -this.options.slideWidth;
				}
				this.nextSlide.css({left:nextSlidePos+'px'});
				this.nextSlide.show();



				// MOVE CURRENT SLIDE BEFORE TWEEN
				if(currentSlidePos <= -this.options.slideWidth && this.direction == 1){
					currentSlidePos = this.options.slideWidth;
				}
				else if(currentSlidePos >= this.options.slideWidth && this.direction == -1){
					currentSlidePos = -this.options.slideWidth;
				}
				this.currentSlide.css({left:currentSlidePos+'px'});


				var _self = this;
				this.TWEENER.to(this.currentSlide, this.options.transitionTime, {
					left: "+="+(slideWidth * (this.direction * -1)),
					
					onComplete:function(){
						firstSlide.resolve();
					}
				});

				this.TWEENER.to(this.nextSlide, this.options.transitionTime, {
					left: "+="+(slideWidth * (this.direction * -1)),
					
					onComplete:function(){
						secondSlide.resolve();
					}
				});

				_self = this;
				$.when(firstSlide, secondSlide).then(function(){
					/*if(currentSlidePos <= -_self.options.slideWidth || currentSlidePos >= _self.options.slideWidth){
						_self.currentIndex = _self.nextIndex;
						this.nextSlideWasMoved = false;
					}/**/

					animationDeferred.resolve();
				});/**/
			}
			else {
				this.nextSlide
					.css({left: (this.options.slideWidth * this.direction)})
					.show();

				var _self = this;
				this.TWEENER.to(this.currentSlide, this.options.transitionTime, {
					left: "+="+(this.options.slideWidth * (this.direction * -1)),
					
					onComplete:function(){
						firstSlide.resolve();

						_self.currentSlide
							.hide()
							.css({left:0});
					}
				});

				this.TWEENER.to(this.nextSlide, this.options.transitionTime, {
					left: 0,
					
					onComplete:function(){
						secondSlide.resolve();
					}
				});

				_self = this;
				$.when(firstSlide, secondSlide).then(function(){
					_self.currentIndex = _self.nextIndex;

					animationDeferred.resolve();
				});
			}


			return animationDeferred;
		},

		//=====================================================================
		// _setupSlideFluidHeight : Private Function
		//
		// Sets up the height of the root to the current slide's height
		//=====================================================================
		_setupSlideFluidHeight: function(){
			this.slides.css("height", "auto");
			this.root.addClass("fluid");

			var h = this.currentSlide.outerHeight();
			this.TWEENER.to(this.root, 0, { height:h });
		},

		//=====================================================================
		// _slideFluidHeight : Private Function
		//
		// @returns : $.Deferred();
		//
		// Function to be called when the transitionType property is set to
		// 'slideFluid'.
		//=====================================================================
		_slideFluidHeight : function(){
			var firstSlide = $.Deferred();
			var secondSlide = $.Deferred();
			var animationDeferred = $.Deferred();

			this.nextSlide
				.css({left: (this.options.slideWidth * this.direction)})
				.show();
				
			var _self = this;

			this.TWEENER.to(this.currentSlide, this.options.transitionTime, {
				left: "+="+(this.options.slideWidth * (this.direction * -1)),
				ease: this.options.ease,
				delay: this.options.transitionTime / 2,
				onComplete:function(){
					firstSlide.resolve();

					_self.currentSlide
						.hide()
						.css({left:0});
				}
			});

			var h = this.nextSlide.outerHeight();

			var _self = this;
			this.nav.fadeOut(this.options.fadeInTransitionTime, function(){ _self.root.css('height', h); })
					.fadeIn(this.options.fadeInTransitionTime);
			this.TWEENER.to(this.nextSlide, this.options.transitionTime, {
				left: 0,
				delay: this.options.transitionTime / 2,
				
				onComplete:function(){
					secondSlide.resolve();
				}
			});
			_self.currentIndex = _self.nextIndex;
			this._updateNav();

			$.when(firstSlide, secondSlide).then(function(){

				animationDeferred.resolve();
			});

			return animationDeferred;
		},

		//=====================================================================
		// _setTimer : Private Function
		//
		// Sets the timeout function to call _initSlides after each tick.
		//=====================================================================
		_setTimer : function(){
			if(!this.options.hasTimer) return;
			var _self = this;
			this.stopTimer();
			this.timer = setTimeout(function(){
				_self._initSlides();
				_self._changeSlide();
			}, this.options.timer);
		},

		//=====================================================================
		// resetTimer : Public Function
		//
		// Resets the timeout the timer
		//=====================================================================
		resetTimer : function(){
			clearTimeout(this.timer);
			this._setTimer();
		},

		//=====================================================================
		// stopTimer : Private Function
		//
		// Stops the timer
		//=====================================================================
		stopTimer : function(){
			clearTimeout(this.timer);
		}
	};

	var fullName = 'neutrino';
	$.fn[fullName] = function(options) {
		var input = arguments;
		if ( this.length ) {
			return this.each(function () {
				//plugin is not instanciated. Create it (requires an object or null as arguments)
				if (!$.data(this, fullName)) {
					if(typeof options === 'object' || !options){
						//create an instance of our concrete plugin
						var instance = Object.create(Neutrino);
						instance.init(options, this);
						$.data(this, fullName, instance);
					} else {
						$.error( 'Plugin jQuery.' + fullName + " has not yet been instanciated." );
					}
				} else if(typeof options === 'string') {
					//methods that begin with _ are private
					if(options[0]==='_') {
						$.error( 'Plugin jQuery.' + fullName + ' : method ' + options + ' is private');
						return;
					}
					
					//plugin is instanciated, get it
					var controller = $.data(this, fullName);
					if(controller[options]) {
						controller[options](Array.prototype.slice.call(input, 1));
					} else {
						$.error( 'Plugin jQuery.' + fullName + " has no method " + options);
					}
				} else {
					$.error( 'Plugin jQuery.' + fullName + " has already been instanciated.");
				}
				
			});
		}
	}
})(jQuery)