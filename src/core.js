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

})(jQuery);