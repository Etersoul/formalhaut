/** Formatting Toolbelt for Formalhaut **/
(function ($, $F) {
    "use strict";

    var hooks = {};
    var cachedHooks = {};
    $F.hook = {};

    $F.hook.runHook = function (hookName, arg) {
        if (cachedHooks[hookName]) {
            for (var i = 0; i < cachedHooks[hookName].length; i++) {
                cachedHooks[hookName][i](arg);
            }
        }
    };

    $F.hook.setHook = function (hookName, priority, fn) {
        if (!hooks[hookName]) {
            hooks[hookName] = {};
        }

        hooks[hookName][priority] = fn;

        rebuildCache(hookName);
    };

    function rebuildCache(hookName) {
        var keys = Object.keys(hooks[hookName]).sort(sortNumber);

        cachedHooks[hookName] = [];

        for (var i = 0; i < keys.length; i++) {
            cachedHooks[hookName].push(hooks[hookName][keys[i]]);
        }
    }

    function sortNumber(a, b) {
        return a - b;
    }
})(jQuery, $F);
