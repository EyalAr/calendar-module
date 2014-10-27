require.config({
    paths: {
        'jquery': '../bower_components/jquery/dist/jquery'
    }
});

require(['jquery', './AvailabilityManager', './createDaySlots'],
    function ($, AvailabilityManager, createDaySlots) {

        var $el = $(".calm-calendar"),
            $timeIndEl = $el.find(".calm-time-indicator"),
            hourHeight = 12.5, // 100 / 24 (precentage)
            $days = $el.find(".calm-slots .calm-col").slice(1),
            $slots = $days.map(function (day, $day) {
                return [createDaySlots(
                    $day,
                    function (slot) {
                        // click handler
                        avMan.toggle(day, slot);
                    }, function (slot) {
                        // mouse down handler
                        avMan.startHover(day, slot);
                    }, function (slot) {
                        // mouse enter handler
                        avMan.updateHover(day, slot);
                    }, function (slot) {
                        // mouse up handler
                        avMan.endHover(day, slot);
                    }
                )];
            }),
            avMan = new AvailabilityManager($slots);

        // move the time indicator:
        // calculate its position every 30 seconds
        var interval = 30 * 1000;
        updateTimeIndicator(); // initial
        setInterval(updateTimeIndicator, interval);

        // load availability:
        $.get('data.json').then(function (data) {
            $.each(data.events, function (i, e) {
                // for each event, the time of the event should be locked,
                // and the user should be unable to set it as "not available"
                avMan.lockRange(
                    e.day, 2 * e.start,
                    e.day, 2 * (e.start + e.duration)
                );
            });
            // after the event slots are locked, apply normal availability:
            for (var d = 0; d < 7; d++)
                for (var t = 0; t < 48; t++)
                    avMan.set(d, t, data.availability[d][t]);
        }, console.warn);

        // scroll 08:00AM into view:
        var morningScroll = $el.find(".calm-rows .calm-row").eq(16).offset().top -
            $el.offset().top -
            $el.find(".calm-head").height();
        $el.find(".calm-body").animate({
            scrollTop: morningScroll
        }, 1000);

        function updateTimeIndicator() {

            var now = new Date(),
                hr = now.getHours(),
                mn = now.getMinutes(),
                sc = now.getSeconds();

            var pos = hourHeight * (hr + (mn + sc / 60) / 60) + "%";

            $timeIndEl.css({
                top: pos
            });

        }

    });
