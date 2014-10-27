define(['jquery'], function ($) {
    return function ($container, clickHandler, mouseDownHandler, mouseEnterHandler, mouseUpHandler) {
        var cells = [];
        for (var slot = 0; slot < 48; slot++) (function (slot) {
            // (closure on the 'slot' var)
            // 48 slots in each day.
            // each slot corresponds to half an hour.
            var $slot = $("<div>")
                .addClass("calm-slot")
                .click(function () {
                    clickHandler(slot);
                })
                .mousedown(function () {
                    mouseDownHandler(slot);
                })
                .mouseenter(function (e) {
                    e.stopPropagation(); // to prevent selection
                    mouseEnterHandler(slot);
                })
                .mouseup(function () {
                    mouseUpHandler(slot);
                })
                .appendTo($container);
            cells.push($slot);
        })(slot);
        return cells;
    };
});
