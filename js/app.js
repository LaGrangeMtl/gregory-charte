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
},{"jquery":"jquery","ns":3,"selectric":"selectric"}],2:[function(require,module,exports){

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
},{"ns":3,"validate":4}],3:[function(require,module,exports){
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
},{"./FormUtils.js":2,"jquery":"jquery","promise":"promise","validate":4}],4:[function(require,module,exports){


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
},{"jquery.validationEngine":5,"jquery.validationEngine-en":6,"jquery.validationEngine-fr":7}],5:[function(require,module,exports){
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



},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvY2hhcnRlL0FwcC5qcyIsImFwcC9jaGFydGUvRm9ybVV0aWxzLmpzIiwiYXBwL2NoYXJ0ZS9OYW1lU3BhY2UuanMiLCJhcHAvbGFncmFuZ2UvalF1ZXJ5LXZhbGlkYXRpb24tZW5naW5lLmJyb3dzZXJpZnkuanMiLCJib3dlcl9jb21wb25lbnRzL3ZhbGlkYXRpb25lbmdpbmUvanMvanF1ZXJ5LnZhbGlkYXRpb25FbmdpbmUuanMiLCJib3dlcl9jb21wb25lbnRzL3ZhbGlkYXRpb25lbmdpbmUvanMvbGFuZ3VhZ2VzL2pxdWVyeS52YWxpZGF0aW9uRW5naW5lLWVuLmpzIiwiYm93ZXJfY29tcG9uZW50cy92YWxpZGF0aW9uZW5naW5lL2pzL2xhbmd1YWdlcy9qcXVlcnkudmFsaWRhdGlvbkVuZ2luZS1mci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5cbnZhciBucyA9IHJlcXVpcmUoJ25zJyk7XG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xucmVxdWlyZSgnc2VsZWN0cmljJyk7XG5cbm5zLmRvY1JlYWR5LnRoZW4oZnVuY3Rpb24oKXtcblxuXHQvKiBTRUxFQ1QgKi9cblxuXHR2YXIgc2VsZWN0cyA9ICQoJ3NlbGVjdCcpO1xuXHRzZWxlY3RzLnNlbGVjdHJpYygpO1xuXG5cdC8qIEJVVFRPTlMgKi9cblxuXHR2YXIgaW5wdXRfZmllbGRzID0gJCgnaW5wdXRbdHlwZT10ZXh0XSwgaW5wdXRbdHlwZT1lbWFpbF0sIGlucHV0W3R5cGU9bnVtYmVyXSwgaW5wdXRbdHlwZT1wYXNzd29yZF0nKTtcblx0aW5wdXRfZmllbGRzLm9uKCdibHVyIGNoYW5nZScsIGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGVsID0gJCh0aGlzKTtcblx0XHRpZihlbC52YWwoKSA9PSBcIlwiKSBlbC5hZGRDbGFzcygnZW1wdHknKTtcblx0XHRlbHNlIGVsLnJlbW92ZUNsYXNzKCdlbXB0eScpO1xuXHR9KS50cmlnZ2VyKCdibHVyJyk7XG5cblxuXHQvKiBNRU5VUyAqL1xuXG5cdHZhciBtZW51SGVhZCA9ICQoJ1tjbGFzc149bWVudS1oZWFkXScpO1xuXHR2YXIgbWVudVRhYnMgPSBtZW51SGVhZC5maW5kKCdbZGF0YS1tZW51LXRhYl0nKTtcblx0dmFyIG1lbnVUYWJzQ29udGVudCA9IG1lbnVUYWJzLmZpbmQoJy50YWItY29udGVudCcpO1xuXG5cdHZhciBoYW5kbGVNZW51VGFicyA9IGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dmFyIHRhYiA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcblx0XHR2YXIgdGFiQ29udGVudCA9IHRhYi5maW5kKCcudGFiLWNvbnRlbnQnKTtcblxuXHRcdGlmKHRhYi5oYXNDbGFzcygnYWN0aXZlJykpe1xuXHRcdFx0dGFiLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0XHRcdHRhYkNvbnRlbnQuY3NzKHtib3R0b206MH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciB3YWl0ID0gbWVudVRhYnMuZmlsdGVyKCcuYWN0aXZlJykubGVuZ3RoID4gMCA/IDMwMCA6IDA7XG5cblx0XHRtZW51VGFicy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0bWVudVRhYnMubm90KHRhYikuZmluZCgnLnRhYi1jb250ZW50JykuY3NzKHtib3R0b206MH0pO1xuXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0dGFiLmFkZENsYXNzKCdhY3RpdmUnKTtcblx0XHRcdHZhciB0YWJDb250ZW50SGVpZ2h0ID0gdGFiQ29udGVudC5vdXRlckhlaWdodCgpO1xuXHRcdFx0dGFiQ29udGVudC5jc3Moe2JvdHRvbTotdGFiQ29udGVudEhlaWdodCsncHgnfSk7XG5cdFx0fSwgd2FpdCk7XG5cdH1cblxuXHR2YXIgaGFuZGxlTWVudVRhYnNDb250ZW50ID0gZnVuY3Rpb24oZSl7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdH1cblxuXHRtZW51VGFicy5vbignY2xpY2subWVudV9oZWFkJywgaGFuZGxlTWVudVRhYnMpO1xuXHRtZW51VGFic0NvbnRlbnQub24oJ2NsaWNrLm1lbnVfaGVhZCcsIGhhbmRsZU1lbnVUYWJzQ29udGVudCk7XG5cbn0pOyIsIlxuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgbnMgPSByZXF1aXJlKCducycpO1xudmFyIHZhbGlkYXRpb25FbmdpbmUgPSByZXF1aXJlKCd2YWxpZGF0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0Z2V0UG9zdCA6IGZ1bmN0aW9uKGZvcm0sIGNhcHN1bGUpe1xuXHRcdHZhciBwb3N0ID0ge307XG5cdFx0aWYoY2Fwc3VsZSAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0cG9zdFtjYXBzdWxlXSA9IHt9O1xuXG5cdFx0Zm9ybS5maW5kKCc6aW5wdXQnKS5ub3QoJ1t0eXBlPXJhZGlvXScpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgaW5wID0gJCh0aGlzKTtcblx0XHRcdHZhciBpbnBWYWwgPSBpbnAudmFsKCk7XG5cblx0XHRcdGlmIChpbnAuYXR0cigndHlwZScpID09ICdjaGVja2JveCcpIHtcblx0XHRcdFx0aWYgKGlucC5pcygnOmNoZWNrZWQnKSkge1xuXHRcdFx0XHRcdGlucFZhbCA9IGlucFZhbDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpbnBWYWwgPSBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHZhciBuID0gaW5wLmF0dHIoJ25hbWUnKTtcblx0XHRcdGlmIChuKSB7XG5cdFx0XHRcdGlmKGNhcHN1bGUgIT09IHVuZGVmaW5lZCAmJiAhaW5wLmhhc0NsYXNzKCdkb250RW5jYXBzdWxhdGUnKSlcblx0XHRcdFx0XHRwb3N0W2NhcHN1bGVdW25dID0gaW5wVmFsO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0cG9zdFtuXSA9IGlucFZhbDtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGZvcm0uZmluZCgnOnJhZGlvJykuZmlsdGVyKCc6Y2hlY2tlZCcpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgaW5wID0gJCh0aGlzKTtcblx0XHRcdHZhciBpbnBWYWwgPSBpbnAudmFsKCk7XG5cdFx0XHRcblx0XHRcdGlmKGNhcHN1bGUgIT09IHVuZGVmaW5lZCAmJiAhaW5wLmhhc0NsYXNzKCdkb250RW5jYXBzdWxhdGUnKSlcblx0XHRcdFx0cG9zdFtjYXBzdWxlXVtpbnAuYXR0cignbmFtZScpXSA9IGlucFZhbDtcblx0XHRcdGVsc2Vcblx0XHRcdFx0cG9zdFtpbnAuYXR0cignbmFtZScpXSA9IGlucFZhbDtcblx0XHR9KTtcblx0XHQvL2NvbnNvbGUuZGlyKHBvc3QpO1xuXHRcdHJldHVybiBwb3N0O1xuXHR9LFxuXG5cdGF0dGFjaFZhbGlkYXRpb246IGZ1bmN0aW9uKGZvcm0pe1xuXHRcdGZvcm0udmFsaWRhdGlvbkVuZ2luZSgnZGV0YWNoJyk7XG5cdFx0Zm9ybS52YWxpZGF0aW9uRW5naW5lKCdhdHRhY2gnLCB7YmluZGVkOmZhbHNlLCBzY3JvbGw6IGZhbHNlfSk7XG5cdFx0cmV0dXJuIGZvcm07XG5cdH0sXG5cdHZhbGlkYXRlIDogZnVuY3Rpb24oZm9ybSl7XG5cdFx0Ly9tZXQgbGVzIGVtYWlscyBlbiBtaW51c2N1bGVcblx0XHQkKCdbdHlwZT1cImVtYWlsXCJdJywgZm9ybSkuZWFjaChmdW5jdGlvbihpLCBlbCl7XG5cdFx0XHRlbCA9ICQoZWwpO1xuXHRcdFx0dmFyIHZhbCA9IGVsLnZhbCgpO1xuXHRcdFx0ZWwudmFsKHZhbCAmJiB2YWwudG9Mb3dlckNhc2UoKSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGZvcm0udmFsaWRhdGlvbkVuZ2luZSgndmFsaWRhdGUnKTtcblx0fVxufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbmFtZSA9ICdjaGFydGUnO1xuXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ3Byb21pc2UnKTtcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG52YXIgdmFsaWRhdGlvbkVuZ2luZSA9IHJlcXVpcmUoJ3ZhbGlkYXRlJyk7XG52YXIgRm9ybVV0aWxzID0gcmVxdWlyZSgnLi9Gb3JtVXRpbHMuanMnKTtcblxudmFyIG5zID0gd2luZG93W25hbWVdID0gKHdpbmRvd1tuYW1lXSB8fCB7fSk7XG5cbm5zLmRvY1JlYWR5ID0gKGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHQkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuXHRcdFx0cmVzb2x2ZSgpO1xuXHRcdH0pO1xuXHR9KTtcbn0pKCk7XG5cbm5zLmRvY1JlYWR5LnRoZW4oZnVuY3Rpb24oKXtcblx0dmFsaWRhdGlvbkVuZ2luZS5zZXRMYW5ndWFnZShucy5sYW5nKTtcblxuXHQkKCdmb3JtJykuZWFjaChmdW5jdGlvbihpLCBlbCl7XG5cdFx0Rm9ybVV0aWxzLmF0dGFjaFZhbGlkYXRpb24oJChlbCkpO1xuXHR9KS5vbignc3VibWl0JywgZnVuY3Rpb24oZSl7XG5cdFx0Rm9ybVV0aWxzLnZhbGlkYXRlKCQodGhpcykpO1xuXHR9KTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5zOyIsIlxuXG5yZXF1aXJlKCdqcXVlcnkudmFsaWRhdGlvbkVuZ2luZScpO1xuXG52YXIgbGFuZ1J1bGVzID0ge307XG5cbnJlcXVpcmUoJ2pxdWVyeS52YWxpZGF0aW9uRW5naW5lLWZyJyk7XG5sYW5nUnVsZXMuZnIgPSAkLnZhbGlkYXRpb25FbmdpbmVMYW5ndWFnZS5hbGxSdWxlcztcbnJlcXVpcmUoJ2pxdWVyeS52YWxpZGF0aW9uRW5naW5lLWVuJyk7XG5sYW5nUnVsZXMuZW4gPSAkLnZhbGlkYXRpb25FbmdpbmVMYW5ndWFnZS5hbGxSdWxlcztcblxuLy9jb25zb2xlLmxvZyhsYW5nUnVsZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2V0TGFuZ3VhZ2UgOiBmdW5jdGlvbihsYW5nKSB7XG5cdFx0JC52YWxpZGF0aW9uRW5naW5lTGFuZ3VhZ2UuYWxsUnVsZXMgPSBsYW5nUnVsZXNbbGFuZ107XG5cdH1cbn07IiwiLypcclxuICogSW5saW5lIEZvcm0gVmFsaWRhdGlvbiBFbmdpbmUgMi42LjIsIGpRdWVyeSBwbHVnaW5cclxuICpcclxuICogQ29weXJpZ2h0KGMpIDIwMTAsIENlZHJpYyBEdWdhc1xyXG4gKiBodHRwOi8vd3d3LnBvc2l0aW9uLWFic29sdXRlLmNvbVxyXG4gKlxyXG4gKiAyLjAgUmV3cml0ZSBieSBPbGl2aWVyIFJlZmFsb1xyXG4gKiBodHRwOi8vd3d3LmNyaW9uaWNzLmNvbVxyXG4gKlxyXG4gKiBGb3JtIHZhbGlkYXRpb24gZW5naW5lIGFsbG93aW5nIGN1c3RvbSByZWdleCBydWxlcyB0byBiZSBhZGRlZC5cclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXHJcbiAqL1xyXG4gKGZ1bmN0aW9uKCQpIHtcclxuXHJcblx0XCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0KiBLaW5kIG9mIHRoZSBjb25zdHJ1Y3RvciwgY2FsbGVkIGJlZm9yZSBhbnkgYWN0aW9uXHJcblx0XHQqIEBwYXJhbSB7TWFwfSB1c2VyIG9wdGlvbnNcclxuXHRcdCovXHJcblx0XHRpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XHJcblx0XHRcdHZhciBmb3JtID0gdGhpcztcclxuXHRcdFx0aWYgKCFmb3JtLmRhdGEoJ2pxdicpIHx8IGZvcm0uZGF0YSgnanF2JykgPT0gbnVsbCApIHtcclxuXHRcdFx0XHRvcHRpb25zID0gbWV0aG9kcy5fc2F2ZU9wdGlvbnMoZm9ybSwgb3B0aW9ucyk7XHJcblx0XHRcdFx0Ly8gYmluZCBhbGwgZm9ybUVycm9yIGVsZW1lbnRzIHRvIGNsb3NlIG9uIGNsaWNrXHJcblx0XHRcdFx0JChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5mb3JtRXJyb3JcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHQkKHRoaXMpLmZhZGVPdXQoMTUwLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0Ly8gcmVtb3ZlIHByb21wdCBvbmNlIGludmlzaWJsZVxyXG5cdFx0XHRcdFx0XHQkKHRoaXMpLnBhcmVudCgnLmZvcm1FcnJvck91dGVyJykucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdCB9LFxyXG5cdFx0LyoqXHJcblx0XHQqIEF0dGFjaHMgalF1ZXJ5LnZhbGlkYXRpb25FbmdpbmUgdG8gZm9ybS5zdWJtaXQgYW5kIGZpZWxkLmJsdXIgZXZlbnRzXHJcblx0XHQqIFRha2VzIGFuIG9wdGlvbmFsIHBhcmFtczogYSBsaXN0IG9mIG9wdGlvbnNcclxuXHRcdCogaWUuIGpRdWVyeShcIiNmb3JtSUQxXCIpLnZhbGlkYXRpb25FbmdpbmUoJ2F0dGFjaCcsIHtwcm9tcHRQb3NpdGlvbiA6IFwiY2VudGVyUmlnaHRcIn0pO1xyXG5cdFx0Ki9cclxuXHRcdGF0dGFjaDogZnVuY3Rpb24odXNlck9wdGlvbnMpIHtcclxuXHJcblx0XHRcdHZhciBmb3JtID0gdGhpcztcclxuXHRcdFx0dmFyIG9wdGlvbnM7XHJcblxyXG5cdFx0XHRpZih1c2VyT3B0aW9ucylcclxuXHRcdFx0XHRvcHRpb25zID0gbWV0aG9kcy5fc2F2ZU9wdGlvbnMoZm9ybSwgdXNlck9wdGlvbnMpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0b3B0aW9ucyA9IGZvcm0uZGF0YSgnanF2Jyk7XHJcblxyXG5cdFx0XHRvcHRpb25zLnZhbGlkYXRlQXR0cmlidXRlID0gKGZvcm0uZmluZChcIltkYXRhLXZhbGlkYXRpb24tZW5naW5lKj12YWxpZGF0ZV1cIikubGVuZ3RoKSA/IFwiZGF0YS12YWxpZGF0aW9uLWVuZ2luZVwiIDogXCJjbGFzc1wiO1xyXG5cdFx0XHRpZiAob3B0aW9ucy5iaW5kZWQpIHtcclxuXHJcblx0XHRcdFx0Ly8gZGVsZWdhdGUgZmllbGRzXHJcblx0XHRcdFx0Zm9ybS5vbihvcHRpb25zLnZhbGlkYXRpb25FdmVudFRyaWdnZXIsIFwiW1wiK29wdGlvbnMudmFsaWRhdGVBdHRyaWJ1dGUrXCIqPXZhbGlkYXRlXTpub3QoW3R5cGU9Y2hlY2tib3hdKTpub3QoW3R5cGU9cmFkaW9dKTpub3QoLmRhdGVwaWNrZXIpXCIsIG1ldGhvZHMuX29uRmllbGRFdmVudCk7XHJcblx0XHRcdFx0Zm9ybS5vbihcImNsaWNrXCIsIFwiW1wiK29wdGlvbnMudmFsaWRhdGVBdHRyaWJ1dGUrXCIqPXZhbGlkYXRlXVt0eXBlPWNoZWNrYm94XSxbXCIrb3B0aW9ucy52YWxpZGF0ZUF0dHJpYnV0ZStcIio9dmFsaWRhdGVdW3R5cGU9cmFkaW9dXCIsIG1ldGhvZHMuX29uRmllbGRFdmVudCk7XHJcblx0XHRcdFx0Zm9ybS5vbihvcHRpb25zLnZhbGlkYXRpb25FdmVudFRyaWdnZXIsXCJbXCIrb3B0aW9ucy52YWxpZGF0ZUF0dHJpYnV0ZStcIio9dmFsaWRhdGVdW2NsYXNzKj1kYXRlcGlja2VyXVwiLCB7XCJkZWxheVwiOiAzMDB9LCBtZXRob2RzLl9vbkZpZWxkRXZlbnQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChvcHRpb25zLmF1dG9Qb3NpdGlvblVwZGF0ZSkge1xyXG5cdFx0XHRcdCQod2luZG93KS5iaW5kKFwicmVzaXplXCIsIHtcclxuXHRcdFx0XHRcdFwibm9BbmltYXRpb25cIjogdHJ1ZSxcclxuXHRcdFx0XHRcdFwiZm9ybUVsZW1cIjogZm9ybVxyXG5cdFx0XHRcdH0sIG1ldGhvZHMudXBkYXRlUHJvbXB0c1Bvc2l0aW9uKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRmb3JtLm9uKFwiY2xpY2tcIixcImFbZGF0YS12YWxpZGF0aW9uLWVuZ2luZS1za2lwXSwgYVtjbGFzcyo9J3ZhbGlkYXRlLXNraXAnXSwgYnV0dG9uW2RhdGEtdmFsaWRhdGlvbi1lbmdpbmUtc2tpcF0sIGJ1dHRvbltjbGFzcyo9J3ZhbGlkYXRlLXNraXAnXSwgaW5wdXRbZGF0YS12YWxpZGF0aW9uLWVuZ2luZS1za2lwXSwgaW5wdXRbY2xhc3MqPSd2YWxpZGF0ZS1za2lwJ11cIiwgbWV0aG9kcy5fc3VibWl0QnV0dG9uQ2xpY2spO1xyXG5cdFx0XHRmb3JtLnJlbW92ZURhdGEoJ2pxdl9zdWJtaXRCdXR0b24nKTtcclxuXHJcblx0XHRcdC8vIGJpbmQgZm9ybS5zdWJtaXRcclxuXHRcdFx0Zm9ybS5vbihcInN1Ym1pdFwiLCBtZXRob2RzLl9vblN1Ym1pdEV2ZW50KTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFVucmVnaXN0ZXJzIGFueSBiaW5kaW5ncyB0aGF0IG1heSBwb2ludCB0byBqUXVlcnkudmFsaWRhaXRvbkVuZ2luZVxyXG5cdFx0Ki9cclxuXHRcdGRldGFjaDogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHR2YXIgZm9ybSA9IHRoaXM7XHJcblx0XHRcdHZhciBvcHRpb25zID0gZm9ybS5kYXRhKCdqcXYnKTtcclxuXHJcblx0XHRcdC8vIHVuYmluZCBmaWVsZHNcclxuXHRcdFx0Zm9ybS5maW5kKFwiW1wiK29wdGlvbnMudmFsaWRhdGVBdHRyaWJ1dGUrXCIqPXZhbGlkYXRlXVwiKS5ub3QoXCJbdHlwZT1jaGVja2JveF1cIikub2ZmKG9wdGlvbnMudmFsaWRhdGlvbkV2ZW50VHJpZ2dlciwgbWV0aG9kcy5fb25GaWVsZEV2ZW50KTtcclxuXHRcdFx0Zm9ybS5maW5kKFwiW1wiK29wdGlvbnMudmFsaWRhdGVBdHRyaWJ1dGUrXCIqPXZhbGlkYXRlXVt0eXBlPWNoZWNrYm94XSxbY2xhc3MqPXZhbGlkYXRlXVt0eXBlPXJhZGlvXVwiKS5vZmYoXCJjbGlja1wiLCBtZXRob2RzLl9vbkZpZWxkRXZlbnQpO1xyXG5cclxuXHRcdFx0Ly8gdW5iaW5kIGZvcm0uc3VibWl0XHJcblx0XHRcdGZvcm0ub2ZmKFwic3VibWl0XCIsIG1ldGhvZHMub25BamF4Rm9ybUNvbXBsZXRlKTtcclxuXHJcblx0XHRcdC8vIHVuYmluZCBmb3JtLnN1Ym1pdFxyXG5cdFx0XHRmb3JtLm9mZihcInN1Ym1pdFwiLCBtZXRob2RzLm9uQWpheEZvcm1Db21wbGV0ZSk7XHJcblx0XHRcdGZvcm0ucmVtb3ZlRGF0YSgnanF2Jyk7XHJcbiAgICAgICAgICAgIFxyXG5cdFx0XHRmb3JtLm9mZihcImNsaWNrXCIsIFwiYVtkYXRhLXZhbGlkYXRpb24tZW5naW5lLXNraXBdLCBhW2NsYXNzKj0ndmFsaWRhdGUtc2tpcCddLCBidXR0b25bZGF0YS12YWxpZGF0aW9uLWVuZ2luZS1za2lwXSwgYnV0dG9uW2NsYXNzKj0ndmFsaWRhdGUtc2tpcCddLCBpbnB1dFtkYXRhLXZhbGlkYXRpb24tZW5naW5lLXNraXBdLCBpbnB1dFtjbGFzcyo9J3ZhbGlkYXRlLXNraXAnXVwiLCBtZXRob2RzLl9zdWJtaXRCdXR0b25DbGljayk7XHJcblx0XHRcdGZvcm0ucmVtb3ZlRGF0YSgnanF2X3N1Ym1pdEJ1dHRvbicpO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuYXV0b1Bvc2l0aW9uVXBkYXRlKVxyXG5cdFx0XHRcdCQod2luZG93KS51bmJpbmQoXCJyZXNpemVcIiwgbWV0aG9kcy51cGRhdGVQcm9tcHRzUG9zaXRpb24pO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFZhbGlkYXRlcyBlaXRoZXIgYSBmb3JtIG9yIGEgbGlzdCBvZiBmaWVsZHMsIHNob3dzIHByb21wdHMgYWNjb3JkaW5nbHkuXHJcblx0XHQqIE5vdGU6IFRoZXJlIGlzIG5vIGFqYXggZm9ybSB2YWxpZGF0aW9uIHdpdGggdGhpcyBtZXRob2QsIG9ubHkgZmllbGQgYWpheCB2YWxpZGF0aW9uIGFyZSBldmFsdWF0ZWRcclxuXHRcdCpcclxuXHRcdCogQHJldHVybiB0cnVlIGlmIHRoZSBmb3JtIHZhbGlkYXRlcywgZmFsc2UgaWYgaXQgZmFpbHNcclxuXHRcdCovXHJcblx0XHR2YWxpZGF0ZTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBlbGVtZW50ID0gJCh0aGlzKTtcclxuXHRcdFx0dmFyIHZhbGlkID0gbnVsbDtcclxuXHJcblx0XHRcdGlmIChlbGVtZW50LmlzKFwiZm9ybVwiKSB8fCBlbGVtZW50Lmhhc0NsYXNzKFwidmFsaWRhdGlvbkVuZ2luZUNvbnRhaW5lclwiKSkge1xyXG5cdFx0XHRcdGlmIChlbGVtZW50Lmhhc0NsYXNzKCd2YWxpZGF0aW5nJykpIHtcclxuXHRcdFx0XHRcdC8vIGZvcm0gaXMgYWxyZWFkeSB2YWxpZGF0aW5nLlxyXG5cdFx0XHRcdFx0Ly8gU2hvdWxkIGFib3J0IG9sZCB2YWxpZGF0aW9uIGFuZCBzdGFydCBuZXcgb25lLiBJIGRvbid0IGtub3cgaG93IHRvIGltcGxlbWVudCBpdC5cclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9IGVsc2Uge1x0XHRcdFx0XHJcblx0XHRcdFx0XHRlbGVtZW50LmFkZENsYXNzKCd2YWxpZGF0aW5nJyk7XHJcblx0XHRcdFx0XHR2YXIgb3B0aW9ucyA9IGVsZW1lbnQuZGF0YSgnanF2Jyk7XHJcblx0XHRcdFx0XHR2YXIgdmFsaWQgPSBtZXRob2RzLl92YWxpZGF0ZUZpZWxkcyh0aGlzKTtcclxuXHJcblx0XHRcdFx0XHQvLyBJZiB0aGUgZm9ybSBkb2Vzbid0IHZhbGlkYXRlLCBjbGVhciB0aGUgJ3ZhbGlkYXRpbmcnIGNsYXNzIGJlZm9yZSB0aGUgdXNlciBoYXMgYSBjaGFuY2UgdG8gc3VibWl0IGFnYWluXHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ3ZhbGlkYXRpbmcnKTtcclxuXHRcdFx0XHRcdH0sIDEwMCk7XHJcblx0XHRcdFx0XHRpZiAodmFsaWQgJiYgb3B0aW9ucy5vblN1Y2Nlc3MpIHtcclxuXHRcdFx0XHRcdFx0b3B0aW9ucy5vblN1Y2Nlc3MoKTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIXZhbGlkICYmIG9wdGlvbnMub25GYWlsdXJlKSB7XHJcblx0XHRcdFx0XHRcdG9wdGlvbnMub25GYWlsdXJlKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2UgaWYgKGVsZW1lbnQuaXMoJ2Zvcm0nKSB8fCBlbGVtZW50Lmhhc0NsYXNzKCd2YWxpZGF0aW9uRW5naW5lQ29udGFpbmVyJykpIHtcclxuXHRcdFx0XHRlbGVtZW50LnJlbW92ZUNsYXNzKCd2YWxpZGF0aW5nJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gZmllbGQgdmFsaWRhdGlvblxyXG5cdFx0XHRcdHZhciBmb3JtID0gZWxlbWVudC5jbG9zZXN0KCdmb3JtLCAudmFsaWRhdGlvbkVuZ2luZUNvbnRhaW5lcicpLFxyXG5cdFx0XHRcdFx0b3B0aW9ucyA9IChmb3JtLmRhdGEoJ2pxdicpKSA/IGZvcm0uZGF0YSgnanF2JykgOiAkLnZhbGlkYXRpb25FbmdpbmUuZGVmYXVsdHMsXHJcblx0XHRcdFx0XHR2YWxpZCA9IG1ldGhvZHMuX3ZhbGlkYXRlRmllbGQoZWxlbWVudCwgb3B0aW9ucyk7XHJcblxyXG5cdFx0XHRcdGlmICh2YWxpZCAmJiBvcHRpb25zLm9uRmllbGRTdWNjZXNzKVxyXG5cdFx0XHRcdFx0b3B0aW9ucy5vbkZpZWxkU3VjY2VzcygpO1xyXG5cdFx0XHRcdGVsc2UgaWYgKG9wdGlvbnMub25GaWVsZEZhaWx1cmUgJiYgb3B0aW9ucy5JbnZhbGlkRmllbGRzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdG9wdGlvbnMub25GaWVsZEZhaWx1cmUoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYob3B0aW9ucy5vblZhbGlkYXRpb25Db21wbGV0ZSkge1xyXG5cdFx0XHRcdC8vICEhIGVuc3VyZXMgdGhhdCBhbiB1bmRlZmluZWQgcmV0dXJuIGlzIGludGVycHJldGVkIGFzIHJldHVybiBmYWxzZSBidXQgYWxsb3dzIGEgb25WYWxpZGF0aW9uQ29tcGxldGUoKSB0byBwb3NzaWJseSByZXR1cm4gdHJ1ZSBhbmQgaGF2ZSBmb3JtIGNvbnRpbnVlIHByb2Nlc3NpbmdcclxuXHRcdFx0XHRyZXR1cm4gISFvcHRpb25zLm9uVmFsaWRhdGlvbkNvbXBsZXRlKGZvcm0sIHZhbGlkKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdmFsaWQ7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqICBSZWRyYXcgcHJvbXB0cyBwb3NpdGlvbiwgdXNlZnVsIHdoZW4geW91IGNoYW5nZSB0aGUgRE9NIHN0YXRlIHdoZW4gdmFsaWRhdGluZ1xyXG5cdFx0Ki9cclxuXHRcdHVwZGF0ZVByb21wdHNQb3NpdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcclxuXHJcblx0XHRcdGlmIChldmVudCAmJiB0aGlzID09IHdpbmRvdykge1xyXG5cdFx0XHRcdHZhciBmb3JtID0gZXZlbnQuZGF0YS5mb3JtRWxlbTtcclxuXHRcdFx0XHR2YXIgbm9BbmltYXRpb24gPSBldmVudC5kYXRhLm5vQW5pbWF0aW9uO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHR2YXIgZm9ybSA9ICQodGhpcy5jbG9zZXN0KCdmb3JtLCAudmFsaWRhdGlvbkVuZ2luZUNvbnRhaW5lcicpKTtcclxuXHJcblx0XHRcdHZhciBvcHRpb25zID0gZm9ybS5kYXRhKCdqcXYnKTtcclxuXHRcdFx0Ly8gTm8gb3B0aW9uLCB0YWtlIGRlZmF1bHQgb25lXHJcblx0XHRcdGZvcm0uZmluZCgnWycrb3B0aW9ucy52YWxpZGF0ZUF0dHJpYnV0ZSsnKj12YWxpZGF0ZV0nKS5ub3QoXCI6ZGlzYWJsZWRcIikuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHZhciBmaWVsZCA9ICQodGhpcyk7XHJcblx0XHRcdFx0aWYgKG9wdGlvbnMucHJldHR5U2VsZWN0ICYmIGZpZWxkLmlzKFwiOmhpZGRlblwiKSlcclxuXHRcdFx0XHQgIGZpZWxkID0gZm9ybS5maW5kKFwiI1wiICsgb3B0aW9ucy51c2VQcmVmaXggKyBmaWVsZC5hdHRyKCdpZCcpICsgb3B0aW9ucy51c2VTdWZmaXgpO1xyXG5cdFx0XHRcdHZhciBwcm9tcHQgPSBtZXRob2RzLl9nZXRQcm9tcHQoZmllbGQpO1xyXG5cdFx0XHRcdHZhciBwcm9tcHRUZXh0ID0gJChwcm9tcHQpLmZpbmQoXCIuZm9ybUVycm9yQ29udGVudFwiKS5odG1sKCk7XHJcblxyXG5cdFx0XHRcdGlmKHByb21wdClcclxuXHRcdFx0XHRcdG1ldGhvZHMuX3VwZGF0ZVByb21wdChmaWVsZCwgJChwcm9tcHQpLCBwcm9tcHRUZXh0LCB1bmRlZmluZWQsIGZhbHNlLCBvcHRpb25zLCBub0FuaW1hdGlvbik7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogRGlzcGxheXMgYSBwcm9tcHQgb24gYSBlbGVtZW50LlxyXG5cdFx0KiBOb3RlIHRoYXQgdGhlIGVsZW1lbnQgbmVlZHMgYW4gaWQhXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7U3RyaW5nfSBwcm9tcHRUZXh0IGh0bWwgdGV4dCB0byBkaXNwbGF5IHR5cGVcclxuXHRcdCogQHBhcmFtIHtTdHJpbmd9IHR5cGUgdGhlIHR5cGUgb2YgYnViYmxlOiAncGFzcycgKGdyZWVuKSwgJ2xvYWQnIChibGFjaykgYW55dGhpbmcgZWxzZSAocmVkKVxyXG5cdFx0KiBAcGFyYW0ge1N0cmluZ30gcG9zc2libGUgdmFsdWVzIHRvcExlZnQsIHRvcFJpZ2h0LCBib3R0b21MZWZ0LCBjZW50ZXJSaWdodCwgYm90dG9tUmlnaHRcclxuXHRcdCovXHJcblx0XHRzaG93UHJvbXB0OiBmdW5jdGlvbihwcm9tcHRUZXh0LCB0eXBlLCBwcm9tcHRQb3NpdGlvbiwgc2hvd0Fycm93KSB7XHJcblx0XHRcdHZhciBmb3JtID0gdGhpcy5jbG9zZXN0KCdmb3JtLCAudmFsaWRhdGlvbkVuZ2luZUNvbnRhaW5lcicpO1xyXG5cdFx0XHR2YXIgb3B0aW9ucyA9IGZvcm0uZGF0YSgnanF2Jyk7XHJcblx0XHRcdC8vIE5vIG9wdGlvbiwgdGFrZSBkZWZhdWx0IG9uZVxyXG5cdFx0XHRpZighb3B0aW9ucylcclxuXHRcdFx0XHRvcHRpb25zID0gbWV0aG9kcy5fc2F2ZU9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblx0XHRcdGlmKHByb21wdFBvc2l0aW9uKVxyXG5cdFx0XHRcdG9wdGlvbnMucHJvbXB0UG9zaXRpb249cHJvbXB0UG9zaXRpb247XHJcblx0XHRcdG9wdGlvbnMuc2hvd0Fycm93ID0gc2hvd0Fycm93PT10cnVlO1xyXG5cclxuXHRcdFx0bWV0aG9kcy5fc2hvd1Byb21wdCh0aGlzLCBwcm9tcHRUZXh0LCB0eXBlLCBmYWxzZSwgb3B0aW9ucyk7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBDbG9zZXMgZm9ybSBlcnJvciBwcm9tcHRzLCBDQU4gYmUgaW52aWR1YWxcclxuXHRcdCovXHJcblx0XHRoaWRlOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0IHZhciBmb3JtID0gJCh0aGlzKS5jbG9zZXN0KCdmb3JtLCAudmFsaWRhdGlvbkVuZ2luZUNvbnRhaW5lcicpO1xyXG5cdFx0XHQgdmFyIG9wdGlvbnMgPSBmb3JtLmRhdGEoJ2pxdicpO1xyXG5cdFx0XHQgdmFyIGZhZGVEdXJhdGlvbiA9IChvcHRpb25zICYmIG9wdGlvbnMuZmFkZUR1cmF0aW9uKSA/IG9wdGlvbnMuZmFkZUR1cmF0aW9uIDogMC4zO1xyXG5cdFx0XHQgdmFyIGNsb3Npbmd0YWc7XHJcblx0XHRcdCBcclxuXHRcdFx0IGlmKCQodGhpcykuaXMoXCJmb3JtXCIpIHx8ICQodGhpcykuaGFzQ2xhc3MoXCJ2YWxpZGF0aW9uRW5naW5lQ29udGFpbmVyXCIpKSB7XHJcblx0XHRcdFx0IGNsb3Npbmd0YWcgPSBcInBhcmVudEZvcm1cIittZXRob2RzLl9nZXRDbGFzc05hbWUoJCh0aGlzKS5hdHRyKFwiaWRcIikpO1xyXG5cdFx0XHQgfSBlbHNlIHtcclxuXHRcdFx0XHQgY2xvc2luZ3RhZyA9IG1ldGhvZHMuX2dldENsYXNzTmFtZSgkKHRoaXMpLmF0dHIoXCJpZFwiKSkgK1wiZm9ybUVycm9yXCI7XHJcblx0XHRcdCB9XHJcblx0XHRcdCAkKCcuJytjbG9zaW5ndGFnKS5mYWRlVG8oZmFkZUR1cmF0aW9uLCAwLjMsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCAkKHRoaXMpLnBhcmVudCgnLmZvcm1FcnJvck91dGVyJykucmVtb3ZlKCk7XHJcblx0XHRcdFx0ICQodGhpcykucmVtb3ZlKCk7XHJcblx0XHRcdCB9KTtcclxuXHRcdFx0IHJldHVybiB0aGlzO1xyXG5cdFx0IH0sXHJcblx0XHQgLyoqXHJcblx0XHQgKiBDbG9zZXMgYWxsIGVycm9yIHByb21wdHMgb24gdGhlIHBhZ2VcclxuXHRcdCAqL1xyXG5cdFx0IGhpZGVBbGw6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0IHZhciBmb3JtID0gdGhpcztcclxuXHRcdFx0IHZhciBvcHRpb25zID0gZm9ybS5kYXRhKCdqcXYnKTtcclxuXHRcdFx0IHZhciBkdXJhdGlvbiA9IG9wdGlvbnMgPyBvcHRpb25zLmZhZGVEdXJhdGlvbjozMDA7XHJcblx0XHRcdCAkKCcuZm9ybUVycm9yJykuZmFkZVRvKGR1cmF0aW9uLCAzMDAsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCAkKHRoaXMpLnBhcmVudCgnLmZvcm1FcnJvck91dGVyJykucmVtb3ZlKCk7XHJcblx0XHRcdFx0ICQodGhpcykucmVtb3ZlKCk7XHJcblx0XHRcdCB9KTtcclxuXHRcdFx0IHJldHVybiB0aGlzO1xyXG5cdFx0IH0sXHJcblx0XHQvKipcclxuXHRcdCogVHlwaWNhbGx5IGNhbGxlZCB3aGVuIHVzZXIgZXhpc3RzIGEgZmllbGQgdXNpbmcgdGFiIG9yIGEgbW91c2UgY2xpY2ssIHRyaWdnZXJzIGEgZmllbGRcclxuXHRcdCogdmFsaWRhdGlvblxyXG5cdFx0Ki9cclxuXHRcdF9vbkZpZWxkRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdHZhciBmaWVsZCA9ICQodGhpcyk7XHJcblx0XHRcdHZhciBmb3JtID0gZmllbGQuY2xvc2VzdCgnZm9ybSwgLnZhbGlkYXRpb25FbmdpbmVDb250YWluZXInKTtcclxuXHRcdFx0dmFyIG9wdGlvbnMgPSBmb3JtLmRhdGEoJ2pxdicpO1xyXG5cdFx0XHRvcHRpb25zLmV2ZW50VHJpZ2dlciA9IFwiZmllbGRcIjtcclxuXHRcdFx0Ly8gdmFsaWRhdGUgdGhlIGN1cnJlbnQgZmllbGRcclxuXHRcdFx0d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0bWV0aG9kcy5fdmFsaWRhdGVGaWVsZChmaWVsZCwgb3B0aW9ucyk7XHJcblx0XHRcdFx0aWYgKG9wdGlvbnMuSW52YWxpZEZpZWxkcy5sZW5ndGggPT0gMCAmJiBvcHRpb25zLm9uRmllbGRTdWNjZXNzKSB7XHJcblx0XHRcdFx0XHRvcHRpb25zLm9uRmllbGRTdWNjZXNzKCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChvcHRpb25zLkludmFsaWRGaWVsZHMubGVuZ3RoID4gMCAmJiBvcHRpb25zLm9uRmllbGRGYWlsdXJlKSB7XHJcblx0XHRcdFx0XHRvcHRpb25zLm9uRmllbGRGYWlsdXJlKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCAoZXZlbnQuZGF0YSkgPyBldmVudC5kYXRhLmRlbGF5IDogMCk7XHJcblxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBDYWxsZWQgd2hlbiB0aGUgZm9ybSBpcyBzdWJtaXRlZCwgc2hvd3MgcHJvbXB0cyBhY2NvcmRpbmdseVxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fVxyXG5cdFx0KiAgICAgICAgICAgIGZvcm1cclxuXHRcdCogQHJldHVybiBmYWxzZSBpZiBmb3JtIHN1Ym1pc3Npb24gbmVlZHMgdG8gYmUgY2FuY2VsbGVkXHJcblx0XHQqL1xyXG5cdFx0X29uU3VibWl0RXZlbnQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgZm9ybSA9ICQodGhpcyk7XHJcblx0XHRcdHZhciBvcHRpb25zID0gZm9ybS5kYXRhKCdqcXYnKTtcclxuXHRcdFx0XHJcblx0XHRcdC8vY2hlY2sgaWYgaXQgaXMgdHJpZ2dlciBmcm9tIHNraXBwZWQgYnV0dG9uXHJcblx0XHRcdGlmIChmb3JtLmRhdGEoXCJqcXZfc3VibWl0QnV0dG9uXCIpKXtcclxuXHRcdFx0XHR2YXIgc3VibWl0QnV0dG9uID0gJChcIiNcIiArIGZvcm0uZGF0YShcImpxdl9zdWJtaXRCdXR0b25cIikpO1xyXG5cdFx0XHRcdGlmIChzdWJtaXRCdXR0b24pe1xyXG5cdFx0XHRcdFx0aWYgKHN1Ym1pdEJ1dHRvbi5sZW5ndGggPiAwKXtcclxuXHRcdFx0XHRcdFx0aWYgKHN1Ym1pdEJ1dHRvbi5oYXNDbGFzcyhcInZhbGlkYXRlLXNraXBcIikgfHwgc3VibWl0QnV0dG9uLmF0dHIoXCJkYXRhLXZhbGlkYXRpb24tZW5naW5lLXNraXBcIikgPT0gXCJ0cnVlXCIpXHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRvcHRpb25zLmV2ZW50VHJpZ2dlciA9IFwic3VibWl0XCI7XHJcblxyXG5cdFx0XHQvLyB2YWxpZGF0ZSBlYWNoIGZpZWxkIFxyXG5cdFx0XHQvLyAoLSBza2lwIGZpZWxkIGFqYXggdmFsaWRhdGlvbiwgbm90IG5lY2Vzc2FyeSBJRiB3ZSB3aWxsIHBlcmZvcm0gYW4gYWpheCBmb3JtIHZhbGlkYXRpb24pXHJcblx0XHRcdHZhciByPW1ldGhvZHMuX3ZhbGlkYXRlRmllbGRzKGZvcm0pO1xyXG5cclxuXHRcdFx0aWYgKHIgJiYgb3B0aW9ucy5hamF4Rm9ybVZhbGlkYXRpb24pIHtcclxuXHRcdFx0XHRtZXRob2RzLl92YWxpZGF0ZUZvcm1XaXRoQWpheChmb3JtLCBvcHRpb25zKTtcclxuXHRcdFx0XHQvLyBjYW5jZWwgZm9ybSBhdXRvLXN1Ym1pc3Npb24gLSBwcm9jZXNzIHdpdGggYXN5bmMgY2FsbCBvbkFqYXhGb3JtQ29tcGxldGVcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKG9wdGlvbnMub25WYWxpZGF0aW9uQ29tcGxldGUpIHtcclxuXHRcdFx0XHQvLyAhISBlbnN1cmVzIHRoYXQgYW4gdW5kZWZpbmVkIHJldHVybiBpcyBpbnRlcnByZXRlZCBhcyByZXR1cm4gZmFsc2UgYnV0IGFsbG93cyBhIG9uVmFsaWRhdGlvbkNvbXBsZXRlKCkgdG8gcG9zc2libHkgcmV0dXJuIHRydWUgYW5kIGhhdmUgZm9ybSBjb250aW51ZSBwcm9jZXNzaW5nXHJcblx0XHRcdFx0cmV0dXJuICEhb3B0aW9ucy5vblZhbGlkYXRpb25Db21wbGV0ZShmb3JtLCByKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcjtcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogUmV0dXJuIHRydWUgaWYgdGhlIGFqYXggZmllbGQgdmFsaWRhdGlvbnMgcGFzc2VkIHNvIGZhclxyXG5cdFx0KiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG5cdFx0KiBAcmV0dXJuIHRydWUsIGlzIGFsbCBhamF4IHZhbGlkYXRpb24gcGFzc2VkIHNvIGZhciAocmVtZW1iZXIgYWpheCBpcyBhc3luYylcclxuXHRcdCovXHJcblx0XHRfY2hlY2tBamF4U3RhdHVzOiBmdW5jdGlvbihvcHRpb25zKSB7XHJcblx0XHRcdHZhciBzdGF0dXMgPSB0cnVlO1xyXG5cdFx0XHQkLmVhY2gob3B0aW9ucy5hamF4VmFsaWRDYWNoZSwgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG5cdFx0XHRcdGlmICghdmFsdWUpIHtcclxuXHRcdFx0XHRcdHN0YXR1cyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0Ly8gYnJlYWsgdGhlIGVhY2hcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm4gc3RhdHVzO1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQqIFJldHVybiB0cnVlIGlmIHRoZSBhamF4IGZpZWxkIGlzIHZhbGlkYXRlZFxyXG5cdFx0KiBAcGFyYW0ge1N0cmluZ30gZmllbGRpZFxyXG5cdFx0KiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG5cdFx0KiBAcmV0dXJuIHRydWUsIGlmIHZhbGlkYXRpb24gcGFzc2VkLCBmYWxzZSBpZiBmYWxzZSBvciBkb2Vzbid0IGV4aXN0XHJcblx0XHQqL1xyXG5cdFx0X2NoZWNrQWpheEZpZWxkU3RhdHVzOiBmdW5jdGlvbihmaWVsZGlkLCBvcHRpb25zKSB7XHJcblx0XHRcdHJldHVybiBvcHRpb25zLmFqYXhWYWxpZENhY2hlW2ZpZWxkaWRdID09IHRydWU7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFZhbGlkYXRlcyBmb3JtIGZpZWxkcywgc2hvd3MgcHJvbXB0cyBhY2NvcmRpbmdseVxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fVxyXG5cdFx0KiAgICAgICAgICAgIGZvcm1cclxuXHRcdCogQHBhcmFtIHtza2lwQWpheEZpZWxkVmFsaWRhdGlvbn1cclxuXHRcdCogICAgICAgICAgICBib29sZWFuIC0gd2hlbiBzZXQgdG8gdHJ1ZSwgYWpheCBmaWVsZCB2YWxpZGF0aW9uIGlzIHNraXBwZWQsIHR5cGljYWxseSB1c2VkIHdoZW4gdGhlIHN1Ym1pdCBidXR0b24gaXMgY2xpY2tlZFxyXG5cdFx0KlxyXG5cdFx0KiBAcmV0dXJuIHRydWUgaWYgZm9ybSBpcyB2YWxpZCwgZmFsc2UgaWYgbm90LCB1bmRlZmluZWQgaWYgYWpheCBmb3JtIHZhbGlkYXRpb24gaXMgZG9uZVxyXG5cdFx0Ki9cclxuXHRcdF92YWxpZGF0ZUZpZWxkczogZnVuY3Rpb24oZm9ybSkge1xyXG5cdFx0XHR2YXIgb3B0aW9ucyA9IGZvcm0uZGF0YSgnanF2Jyk7XHJcblxyXG5cdFx0XHQvLyB0aGlzIHZhcmlhYmxlIGlzIHNldCB0byB0cnVlIGlmIGFuIGVycm9yIGlzIGZvdW5kXHJcblx0XHRcdHZhciBlcnJvckZvdW5kID0gZmFsc2U7XHJcblxyXG5cdFx0XHQvLyBUcmlnZ2VyIGhvb2ssIHN0YXJ0IHZhbGlkYXRpb25cclxuXHRcdFx0Zm9ybS50cmlnZ2VyKFwianF2LmZvcm0udmFsaWRhdGluZ1wiKTtcclxuXHRcdFx0Ly8gZmlyc3QsIGV2YWx1YXRlIHN0YXR1cyBvZiBub24gYWpheCBmaWVsZHNcclxuXHRcdFx0dmFyIGZpcnN0X2Vycj1udWxsO1xyXG5cdFx0XHRmb3JtLmZpbmQoJ1snK29wdGlvbnMudmFsaWRhdGVBdHRyaWJ1dGUrJyo9dmFsaWRhdGVdJykubm90KFwiOmRpc2FibGVkXCIpLmVhY2goIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBmaWVsZCA9ICQodGhpcyk7XHJcblx0XHRcdFx0dmFyIG5hbWVzID0gW107XHJcblx0XHRcdFx0aWYgKCQuaW5BcnJheShmaWVsZC5hdHRyKCduYW1lJyksIG5hbWVzKSA8IDApIHtcclxuXHRcdFx0XHRcdGVycm9yRm91bmQgfD0gbWV0aG9kcy5fdmFsaWRhdGVGaWVsZChmaWVsZCwgb3B0aW9ucyk7XHJcblx0XHRcdFx0XHRpZiAoZXJyb3JGb3VuZCAmJiBmaXJzdF9lcnI9PW51bGwpXHJcblx0XHRcdFx0XHRcdGlmIChmaWVsZC5pcyhcIjpoaWRkZW5cIikgJiYgb3B0aW9ucy5wcmV0dHlTZWxlY3QpXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0IGZpcnN0X2VyciA9IGZpZWxkID0gZm9ybS5maW5kKFwiI1wiICsgb3B0aW9ucy51c2VQcmVmaXggKyBtZXRob2RzLl9qcVNlbGVjdG9yKGZpZWxkLmF0dHIoJ2lkJykpICsgb3B0aW9ucy51c2VTdWZmaXgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0IGZpcnN0X2Vycj1maWVsZDtcclxuXHRcdFx0XHRcdGlmIChvcHRpb25zLmRvTm90U2hvd0FsbEVycm9zT25TdWJtaXQpXHJcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcdG5hbWVzLnB1c2goZmllbGQuYXR0cignbmFtZScpKTtcclxuXHJcblx0XHRcdFx0XHQvL2lmIG9wdGlvbiBzZXQsIHN0b3AgY2hlY2tpbmcgdmFsaWRhdGlvbiBydWxlcyBhZnRlciBvbmUgZXJyb3IgaXMgZm91bmRcclxuXHRcdFx0XHRcdGlmKG9wdGlvbnMuc2hvd09uZU1lc3NhZ2UgPT0gdHJ1ZSAmJiBlcnJvckZvdW5kKXtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBzZWNvbmQsIGNoZWNrIHRvIHNlZSBpZiBhbGwgYWpheCBjYWxscyBjb21wbGV0ZWQgb2tcclxuXHRcdFx0Ly8gZXJyb3JGb3VuZCB8PSAhbWV0aG9kcy5fY2hlY2tBamF4U3RhdHVzKG9wdGlvbnMpO1xyXG5cclxuXHRcdFx0Ly8gdGhpcmQsIGNoZWNrIHN0YXR1cyBhbmQgc2Nyb2xsIHRoZSBjb250YWluZXIgYWNjb3JkaW5nbHlcclxuXHRcdFx0Zm9ybS50cmlnZ2VyKFwianF2LmZvcm0ucmVzdWx0XCIsIFtlcnJvckZvdW5kXSk7XHJcblxyXG5cdFx0XHRpZiAoZXJyb3JGb3VuZCkge1xyXG5cdFx0XHRcdGlmIChvcHRpb25zLnNjcm9sbCkge1xyXG5cdFx0XHRcdFx0dmFyIGRlc3RpbmF0aW9uPWZpcnN0X2Vyci5vZmZzZXQoKS50b3A7XHJcblx0XHRcdFx0XHR2YXIgZml4bGVmdCA9IGZpcnN0X2Vyci5vZmZzZXQoKS5sZWZ0O1xyXG5cclxuXHRcdFx0XHRcdC8vcHJvbXB0IHBvc2l0aW9uaW5nIGFkanVzdG1lbnQgc3VwcG9ydC4gVXNhZ2U6IHBvc2l0aW9uVHlwZTpYc2hpZnQsWXNoaWZ0IChmb3IgZXguOiBib3R0b21MZWZ0OisyMCBvciBib3R0b21MZWZ0Oi0yMCwrMTApXHJcblx0XHRcdFx0XHR2YXIgcG9zaXRpb25UeXBlPW9wdGlvbnMucHJvbXB0UG9zaXRpb247XHJcblx0XHRcdFx0XHRpZiAodHlwZW9mKHBvc2l0aW9uVHlwZSk9PSdzdHJpbmcnICYmIHBvc2l0aW9uVHlwZS5pbmRleE9mKFwiOlwiKSE9LTEpXHJcblx0XHRcdFx0XHRcdHBvc2l0aW9uVHlwZT1wb3NpdGlvblR5cGUuc3Vic3RyaW5nKDAscG9zaXRpb25UeXBlLmluZGV4T2YoXCI6XCIpKTtcclxuXHJcblx0XHRcdFx0XHRpZiAocG9zaXRpb25UeXBlIT1cImJvdHRvbVJpZ2h0XCIgJiYgcG9zaXRpb25UeXBlIT1cImJvdHRvbUxlZnRcIikge1xyXG5cdFx0XHRcdFx0XHR2YXIgcHJvbXB0X2Vycj0gbWV0aG9kcy5fZ2V0UHJvbXB0KGZpcnN0X2Vycik7XHJcblx0XHRcdFx0XHRcdGlmIChwcm9tcHRfZXJyKSB7XHJcblx0XHRcdFx0XHRcdFx0ZGVzdGluYXRpb249cHJvbXB0X2Vyci5vZmZzZXQoKS50b3A7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Ly8gT2Zmc2V0IHRoZSBhbW91bnQgdGhlIHBhZ2Ugc2Nyb2xscyBieSBhbiBhbW91bnQgaW4gcHggdG8gYWNjb21vZGF0ZSBmaXhlZCBlbGVtZW50cyBhdCB0b3Agb2YgcGFnZVxyXG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMuc2Nyb2xsT2Zmc2V0KSB7XHJcblx0XHRcdFx0XHRcdGRlc3RpbmF0aW9uIC09IG9wdGlvbnMuc2Nyb2xsT2Zmc2V0O1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdC8vIGdldCB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IGVycm9yLCB0aGVyZSBzaG91bGQgYmUgYXQgbGVhc3Qgb25lLCBubyBuZWVkIHRvIGNoZWNrIHRoaXNcclxuXHRcdFx0XHRcdC8vdmFyIGRlc3RpbmF0aW9uID0gZm9ybS5maW5kKFwiLmZvcm1FcnJvcjpub3QoJy5ncmVlblBvcHVwJyk6Zmlyc3RcIikub2Zmc2V0KCkudG9wO1xyXG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMuaXNPdmVyZmxvd24pIHtcclxuXHRcdFx0XHRcdFx0dmFyIG92ZXJmbG93RElWID0gJChvcHRpb25zLm92ZXJmbG93bkRJVik7XHJcblx0XHRcdFx0XHRcdGlmKCFvdmVyZmxvd0RJVi5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcdFx0dmFyIHNjcm9sbENvbnRhaW5lclNjcm9sbCA9IG92ZXJmbG93RElWLnNjcm9sbFRvcCgpO1xyXG5cdFx0XHRcdFx0XHR2YXIgc2Nyb2xsQ29udGFpbmVyUG9zID0gLXBhcnNlSW50KG92ZXJmbG93RElWLm9mZnNldCgpLnRvcCk7XHJcblxyXG5cdFx0XHRcdFx0XHRkZXN0aW5hdGlvbiArPSBzY3JvbGxDb250YWluZXJTY3JvbGwgKyBzY3JvbGxDb250YWluZXJQb3MgLSA1O1xyXG5cdFx0XHRcdFx0XHR2YXIgc2Nyb2xsQ29udGFpbmVyID0gJChvcHRpb25zLm92ZXJmbG93bkRJViArIFwiOm5vdCg6YW5pbWF0ZWQpXCIpO1xyXG5cclxuXHRcdFx0XHRcdFx0c2Nyb2xsQ29udGFpbmVyLmFuaW1hdGUoeyBzY3JvbGxUb3A6IGRlc3RpbmF0aW9uIH0sIDExMDAsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0aWYob3B0aW9ucy5mb2N1c0ZpcnN0RmllbGQpIGZpcnN0X2Vyci5mb2N1cygpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHQkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKHtcclxuXHRcdFx0XHRcdFx0XHRzY3JvbGxUb3A6IGRlc3RpbmF0aW9uXHJcblx0XHRcdFx0XHRcdH0sIDExMDAsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0aWYob3B0aW9ucy5mb2N1c0ZpcnN0RmllbGQpIGZpcnN0X2Vyci5mb2N1cygpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0JChcImh0bWwsIGJvZHlcIikuYW5pbWF0ZSh7c2Nyb2xsTGVmdDogZml4bGVmdH0sMTEwMClcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0fSBlbHNlIGlmKG9wdGlvbnMuZm9jdXNGaXJzdEZpZWxkKVxyXG5cdFx0XHRcdFx0Zmlyc3RfZXJyLmZvY3VzKCk7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgdG8gcGVyZm9ybSBhbiBhamF4IGZvcm0gdmFsaWRhdGlvbi5cclxuXHRcdCogRHVyaW5nIHRoaXMgcHJvY2VzcyBhbGwgdGhlIChmaWVsZCwgdmFsdWUpIHBhaXJzIGFyZSBzZW50IHRvIHRoZSBzZXJ2ZXIgd2hpY2ggcmV0dXJucyBhIGxpc3Qgb2YgaW52YWxpZCBmaWVsZHMgb3IgdHJ1ZVxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmb3JtXHJcblx0XHQqIEBwYXJhbSB7TWFwfSBvcHRpb25zXHJcblx0XHQqL1xyXG5cdFx0X3ZhbGlkYXRlRm9ybVdpdGhBamF4OiBmdW5jdGlvbihmb3JtLCBvcHRpb25zKSB7XHJcblxyXG5cdFx0XHR2YXIgZGF0YSA9IGZvcm0uc2VyaWFsaXplKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciB0eXBlID0gKG9wdGlvbnMuYWpheEZvcm1WYWxpZGF0aW9uTWV0aG9kKSA/IG9wdGlvbnMuYWpheEZvcm1WYWxpZGF0aW9uTWV0aG9kIDogXCJHRVRcIjtcclxuXHRcdFx0dmFyIHVybCA9IChvcHRpb25zLmFqYXhGb3JtVmFsaWRhdGlvblVSTCkgPyBvcHRpb25zLmFqYXhGb3JtVmFsaWRhdGlvblVSTCA6IGZvcm0uYXR0cihcImFjdGlvblwiKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIGRhdGFUeXBlID0gKG9wdGlvbnMuZGF0YVR5cGUpID8gb3B0aW9ucy5kYXRhVHlwZSA6IFwianNvblwiO1xyXG5cdFx0XHQkLmFqYXgoe1xyXG5cdFx0XHRcdHR5cGU6IHR5cGUsXHJcblx0XHRcdFx0dXJsOiB1cmwsXHJcblx0XHRcdFx0Y2FjaGU6IGZhbHNlLFxyXG5cdFx0XHRcdGRhdGFUeXBlOiBkYXRhVHlwZSxcclxuXHRcdFx0XHRkYXRhOiBkYXRhLFxyXG5cdFx0XHRcdGZvcm06IGZvcm0sXHJcblx0XHRcdFx0bWV0aG9kczogbWV0aG9kcyxcclxuXHRcdFx0XHRvcHRpb25zOiBvcHRpb25zLFxyXG5cdFx0XHRcdGJlZm9yZVNlbmQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG9wdGlvbnMub25CZWZvcmVBamF4Rm9ybVZhbGlkYXRpb24oZm9ybSwgb3B0aW9ucyk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24oZGF0YSwgdHJhbnNwb3J0KSB7XHJcblx0XHRcdFx0XHRtZXRob2RzLl9hamF4RXJyb3IoZGF0YSwgdHJhbnNwb3J0KTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGpzb24pIHtcclxuXHRcdFx0XHRcdGlmICgoZGF0YVR5cGUgPT0gXCJqc29uXCIpICYmIChqc29uICE9PSB0cnVlKSkge1xyXG5cdFx0XHRcdFx0XHQvLyBnZXR0aW5nIHRvIHRoaXMgY2FzZSBkb2Vzbid0IG5lY2Vzc2FyeSBtZWFucyB0aGF0IHRoZSBmb3JtIGlzIGludmFsaWRcclxuXHRcdFx0XHRcdFx0Ly8gdGhlIHNlcnZlciBtYXkgcmV0dXJuIGdyZWVuIG9yIGNsb3NpbmcgcHJvbXB0IGFjdGlvbnNcclxuXHRcdFx0XHRcdFx0Ly8gdGhpcyBmbGFnIGhlbHBzIGZpZ3VyaW5nIGl0IG91dFxyXG5cdFx0XHRcdFx0XHR2YXIgZXJyb3JJbkZvcm09ZmFsc2U7XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwganNvbi5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRcdHZhciB2YWx1ZSA9IGpzb25baV07XHJcblxyXG5cdFx0XHRcdFx0XHRcdHZhciBlcnJvckZpZWxkSWQgPSB2YWx1ZVswXTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgZXJyb3JGaWVsZCA9ICQoJChcIiNcIiArIGVycm9yRmllbGRJZClbMF0pO1xyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyBtYWtlIHN1cmUgd2UgZm91bmQgdGhlIGVsZW1lbnRcclxuXHRcdFx0XHRcdFx0XHRpZiAoZXJyb3JGaWVsZC5sZW5ndGggPT0gMSkge1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdC8vIHByb21wdFRleHQgb3Igc2VsZWN0b3JcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBtc2cgPSB2YWx1ZVsyXTtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIGlmIHRoZSBmaWVsZCBpcyB2YWxpZFxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHZhbHVlWzFdID09IHRydWUpIHtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChtc2cgPT0gXCJcIiAgfHwgIW1zZyl7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gaWYgZm9yIHNvbWUgcmVhc29uLCBzdGF0dXM9PXRydWUgYW5kIGVycm9yPVwiXCIsIGp1c3QgY2xvc2UgdGhlIHByb21wdFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1ldGhvZHMuX2Nsb3NlUHJvbXB0KGVycm9yRmllbGQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIHRoZSBmaWVsZCBpcyB2YWxpZCwgYnV0IHdlIGFyZSBkaXNwbGF5aW5nIGEgZ3JlZW4gcHJvbXB0XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9wdGlvbnMuYWxscnVsZXNbbXNnXSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIHR4dCA9IG9wdGlvbnMuYWxscnVsZXNbbXNnXS5hbGVydFRleHRPaztcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICh0eHQpXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1zZyA9IHR4dDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9wdGlvbnMuc2hvd1Byb21wdHMpIG1ldGhvZHMuX3Nob3dQcm9tcHQoZXJyb3JGaWVsZCwgbXNnLCBcInBhc3NcIiwgZmFsc2UsIG9wdGlvbnMsIHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyB0aGUgZmllbGQgaXMgaW52YWxpZCwgc2hvdyB0aGUgcmVkIGVycm9yIHByb21wdFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRlcnJvckluRm9ybXw9dHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9wdGlvbnMuYWxscnVsZXNbbXNnXSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZhciB0eHQgPSBvcHRpb25zLmFsbHJ1bGVzW21zZ10uYWxlcnRUZXh0O1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICh0eHQpXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtc2cgPSB0eHQ7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYob3B0aW9ucy5zaG93UHJvbXB0cykgbWV0aG9kcy5fc2hvd1Byb21wdChlcnJvckZpZWxkLCBtc2csIFwiXCIsIGZhbHNlLCBvcHRpb25zLCB0cnVlKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0b3B0aW9ucy5vbkFqYXhGb3JtQ29tcGxldGUoIWVycm9ySW5Gb3JtLCBmb3JtLCBqc29uLCBvcHRpb25zKTtcclxuXHRcdFx0XHRcdH0gZWxzZVxyXG5cdFx0XHRcdFx0XHRvcHRpb25zLm9uQWpheEZvcm1Db21wbGV0ZSh0cnVlLCBmb3JtLCBqc29uLCBvcHRpb25zKTtcclxuXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFZhbGlkYXRlcyBmaWVsZCwgc2hvd3MgcHJvbXB0cyBhY2NvcmRpbmdseVxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fVxyXG5cdFx0KiAgICAgICAgICAgIGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX1cclxuXHRcdCogICAgICAgICAgICBmaWVsZCdzIHZhbGlkYXRpb24gcnVsZXNcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gZmFsc2UgaWYgZmllbGQgaXMgdmFsaWQgKEl0IGlzIGludmVyc2VkIGZvciAqZmllbGRzKiwgaXQgcmV0dXJuIGZhbHNlIG9uIHZhbGlkYXRlIGFuZCB0cnVlIG9uIGVycm9ycy4pXHJcblx0XHQqL1xyXG5cdFx0X3ZhbGlkYXRlRmllbGQ6IGZ1bmN0aW9uKGZpZWxkLCBvcHRpb25zLCBza2lwQWpheFZhbGlkYXRpb24pIHtcclxuXHRcdFx0aWYgKCFmaWVsZC5hdHRyKFwiaWRcIikpIHtcclxuXHRcdFx0XHRmaWVsZC5hdHRyKFwiaWRcIiwgXCJmb3JtLXZhbGlkYXRpb24tZmllbGQtXCIgKyAkLnZhbGlkYXRpb25FbmdpbmUuZmllbGRJZENvdW50ZXIpO1xyXG5cdFx0XHRcdCsrJC52YWxpZGF0aW9uRW5naW5lLmZpZWxkSWRDb3VudGVyO1xyXG5cdFx0XHR9XHJcblxyXG4gICAgICAgICAgIGlmICghb3B0aW9ucy52YWxpZGF0ZU5vblZpc2libGVGaWVsZHMgJiYgKGZpZWxkLmlzKFwiOmhpZGRlblwiKSAmJiAhb3B0aW9ucy5wcmV0dHlTZWxlY3QgfHwgZmllbGQucGFyZW50KCkuaXMoXCI6aGlkZGVuXCIpKSlcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0XHR2YXIgcnVsZXNQYXJzaW5nID0gZmllbGQuYXR0cihvcHRpb25zLnZhbGlkYXRlQXR0cmlidXRlKTtcclxuXHRcdFx0dmFyIGdldFJ1bGVzID0gL3ZhbGlkYXRlXFxbKC4qKVxcXS8uZXhlYyhydWxlc1BhcnNpbmcpO1xyXG5cclxuXHRcdFx0aWYgKCFnZXRSdWxlcylcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdHZhciBzdHIgPSBnZXRSdWxlc1sxXTtcclxuXHRcdFx0dmFyIHJ1bGVzID0gc3RyLnNwbGl0KC9cXFt8LHxcXF0vKTtcclxuXHJcblx0XHRcdC8vIHRydWUgaWYgd2UgcmFuIHRoZSBhamF4IHZhbGlkYXRpb24sIHRlbGxzIHRoZSBsb2dpYyB0byBzdG9wIG1lc3Npbmcgd2l0aCBwcm9tcHRzXHJcblx0XHRcdHZhciBpc0FqYXhWYWxpZGF0b3IgPSBmYWxzZTtcclxuXHRcdFx0dmFyIGZpZWxkTmFtZSA9IGZpZWxkLmF0dHIoXCJuYW1lXCIpO1xyXG5cdFx0XHR2YXIgcHJvbXB0VGV4dCA9IFwiXCI7XHJcblx0XHRcdHZhciBwcm9tcHRUeXBlID0gXCJcIjtcclxuXHRcdFx0dmFyIHJlcXVpcmVkID0gZmFsc2U7XHJcblx0XHRcdHZhciBsaW1pdEVycm9ycyA9IGZhbHNlO1xyXG5cdFx0XHRvcHRpb25zLmlzRXJyb3IgPSBmYWxzZTtcclxuXHRcdFx0b3B0aW9ucy5zaG93QXJyb3cgPSB0cnVlO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gSWYgdGhlIHByb2dyYW1tZXIgd2FudHMgdG8gbGltaXQgdGhlIGFtb3VudCBvZiBlcnJvciBtZXNzYWdlcyBwZXIgZmllbGQsXHJcblx0XHRcdGlmIChvcHRpb25zLm1heEVycm9yc1BlckZpZWxkID4gMCkge1xyXG5cdFx0XHRcdGxpbWl0RXJyb3JzID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIGZvcm0gPSAkKGZpZWxkLmNsb3Nlc3QoXCJmb3JtLCAudmFsaWRhdGlvbkVuZ2luZUNvbnRhaW5lclwiKSk7XHJcblx0XHRcdC8vIEZpeCBmb3IgYWRkaW5nIHNwYWNlcyBpbiB0aGUgcnVsZXNcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHJ1bGVzW2ldID0gcnVsZXNbaV0ucmVwbGFjZShcIiBcIiwgXCJcIik7XHJcblx0XHRcdFx0Ly8gUmVtb3ZlIGFueSBwYXJzaW5nIGVycm9yc1xyXG5cdFx0XHRcdGlmIChydWxlc1tpXSA9PT0gJycpIHtcclxuXHRcdFx0XHRcdGRlbGV0ZSBydWxlc1tpXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwLCBmaWVsZF9lcnJvcnMgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvLyBJZiB3ZSBhcmUgbGltaXRpbmcgZXJyb3JzLCBhbmQgaGF2ZSBoaXQgdGhlIG1heCwgYnJlYWtcclxuXHRcdFx0XHRpZiAobGltaXRFcnJvcnMgJiYgZmllbGRfZXJyb3JzID49IG9wdGlvbnMubWF4RXJyb3JzUGVyRmllbGQpIHtcclxuXHRcdFx0XHRcdC8vIElmIHdlIGhhdmVuJ3QgaGl0IGEgcmVxdWlyZWQgeWV0LCBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgb25lIGluIHRoZSB2YWxpZGF0aW9uIHJ1bGVzIGZvciB0aGlzXHJcblx0XHRcdFx0XHQvLyBmaWVsZCBhbmQgdGhhdCBpdCdzIGluZGV4IGlzIGdyZWF0ZXIgb3IgZXF1YWwgdG8gb3VyIGN1cnJlbnQgaW5kZXhcclxuXHRcdFx0XHRcdGlmICghcmVxdWlyZWQpIHtcclxuXHRcdFx0XHRcdFx0dmFyIGhhdmVfcmVxdWlyZWQgPSAkLmluQXJyYXkoJ3JlcXVpcmVkJywgcnVsZXMpO1xyXG5cdFx0XHRcdFx0XHRyZXF1aXJlZCA9IChoYXZlX3JlcXVpcmVkICE9IC0xICYmICBoYXZlX3JlcXVpcmVkID49IGkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBlcnJvck1zZyA9IHVuZGVmaW5lZDtcclxuXHRcdFx0XHRzd2l0Y2ggKHJ1bGVzW2ldKSB7XHJcblxyXG5cdFx0XHRcdFx0Y2FzZSBcInJlcXVpcmVkXCI6XHJcblx0XHRcdFx0XHRcdHJlcXVpcmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fcmVxdWlyZWQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJjdXN0b21cIjpcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fY3VzdG9tKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFwiZ3JvdXBSZXF1aXJlZFwiOlxyXG5cdFx0XHRcdFx0XHQvLyBDaGVjayBpcyBpdHMgdGhlIGZpcnN0IG9mIGdyb3VwLCBpZiBub3QsIHJlbG9hZCB2YWxpZGF0aW9uIHdpdGggZmlyc3QgZmllbGRcclxuXHRcdFx0XHRcdFx0Ly8gQU5EIGNvbnRpbnVlIG5vcm1hbCB2YWxpZGF0aW9uIG9uIHByZXNlbnQgZmllbGRcclxuXHRcdFx0XHRcdFx0dmFyIGNsYXNzR3JvdXAgPSBcIltcIitvcHRpb25zLnZhbGlkYXRlQXR0cmlidXRlK1wiKj1cIiArcnVsZXNbaSArIDFdICtcIl1cIjtcclxuXHRcdFx0XHRcdFx0dmFyIGZpcnN0T2ZHcm91cCA9IGZvcm0uZmluZChjbGFzc0dyb3VwKS5lcSgwKTtcclxuXHRcdFx0XHRcdFx0aWYoZmlyc3RPZkdyb3VwWzBdICE9IGZpZWxkWzBdKXtcclxuXHJcblx0XHRcdFx0XHRcdFx0bWV0aG9kcy5fdmFsaWRhdGVGaWVsZChmaXJzdE9mR3JvdXAsIG9wdGlvbnMsIHNraXBBamF4VmFsaWRhdGlvbik7IFxyXG5cdFx0XHRcdFx0XHRcdG9wdGlvbnMuc2hvd0Fycm93ID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fZ3JvdXBSZXF1aXJlZCk7XHJcblx0XHRcdFx0XHRcdGlmKGVycm9yTXNnKSAgcmVxdWlyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRvcHRpb25zLnNob3dBcnJvdyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJhamF4XCI6XHJcblx0XHRcdFx0XHRcdC8vIEFKQVggZGVmYXVsdHMgdG8gcmV0dXJuaW5nIGl0J3MgbG9hZGluZyBtZXNzYWdlXHJcblx0XHRcdFx0XHRcdGVycm9yTXNnID0gbWV0aG9kcy5fYWpheChmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpO1xyXG5cdFx0XHRcdFx0XHRpZiAoZXJyb3JNc2cpIHtcclxuXHRcdFx0XHRcdFx0XHRwcm9tcHRUeXBlID0gXCJsb2FkXCI7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFwibWluU2l6ZVwiOlxyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCwgcnVsZXNbaV0sIHJ1bGVzLCBpLCBvcHRpb25zLCBtZXRob2RzLl9taW5TaXplKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFwibWF4U2l6ZVwiOlxyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCwgcnVsZXNbaV0sIHJ1bGVzLCBpLCBvcHRpb25zLCBtZXRob2RzLl9tYXhTaXplKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFwibWluXCI6XHJcblx0XHRcdFx0XHRcdGVycm9yTXNnID0gbWV0aG9kcy5fZ2V0RXJyb3JNZXNzYWdlKGZvcm0sIGZpZWxkLCBydWxlc1tpXSwgcnVsZXMsIGksIG9wdGlvbnMsIG1ldGhvZHMuX21pbik7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcIm1heFwiOlxyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCwgcnVsZXNbaV0sIHJ1bGVzLCBpLCBvcHRpb25zLCBtZXRob2RzLl9tYXgpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJwYXN0XCI6XHJcblx0XHRcdFx0XHRcdGVycm9yTXNnID0gbWV0aG9kcy5fZ2V0RXJyb3JNZXNzYWdlKGZvcm0sIGZpZWxkLHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fcGFzdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcImZ1dHVyZVwiOlxyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCxydWxlc1tpXSwgcnVsZXMsIGksIG9wdGlvbnMsIG1ldGhvZHMuX2Z1dHVyZSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcImRhdGVSYW5nZVwiOlxyXG5cdFx0XHRcdFx0XHR2YXIgY2xhc3NHcm91cCA9IFwiW1wiK29wdGlvbnMudmFsaWRhdGVBdHRyaWJ1dGUrXCIqPVwiICsgcnVsZXNbaSArIDFdICsgXCJdXCI7XHJcblx0XHRcdFx0XHRcdG9wdGlvbnMuZmlyc3RPZkdyb3VwID0gZm9ybS5maW5kKGNsYXNzR3JvdXApLmVxKDApO1xyXG5cdFx0XHRcdFx0XHRvcHRpb25zLnNlY29uZE9mR3JvdXAgPSBmb3JtLmZpbmQoY2xhc3NHcm91cCkuZXEoMSk7XHJcblxyXG5cdFx0XHRcdFx0XHQvL2lmIG9uZSBlbnRyeSBvdXQgb2YgdGhlIHBhaXIgaGFzIHZhbHVlIHRoZW4gcHJvY2VlZCB0byBydW4gdGhyb3VnaCB2YWxpZGF0aW9uXHJcblx0XHRcdFx0XHRcdGlmIChvcHRpb25zLmZpcnN0T2ZHcm91cFswXS52YWx1ZSB8fCBvcHRpb25zLnNlY29uZE9mR3JvdXBbMF0udmFsdWUpIHtcclxuXHRcdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCxydWxlc1tpXSwgcnVsZXMsIGksIG9wdGlvbnMsIG1ldGhvZHMuX2RhdGVSYW5nZSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYgKGVycm9yTXNnKSByZXF1aXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdG9wdGlvbnMuc2hvd0Fycm93ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRcdGNhc2UgXCJkYXRlVGltZVJhbmdlXCI6XHJcblx0XHRcdFx0XHRcdHZhciBjbGFzc0dyb3VwID0gXCJbXCIrb3B0aW9ucy52YWxpZGF0ZUF0dHJpYnV0ZStcIio9XCIgKyBydWxlc1tpICsgMV0gKyBcIl1cIjtcclxuXHRcdFx0XHRcdFx0b3B0aW9ucy5maXJzdE9mR3JvdXAgPSBmb3JtLmZpbmQoY2xhc3NHcm91cCkuZXEoMCk7XHJcblx0XHRcdFx0XHRcdG9wdGlvbnMuc2Vjb25kT2ZHcm91cCA9IGZvcm0uZmluZChjbGFzc0dyb3VwKS5lcSgxKTtcclxuXHJcblx0XHRcdFx0XHRcdC8vaWYgb25lIGVudHJ5IG91dCBvZiB0aGUgcGFpciBoYXMgdmFsdWUgdGhlbiBwcm9jZWVkIHRvIHJ1biB0aHJvdWdoIHZhbGlkYXRpb25cclxuXHRcdFx0XHRcdFx0aWYgKG9wdGlvbnMuZmlyc3RPZkdyb3VwWzBdLnZhbHVlIHx8IG9wdGlvbnMuc2Vjb25kT2ZHcm91cFswXS52YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRcdGVycm9yTXNnID0gbWV0aG9kcy5fZ2V0RXJyb3JNZXNzYWdlKGZvcm0sIGZpZWxkLHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fZGF0ZVRpbWVSYW5nZSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYgKGVycm9yTXNnKSByZXF1aXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdG9wdGlvbnMuc2hvd0Fycm93ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcIm1heENoZWNrYm94XCI6XHJcblx0XHRcdFx0XHRcdGZpZWxkID0gJChmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPSdcIiArIGZpZWxkTmFtZSArIFwiJ11cIikpO1xyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCwgcnVsZXNbaV0sIHJ1bGVzLCBpLCBvcHRpb25zLCBtZXRob2RzLl9tYXhDaGVja2JveCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcIm1pbkNoZWNrYm94XCI6XHJcblx0XHRcdFx0XHRcdGZpZWxkID0gJChmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPSdcIiArIGZpZWxkTmFtZSArIFwiJ11cIikpO1xyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCwgcnVsZXNbaV0sIHJ1bGVzLCBpLCBvcHRpb25zLCBtZXRob2RzLl9taW5DaGVja2JveCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcImVxdWFsc1wiOlxyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCwgcnVsZXNbaV0sIHJ1bGVzLCBpLCBvcHRpb25zLCBtZXRob2RzLl9lcXVhbHMpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJmdW5jQ2FsbFwiOlxyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCwgcnVsZXNbaV0sIHJ1bGVzLCBpLCBvcHRpb25zLCBtZXRob2RzLl9mdW5jQ2FsbCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcImNyZWRpdENhcmRcIjpcclxuXHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBtZXRob2RzLl9nZXRFcnJvck1lc3NhZ2UoZm9ybSwgZmllbGQsIHJ1bGVzW2ldLCBydWxlcywgaSwgb3B0aW9ucywgbWV0aG9kcy5fY3JlZGl0Q2FyZCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcImNvbmRSZXF1aXJlZFwiOlxyXG5cdFx0XHRcdFx0XHRlcnJvck1zZyA9IG1ldGhvZHMuX2dldEVycm9yTWVzc2FnZShmb3JtLCBmaWVsZCwgcnVsZXNbaV0sIHJ1bGVzLCBpLCBvcHRpb25zLCBtZXRob2RzLl9jb25kUmVxdWlyZWQpO1xyXG5cdFx0XHRcdFx0XHRpZiAoZXJyb3JNc2cgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0XHRcdHJlcXVpcmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgZW5kX3ZhbGlkYXRpb24gPSBmYWxzZTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvLyBJZiB3ZSB3ZXJlIHBhc3NlZCBiYWNrIGFuIG1lc3NhZ2Ugb2JqZWN0LCBjaGVjayB3aGF0IHRoZSBzdGF0dXMgd2FzIHRvIGRldGVybWluZSB3aGF0IHRvIGRvXHJcblx0XHRcdFx0aWYgKHR5cGVvZiBlcnJvck1zZyA9PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdFx0XHRzd2l0Y2ggKGVycm9yTXNnLnN0YXR1cykge1xyXG5cdFx0XHRcdFx0XHRjYXNlIFwiX2JyZWFrXCI6XHJcblx0XHRcdFx0XHRcdFx0ZW5kX3ZhbGlkYXRpb24gPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHQvLyBJZiB3ZSBoYXZlIGFuIGVycm9yIG1lc3NhZ2UsIHNldCBlcnJvck1zZyB0byB0aGUgZXJyb3IgbWVzc2FnZVxyXG5cdFx0XHRcdFx0XHRjYXNlIFwiX2Vycm9yXCI6XHJcblx0XHRcdFx0XHRcdFx0ZXJyb3JNc2cgPSBlcnJvck1zZy5tZXNzYWdlO1xyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHQvLyBJZiB3ZSB3YW50IHRvIHRocm93IGFuIGVycm9yLCBidXQgbm90IHNob3cgYSBwcm9tcHQsIHJldHVybiBlYXJseSB3aXRoIHRydWVcclxuXHRcdFx0XHRcdFx0Y2FzZSBcIl9lcnJvcl9ub19wcm9tcHRcIjpcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0Ly8gQW55dGhpbmcgZWxzZSB3ZSBjb250aW51ZSBvblxyXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvLyBJZiBpdCBoYXMgYmVlbiBzcGVjaWZpZWQgdGhhdCB2YWxpZGF0aW9uIHNob3VsZCBlbmQgbm93LCBicmVha1xyXG5cdFx0XHRcdGlmIChlbmRfdmFsaWRhdGlvbikge1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdC8vIElmIHdlIGhhdmUgYSBzdHJpbmcsIHRoYXQgbWVhbnMgdGhhdCB3ZSBoYXZlIGFuIGVycm9yLCBzbyBhZGQgaXQgdG8gdGhlIGVycm9yIG1lc3NhZ2UuXHJcblx0XHRcdFx0aWYgKHR5cGVvZiBlcnJvck1zZyA9PSAnc3RyaW5nJykge1xyXG5cdFx0XHRcdFx0cHJvbXB0VGV4dCArPSBlcnJvck1zZyArIFwiPGJyLz5cIjtcclxuXHRcdFx0XHRcdG9wdGlvbnMuaXNFcnJvciA9IHRydWU7XHJcblx0XHRcdFx0XHRmaWVsZF9lcnJvcnMrKztcclxuXHRcdFx0XHR9XHRcclxuXHRcdFx0fVxyXG5cdFx0XHQvLyBJZiB0aGUgcnVsZXMgcmVxdWlyZWQgaXMgbm90IGFkZGVkLCBhbiBlbXB0eSBmaWVsZCBpcyBub3QgdmFsaWRhdGVkXHJcblx0XHRcdGlmKCFyZXF1aXJlZCAmJiAhKGZpZWxkLnZhbCgpKSAmJiBmaWVsZC52YWwoKS5sZW5ndGggPCAxKSBvcHRpb25zLmlzRXJyb3IgPSBmYWxzZTtcclxuXHJcblx0XHRcdC8vIEhhY2sgZm9yIHJhZGlvL2NoZWNrYm94IGdyb3VwIGJ1dHRvbiwgdGhlIHZhbGlkYXRpb24gZ28gaW50byB0aGVcclxuXHRcdFx0Ly8gZmlyc3QgcmFkaW8vY2hlY2tib3ggb2YgdGhlIGdyb3VwXHJcblx0XHRcdHZhciBmaWVsZFR5cGUgPSBmaWVsZC5wcm9wKFwidHlwZVwiKTtcclxuXHRcdFx0dmFyIHBvc2l0aW9uVHlwZT1maWVsZC5kYXRhKFwicHJvbXB0UG9zaXRpb25cIikgfHwgb3B0aW9ucy5wcm9tcHRQb3NpdGlvbjtcclxuXHJcblx0XHRcdGlmICgoZmllbGRUeXBlID09IFwicmFkaW9cIiB8fCBmaWVsZFR5cGUgPT0gXCJjaGVja2JveFwiKSAmJiBmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPSdcIiArIGZpZWxkTmFtZSArIFwiJ11cIikuc2l6ZSgpID4gMSkge1xyXG5cdFx0XHRcdGlmKHBvc2l0aW9uVHlwZSA9PT0gJ2lubGluZScpIHtcclxuXHRcdFx0XHRcdGZpZWxkID0gJChmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPSdcIiArIGZpZWxkTmFtZSArIFwiJ11bdHlwZSE9aGlkZGVuXTpsYXN0XCIpKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGZpZWxkID0gJChmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPSdcIiArIGZpZWxkTmFtZSArIFwiJ11bdHlwZSE9aGlkZGVuXTpmaXJzdFwiKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdG9wdGlvbnMuc2hvd0Fycm93ID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKGZpZWxkLmlzKFwiOmhpZGRlblwiKSAmJiBvcHRpb25zLnByZXR0eVNlbGVjdCkge1xyXG5cdFx0XHRcdGZpZWxkID0gZm9ybS5maW5kKFwiI1wiICsgb3B0aW9ucy51c2VQcmVmaXggKyBtZXRob2RzLl9qcVNlbGVjdG9yKGZpZWxkLmF0dHIoJ2lkJykpICsgb3B0aW9ucy51c2VTdWZmaXgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAob3B0aW9ucy5pc0Vycm9yICYmIG9wdGlvbnMuc2hvd1Byb21wdHMpe1xyXG5cdFx0XHRcdG1ldGhvZHMuX3Nob3dQcm9tcHQoZmllbGQsIHByb21wdFRleHQsIHByb21wdFR5cGUsIGZhbHNlLCBvcHRpb25zKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0aWYgKCFpc0FqYXhWYWxpZGF0b3IpIG1ldGhvZHMuX2Nsb3NlUHJvbXB0KGZpZWxkKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKCFpc0FqYXhWYWxpZGF0b3IpIHtcclxuXHRcdFx0XHRmaWVsZC50cmlnZ2VyKFwianF2LmZpZWxkLnJlc3VsdFwiLCBbZmllbGQsIG9wdGlvbnMuaXNFcnJvciwgcHJvbXB0VGV4dF0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKiBSZWNvcmQgZXJyb3IgKi9cclxuXHRcdFx0dmFyIGVycmluZGV4ID0gJC5pbkFycmF5KGZpZWxkWzBdLCBvcHRpb25zLkludmFsaWRGaWVsZHMpO1xyXG5cdFx0XHRpZiAoZXJyaW5kZXggPT0gLTEpIHtcclxuXHRcdFx0XHRpZiAob3B0aW9ucy5pc0Vycm9yKVxyXG5cdFx0XHRcdG9wdGlvbnMuSW52YWxpZEZpZWxkcy5wdXNoKGZpZWxkWzBdKTtcclxuXHRcdFx0fSBlbHNlIGlmICghb3B0aW9ucy5pc0Vycm9yKSB7XHJcblx0XHRcdFx0b3B0aW9ucy5JbnZhbGlkRmllbGRzLnNwbGljZShlcnJpbmRleCwgMSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0bWV0aG9kcy5faGFuZGxlU3RhdHVzQ3NzQ2xhc3NlcyhmaWVsZCwgb3B0aW9ucyk7XHJcblx0XHJcblx0XHRcdC8qIHJ1biBjYWxsYmFjayBmdW5jdGlvbiBmb3IgZWFjaCBmaWVsZCAqL1xyXG5cdFx0XHRpZiAob3B0aW9ucy5pc0Vycm9yICYmIG9wdGlvbnMub25GaWVsZEZhaWx1cmUpXHJcblx0XHRcdFx0b3B0aW9ucy5vbkZpZWxkRmFpbHVyZShmaWVsZCk7XHJcblxyXG5cdFx0XHRpZiAoIW9wdGlvbnMuaXNFcnJvciAmJiBvcHRpb25zLm9uRmllbGRTdWNjZXNzKVxyXG5cdFx0XHRcdG9wdGlvbnMub25GaWVsZFN1Y2Nlc3MoZmllbGQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIG9wdGlvbnMuaXNFcnJvcjtcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogSGFuZGxpbmcgY3NzIGNsYXNzZXMgb2YgZmllbGRzIGluZGljYXRpbmcgcmVzdWx0IG9mIHZhbGlkYXRpb24gXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9XHJcblx0XHQqICAgICAgICAgICAgZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfVxyXG5cdFx0KiAgICAgICAgICAgIGZpZWxkJ3MgdmFsaWRhdGlvbiBydWxlcyAgICAgICAgICAgIFxyXG5cdFx0KiBAcHJpdmF0ZVxyXG5cdFx0Ki9cclxuXHRcdF9oYW5kbGVTdGF0dXNDc3NDbGFzc2VzOiBmdW5jdGlvbihmaWVsZCwgb3B0aW9ucykge1xyXG5cdFx0XHQvKiByZW1vdmUgYWxsIGNsYXNzZXMgKi9cclxuXHRcdFx0aWYob3B0aW9ucy5hZGRTdWNjZXNzQ3NzQ2xhc3NUb0ZpZWxkKVxyXG5cdFx0XHRcdGZpZWxkLnJlbW92ZUNsYXNzKG9wdGlvbnMuYWRkU3VjY2Vzc0Nzc0NsYXNzVG9GaWVsZCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zLmFkZEZhaWx1cmVDc3NDbGFzc1RvRmllbGQpXHJcblx0XHRcdFx0ZmllbGQucmVtb3ZlQ2xhc3Mob3B0aW9ucy5hZGRGYWlsdXJlQ3NzQ2xhc3NUb0ZpZWxkKTtcclxuXHRcdFx0XHJcblx0XHRcdC8qIEFkZCBjbGFzc2VzICovXHJcblx0XHRcdGlmIChvcHRpb25zLmFkZFN1Y2Nlc3NDc3NDbGFzc1RvRmllbGQgJiYgIW9wdGlvbnMuaXNFcnJvcilcclxuXHRcdFx0XHRmaWVsZC5hZGRDbGFzcyhvcHRpb25zLmFkZFN1Y2Nlc3NDc3NDbGFzc1RvRmllbGQpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKG9wdGlvbnMuYWRkRmFpbHVyZUNzc0NsYXNzVG9GaWVsZCAmJiBvcHRpb25zLmlzRXJyb3IpXHJcblx0XHRcdFx0ZmllbGQuYWRkQ2xhc3Mob3B0aW9ucy5hZGRGYWlsdXJlQ3NzQ2xhc3NUb0ZpZWxkKTtcdFx0XHJcblx0XHR9LFxyXG5cdFx0XHJcblx0XHQgLyoqKioqKioqKioqKioqKioqKioqXHJcblx0XHQgICogX2dldEVycm9yTWVzc2FnZVxyXG5cdFx0ICAqXHJcblx0XHQgICogQHBhcmFtIGZvcm1cclxuXHRcdCAgKiBAcGFyYW0gZmllbGRcclxuXHRcdCAgKiBAcGFyYW0gcnVsZVxyXG5cdFx0ICAqIEBwYXJhbSBydWxlc1xyXG5cdFx0ICAqIEBwYXJhbSBpXHJcblx0XHQgICogQHBhcmFtIG9wdGlvbnNcclxuXHRcdCAgKiBAcGFyYW0gb3JpZ2luYWxWYWxpZGF0aW9uTWV0aG9kXHJcblx0XHQgICogQHJldHVybiB7Kn1cclxuXHRcdCAgKiBAcHJpdmF0ZVxyXG5cdFx0ICAqL1xyXG5cdFx0IF9nZXRFcnJvck1lc3NhZ2U6ZnVuY3Rpb24gKGZvcm0sIGZpZWxkLCBydWxlLCBydWxlcywgaSwgb3B0aW9ucywgb3JpZ2luYWxWYWxpZGF0aW9uTWV0aG9kKSB7XHJcblx0XHRcdCAvLyBJZiB3ZSBhcmUgdXNpbmcgdGhlIGN1c3RvbiB2YWxpZGF0aW9uIHR5cGUsIGJ1aWxkIHRoZSBpbmRleCBmb3IgdGhlIHJ1bGUuXHJcblx0XHRcdCAvLyBPdGhlcndpc2UgaWYgd2UgYXJlIGRvaW5nIGEgZnVuY3Rpb24gY2FsbCwgbWFrZSB0aGUgY2FsbCBhbmQgcmV0dXJuIHRoZSBvYmplY3RcclxuXHRcdFx0IC8vIHRoYXQgaXMgcGFzc2VkIGJhY2suXHJcblx0IFx0XHQgdmFyIHJ1bGVfaW5kZXggPSBqUXVlcnkuaW5BcnJheShydWxlLCBydWxlcyk7XHJcblx0XHRcdCBpZiAocnVsZSA9PT0gXCJjdXN0b21cIiB8fCBydWxlID09PSBcImZ1bmNDYWxsXCIpIHtcclxuXHRcdFx0XHQgdmFyIGN1c3RvbV92YWxpZGF0aW9uX3R5cGUgPSBydWxlc1tydWxlX2luZGV4ICsgMV07XHJcblx0XHRcdFx0IHJ1bGUgPSBydWxlICsgXCJbXCIgKyBjdXN0b21fdmFsaWRhdGlvbl90eXBlICsgXCJdXCI7XHJcblx0XHRcdFx0IC8vIERlbGV0ZSB0aGUgcnVsZSBmcm9tIHRoZSBydWxlcyBhcnJheSBzbyB0aGF0IGl0IGRvZXNuJ3QgdHJ5IHRvIGNhbGwgdGhlXHJcblx0XHRcdCAgICAvLyBzYW1lIHJ1bGUgb3ZlciBhZ2FpblxyXG5cdFx0XHQgICAgZGVsZXRlKHJ1bGVzW3J1bGVfaW5kZXhdKTtcclxuXHRcdFx0IH1cclxuXHRcdFx0IC8vIENoYW5nZSB0aGUgcnVsZSB0byB0aGUgY29tcG9zaXRlIHJ1bGUsIGlmIGl0IHdhcyBkaWZmZXJlbnQgZnJvbSB0aGUgb3JpZ2luYWxcclxuXHRcdFx0IHZhciBhbHRlcmVkUnVsZSA9IHJ1bGU7XHJcblxyXG5cclxuXHRcdFx0IHZhciBlbGVtZW50X2NsYXNzZXMgPSAoZmllbGQuYXR0cihcImRhdGEtdmFsaWRhdGlvbi1lbmdpbmVcIikpID8gZmllbGQuYXR0cihcImRhdGEtdmFsaWRhdGlvbi1lbmdpbmVcIikgOiBmaWVsZC5hdHRyKFwiY2xhc3NcIik7XHJcblx0XHRcdCB2YXIgZWxlbWVudF9jbGFzc2VzX2FycmF5ID0gZWxlbWVudF9jbGFzc2VzLnNwbGl0KFwiIFwiKTtcclxuXHJcblx0XHRcdCAvLyBDYWxsIHRoZSBvcmlnaW5hbCB2YWxpZGF0aW9uIG1ldGhvZC4gSWYgd2UgYXJlIGRlYWxpbmcgd2l0aCBkYXRlcyBvciBjaGVja2JveGVzLCBhbHNvIHBhc3MgdGhlIGZvcm1cclxuXHRcdFx0IHZhciBlcnJvck1zZztcclxuXHRcdFx0IGlmIChydWxlID09IFwiZnV0dXJlXCIgfHwgcnVsZSA9PSBcInBhc3RcIiAgfHwgcnVsZSA9PSBcIm1heENoZWNrYm94XCIgfHwgcnVsZSA9PSBcIm1pbkNoZWNrYm94XCIpIHtcclxuXHRcdFx0XHQgZXJyb3JNc2cgPSBvcmlnaW5hbFZhbGlkYXRpb25NZXRob2QoZm9ybSwgZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKTtcclxuXHRcdFx0IH0gZWxzZSB7XHJcblx0XHRcdFx0IGVycm9yTXNnID0gb3JpZ2luYWxWYWxpZGF0aW9uTWV0aG9kKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucyk7XHJcblx0XHRcdCB9XHJcblxyXG5cdFx0XHQgLy8gSWYgdGhlIG9yaWdpbmFsIHZhbGlkYXRpb24gbWV0aG9kIHJldHVybmVkIGFuIGVycm9yIGFuZCB3ZSBoYXZlIGEgY3VzdG9tIGVycm9yIG1lc3NhZ2UsXHJcblx0XHRcdCAvLyByZXR1cm4gdGhlIGN1c3RvbSBtZXNzYWdlIGluc3RlYWQuIE90aGVyd2lzZSByZXR1cm4gdGhlIG9yaWdpbmFsIGVycm9yIG1lc3NhZ2UuXHJcblx0XHRcdCBpZiAoZXJyb3JNc2cgIT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0IHZhciBjdXN0b21fbWVzc2FnZSA9IG1ldGhvZHMuX2dldEN1c3RvbUVycm9yTWVzc2FnZSgkKGZpZWxkKSwgZWxlbWVudF9jbGFzc2VzX2FycmF5LCBhbHRlcmVkUnVsZSwgb3B0aW9ucyk7XHJcblx0XHRcdFx0IGlmIChjdXN0b21fbWVzc2FnZSkgZXJyb3JNc2cgPSBjdXN0b21fbWVzc2FnZTtcclxuXHRcdFx0IH1cclxuXHRcdFx0IHJldHVybiBlcnJvck1zZztcclxuXHJcblx0XHQgfSxcclxuXHRcdCBfZ2V0Q3VzdG9tRXJyb3JNZXNzYWdlOmZ1bmN0aW9uIChmaWVsZCwgY2xhc3NlcywgcnVsZSwgb3B0aW9ucykge1xyXG5cdFx0XHR2YXIgY3VzdG9tX21lc3NhZ2UgPSBmYWxzZTtcclxuXHRcdFx0dmFyIHZhbGlkaXR5UHJvcCA9IC9eY3VzdG9tXFxbLipcXF0kLy50ZXN0KHJ1bGUpID8gbWV0aG9kcy5fdmFsaWRpdHlQcm9wW1wiY3VzdG9tXCJdIDogbWV0aG9kcy5fdmFsaWRpdHlQcm9wW3J1bGVdO1xyXG5cdFx0XHQgLy8gSWYgdGhlcmUgaXMgYSB2YWxpZGl0eVByb3AgZm9yIHRoaXMgcnVsZSwgY2hlY2sgdG8gc2VlIGlmIHRoZSBmaWVsZCBoYXMgYW4gYXR0cmlidXRlIGZvciBpdFxyXG5cdFx0XHRpZiAodmFsaWRpdHlQcm9wICE9IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdGN1c3RvbV9tZXNzYWdlID0gZmllbGQuYXR0cihcImRhdGEtZXJyb3JtZXNzYWdlLVwiK3ZhbGlkaXR5UHJvcCk7XHJcblx0XHRcdFx0Ly8gSWYgdGhlcmUgd2FzIGFuIGVycm9yIG1lc3NhZ2UgZm9yIGl0LCByZXR1cm4gdGhlIG1lc3NhZ2VcclxuXHRcdFx0XHRpZiAoY3VzdG9tX21lc3NhZ2UgIT0gdW5kZWZpbmVkKSBcclxuXHRcdFx0XHRcdHJldHVybiBjdXN0b21fbWVzc2FnZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjdXN0b21fbWVzc2FnZSA9IGZpZWxkLmF0dHIoXCJkYXRhLWVycm9ybWVzc2FnZVwiKTtcclxuXHRcdFx0IC8vIElmIHRoZXJlIGlzIGFuIGlubGluZSBjdXN0b20gZXJyb3IgbWVzc2FnZSwgcmV0dXJuIGl0XHJcblx0XHRcdGlmIChjdXN0b21fbWVzc2FnZSAhPSB1bmRlZmluZWQpIFxyXG5cdFx0XHRcdHJldHVybiBjdXN0b21fbWVzc2FnZTtcclxuXHRcdFx0dmFyIGlkID0gJyMnICsgZmllbGQuYXR0cihcImlkXCIpO1xyXG5cdFx0XHQvLyBJZiB3ZSBoYXZlIGN1c3RvbSBtZXNzYWdlcyBmb3IgdGhlIGVsZW1lbnQncyBpZCwgZ2V0IHRoZSBtZXNzYWdlIGZvciB0aGUgcnVsZSBmcm9tIHRoZSBpZC5cclxuXHRcdFx0Ly8gT3RoZXJ3aXNlLCBpZiB3ZSBoYXZlIGN1c3RvbSBtZXNzYWdlcyBmb3IgdGhlIGVsZW1lbnQncyBjbGFzc2VzLCB1c2UgdGhlIGZpcnN0IGNsYXNzIG1lc3NhZ2Ugd2UgZmluZCBpbnN0ZWFkLlxyXG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY3VzdG9tX2Vycm9yX21lc3NhZ2VzW2lkXSAhPSBcInVuZGVmaW5lZFwiICYmXHJcblx0XHRcdFx0dHlwZW9mIG9wdGlvbnMuY3VzdG9tX2Vycm9yX21lc3NhZ2VzW2lkXVtydWxlXSAhPSBcInVuZGVmaW5lZFwiICkge1xyXG5cdFx0XHRcdFx0XHQgIGN1c3RvbV9tZXNzYWdlID0gb3B0aW9ucy5jdXN0b21fZXJyb3JfbWVzc2FnZXNbaWRdW3J1bGVdWydtZXNzYWdlJ107XHJcblx0XHRcdH0gZWxzZSBpZiAoY2xhc3Nlcy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aCAmJiBjbGFzc2VzLmxlbmd0aCA+IDA7IGkrKykge1xyXG5cdFx0XHRcdFx0IHZhciBlbGVtZW50X2NsYXNzID0gXCIuXCIgKyBjbGFzc2VzW2ldO1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmN1c3RvbV9lcnJvcl9tZXNzYWdlc1tlbGVtZW50X2NsYXNzXSAhPSBcInVuZGVmaW5lZFwiICYmXHJcblx0XHRcdFx0XHRcdHR5cGVvZiBvcHRpb25zLmN1c3RvbV9lcnJvcl9tZXNzYWdlc1tlbGVtZW50X2NsYXNzXVtydWxlXSAhPSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdFx0XHRcdFx0Y3VzdG9tX21lc3NhZ2UgPSBvcHRpb25zLmN1c3RvbV9lcnJvcl9tZXNzYWdlc1tlbGVtZW50X2NsYXNzXVtydWxlXVsnbWVzc2FnZSddO1xyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIWN1c3RvbV9tZXNzYWdlICYmXHJcblx0XHRcdFx0dHlwZW9mIG9wdGlvbnMuY3VzdG9tX2Vycm9yX21lc3NhZ2VzW3J1bGVdICE9IFwidW5kZWZpbmVkXCIgJiZcclxuXHRcdFx0XHR0eXBlb2Ygb3B0aW9ucy5jdXN0b21fZXJyb3JfbWVzc2FnZXNbcnVsZV1bJ21lc3NhZ2UnXSAhPSBcInVuZGVmaW5lZFwiKXtcclxuXHRcdFx0XHRcdCBjdXN0b21fbWVzc2FnZSA9IG9wdGlvbnMuY3VzdG9tX2Vycm9yX21lc3NhZ2VzW3J1bGVdWydtZXNzYWdlJ107XHJcblx0XHRcdCB9XHJcblx0XHRcdCByZXR1cm4gY3VzdG9tX21lc3NhZ2U7XHJcblx0XHQgfSxcclxuXHRcdCBfdmFsaWRpdHlQcm9wOiB7XHJcblx0XHRcdCBcInJlcXVpcmVkXCI6IFwidmFsdWUtbWlzc2luZ1wiLFxyXG5cdFx0XHQgXCJjdXN0b21cIjogXCJjdXN0b20tZXJyb3JcIixcclxuXHRcdFx0IFwiZ3JvdXBSZXF1aXJlZFwiOiBcInZhbHVlLW1pc3NpbmdcIixcclxuXHRcdFx0IFwiYWpheFwiOiBcImN1c3RvbS1lcnJvclwiLFxyXG5cdFx0XHQgXCJtaW5TaXplXCI6IFwicmFuZ2UtdW5kZXJmbG93XCIsXHJcblx0XHRcdCBcIm1heFNpemVcIjogXCJyYW5nZS1vdmVyZmxvd1wiLFxyXG5cdFx0XHQgXCJtaW5cIjogXCJyYW5nZS11bmRlcmZsb3dcIixcclxuXHRcdFx0IFwibWF4XCI6IFwicmFuZ2Utb3ZlcmZsb3dcIixcclxuXHRcdFx0IFwicGFzdFwiOiBcInR5cGUtbWlzbWF0Y2hcIixcclxuXHRcdFx0IFwiZnV0dXJlXCI6IFwidHlwZS1taXNtYXRjaFwiLFxyXG5cdFx0XHQgXCJkYXRlUmFuZ2VcIjogXCJ0eXBlLW1pc21hdGNoXCIsXHJcblx0XHRcdCBcImRhdGVUaW1lUmFuZ2VcIjogXCJ0eXBlLW1pc21hdGNoXCIsXHJcblx0XHRcdCBcIm1heENoZWNrYm94XCI6IFwicmFuZ2Utb3ZlcmZsb3dcIixcclxuXHRcdFx0IFwibWluQ2hlY2tib3hcIjogXCJyYW5nZS11bmRlcmZsb3dcIixcclxuXHRcdFx0IFwiZXF1YWxzXCI6IFwicGF0dGVybi1taXNtYXRjaFwiLFxyXG5cdFx0XHQgXCJmdW5jQ2FsbFwiOiBcImN1c3RvbS1lcnJvclwiLFxyXG5cdFx0XHQgXCJjcmVkaXRDYXJkXCI6IFwicGF0dGVybi1taXNtYXRjaFwiLFxyXG5cdFx0XHQgXCJjb25kUmVxdWlyZWRcIjogXCJ2YWx1ZS1taXNzaW5nXCJcclxuXHRcdCB9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFJlcXVpcmVkIHZhbGlkYXRpb25cclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHBhcmFtIHtib29sfSBjb25kUmVxdWlyZWQgZmxhZyB3aGVuIG1ldGhvZCBpcyB1c2VkIGZvciBpbnRlcm5hbCBwdXJwb3NlIGluIGNvbmRSZXF1aXJlZCBjaGVja1xyXG5cdFx0KiBAcmV0dXJuIGFuIGVycm9yIHN0cmluZyBpZiB2YWxpZGF0aW9uIGZhaWxlZFxyXG5cdFx0Ki9cclxuXHRcdF9yZXF1aXJlZDogZnVuY3Rpb24oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zLCBjb25kUmVxdWlyZWQpIHtcclxuXHRcdFx0c3dpdGNoIChmaWVsZC5wcm9wKFwidHlwZVwiKSkge1xyXG5cdFx0XHRcdGNhc2UgXCJ0ZXh0XCI6XHJcblx0XHRcdFx0Y2FzZSBcInBhc3N3b3JkXCI6XHJcblx0XHRcdFx0Y2FzZSBcInRleHRhcmVhXCI6XHJcblx0XHRcdFx0Y2FzZSBcImZpbGVcIjpcclxuXHRcdFx0XHRjYXNlIFwic2VsZWN0LW9uZVwiOlxyXG5cdFx0XHRcdGNhc2UgXCJzZWxlY3QtbXVsdGlwbGVcIjpcclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0dmFyIGZpZWxkX3ZhbCAgICAgID0gJC50cmltKCBmaWVsZC52YWwoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG5cdFx0XHRcdFx0dmFyIGR2X3BsYWNlaG9sZGVyID0gJC50cmltKCBmaWVsZC5hdHRyKFwiZGF0YS12YWxpZGF0aW9uLXBsYWNlaG9sZGVyXCIpICk7XHJcblx0XHRcdFx0XHR2YXIgcGxhY2Vob2xkZXIgICAgPSAkLnRyaW0oIGZpZWxkLmF0dHIoXCJwbGFjZWhvbGRlclwiKSAgICAgICAgICAgICAgICAgKTtcclxuXHRcdFx0XHRcdGlmIChcclxuXHRcdFx0XHRcdFx0ICAgKCAhZmllbGRfdmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG5cdFx0XHRcdFx0XHR8fCAoIGR2X3BsYWNlaG9sZGVyICYmIGZpZWxkX3ZhbCA9PSBkdl9wbGFjZWhvbGRlciApXHJcblx0XHRcdFx0XHRcdHx8ICggcGxhY2Vob2xkZXIgICAgJiYgZmllbGRfdmFsID09IHBsYWNlaG9sZGVyICAgIClcclxuXHRcdFx0XHRcdCkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcInJhZGlvXCI6XHJcblx0XHRcdFx0Y2FzZSBcImNoZWNrYm94XCI6XHJcblx0XHRcdFx0XHQvLyBuZXcgdmFsaWRhdGlvbiBzdHlsZSB0byBvbmx5IGNoZWNrIGRlcGVuZGVudCBmaWVsZFxyXG5cdFx0XHRcdFx0aWYgKGNvbmRSZXF1aXJlZCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIWZpZWxkLmF0dHIoJ2NoZWNrZWQnKSkge1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHRDaGVja2JveE11bHRpcGxlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8gb2xkIHZhbGlkYXRpb24gc3R5bGVcclxuXHRcdFx0XHRcdHZhciBmb3JtID0gZmllbGQuY2xvc2VzdChcImZvcm0sIC52YWxpZGF0aW9uRW5naW5lQ29udGFpbmVyXCIpO1xyXG5cdFx0XHRcdFx0dmFyIG5hbWUgPSBmaWVsZC5hdHRyKFwibmFtZVwiKTtcclxuXHRcdFx0XHRcdGlmIChmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPSdcIiArIG5hbWUgKyBcIiddOmNoZWNrZWRcIikuc2l6ZSgpID09IDApIHtcclxuXHRcdFx0XHRcdFx0aWYgKGZvcm0uZmluZChcImlucHV0W25hbWU9J1wiICsgbmFtZSArIFwiJ106dmlzaWJsZVwiKS5zaXplKCkgPT0gMSlcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0Q2hlY2tib3hlO1xyXG5cdFx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuYWxscnVsZXNbcnVsZXNbaV1dLmFsZXJ0VGV4dENoZWNrYm94TXVsdGlwbGU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBWYWxpZGF0ZSB0aGF0IDEgZnJvbSB0aGUgZ3JvdXAgZmllbGQgaXMgcmVxdWlyZWRcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfZ3JvdXBSZXF1aXJlZDogZnVuY3Rpb24oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblx0XHRcdHZhciBjbGFzc0dyb3VwID0gXCJbXCIrb3B0aW9ucy52YWxpZGF0ZUF0dHJpYnV0ZStcIio9XCIgK3J1bGVzW2kgKyAxXSArXCJdXCI7XHJcblx0XHRcdHZhciBpc1ZhbGlkID0gZmFsc2U7XHJcblx0XHRcdC8vIENoZWNrIGFsbCBmaWVsZHMgZnJvbSB0aGUgZ3JvdXBcclxuXHRcdFx0ZmllbGQuY2xvc2VzdChcImZvcm0sIC52YWxpZGF0aW9uRW5naW5lQ29udGFpbmVyXCIpLmZpbmQoY2xhc3NHcm91cCkuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGlmKCFtZXRob2RzLl9yZXF1aXJlZCgkKHRoaXMpLCBydWxlcywgaSwgb3B0aW9ucykpe1xyXG5cdFx0XHRcdFx0aXNWYWxpZCA9IHRydWU7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTsgXHJcblxyXG5cdFx0XHRpZighaXNWYWxpZCkge1xyXG5cdFx0ICByZXR1cm4gb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0O1xyXG5cdFx0fVxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBWYWxpZGF0ZSBydWxlc1xyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmaWVsZFxyXG5cdFx0KiBAcGFyYW0ge0FycmF5W1N0cmluZ119IHJ1bGVzXHJcblx0XHQqIEBwYXJhbSB7aW50fSBpIHJ1bGVzIGluZGV4XHJcblx0XHQqIEBwYXJhbSB7TWFwfVxyXG5cdFx0KiAgICAgICAgICAgIHVzZXIgb3B0aW9uc1xyXG5cdFx0KiBAcmV0dXJuIGFuIGVycm9yIHN0cmluZyBpZiB2YWxpZGF0aW9uIGZhaWxlZFxyXG5cdFx0Ki9cclxuXHRcdF9jdXN0b206IGZ1bmN0aW9uKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cdFx0XHR2YXIgY3VzdG9tUnVsZSA9IHJ1bGVzW2kgKyAxXTtcclxuXHRcdFx0dmFyIHJ1bGUgPSBvcHRpb25zLmFsbHJ1bGVzW2N1c3RvbVJ1bGVdO1xyXG5cdFx0XHR2YXIgZm47XHJcblx0XHRcdGlmKCFydWxlKSB7XHJcblx0XHRcdFx0YWxlcnQoXCJqcXY6Y3VzdG9tIHJ1bGUgbm90IGZvdW5kIC0gXCIrY3VzdG9tUnVsZSk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZihydWxlW1wicmVnZXhcIl0pIHtcclxuXHRcdFx0XHQgdmFyIGV4PXJ1bGUucmVnZXg7XHJcblx0XHRcdFx0XHRpZighZXgpIHtcclxuXHRcdFx0XHRcdFx0YWxlcnQoXCJqcXY6Y3VzdG9tIHJlZ2V4IG5vdCBmb3VuZCAtIFwiK2N1c3RvbVJ1bGUpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR2YXIgcGF0dGVybiA9IG5ldyBSZWdFeHAoZXgpO1xyXG5cclxuXHRcdFx0XHRcdGlmICghcGF0dGVybi50ZXN0KGZpZWxkLnZhbCgpKSkgcmV0dXJuIG9wdGlvbnMuYWxscnVsZXNbY3VzdG9tUnVsZV0uYWxlcnRUZXh0O1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdH0gZWxzZSBpZihydWxlW1wiZnVuY1wiXSkge1xyXG5cdFx0XHRcdGZuID0gcnVsZVtcImZ1bmNcIl07IFxyXG5cdFx0XHRcdCBcclxuXHRcdFx0XHRpZiAodHlwZW9mKGZuKSAhPT0gXCJmdW5jdGlvblwiKSB7XHJcblx0XHRcdFx0XHRhbGVydChcImpxdjpjdXN0b20gcGFyYW1ldGVyICdmdW5jdGlvbicgaXMgbm8gZnVuY3Rpb24gLSBcIitjdXN0b21SdWxlKTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQgXHJcblx0XHRcdFx0aWYgKCFmbihmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuYWxscnVsZXNbY3VzdG9tUnVsZV0uYWxlcnRUZXh0O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGFsZXJ0KFwianF2OmN1c3RvbSB0eXBlIG5vdCBhbGxvd2VkIFwiK2N1c3RvbVJ1bGUpO1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFZhbGlkYXRlIGN1c3RvbSBmdW5jdGlvbiBvdXRzaWRlIG9mIHRoZSBlbmdpbmUgc2NvcGVcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfZnVuY0NhbGw6IGZ1bmN0aW9uKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cdFx0XHR2YXIgZnVuY3Rpb25OYW1lID0gcnVsZXNbaSArIDFdO1xyXG5cdFx0XHR2YXIgZm47XHJcblx0XHRcdGlmKGZ1bmN0aW9uTmFtZS5pbmRleE9mKCcuJykgPi0xKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIG5hbWVzcGFjZXMgPSBmdW5jdGlvbk5hbWUuc3BsaXQoJy4nKTtcclxuXHRcdFx0XHR2YXIgc2NvcGUgPSB3aW5kb3c7XHJcblx0XHRcdFx0d2hpbGUobmFtZXNwYWNlcy5sZW5ndGgpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0c2NvcGUgPSBzY29wZVtuYW1lc3BhY2VzLnNoaWZ0KCldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRmbiA9IHNjb3BlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRmbiA9IHdpbmRvd1tmdW5jdGlvbk5hbWVdIHx8IG9wdGlvbnMuY3VzdG9tRnVuY3Rpb25zW2Z1bmN0aW9uTmFtZV07XHJcblx0XHRcdGlmICh0eXBlb2YoZm4pID09ICdmdW5jdGlvbicpXHJcblx0XHRcdFx0cmV0dXJuIGZuKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucyk7XHJcblxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBGaWVsZCBtYXRjaFxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmaWVsZFxyXG5cdFx0KiBAcGFyYW0ge0FycmF5W1N0cmluZ119IHJ1bGVzXHJcblx0XHQqIEBwYXJhbSB7aW50fSBpIHJ1bGVzIGluZGV4XHJcblx0XHQqIEBwYXJhbSB7TWFwfVxyXG5cdFx0KiAgICAgICAgICAgIHVzZXIgb3B0aW9uc1xyXG5cdFx0KiBAcmV0dXJuIGFuIGVycm9yIHN0cmluZyBpZiB2YWxpZGF0aW9uIGZhaWxlZFxyXG5cdFx0Ki9cclxuXHRcdF9lcXVhbHM6IGZ1bmN0aW9uKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cdFx0XHR2YXIgZXF1YWxzRmllbGQgPSBydWxlc1tpICsgMV07XHJcblxyXG5cdFx0XHRpZiAoZmllbGQudmFsKCkgIT0gJChcIiNcIiArIGVxdWFsc0ZpZWxkKS52YWwoKSlcclxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5hbGxydWxlcy5lcXVhbHMuYWxlcnRUZXh0O1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBDaGVjayB0aGUgbWF4aW11bSBzaXplIChpbiBjaGFyYWN0ZXJzKVxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmaWVsZFxyXG5cdFx0KiBAcGFyYW0ge0FycmF5W1N0cmluZ119IHJ1bGVzXHJcblx0XHQqIEBwYXJhbSB7aW50fSBpIHJ1bGVzIGluZGV4XHJcblx0XHQqIEBwYXJhbSB7TWFwfVxyXG5cdFx0KiAgICAgICAgICAgIHVzZXIgb3B0aW9uc1xyXG5cdFx0KiBAcmV0dXJuIGFuIGVycm9yIHN0cmluZyBpZiB2YWxpZGF0aW9uIGZhaWxlZFxyXG5cdFx0Ki9cclxuXHRcdF9tYXhTaXplOiBmdW5jdGlvbihmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpIHtcclxuXHRcdFx0dmFyIG1heCA9IHJ1bGVzW2kgKyAxXTtcclxuXHRcdFx0dmFyIGxlbiA9IGZpZWxkLnZhbCgpLmxlbmd0aDtcclxuXHJcblx0XHRcdGlmIChsZW4gPiBtYXgpIHtcclxuXHRcdFx0XHR2YXIgcnVsZSA9IG9wdGlvbnMuYWxscnVsZXMubWF4U2l6ZTtcclxuXHRcdFx0XHRyZXR1cm4gcnVsZS5hbGVydFRleHQgKyBtYXggKyBydWxlLmFsZXJ0VGV4dDI7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ2hlY2sgdGhlIG1pbmltdW0gc2l6ZSAoaW4gY2hhcmFjdGVycylcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfbWluU2l6ZTogZnVuY3Rpb24oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblx0XHRcdHZhciBtaW4gPSBydWxlc1tpICsgMV07XHJcblx0XHRcdHZhciBsZW4gPSBmaWVsZC52YWwoKS5sZW5ndGg7XHJcblxyXG5cdFx0XHRpZiAobGVuIDwgbWluKSB7XHJcblx0XHRcdFx0dmFyIHJ1bGUgPSBvcHRpb25zLmFsbHJ1bGVzLm1pblNpemU7XHJcblx0XHRcdFx0cmV0dXJuIHJ1bGUuYWxlcnRUZXh0ICsgbWluICsgcnVsZS5hbGVydFRleHQyO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENoZWNrIG51bWJlciBtaW5pbXVtIHZhbHVlXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gcnVsZXNcclxuXHRcdCogQHBhcmFtIHtpbnR9IGkgcnVsZXMgaW5kZXhcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gYW4gZXJyb3Igc3RyaW5nIGlmIHZhbGlkYXRpb24gZmFpbGVkXHJcblx0XHQqL1xyXG5cdFx0X21pbjogZnVuY3Rpb24oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblx0XHRcdHZhciBtaW4gPSBwYXJzZUZsb2F0KHJ1bGVzW2kgKyAxXSk7XHJcblx0XHRcdHZhciBsZW4gPSBwYXJzZUZsb2F0KGZpZWxkLnZhbCgpKTtcclxuXHJcblx0XHRcdGlmIChsZW4gPCBtaW4pIHtcclxuXHRcdFx0XHR2YXIgcnVsZSA9IG9wdGlvbnMuYWxscnVsZXMubWluO1xyXG5cdFx0XHRcdGlmIChydWxlLmFsZXJ0VGV4dDIpIHJldHVybiBydWxlLmFsZXJ0VGV4dCArIG1pbiArIHJ1bGUuYWxlcnRUZXh0MjtcclxuXHRcdFx0XHRyZXR1cm4gcnVsZS5hbGVydFRleHQgKyBtaW47XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ2hlY2sgbnVtYmVyIG1heGltdW0gdmFsdWVcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfbWF4OiBmdW5jdGlvbihmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpIHtcclxuXHRcdFx0dmFyIG1heCA9IHBhcnNlRmxvYXQocnVsZXNbaSArIDFdKTtcclxuXHRcdFx0dmFyIGxlbiA9IHBhcnNlRmxvYXQoZmllbGQudmFsKCkpO1xyXG5cclxuXHRcdFx0aWYgKGxlbiA+bWF4ICkge1xyXG5cdFx0XHRcdHZhciBydWxlID0gb3B0aW9ucy5hbGxydWxlcy5tYXg7XHJcblx0XHRcdFx0aWYgKHJ1bGUuYWxlcnRUZXh0MikgcmV0dXJuIHJ1bGUuYWxlcnRUZXh0ICsgbWF4ICsgcnVsZS5hbGVydFRleHQyO1xyXG5cdFx0XHRcdC8vb3JlZmFsbzogdG8gcmV2aWV3LCBhbHNvIGRvIHRoZSB0cmFuc2xhdGlvbnNcclxuXHRcdFx0XHRyZXR1cm4gcnVsZS5hbGVydFRleHQgKyBtYXg7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ2hlY2tzIGRhdGUgaXMgaW4gdGhlIHBhc3RcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfcGFzdDogZnVuY3Rpb24oZm9ybSwgZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblxyXG5cdFx0XHR2YXIgcD1ydWxlc1tpICsgMV07XHJcblx0XHRcdHZhciBmaWVsZEFsdCA9ICQoZm9ybS5maW5kKFwiaW5wdXRbbmFtZT0nXCIgKyBwLnJlcGxhY2UoL14jKy8sICcnKSArIFwiJ11cIikpO1xyXG5cdFx0XHR2YXIgcGRhdGU7XHJcblxyXG5cdFx0XHRpZiAocC50b0xvd2VyQ2FzZSgpID09IFwibm93XCIpIHtcclxuXHRcdFx0XHRwZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRcdH0gZWxzZSBpZiAodW5kZWZpbmVkICE9IGZpZWxkQWx0LnZhbCgpKSB7XHJcblx0XHRcdFx0aWYgKGZpZWxkQWx0LmlzKFwiOmRpc2FibGVkXCIpKVxyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdHBkYXRlID0gbWV0aG9kcy5fcGFyc2VEYXRlKGZpZWxkQWx0LnZhbCgpKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRwZGF0ZSA9IG1ldGhvZHMuX3BhcnNlRGF0ZShwKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR2YXIgdmRhdGUgPSBtZXRob2RzLl9wYXJzZURhdGUoZmllbGQudmFsKCkpO1xyXG5cclxuXHRcdFx0aWYgKHZkYXRlID4gcGRhdGUgKSB7XHJcblx0XHRcdFx0dmFyIHJ1bGUgPSBvcHRpb25zLmFsbHJ1bGVzLnBhc3Q7XHJcblx0XHRcdFx0aWYgKHJ1bGUuYWxlcnRUZXh0MikgcmV0dXJuIHJ1bGUuYWxlcnRUZXh0ICsgbWV0aG9kcy5fZGF0ZVRvU3RyaW5nKHBkYXRlKSArIHJ1bGUuYWxlcnRUZXh0MjtcclxuXHRcdFx0XHRyZXR1cm4gcnVsZS5hbGVydFRleHQgKyBtZXRob2RzLl9kYXRlVG9TdHJpbmcocGRhdGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENoZWNrcyBkYXRlIGlzIGluIHRoZSBmdXR1cmVcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfZnV0dXJlOiBmdW5jdGlvbihmb3JtLCBmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpIHtcclxuXHJcblx0XHRcdHZhciBwPXJ1bGVzW2kgKyAxXTtcclxuXHRcdFx0dmFyIGZpZWxkQWx0ID0gJChmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPSdcIiArIHAucmVwbGFjZSgvXiMrLywgJycpICsgXCInXVwiKSk7XHJcblx0XHRcdHZhciBwZGF0ZTtcclxuXHJcblx0XHRcdGlmIChwLnRvTG93ZXJDYXNlKCkgPT0gXCJub3dcIikge1xyXG5cdFx0XHRcdHBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdFx0fSBlbHNlIGlmICh1bmRlZmluZWQgIT0gZmllbGRBbHQudmFsKCkpIHtcclxuXHRcdFx0XHRpZiAoZmllbGRBbHQuaXMoXCI6ZGlzYWJsZWRcIikpXHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0cGRhdGUgPSBtZXRob2RzLl9wYXJzZURhdGUoZmllbGRBbHQudmFsKCkpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHBkYXRlID0gbWV0aG9kcy5fcGFyc2VEYXRlKHApO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZhciB2ZGF0ZSA9IG1ldGhvZHMuX3BhcnNlRGF0ZShmaWVsZC52YWwoKSk7XHJcblxyXG5cdFx0XHRpZiAodmRhdGUgPCBwZGF0ZSApIHtcclxuXHRcdFx0XHR2YXIgcnVsZSA9IG9wdGlvbnMuYWxscnVsZXMuZnV0dXJlO1xyXG5cdFx0XHRcdGlmIChydWxlLmFsZXJ0VGV4dDIpXHJcblx0XHRcdFx0XHRyZXR1cm4gcnVsZS5hbGVydFRleHQgKyBtZXRob2RzLl9kYXRlVG9TdHJpbmcocGRhdGUpICsgcnVsZS5hbGVydFRleHQyO1xyXG5cdFx0XHRcdHJldHVybiBydWxlLmFsZXJ0VGV4dCArIG1ldGhvZHMuX2RhdGVUb1N0cmluZyhwZGF0ZSk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ2hlY2tzIGlmIHZhbGlkIGRhdGVcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtzdHJpbmd9IGRhdGUgc3RyaW5nXHJcblx0XHQqIEByZXR1cm4gYSBib29sIGJhc2VkIG9uIGRldGVybWluYXRpb24gb2YgdmFsaWQgZGF0ZVxyXG5cdFx0Ki9cclxuXHRcdF9pc0RhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG5cdFx0XHR2YXIgZGF0ZVJlZ0V4ID0gbmV3IFJlZ0V4cCgvXlxcZHs0fVtcXC9cXC1dKDA/WzEtOV18MVswMTJdKVtcXC9cXC1dKDA/WzEtOV18WzEyXVswLTldfDNbMDFdKSR8Xig/Oig/Oig/OjA/WzEzNTc4XXwxWzAyXSkoXFwvfC0pMzEpfCg/Oig/OjA/WzEsMy05XXwxWzAtMl0pKFxcL3wtKSg/OjI5fDMwKSkpKFxcL3wtKSg/OlsxLTldXFxkXFxkXFxkfFxcZFsxLTldXFxkXFxkfFxcZFxcZFsxLTldXFxkfFxcZFxcZFxcZFsxLTldKSR8Xig/Oig/OjA/WzEtOV18MVswLTJdKShcXC98LSkoPzowP1sxLTldfDFcXGR8MlswLThdKSkoXFwvfC0pKD86WzEtOV1cXGRcXGRcXGR8XFxkWzEtOV1cXGRcXGR8XFxkXFxkWzEtOV1cXGR8XFxkXFxkXFxkWzEtOV0pJHxeKDA/MihcXC98LSkyOSkoXFwvfC0pKD86KD86MFs0OF0wMHxbMTM1NzldWzI2XTAwfFsyNDY4XVswNDhdMDApfCg/OlxcZFxcZCk/KD86MFs0OF18WzI0NjhdWzA0OF18WzEzNTc5XVsyNl0pKSQvKTtcclxuXHRcdFx0cmV0dXJuIGRhdGVSZWdFeC50ZXN0KHZhbHVlKTtcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ2hlY2tzIGlmIHZhbGlkIGRhdGUgdGltZVxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge3N0cmluZ30gZGF0ZSBzdHJpbmdcclxuXHRcdCogQHJldHVybiBhIGJvb2wgYmFzZWQgb24gZGV0ZXJtaW5hdGlvbiBvZiB2YWxpZCBkYXRlIHRpbWVcclxuXHRcdCovXHJcblx0XHRfaXNEYXRlVGltZTogZnVuY3Rpb24gKHZhbHVlKXtcclxuXHRcdFx0dmFyIGRhdGVUaW1lUmVnRXggPSBuZXcgUmVnRXhwKC9eXFxkezR9W1xcL1xcLV0oMD9bMS05XXwxWzAxMl0pW1xcL1xcLV0oMD9bMS05XXxbMTJdWzAtOV18M1swMV0pXFxzKygxWzAxMl18MD9bMS05XSl7MX06KDA/WzEtNV18WzAtNl1bMC05XSl7MX06KDA/WzAtNl18WzAtNl1bMC05XSl7MX1cXHMrKGFtfHBtfEFNfFBNKXsxfSR8Xig/Oig/Oig/OjA/WzEzNTc4XXwxWzAyXSkoXFwvfC0pMzEpfCg/Oig/OjA/WzEsMy05XXwxWzAtMl0pKFxcL3wtKSg/OjI5fDMwKSkpKFxcL3wtKSg/OlsxLTldXFxkXFxkXFxkfFxcZFsxLTldXFxkXFxkfFxcZFxcZFsxLTldXFxkfFxcZFxcZFxcZFsxLTldKSR8XigoMVswMTJdfDA/WzEtOV0pezF9XFwvKDA/WzEtOV18WzEyXVswLTldfDNbMDFdKXsxfVxcL1xcZHsyLDR9XFxzKygxWzAxMl18MD9bMS05XSl7MX06KDA/WzEtNV18WzAtNl1bMC05XSl7MX06KDA/WzAtNl18WzAtNl1bMC05XSl7MX1cXHMrKGFtfHBtfEFNfFBNKXsxfSkkLyk7XHJcblx0XHRcdHJldHVybiBkYXRlVGltZVJlZ0V4LnRlc3QodmFsdWUpO1xyXG5cdFx0fSxcclxuXHRcdC8vQ2hlY2tzIGlmIHRoZSBzdGFydCBkYXRlIGlzIGJlZm9yZSB0aGUgZW5kIGRhdGVcclxuXHRcdC8vcmV0dXJucyB0cnVlIGlmIGVuZCBpcyBsYXRlciB0aGFuIHN0YXJ0XHJcblx0XHRfZGF0ZUNvbXBhcmU6IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XHJcblx0XHRcdHJldHVybiAobmV3IERhdGUoc3RhcnQudG9TdHJpbmcoKSkgPCBuZXcgRGF0ZShlbmQudG9TdHJpbmcoKSkpO1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0KiBDaGVja3MgZGF0ZSByYW5nZVxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmaXJzdCBmaWVsZCBuYW1lXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IHNlY29uZCBmaWVsZCBuYW1lXHJcblx0XHQqIEByZXR1cm4gYW4gZXJyb3Igc3RyaW5nIGlmIHZhbGlkYXRpb24gZmFpbGVkXHJcblx0XHQqL1xyXG5cdFx0X2RhdGVSYW5nZTogZnVuY3Rpb24gKGZpZWxkLCBydWxlcywgaSwgb3B0aW9ucykge1xyXG5cdFx0XHQvL2FyZSBub3QgYm90aCBwb3B1bGF0ZWRcclxuXHRcdFx0aWYgKCghb3B0aW9ucy5maXJzdE9mR3JvdXBbMF0udmFsdWUgJiYgb3B0aW9ucy5zZWNvbmRPZkdyb3VwWzBdLnZhbHVlKSB8fCAob3B0aW9ucy5maXJzdE9mR3JvdXBbMF0udmFsdWUgJiYgIW9wdGlvbnMuc2Vjb25kT2ZHcm91cFswXS52YWx1ZSkpIHtcclxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0ICsgb3B0aW9ucy5hbGxydWxlc1tydWxlc1tpXV0uYWxlcnRUZXh0MjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly9hcmUgbm90IGJvdGggZGF0ZXNcclxuXHRcdFx0aWYgKCFtZXRob2RzLl9pc0RhdGUob3B0aW9ucy5maXJzdE9mR3JvdXBbMF0udmFsdWUpIHx8ICFtZXRob2RzLl9pc0RhdGUob3B0aW9ucy5zZWNvbmRPZkdyb3VwWzBdLnZhbHVlKSkge1xyXG5cdFx0XHRcdHJldHVybiBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHQgKyBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHQyO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvL2FyZSBib3RoIGRhdGVzIGJ1dCByYW5nZSBpcyBvZmZcclxuXHRcdFx0aWYgKCFtZXRob2RzLl9kYXRlQ29tcGFyZShvcHRpb25zLmZpcnN0T2ZHcm91cFswXS52YWx1ZSwgb3B0aW9ucy5zZWNvbmRPZkdyb3VwWzBdLnZhbHVlKSkge1xyXG5cdFx0XHRcdHJldHVybiBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHQgKyBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHQyO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENoZWNrcyBkYXRlIHRpbWUgcmFuZ2VcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmlyc3QgZmllbGQgbmFtZVxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBzZWNvbmQgZmllbGQgbmFtZVxyXG5cdFx0KiBAcmV0dXJuIGFuIGVycm9yIHN0cmluZyBpZiB2YWxpZGF0aW9uIGZhaWxlZFxyXG5cdFx0Ki9cclxuXHRcdF9kYXRlVGltZVJhbmdlOiBmdW5jdGlvbiAoZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblx0XHRcdC8vYXJlIG5vdCBib3RoIHBvcHVsYXRlZFxyXG5cdFx0XHRpZiAoKCFvcHRpb25zLmZpcnN0T2ZHcm91cFswXS52YWx1ZSAmJiBvcHRpb25zLnNlY29uZE9mR3JvdXBbMF0udmFsdWUpIHx8IChvcHRpb25zLmZpcnN0T2ZHcm91cFswXS52YWx1ZSAmJiAhb3B0aW9ucy5zZWNvbmRPZkdyb3VwWzBdLnZhbHVlKSkge1xyXG5cdFx0XHRcdHJldHVybiBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHQgKyBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHQyO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vYXJlIG5vdCBib3RoIGRhdGVzXHJcblx0XHRcdGlmICghbWV0aG9kcy5faXNEYXRlVGltZShvcHRpb25zLmZpcnN0T2ZHcm91cFswXS52YWx1ZSkgfHwgIW1ldGhvZHMuX2lzRGF0ZVRpbWUob3B0aW9ucy5zZWNvbmRPZkdyb3VwWzBdLnZhbHVlKSkge1xyXG5cdFx0XHRcdHJldHVybiBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHQgKyBvcHRpb25zLmFsbHJ1bGVzW3J1bGVzW2ldXS5hbGVydFRleHQyO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vYXJlIGJvdGggZGF0ZXMgYnV0IHJhbmdlIGlzIG9mZlxyXG5cdFx0XHRpZiAoIW1ldGhvZHMuX2RhdGVDb21wYXJlKG9wdGlvbnMuZmlyc3RPZkdyb3VwWzBdLnZhbHVlLCBvcHRpb25zLnNlY29uZE9mR3JvdXBbMF0udmFsdWUpKSB7XHJcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuYWxscnVsZXNbcnVsZXNbaV1dLmFsZXJ0VGV4dCArIG9wdGlvbnMuYWxscnVsZXNbcnVsZXNbaV1dLmFsZXJ0VGV4dDI7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogTWF4IG51bWJlciBvZiBjaGVja2JveCBzZWxlY3RlZFxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmaWVsZFxyXG5cdFx0KiBAcGFyYW0ge0FycmF5W1N0cmluZ119IHJ1bGVzXHJcblx0XHQqIEBwYXJhbSB7aW50fSBpIHJ1bGVzIGluZGV4XHJcblx0XHQqIEBwYXJhbSB7TWFwfVxyXG5cdFx0KiAgICAgICAgICAgIHVzZXIgb3B0aW9uc1xyXG5cdFx0KiBAcmV0dXJuIGFuIGVycm9yIHN0cmluZyBpZiB2YWxpZGF0aW9uIGZhaWxlZFxyXG5cdFx0Ki9cclxuXHRcdF9tYXhDaGVja2JveDogZnVuY3Rpb24oZm9ybSwgZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblxyXG5cdFx0XHR2YXIgbmJDaGVjayA9IHJ1bGVzW2kgKyAxXTtcclxuXHRcdFx0dmFyIGdyb3VwbmFtZSA9IGZpZWxkLmF0dHIoXCJuYW1lXCIpO1xyXG5cdFx0XHR2YXIgZ3JvdXBTaXplID0gZm9ybS5maW5kKFwiaW5wdXRbbmFtZT0nXCIgKyBncm91cG5hbWUgKyBcIiddOmNoZWNrZWRcIikuc2l6ZSgpO1xyXG5cdFx0XHRpZiAoZ3JvdXBTaXplID4gbmJDaGVjaykge1xyXG5cdFx0XHRcdG9wdGlvbnMuc2hvd0Fycm93ID0gZmFsc2U7XHJcblx0XHRcdFx0aWYgKG9wdGlvbnMuYWxscnVsZXMubWF4Q2hlY2tib3guYWxlcnRUZXh0MilcclxuXHRcdFx0XHRcdCByZXR1cm4gb3B0aW9ucy5hbGxydWxlcy5tYXhDaGVja2JveC5hbGVydFRleHQgKyBcIiBcIiArIG5iQ2hlY2sgKyBcIiBcIiArIG9wdGlvbnMuYWxscnVsZXMubWF4Q2hlY2tib3guYWxlcnRUZXh0MjtcclxuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5hbGxydWxlcy5tYXhDaGVja2JveC5hbGVydFRleHQ7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogTWluIG51bWJlciBvZiBjaGVja2JveCBzZWxlY3RlZFxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmaWVsZFxyXG5cdFx0KiBAcGFyYW0ge0FycmF5W1N0cmluZ119IHJ1bGVzXHJcblx0XHQqIEBwYXJhbSB7aW50fSBpIHJ1bGVzIGluZGV4XHJcblx0XHQqIEBwYXJhbSB7TWFwfVxyXG5cdFx0KiAgICAgICAgICAgIHVzZXIgb3B0aW9uc1xyXG5cdFx0KiBAcmV0dXJuIGFuIGVycm9yIHN0cmluZyBpZiB2YWxpZGF0aW9uIGZhaWxlZFxyXG5cdFx0Ki9cclxuXHRcdF9taW5DaGVja2JveDogZnVuY3Rpb24oZm9ybSwgZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblxyXG5cdFx0XHR2YXIgbmJDaGVjayA9IHJ1bGVzW2kgKyAxXTtcclxuXHRcdFx0dmFyIGdyb3VwbmFtZSA9IGZpZWxkLmF0dHIoXCJuYW1lXCIpO1xyXG5cdFx0XHR2YXIgZ3JvdXBTaXplID0gZm9ybS5maW5kKFwiaW5wdXRbbmFtZT0nXCIgKyBncm91cG5hbWUgKyBcIiddOmNoZWNrZWRcIikuc2l6ZSgpO1xyXG5cdFx0XHRpZiAoZ3JvdXBTaXplIDwgbmJDaGVjaykge1xyXG5cdFx0XHRcdG9wdGlvbnMuc2hvd0Fycm93ID0gZmFsc2U7XHJcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuYWxscnVsZXMubWluQ2hlY2tib3guYWxlcnRUZXh0ICsgXCIgXCIgKyBuYkNoZWNrICsgXCIgXCIgKyBvcHRpb25zLmFsbHJ1bGVzLm1pbkNoZWNrYm94LmFsZXJ0VGV4dDI7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ2hlY2tzIHRoYXQgaXQgaXMgYSB2YWxpZCBjcmVkaXQgY2FyZCBudW1iZXIgYWNjb3JkaW5nIHRvIHRoZVxyXG5cdFx0KiBMdWhuIGNoZWNrc3VtIGFsZ29yaXRobS5cclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBydWxlc1xyXG5cdFx0KiBAcGFyYW0ge2ludH0gaSBydWxlcyBpbmRleFxyXG5cdFx0KiBAcGFyYW0ge01hcH1cclxuXHRcdCogICAgICAgICAgICB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfY3JlZGl0Q2FyZDogZnVuY3Rpb24oZmllbGQsIHJ1bGVzLCBpLCBvcHRpb25zKSB7XHJcblx0XHRcdC8vc3BhY2VzIGFuZCBkYXNoZXMgbWF5IGJlIHZhbGlkIGNoYXJhY3RlcnMsIGJ1dCBtdXN0IGJlIHN0cmlwcGVkIHRvIGNhbGN1bGF0ZSB0aGUgY2hlY2tzdW0uXHJcblx0XHRcdHZhciB2YWxpZCA9IGZhbHNlLCBjYXJkTnVtYmVyID0gZmllbGQudmFsKCkucmVwbGFjZSgvICsvZywgJycpLnJlcGxhY2UoLy0rL2csICcnKTtcclxuXHJcblx0XHRcdHZhciBudW1EaWdpdHMgPSBjYXJkTnVtYmVyLmxlbmd0aDtcclxuXHRcdFx0aWYgKG51bURpZ2l0cyA+PSAxNCAmJiBudW1EaWdpdHMgPD0gMTYgJiYgcGFyc2VJbnQoY2FyZE51bWJlcikgPiAwKSB7XHJcblxyXG5cdFx0XHRcdHZhciBzdW0gPSAwLCBpID0gbnVtRGlnaXRzIC0gMSwgcG9zID0gMSwgZGlnaXQsIGx1aG4gPSBuZXcgU3RyaW5nKCk7XHJcblx0XHRcdFx0ZG8ge1xyXG5cdFx0XHRcdFx0ZGlnaXQgPSBwYXJzZUludChjYXJkTnVtYmVyLmNoYXJBdChpKSk7XHJcblx0XHRcdFx0XHRsdWhuICs9IChwb3MrKyAlIDIgPT0gMCkgPyBkaWdpdCAqIDIgOiBkaWdpdDtcclxuXHRcdFx0XHR9IHdoaWxlICgtLWkgPj0gMClcclxuXHJcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGx1aG4ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdHN1bSArPSBwYXJzZUludChsdWhuLmNoYXJBdChpKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHZhbGlkID0gc3VtICUgMTAgPT0gMDtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIXZhbGlkKSByZXR1cm4gb3B0aW9ucy5hbGxydWxlcy5jcmVkaXRDYXJkLmFsZXJ0VGV4dDtcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQWpheCBmaWVsZCB2YWxpZGF0aW9uXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gcnVsZXNcclxuXHRcdCogQHBhcmFtIHtpbnR9IGkgcnVsZXMgaW5kZXhcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgdXNlciBvcHRpb25zXHJcblx0XHQqIEByZXR1cm4gbm90aGluZyEgdGhlIGFqYXggdmFsaWRhdG9yIGhhbmRsZXMgdGhlIHByb21wdHMgaXRzZWxmXHJcblx0XHQqL1xyXG5cdFx0IF9hamF4OiBmdW5jdGlvbihmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpIHtcclxuXHJcblx0XHRcdCB2YXIgZXJyb3JTZWxlY3RvciA9IHJ1bGVzW2kgKyAxXTtcclxuXHRcdFx0IHZhciBydWxlID0gb3B0aW9ucy5hbGxydWxlc1tlcnJvclNlbGVjdG9yXTtcclxuXHRcdFx0IHZhciBleHRyYURhdGEgPSBydWxlLmV4dHJhRGF0YTtcclxuXHRcdFx0IHZhciBleHRyYURhdGFEeW5hbWljID0gcnVsZS5leHRyYURhdGFEeW5hbWljO1xyXG5cdFx0XHQgdmFyIGRhdGEgPSB7XHJcblx0XHRcdFx0XCJmaWVsZElkXCIgOiBmaWVsZC5hdHRyKFwiaWRcIiksXHJcblx0XHRcdFx0XCJmaWVsZFZhbHVlXCIgOiBmaWVsZC52YWwoKVxyXG5cdFx0XHQgfTtcclxuXHJcblx0XHRcdCBpZiAodHlwZW9mIGV4dHJhRGF0YSA9PT0gXCJvYmplY3RcIikge1xyXG5cdFx0XHRcdCQuZXh0ZW5kKGRhdGEsIGV4dHJhRGF0YSk7XHJcblx0XHRcdCB9IGVsc2UgaWYgKHR5cGVvZiBleHRyYURhdGEgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHR2YXIgdGVtcERhdGEgPSBleHRyYURhdGEuc3BsaXQoXCImXCIpO1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0ZW1wRGF0YS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0dmFyIHZhbHVlcyA9IHRlbXBEYXRhW2ldLnNwbGl0KFwiPVwiKTtcclxuXHRcdFx0XHRcdGlmICh2YWx1ZXNbMF0gJiYgdmFsdWVzWzBdKSB7XHJcblx0XHRcdFx0XHRcdGRhdGFbdmFsdWVzWzBdXSA9IHZhbHVlc1sxXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdCB9XHJcblxyXG5cdFx0XHQgaWYgKGV4dHJhRGF0YUR5bmFtaWMpIHtcclxuXHRcdFx0XHQgdmFyIHRtcERhdGEgPSBbXTtcclxuXHRcdFx0XHQgdmFyIGRvbUlkcyA9IFN0cmluZyhleHRyYURhdGFEeW5hbWljKS5zcGxpdChcIixcIik7XHJcblx0XHRcdFx0IGZvciAodmFyIGkgPSAwOyBpIDwgZG9tSWRzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHQgdmFyIGlkID0gZG9tSWRzW2ldO1xyXG5cdFx0XHRcdFx0IGlmICgkKGlkKS5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0IHZhciBpbnB1dFZhbHVlID0gZmllbGQuY2xvc2VzdChcImZvcm0sIC52YWxpZGF0aW9uRW5naW5lQ29udGFpbmVyXCIpLmZpbmQoaWQpLnZhbCgpO1xyXG5cdFx0XHRcdFx0XHQgdmFyIGtleVZhbHVlID0gaWQucmVwbGFjZSgnIycsICcnKSArICc9JyArIGVzY2FwZShpbnB1dFZhbHVlKTtcclxuXHRcdFx0XHRcdFx0IGRhdGFbaWQucmVwbGFjZSgnIycsICcnKV0gPSBpbnB1dFZhbHVlO1xyXG5cdFx0XHRcdFx0IH1cclxuXHRcdFx0XHQgfVxyXG5cdFx0XHQgfVxyXG5cdFx0XHQgXHJcblx0XHRcdCAvLyBJZiBhIGZpZWxkIGNoYW5nZSBldmVudCB0cmlnZ2VyZWQgdGhpcyB3ZSB3YW50IHRvIGNsZWFyIHRoZSBjYWNoZSBmb3IgdGhpcyBJRFxyXG5cdFx0XHQgaWYgKG9wdGlvbnMuZXZlbnRUcmlnZ2VyID09IFwiZmllbGRcIikge1xyXG5cdFx0XHRcdGRlbGV0ZShvcHRpb25zLmFqYXhWYWxpZENhY2hlW2ZpZWxkLmF0dHIoXCJpZFwiKV0pO1xyXG5cdFx0XHQgfVxyXG5cclxuXHRcdFx0IC8vIElmIHRoZXJlIGlzIGFuIGVycm9yIG9yIGlmIHRoZSB0aGUgZmllbGQgaXMgYWxyZWFkeSB2YWxpZGF0ZWQsIGRvIG5vdCByZS1leGVjdXRlIEFKQVhcclxuXHRcdFx0IGlmICghb3B0aW9ucy5pc0Vycm9yICYmICFtZXRob2RzLl9jaGVja0FqYXhGaWVsZFN0YXR1cyhmaWVsZC5hdHRyKFwiaWRcIiksIG9wdGlvbnMpKSB7XHJcblx0XHRcdFx0ICQuYWpheCh7XHJcblx0XHRcdFx0XHQgdHlwZTogb3B0aW9ucy5hamF4Rm9ybVZhbGlkYXRpb25NZXRob2QsXHJcblx0XHRcdFx0XHQgdXJsOiBydWxlLnVybCxcclxuXHRcdFx0XHRcdCBjYWNoZTogZmFsc2UsXHJcblx0XHRcdFx0XHQgZGF0YVR5cGU6IFwianNvblwiLFxyXG5cdFx0XHRcdFx0IGRhdGE6IGRhdGEsXHJcblx0XHRcdFx0XHQgZmllbGQ6IGZpZWxkLFxyXG5cdFx0XHRcdFx0IHJ1bGU6IHJ1bGUsXHJcblx0XHRcdFx0XHQgbWV0aG9kczogbWV0aG9kcyxcclxuXHRcdFx0XHRcdCBvcHRpb25zOiBvcHRpb25zLFxyXG5cdFx0XHRcdFx0IGJlZm9yZVNlbmQ6IGZ1bmN0aW9uKCkge30sXHJcblx0XHRcdFx0XHQgZXJyb3I6IGZ1bmN0aW9uKGRhdGEsIHRyYW5zcG9ydCkge1xyXG5cdFx0XHRcdFx0XHQgbWV0aG9kcy5fYWpheEVycm9yKGRhdGEsIHRyYW5zcG9ydCk7XHJcblx0XHRcdFx0XHQgfSxcclxuXHRcdFx0XHRcdCBzdWNjZXNzOiBmdW5jdGlvbihqc29uKSB7XHJcblxyXG5cdFx0XHRcdFx0XHQgLy8gYXN5bmNocm9ub3VzbHkgY2FsbGVkIG9uIHN1Y2Nlc3MsIGRhdGEgaXMgdGhlIGpzb24gYW5zd2VyIGZyb20gdGhlIHNlcnZlclxyXG5cdFx0XHRcdFx0XHQgdmFyIGVycm9yRmllbGRJZCA9IGpzb25bMF07XHJcblx0XHRcdFx0XHRcdCAvL3ZhciBlcnJvckZpZWxkID0gJCgkKFwiI1wiICsgZXJyb3JGaWVsZElkKVswXSk7XHJcblx0XHRcdFx0XHRcdCB2YXIgZXJyb3JGaWVsZCA9ICQoXCIjXCIrIGVycm9yRmllbGRJZCkuZXEoMCk7XHJcblxyXG5cdFx0XHRcdFx0XHQgLy8gbWFrZSBzdXJlIHdlIGZvdW5kIHRoZSBlbGVtZW50XHJcblx0XHRcdFx0XHRcdCBpZiAoZXJyb3JGaWVsZC5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRcdFx0XHRcdCB2YXIgc3RhdHVzID0ganNvblsxXTtcclxuXHRcdFx0XHRcdFx0XHQgLy8gcmVhZCB0aGUgb3B0aW9uYWwgbXNnIGZyb20gdGhlIHNlcnZlclxyXG5cdFx0XHRcdFx0XHRcdCB2YXIgbXNnID0ganNvblsyXTtcclxuXHRcdFx0XHRcdFx0XHQgaWYgKCFzdGF0dXMpIHtcclxuXHRcdFx0XHRcdFx0XHRcdCAvLyBIb3VzdG9uIHdlIGdvdCBhIHByb2JsZW0gLSBkaXNwbGF5IGFuIHJlZCBwcm9tcHRcclxuXHRcdFx0XHRcdFx0XHRcdCBvcHRpb25zLmFqYXhWYWxpZENhY2hlW2Vycm9yRmllbGRJZF0gPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0XHRcdCBvcHRpb25zLmlzRXJyb3IgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdCAvLyByZXNvbHZlIHRoZSBtc2cgcHJvbXB0XHJcblx0XHRcdFx0XHRcdFx0XHQgaWYobXNnKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdCBpZiAob3B0aW9ucy5hbGxydWxlc1ttc2ddKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0IHZhciB0eHQgPSBvcHRpb25zLmFsbHJ1bGVzW21zZ10uYWxlcnRUZXh0O1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCBpZiAodHh0KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtc2cgPSB0eHQ7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQgfVxyXG5cdFx0XHRcdFx0XHRcdFx0IH1cclxuXHRcdFx0XHRcdFx0XHRcdCBlbHNlXHJcblx0XHRcdFx0XHRcdFx0XHRcdG1zZyA9IHJ1bGUuYWxlcnRUZXh0O1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdCBpZiAob3B0aW9ucy5zaG93UHJvbXB0cykgbWV0aG9kcy5fc2hvd1Byb21wdChlcnJvckZpZWxkLCBtc2csIFwiXCIsIHRydWUsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdFx0XHRcdCB9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0IG9wdGlvbnMuYWpheFZhbGlkQ2FjaGVbZXJyb3JGaWVsZElkXSA9IHRydWU7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0IC8vIHJlc29sdmVzIHRoZSBtc2cgcHJvbXB0XHJcblx0XHRcdFx0XHRcdFx0XHQgaWYobXNnKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdCBpZiAob3B0aW9ucy5hbGxydWxlc1ttc2ddKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0IHZhciB0eHQgPSBvcHRpb25zLmFsbHJ1bGVzW21zZ10uYWxlcnRUZXh0T2s7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0IGlmICh0eHQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1zZyA9IHR4dDtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdCB9XHJcblx0XHRcdFx0XHRcdFx0XHQgfVxyXG5cdFx0XHRcdFx0XHRcdFx0IGVsc2VcclxuXHRcdFx0XHRcdFx0XHRcdCBtc2cgPSBydWxlLmFsZXJ0VGV4dE9rO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdCBpZiAob3B0aW9ucy5zaG93UHJvbXB0cykge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQgLy8gc2VlIGlmIHdlIHNob3VsZCBkaXNwbGF5IGEgZ3JlZW4gcHJvbXB0XHJcblx0XHRcdFx0XHRcdFx0XHRcdCBpZiAobXNnKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1ldGhvZHMuX3Nob3dQcm9tcHQoZXJyb3JGaWVsZCwgbXNnLCBcInBhc3NcIiwgdHJ1ZSwgb3B0aW9ucyk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdCBlbHNlXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWV0aG9kcy5fY2xvc2VQcm9tcHQoZXJyb3JGaWVsZCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRcdCAvLyBJZiBhIHN1Ym1pdCBmb3JtIHRyaWdnZXJlZCB0aGlzLCB3ZSB3YW50IHRvIHJlLXN1Ym1pdCB0aGUgZm9ybVxyXG5cdFx0XHRcdFx0XHRcdFx0IGlmIChvcHRpb25zLmV2ZW50VHJpZ2dlciA9PSBcInN1Ym1pdFwiKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRmaWVsZC5jbG9zZXN0KFwiZm9ybVwiKS5zdWJtaXQoKTtcclxuXHRcdFx0XHRcdFx0XHQgfVxyXG5cdFx0XHRcdFx0XHQgfVxyXG5cdFx0XHRcdFx0XHQgZXJyb3JGaWVsZC50cmlnZ2VyKFwianF2LmZpZWxkLnJlc3VsdFwiLCBbZXJyb3JGaWVsZCwgb3B0aW9ucy5pc0Vycm9yLCBtc2ddKTtcclxuXHRcdFx0XHRcdCB9XHJcblx0XHRcdFx0IH0pO1xyXG5cdFx0XHRcdCBcclxuXHRcdFx0XHQgcmV0dXJuIHJ1bGUuYWxlcnRUZXh0TG9hZDtcclxuXHRcdFx0IH1cclxuXHRcdCB9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENvbW1vbiBtZXRob2QgdG8gaGFuZGxlIGFqYXggZXJyb3JzXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcblx0XHQqIEBwYXJhbSB7T2JqZWN0fSB0cmFuc3BvcnRcclxuXHRcdCovXHJcblx0XHRfYWpheEVycm9yOiBmdW5jdGlvbihkYXRhLCB0cmFuc3BvcnQpIHtcclxuXHRcdFx0aWYoZGF0YS5zdGF0dXMgPT0gMCAmJiB0cmFuc3BvcnQgPT0gbnVsbClcclxuXHRcdFx0XHRhbGVydChcIlRoZSBwYWdlIGlzIG5vdCBzZXJ2ZWQgZnJvbSBhIHNlcnZlciEgYWpheCBjYWxsIGZhaWxlZFwiKTtcclxuXHRcdFx0ZWxzZSBpZih0eXBlb2YgY29uc29sZSAhPSBcInVuZGVmaW5lZFwiKVxyXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiQWpheCBlcnJvcjogXCIgKyBkYXRhLnN0YXR1cyArIFwiIFwiICsgdHJhbnNwb3J0KTtcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogZGF0ZSAtPiBzdHJpbmdcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtIHtPYmplY3R9IGRhdGVcclxuXHRcdCovXHJcblx0XHRfZGF0ZVRvU3RyaW5nOiBmdW5jdGlvbihkYXRlKSB7XHJcblx0XHRcdHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkrXCItXCIrKGRhdGUuZ2V0TW9udGgoKSsxKStcIi1cIitkYXRlLmdldERhdGUoKTtcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogUGFyc2VzIGFuIElTTyBkYXRlXHJcblx0XHQqIEBwYXJhbSB7U3RyaW5nfSBkXHJcblx0XHQqL1xyXG5cdFx0X3BhcnNlRGF0ZTogZnVuY3Rpb24oZCkge1xyXG5cclxuXHRcdFx0dmFyIGRhdGVQYXJ0cyA9IGQuc3BsaXQoXCItXCIpO1xyXG5cdFx0XHRpZihkYXRlUGFydHM9PWQpXHJcblx0XHRcdFx0ZGF0ZVBhcnRzID0gZC5zcGxpdChcIi9cIik7XHJcblx0XHRcdGlmKGRhdGVQYXJ0cz09ZCkge1xyXG5cdFx0XHRcdGRhdGVQYXJ0cyA9IGQuc3BsaXQoXCIuXCIpO1xyXG5cdFx0XHRcdHJldHVybiBuZXcgRGF0ZShkYXRlUGFydHNbMl0sIChkYXRlUGFydHNbMV0gLSAxKSwgZGF0ZVBhcnRzWzBdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGUoZGF0ZVBhcnRzWzBdLCAoZGF0ZVBhcnRzWzFdIC0gMSkgLGRhdGVQYXJ0c1syXSk7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIEJ1aWxkcyBvciB1cGRhdGVzIGEgcHJvbXB0IHdpdGggdGhlIGdpdmVuIGluZm9ybWF0aW9uXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9IGZpZWxkXHJcblx0XHQqIEBwYXJhbSB7U3RyaW5nfSBwcm9tcHRUZXh0IGh0bWwgdGV4dCB0byBkaXNwbGF5IHR5cGVcclxuXHRcdCogQHBhcmFtIHtTdHJpbmd9IHR5cGUgdGhlIHR5cGUgb2YgYnViYmxlOiAncGFzcycgKGdyZWVuKSwgJ2xvYWQnIChibGFjaykgYW55dGhpbmcgZWxzZSAocmVkKVxyXG5cdFx0KiBAcGFyYW0ge2Jvb2xlYW59IGFqYXhlZCAtIHVzZSB0byBtYXJrIGZpZWxkcyB0aGFuIGJlaW5nIHZhbGlkYXRlZCB3aXRoIGFqYXhcclxuXHRcdCogQHBhcmFtIHtNYXB9IG9wdGlvbnMgdXNlciBvcHRpb25zXHJcblx0XHQqL1xyXG5cdFx0IF9zaG93UHJvbXB0OiBmdW5jdGlvbihmaWVsZCwgcHJvbXB0VGV4dCwgdHlwZSwgYWpheGVkLCBvcHRpb25zLCBhamF4Zm9ybSkge1xyXG5cdFx0XHQgdmFyIHByb21wdCA9IG1ldGhvZHMuX2dldFByb21wdChmaWVsZCk7XHJcblx0XHRcdCAvLyBUaGUgYWpheCBzdWJtaXQgZXJyb3JzIGFyZSBub3Qgc2VlIGhhcyBhbiBlcnJvciBpbiB0aGUgZm9ybSxcclxuXHRcdFx0IC8vIFdoZW4gdGhlIGZvcm0gZXJyb3JzIGFyZSByZXR1cm5lZCwgdGhlIGVuZ2luZSBzZWUgMiBidWJibGVzLCBidXQgdGhvc2UgYXJlIGViaW5nIGNsb3NlZCBieSB0aGUgZW5naW5lIGF0IHRoZSBzYW1lIHRpbWVcclxuXHRcdFx0IC8vIEJlY2F1c2Ugbm8gZXJyb3Igd2FzIGZvdW5kIGJlZm9yIHN1Ym1pdHRpbmdcclxuXHRcdFx0IGlmKGFqYXhmb3JtKSBwcm9tcHQgPSBmYWxzZTtcclxuXHRcdFx0IC8vIENoZWNrIHRoYXQgdGhlcmUgaXMgaW5kZGVkIHRleHRcclxuXHRcdFx0IGlmKCQudHJpbShwcm9tcHRUZXh0KSl7IFxyXG5cdFx0XHRcdCBpZiAocHJvbXB0KVxyXG5cdFx0XHRcdFx0bWV0aG9kcy5fdXBkYXRlUHJvbXB0KGZpZWxkLCBwcm9tcHQsIHByb21wdFRleHQsIHR5cGUsIGFqYXhlZCwgb3B0aW9ucyk7XHJcblx0XHRcdFx0IGVsc2VcclxuXHRcdFx0XHRcdG1ldGhvZHMuX2J1aWxkUHJvbXB0KGZpZWxkLCBwcm9tcHRUZXh0LCB0eXBlLCBhamF4ZWQsIG9wdGlvbnMpO1xyXG5cdFx0XHR9XHJcblx0XHQgfSxcclxuXHRcdC8qKlxyXG5cdFx0KiBCdWlsZHMgYW5kIHNoYWRlcyBhIHByb21wdCBmb3IgdGhlIGdpdmVuIGZpZWxkLlxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmaWVsZFxyXG5cdFx0KiBAcGFyYW0ge1N0cmluZ30gcHJvbXB0VGV4dCBodG1sIHRleHQgdG8gZGlzcGxheSB0eXBlXHJcblx0XHQqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIHRoZSB0eXBlIG9mIGJ1YmJsZTogJ3Bhc3MnIChncmVlbiksICdsb2FkJyAoYmxhY2spIGFueXRoaW5nIGVsc2UgKHJlZClcclxuXHRcdCogQHBhcmFtIHtib29sZWFufSBhamF4ZWQgLSB1c2UgdG8gbWFyayBmaWVsZHMgdGhhbiBiZWluZyB2YWxpZGF0ZWQgd2l0aCBhamF4XHJcblx0XHQqIEBwYXJhbSB7TWFwfSBvcHRpb25zIHVzZXIgb3B0aW9uc1xyXG5cdFx0Ki9cclxuXHRcdF9idWlsZFByb21wdDogZnVuY3Rpb24oZmllbGQsIHByb21wdFRleHQsIHR5cGUsIGFqYXhlZCwgb3B0aW9ucykge1xyXG5cclxuXHRcdFx0Ly8gY3JlYXRlIHRoZSBwcm9tcHRcclxuXHRcdFx0dmFyIHByb21wdCA9ICQoJzxkaXY+Jyk7XHJcblx0XHRcdHByb21wdC5hZGRDbGFzcyhtZXRob2RzLl9nZXRDbGFzc05hbWUoZmllbGQuYXR0cihcImlkXCIpKSArIFwiZm9ybUVycm9yXCIpO1xyXG5cdFx0XHQvLyBhZGQgYSBjbGFzcyBuYW1lIHRvIGlkZW50aWZ5IHRoZSBwYXJlbnQgZm9ybSBvZiB0aGUgcHJvbXB0XHJcblx0XHRcdHByb21wdC5hZGRDbGFzcyhcInBhcmVudEZvcm1cIittZXRob2RzLl9nZXRDbGFzc05hbWUoZmllbGQuY2xvc2VzdCgnZm9ybSwgLnZhbGlkYXRpb25FbmdpbmVDb250YWluZXInKS5hdHRyKFwiaWRcIikpKTtcclxuXHRcdFx0cHJvbXB0LmFkZENsYXNzKFwiZm9ybUVycm9yXCIpO1xyXG5cclxuXHRcdFx0c3dpdGNoICh0eXBlKSB7XHJcblx0XHRcdFx0Y2FzZSBcInBhc3NcIjpcclxuXHRcdFx0XHRcdHByb21wdC5hZGRDbGFzcyhcImdyZWVuUG9wdXBcIik7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwibG9hZFwiOlxyXG5cdFx0XHRcdFx0cHJvbXB0LmFkZENsYXNzKFwiYmxhY2tQb3B1cFwiKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHQvKiBpdCBoYXMgZXJyb3IgICovXHJcblx0XHRcdFx0XHQvL2FsZXJ0KFwidW5rbm93biBwb3B1cCB0eXBlOlwiK3R5cGUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChhamF4ZWQpXHJcblx0XHRcdFx0cHJvbXB0LmFkZENsYXNzKFwiYWpheGVkXCIpO1xyXG5cclxuXHRcdFx0Ly8gY3JlYXRlIHRoZSBwcm9tcHQgY29udGVudFxyXG5cdFx0XHR2YXIgcHJvbXB0Q29udGVudCA9ICQoJzxkaXY+JykuYWRkQ2xhc3MoXCJmb3JtRXJyb3JDb250ZW50XCIpLmh0bWwocHJvbXB0VGV4dCkuYXBwZW5kVG8ocHJvbXB0KTtcclxuXHJcblx0XHRcdC8vIGRldGVybWluZSBwb3NpdGlvbiB0eXBlXHJcblx0XHRcdHZhciBwb3NpdGlvblR5cGU9ZmllbGQuZGF0YShcInByb21wdFBvc2l0aW9uXCIpIHx8IG9wdGlvbnMucHJvbXB0UG9zaXRpb247XHJcblxyXG5cdFx0XHQvLyBjcmVhdGUgdGhlIGNzcyBhcnJvdyBwb2ludGluZyBhdCB0aGUgZmllbGRcclxuXHRcdFx0Ly8gbm90ZSB0aGF0IHRoZXJlIGlzIG5vIHRyaWFuZ2xlIG9uIG1heC1jaGVja2JveCBhbmQgcmFkaW9cclxuXHRcdFx0aWYgKG9wdGlvbnMuc2hvd0Fycm93KSB7XHJcblx0XHRcdFx0dmFyIGFycm93ID0gJCgnPGRpdj4nKS5hZGRDbGFzcyhcImZvcm1FcnJvckFycm93XCIpO1xyXG5cclxuXHRcdFx0XHQvL3Byb21wdCBwb3NpdGlvbmluZyBhZGp1c3RtZW50IHN1cHBvcnQuIFVzYWdlOiBwb3NpdGlvblR5cGU6WHNoaWZ0LFlzaGlmdCAoZm9yIGV4LjogYm90dG9tTGVmdDorMjAgb3IgYm90dG9tTGVmdDotMjAsKzEwKVxyXG5cdFx0XHRcdGlmICh0eXBlb2YocG9zaXRpb25UeXBlKT09J3N0cmluZycpIFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHZhciBwb3M9cG9zaXRpb25UeXBlLmluZGV4T2YoXCI6XCIpO1xyXG5cdFx0XHRcdFx0aWYocG9zIT0tMSlcclxuXHRcdFx0XHRcdFx0cG9zaXRpb25UeXBlPXBvc2l0aW9uVHlwZS5zdWJzdHJpbmcoMCxwb3MpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0c3dpdGNoIChwb3NpdGlvblR5cGUpIHtcclxuXHRcdFx0XHRcdGNhc2UgXCJib3R0b21MZWZ0XCI6XHJcblx0XHRcdFx0XHRjYXNlIFwiYm90dG9tUmlnaHRcIjpcclxuXHRcdFx0XHRcdFx0cHJvbXB0LmZpbmQoXCIuZm9ybUVycm9yQ29udGVudFwiKS5iZWZvcmUoYXJyb3cpO1xyXG5cdFx0XHRcdFx0XHRhcnJvdy5hZGRDbGFzcyhcImZvcm1FcnJvckFycm93Qm90dG9tXCIpLmh0bWwoJzxkaXYgY2xhc3M9XCJsaW5lMVwiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmUyXCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZTNcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lNFwiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmU1XCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZTZcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lN1wiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmU4XCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZTlcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lMTBcIj48IS0tIC0tPjwvZGl2PicpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgXCJ0b3BMZWZ0XCI6XHJcblx0XHRcdFx0XHRjYXNlIFwidG9wUmlnaHRcIjpcclxuXHRcdFx0XHRcdFx0YXJyb3cuaHRtbCgnPGRpdiBjbGFzcz1cImxpbmUxMFwiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmU5XCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZThcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lN1wiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmU2XCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZTVcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lNFwiPjwhLS0gLS0+PC9kaXY+PGRpdiBjbGFzcz1cImxpbmUzXCI+PCEtLSAtLT48L2Rpdj48ZGl2IGNsYXNzPVwibGluZTJcIj48IS0tIC0tPjwvZGl2PjxkaXYgY2xhc3M9XCJsaW5lMVwiPjwhLS0gLS0+PC9kaXY+Jyk7XHJcblx0XHRcdFx0XHRcdHByb21wdC5hcHBlbmQoYXJyb3cpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8gQWRkIGN1c3RvbSBwcm9tcHQgY2xhc3NcclxuXHRcdFx0aWYgKG9wdGlvbnMuYWRkUHJvbXB0Q2xhc3MpXHJcblx0XHRcdFx0cHJvbXB0LmFkZENsYXNzKG9wdGlvbnMuYWRkUHJvbXB0Q2xhc3MpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGN1c3RvbSBwcm9tcHQgY2xhc3MgZGVmaW5lZCBpbiBlbGVtZW50XHJcbiAgICAgICAgICAgIHZhciByZXF1aXJlZE92ZXJyaWRlID0gZmllbGQuYXR0cignZGF0YS1yZXF1aXJlZC1jbGFzcycpO1xyXG4gICAgICAgICAgICBpZihyZXF1aXJlZE92ZXJyaWRlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHByb21wdC5hZGRDbGFzcyhyZXF1aXJlZE92ZXJyaWRlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmKG9wdGlvbnMucHJldHR5U2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJCgnIycgKyBmaWVsZC5hdHRyKCdpZCcpKS5uZXh0KCkuaXMoJ3NlbGVjdCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcmV0dHlPdmVycmlkZUNsYXNzID0gJCgnIycgKyBmaWVsZC5hdHRyKCdpZCcpLnN1YnN0cihvcHRpb25zLnVzZVByZWZpeC5sZW5ndGgpLnN1YnN0cmluZyhvcHRpb25zLnVzZVN1ZmZpeC5sZW5ndGgpKS5hdHRyKCdkYXRhLXJlcXVpcmVkLWNsYXNzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHByZXR0eU92ZXJyaWRlQ2xhc3MgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvbXB0LmFkZENsYXNzKHByZXR0eU92ZXJyaWRlQ2xhc3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG5cdFx0XHRwcm9tcHQuY3NzKHtcclxuXHRcdFx0XHRcIm9wYWNpdHlcIjogMFxyXG5cdFx0XHR9KTtcclxuXHRcdFx0aWYocG9zaXRpb25UeXBlID09PSAnaW5saW5lJykge1xyXG5cdFx0XHRcdHByb21wdC5hZGRDbGFzcyhcImlubGluZVwiKTtcclxuXHRcdFx0XHRpZih0eXBlb2YgZmllbGQuYXR0cignZGF0YS1wcm9tcHQtdGFyZ2V0JykgIT09ICd1bmRlZmluZWQnICYmICQoJyMnK2ZpZWxkLmF0dHIoJ2RhdGEtcHJvbXB0LXRhcmdldCcpKS5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRwcm9tcHQuYXBwZW5kVG8oJCgnIycrZmllbGQuYXR0cignZGF0YS1wcm9tcHQtdGFyZ2V0JykpKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0ZmllbGQuYWZ0ZXIocHJvbXB0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0ZmllbGQuYmVmb3JlKHByb21wdCk7XHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0dmFyIHBvcyA9IG1ldGhvZHMuX2NhbGN1bGF0ZVBvc2l0aW9uKGZpZWxkLCBwcm9tcHQsIG9wdGlvbnMpO1xyXG5cdFx0XHRwcm9tcHQuY3NzKHtcclxuXHRcdFx0XHQncG9zaXRpb24nOiBwb3NpdGlvblR5cGUgPT09ICdpbmxpbmUnID8gJ3JlbGF0aXZlJyA6ICdhYnNvbHV0ZScsXHJcblx0XHRcdFx0XCJ0b3BcIjogcG9zLmNhbGxlclRvcFBvc2l0aW9uLFxyXG5cdFx0XHRcdFwibGVmdFwiOiBwb3MuY2FsbGVybGVmdFBvc2l0aW9uLFxyXG5cdFx0XHRcdFwibWFyZ2luVG9wXCI6IHBvcy5tYXJnaW5Ub3BTaXplLFxyXG5cdFx0XHRcdFwib3BhY2l0eVwiOiAwXHJcblx0XHRcdH0pLmRhdGEoXCJjYWxsZXJGaWVsZFwiLCBmaWVsZCk7XHJcblx0XHRcdFxyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuYXV0b0hpZGVQcm9tcHQpIHtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRwcm9tcHQuYW5pbWF0ZSh7XHJcblx0XHRcdFx0XHRcdFwib3BhY2l0eVwiOiAwXHJcblx0XHRcdFx0XHR9LGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdHByb21wdC5jbG9zZXN0KCcuZm9ybUVycm9yT3V0ZXInKS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdFx0cHJvbXB0LnJlbW92ZSgpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSwgb3B0aW9ucy5hdXRvSGlkZURlbGF5KTtcclxuXHRcdFx0fSBcclxuXHRcdFx0cmV0dXJuIHByb21wdC5hbmltYXRlKHtcclxuXHRcdFx0XHRcIm9wYWNpdHlcIjogMC44N1xyXG5cdFx0XHR9KTtcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogVXBkYXRlcyB0aGUgcHJvbXB0IHRleHQgZmllbGQgLSB0aGUgZmllbGQgZm9yIHdoaWNoIHRoZSBwcm9tcHRcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH0gZmllbGRcclxuXHRcdCogQHBhcmFtIHtTdHJpbmd9IHByb21wdFRleHQgaHRtbCB0ZXh0IHRvIGRpc3BsYXkgdHlwZVxyXG5cdFx0KiBAcGFyYW0ge1N0cmluZ30gdHlwZSB0aGUgdHlwZSBvZiBidWJibGU6ICdwYXNzJyAoZ3JlZW4pLCAnbG9hZCcgKGJsYWNrKSBhbnl0aGluZyBlbHNlIChyZWQpXHJcblx0XHQqIEBwYXJhbSB7Ym9vbGVhbn0gYWpheGVkIC0gdXNlIHRvIG1hcmsgZmllbGRzIHRoYW4gYmVpbmcgdmFsaWRhdGVkIHdpdGggYWpheFxyXG5cdFx0KiBAcGFyYW0ge01hcH0gb3B0aW9ucyB1c2VyIG9wdGlvbnNcclxuXHRcdCovXHJcblx0XHRfdXBkYXRlUHJvbXB0OiBmdW5jdGlvbihmaWVsZCwgcHJvbXB0LCBwcm9tcHRUZXh0LCB0eXBlLCBhamF4ZWQsIG9wdGlvbnMsIG5vQW5pbWF0aW9uKSB7XHJcblxyXG5cdFx0XHRpZiAocHJvbXB0KSB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiB0eXBlICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdFx0XHRpZiAodHlwZSA9PSBcInBhc3NcIilcclxuXHRcdFx0XHRcdFx0cHJvbXB0LmFkZENsYXNzKFwiZ3JlZW5Qb3B1cFwiKTtcclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0cHJvbXB0LnJlbW92ZUNsYXNzKFwiZ3JlZW5Qb3B1cFwiKTtcclxuXHJcblx0XHRcdFx0XHRpZiAodHlwZSA9PSBcImxvYWRcIilcclxuXHRcdFx0XHRcdFx0cHJvbXB0LmFkZENsYXNzKFwiYmxhY2tQb3B1cFwiKTtcclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0cHJvbXB0LnJlbW92ZUNsYXNzKFwiYmxhY2tQb3B1cFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGFqYXhlZClcclxuXHRcdFx0XHRcdHByb21wdC5hZGRDbGFzcyhcImFqYXhlZFwiKTtcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRwcm9tcHQucmVtb3ZlQ2xhc3MoXCJhamF4ZWRcIik7XHJcblxyXG5cdFx0XHRcdHByb21wdC5maW5kKFwiLmZvcm1FcnJvckNvbnRlbnRcIikuaHRtbChwcm9tcHRUZXh0KTtcclxuXHJcblx0XHRcdFx0dmFyIHBvcyA9IG1ldGhvZHMuX2NhbGN1bGF0ZVBvc2l0aW9uKGZpZWxkLCBwcm9tcHQsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdHZhciBjc3MgPSB7XCJ0b3BcIjogcG9zLmNhbGxlclRvcFBvc2l0aW9uLFxyXG5cdFx0XHRcdFwibGVmdFwiOiBwb3MuY2FsbGVybGVmdFBvc2l0aW9uLFxyXG5cdFx0XHRcdFwibWFyZ2luVG9wXCI6IHBvcy5tYXJnaW5Ub3BTaXplfTtcclxuXHJcblx0XHRcdFx0aWYgKG5vQW5pbWF0aW9uKVxyXG5cdFx0XHRcdFx0cHJvbXB0LmNzcyhjc3MpO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHByb21wdC5hbmltYXRlKGNzcyk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ2xvc2VzIHRoZSBwcm9tcHQgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBmaWVsZFxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fVxyXG5cdFx0KiAgICAgICAgICAgIGZpZWxkXHJcblx0XHQqL1xyXG5cdFx0IF9jbG9zZVByb21wdDogZnVuY3Rpb24oZmllbGQpIHtcclxuXHRcdFx0IHZhciBwcm9tcHQgPSBtZXRob2RzLl9nZXRQcm9tcHQoZmllbGQpO1xyXG5cdFx0XHQgaWYgKHByb21wdClcclxuXHRcdFx0XHQgcHJvbXB0LmZhZGVUbyhcImZhc3RcIiwgMCwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHQgcHJvbXB0LnBhcmVudCgnLmZvcm1FcnJvck91dGVyJykucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHQgcHJvbXB0LnJlbW92ZSgpO1xyXG5cdFx0XHRcdCB9KTtcclxuXHRcdCB9LFxyXG5cdFx0IGNsb3NlUHJvbXB0OiBmdW5jdGlvbihmaWVsZCkge1xyXG5cdFx0XHQgcmV0dXJuIG1ldGhvZHMuX2Nsb3NlUHJvbXB0KGZpZWxkKTtcclxuXHRcdCB9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFJldHVybnMgdGhlIGVycm9yIHByb21wdCBtYXRjaGluZyB0aGUgZmllbGQgaWYgYW55XHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9XHJcblx0XHQqICAgICAgICAgICAgZmllbGRcclxuXHRcdCogQHJldHVybiB1bmRlZmluZWQgb3IgdGhlIGVycm9yIHByb21wdCAoanFPYmplY3QpXHJcblx0XHQqL1xyXG5cdFx0X2dldFByb21wdDogZnVuY3Rpb24oZmllbGQpIHtcclxuXHRcdFx0XHR2YXIgZm9ybUlkID0gJChmaWVsZCkuY2xvc2VzdCgnZm9ybSwgLnZhbGlkYXRpb25FbmdpbmVDb250YWluZXInKS5hdHRyKCdpZCcpO1xyXG5cdFx0XHR2YXIgY2xhc3NOYW1lID0gbWV0aG9kcy5fZ2V0Q2xhc3NOYW1lKGZpZWxkLmF0dHIoXCJpZFwiKSkgKyBcImZvcm1FcnJvclwiO1xyXG5cdFx0XHRcdHZhciBtYXRjaCA9ICQoXCIuXCIgKyBtZXRob2RzLl9lc2NhcGVFeHByZXNzaW9uKGNsYXNzTmFtZSkgKyAnLnBhcmVudEZvcm0nICsgZm9ybUlkKVswXTtcclxuXHRcdFx0aWYgKG1hdGNoKVxyXG5cdFx0XHRyZXR1cm4gJChtYXRjaCk7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQgICogUmV0dXJucyB0aGUgZXNjYXBhZGUgY2xhc3NuYW1lXHJcblx0XHQgICpcclxuXHRcdCAgKiBAcGFyYW0ge3NlbGVjdG9yfVxyXG5cdFx0ICAqICAgICAgICAgICAgY2xhc3NOYW1lXHJcblx0XHQgICovXHJcblx0XHQgIF9lc2NhcGVFeHByZXNzaW9uOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuXHRcdFx0ICByZXR1cm4gc2VsZWN0b3IucmVwbGFjZSgvKFsjOyYsXFwuXFwrXFwqXFx+JzpcIlxcIVxcXiRcXFtcXF1cXChcXCk9PlxcfF0pL2csIFwiXFxcXCQxXCIpO1xyXG5cdFx0ICB9LFxyXG5cdFx0LyoqXHJcblx0XHQgKiByZXR1cm5zIHRydWUgaWYgd2UgYXJlIGluIGEgUlRMZWQgZG9jdW1lbnRcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge2pxT2JqZWN0fSBmaWVsZFxyXG5cdFx0ICovXHJcblx0XHRpc1JUTDogZnVuY3Rpb24oZmllbGQpXHJcblx0XHR7XHJcblx0XHRcdHZhciAkZG9jdW1lbnQgPSAkKGRvY3VtZW50KTtcclxuXHRcdFx0dmFyICRib2R5ID0gJCgnYm9keScpO1xyXG5cdFx0XHR2YXIgcnRsID1cclxuXHRcdFx0XHQoZmllbGQgJiYgZmllbGQuaGFzQ2xhc3MoJ3J0bCcpKSB8fFxyXG5cdFx0XHRcdChmaWVsZCAmJiAoZmllbGQuYXR0cignZGlyJykgfHwgJycpLnRvTG93ZXJDYXNlKCk9PT0ncnRsJykgfHxcclxuXHRcdFx0XHQkZG9jdW1lbnQuaGFzQ2xhc3MoJ3J0bCcpIHx8XHJcblx0XHRcdFx0KCRkb2N1bWVudC5hdHRyKCdkaXInKSB8fCAnJykudG9Mb3dlckNhc2UoKT09PSdydGwnIHx8XHJcblx0XHRcdFx0JGJvZHkuaGFzQ2xhc3MoJ3J0bCcpIHx8XHJcblx0XHRcdFx0KCRib2R5LmF0dHIoJ2RpcicpIHx8ICcnKS50b0xvd2VyQ2FzZSgpPT09J3J0bCc7XHJcblx0XHRcdHJldHVybiBCb29sZWFuKHJ0bCk7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIENhbGN1bGF0ZXMgcHJvbXB0IHBvc2l0aW9uXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9XHJcblx0XHQqICAgICAgICAgICAgZmllbGRcclxuXHRcdCogQHBhcmFtIHtqcU9iamVjdH1cclxuXHRcdCogICAgICAgICAgICB0aGUgcHJvbXB0XHJcblx0XHQqIEBwYXJhbSB7TWFwfVxyXG5cdFx0KiAgICAgICAgICAgIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBwb3NpdGlvbnNcclxuXHRcdCovXHJcblx0XHRfY2FsY3VsYXRlUG9zaXRpb246IGZ1bmN0aW9uIChmaWVsZCwgcHJvbXB0RWxtdCwgb3B0aW9ucykge1xyXG5cclxuXHRcdFx0dmFyIHByb21wdFRvcFBvc2l0aW9uLCBwcm9tcHRsZWZ0UG9zaXRpb24sIG1hcmdpblRvcFNpemU7XHJcblx0XHRcdHZhciBmaWVsZFdpZHRoIFx0PSBmaWVsZC53aWR0aCgpO1xyXG5cdFx0XHR2YXIgZmllbGRMZWZ0IFx0PSBmaWVsZC5wb3NpdGlvbigpLmxlZnQ7IFxyXG5cdFx0XHR2YXIgZmllbGRUb3AgXHQ9ICBmaWVsZC5wb3NpdGlvbigpLnRvcDtcclxuXHRcdFx0dmFyIGZpZWxkSGVpZ2h0IFx0PSAgZmllbGQuaGVpZ2h0KCk7XHRcclxuXHRcdFx0dmFyIHByb21wdEhlaWdodCA9IHByb21wdEVsbXQuaGVpZ2h0KCk7XHJcblxyXG5cclxuXHRcdFx0Ly8gaXMgdGhlIGZvcm0gY29udGFpbmVkIGluIGFuIG92ZXJmbG93biBjb250YWluZXI/XHJcblx0XHRcdHByb21wdFRvcFBvc2l0aW9uID0gcHJvbXB0bGVmdFBvc2l0aW9uID0gMDtcclxuXHRcdFx0Ly8gY29tcGVuc2F0aW9uIGZvciB0aGUgYXJyb3dcclxuXHRcdFx0bWFyZ2luVG9wU2l6ZSA9IC1wcm9tcHRIZWlnaHQ7XHJcblx0XHRcclxuXHJcblx0XHRcdC8vcHJvbXB0IHBvc2l0aW9uaW5nIGFkanVzdG1lbnQgc3VwcG9ydFxyXG5cdFx0XHQvL25vdyB5b3UgY2FuIGFkanVzdCBwcm9tcHQgcG9zaXRpb25cclxuXHRcdFx0Ly91c2FnZTogcG9zaXRpb25UeXBlOlhzaGlmdCxZc2hpZnRcclxuXHRcdFx0Ly9mb3IgZXhhbXBsZTpcclxuXHRcdFx0Ly8gICBib3R0b21MZWZ0OisyMCBtZWFucyBib3R0b21MZWZ0IHBvc2l0aW9uIHNoaWZ0ZWQgYnkgMjAgcGl4ZWxzIHJpZ2h0IGhvcml6b250YWxseVxyXG5cdFx0XHQvLyAgIHRvcFJpZ2h0OjIwLCAtMTUgbWVhbnMgdG9wUmlnaHQgcG9zaXRpb24gc2hpZnRlZCBieSAyMCBwaXhlbHMgdG8gcmlnaHQgYW5kIDE1IHBpeGVscyB0byB0b3BcclxuXHRcdFx0Ly9Zb3UgY2FuIHVzZSArcGl4ZWxzLCAtIHBpeGVscy4gSWYgbm8gc2lnbiBpcyBwcm92aWRlZCB0aGFuICsgaXMgZGVmYXVsdC5cclxuXHRcdFx0dmFyIHBvc2l0aW9uVHlwZT1maWVsZC5kYXRhKFwicHJvbXB0UG9zaXRpb25cIikgfHwgb3B0aW9ucy5wcm9tcHRQb3NpdGlvbjtcclxuXHRcdFx0dmFyIHNoaWZ0MT1cIlwiO1xyXG5cdFx0XHR2YXIgc2hpZnQyPVwiXCI7XHJcblx0XHRcdHZhciBzaGlmdFg9MDtcclxuXHRcdFx0dmFyIHNoaWZ0WT0wO1xyXG5cdFx0XHRpZiAodHlwZW9mKHBvc2l0aW9uVHlwZSk9PSdzdHJpbmcnKSB7XHJcblx0XHRcdFx0Ly9kbyB3ZSBoYXZlIGFueSBwb3NpdGlvbiBhZGp1c3RtZW50cyA/XHJcblx0XHRcdFx0aWYgKHBvc2l0aW9uVHlwZS5pbmRleE9mKFwiOlwiKSE9LTEpIHtcclxuXHRcdFx0XHRcdHNoaWZ0MT1wb3NpdGlvblR5cGUuc3Vic3RyaW5nKHBvc2l0aW9uVHlwZS5pbmRleE9mKFwiOlwiKSsxKTtcclxuXHRcdFx0XHRcdHBvc2l0aW9uVHlwZT1wb3NpdGlvblR5cGUuc3Vic3RyaW5nKDAscG9zaXRpb25UeXBlLmluZGV4T2YoXCI6XCIpKTtcclxuXHJcblx0XHRcdFx0XHQvL2lmIGFueSBhZHZhbmNlZCBwb3NpdGlvbmluZyB3aWxsIGJlIG5lZWRlZCAocGVyY2VudHMgb3Igc29tZXRoaW5nIGVsc2UpIC0gcGFyc2VyIHNob3VsZCBiZSBhZGRlZCBoZXJlXHJcblx0XHRcdFx0XHQvL2ZvciBub3cgd2UgdXNlIHNpbXBsZSBwYXJzZUludCgpXHJcblxyXG5cdFx0XHRcdFx0Ly9kbyB3ZSBoYXZlIHNlY29uZCBwYXJhbWV0ZXI/XHJcblx0XHRcdFx0XHRpZiAoc2hpZnQxLmluZGV4T2YoXCIsXCIpICE9LTEpIHtcclxuXHRcdFx0XHRcdFx0c2hpZnQyPXNoaWZ0MS5zdWJzdHJpbmcoc2hpZnQxLmluZGV4T2YoXCIsXCIpICsxKTtcclxuXHRcdFx0XHRcdFx0c2hpZnQxPXNoaWZ0MS5zdWJzdHJpbmcoMCxzaGlmdDEuaW5kZXhPZihcIixcIikpO1xyXG5cdFx0XHRcdFx0XHRzaGlmdFk9cGFyc2VJbnQoc2hpZnQyKTtcclxuXHRcdFx0XHRcdFx0aWYgKGlzTmFOKHNoaWZ0WSkpIHNoaWZ0WT0wO1xyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0XHRzaGlmdFg9cGFyc2VJbnQoc2hpZnQxKTtcclxuXHRcdFx0XHRcdGlmIChpc05hTihzaGlmdDEpKSBzaGlmdDE9MDtcclxuXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdFxyXG5cdFx0XHRzd2l0Y2ggKHBvc2l0aW9uVHlwZSkge1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0Y2FzZSBcInRvcFJpZ2h0XCI6XHJcblx0XHRcdFx0XHRwcm9tcHRsZWZ0UG9zaXRpb24gKz0gIGZpZWxkTGVmdCArIGZpZWxkV2lkdGggLSAzMDtcclxuXHRcdFx0XHRcdHByb21wdFRvcFBvc2l0aW9uICs9ICBmaWVsZFRvcDtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRjYXNlIFwidG9wTGVmdFwiOlxyXG5cdFx0XHRcdFx0cHJvbXB0VG9wUG9zaXRpb24gKz0gIGZpZWxkVG9wO1xyXG5cdFx0XHRcdFx0cHJvbXB0bGVmdFBvc2l0aW9uICs9IGZpZWxkTGVmdDsgXHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBcImNlbnRlclJpZ2h0XCI6XHJcblx0XHRcdFx0XHRwcm9tcHRUb3BQb3NpdGlvbiA9IGZpZWxkVG9wKzQ7XHJcblx0XHRcdFx0XHRtYXJnaW5Ub3BTaXplID0gMDtcclxuXHRcdFx0XHRcdHByb21wdGxlZnRQb3NpdGlvbj0gZmllbGRMZWZ0ICsgZmllbGQub3V0ZXJXaWR0aCh0cnVlKSs1O1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcImNlbnRlckxlZnRcIjpcclxuXHRcdFx0XHRcdHByb21wdGxlZnRQb3NpdGlvbiA9IGZpZWxkTGVmdCAtIChwcm9tcHRFbG10LndpZHRoKCkgKyAyKTtcclxuXHRcdFx0XHRcdHByb21wdFRvcFBvc2l0aW9uID0gZmllbGRUb3ArNDtcclxuXHRcdFx0XHRcdG1hcmdpblRvcFNpemUgPSAwO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBcImJvdHRvbUxlZnRcIjpcclxuXHRcdFx0XHRcdHByb21wdFRvcFBvc2l0aW9uID0gZmllbGRUb3AgKyBmaWVsZC5oZWlnaHQoKSArIDU7XHJcblx0XHRcdFx0XHRtYXJnaW5Ub3BTaXplID0gMDtcclxuXHRcdFx0XHRcdHByb21wdGxlZnRQb3NpdGlvbiA9IGZpZWxkTGVmdDtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgXCJib3R0b21SaWdodFwiOlxyXG5cdFx0XHRcdFx0cHJvbXB0bGVmdFBvc2l0aW9uID0gZmllbGRMZWZ0ICsgZmllbGRXaWR0aCAtIDMwO1xyXG5cdFx0XHRcdFx0cHJvbXB0VG9wUG9zaXRpb24gPSAgZmllbGRUb3AgKyAgZmllbGQuaGVpZ2h0KCkgKyA1O1xyXG5cdFx0XHRcdFx0bWFyZ2luVG9wU2l6ZSA9IDA7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwiaW5saW5lXCI6XHJcblx0XHRcdFx0XHRwcm9tcHRsZWZ0UG9zaXRpb24gPSAwO1xyXG5cdFx0XHRcdFx0cHJvbXB0VG9wUG9zaXRpb24gPSAwO1xyXG5cdFx0XHRcdFx0bWFyZ2luVG9wU2l6ZSA9IDA7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHJcblxyXG5cdFx0XHQvL2FwcGx5IGFkanVzbWVudHMgaWYgYW55XHJcblx0XHRcdHByb21wdGxlZnRQb3NpdGlvbiArPSBzaGlmdFg7XHJcblx0XHRcdHByb21wdFRvcFBvc2l0aW9uICArPSBzaGlmdFk7XHJcblxyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFwiY2FsbGVyVG9wUG9zaXRpb25cIjogcHJvbXB0VG9wUG9zaXRpb24gKyBcInB4XCIsXHJcblx0XHRcdFx0XCJjYWxsZXJsZWZ0UG9zaXRpb25cIjogcHJvbXB0bGVmdFBvc2l0aW9uICsgXCJweFwiLFxyXG5cdFx0XHRcdFwibWFyZ2luVG9wU2l6ZVwiOiBtYXJnaW5Ub3BTaXplICsgXCJweFwiXHJcblx0XHRcdH07XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQqIFNhdmVzIHRoZSB1c2VyIG9wdGlvbnMgYW5kIHZhcmlhYmxlcyBpbiB0aGUgZm9ybS5kYXRhXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSB7anFPYmplY3R9XHJcblx0XHQqICAgICAgICAgICAgZm9ybSAtIHRoZSBmb3JtIHdoZXJlIHRoZSB1c2VyIG9wdGlvbiBzaG91bGQgYmUgc2F2ZWRcclxuXHRcdCogQHBhcmFtIHtNYXB9XHJcblx0XHQqICAgICAgICAgICAgb3B0aW9ucyAtIHRoZSB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiB0aGUgdXNlciBvcHRpb25zIChleHRlbmRlZCBmcm9tIHRoZSBkZWZhdWx0cylcclxuXHRcdCovXHJcblx0XHQgX3NhdmVPcHRpb25zOiBmdW5jdGlvbihmb3JtLCBvcHRpb25zKSB7XHJcblxyXG5cdFx0XHQgLy8gaXMgdGhlcmUgYSBsYW5ndWFnZSBsb2NhbGlzYXRpb24gP1xyXG5cdFx0XHQgaWYgKCQudmFsaWRhdGlvbkVuZ2luZUxhbmd1YWdlKVxyXG5cdFx0XHQgdmFyIGFsbFJ1bGVzID0gJC52YWxpZGF0aW9uRW5naW5lTGFuZ3VhZ2UuYWxsUnVsZXM7XHJcblx0XHRcdCBlbHNlXHJcblx0XHRcdCAkLmVycm9yKFwialF1ZXJ5LnZhbGlkYXRpb25FbmdpbmUgcnVsZXMgYXJlIG5vdCBsb2FkZWQsIHBseiBhZGQgbG9jYWxpemF0aW9uIGZpbGVzIHRvIHRoZSBwYWdlXCIpO1xyXG5cdFx0XHQgLy8gLS0tIEludGVybmFscyBETyBOT1QgVE9VQ0ggb3IgT1ZFUkxPQUQgLS0tXHJcblx0XHRcdCAvLyB2YWxpZGF0aW9uIHJ1bGVzIGFuZCBpMThcclxuXHRcdFx0ICQudmFsaWRhdGlvbkVuZ2luZS5kZWZhdWx0cy5hbGxydWxlcyA9IGFsbFJ1bGVzO1xyXG5cclxuXHRcdFx0IHZhciB1c2VyT3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUse30sJC52YWxpZGF0aW9uRW5naW5lLmRlZmF1bHRzLG9wdGlvbnMpO1xyXG5cclxuXHRcdFx0IGZvcm0uZGF0YSgnanF2JywgdXNlck9wdGlvbnMpO1xyXG5cdFx0XHQgcmV0dXJuIHVzZXJPcHRpb25zO1xyXG5cdFx0IH0sXHJcblxyXG5cdFx0IC8qKlxyXG5cdFx0ICogUmVtb3ZlcyBmb3JiaWRkZW4gY2hhcmFjdGVycyBmcm9tIGNsYXNzIG5hbWVcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWVcclxuXHRcdCAqL1xyXG5cdFx0IF9nZXRDbGFzc05hbWU6IGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xyXG5cdFx0XHQgaWYoY2xhc3NOYW1lKVxyXG5cdFx0XHRcdCByZXR1cm4gY2xhc3NOYW1lLnJlcGxhY2UoLzovZywgXCJfXCIpLnJlcGxhY2UoL1xcLi9nLCBcIl9cIik7XHJcblx0XHRcdFx0XHQgIH0sXHJcblx0XHQvKipcclxuXHRcdCAqIEVzY2FwZSBzcGVjaWFsIGNoYXJhY3RlciBmb3IgalF1ZXJ5IHNlbGVjdG9yXHJcblx0XHQgKiBodHRwOi8vdG90YWxkZXYuY29tL2NvbnRlbnQvZXNjYXBpbmctY2hhcmFjdGVycy1nZXQtdmFsaWQtanF1ZXJ5LWlkXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcclxuXHRcdCAqL1xyXG5cdFx0IF9qcVNlbGVjdG9yOiBmdW5jdGlvbihzdHIpe1xyXG5cdFx0XHRyZXR1cm4gc3RyLnJlcGxhY2UoLyhbOyYsXFwuXFwrXFwqXFx+JzpcIlxcIVxcXiMkJUBcXFtcXF1cXChcXCk9PlxcfF0pL2csICdcXFxcJDEnKTtcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCogQ29uZGl0aW9uYWxseSByZXF1aXJlZCBmaWVsZFxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW0ge2pxT2JqZWN0fSBmaWVsZFxyXG5cdFx0KiBAcGFyYW0ge0FycmF5W1N0cmluZ119IHJ1bGVzXHJcblx0XHQqIEBwYXJhbSB7aW50fSBpIHJ1bGVzIGluZGV4XHJcblx0XHQqIEBwYXJhbSB7TWFwfVxyXG5cdFx0KiB1c2VyIG9wdGlvbnNcclxuXHRcdCogQHJldHVybiBhbiBlcnJvciBzdHJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsZWRcclxuXHRcdCovXHJcblx0XHRfY29uZFJlcXVpcmVkOiBmdW5jdGlvbihmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpIHtcclxuXHRcdFx0dmFyIGlkeCwgZGVwZW5kaW5nRmllbGQ7XHJcblxyXG5cdFx0XHRmb3IoaWR4ID0gKGkgKyAxKTsgaWR4IDwgcnVsZXMubGVuZ3RoOyBpZHgrKykge1xyXG5cdFx0XHRcdGRlcGVuZGluZ0ZpZWxkID0galF1ZXJ5KFwiI1wiICsgcnVsZXNbaWR4XSkuZmlyc3QoKTtcclxuXHJcblx0XHRcdFx0LyogVXNlIF9yZXF1aXJlZCBmb3IgZGV0ZXJtaW5pbmcgd2V0aGVyIGRlcGVuZGluZ0ZpZWxkIGhhcyBhIHZhbHVlLlxyXG5cdFx0XHRcdCAqIFRoZXJlIGlzIGxvZ2ljIHRoZXJlIGZvciBoYW5kbGluZyBhbGwgZmllbGQgdHlwZXMsIGFuZCBkZWZhdWx0IHZhbHVlOyBzbyB3ZSB3b24ndCByZXBsaWNhdGUgdGhhdCBoZXJlXHJcblx0XHRcdFx0ICogSW5kaWNhdGUgdGhpcyBzcGVjaWFsIHVzZSBieSBzZXR0aW5nIHRoZSBsYXN0IHBhcmFtZXRlciB0byB0cnVlIHNvIHdlIG9ubHkgdmFsaWRhdGUgdGhlIGRlcGVuZGluZ0ZpZWxkIG9uIGNoYWNrYm94ZXMgYW5kIHJhZGlvIGJ1dHRvbnMgKCM0NjIpXHJcblx0XHRcdFx0ICovXHJcblx0XHRcdFx0aWYgKGRlcGVuZGluZ0ZpZWxkLmxlbmd0aCAmJiBtZXRob2RzLl9yZXF1aXJlZChkZXBlbmRpbmdGaWVsZCwgW1wicmVxdWlyZWRcIl0sIDAsIG9wdGlvbnMsIHRydWUpID09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0LyogV2Ugbm93IGtub3cgYW55IG9mIHRoZSBkZXBlbmRpbmcgZmllbGRzIGhhcyBhIHZhbHVlLFxyXG5cdFx0XHRcdFx0ICogc28gd2UgY2FuIHZhbGlkYXRlIHRoaXMgZmllbGQgYXMgcGVyIG5vcm1hbCByZXF1aXJlZCBjb2RlXHJcblx0XHRcdFx0XHQgKi9cclxuXHRcdFx0XHRcdHJldHVybiBtZXRob2RzLl9yZXF1aXJlZChmaWVsZCwgW1wicmVxdWlyZWRcIl0sIDAsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHJcblx0ICAgIF9zdWJtaXRCdXR0b25DbGljazogZnVuY3Rpb24oZXZlbnQpIHtcclxuXHQgICAgICAgIHZhciBidXR0b24gPSAkKHRoaXMpO1xyXG5cdCAgICAgICAgdmFyIGZvcm0gPSBidXR0b24uY2xvc2VzdCgnZm9ybSwgLnZhbGlkYXRpb25FbmdpbmVDb250YWluZXInKTtcclxuXHQgICAgICAgIGZvcm0uZGF0YShcImpxdl9zdWJtaXRCdXR0b25cIiwgYnV0dG9uLmF0dHIoXCJpZFwiKSk7XHJcblx0ICAgIH1cclxuXHRcdCAgfTtcclxuXHJcblx0IC8qKlxyXG5cdCAqIFBsdWdpbiBlbnRyeSBwb2ludC5cclxuXHQgKiBZb3UgbWF5IHBhc3MgYW4gYWN0aW9uIGFzIGEgcGFyYW1ldGVyIG9yIGEgbGlzdCBvZiBvcHRpb25zLlxyXG5cdCAqIGlmIG5vbmUsIHRoZSBpbml0IGFuZCBhdHRhY2ggbWV0aG9kcyBhcmUgYmVpbmcgY2FsbGVkLlxyXG5cdCAqIFJlbWVtYmVyOiBpZiB5b3UgcGFzcyBvcHRpb25zLCB0aGUgYXR0YWNoZWQgbWV0aG9kIGlzIE5PVCBjYWxsZWQgYXV0b21hdGljYWxseVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9XHJcblx0ICogICAgICAgICAgICBtZXRob2QgKG9wdGlvbmFsKSBhY3Rpb25cclxuXHQgKi9cclxuXHQgJC5mbi52YWxpZGF0aW9uRW5naW5lID0gZnVuY3Rpb24obWV0aG9kKSB7XHJcblxyXG5cdFx0IHZhciBmb3JtID0gJCh0aGlzKTtcclxuXHRcdCBpZighZm9ybVswXSkgcmV0dXJuIGZvcm07ICAvLyBzdG9wIGhlcmUgaWYgdGhlIGZvcm0gZG9lcyBub3QgZXhpc3RcclxuXHJcblx0XHQgaWYgKHR5cGVvZihtZXRob2QpID09ICdzdHJpbmcnICYmIG1ldGhvZC5jaGFyQXQoMCkgIT0gJ18nICYmIG1ldGhvZHNbbWV0aG9kXSkge1xyXG5cclxuXHRcdFx0IC8vIG1ha2Ugc3VyZSBpbml0IGlzIGNhbGxlZCBvbmNlXHJcblx0XHRcdCBpZihtZXRob2QgIT0gXCJzaG93UHJvbXB0XCIgJiYgbWV0aG9kICE9IFwiaGlkZVwiICYmIG1ldGhvZCAhPSBcImhpZGVBbGxcIilcclxuXHRcdFx0IG1ldGhvZHMuaW5pdC5hcHBseShmb3JtKTtcclxuXHJcblx0XHRcdCByZXR1cm4gbWV0aG9kc1ttZXRob2RdLmFwcGx5KGZvcm0sIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xyXG5cdFx0IH0gZWxzZSBpZiAodHlwZW9mIG1ldGhvZCA9PSAnb2JqZWN0JyB8fCAhbWV0aG9kKSB7XHJcblxyXG5cdFx0XHQgLy8gZGVmYXVsdCBjb25zdHJ1Y3RvciB3aXRoIG9yIHdpdGhvdXQgYXJndW1lbnRzXHJcblx0XHRcdCBtZXRob2RzLmluaXQuYXBwbHkoZm9ybSwgYXJndW1lbnRzKTtcclxuXHRcdFx0IHJldHVybiBtZXRob2RzLmF0dGFjaC5hcHBseShmb3JtKTtcclxuXHRcdCB9IGVsc2Uge1xyXG5cdFx0XHQgJC5lcnJvcignTWV0aG9kICcgKyBtZXRob2QgKyAnIGRvZXMgbm90IGV4aXN0IGluIGpRdWVyeS52YWxpZGF0aW9uRW5naW5lJyk7XHJcblx0XHQgfVxyXG5cdH07XHJcblxyXG5cclxuXHJcblx0Ly8gTEVBSyBHTE9CQUwgT1BUSU9OU1xyXG5cdCQudmFsaWRhdGlvbkVuZ2luZT0ge2ZpZWxkSWRDb3VudGVyOiAwLGRlZmF1bHRzOntcclxuXHJcblx0XHQvLyBOYW1lIG9mIHRoZSBldmVudCB0cmlnZ2VyaW5nIGZpZWxkIHZhbGlkYXRpb25cclxuXHRcdHZhbGlkYXRpb25FdmVudFRyaWdnZXI6IFwiYmx1clwiLFxyXG5cdFx0Ly8gQXV0b21hdGljYWxseSBzY3JvbGwgdmlld3BvcnQgdG8gdGhlIGZpcnN0IGVycm9yXHJcblx0XHRzY3JvbGw6IHRydWUsXHJcblx0XHQvLyBGb2N1cyBvbiB0aGUgZmlyc3QgaW5wdXRcclxuXHRcdGZvY3VzRmlyc3RGaWVsZDp0cnVlLFxyXG5cdFx0Ly8gU2hvdyBwcm9tcHRzLCBzZXQgdG8gZmFsc2UgdG8gZGlzYWJsZSBwcm9tcHRzXHJcblx0XHRzaG93UHJvbXB0czogdHJ1ZSxcclxuICAgICAgIC8vIFNob3VsZCB3ZSBhdHRlbXB0IHRvIHZhbGlkYXRlIG5vbi12aXNpYmxlIGlucHV0IGZpZWxkcyBjb250YWluZWQgaW4gdGhlIGZvcm0/IChVc2VmdWwgaW4gY2FzZXMgb2YgdGFiYmVkIGNvbnRhaW5lcnMsIGUuZy4galF1ZXJ5LVVJIHRhYnMpXHJcbiAgICAgICB2YWxpZGF0ZU5vblZpc2libGVGaWVsZHM6IGZhbHNlLFxyXG5cdFx0Ly8gT3BlbmluZyBib3ggcG9zaXRpb24sIHBvc3NpYmxlIGxvY2F0aW9ucyBhcmU6IHRvcExlZnQsXHJcblx0XHQvLyB0b3BSaWdodCwgYm90dG9tTGVmdCwgY2VudGVyUmlnaHQsIGJvdHRvbVJpZ2h0LCBpbmxpbmVcclxuXHRcdC8vIGlubGluZSBnZXRzIGluc2VydGVkIGFmdGVyIHRoZSB2YWxpZGF0ZWQgZmllbGQgb3IgaW50byBhbiBlbGVtZW50IHNwZWNpZmllZCBpbiBkYXRhLXByb21wdC10YXJnZXRcclxuXHRcdHByb21wdFBvc2l0aW9uOiBcInRvcFJpZ2h0XCIsXHJcblx0XHRiaW5kTWV0aG9kOlwiYmluZFwiLFxyXG5cdFx0Ly8gaW50ZXJuYWwsIGF1dG9tYXRpY2FsbHkgc2V0IHRvIHRydWUgd2hlbiBpdCBwYXJzZSBhIF9hamF4IHJ1bGVcclxuXHRcdGlubGluZUFqYXg6IGZhbHNlLFxyXG5cdFx0Ly8gaWYgc2V0IHRvIHRydWUsIHRoZSBmb3JtIGRhdGEgaXMgc2VudCBhc3luY2hyb25vdXNseSB2aWEgYWpheCB0byB0aGUgZm9ybS5hY3Rpb24gdXJsIChnZXQpXHJcblx0XHRhamF4Rm9ybVZhbGlkYXRpb246IGZhbHNlLFxyXG5cdFx0Ly8gVGhlIHVybCB0byBzZW5kIHRoZSBzdWJtaXQgYWpheCB2YWxpZGF0aW9uIChkZWZhdWx0IHRvIGFjdGlvbilcclxuXHRcdGFqYXhGb3JtVmFsaWRhdGlvblVSTDogZmFsc2UsXHJcblx0XHQvLyBIVFRQIG1ldGhvZCB1c2VkIGZvciBhamF4IHZhbGlkYXRpb25cclxuXHRcdGFqYXhGb3JtVmFsaWRhdGlvbk1ldGhvZDogJ2dldCcsXHJcblx0XHQvLyBBamF4IGZvcm0gdmFsaWRhdGlvbiBjYWxsYmFjayBtZXRob2Q6IGJvb2xlYW4gb25Db21wbGV0ZShmb3JtLCBzdGF0dXMsIGVycm9ycywgb3B0aW9ucylcclxuXHRcdC8vIHJldHVucyBmYWxzZSBpZiB0aGUgZm9ybS5zdWJtaXQgZXZlbnQgbmVlZHMgdG8gYmUgY2FuY2VsZWQuXHJcblx0XHRvbkFqYXhGb3JtQ29tcGxldGU6ICQubm9vcCxcclxuXHRcdC8vIGNhbGxlZCByaWdodCBiZWZvcmUgdGhlIGFqYXggY2FsbCwgbWF5IHJldHVybiBmYWxzZSB0byBjYW5jZWxcclxuXHRcdG9uQmVmb3JlQWpheEZvcm1WYWxpZGF0aW9uOiAkLm5vb3AsXHJcblx0XHQvLyBTdG9wcyBmb3JtIGZyb20gc3VibWl0dGluZyBhbmQgZXhlY3V0ZSBmdW5jdGlvbiBhc3NpY2lhdGVkIHdpdGggaXRcclxuXHRcdG9uVmFsaWRhdGlvbkNvbXBsZXRlOiBmYWxzZSxcclxuXHJcblx0XHQvLyBVc2VkIHdoZW4geW91IGhhdmUgYSBmb3JtIGZpZWxkcyB0b28gY2xvc2UgYW5kIHRoZSBlcnJvcnMgbWVzc2FnZXMgYXJlIG9uIHRvcCBvZiBvdGhlciBkaXN0dXJiaW5nIHZpZXdpbmcgbWVzc2FnZXNcclxuXHRcdGRvTm90U2hvd0FsbEVycm9zT25TdWJtaXQ6IGZhbHNlLFxyXG5cdFx0Ly8gT2JqZWN0IHdoZXJlIHlvdSBzdG9yZSBjdXN0b20gbWVzc2FnZXMgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgZXJyb3IgbWVzc2FnZXNcclxuXHRcdGN1c3RvbV9lcnJvcl9tZXNzYWdlczp7fSxcclxuXHRcdC8vIHRydWUgaWYgeW91IHdhbnQgdG8gdmluZCB0aGUgaW5wdXQgZmllbGRzXHJcblx0XHRiaW5kZWQ6IHRydWUsXHJcblx0XHQvLyBzZXQgdG8gdHJ1ZSwgd2hlbiB0aGUgcHJvbXB0IGFycm93IG5lZWRzIHRvIGJlIGRpc3BsYXllZFxyXG5cdFx0c2hvd0Fycm93OiB0cnVlLFxyXG5cdFx0Ly8gZGlkIG9uZSBvZiB0aGUgdmFsaWRhdGlvbiBmYWlsID8ga2VwdCBnbG9iYWwgdG8gc3RvcCBmdXJ0aGVyIGFqYXggdmFsaWRhdGlvbnNcclxuXHRcdGlzRXJyb3I6IGZhbHNlLFxyXG5cdFx0Ly8gTGltaXQgaG93IG1hbnkgZGlzcGxheWVkIGVycm9ycyBhIGZpZWxkIGNhbiBoYXZlXHJcblx0XHRtYXhFcnJvcnNQZXJGaWVsZDogZmFsc2UsXHJcblx0XHRcclxuXHRcdC8vIENhY2hlcyBmaWVsZCB2YWxpZGF0aW9uIHN0YXR1cywgdHlwaWNhbGx5IG9ubHkgYmFkIHN0YXR1cyBhcmUgY3JlYXRlZC5cclxuXHRcdC8vIHRoZSBhcnJheSBpcyB1c2VkIGR1cmluZyBhamF4IGZvcm0gdmFsaWRhdGlvbiB0byBkZXRlY3QgaXNzdWVzIGVhcmx5IGFuZCBwcmV2ZW50IGFuIGV4cGVuc2l2ZSBzdWJtaXRcclxuXHRcdGFqYXhWYWxpZENhY2hlOiB7fSxcclxuXHRcdC8vIEF1dG8gdXBkYXRlIHByb21wdCBwb3NpdGlvbiBhZnRlciB3aW5kb3cgcmVzaXplXHJcblx0XHRhdXRvUG9zaXRpb25VcGRhdGU6IGZhbHNlLFxyXG5cclxuXHRcdEludmFsaWRGaWVsZHM6IFtdLFxyXG5cdFx0b25GaWVsZFN1Y2Nlc3M6IGZhbHNlLFxyXG5cdFx0b25GaWVsZEZhaWx1cmU6IGZhbHNlLFxyXG5cdFx0b25TdWNjZXNzOiBmYWxzZSxcclxuXHRcdG9uRmFpbHVyZTogZmFsc2UsXHJcblx0XHR2YWxpZGF0ZUF0dHJpYnV0ZTogXCJjbGFzc1wiLFxyXG5cdFx0YWRkU3VjY2Vzc0Nzc0NsYXNzVG9GaWVsZDogXCJcIixcclxuXHRcdGFkZEZhaWx1cmVDc3NDbGFzc1RvRmllbGQ6IFwiXCIsXHJcblx0XHRcclxuXHRcdC8vIEF1dG8taGlkZSBwcm9tcHRcclxuXHRcdGF1dG9IaWRlUHJvbXB0OiBmYWxzZSxcclxuXHRcdC8vIERlbGF5IGJlZm9yZSBhdXRvLWhpZGVcclxuXHRcdGF1dG9IaWRlRGVsYXk6IDEwMDAwLFxyXG5cdFx0Ly8gRmFkZSBvdXQgZHVyYXRpb24gd2hpbGUgaGlkaW5nIHRoZSB2YWxpZGF0aW9uc1xyXG5cdFx0ZmFkZUR1cmF0aW9uOiAwLjMsXHJcblx0IC8vIFVzZSBQcmV0dGlmeSBzZWxlY3QgbGlicmFyeVxyXG5cdCBwcmV0dHlTZWxlY3Q6IGZhbHNlLFxyXG5cdCAvLyBBZGQgY3NzIGNsYXNzIG9uIHByb21wdFxyXG5cdCBhZGRQcm9tcHRDbGFzcyA6IFwiXCIsXHJcblx0IC8vIEN1c3RvbSBJRCB1c2VzIHByZWZpeFxyXG5cdCB1c2VQcmVmaXg6IFwiXCIsXHJcblx0IC8vIEN1c3RvbSBJRCB1c2VzIHN1ZmZpeFxyXG5cdCB1c2VTdWZmaXg6IFwiXCIsXHJcblx0IC8vIE9ubHkgc2hvdyBvbmUgbWVzc2FnZSBwZXIgZXJyb3IgcHJvbXB0XHJcblx0IHNob3dPbmVNZXNzYWdlOiBmYWxzZVxyXG5cdH19O1xyXG5cdCQoZnVuY3Rpb24oKXskLnZhbGlkYXRpb25FbmdpbmUuZGVmYXVsdHMucHJvbXB0UG9zaXRpb24gPSBtZXRob2RzLmlzUlRMKCk/J3RvcExlZnQnOlwidG9wUmlnaHRcIn0pO1xyXG59KShqUXVlcnkpO1xyXG5cclxuXHJcbiIsIihmdW5jdGlvbigkKXtcclxuICAgICQuZm4udmFsaWRhdGlvbkVuZ2luZUxhbmd1YWdlID0gZnVuY3Rpb24oKXtcclxuICAgIH07XHJcbiAgICAkLnZhbGlkYXRpb25FbmdpbmVMYW5ndWFnZSA9IHtcclxuICAgICAgICBuZXdMYW5nOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAkLnZhbGlkYXRpb25FbmdpbmVMYW5ndWFnZS5hbGxSdWxlcyA9IHtcclxuICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogeyAvLyBBZGQgeW91ciByZWdleCBydWxlcyBoZXJlLCB5b3UgY2FuIHRha2UgdGVsZXBob25lIGFzIGFuIGV4YW1wbGVcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBUaGlzIGZpZWxkIGlzIHJlcXVpcmVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRDaGVja2JveE11bHRpcGxlXCI6IFwiKiBQbGVhc2Ugc2VsZWN0IGFuIG9wdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0Q2hlY2tib3hlXCI6IFwiKiBUaGlzIGNoZWNrYm94IGlzIHJlcXVpcmVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHREYXRlUmFuZ2VcIjogXCIqIEJvdGggZGF0ZSByYW5nZSBmaWVsZHMgYXJlIHJlcXVpcmVkXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcInJlcXVpcmVkSW5GdW5jdGlvblwiOiB7IFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZnVuY1wiOiBmdW5jdGlvbihmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGZpZWxkLnZhbCgpID09IFwidGVzdFwiKSA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBGaWVsZCBtdXN0IGVxdWFsIHRlc3RcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiZGF0ZVJhbmdlXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBJbnZhbGlkIFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0MlwiOiBcIkRhdGUgUmFuZ2VcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiZGF0ZVRpbWVSYW5nZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogSW52YWxpZCBcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dDJcIjogXCJEYXRlIFRpbWUgUmFuZ2VcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibWluU2l6ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTWluaW11bSBcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dDJcIjogXCIgY2hhcmFjdGVycyByZXF1aXJlZFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJtYXhTaXplXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBNYXhpbXVtIFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0MlwiOiBcIiBjaGFyYWN0ZXJzIGFsbG93ZWRcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuXHRcdFx0XHRcImdyb3VwUmVxdWlyZWRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIFlvdSBtdXN0IGZpbGwgb25lIG9mIHRoZSBmb2xsb3dpbmcgZmllbGRzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm1pblwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTWluaW11bSB2YWx1ZSBpcyBcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibWF4XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBNYXhpbXVtIHZhbHVlIGlzIFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJwYXN0XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBEYXRlIHByaW9yIHRvIFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJmdXR1cmVcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIERhdGUgcGFzdCBcIlxyXG4gICAgICAgICAgICAgICAgfSxcdFxyXG4gICAgICAgICAgICAgICAgXCJtYXhDaGVja2JveFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTWF4aW11bSBcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dDJcIjogXCIgb3B0aW9ucyBhbGxvd2VkXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm1pbkNoZWNrYm94XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBQbGVhc2Ugc2VsZWN0IFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0MlwiOiBcIiBvcHRpb25zXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImVxdWFsc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogRmllbGRzIGRvIG5vdCBtYXRjaFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJjcmVkaXRDYXJkXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBJbnZhbGlkIGNyZWRpdCBjYXJkIG51bWJlclwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJwaG9uZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlZGl0OiBqcXVlcnkuaDV2YWxpZGF0ZS5qcyAvIG9yZWZhbG9cclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eKFtcXCtdWzAtOV17MSwzfVtcXCBcXC5cXC1dKT8oW1xcKF17MX1bMC05XXsyLDZ9W1xcKV0pPyhbMC05XFwgXFwuXFwtXFwvXXszLDIwfSkoKHh8ZXh0fGV4dGVuc2lvbilbXFwgXT9bMC05XXsxLDR9KT8kLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogSW52YWxpZCBwaG9uZSBudW1iZXJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiZW1haWxcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEhUTUw1IGNvbXBhdGlibGUgZW1haWwgcmVnZXggKCBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9zdGF0ZXMtb2YtdGhlLXR5cGUtYXR0cmlidXRlLmh0bWwjICAgIGUtbWFpbC1zdGF0ZS0lMjh0eXBlPWVtYWlsJTI5IClcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBJbnZhbGlkIGVtYWlsIGFkZHJlc3NcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiaW50ZWdlclwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiAvXltcXC1cXCtdP1xcZCskLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTm90IGEgdmFsaWQgaW50ZWdlclwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJudW1iZXJcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE51bWJlciwgaW5jbHVkaW5nIHBvc2l0aXZlLCBuZWdhdGl2ZSwgYW5kIGZsb2F0aW5nIGRlY2ltYWwuIGNyZWRpdDogb3JlZmFsb1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL15bXFwtXFwrXT8oKChbMC05XXsxLDN9KShbLF1bMC05XXszfSkqKXwoWzAtOV0rKSk/KFtcXC5dKFswLTldKykpPyQvLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBJbnZhbGlkIGZsb2F0aW5nIGRlY2ltYWwgbnVtYmVyXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImRhdGVcIjogeyAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy9cdENoZWNrIGlmIGRhdGUgaXMgdmFsaWQgYnkgbGVhcCB5ZWFyXHJcblx0XHRcdFwiZnVuY1wiOiBmdW5jdGlvbiAoZmllbGQpIHtcclxuXHRcdFx0XHRcdHZhciBwYXR0ZXJuID0gbmV3IFJlZ0V4cCgvXihcXGR7NH0pW1xcL1xcLVxcLl0oMD9bMS05XXwxWzAxMl0pW1xcL1xcLVxcLl0oMD9bMS05XXxbMTJdWzAtOV18M1swMV0pJC8pO1xyXG5cdFx0XHRcdFx0dmFyIG1hdGNoID0gcGF0dGVybi5leGVjKGZpZWxkLnZhbCgpKTtcclxuXHRcdFx0XHRcdGlmIChtYXRjaCA9PSBudWxsKVxyXG5cdFx0XHRcdFx0ICAgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdFx0XHRcdFx0dmFyIHllYXIgPSBtYXRjaFsxXTtcclxuXHRcdFx0XHRcdHZhciBtb250aCA9IG1hdGNoWzJdKjE7XHJcblx0XHRcdFx0XHR2YXIgZGF5ID0gbWF0Y2hbM10qMTtcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR2YXIgZGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgZGF5KTsgLy8gYmVjYXVzZSBtb250aHMgc3RhcnRzIGZyb20gMC5cclxuXHRcclxuXHRcdFx0XHRcdHJldHVybiAoZGF0ZS5nZXRGdWxsWWVhcigpID09IHllYXIgJiYgZGF0ZS5nZXRNb250aCgpID09IChtb250aCAtIDEpICYmIGRhdGUuZ2V0RGF0ZSgpID09IGRheSk7XHJcblx0XHRcdFx0fSwgICAgICAgICAgICAgICAgXHRcdFxyXG5cdFx0XHQgXCJhbGVydFRleHRcIjogXCIqIEludmFsaWQgZGF0ZSwgbXVzdCBiZSBpbiBZWVlZLU1NLUREIGZvcm1hdFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJpcHY0XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eKCgoWzAxXT9bMC05XXsxLDJ9KXwoMlswLTRdWzAtOV0pfCgyNVswLTVdKSlbLl0pezN9KChbMC0xXT9bMC05XXsxLDJ9KXwoMlswLTRdWzAtOV0pfCgyNVswLTVdKSkkLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogSW52YWxpZCBJUCBhZGRyZXNzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcInVybFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiAvXihodHRwcz98ZnRwKTpcXC9cXC8oKCgoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OikqQCk/KCgoXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pKXwoKChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuKSsoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4/KSg6XFxkKik/KShcXC8oKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKyhcXC8oKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCkqKSopPyk/KFxcPygoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8W1xcdUUwMDAtXFx1RjhGRl18XFwvfFxcPykqKT8oXFwjKCgoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKXxcXC98XFw/KSopPyQvaSxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogSW52YWxpZCBVUkxcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwib25seU51bWJlclNwXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eWzAtOVxcIF0rJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIE51bWJlcnMgb25seVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJvbmx5TGV0dGVyU3BcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL15bYS16QS1aXFwgXFwnXSskLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTGV0dGVycyBvbmx5XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm9ubHlMZXR0ZXJOdW1iZXJcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL15bMC05YS16QS1aXSskLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTm8gc3BlY2lhbCBjaGFyYWN0ZXJzIGFsbG93ZWRcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIC8vIC0tLSBDVVNUT00gUlVMRVMgLS0gVGhvc2UgYXJlIHNwZWNpZmljIHRvIHRoZSBkZW1vcywgdGhleSBjYW4gYmUgcmVtb3ZlZCBvciBjaGFuZ2VkIHRvIHlvdXIgbGlraW5nc1xyXG4gICAgICAgICAgICAgICAgXCJhamF4VXNlckNhbGxcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6IFwiYWpheFZhbGlkYXRlRmllbGRVc2VyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8geW91IG1heSB3YW50IHRvIHBhc3MgZXh0cmEgZGF0YSBvbiB0aGUgYWpheCBjYWxsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJleHRyYURhdGFcIjogXCJuYW1lPWVyaWNcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogVGhpcyB1c2VyIGlzIGFscmVhZHkgdGFrZW5cIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dExvYWRcIjogXCIqIFZhbGlkYXRpbmcsIHBsZWFzZSB3YWl0XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcblx0XHRcdFx0XCJhamF4VXNlckNhbGxQaHBcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6IFwicGhwYWpheC9hamF4VmFsaWRhdGVGaWVsZFVzZXIucGhwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8geW91IG1heSB3YW50IHRvIHBhc3MgZXh0cmEgZGF0YSBvbiB0aGUgYWpheCBjYWxsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJleHRyYURhdGFcIjogXCJuYW1lPWVyaWNcIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB5b3UgcHJvdmlkZSBhbiBcImFsZXJ0VGV4dE9rXCIsIGl0IHdpbGwgc2hvdyBhcyBhIGdyZWVuIHByb21wdCB3aGVuIHRoZSBmaWVsZCB2YWxpZGF0ZXNcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dE9rXCI6IFwiKiBUaGlzIHVzZXJuYW1lIGlzIGF2YWlsYWJsZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBUaGlzIHVzZXIgaXMgYWxyZWFkeSB0YWtlblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0TG9hZFwiOiBcIiogVmFsaWRhdGluZywgcGxlYXNlIHdhaXRcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiYWpheE5hbWVDYWxsXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyByZW1vdGUganNvbiBzZXJ2aWNlIGxvY2F0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ1cmxcIjogXCJhamF4VmFsaWRhdGVGaWVsZE5hbWVcIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBlcnJvclxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBUaGlzIG5hbWUgaXMgYWxyZWFkeSB0YWtlblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHlvdSBwcm92aWRlIGFuIFwiYWxlcnRUZXh0T2tcIiwgaXQgd2lsbCBzaG93IGFzIGEgZ3JlZW4gcHJvbXB0IHdoZW4gdGhlIGZpZWxkIHZhbGlkYXRlc1xyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0T2tcIjogXCIqIFRoaXMgbmFtZSBpcyBhdmFpbGFibGVcIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBzcGVha3MgYnkgaXRzZWxmXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRMb2FkXCI6IFwiKiBWYWxpZGF0aW5nLCBwbGVhc2Ugd2FpdFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cdFx0XHRcdCBcImFqYXhOYW1lQ2FsbFBocFwiOiB7XHJcblx0ICAgICAgICAgICAgICAgICAgICAvLyByZW1vdGUganNvbiBzZXJ2aWNlIGxvY2F0aW9uXHJcblx0ICAgICAgICAgICAgICAgICAgICBcInVybFwiOiBcInBocGFqYXgvYWpheFZhbGlkYXRlRmllbGROYW1lLnBocFwiLFxyXG5cdCAgICAgICAgICAgICAgICAgICAgLy8gZXJyb3JcclxuXHQgICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBUaGlzIG5hbWUgaXMgYWxyZWFkeSB0YWtlblwiLFxyXG5cdCAgICAgICAgICAgICAgICAgICAgLy8gc3BlYWtzIGJ5IGl0c2VsZlxyXG5cdCAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRMb2FkXCI6IFwiKiBWYWxpZGF0aW5nLCBwbGVhc2Ugd2FpdFwiXHJcblx0ICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcInZhbGlkYXRlMmZpZWxkc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIFBsZWFzZSBpbnB1dCBIRUxMT1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cdCAgICAgICAgICAgIC8vdGxzIHdhcm5pbmc6aG9tZWdyb3duIG5vdCBmaWVsZGVkIFxyXG4gICAgICAgICAgICAgICAgXCJkYXRlRm9ybWF0XCI6e1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL15cXGR7NH1bXFwvXFwtXSgwP1sxLTldfDFbMDEyXSlbXFwvXFwtXSgwP1sxLTldfFsxMl1bMC05XXwzWzAxXSkkfF4oPzooPzooPzowP1sxMzU3OF18MVswMl0pKFxcL3wtKTMxKXwoPzooPzowP1sxLDMtOV18MVswLTJdKShcXC98LSkoPzoyOXwzMCkpKShcXC98LSkoPzpbMS05XVxcZFxcZFxcZHxcXGRbMS05XVxcZFxcZHxcXGRcXGRbMS05XVxcZHxcXGRcXGRcXGRbMS05XSkkfF4oPzooPzowP1sxLTldfDFbMC0yXSkoXFwvfC0pKD86MD9bMS05XXwxXFxkfDJbMC04XSkpKFxcL3wtKSg/OlsxLTldXFxkXFxkXFxkfFxcZFsxLTldXFxkXFxkfFxcZFxcZFsxLTldXFxkfFxcZFxcZFxcZFsxLTldKSR8XigwPzIoXFwvfC0pMjkpKFxcL3wtKSg/Oig/OjBbNDhdMDB8WzEzNTc5XVsyNl0wMHxbMjQ2OF1bMDQ4XTAwKXwoPzpcXGRcXGQpPyg/OjBbNDhdfFsyNDY4XVswNDhdfFsxMzU3OV1bMjZdKSkkLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogSW52YWxpZCBEYXRlXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAvL3RscyB3YXJuaW5nOmhvbWVncm93biBub3QgZmllbGRlZCBcclxuXHRcdFx0XHRcImRhdGVUaW1lRm9ybWF0XCI6IHtcclxuXHQgICAgICAgICAgICAgICAgXCJyZWdleFwiOiAvXlxcZHs0fVtcXC9cXC1dKDA/WzEtOV18MVswMTJdKVtcXC9cXC1dKDA/WzEtOV18WzEyXVswLTldfDNbMDFdKVxccysoMVswMTJdfDA/WzEtOV0pezF9OigwP1sxLTVdfFswLTZdWzAtOV0pezF9OigwP1swLTZdfFswLTZdWzAtOV0pezF9XFxzKyhhbXxwbXxBTXxQTSl7MX0kfF4oPzooPzooPzowP1sxMzU3OF18MVswMl0pKFxcL3wtKTMxKXwoPzooPzowP1sxLDMtOV18MVswLTJdKShcXC98LSkoPzoyOXwzMCkpKShcXC98LSkoPzpbMS05XVxcZFxcZFxcZHxcXGRbMS05XVxcZFxcZHxcXGRcXGRbMS05XVxcZHxcXGRcXGRcXGRbMS05XSkkfF4oKDFbMDEyXXwwP1sxLTldKXsxfVxcLygwP1sxLTldfFsxMl1bMC05XXwzWzAxXSl7MX1cXC9cXGR7Miw0fVxccysoMVswMTJdfDA/WzEtOV0pezF9OigwP1sxLTVdfFswLTZdWzAtOV0pezF9OigwP1swLTZdfFswLTZdWzAtOV0pezF9XFxzKyhhbXxwbXxBTXxQTSl7MX0pJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIEludmFsaWQgRGF0ZSBvciBEYXRlIEZvcm1hdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0MlwiOiBcIkV4cGVjdGVkIEZvcm1hdDogXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHQzXCI6IFwibW0vZGQveXl5eSBoaDptbTpzcyBBTXxQTSBvciBcIiwgXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHQ0XCI6IFwieXl5eS1tbS1kZCBoaDptbTpzcyBBTXxQTVwiXHJcblx0ICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICQudmFsaWRhdGlvbkVuZ2luZUxhbmd1YWdlLm5ld0xhbmcoKTtcclxuICAgIFxyXG59KShqUXVlcnkpO1xyXG4iLCIoZnVuY3Rpb24oJCl7XHJcbiAgICAkLmZuLnZhbGlkYXRpb25FbmdpbmVMYW5ndWFnZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB9O1xyXG4gICAgJC52YWxpZGF0aW9uRW5naW5lTGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgbmV3TGFuZzogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJC52YWxpZGF0aW9uRW5naW5lTGFuZ3VhZ2UuYWxsUnVsZXMgPSB7XHJcbiAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBDZSBjaGFtcCBlc3QgcmVxdWlzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRDaGVja2JveE11bHRpcGxlXCI6IFwiKiBDaG9pc2lyIHVuZSBvcHRpb25cIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dENoZWNrYm94ZVwiOiBcIiogQ2V0dGUgb3B0aW9uIGVzdCByZXF1aXNlXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcInJlcXVpcmVkSW5GdW5jdGlvblwiOiB7IFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZnVuY1wiOiBmdW5jdGlvbihmaWVsZCwgcnVsZXMsIGksIG9wdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGZpZWxkLnZhbCgpID09IFwidGVzdFwiKSA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBGaWVsZCBtdXN0IGVxdWFsIHRlc3RcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgXCJtaW5TaXplXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBNaW5pbXVtIFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0MlwiOiBcIiBjYXJhY3TDqHJlcyByZXF1aXNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuXHRcdFx0XHRcImdyb3VwUmVxdWlyZWRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIFZvdXMgZGV2ZXogcmVtcGxpciB1biBkZXMgY2hhbXBzIHN1aXZhbnRcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibWF4U2l6ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTWF4aW11bSBcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dDJcIjogXCIgY2FyYWN0w6hyZXMgcmVxdWlzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcblx0XHQgICAgICAgIFwibWluXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBWYWxldXIgbWluaW11bSByZXF1aXNlIFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJtYXhcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIFZhbGV1ciBtYXhpbXVtIHJlcXVpc2UgXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcblx0XHQgICAgICAgIFwicGFzdFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogRGF0ZSBhbnTDqXJpZXVyZSBhdSBcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiZnV0dXJlXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBEYXRlIHBvc3TDqXJpZXVyZSBhdSBcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibWF4Q2hlY2tib3hcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIE5vbWJyZSBtYXggZGUgY2hvaXggZXhjw6lkw6lcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibWluQ2hlY2tib3hcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIFZldWlsbGV6IGNob2lzaXIgXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHQyXCI6IFwiIG9wdGlvbnNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiZXF1YWxzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBWb3RyZSBjaGFtcCBuJ2VzdCBwYXMgaWRlbnRpcXVlXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImNyZWRpdENhcmRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIE51bcOpcm8gZGUgY2FydGUgYmFuY2FpcmUgdmFsaWRlXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcInBob25lXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjcmVkaXQ6IGpxdWVyeS5oNXZhbGlkYXRlLmpzIC8gb3JlZmFsb1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL14oW1xcK11bMC05XXsxLDN9WyBcXC5cXC1dKT8oW1xcKF17MX1bMC05XXsyLDZ9W1xcKV0pPyhbMC05IFxcLlxcLVxcL117MywyMH0pKCh4fGV4dHxleHRlbnNpb24pWyBdP1swLTldezEsNH0pPyQvLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBOdW3DqXJvIGRlIHTDqWzDqXBob25lIGludmFsaWRlXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImVtYWlsXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTaGFtZWxlc3NseSBsaWZ0ZWQgZnJvbSBTY290dCBHb256YWxleiB2aWEgdGhlIEJhc3Npc3RhbmNlIFZhbGlkYXRpb24gcGx1Z2luIGh0dHA6Ly9wcm9qZWN0cy5zY290dHNwbGF5Z3JvdW5kLmNvbS9lbWFpbF9hZGRyZXNzX3ZhbGlkYXRpb24vXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiAvXigoKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSsoXFwuKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSspKil8KChcXHgyMikoKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPygoW1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4N2ZdfFxceDIxfFtcXHgyMy1cXHg1Yl18W1xceDVkLVxceDdlXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KFxcXFwoW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBkLVxceDdmXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKSkqKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPyhcXHgyMikpKUAoKChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuKSsoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4/JC9pLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBBZHJlc3NlIGVtYWlsIGludmFsaWRlXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImludGVnZXJcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL15bXFwtXFwrXT9cXGQrJC8sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIE5vbWJyZSBlbnRpZXIgaW52YWxpZGVcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibnVtYmVyXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBOdW1iZXIsIGluY2x1ZGluZyBwb3NpdGl2ZSwgbmVnYXRpdmUsIGFuZCBmbG9hdGluZyBkZWNpbWFsLiBjcmVkaXQ6IG9yZWZhbG9cclxuICAgICAgICAgICAgICAgICAgICBcInJlZ2V4XCI6IC9eW1xcLVxcK10/KCgoWzAtOV17MSwzfSkoWyxdWzAtOV17M30pKil8KFswLTldKykpPyhbXFwuXShbMC05XSspKT8kLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogTm9tYnJlIGZsb3R0YW50IGludmFsaWRlXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImRhdGVcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL15cXGR7NH1bXFwvXFwtXSgwP1sxLTldfDFbMDEyXSlbXFwvXFwtXSgwP1sxLTldfFsxMl1bMC05XXwzWzAxXSkkLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogRGF0ZSBpbnZhbGlkZSwgZm9ybWF0IFlZWVktTU0tREQgcmVxdWlzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImlwdjRcIjoge1xyXG4gICAgICAgICAgICAgICAgXHRcInJlZ2V4XCI6IC9eKCgoWzAxXT9bMC05XXsxLDJ9KXwoMlswLTRdWzAtOV0pfCgyNVswLTVdKSlbLl0pezN9KChbMC0xXT9bMC05XXsxLDJ9KXwoMlswLTRdWzAtOV0pfCgyNVswLTVdKSkkLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogQWRyZXNzZSBJUCBpbnZhbGlkZVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJ1cmxcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL14oaHR0cHM/fGZ0cCk6XFwvXFwvKCgoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDopKkApPygoKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKSl8KCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuPykoOlxcZCopPykoXFwvKCgoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKSsoXFwvKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKikqKT8pPyhcXD8oKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApfFtcXHVFMDAwLVxcdUY4RkZdfFxcL3xcXD8pKik/KFxcIygoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8XFwvfFxcPykqKT8kL2ksXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIFVSTCBpbnZhbGlkZVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJvbmx5TnVtYmVyU3BcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL15bMC05XFwgXSskLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogU2V1bHMgbGVzIGNoaWZmcmVzIHNvbnQgYWNjZXB0w6lzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm9ubHlMZXR0ZXJTcFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdleFwiOiAvXlthLXpBLVpcXHUwMEMwLVxcdTAwRDZcXHUwMEQ5LVxcdTAwRjZcXHUwMEY5LVxcdTAwRkRcXCBcXCddKyQvLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBTZXVsZXMgbGVzIGxldHRyZXMgc29udCBhY2NlcHTDqWVzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIm9ubHlMZXR0ZXJOdW1iZXJcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVnZXhcIjogL15bMC05YS16QS1aXFx1MDBDMC1cXHUwMEQ2XFx1MDBEOS1cXHUwMEY2XFx1MDBGOS1cXHUwMEZEXSskLyxcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dFwiOiBcIiogQXVjdW4gY2FyYWN0w6hyZSBzcMOpY2lhbCBuJ2VzdCBhY2NlcHTDqVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cdFx0XHRcdC8vIC0tLSBDVVNUT00gUlVMRVMgLS0gVGhvc2UgYXJlIHNwZWNpZmljIHRvIHRoZSBkZW1vcywgdGhleSBjYW4gYmUgcmVtb3ZlZCBvciBjaGFuZ2VkIHRvIHlvdXIgbGlraW5nc1xyXG4gICAgICAgICAgICAgICAgXCJhamF4VXNlckNhbGxcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6IFwiYWpheFZhbGlkYXRlRmllbGRVc2VyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJleHRyYURhdGFcIjogXCJuYW1lPWVyaWNcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dExvYWRcIjogXCIqIENoYXJnZW1lbnQsIHZldWlsbGV6IGF0dGVuZHJlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCIqIENlIG5vbSBlc3QgZMOpasOgIHByaXNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiYWpheE5hbWVDYWxsXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInVybFwiOiBcImFqYXhWYWxpZGF0ZUZpZWxkTmFtZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYWxlcnRUZXh0XCI6IFwiKiBDZSBub20gZXN0IGTDqWrDoCBwcmlzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRPa1wiOiBcIipDZSBub20gZXN0IGRpc3BvbmlibGVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImFsZXJ0VGV4dExvYWRcIjogXCIqIENoYXJnZW1lbnQsIHZldWlsbGV6IGF0dGVuZHJlXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcInZhbGlkYXRlMmZpZWxkc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJhbGVydFRleHRcIjogXCJWZXVpbGxleiB0YXBlciBsZSBtb3QgSEVMTE9cIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAkLnZhbGlkYXRpb25FbmdpbmVMYW5ndWFnZS5uZXdMYW5nKCk7XHJcbn0pKGpRdWVyeSk7Il19
