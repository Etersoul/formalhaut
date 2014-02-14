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
            fixHashModifier();
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
            //onLoadedCommonFunction();
            var qs = q.split('/');

            // execute onLoaded script from the view's script
            var arg = {
                fullParam: q,
                param: []
            };
            
            if (q !== "") {
                arg.param = qs;
            }

            view.afterLoad(arg);

            document.title = view.title;
            if (executionStack.length == 0) {
                if (typeof view.onDefaultChild == 'function') {
                    view.onDefaultChild(arg);
                }
                
                if (view.defaultChildView) {
                    history.replaceState(null, "", "#/" + view.defaultChildView);
                }
                
                prepareHashModifier();
                
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

    /******** Formalhaut Engine Hook *********/

    // new way to load view script
    $F.loadView = function loadView(obj) {
        nav.subView = obj;
    };
    
    function prepareHashModifier() {
        // Search the link that use the modifier hash
        $('a[href^="##"]').each(function (i, el) {
            $(el).attr('data-orig-href', $(el).attr('href'));
        });
        
        // Search and proceed argument hash shorthand
        $('a[href^="#."]').each(function (i, el) {
            $(el).attr('data-orig-href', $(el).attr('href'));
        });
        
        fixHashModifier();
    }
    
    function fixHashModifier() {
        $('a[data-orig-href^="##"]').each(function (i, el) {
            $(el).attr('href', '#/' + firstLastHash + '#' + $(el).attr('data-orig-href').substr(2));
        });
        
        $('a[data-orig-href^="#."]').each(function (i, el) {
            $(el).attr('href', '#/' + firstLastHashNoParam + '.' + $(el).attr('data-orig-href').substr(2));
        });
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
                var q = '';
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
                
                // Split the dot argument with the physical path
                if (h.search(/\./) != -1) {
                    q = h.substr(h.search(/\./)+1);
                    h = h.substr(0,h.search(/\./));
                }

                if (firstLastHashNoParam == h) {
                    // just the query is changed
                    if (lastParam != q) {
                        var current = nav.currentSubView;
                        var arg = {
                            fullParam: q,
                            param: []
                        };
                        
                        if (q !== "") {
                            arg.param = q.split('/');
                        }
                        
                        for (;;) {
                            if (current.afterParamLoad) {
                                current.afterParamLoad(arg);
                            }
                            if(typeof current.parent == 'undefined') break;
                            current = current.parent;
                        }

                        lastParam = q;
                        firstLastHash = first;
                        
                        prepareHashModifier();
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
                var pathArray = h.split(/\//g);

                // if we go to the ancestor path, invalidate last path data and stack
                if(firstLastHash.indexOf(h) == 0) {
                    firstLastHash = '';
                    executionStack = [];
                }

                var i=0;
                nav.getScript({
                    hashList: pathArray,
                    hash: h,
                    query: q
                });

                firstLastHashNoParam = h;
                firstLastHash = first;
                lastHash = newHash;
                lastParam = q;

                $('a').off('click', nav.anchorBind).on('click', nav.anchorBind);
            }
        });
    }
})(jQuery, $F);
