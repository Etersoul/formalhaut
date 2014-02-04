/** Data serialization for Formalhaut **/
(function ($, $F) {
    "use strict";
    
    $F.serialize = function (selector, returnStringify) {
        returnStringify = (returnStringify == null) ? false : returnStringify;
        
        var json = {};
        jQuery.map($(selector).serializeArray(), function(n, i){
            if(typeof json[n.name] == 'undefined') {
                json[n.name] = n.value;
            } else {
                if(typeof json[n.name] == 'object') {
                    json[n.name].push(n.value);
                } else {
                    var temp = json[n.name];
                    json[n.name] = [temp, n.value];
                }
            }
        });
        
        if (returnStringify) {
            return JSON.stringify(json);
        }
        
        return json;
    };
    
})(jQuery, $F);
