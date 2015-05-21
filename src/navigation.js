/* global $F */

/** Navigation for Formalhaut **/
(function ($, $F) {
    "use strict";

    var viewEngine = null;

    /** Private member **/
    var hashChangeHooks = [];
    
    /** Public Function **/
    $F.nav = {};

    /** Constant **/
    $F.nav.TRIGGER_SCOPE_PARAM = 'param';
    $F.nav.TRIGGER_SCOPE_FULL = 'all';

    // Get current hash in the URL
    $F.nav.getCurrentHash = function () {
        return location.hash;
    };

    // Split the URL into object
    $F.nav.splitParameter = function (url, defaultArguments) {
        defaultArguments = defaultArguments || {};

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
        } else if (url.search(/\./) !== -1) {
            // Split the dot argument from the physical path
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
            if (paramType === 1) { // 0 no param, 1 for dot based, 2 for question mark based
                arg.param = q.split('/');
            } else {
                arg.param = q.split('&');
                for (var i = 0; i < arg.param.length; i++) {
                    var argi = arg.param[i];
                    var search = argi.search('=');
                    var val = decodeURI(argi.substr(search + 1));
                    var key = decodeURI(argi.substr(0, search));
                    arg.namedParam[key] = val;
                }
            }
        }

        // Implant default arguments if necessary
        if (defaultArguments instanceof Array) {
            for (var i = arg.param.length; i < defaultArguments.length; i++) {
                arg.param.push(defaultArguments[i]);
            }
        } else {
            for (var data in defaultArguments) {
                if (typeof arg.namedParam[data] !== 'undefined') {
                    continue;
                }

                arg.namedParam[data] = defaultArguments[data];
            }
        }

        return {
            query: q,
            hash: h,
            paramType: paramType,
            arg: arg
        };
    };

    // Get last hash
    $F.nav.getLastHash = function (breakHash) {
        if (breakHash) {
            var hash = breakHash.split('.');
            return {
                first: hash[0],
                second: hash[1]
            };
        }

        return $F.nav.getLastHash();
    };

    // Set the location (hash) to the specific path
    $F.nav.setLocation = function (path) {
        location.hash = path;
    };

    $F.nav.setNamedParam = function (param, forceTrigger) {
        forceTrigger = forceTrigger || false;

        var hash = window.location.hash.substr(1);
        var last = $F.nav.splitParameter(hash);
        location.href = $F.util.buildUrl('#/' + last, param);

        if (forceTrigger) {
            $(window).trigger('hashchange', $F.nav.TRIGGER_SCOPE_PARAM);
        }
    };

    // Set the location (hash) to the specific path, remove the previos entry from history
    $F.nav.rewriteLocation = function (path) {
        if(window.history && window.history.replaceState) {
            window.history.replaceState({}, null, path);

            // Start the hashchange event since the history modification doesn't trigger it automatically
            $(window).trigger('hashchange');
        } else {
            $F.nav.setLocation(path);
        }
    };

    // Force refresh the current view, including reload the script and the html
    $F.nav.refreshSubView = function (obj) {
        subView = null;
        nav.getScript({
            hash: location.hash
        });
    };

    // Add to global beforeload
    $F.nav.addBeforeLoad = function (func) {
        viewEngine.globalBeforeLoad = func;
    };

    // Add to global afterload
    $F.nav.addAfterLoad = function (func) {
        viewEngine.globalAfterLoad = func;
    };

    // Add hash change event hook
    $F.nav.addHashChangeHook = function (hook) {
        hashChangeHooks.push(hook);
    };

    // This is the hook for the view engine
    $F.nav.setCommunicationLink = function (nav) {
        if (viewEngine !== null) {
            return;
        }

        viewEngine = nav;
    };
})(jQuery, $F);
