(function (root, factory) {
    var nsParts = 'lagrange/forms/AjaxForm'.split('/');
    var name = nsParts.pop();
    var ns = nsParts.reduce(function(prev, part){
        return prev[part] = (prev[part] || {});
    }, root);

    if (typeof exports === 'object') {
        // CommonJS
        ns[name] = module.exports = factory(require('jquery'), require('./AjaxRequest.js'));
    } else {
        // Browser globals
        ns[name] = factory(root.jQuery, ns.AjaxRequest);
    }
}(this, function ($, AjaxRequest) {
    //===================================================================================
    //  AjaxForm : Constructor function
    //
    //  @params : form : jQuery object of the form
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
    var AjaxForm = function(form, postingOptions) {
        this.form = form;
        if(postingOptions && postingOptions.capsule !== undefined) {
            this.capsule = postingOptions.capsule;
        }

        this.fields = [];
        this.AjaxRequest = new AjaxRequest(postingOptions);
        this.setupForm();
    };
    
    AjaxForm.prototype = {
        //===========================================================
        // setupFields : Sets the fields of the form in this.fields
        //===========================================================
        setupFields:function(){
            var _self = this;
            _self.form.find(':input').not('[type=submit]').each(function(){
                var input = $(this);

                _self.fields.push({
                    "input": input,
                    "type": input.attr("type")
                });
            });
        },

        //===========================================================
        // setupForm : Sets the form and validation on click, and
        //              calls validCb after validation. Posts to the
        //              server using AjaxPoster.
        //
        // @params : validCb : function to be called after validation
        //                      of the form.
        //===========================================================
        setupForm:function(validCb) {
            this.setupFields();

            var _self = this;
            _self.form.find('[type=submit]').on('click', function(e) {
                e.preventDefault();

                for (var i = 0; i < _self.fields.length; i++) {
                    switch (_self.fields[i]["type"]) {
                        case "email":
                            if (!_self.validateEmailInput(_self.fields[i]["input"]))
                                return;
                            break;
                        default:
                            if (!_self.validateTextInput(_self.fields[i]["input"]))
                                return;
                            break;
                    }
                }

                if(validCb) validCb();

                var _post = _self.getPost();

                if (_post && _post != {}) {
                    _self.AjaxRequest.makeRequest(_post);
                }
            });
        },

        //===========================================================
        // getPost : Returns the post of the form as an object 
        //
        // @returns : post : Object containing keys and values for 
        //                    input names and values.
        //===========================================================
        getPost:function() {
            var post = {};
            var _self = this;
            if(_self.capsule !== undefined)
                post[_self.capsule] = {};

            this.form.find(':input').not('[type=radio]').each(function() {
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
                    if(_self.capsule !== undefined && !inp.hasClass('dontEncapsulate'))
                        post[_self.capsule][n] = inpVal;
                    else
                        post[n] = inpVal;
                }
            });

            this.form.find(':radio').filter(':checked').each(function() {
                var inp = $(this);
                var inpVal = inp.val();
                
                if(_self.capsule !== undefined && !inp.hasClass('dontEncapsulate'))
                    post[_self.capsule][inp.attr('name')] = inpVal;
                else
                    post[inp.attr('name')] = inpVal;
            });
            //console.dir(post);
            return post;
        },

        //=====================================================================
        // validateTextInput : Validates a text input
        //
        // @params : input : jQuery object of the input to be validated
        //
        // @returns : bool
        //=====================================================================
        validateTextInput:function(input) {
            if (input.val() === undefined || input.val() === "") {
                input.addClass("error");
                return false;
            } else {
                return true;
            }
        },

        //=====================================================================
        // validateEmailInput : Validates an email input
        //
        // @params : input : jQuery object of the input to be validated
        //
        // @returns : bool
        //=====================================================================
        validateEmailInput:function(input) {
            if (input.val() === undefined || input.val() === "") {
                input.addClass("error");
                return false;
            } else {
                return true;
            }
        },

        
        /**
        
        getAjaxParams : gets an object to post to jQuery.ajax correspondig to the current form, including method and url

        @params : default : object with default values

        */
        getAjaxParams : function(defaults){
            return $.extend({}, defaults, {
                url : defaults.url || this.form.attr('action') || '.',
                type : String(defaults.type || this.form.attr('method') || 'get').toLowerCase(),
                data : this.getPost()
            });
        }
    };

    AjaxForm.factory = function(instance) {
        instance = instance || {};
        return AbstractTransition.call(instance);
    };

    return AjaxForm;
}));