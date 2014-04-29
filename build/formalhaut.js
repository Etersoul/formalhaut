/** Core Formalhaut File **/
var $F = ($F) ? $F : null;

(function ($) {
    "use strict";

    var ajaxRequest = 0,
        processedRequest = 0,
        startRequest = 0;
    checkF();

    $(window).ready(function() {
        initBar();
    });

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
            ++ajaxRequest;
            if (!showLoadBar) {
                loadBar();
            }

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
                complete: function () {
                    ++processedRequest;
                    if (opt.complete) {
                        opt.complete.apply(this, arguments);
                    }

                    $F.nav.prepareHashModifier();
                },
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
            var ret = build.ajax(data);
            return ret;
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

    function initBar() {
        $('body').append($('<div id="loading-bar"></div>').css({
            background: 'rgba(255, 255, 0, 0.8)',
            display: 'none',
            height: '2px',
            position: 'fixed',
            top: '0',
            left: '-2px',
            zIndex: '11999',
            boxShadow: '2px 2px 2px #000'
        }));
    }

    var barTimeout = 20;
    var barClearTimeout;
    var maxAnimation = 20;
    var curAnimation = 0;
    var curProcessedRequest = 0;
    var showLoadBar = false;
    function loadBar() {
        showLoadBar = true;
        var w = $(window).width();

        if (curProcessedRequest !== processedRequest) {
            curAnimation = 0;
            curProcessedRequest = processedRequest;
        }

        if (curAnimation <= maxAnimation) {
            ++curAnimation;
        }

        if (processedRequest >= ajaxRequest) {
            barTimeout--;

            // Reset the timeout
            if (barTimeout == 0) {
                barTimeout = 20;
                processedRequest = 0;
                ajaxRequest = 0;
                barClearTimeout = 20;
                clearBar();
                return;
            }
        } else {
            w = ((processedRequest / ajaxRequest) * w) + ((curAnimation / maxAnimation) * ((1 / ajaxRequest) * w * (3/5))) + 2;
            $('#loading-bar').show().width(w);
            barTimeout = 10;
        }

        setTimeout(loadBar, 50);
    }

    function clearBar() {
        var w = $(window).width();
        $('#loading-bar').width(w);

        --barClearTimeout;

        if(barClearTimeout === 0) {
            $('#loading-bar').fadeOut();
            showLoadBar = false;
            return;
        }

        setTimeout(clearBar, 50);
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
            
            // Clean up the global variable
            delete window.subView;
            sv.afterLoad = sv.onLoaded;
            
            console.warn('Using deprecated var subView. Please change to $F.loadView.');
            alert('Using deprecated var subView. Please change to $F.loadView.');
            
            return sv;
        }
    };
    
    $F.compat.popupSubViewInit = function (navSubView) {
        if (navSubView != null) {
            return navSubView;
        }
        
        // Access global var of window.subView
        if (window.popupSubView) {
            var sv = window.popupSubView;
            
            // Clean up the global variable
            delete window.popupSubView;
            sv.afterLoad = sv.onLoaded;
            
            console.warn('Using deprecated var popupSubView. Please use $F.loadView with "popup: true".');
            alert('Using deprecated var popupSubView. Please use $F.loadView with "popup: true".');
            
            return sv;
        }
    };
    
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
        return d[2] + '-' + d[1] + '-' + d[0];
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
        return $F.format.customNumber(number, '.', ',', ',', '.');
    };

    $F.format.customNumber = function (number, commaFrom, thousandFrom, commaTo, thousandTo) {
        commaFrom = commaFrom || '.';
        thousandFrom = thousandFrom || ',';
        commaTo = commaTo || commaFrom;
        thousandTo = thousandTo || thousandFrom;

        if (number == null) {
            return number;
        }

        var num = number.toString();

        if (new RegExp("^-?[0-9" + thousandFrom + "]*(" + commaFrom + "[0-9]*)?$").test(num)) {
            num = num.replace(thousandFrom, '').split(commaFrom);
            var s2 = '', dot = '';

            if (num[0].length !== 0) {
                while (num[0].length > 0){
                    if (num[0] == '-') {
                        s2 = '-' + s2;
                        break;
                    }

                    s2 = num[0].substr((num[0].length - 3 >= 0 ? num[0].length - 3 : 0), 3) + dot + s2;
                    dot = thousandTo;
                    num[0] = num[0].substr(0, num[0].length - 3);
                }
            } else {
                s2 = '0';
            }

            if (num.length > 1) {
                s2 += commaTo + num[1];
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
    var firstLastHash = '';
    var firstLastHashNoParam = '';
    var secondLastHash = '';
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

    // Get current hash in the URL
    $F.nav.getCurrentHash = function getCurrentHash() {
        return location.hash;
    };

    // Get last hash
    $F.nav.getLastHash = function getLashHash(breakHash) {
        if (breakHash) {
            var hash = breakHash.split('.');
            return {
                first: hash[0],
                second: hash[1]
            };
        }

        return $F.nav.getLastHash();
    };

    // Get first section of last hash
    $F.nav.getFirstLastHash = function getFirstLastHash() {
        return firstLastHash;
    };

    // Get second section of last hash (argument)
    $F.nav.getLastParam = function getLastParam() {
        return lastParam;
    };

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

    // Reset the navigation engine
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
                    param: []
                };

                if (opt.query !== "") {
                    arg.param = opt.query.split('/');
                }

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

            if(typeof view.isPopup !== 'undefined' && view.isPopup) {
                console.warn('Accessing popup as a non-popup view.');
                alert('Accessing popup as a non-popup view.');
                return;
            }

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
        if (executionStack.length == 0) {
            $F.nav.fixHashModifier();
            return;
        }

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
            var par = nav.splitParameter($F.nav.getCurrentHash());
            view.afterLoad(par.arg);

            document.title = view.title;
            if (executionStack.length == 0) {
                if (typeof view.onDefaultChild == 'function') {
                    view.onDefaultChild(par.arg);
                }

                if (view.defaultChildView) {
                    history.replaceState(null, "", "#/" + view.defaultChildView);
                    $(window).trigger('hashchange');
                }

                $F.nav.prepareHashModifier();

                return;
            }

            nav.getHTML(q);
        });
    };

    nav.openPopup = function openPopup(firstHash, arg) {
        var base = firstHash.split('.');
        $.getScript('view/' + base[0] +'/' + arg[0] + '.js', function () {
            var popup = $F.compat.popupSubViewInit(nav.subView);

            $.get('view/' + base[0] + '/' + arg[0] + '.html', function (data) {
                $F.popup.show({
                    content: data,
                    scrolling: 'no',
                    autoExpand: true,
                    afterClose: function () {
                        location.hash = '#/' + firstHash;
                    }
                });

                if(typeof popup == "object") {
                    if (!popup.isPopup) {
                        console.warn('Trying to access non-popup enabled view.');
                    }

                    popup.closePopup = nav.closePopup;

                    var arg2 = {
                        fullParam: '',
                        param: []
                    };

                    if (arg.length > 1) {
                        arg2.fullParam = arg[1];

                        if (arg2.fullParam !== "") {
                            arg2.param = arg[1].split('/');
                        }
                    }

                    popup.parent = nav.currentSubView;

                    popup.afterLoad(arg2);
                }
            }, 'html');
        });
    };

    nav.closePopup = function closePopup() {
        $F.nav.setLocation('#/' + firstLastHash);
        $F.popup.close();
    };

    nav.getDebugScript = function getDebugScript(url, callback) {
        var script = $('<script></script>').attr('src', url);
        $('head').append(script);
        callback();
    };

    nav.splitParameter = function splitParameter(url) {
        var q = '',
            h = url,
            paramType = 0;

        // Split the question mark argument from the physical path
        if (url.search(/\?/) !== -1) {
            q = url.substr(url.search(/\?/) + 1);
            h = url.substr(0, url.search(/\?/));
            paramType = 2;
        }

        // Split the dot argument from the physical path
        if (url.search(/\./) !== -1) {
            var search = url.search(/\./);
            q = url.substr(search + 1);
            h = url.substr(0, search);
            paramType = 1;
        }

        var arg = {
            fullParam: q,
            param: [],
            namedParam: null
        };

        if (q !== "") {
            if (paramType == 1) { // 0 no param, 1 for dot based, 2 for question mark based
                arg.param = q.split('/');
            } else {
                arg.param = q.split('&');
                arg.namedParam = {};
                for (var i = 0; i < arg.param.length; i++) {
                    var argi = arg.param[i];
                    var search = argi.search('=');
                    var val = argi.substr(search + 1);
                    var key = argi.substr(0, search);
                    arg.namedParam[key] = val;
                }
            }
        }

        return {
            query: q,
            hash: h,
            paramType: paramType,
            arg: arg
        };
    }

    /******** Formalhaut Engine Hook *********/

    // new way to load view script
    $F.loadView = function loadView(obj) {
        nav.subView = obj;
    };

    $F.nav.fixHashModifier = function fixHashModifier(selector) {
        selector = selector || null;

        $('a[data-orig-href^="##"]', selector).each(function (i, el) {
            $(el).attr('href', '#/' + firstLastHash + '#' + $(el).attr('data-orig-href').substr(2));
        });

        $('a[data-orig-href^="#."]', selector).each(function (i, el) {
            $(el).attr('href', '#/' + firstLastHashNoParam + '.' + $(el).attr('data-orig-href').substr(2));
        });
    }

    $F.nav.prepareHashModifier = function prepareHashModifier(selector) {
        selector = selector || null;

        // Search the link that use the modifier hash
        $('a[href^="##"]', selector).each(function (i, el) {
            $(el).attr('data-orig-href', $(el).attr('href'));
        });

        // Search and proceed argument hash shorthand
        $('a[href^="#."]', selector).each(function (i, el) {
            $(el).attr('data-orig-href', $(el).attr('href'));
        });

        $F.nav.fixHashModifier(selector);
    }

    // Inialization function
    function init() {
        $(window).on('hashchange', function () {
            // Proceed second hash shorthand
            if (window.location.hash.substr(0, 2) === '##') {
                window.history.replaceState(null, "", '#/' + firstLastHash + '#' + window.location.hash.substr(2));
            }

            // Proceed argument hash shorthand
            if (window.location.hash.substr(0, 2) === '#.') {
                window.history.replaceState(null, "", '#/' + firstLastHash + '.' + window.location.hash.substr(2));
            }

            // Proceed primary hash
            if (window.location.hash.substr(0, 2) === '#/') {
                var newHash = window.location.hash;
                var hash = window.location.hash.substr(2)
                var h2 = '';
                var first = '';

                // Default for h is the first hash itself
                var h = hash;

                // get second hash
                if (h.search(/#/) != -1) {
                    h2 = hash.substr(h.search(/#/)+1);
                    h = hash.substr(0,h.search(/#/));
                }

                first = h;
                firstLastHash = h;

                var proc = nav.splitParameter(h);

                if (firstLastHashNoParam == proc.hash) {
                    // just the query is changed
                    if (lastParam != proc.query) {
                        var current = nav.currentSubView;

                        for (;;) {
                            if (current.afterParamLoad) {
                                current.afterParamLoad(proc.arg);
                            }
                            if(typeof current.parent == 'undefined') break;
                            current = current.parent;
                        }

                        lastParam = proc.query;
                        firstLastHash = first;

                        $F.nav.prepareHashModifier();
                        return;
                    }
                }

                // check if second hash changed
                if (secondLastHash != h2) {
                    // show the popup
                    var gpaboxAj;
                    if (h2 != '') {
                        var popupSplit = h2.split('.');
                        nav.openPopup(firstLastHash, popupSplit);
                    } else {
                        $F.popup.close();
                    }

                    secondLastHash = h2;

                    if (!isFirstLoad) {
                        return;
                    }
                }

                isFirstLoad = false;

                // Cut the physical path data to the array
                var pathArray = proc.hash.split(/\//g);

                // if we go to the ancestor path, invalidate last path data and stack
                if(firstLastHash.indexOf(proc.hash) == 0) {
                    firstLastHash = '';
                    executionStack = [];
                }

                var i=0;
                nav.getScript({
                    hashList: pathArray,
                    hash: proc.hash,
                    query: proc.query
                });

                firstLastHashNoParam = proc.hash;
                firstLastHash = first;
                lastHash = newHash;
                lastParam = proc.query;

                $('a').off('click.commonnav', nav.anchorBind).on('click.commonnav', nav.anchorBind);
            }
        });
    }
})(jQuery, $F);
/** Pagination system for Formalhaut **/
(function ($, $F) {
    "use strict";

    var defaultPerPage = 20;
    var defaultDataSelector = '.datatable';
    var before = 'Page: ';
    var defaultNextPrevCount = 3;
    var randomClassAppender = (function() {
        var length = 4;
        var rand = 'abcdefghijklmnopqrstuvwxyz';
        var className = '';

        for(var i = 0; i < length; i++) {
            var c = Math.random();
            var r = rand[Math.floor(c * rand.length)];
            className += r;
        }

        return className;
    })();

    $F.pagination = function (option) {
        option = option || {};
        option.before = option.before || before;
        option.dataCount = parseInt(option.dataCount || 1);
        option.perPage = parseInt(option.perPage || defaultPerPage);
        option.url = option.url || null;
        option.nextPrevCount = parseInt(option.nextPrevCount || defaultNextPrevCount);
        option.currentPage = parseInt(option.currentPage || 1);

        var element;
        if (option.element) {
            element = $(option.element);
        } else {
            if ($('.page-' + randomClassAppender).length) {
                element = $('.page-' + randomClassAppender);
                element.empty();
            } else {
                // Attempt to auto generate pagination after a table
                element = $('<div class="pagination"></div>').addClass('page-' + randomClassAppender);

                var defaultRel = $F.config.get('defaultRel');

                // Get all table in the default content element
                var tab = $('#' + defaultRel + ' table');
                if (tab.is(defaultDataSelector)) {
                    tab = tab.filter(defaultDataSelector);
                } else {
                    // Only take the first table found
                    tab = tab.eq(0);
                }

                if(tab.length === 0) {
                    var alertMsg = [];
                    alertMsg.push('Not found any table for pagination.');
                    alertMsg.push('Ensure you have at least one table or a table with "datatable" class name.');
                    alertMsg.push('Alternatively, send the element you want to populate with pagination in "element" property.');
                    console.error(alertMsg.join('\n'));
                    return;
                }

                tab.after(element);
            }
        }

        // If the data is sent instead, count the data
        if (option.data && $.isArray(option.data)) {
            option.dataCount = option.data.length;
        }

        if (option.url === null) {
            var split = $F.nav.getLastParam().split(/\//g);
            if (split.length === 1 && split[0] === '') {
                option.url = "#.{page}";
            } else {
                var pop = split[split.length - 1];
                if(isNaN(pop)) {
                    split.push('{page}');
                } else {
                    split.pop();
                    split.push('{page}');
                }

                option.url = '#.' + split.join('/');
            }
        }

        var lastPage = Math.ceil(option.dataCount / option.perPage);

        element.html('');
        element.append($('<span class="pagination">' + option.before + '</span>'));
        element.append($('<a></a>').text('<<').attr('href', replacePage(option.url, 1)));

        if (option.currentPage > 1) {
            element.append($('<a class="pageprev"></a>').text('<').attr('href', replacePage(option.url, option.currentPage - 1)));
        }

        for (var i = option.currentPage - option.nextPrevCount; i <= option.currentPage + option.nextPrevCount; i++) {
            if (i < 1 || i > lastPage) {
                continue;
            }
            
            element.append($('<a></a>').text(i).attr('href', replacePage(option.url, i)));
        }

        if (option.currentPage < lastPage) {
            element.append($('<a class="pagenext"></a>').text('>').attr('href', replacePage(option.url, option.currentPage + 1)));
        }

        element.append($('<a></a>').text('>>').attr('href', replacePage(option.url, lastPage)));
        $F.nav.prepareHashModifier(element);
    };
    
    $F.pagination.getClass = function () {
        return randomClassAppender;
    };
    
    $F.pagination.getElement = function () {
        return $('.page-' + randomClassAppender);
    };

    function replacePage(base, num) {
        return base.replace('{page}', num);
    }
})(jQuery, $F);
/** Popup module for Formalhaut Engine * */
(function($, $F) {
    "use strict";

    var isPopupActive = false,
        objOption,
        wrap = null;

    // Mutation observer (only available in modern browser and IE11+)
    var observer = new MutationObserver(function (mutations) {
        resizePopup();
    });

    $F.popup = {};

    $F.popup.show = function (obj) {
        if (isPopupActive) {
            $F.popup.close();
            isPopupActive = false;
        }

        obj.content = obj.content || '';
        obj.width = obj.width || 'auto';
        obj.height = obj.height || 'auto';
        obj.modal = obj.modal || false;
        obj.autoExpand = obj.autoExpand || false;

        objOption = obj;

        var w = $(window).width();
        var h = $(window).height();
        var self = this;

        if (wrap != null) {
            wrap = null;
        }

        var divBorder = $('<div id="popupborder"></div>').css({
            width : obj.width,
            height : obj.height,
            background : '#fff',
            zIndex : '11005',
            position : 'absolute',
            border : '5px solid #ccc',
            padding : '10px',
            borderRadius : '10px'
        });

        var bg = $('<div></div>').css({
            width : '100%',
            height : '100%',
            background : 'rgba(0,0,0,0.7)',
            position : 'absolute',
            zIndex : '11000',
            top : '0',
            left : '0'
        });

        var divContent = $('<div id="popupcontent"></div>').html(obj.content);

        wrap = $('<div></div>').css({
            width : w + 'px',
            height : h + 'px',
            position : 'fixed',
            top : '0',
            left : '0',
            zIndex : '10999',
            opacity : '0'
        });

        // add event onclick that will remove the popup if it's not a modal
        // popup
        if (!obj.modal) {
            var del = $('<div></div>').css({
                width : '20px',
                height : '17px',
                position : 'absolute',
                top : '-15px',
                right : '10px',
                background : '#333',
                borderRadius : '14px',
                border : '4px solid #ccc',
                color : '#fff',
                fontSize : '14px',
                textAlign : 'center',
                paddingBottom : '2px',
                cursor : 'pointer'
            }).html('X').click(function() {
                self.close({
                    afterClose : obj.afterClose
                });
            });

            bg.click(function() {
                self.close({
                    afterClose : obj.afterClose
                });
            });

            divBorder.append(del);
        }

        divBorder.append(divContent);
        wrap.append(bg).append(divBorder);

        $('body').css({
            position : 'relative',
            overflow : 'hidden'
        }).append(wrap);

        wrap.animate({
            opacity : 1
        }, 250);

        // reposition the popup
        resizePopup();
        $(window).on('resize.popup', resizePopup);

        isPopupActive = true;

        // Bind the mutation observer
        if (obj.autoExpand) {
            observer.observe(divBorder[0], {
                childList: true,
                subtree: true
            });
        }
    }

    $F.popup.close = function (param) {
        param = param || {};
        if (param.afterClose) {
            param.afterClose();
        }

        isPopupActive = false;
        $('body').css({
            overflow : ''
        });

        wrap.animate({
            opacity : '0'
        }, 250, function() {
            $(this).remove()
        });
    };

    $F.popup.resize = function (param) {
        param = param || {};
        param.width = param.width || null;
        resizePopup(param);
    };

    function resizePopup(param) {
        param = param || {};
        param.width = param.width || null;

        var w = $(window).width();
        var h = $(window).height();

        wrap.css({
            width : w + 'px',
            height : h + 'px'
        });

        var divBorder = $('#popupborder', wrap);
        var divContent = $('#popupcontent', divBorder);
        divBorder.css({
            width : objOption.width,
            height : objOption.height
        });

        if (param.width != null) {
            divBorder.css('width', param.width);
        }

        var wd = divBorder.width();
        var wh = divBorder.height();

        if (wh >= h - 80) {
            wh = h - 80;
            divBorder.css({
                height: wh
            });

            divContent.css({
                overflow: 'auto',
                height: wh - 10
            });
        } else {
            divBorder.css({
                height: 'auto'
            });
        }

        divBorder.css({
            left: (w / 2 - wd / 2 - 15) + 'px',
            top: (h / 2 - wh / 2 - 15) + 'px'
        });
    }
})(jQuery, $F);
/** Data serialization for Formalhaut **/
(function ($, $F) {
    "use strict";
    
    $F.serialize = function (selector, returnStringify) {
        returnStringify = (returnStringify == null) ? false : returnStringify;
        
        var json = {};
        jQuery.map($(selector).serializeArray(), function (n, i) {
            var cleanName = n.name.replace(/\[\]$/, '');
            if (typeof json[cleanName] == 'undefined') {
                if (/\[\]$/.test(n.name)) {
                    json[cleanName] = [n.value];
                } else {
                    json[cleanName] = n.value;
                }
            } else {
                if (typeof json[cleanName] == 'object') {
                    json[cleanName].push(n.value);
                } else {
                    var temp = json[cleanName];
                    json[cleanName] = [temp, n.value];
                }
            }
        });
        
        if (returnStringify) {
            return JSON.stringify(json);
        }
        
        return json;
    };
    
})(jQuery, $F);
/** Tabbed view system for Formalhaut **/
(function ($, $F) {
    "use strict";

    var defaultElementSelector = '.scrollablenav';
    var randomClassAppender = (function() {
        var length = 4;
        var rand = 'abcdefghijklmnopqrstuvwxyz';
        var className = '';

        for(var i = 0; i < length; i++) {
            var c = Math.random();
            var r = rand[Math.floor(c * rand.length)];
            className += r;
        }

        return className;
    })();

    $F.tabview = function (option) {
        option = option || {};

        var element;
        if (option.element) {
            element = $(option.element);
        } else {
            element = $(defaultElementSelector);
        }

        var wTotal = 0;
        $('li', element).each(function () {
            wTotal += $(this).width();
        });

        $(element).css('overflow', 'hidden');
        $('ul', element).width(wTotal);

        var wElement = $(element).width();
        var deltaW = wTotal + parseInt($('ul', element).css('padding-left')) + parseInt($('ul', element).css('padding-right')) - wElement;
        if (deltaW < 0) {
            deltaW = 0;
        }

        var elX = $(element).position().left;
        $(element).mousemove(function (e) {
            var x = ((e.clientX - elX) / wElement) * deltaW;
            $(element).scrollLeft(x);
        });
    }
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
