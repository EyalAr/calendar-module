require.config({
    paths: {
        'jquery': '../bower_components/jquery/dist/jquery'
    }
});

require(['jquery'], function($) {

    var $el = $(".calm-calendar"),
        $timeIndEl = $el.find(".calm-time-indicator"),
        hourHeight = 12.5; // 100 / 24 (precentage)

    // move the time indicator:
    // calculate its position every 30 seconds
    var interval = 30 * 1000;
    updateTimeIndicator(); // initial
    setInterval(updateTimeIndicator, interval);

    // load the calendar events:
    $.get('data.json').then(function(data) {
        $.each(data.events, function(i, e) {

            // for each event, create a new element at the appropriate
            // column in the calendar:
            var $col = $el.find(".calm-content-cols .calm-col").eq(e.day);

            $("<div>").addClass("calm-event").css({
                top: (e.start * hourHeight) + "%",
                height: (e.duration * hourHeight) + "%"
            }).text(e.title).appendTo($col);

        });
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
