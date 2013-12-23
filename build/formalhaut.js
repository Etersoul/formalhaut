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

        build.ajax = function (opt) {
            return $.ajax({
                url: opt.url,
                data: opt.data || {},
                type: opt.type || 'GET',
                contentType: opt.contentType || 'application/json',
                dataType: opt.dataType || 'json',
                success: function (data, status) {
                    // Is not logged in
                    if (data.status === '400') {
                        
                    } else {
                        opt.success(data.data, status);
                    }
                },
                complete: opt.complete || null,
                error: function () {
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
    
    var localConfig = {};
    $F.loadConfig = function (config) {
        localConfig = config;
    };
    
    $F.getConfig = function (key) {
        return localConfig[key];
    };
    
    /** Shorthand of $F.ajax with URL that have been prepended with serviceUri **/
    $F.service = function (data) {
        data.url = localConfig.serviceUri + data.url;
        return $F.ajax(data);
    };
})(jQuery, $F);
/** Formatting Toolbelt for Formalhaut **/
(function ($, $F) {
    "use strict";
    
    $F.format = {};
    
    $F.format.longDate = function (date) {
		if (typeof date != 'string' || /^\d{4}-\d\d-\d\d$/.test(date) == false) {
			return 'Invalid format (yyyy-mm-dd)';
		}
		
		var month = BM.months;
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
        
		var month = BM.shortMonths;
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
})(jQuery, $F);/** Navigation for Formalhaut **/
(function ($, $F) {
    "use strict";
    var nav = {};

    nav.subView = null;
    nav.currentSubView = null;
    nav.scriptStack = [];
    nav.executionStack = [];
    nav.rel = '';

    nav.getScript = function getScript(opt) {
        // take the previous hash, and iterate from the fullest path to the only first part of path.

        // check if we have reach the parent module, and stop fetching script immediately if true
        for (var i = nav.scriptStack.length - 1; i >= 0; i--) {
            if (nav.scriptStack[i].req == opt.hash) {
                // clear the stack until the parent module
                while (nav.scriptStack.length > 0) {
                    var l = nav.scriptStack[nav.scriptStack.length - 1].req;
                    // if the stack string length is less than the current iteration hash string length, stop because the result will always no
                    if (l.length < opt.hash.length || l == opt.hash) break;

                    nav.scriptStack.pop();
                }

                // run the onLoaded function of the parent
                var arg = {
                    fullParam: opt.query,
                    param: opt.query.split('/')
                };

                for (var j = 0; j < scriptStack.length; j++) {
                    nav.scriptStack[j].script.onLoaded(arg);
                }

                nav.getHTML(opt.query);
                return;
            }
        }

        // Check if the debug mode is activated
        var getDebug;
        if ($F.debug) {
            getDebug = nav.getDebugScript;
        } else {
            getDebug = $.getScript;
        }

        getDebug('view/' + opt.hash + '.js', function () {
            var subView = BM.subView;

            var stack = {
                script: subView,
                req: opt.hash
            }
            if (typeof subView.require != 'undefined') {
                opt.hash = subView.require;
            } else {
                // reset scriptstack if we reach the main module
                opt.hash = '';
                nav.scriptStack = [];
            }
            nav.executionStack.push(stack);

            if (opt.hash == '') {
                nav.getHTML(opt.query);
                return;
            }

            nav.getScript({
                hash: opt.hash,
                query: opt.query,
                parent: nav.subView
            });
        });
    };

    nav.getHTML = function getHTML(q) {
        if (nav.executionStack.length == 0)
            return;

        var stack = nav.executionStack.pop();
        var subView = stack.script;

        if (nav.scriptStack.length > 0) {
            subView.parent = nav.scriptStack[scriptStack.length - 1].script;
        }
        
        nav.scriptStack.push({
            script: subView,
            req: stack.req
        });

        var req = stack.req;
        nav.currentSubView = subView;

        if (typeof subView.rel != 'undefined' && $('#' + subView.rel).length > 0)
            nav.rel = subView.rel;
        else
            nav.rel = BM.defaultRel;

        $('#' + nav.rel).load('view/' + req + '.html', function () {
            //onLoadedCommonFunction();
            var qs = q.split('/');

            // execute onLoaded script from the view's script
            var arg = {
                fullParam: q,
                param: qs
            };
            subView.onLoaded(arg);

            document.title = BM.module + ' | ' + subView.title;
            if (executionStack.length == 0) {
                if (typeof subView.onDefaultChild == 'function') {
                    subView.onDefaultChild(arg);
                }
                return;
            }
            nav.getHTML(q);
        });
    };

    nav.getDebugScript = function getDebugScript(url, callback) {
        var script = $('<script></script>').attr('src', url);
        $('head').append(script);
    };

    /******** Formalhaut Engine Hook *********/

    // new way to load view script
    $F.loadView = function loadView(obj) {
        //console.info('Load subview ' + obj.title);
        nav.subView = obj;
    };

    // force refresh the current view, including reload the script and the html
    $F.refreshSubView = function refreshView(obj) {
        subView = null;
        nav.getScript({
            hash: location.hash
        });
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
			console.log(act);
			console.log(wd);
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
    
})(jQuery, $F);/** Validation Library for Formalhaut **/
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
