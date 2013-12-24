/** Navigation for Formalhaut **/
(function ($, $F) {
    "use strict";
    
    /** Private member **/
    var lastHash = '';
    var ndLastHash = '';
    var lastParam = '';
    var isFirstLoad = true;
    var executionStack = [];
    
    /** Instance member **/
    var nav = {};

    nav.subView = null;
    nav.currentSubView = null;
    nav.scriptStack = [];
    nav.rel = '';
    
    init();
    
    // Bind the config hook to prepare
    $F.config.hook(function () {
        nav.defaultRel = $F.config.get('defaultRel');
    });

    nav.getScript = function getScript(opt) {
        // take the previous hash, and iterate from the fullest path to the only first part of path.

        // check if we have reach the parent module, and stop fetching script immediately if true
        for (var i = nav.scriptStack.length - 1; i >= 0; i--) {
            if (nav.scriptStack[i].req === opt.hash) {
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

                for (var j = 0; j < nav.scriptStack.length; j++) {
                    nav.scriptStack[j].script.afterLoad(arg);
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
            var subView = nav.subView;
            
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
            
            executionStack.push(stack);

            if (opt.hash === '') {
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
        if (executionStack.length == 0)
            return;

        var stack = executionStack.pop();
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

        if (typeof subView.rel !== 'undefined' && $('#' + subView.rel).length > 0) {
            nav.rel = subView.rel;
        } else {
            nav.rel = nav.defaultRel;
        }
        
        $('#' + nav.rel).load($F.config.get('viewUri') + req + '.html', function () {
            //onLoadedCommonFunction();
            var qs = q.split('/');

            // execute onLoaded script from the view's script
            var arg = {
                fullParam: q,
                param: qs
            };
            subView.afterLoad(arg);

            document.title = nav.module + ' | ' + subView.title;
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
        callback();
    };

    /******** Formalhaut Engine Hook *********/

    // new way to load view script
    $F.loadView = function loadView(obj) {
        nav.subView = obj;
    };

    // force refresh the current view, including reload the script and the html
    $F.refreshSubView = function refreshView(obj) {
        subView = null;
        nav.getScript({
            hash: location.hash
        });
    };
    
    // Inialization function
    function init() {
        $(window).on('hashchange', function () {
            if (window.location.hash.substr(1,1) === '/') {
                var h=window.location.hash.substr(2)
                var q='';
                var h2='';
                
                // get second hash
                if(h.search(/#/) != -1) {
                    h2=h.substr(h.search(/#/)+1);
                    h=h.substr(0,h.search(/#/));
                }
                
                if(h.search(/\./) != -1) {
                    q=h.substr(h.search(/\./)+1);
                    h=h.substr(0,h.search(/\./));
                }
                
                if(lastHash == h) {
                    // just the query is changed
                    if(lastParam != q) {
                        var current = nav.currentSubView;
                        var arg = {
                            fullParam: q,
                            param: q.split('/')
                        };
                        for(;;) {
                            current.afterParamLoaded(arg);
                            if(typeof current.parent == 'undefined') break;
                            current = current.parent;
                        }
                        
                        lastParam = q;
                        return;
                    }
                }
                
                // check if second hash changed
                if(ndLastHash != h2) {
                    // show the popup
                    var gpaboxAj;
                    if(h2 != '') {
                        var fancySplit = h2.split('.');
                        $.getScript('view/'+h+'/'+fancySplit[0]+'.js',function(){
                            $.get('view/'+h+'/'+fancySplit[0]+'.html', function(data){
                                BM.popup.show({
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
                        BM.popup.close();
                    }
                    ndLastHash = h2;
                    
                    if(!isFirstLoad) {
                        return;
                    }
                }
                
                isFirstLoad = false;
                
                // if we go to the ancestor path, invalidate last path data and stack
                if(lastHash.indexOf(h) == 0) {
                    lastHash = '';
                    executionStack = [];
                }
                
                var i=0;
                nav.getScript({
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
