/** Data serialization for Formalhaut **/
(function ($, $F) {
    "use strict";

    $F.serialize = function (selector, returnStringify) {
        returnStringify = (returnStringify == null) ? false : returnStringify;

        var json = {};
        jQuery.map($(selector).serializeArray(), function (n, i) {
            var cleanName = n.name.replace(/\[.*\]$/, '');

            if (typeof json[cleanName] == 'undefined') {
                if (/\[\]$/.test(n.name)) {
                    json[cleanName] = [n.value];
                } else if (/\[.*\]$/.test(n.name)) {
                    json[cleanName] = {};

                    var reg = /\[(.*)\]$/;
                    var key = reg.exec(n.name);
                    json[cleanName][key[1]] = n.value;
                } else {
                    json[cleanName] = n.value;
                }
            } else {
                if (typeof json[cleanName] == 'object') {
                    if (json[cleanName] instanceof Array) {
                        json[cleanName].push(n.value);
                    } else {
                        var reg = /\[(.*)\]$/;
                        var key = reg.exec(n.name);
                        json[cleanName][key[1]] = n.value;
                    }
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
