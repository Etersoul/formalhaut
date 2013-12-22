/** Configuration Processing for Formalhaut **/
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
