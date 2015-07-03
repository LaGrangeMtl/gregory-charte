(function (root, factory) {
	var nsParts = 'lagrange/forms/AjaxRequest'.split('/');
	var name = nsParts.pop();
	var ns = nsParts.reduce(function(prev, part){
		return prev[part] = (prev[part] || {});
	}, root);

	if (typeof exports === 'object') {
	    // CommonJS
	    ns[name] = module.exports = factory(require('jquery'));
  	} else {
		// Browser globals
		ns[name] = factory(root.jQuery);
	}
}(this, function ($) {
	//==============================================================================
	//  AjaxRequest : Constructor function
	//
	//  @params : options : Object containing several settings necessary for the
	//                      well behavior of AjaxRequest. These settings are :
	//                      {
	//                          type: 'GET',
	//                          url: '',
	//                          dataType: 'JSON', // By default, is not set so that
	//                                                it uses the intelligent guess
	//                                                provided by jQuery
	//                          debugOnFailure: true,
	//                          onSuccess:this.onSuccess,
	//                          onFailure:this.onFailure,
	//                          beforeRequest:this.beforeRequest,
	//                          afterRequest:this.afterRequest      
	//                      }
	//==============================================================================
	var AjaxRequest = function(options){
		this.isPosting = false;

		this.init(options);
	};

	//==================================================================
	//  debugFailure : Called upon failure of the request.
	//
	//  This function is by default mapping errors and logging them.
	//  This behavior can be changed by setting options.debugOnFailure 
	//  to false. Logs the error in the console.
	//
	//  @params : x : Request object
	//
	//  @params : exception : Exception object
	//==================================================================
	var debugFailure = function(x, exception){
		var message;
		var statusErrorMap = {
			'400' : "Server understood the request but request content was invalid.",
			'401' : "Unauthorised access.",
			'403' : "Forbidden resouce can't be accessed",
			'404' : "File not found",
			'500' : "Internal Server Error.",
			'503' : "Service Unavailable"
		};

		if (x.status) {
			message = statusErrorMap[x.status];

			if(!message)
				message="Unknow Error, status code : " + x.status;                  
		}
		else if(exception=='parsererror'){
			message="Error.\nParsing JSON Request failed.";
		}
		else if(exception=='timeout'){
			message="Request Timed out.";
		}
		else if(exception=='abort'){
			message="Request was aborted by the server";
		}
		else {
			message="Unknow Error, exception : " + exception;
		}

		console.log(message);
	}

	//Default behaviors for before & after requests 
	var defaultDeferred = function(){
		return $.Deferred().resolve().promise();
	};

	 // Default values
	var defaultOptions = {
		type: 'GET',
		url: '',
		debugOnFailure: true,
		//====================================================
		//  onSuccess : Called upon success of the request.
		//
		//  This function can / should be overwritten.
		//====================================================
		onSuccess:function(data){
			var _data = data[0];
			console.log(_data);
		},
		//====================================================
		//  onFailure : Called upon success of the request.
		//
		//  This function can / should be overwritten.
		//====================================================
		onFailure:function(){},
		//=========================================================
		//  beforeRequest : Actions that are done before making a request.
		//
		//  This function can / should be overwritten, this
		//  function MUST return a $.Deferred()
		//
		//  @returns : dfd : $.Deferred()
		//=========================================================
		beforeRequest:defaultDeferred,
		//===================================================================
		//  afterRequest : Actions that are done after the request, regardless
		//                 of the result of the request.
		//
		//  This function can / should be overwritten, this
		//  function MUST return a $.Deferred()
		//
		//  @returns : dfd : $.Deferred()
		//===================================================================
		afterRequest:defaultDeferred
	};

	AjaxRequest.prototype = {
		//==========================================================================
		//  init : Itinialisation function. Set options using the user defined
		//          options and the default ones.
		//
		//  @params : options : Object passed by the constructor function
		//==========================================================================
		init : function(options){
			this.options = $.extend({}, defaultOptions, options);
		},

		//==========================================================================
		//  makeRequest : Main function of AjaxRequest to be called when we want to 
		//                 POST or GET data to/from a server.
		//
		//  @params : post : Post object usually representing values of a form. When
		//                    using AjaxForm, use AjaxForm.getPost() as post. 
		//
		//  @returns : afterPostDfd : $.Deferred() so that we can use it 
		//                            asynchronously and still know when it is done.
		//==========================================================================
		makeRequest : function(post){
			this.post = post;
			var options = this.options;

			// Deactivate form while posting
			if(this.isPosting === true){
				return;
			}
			
			this.isPosting = true;
			var beforePostDfd = options.beforeRequest();
			var completeDfd = $.Deferred();
			var ajaxOptions = {
				type : options.type,
				url : options.url
			};

			// If it is not set, means that we let $.Ajax's intelligent guess do it
			if(options.dataType !== undefined) {
				ajaxOptions.dataType = options.dataType;
			}

			// If the request is JSONP
			if(options.jsonpCallback !== undefined) {
				ajaxOptions.jsonpCallback = options.jsonpCallback;
			}
			// POST Request only
			if(options.type.toUpperCase() === 'POST' && options.data == undefined) {
				ajaxOptions.data = this.post;
			} else {
				ajaxOptions.data = options.data;
			}
			// Do the actual request and treat callbacks
			var postDfd = $.ajax(ajaxOptions);

			var finish = function(){
				this.isPosting = false;
				completeDfd.resolve();
			}.bind(this);
			
			$.when(postDfd, beforePostDfd).then(
				function(data){
					options.onSuccess(data);
				},
				function(data, textStatus){
					if(options.debugOnFailure) {
						debugFailure(data, textStatus);
					}
					options.onFailure();
				}
			).always(function(){
				options.afterRequest().done(finish);
			}); 

			return completeDfd.promise();
		},

		
	};

	return AjaxRequest;
}));