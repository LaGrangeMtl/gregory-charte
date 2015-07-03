
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