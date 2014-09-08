/** Popup module for Formalhaut Engine * */
(function($, $F) {
    "use strict";

    var activePopup = null,
        usePlaceholder = false,
        placeholderClone,
        objOption;

    // Create popup prototype
    function PopupObject(obj) {
        this.wrap = null;

        obj.content = obj.content || '';
        obj.width = obj.width || 'auto';
        obj.height = obj.height || 'auto';
        obj.modal = obj.modal || false;
        obj.autoExpand = obj.autoExpand || false;

        objOption = obj;

        var w = $(window).width();
        var h = $(window).height();
        var self = this;

        var divBorder = $('<div class="popupborder"></div>').css({
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

        var divContent;
        if (obj.content instanceof $) {
            usePlaceholder = true;
            placeholderClone = obj.content.clone();

            obj.content.before('<div id="popup-placeholder" style="display:none"></div>');
            obj.content.show();
            divContent = $('<div class="popupcontent"></div>').append(obj.content);
        } else {
            divContent = $('<div class="popupcontent"></div>').html(obj.content);
        }

        this.wrap = $('<div></div>').css({
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
        this.wrap.append(bg).append(divBorder);

        $('body').css({
            position : 'relative',
            overflow : 'hidden'
        }).append(this.wrap);

        this.wrap.animate({
            opacity : 1
        }, 250);

        // reposition the popup
        var scopeWrap = this.wrap;

        resizePopup({}, this.wrap);
        $(window).on('resize.popup', function () {
            resizePopup({}, scopeWrap);
        });

        // Mutation observer (only available in modern browser and IE11+)
        var observer = new MutationObserver(function (mutations) {
            resizePopup({}, scopeWrap);
        });

        // Bind the mutation observer
        if (obj.autoExpand) {
            observer.observe(divBorder[0], {
                childList: true,
                subtree: true
            });
        }
    }

    PopupObject.prototype.close = function (param) {
        param = param || {};
        if (param.afterClose) {
            param.afterClose();
        }

        $('body').css({
            overflow : ''
        });

        this.wrap.animate({
            opacity : '0'
        }, 250, function() {
            $(this).hide();
            $(this).remove();
        });
    };

    $F.popup = {};

    $F.popup.create = function (obj) {
        return new PopupObject(obj);
    };

    // For the static popup
    $F.popup.show = function (obj) {
        if (activePopup) {
            $F.popup.close();
            activePopup = null;
        }

        activePopup = new PopupObject(obj);
    };

    $F.popup.close = function (param) {
        param = param || {};
        if (param.afterClose) {
            param.afterClose();
        }

        if (activePopup != null) {
            activePopup.close(param);
            activePopup = null;
        }
    };

    $F.popup.resize = function (param) {
        param = param || {};
        param.width = param.width || null;
        resizePopup(param, activePopup.wrap);
    };

    function resizePopup(param, wrap) {
        param = param || {};
        param.width = param.width || null;

        var w = $(window).width();
        var h = $(window).height();

        wrap.css({
            width : w + 'px',
            height : h + 'px'
        });

        var divBorder = $('.popupborder', wrap);
        var divContent = $('.popupcontent', divBorder);
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
