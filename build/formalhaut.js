/** Core Formalhaut File **/
var $F = ($F) ? $F : null;

(function ($) {
    "use strict";

    checkF();

    function checkF() {
        if (!$ && $.fn.jQuery.split('.')[0] != '1' && parseInt($.fn.jQuery.split('.')[1]) < 10) {
            console.error('Formalhaut JS engine needs jQuery 1.10');
        }
        
        if ($F !== null) {
            return;
        } else {
            $F = initF();
        }
    }

    function initF() {
        var config = {};
        
        var build = function () {
        
        };
        
        // Move global window to $F.window. In short, no DOM accessing global variable allowed.
        build.window = window;

        build.ajax = function (opt) {
            return $.ajax({
                url: opt.url,
                data: opt.data || {},
                type: opt.type || 'GET',
                contentType: opt.contentType || 'application/json',
                dataType: opt.dataType || 'json',
                success: function (data, status) {
                    // Support for legacy code without status
                    if (!data.status) {
                        var oldData = data;
                        data = {};
                        data.status = '200';
                        data.data = oldData;
                        
                        console.warn('Using the old service payload style. Please move to the new service style');
                    }
                    
                    opt.success(data.data, data.status);
                },
                complete: opt.complete || null,
                error: function (data) {
                    if (data.status === 401) {
                        location.href = $F.config.get('loginUri');
                    }
                    $F.logError('Ajax error');
                }
            });
        };

        build.get = function (url, onComplete) {
            return $F.ajax({
                url: url,
                type: 'GET',
                complete: onComplete
            });
        };

        build.post = function (url, data, onComplete) {
            return $F.ajax({
                url: url,
                type: 'POST',
                data: data,
                contentType: 'application/json',
                complete: onComplete
            });
        };
        
        /** Shorthand of $F.ajax with URL that have been prepended with serviceUri **/
        build.service = function (data) {
            data.url = $F.config.get('serviceUri') + data.url;
            return build.ajax(data);
        };

        build.logError = function (err) {
            console.error(err);
        };

        build.setConfig = function (configData) {
            config = configData;
        };

        build.hook = function (func) {

        };
        
        build.help = function () {
            var arr = [];
            for (var i in build) {
                if (typeof build[i] === 'function') {
                    arr.push(i + '()');
                }
            }
            
            console.info(arr.join(', '));
        };

        return build;
    }

    function sendToLogin(message) {
        location.href = message;
    }

})(jQuery);/** Configuration Processing for Formalhaut **/
(function ($, $F) {
    "use strict";
    
    var hook = [];
    var localConfig = {};
    
    $F.config = {};
    
    $F.config.load = function (config) {
        localConfig = config;
        for (var i in hook) {
            hook[i]();
        }
    };
    
    $F.config.get = function (key) {
        return localConfig[key];
    };
    
    $F.config.hook = function (fn) {
        if (typeof fn === 'function') {
            hook.push(fn);
        }
    };
})(jQuery, $F);
/** This is a compatibility layer for Formalhaut engine.
  * This file is only temporary and might be removed when the system isn't needed anymore
  **/
