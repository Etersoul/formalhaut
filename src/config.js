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
