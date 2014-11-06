/** Input Formatting Toolbelt for Formalhaut **/
(function ($, $F) {
    "use strict";

    $F.initInput = function () {
        $('[data-f-input=time]').not('.f-input-time').addClass('f-input-time').on('keyup.inputtime', function (e) {
            if (e.which == 8 || e.which == 46) {
                return;
            }

            var val = $(this).val();
            if (val.length == 3) {
                $(this).val(val.substr(0, 2) + ':' + val.substr(2, 1));
            }
        });
    };

})(jQuery, $F);