var BM = {};
(function ($, $F) {
    "use strict";
    
    $F.compat = {};
    
    $F.compat.subViewInit = function (navSubView) {
        if (navSubView != null) {
            return navSubView;
        }
        
        // Access global var of window.subView
        if (window.subView) {
            var sv = window.subView;
            sv.afterLoad = sv.onLoaded;
            
            console.warn('Using deprecated var subView.');
            alert('Using deprecated var subView.');
            
            return sv;
        }
    }
    
    $F.config.hook(function() {
        BM.ajax = function (data) {
            $F.ajax(data);
        };
        
        BM.serviceUri = $F.config.get('serviceUri');
    });
})(jQuery, $F);
/** Formatting Toolbelt for Formalhaut **/
(function ($, $F) {
    "use strict";
    
    $F.format = {};
    
    $F.format.longDate = function (date) {
		if (typeof date != 'string' || /^\d{4}-\d\d-\d\d$/.test(date) == false) {
			return 'Invalid format (yyyy-mm-dd)';
		}
		
		var month = $F.config.get('months');
		var d = date.split(/-/);
		if(d[1][0]=='0'){
			d[1] = parseInt(d[1][1]);
		} else {
			d[1] = parseInt(d[1]);
		}
		
		if(d[2][0]=='0'){
			d[2] = d[2][1];
		}
		return d[2] + ' ' + month[d[1]] + ' ' + d[0];
	};
	
	$F.format.shortDate = function (date) {
		if (typeof date != 'string' || /^\d{4}-\d\d-\d\d$/.test(date) == false) {
			return 'Invalid format (yyyy-mm-dd)';
		}
        
		var month = $F.config.get('shortMonths');
		var d = date.split(/-/);
		if (d[1][0] == '0'){
			d[1] = parseInt(d[1][1]);
		} else {
			d[1] = parseInt(d[1]);
		}
		
		if(d[2][0] == '0'){
			d[2] = d[2][1];
		}
        
		return d[2] + ' ' + month[d[1]] + ' ' + d[0];
	};
	
	$F.format.date = function (date) {
		var d = date.split(/-/);
		return d[2] + '/' + d[1] + '/' + d[0];
	};
	
	$F.format.period = function (period) {
        if (/\d{4}-\d-\d/.test(period) === false) {
            return period || '';
        }
        
		var p = period.split(/-/);
		p[0] = p[0] + '/' + (parseInt(p[0]) + 1).toString();
		
		if (p[1] == '1') {
			p[1] = 'Odd';
		} else if (p[1] == '2') {
			p[1] = 'Even';
		} else if (p[1] == '3') {
			p[1] = 'Compact';
		}
		
		if (p[2] == '0') { 
			return p[0] + ' - ' + p[1];
		}
		
		return p[0] + ' - ' + p[1] + ' - ' + p[2];
	};
    
	$F.format.number = function (number) {
		if (number == null) {
            return number;
        }
        
		var num = number.toString();
		if (/^-?[0-9.]*(,[0-9]*)?$/.test(num)) {
			num = num.replace(/\./g,'').split(',');
			var s2 = '', dot = '';
			while (num[0].length > 0){
				if (num[0] == '-') {
					s2 = '-' + s2;
					break;
				}
                
				s2 = num[0].substr((num[0].length - 3 >= 0 ? num[0].length - 3 : 0), 3) + dot + s2;
				dot = '.';
				num[0] = num[0].substr(0, num[0].length - 3);
			}
            
			if (num.length > 1) {
                s2 += ',' + num[1];
            }
			num = s2;
		}
		
		return num;
	};
    
	$F.format.shortTime = function (time) {
		var t = time.split(':');
		return t[0] + ':' + t[1];
	};
    
	$F.format.longTime = function (time) {
		var t = time.split(':');
		return t[0] + ':' + t[1] + ':' + t[2].substr(0,2);
	};
    
	$F.format.dateTime = function (input, formatDateCallback, formatTimeCallback) {
		formatDateCallback = formatDateCallback || 'Date';
		formatTimeCallback = formatTimeCallback || 'ShortTime';
		
		var t = input.split(' ');
		var call = formatDateCallback;
		var date = $F.format[call](t[0]);
		
		var time = t[1];
		if(formatTimeCallback != '') {
			var callTime = formatTimeCallback;
			time = $F.format[callTime](time);
		}
		
		return date + ' ' + time;
	};
})(jQuery, $F);
/** Navigation for Formalhaut **/
(function ($, $F) {
    "use strict";
    
    /** Private member **/
    var lastHash = '';
    var ndLastHash = '';
    var lastParam = '';
    var isFirstLoad = true;
    var executionStack = [];
    var scriptStack = [];
    
    /** Instance member **/
    var nav = {};

    nav.subView = null;
    nav.currentSubView = null;
    nav.rel = '';
    
    init();
    
    // Bind the config hook to prepare
    $F.config.hook(function () {
        nav.defaultRel = $F.config.get('defaultRel');
    });
    
    /** Public Function **/
    $F.nav = {};
    
    // Set the location (hash) to the specific path
    $F.nav.setLocation = function setUrl(path) {
        location.hash = path;
    };
    
    // Force refresh the current view, including reload the script and the html
    $F.nav.refreshSubView = function refreshView(obj) {
        subView = null;
        nav.getScript({
            hash: location.hash
        });
    };
    
    
    // Reste the navigation engine
    nav.reset = function navInit() {
        nav.rel = '';
        nav.subView = null;
        nav.currentSubView = null;
        scriptStack = [];
        executionStack = [];
    };

    nav.getScript = function getScript(opt) {
        // take the previous hash, and iterate from the fullest path to the only first part of path.

        // check if we have reach the parent module, and stop fetching script immediately if true
        for (var i = scriptStack.length - 1; i >= 0; i--) {
            if (scriptStack[i].req === opt.hash) {
                // clear the stack until the parent module
                while (scriptStack.length > 0) {
                    var l = scriptStack[scriptStack.length - 1].req;

                    // if the stack string length is less than the current iteration hash string length, stop because the result will always no
                    if (l.length < opt.hash.length || l == opt.hash) break;

                    scriptStack.pop();
                }

                // run the afterLoad function of the parent, and process the HTML data
                var arg = {
                    fullParam: opt.query,
                    param: opt.query.split('/')
                };

                for (var j = 0; j < scriptStack.length; j++) {
                    if (typeof scriptStack[j].script.afterChildLoad === 'function') {
                        scriptStack[j].script.afterChildLoad(arg);
                    }
                }
                
                nav.getHTML(opt.query);
                return;
            }
        }

        // Check if the debug mode is activated
        var getDebug;
        if ($F.config.get('debug')) {
            getDebug = nav.getDebugScript;
        } else {
            getDebug = $.getScript;
        }

        getDebug($F.config.get('viewUri') + opt.hash + '.js', function () {
            // TODO: remove compatibility layer
            var view = $F.compat.subViewInit(nav.subView);
            
            // Clear the nav.subView
            nav.subView = null;
            var stack = {
                script: view,
                req: opt.hash
            };
            
            var required = '';
            if (typeof view.require != 'undefined') {
                required = view.require;
            } else {
                // reset scriptstack if we reach the main module
                scriptStack = [];
            }
            
            executionStack.push(stack);

            // No more required script to fetch, start getting the HTML
            if (required === '') {
                nav.getHTML(opt.query);
                return;
            }

            nav.getScript({
                hash: required,
                query: opt.query,
                parent: view
            });
        });
    };

    nav.getHTML = function getHTML(q) {
        if (executionStack.length == 0)
            return;

        var stack = executionStack.pop();
        var view = stack.script;

        if (scriptStack.length > 0) {
            view.parent = scriptStack[scriptStack.length - 1].script;
        }
        
        scriptStack.push({
            script: view,
            req: stack.req
        });

        var req = stack.req;
        nav.currentSubView = view;

        var rel = nav.defaultRel;
        if (typeof view.rel !== 'undefined' && $('#' + view.rel).length > 0) {
             rel = view.rel;
        }
        
        $('#' + rel).load($F.config.get('viewUri') + req + '.html', function () {
            //onLoadedCommonFunction();
            var qs = q.split('/');

            // execute onLoaded script from the view's script
            var arg = {
                fullParam: q,
                param: qs
            };
            
            view.afterLoad(arg);

            document.title = view.title;
            if (executionStack.length == 0) {
                if (typeof view.onDefaultChild == 'function') {
                    view.onDefaultChild(arg);
                }
                return;
            }
            
            nav.getHTML(q);
        });
    };

    nav.getDebugScript = function getDebugScript(url, callback) {
        var script = $('<script></script>').attr('src', url);
        $('head').append(script);
        callback();
    };

    /******** Formalhaut Engine Hook *********/

    // new way to load view script
    $F.loadView = function loadView(obj) {
        nav.subView = obj;
    };

    // Inialization function
    function init() {
        $(window).on('hashchange', function () {
            //nav.reset();
            
            if (window.location.hash.substr(1,1) === '/') {
                var hash = window.location.hash.substr(2)
                var q = '';
                var h2 = '';
                
                // Default for h is the first hash itself
                var h = hash;
                
                // get second hash
                if (h.search(/#/) != -1) {
                    h2 = hash.substr(h.search(/#/)+1);
                    h = hash.substr(0,h.search(/#/));
                }
                
                // Split the dot argument with the physical path
                if (h.search(/\./) != -1) {
                    q = h.substr(h.search(/\./)+1);
                    h = h.substr(0,h.search(/\./));
                }
                
                if (lastHash == h) {
                    // just the query is changed
                    if (lastParam != q) {
                        var current = nav.currentSubView;
                        var arg = {
                            fullParam: q,
                            param: q.split('/')
                        };
                        for (;;) {
                            current.afterParamLoaded(arg);
                            if(typeof current.parent == 'undefined') break;
                            current = current.parent;
                        }
                        
                        lastParam = q;
                        return;
                    }
                }
                
                // check if second hash changed
                if (ndLastHash != h2) {
                    // show the popup
                    var gpaboxAj;
                    if (h2 != '') {
                        var fancySplit = h2.split('.');
                        $.getScript('view/'+h+'/'+fancySplit[0]+'.js',function(){
                            $.get('view/'+h+'/'+fancySplit[0]+'.html', function(data){
                                $F.popup.show({
                                    content: data,
                                    scrolling: 'no',
                                    minHeight: '700px',
                                    afterClose: function() {
                                        location.hash='#/'+h;
                                    }
                                });
                            
                                if(typeof popupSubView == "object") {
                                    var arg2 = {
                                        fullParam: '',
                                        param: null
                                    };
                                    if(fancySplit.length > 1) {
                                        arg2.fullParam = fancySplit[1];
                                        arg2.param = fancySplit[1].split('/');
                                    }
                                    popupSubView.parent = nav.currentSubView;
                                    
                                    popupSubView.afterLoad(arg2);
                                }
                            }, 'html');
                        });
                    } else {
                        $F.popup.close();
                    }
                    ndLastHash = h2;
                    
                    if (!isFirstLoad) {
                        return;
                    }
                }
                
                isFirstLoad = false;
                
                // Cut the physical path data to the array
                var pathArray = h.split(/\//g);
                
                // if we go to the ancestor path, invalidate last path data and stack
                if(lastHash.indexOf(h) == 0) {
                    lastHash = '';
                    executionStack = [];
                }
                
                var i=0;
                nav.getScript({
                    hashList: pathArray,
                    hash: h,
                    query: q
                });
                
                lastHash = h;
                lastParam = q;
            
                $('a').off('click', nav.anchorBind).on('click', nav.anchorBind);
            }
        });
    }
})(jQuery, $F);
/** Popup module for Formalhaut Engine **/
(function ($, $F) {
    "use strict";
    
    var isPopupActive = false,
        element = null;
    
    $F.popup = {};
    
    $F.popup.show = function (obj) {
        if(this.isPopupActive) return;
        
        obj.content = obj.content || '';
        obj.width = obj.width || 'auto';
        obj.height = obj.height || 'auto';
        obj.modal = obj.modal || false;
        
        var w = $(window).width();
        var h = $(window).height();
        var self = this;
        
        var d = $('<div></div>').css({width: obj.width, height: obj.height, background: '#fff', zIndex: '11005', position: 'absolute', border: '5px solid #ccc', padding: '10px', borderRadius: '10px' }).html(obj.content);
        var bg = $('<div></div>').css({width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', position:'absolute', zIndex: '11000', top: '0', left: '0' });
        
        var wrap = $('<div></div>').css({width: w + 'px', height: h + 'px', position:'fixed', top: '0', left: '0', zIndex: '10999', opacity: '0' });
        
        // add event onclick that will remove the popup if it's not a modal popup
        if(!obj.modal) {
            var del = $('<div></div>').css({
                width: '20px',
                height: '17px',
                position:'absolute',
                top: '-15px',
                right: '10px',
                background: '#333',
                borderRadius: '14px',
                border: '4px solid #ccc',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'center',
                paddingBottom: '2px',
                cursor:'pointer'
            }).html('X').click(function() {
                self.close({ afterClose: obj.afterClose });
            });
            
            bg.click(function() {
                self.close({ afterClose: obj.afterClose });
            });
            d.append(del);
        }
        

        wrap.append(bg).append(d);
        
        $('body').css({position: 'relative', 'overflow': 'hidden'}).append(wrap);
        wrap.animate({opacity: 1}, 250);
        
        // reposition the popup
        var wd = d.width();
        var wh = d.height();
        resizePopup();
        $(window).on('resize.popup', resizePopup);
        
        isPopupActive = true;
        element = wrap;
        
        function resizePopup() {
            w = $(window).width();
            h = $(window).height();
            wrap.css({width: w + 'px', height: h + 'px'});
            d.css({width: obj.width, height: obj.height});
            d.css('left', (w / 2 - wd / 2 - 15) + 'px');
            d.css('top', (h/2 - wh/2 - 15) + 'px');
        }
    }
    
	$F.popup.close = function (param) {
        param = param || {};
        if(param.afterClose) {
            param.afterClose();
        }
        
        isPopupActive = false;
        $('body').css({'overflow': ''});
        element.animate({opacity: '0'}, 250, function() { $(this).remove() });
    };
    
})(jQuery, $F);
/** Data serialization for Formalhaut **/
(function ($, $F) {
    "use strict";
    
    $F.serialize = function (selector, returnStringify) {
        returnStringify = (returnStringify == null) ? false : returnStringify;
        
        var json = {};
		jQuery.map($(selector).serializeArray(), function(n, i){
			if(typeof json[n.name] == 'undefined') {
				json[n.name] = n.value;
			} else {
				if(typeof json[n.name] == 'object') {
					json[n.name].push(n.value);
				} else {
					var temp = json[n.name];
					json[n.name] = [temp, n.value];
				}
			}
		});
        
        if (returnStringify) {
            return JSON.stringify(json);
        }
        
        return json;
    };
    
})(jQuery, $F);
/** Tutorial Processing Engine for Formalhaut **/
(function ($, $F) {
    var tutorialStep = -1,
        tutorialScript = null;
    
    $F.tutorial = {};
    
	$F.tutorial.loadTutorial = function (script) {
		$.ajax({
			url: $F.getConfig('tutorialDirectory') + script,
			type: 'GET',
			dataType: 'json',
			success: function(data) {
				tutorialScript = data;
				$F.tutorial.processTutorial();
			}
		});
	};
    
	$F.tutorial.processTutorial = function () {
		if (tutorialScript == null) {
            return;
        }
		
		tutorialStep++;
		
		// destroy anything if we reach the end
		if (tutorialScript[tutorialStep] === undefined) {
			$('#tutorialenginelayer').remove();
			$('body').css('overflow', 'auto');
			tutorialScript = null;
			tutorialStep = -1;
			return;
		}
		
		$F.tutorial.tutorial(tutorialScript[tutorialStep]);

	};
    
	$F.tutorial.tutorial = function (act) {
		// unbind and rebind to render the tutorial layer on window resize
		var stateAct = act;
		$(window).off('resize.rendertutorial').on('resize.rendertutorial', function(){
			$F.tutorial.tutorial(stateAct);
		});
		
		act.disableCenter = act.disableCenter || true;
		
		$('#tutorialenginelayer').remove();
		
		// disable the global scrolling
		$('body').css('overflow', 'hidden').append('<div id="tutorialenginelayer" style="z-index: 9999;"></div>');
		
		switch (act.type) {
		case 'show':
		default:
			// define the box
			var north = $('<div style="width: 100%; position: absolute; background: rgba(0, 0, 0, 0.5); top: 0px; z-index: 2000;"></div>');
			var south = $('<div style="width: 100%; position: absolute; background: rgba(0, 0, 0, 0.5); height: 100%; z-index: 2000;"></div>');
			var west = $('<div style="position: absolute; background: rgba(0, 0, 0, 0.5); z-index: 2000;"></div>');
			var east = $('<div style="width: 100%; position: absolute; background: rgba(0, 0, 0, 0.5); z-index: 2000;"></div>');
			
			if(act.focusNode != undefined) {
				act.x = $(act.focusNode).eq(0).offset().left;
				act.y = $(act.focusNode).eq(0).offset().top;
				act.w = $(act.focusNode).eq(0).innerWidth();
				act.h = $(act.focusNode).eq(0).innerHeight();
			}
			
			if(act.padding) {
				act.x -= act.padding;
				act.y -= act.padding;
				act.w += act.padding * 2;
				act.h += act.padding * 2;
			}
			
			var wd = { h: $('html').innerHeight(), w: $('html').innerWidth(), y: $(document).scrollTop() };
			
			// auto scroll if out of viewport
			if (act.y + act.h < wd.y || act.y < wd.y) {
				$('html,body').stop().animate({ scrollTop: act.y - 50 }, 300);
			} else if (act.y + act.h > wd.h + wd.y || act.y > wd.h + wd.y) {
				$('html,body').stop().animate({ scrollTop: act.y - 50 }, 300);
			}
			
			north.css({ height: act.y + 'px' });
			south.css({ top: (act.y + act.h) + 'px' });
			west.css({ top: act.y + 'px', width: act.x + 'px', height: act.h + 'px' });
			east.css({ top: act.y + 'px', height: act.h + 'px', left: (act.x + act.w) + 'px' });
			
			$('#tutorialenginelayer').append(north).append(south).append(west).append(east);
			
			// disable inner if needed
			if (act.disableCenter) {
				var center = $('<div style="position: absolute; z-index: 500;"></div>');
				center.css({width: act.w, height: act.h, top: act.y, left: act.x});
				$('#tutorialenginelayer').append(center);
			}
			
			// send in the message box
			var msgbox = $('<div style="border: 3px solid #999;position:absolute; z-index: 505; width: 300px; height: 100px; background: #fff; padding: 5px;font-size:11px;"></div>');
			
			var msgw = act.messageW || 300;
			var msgh = act.messageH || 100;			
			var msgx = act.x + act.w + 20;
			var msgy = act.y;
			
			if (act.x + act.w + msgw + 20 > wd.w) {
				msgx = act.x - msgw - 20;
			}
			
			msgbox.css({top: msgy + 'px', left: msgx + 'px', width: msgw + 'px', height: msgh + 'px' });
			msgbox.html(act.message);
			$('#tutorialenginelayer').append(msgbox);
		}
	};
    
	$F.tutorial.clearTutorialLayer = function () {
		$('#tutorialenginelayer').remove();
		$('body').css('overflow', 'auto');
		
		// kill the render event on resize
		$(window).off('resize.rendertutorial');
	};
    
})(jQuery, $F);
/** Validation Library for Formalhaut **/
(function ($){
    "use strict";
	$.validation = {};
	$.validation.result = [];
	
	$.validation.lang = {
		required: '{0} is required',
		minLength: '{0} have to be at least {1} characters',
		maxLength: '{0} have to be at least {2} characters'
	};
	
	$.validation.start = function() {
		$.validation.result = [];
	};
	
	$.validation.pass = function () {
		if ($.validation.result.length > 0)
			return false;
		else
			return true;
	};
	$.validation.record = function (message) {
		$.validation.result.push(message);
	}
	
	$.validation.alert = function (message) {
		var s = message || '';
		for (var i=0; i<$.validation.result.length; i++) {
			s += '\n' + $.validation.result[i];
		}
		
		alert(s);
	}
	
	$.fn.validation = function (name, prop) {
		var validate = function (v) {
			var val = $(v).val();
			
			console.log(prop);
			console.log(name);
			if (prop.required && val.trim() == '') {
				$.validation.result.push($.validation.lang.required.replace(/\{0\}/g, name));
				return false;
			}
			
			if (prop.minLength && val.length < prop.minLength) {
				$.validation.result.push($.validation.lang.minLength.replace(/\{0\}/g, name).replace(/\{1\}/g, prop.minLength));
				return false;
			}
			
			if (prop.maxLength && val.length > prop.maxLength) {
				$.validation.result.push($.validation.lang.maxLength.replace(/\{0\}/g, name).replace(/\{1\}/g, prop.maxLength));
				return false;
			}
			
			return true;
		};
		
		return validate(this.eq(0));
	}
})(jQuery);
