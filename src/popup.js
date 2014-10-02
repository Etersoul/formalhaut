/** Popup module for Formalhaut Engine * */
(function($, $F) {
    "use strict";

    var activePopup = null,
        usePlaceholder = false,
        placeholderClone,
        objOption,
        countPopup = 0,
        popupStack = {};

    // Create popup prototype
    function PopupObject(obj, id) {
        this.wrap = null;
        this.id = id || Math.round(Math.random() * 65536);

        obj.content = obj.content || '';
        obj.width = obj.width || 'auto';
        obj.height = obj.height || 'auto';
        obj.modal = obj.modal || false;
        obj.autoExpand = obj.autoExpand || false;

        objOption = obj;

        var w = $(window).width();
        var h = $(window).height();
        var self = this;

        $('body').css({
            position : 'relative',
            overflow : 'hidden'
        });

        var divBorder = $('<div class="popupborder"></div>').css({
            width : obj.width,
            background : '#fff',
            zIndex : '11005',
            position : 'absolute',
            border : '5px solid #ccc',
            padding : '10px',
            borderRadius : '10px'
        });

        divBorder.click(function (e) {
            e.stopPropagation();
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
            position : 'fixed',
            top : '0',
            left : '0',
            zIndex : '10999',
            opacity : '0',
            width: w + 'px',
            height: h + 'px'
        }).click(function (e) {
            e.stopPropagation();
        });

        var innerWrap = $('<div class="popupinnerwrap"></div>').css({
            overflow: 'auto',
            position: 'absolute',
            zIndex: '11001',
            width: w + 'px',
            height: h + 'px'
        });

        var ndInnerWrap = $('<div class="popupndinnerwrap"></div>').css({
            padding: '30px 0'
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

            innerWrap.click(function () {
                self.close({
                    afterClose : obj.afterClose
                });
            });

            divBorder.append(del);
        }

        divBorder.append(divContent);
        ndInnerWrap.append(divBorder);
        innerWrap.append(ndInnerWrap);
        this.wrap.append(bg).append(innerWrap);

        $('body').append(this.wrap);

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

        // Close popup if it's have the same identifier in the stack
        if (popupStack[id]) {
            popupStack[id].close();
        }

        // Push to stack again
        popupStack[id] = this;
    }

    PopupObject.prototype.close = function (param) {
        param = param || {};

        // This part need more test before released to public, remain commented for awhile
//        if ($('form', this.wrap).length !== 0) {
//            if (!confirm('Do you really want to leave the form?')) {
//                return;
//            }
//        }

        if (param.afterClose) {
            param.afterClose();
        }

        this.wrap.animate({
            opacity : '0'
        }, 250, function() {
            $(this).hide();
            $(this).remove();
        });

        delete popupStack[this.id];

        if (Object.keys(popupStack).length == 0) {
            $('body').css({
                overflow : ''
            });
        }
    };

    $F.popup = {};

    $F.popup.create = function (obj) {
        ++countPopup;

        var p = new PopupObject(obj, countPopup);
    };

    // For the static popup
    $F.popup.show = function (obj) {
        if (activePopup) {
            $F.popup.close();
            activePopup = null;
        }

        activePopup = $F.popup.create(obj);
    };

    $F.popup.close = function (param) {
        param = param || {};

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

        $('.popupinnerwrap', wrap).css({
            width: w + 'px',
            height: h + 'px'
        });

        var divBorder = $('.popupborder', wrap);
        var divNdInnerWrap = $('.popupndinnerwrap', wrap);

        divBorder.css({
            width : objOption.width
        });

        divNdInnerWrap.css({
            height: (divBorder.height() + 30) + 'px'
        })

        if (param.width != null) {
            divBorder.css('width', param.width);
        }

        var wd = divBorder.width();
        var wh = divBorder.height();

        divBorder.css({
            left: (w / 2 - wd / 2 - 15) + 'px',
            height: 'auto'
        });

        if (wh < w) {
            divBorder.css({
                top: '30px'
            });
        }
    }
})(jQuery, $F);
