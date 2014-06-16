/** Utility Functions Engine for Formalhaut **/
(function ($, $F) {
    $F.util = {};

    $F.util.buildUrl = function (base, keyval, unescapeValue) {
        var queryString = '';
        var delimiter = '';

        unescapeValue = unescapeValue || false;

        for (var i in keyval) {
            queryString += delimiter;
            queryString += encodeURIComponent(i);

            if (unescapeValue) {
                queryString += '=' + keyval[i];
            } else {
                queryString += '=' + encodeURIComponent(keyval[i]);
            }

            delimiter = '&';
        }

        return (queryString !== '') ? (base + '?' + queryString) : '';
    };
})(jQuery, $F);
