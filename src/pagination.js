/** Pagination system for Formalhaut **/
(function ($, $F) {
    "use strict";

    var defaultPerPage = 20;
    var defaultDataSelector = '.datatable';
    var randomClassAppender = (function () {
        var length = 4;
        var rand = 'abcdefghijklmnopqrstuvwxyz';
        var className = '';

        for (var i = 0; i < length; i++) {
            var c = Math.random();
            var r = rand[Math.floor(c * rand.length)];
            className += r;
        }

        return className;
    })();

    var config;

    // Set config global option
    $F.config.hook(function () {
        config = $F.config.get('pagination');
        config = $.extend({
            pageButtonClass: 'page-button',
            previousClass: 'prev',
            nextClass: 'next',
            previousText: '<',
            nextText: '>',
            lastClass: 'last',
            firstClass: 'first',
            lastText: '{{last}}',
            firstText: '1',
            nextPrevButtonPosition: 'left-right', // option: left-right, left, right
            firstLastButtonStyle: 'text', // option: none, text
            wrapClass: 'pagination',
            pageNumberClass: 'page-display',
            pageNumberText: 'Page {{current}} of {{last}}:',
            pageListClass: 'page-number',
            itemClass: 'item',
            defaultNextPrevCount: 3
        }, config);
    });

    $F.pagination = function (option) {
        option = option || {};
        option.before = option.before || config.pageNumberText;
        option.dataCount = parseInt(option.dataCount || 1);
        option.perPage = parseInt(option.perPage || defaultPerPage);
        option.url = option.url || null;
        option.nextPrevCount = parseInt(option.nextPrevCount || config.defaultNextPrevCount);
        option.currentPage = parseInt(option.currentPage || 1);

        var element;
        if (option.element) {
            element = $(option.element);
        } else {
            if ($('.page-' + randomClassAppender).length) {
                element = $('.page-' + randomClassAppender);
                element.empty();
            } else {
                // Attempt to auto generate pagination after a table
                element = $('<div></div>').addClass(config.wrapClass).addClass('page-' + randomClassAppender);

                var defaultRel = $F.config.get('defaultRel');

                // Get all table in the default content element
                var tab = $('#' + defaultRel + ' table');
                if (tab.is(defaultDataSelector)) {
                    tab = tab.filter(defaultDataSelector);
                } else {
                    // Only take the first table found
                    tab = tab.eq(0);
                }

                if (tab.length === 0) {
                    var alertMsg = [];
                    alertMsg.push('Not found any table for pagination.');
                    alertMsg.push('Ensure you have at least one table or a table with "datatable" class name.');
                    alertMsg.push('Alternatively, send the element you want to populate with pagination in "element" property.');
                    console.error(alertMsg.join('\n'));
                    return;
                }

                tab.after(element);
            }
        }

        // If the data is sent instead, count the data
        if (option.data && $.isArray(option.data)) {
            option.dataCount = option.data.length;
        }

        if (option.url === null) {
            var split = $F.nav.getLastParam().split(/\//g);
            if (split.length === 1 && split[0] === '') {
                option.url = "#.{page}";
            } else {
                var pop = split[split.length - 1];
                if (isNaN(pop)) {
                    split.push('{page}');
                } else {
                    split.pop();
                    split.push('{page}');
                }

                option.url = '#.' + split.join('/');
            }
        }

        if (option.namedParam) {
            var split = $F.nav.getCurrentHash().split(/\?/);
            var exists = false;
            var querySplit = [];
            if (split.length == 2) {

                querySplit = split[1].split(/&/);
                for (var i = 0; i < querySplit.length; i++) {
                    var query = querySplit[i].split(/=/);

                    if (query[0] == option.namedParam) {
                        querySplit[i] = option.namedParam + '={page}';
                        exists = true;
                    }
                }
            }

            if (!exists){
                querySplit.push(option.namedParam + '={page}');
            }

            var join = querySplit.join('&');

            option.url = split[0] + '?' + join;
        }

        var lastPage = Math.ceil(option.dataCount / option.perPage);

        element.html('');

        // Processing the page number class
        var pageNumber = option.before
                .replace(/\{\{current\}\}/, option.currentPage)
                .replace(/\{\{last\}\}/, lastPage);

        element.append($('<span></span>').addClass(config.pageNumberClass).text(pageNumber));

        var pageList = $('<span></span>').addClass(config.pageListClass);

        for (var i = option.currentPage - option.nextPrevCount; i <= option.currentPage + option.nextPrevCount; i++) {
            if (i < 1 || i > lastPage) {
                continue;
            }

            var item = $('<a></a>').addClass(config.itemClass).text(i).attr('href', replacePage(option.url, i));

            if (i == option.currentPage) {
                item.addClass('current');
            }

            pageList.append(item);
        }

        if (config.firstLastButtonStyle === 'text') {
            if (option.currentPage >= 2 + option.nextPrevCount) {
                pageList.prepend($('<a></a>').addClass(config.itemClass).text('...').attr('href', '#'));
                pageList.prepend($('<a></a>').addClass(config.itemClass).text(config.firstText).attr('href', replacePage(option.url, 1)));
            }

            if (option.currentPage <= lastPage - (option.nextPrevCount + 1)) {
                pageList.append($('<a></a>').addClass(config.itemClass).text('...').attr('href', '#'));
                pageList.append($('<a></a>').addClass(config.itemClass).text(config.lastText.replace(/\{\{last\}\}/, lastPage)).attr('href', replacePage(option.url, lastPage)));
            }
        }

        var pageButton = $('<span></span>').addClass(config.pageButtonClass);
        var prevButton = $('<a></a>').addClass(config.previousClass).text(config.previousText).attr('href', replacePage(option.url, option.currentPage - 1));
        var nextButton = $('<a></a>').addClass(config.nextClass).text(config.nextText).attr('href', replacePage(option.url, option.currentPage + 1));
        switch (config.nextPrevButtonPosition) {
            case 'left-right':
                var pageButton2 = pageButton.clone();

                pageButton.append(prevButton);
                pageList.prepend(pageButton);

                pageButton2.append(nextButton);
                pageList.append(pageButton2);
                break;

            case 'left':
                pageButton.append(prevButton);
                pageButton.append(nextButton);
                pageList.prepend(pageButton);
                break;

            case 'right':
                pageButton.append(prevButton);
                pageButton.append(nextButton);
                pageList.append(pageButton);
                break;
        }

        element.append(pageList);
    };

    $F.pagination.getClass = function () {
        return randomClassAppender;
    };

    $F.pagination.getElement = function () {
        return $('.page-' + randomClassAppender);
    };

    function replacePage(base, num) {
        return base.replace('{page}', num);
    }
})(jQuery, $F);
