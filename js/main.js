$(document).ready(function(){
	var input_fields = $('input[type=text], input[type=email], input[type=number], input[type=password]');
	input_fields.on('blur change', function(){
		var el = $(this);
		if(el.val() == "") el.addClass('empty');
		else el.removeClass('empty');
	}).trigger('blur');
});