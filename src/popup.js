/** Popup module for Formalhaut Engine **/
(function ($, $F) {
    "use strict";
    
    var isPopupActive = false,
        element = null;
    
    $F.popup = {};
    
    $F.popup.show = function (obj) {
        if(this.isPopupActive) return;
        
        obj.content = obj.content || '';
        obj.width = obj.width || 'auto';
        obj.height = obj.height || 'auto';
        obj.modal = obj.modal || false;
        
        var w = $(window).width();
        var h = $(window).height();
        var self = this;
        
        var d = $('<div></div>').css({width: obj.width, height: obj.height, background: '#fff', zIndex: '11005', position: 'absolute', border: '5px solid #ccc', padding: '10px', borderRadius: '10px' }).html(obj.content);
        var bg = $('<div></div>').css({width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', position:'absolute', zIndex: '11000', top: '0', left: '0' });
        
        var wrap = $('<div></div>').css({width: w + 'px', height: h + 'px', position:'fixed', top: '0', left: '0', zIndex: '10999', opacity: '0' });
        
        // add event onclick that will remove the popup if it's not a modal popup
        if(!obj.modal) {
            var del = $('<div></div>').css({
                width: '20px',
                height: '17px',
                position:'absolute',
                top: '-15px',
                right: '10px',
                background: '#333',
                borderRadius: '14px',
                border: '4px solid #ccc',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'center',
                paddingBottom: '2px',
                cursor:'pointer'
            }).html('X').click(function() {
                self.close({ afterClose: obj.afterClose });
            });
            
            bg.click(function() {
                self.close({ afterClose: obj.afterClose });
            });
            d.append(del);
        }
        

        wrap.append(bg).append(d);
        
        $('body').css({position: 'relative', 'overflow': 'hidden'}).append(wrap);
        wrap.animate({opacity: 1}, 250);
        
        // reposition the popup
        var wd = d.width();
        var wh = d.height();
        resizePopup();
        $(window).on('resize.popup', resizePopup);
        
        isPopupActive = true;
        element = wrap;
        
        function resizePopup() {
            w = $(window).width();
            h = $(window).height();
            wrap.css({width: w + 'px', height: h + 'px'});
            d.css({width: obj.width, height: obj.height});
            d.css('left', (w / 2 - wd / 2 - 15) + 'px');
            d.css('top', (h/2 - wh/2 - 15) + 'px');
        }
    }
    
	$F.popup.close = function (param) {
        param = param || {};
        if(param.afterClose) {
            param.afterClose();
        }
        
        isPopupActive = false;
        $('body').css({'overflow': ''});
        element.animate({opacity: '0'}, 250, function() { $(this).remove() });
    };
    
})(jQuery, $F);
