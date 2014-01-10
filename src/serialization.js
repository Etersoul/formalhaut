/** Data serialization for Formalhaut **/
(function ($, $F) {
    "use strict";
    
    $F.serialize = function (selector) {
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
        
        return json;
    };
    
})(jQuery, $F);
