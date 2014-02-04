/** Popup module for Formalhaut Engine * */
(function($, $F) {
    "use strict";

    var isPopupActive = false,
        objOption,
        wrap = null;
    
    // Mutation observer (only available in modern browser and IE11+)
    var observer = new MutationObserver(function (mutations) {
        resizePopup();
    });

    $F.popup = {};

    $F.popup.show = function (obj) {
        if (this.isPopupActive)
            return;

        obj.content = obj.content || '';
        obj.width = obj.width || 'auto';
        obj.height = obj.height || 'auto';
        obj.modal = obj.modal || false;
        obj.autoExpand = obj.autoExpand || false;
        
        objOption = obj;

        var w = $(window).width();
        var h = $(window).height();
        var self = this;
        
        if (wrap != null) {
            wrap = null;
        }
        
        var divBorder = $('<div id="popupborder"></div>').css({
            width : obj.width,
            height : obj.height,
            background : '#fff',
            zIndex : '11005',
            position : 'absolute',
            border : '5px solid #ccc',
            padding : '10px',
            borderRadius : '10px'
        });
        
        var bg = $('<div></div>').css({
            width : '100%',
            height : '100%',
            background : 'rgba(0,0,0,0.7)',
            position : 'absolute',
            zIndex : '11000',
            top : '0',
            left : '0'
        });
        
        var divContent = $('<div id="popupcontent"></div>').html(obj.content);

        wrap = $('<div></div>').css({
            width : w + 'px',
            height : h + 'px',
            position : 'fixed',
            top : '0',
            left : '0',
            zIndex : '10999',
            opacity : '0'
        });

        // add event onclick that will remove the popup if it's not a modal
        // popup
        if (!obj.modal) {
            var del = $('<div></div>').css({
                width : '20px',
                height : '17px',
                position : 'absolute',
                top : '-15px',
                right : '10px',
                background : '#333',
                borderRadius : '14px',
                border : '4px solid #ccc',
                color : '#fff',
                fontSize : '14px',
                textAlign : 'center',
                paddingBottom : '2px',
                cursor : 'pointer'
            }).html('X').click(function() {
                self.close({
                    afterClose : obj.afterClose
                });
            });

            bg.click(function() {
                self.close({
                    afterClose : obj.afterClose
                });
            });
            
            divBorder.append(del);
        }

        divBorder.append(divContent);
        wrap.append(bg).append(divBorder);

        $('body').css({
            position : 'relative',
            overflow : 'hidden'
        }).append(wrap);
        
        wrap.animate({
            opacity : 1
        }, 250);

        // reposition the popup
        resizePopup();
        $(window).on('resize.popup', resizePopup);

        isPopupActive = true;
        
        // Bind the mutation observer
        if (obj.autoExpand) {
            observer.observe(divBorder[0], {
                childList: true,
                subtree: true 
            }); 
        }
    }

    $F.popup.close = function (param) {
        param = param || {};
        if (param.afterClose) {
            param.afterClose();
        }

        isPopupActive = false;
        $('body').css({
            overflow : ''
        });
        
        wrap.animate({
            opacity : '0'
        }, 250, function() {
            $(this).remove()
        });
    };

    $F.popup.resize = function (param) {
        param = param || {};
        param.width = param.width || null;
        resizePopup(param);
    };
    
    function resizePopup(param) {
        param = param || {};
        param.width = param.width || null;
        
        var w = $(window).width();
        var h = $(window).height();

        wrap.css({
            width : w + 'px',
            height : h + 'px'
        });
        
        var divBorder = $('#popupborder', wrap);
        var divContent = $('#popupcontent', divBorder);
        divBorder.css({
            width : objOption.width,
            height : objOption.height
        });
        
        if (param.width != null) {
            divBorder.css('width', param.width);
        }
        
        var wd = divBorder.width();
        var wh = divBorder.height();
        
        if (wh >= h - 80) {
            wh = h - 80;
            divBorder.css({
                height: wh
            });
            
            divContent.css({
                overflow: 'auto', 
                height: wh - 10
            });
        } else {
            divBorder.css({
                height: 'auto'
            });
        }
        
        divBorder.css({
            left: (w / 2 - wd / 2 - 15) + 'px',
            top: (h / 2 - wh / 2 - 15) + 'px'
        });
    }
})(jQuery, $F);
