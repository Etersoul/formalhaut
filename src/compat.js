(function ($, $F) {
    "use strict";
    
    $F.compat = {};
    
    $F.compat.subViewInit = function (navSubView) {
        if (navSubView != null) {
            return navSubView;
        }
        
        // Access global var of window.subView
        if (window.subView) {
            var sv = window.subView;
            sv.afterLoad = sv.onLoad;
            
            console.warn('Using deprecated var subView.');
            alert('Using deprecated var subView.');
            
            return sv;
        }
    }
})(jQuery, $F);