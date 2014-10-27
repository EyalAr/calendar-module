define([], function () {

    /**
     * We represent availability availability with a matrix of 48X7 slots.
     * 7 days, 48 half-hours per day.
     */

    var DAYS = 7,
        PER_DAY = 48,
        SLOT_CANNOT_CHANGE = -1,
        SLOT_NOT_AVAILABLE = 0,
        SLOT_AVAILABLE = 1,
        SLOT_DEFAULT = SLOT_AVAILABLE,
        CSS_CLASSES = {
            AVAILABLE: "available",
            NOT_AVAILABLE: "not-available",
            LOCKED: "locked",
            HOVER: "hover",
            DEFAULT: this.AVAILABLE
        };

    function AvailabilityManager($slots) {
        var self = this;

        // force this function to be called as a constructor,
        // even if 'new' was not used.
        if (!(self instanceof AvailabilityManager))
            return new AvailabilityManager();

        self.availability = [];
        self.$slots = $slots;
        self.startAnchor = null;
        self.endAnchor = null;

        // init matrix:
        for (var d = 0; d < DAYS; d++) {
            self.availability[d] = [];
            for (var s = 0; s < PER_DAY; s++) {
                self.availability[d][s] = SLOT_DEFAULT;
                self.$slots.addClass(CSS_CLASSES.DEFAULT);
            }
        }
    }

    AvailabilityManager.prototype.set =
        function (day, slot, available, force) {
            var self = this;
            if (self.availability[day][slot] !== SLOT_CANNOT_CHANGE || force) {
                self.availability[day][slot] =
                    available
                        ? SLOT_AVAILABLE
                        : SLOT_NOT_AVAILABLE;
                self.$slots[day][slot].addClass(
                    available
                        ? CSS_CLASSES.AVAILABLE
                        : CSS_CLASSES.NOT_AVAILABLE
                );
                self.$slots[day][slot].removeClass(
                    available
                        ? CSS_CLASSES.NOT_AVAILABLE
                        : CSS_CLASSES.AVAILABLE
                );
                self.$slots[day][slot].removeClass(CSS_CLASSES.LOCKED);
                self.$slots[day][slot].removeClass(CSS_CLASSES.HOVER);
            }
        };

    AvailabilityManager.prototype.toggle =
        function (day, slot) {
            var self = this;
            if (self.availability[day][slot] === SLOT_AVAILABLE)
                self.set(day, slot, false);
            else
                self.set(day, slot, true);
        };

    AvailabilityManager.prototype.setRange =
        function (fromDay, fromSlot, toDay, toSlot, available, force) {
            var self = this;
            for (var d = fromDay; d <= toDay; d++)
                for (var s = fromSlot; s <= toSlot; s++)
                    self.set(d, s, available, force);
        };

    AvailabilityManager.prototype.lock =
        function (day, slot) {
            var self = this;
            self.availability[day][slot] = SLOT_CANNOT_CHANGE;
            self.$slots[day][slot].addClass(CSS_CLASSES.LOCKED);
            self.$slots[day][slot].removeClass(CSS_CLASSES.AVAILABLE);
            self.$slots[day][slot].removeClass(CSS_CLASSES.NOT_AVAILABLE);
            self.$slots[day][slot].removeClass(CSS_CLASSES.HOVER);
        };

    AvailabilityManager.prototype.lockRange =
        function (fromDay, fromSlot, toDay, toSlot) {
            var self = this;
            for (var d = fromDay; d <= toDay; d++)
                for (var s = fromSlot; s <= toSlot; s++)
                    self.lock(d, s);
        };

    AvailabilityManager.prototype.startHover =
        function (day, slot) {
            var self = this;
            self.startAnchor = {
                day: day,
                slot: slot,
                mode: self.availability[day][slot] !== SLOT_AVAILABLE
            };
            self.endAnchor = {day: day, slot: slot};
        };

    AvailabilityManager.prototype.updateHover =
        function (day, slot) {
            var self = this;
            if (self.startAnchor) {
                // add / remove hover class from slots
                // first, clear all slots, then apply class
                for (var d = 0; d < DAYS; d++)
                    for (var s = 0; s < PER_DAY; s++)
                        self.$slots[d][s].removeClass(CSS_CLASSES.HOVER);
                var fromDay = Math.min(self.startAnchor.day, day),
                    toDay = Math.max(self.startAnchor.day, day),
                    fromSlot = Math.min(self.startAnchor.slot, slot),
                    toSlot = Math.max(self.startAnchor.slot, slot);
                for (var d = fromDay; d <= toDay; d++)
                    for (var s = fromSlot; s <= toSlot; s++)
                        if (self.availability[d][s] !== SLOT_CANNOT_CHANGE)
                            self.$slots[d][s].addClass(CSS_CLASSES.HOVER);
                self.endAnchor.day = day;
                self.endAnchor.slot = slot;
            }
        };

    AvailabilityManager.prototype.endHover =
        function () {
            var self = this;
            if (self.startAnchor.day !== self.endAnchor.day ||
                self.startAnchor.slot !== self.endAnchor.slot) {
                var fromDay = Math.min(self.startAnchor.day, self.endAnchor.day),
                    toDay = Math.max(self.startAnchor.day, self.endAnchor.day),
                    fromSlot = Math.min(self.startAnchor.slot, self.endAnchor.slot),
                    toSlot = Math.max(self.startAnchor.slot, self.endAnchor.slot);
                self.setRange(fromDay, fromSlot, toDay, toSlot, self.startAnchor.mode);
            }
            self.startAnchor = self.endAnchor = null;
        };

    AvailabilityManager.cssClasses = CSS_CLASSES;
    return AvailabilityManager;
});
