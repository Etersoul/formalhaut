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
