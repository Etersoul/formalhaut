/** Navigation for Formalhaut **/
(function ($, $F) {
    "use strict";

    /** Private member **/
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
    $F.nav.setLocation = function setLocation(path) {
        location.hash = path;
    };

    // Set the location (hash) to the specific path, remove the previos entry from history
    $F.nav.rewriteLocation = function rewriteLocation(path) {
        if(window.history && window.history.replaceState) {
            window.history.replaceState({}, null, path);

            // Start the hashchange event since the history modification doesn't trigger it automatically
            $(window).trigger('hashchange');
        } else {
            $F.nav.setLocation(path);
        }
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
                    if (l.length < opt.hash.length || l == opt.hash) {
                        break;
                    }

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
            var par = nav.splitParameter($F.nav.getCurrentHash().substr(2));
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

    nav.openPopup = function openPopup(firstHash, secondHash, fullFirstHash) {
        fullFirstHash = fullFirstHash || firstHash;

        var split = nav.splitParameter(secondHash);
        var base = firstHash.split('.');
        $.getScript('view/' + base[0] +'/' + split.hash + '.js', function () {
            var popup = $F.compat.popupSubViewInit(nav.subView);

            $.get('view/' + base[0] + '/' + split.hash + '.html', function (data) {
                $F.popup.show({
                    content: data,
                    scrolling: 'no',
                    autoExpand: true,
                    afterClose: function () {
                        location.hash = '#/' + fullFirstHash;
                    }
                });

                if(typeof popup == "object") {
                    if (!popup.isPopup) {
                        console.warn('Trying to access non-popup enabled view.');
                    }

                    popup.closePopup = nav.closePopup;
                    popup.parent = nav.currentSubView;
                    popup.afterLoad(split.arg);
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
        // Wipe out all the second hashes since they are not the part of parameter
        url = url.split('#')[0];

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
            namedParam: {}
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
    };

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
    };

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
    };

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
                var hash = window.location.hash.substr(2);
                var h2 = '';
                var first = '';

                // Default for h is the first hash itself
                var h = hash;

                // get second hash
                if (h.search(/#/) != -1) {
                    h2 = hash.substr(h.search(/#/) + 1);
                    h = hash.substr(0, h.search(/#/));
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
                            if(typeof current.parent == 'undefined') {
                                break;
                            }
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
                    if (h2 != '') {
                        // Clean the ? from the hash path
                        var clearFirstLashHash = firstLastHash.split('?');
                        nav.openPopup(clearFirstLashHash[0], h2, firstLastHash);
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

                nav.getScript({
                    hashList: pathArray,
                    hash: proc.hash,
                    query: proc.query
                });

                firstLastHashNoParam = proc.hash;
                firstLastHash = first;
                lastParam = proc.query;

                $('a').off('click.commonnav', nav.anchorBind).on('click.commonnav', nav.anchorBind);
            }
        });
    }
})(jQuery, $F);
