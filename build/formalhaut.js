/** Core Formalhaut File **/

(function ($) {
    "use strict";

    checkF();

    function checkF() {
        if (!$ && $.fn.jQuery.split('.')[0] != '1' && parseInt($.fn.jQuery.split('.')[1]) < 10) {
            console.error('Formalhaut JS engine needs jQuery 1.10');
        }
        if ($F) {
            return;
        } else {
            $F = initF();
        }
    }

    function initF() {
        var config = {};

        var build = function () {
            this.write =
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
                        opt.success(data.data);
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

        }

        return build;
    }

    function sendToLogin(message) {
        location.href = message;
    }

})(jQuery);
/** Configuration Processing for Formalhaut **/
(function ($, $F) {
    var localConfig = {};
    $F.loadConfig = function (config) {
        localConfig = config;
    };
    
    $F.getConfig = function (key) {
        return localConfig[key];
    };
})(jQuery, $F);
/** Navigation for Formalhaut **/

(function ($, $F) {

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
