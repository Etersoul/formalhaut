/** Data serialization for Formalhaut **/
(function ($, $F) {
    "use strict";

    $F.fileSerialize = function (selector, arg1, arg2) {
        var callback;
        var returnStringify = false;
        if (typeof arg1 === 'function') {
            callback = arg1;
        } else {
            callback = arg2;
            returnStringify = arg1;
        }

        var json = {};

        var file = $(selector).find('[type=file]');
        var fileCount = 0;


        for (var i = 0; i < file.length; i++) {
            var fileFiles = $(file[i]).prop('files');
            fileCount += fileFiles.length;
        }

        // no need to proceed if no file detected
        if (fileCount === 0) {
            proceed(json);
            return;
        }

        // iterate through input type file element
        for (var i = 0; i < file.length; i++) {
            var fileElement = file[i];
            var fileFiles = $(fileElement).prop('files');

            // iterate through multiple file
            for (var j = 0; j < fileFiles.length; j++) {
                var f = fileFiles[j];
                var reader = new FileReader();
                reader.onload = (function (arg, el) {
                    return function (e) {
                        var fileObject = {
                            filename: arg.name,
                            size: arg.size,
                            content: e.target.result.replace(/^.*\,/g, '')
                        };

                        if (el.multiple) {
                            if (!json[el.name]) {
                                json[el.name] = [];
                            }

                            json[el.name].push(fileObject);
                        } else {
                            json[el.name] = fileObject;
                        }

                        fileCount--;

                        if (fileCount === 0) {
                            proceed(json);
                        }
                    };
                })(f, fileElement);

                // Read in the image file as a data URL.
                reader.readAsDataURL(f);
            }
        }

        function proceed(data) {
            var ser = $F.serialize(selector);
            ser = $.extend(ser, data);

            if (returnStringify) {
                callback(JSON.stringify(ser));
            } else {
                callback(ser);
            }
        }
    };

    $F.serialize = function (selector, returnStringify) {
        returnStringify = (returnStringify == null) ? false : returnStringify;

        var json = {};
        jQuery.map($(selector).serializeArray(), function (n, i) {
            var cleanName = n.name.replace(/\[.*\]$/, '');

            if (typeof json[cleanName] == 'undefined') {
                if (/\[\]/.test(n.name)) {
                    json[cleanName] = [n.value];
                } else if (/\[.*?\]/.test(n.name)) {
                    json[cleanName] = {};

                    iterateObject(json[cleanName], n.name, n.value);
                } else {
                    json[cleanName] = n.value;
                }
            } else {
                if (typeof json[cleanName] == 'object') {
                    if (json[cleanName] instanceof Array) {
                        json[cleanName].push(n.value);
                    } else {
                        iterateObject(json[cleanName], n.name, n.value);
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

    function iterateObject(ref, name, value) {
        var reg = /\[(.*?)\]/g;
        var key;
        var keyBefore = null;
        var refBefore = null;
        while (key = reg.exec(name)) {
            if (typeof ref[key[1]] == 'undefined') {
                ref[key[1]] = {}
            }

            refBefore = ref;
            keyBefore = key[1];

            ref = ref[key[1]];
        }

        refBefore[keyBefore] = value;
    }

}
)(jQuery, $F);
