import { dateString, getDayIndex, addDays } from "./helper.js";
import { db } from "./firebase.js";

const MODE = {
    VIEW: 1,
    UPDATE: 2,
    CREATE: 3,
};

export class Calendar {
    constructor(user) {
        this.user = user;
        this.collection = db.collection(this.user.uid);
        this.mode = MODE.VIEW;
        this.weekOffset = 0;
        this.slotHeight = 30;
        this.weekStart = null;
        this.weekEnd = null;
        this.snapShot = null;
    }

    setup() {
        this.showEmail();
        this.setupTimes();
        this.setupDays();
        this.calculateCurrentWeek();
        this.showWeek();
        this.setupControls();
        this.loadEvents();
    }

    setupControls() {
        $("#nextWeekBtn").click(() => this.changeWeek(1));
        $("#prevWeekBtn").click(() => this.changeWeek(-1));
        $("#addButton").click(() => this.addNewEvent());
        $("#trashButton").click(() => this.trash());
        $("#cancelButton").click(() => this.closeModal());
        $("#logoutButton").click(() => this.logout());
        $(".color").click(this.changeColor);
    }

    setupTimes() {
        const header = $("<div></div>").addClass("columnHeader");
        const slots = $("<div></div>").addClass("slots");
        for (let hour = 0; hour < 24; hour++) {
            $("<div></div>")
                .attr("data-hour", hour)
                .addClass("time")
                .text(`${hour}:00 - ${hour + 1}:00`)
                .appendTo(slots);
        }
        $(".dayTime").append(header).append(slots);
    }

    setupDays() {
        const cal = this;
        $(".day").each(function () {
            const dayIndex = parseInt($(this).attr("data-dayIndex"));
            const name = $(this).attr("data-name");
            const header = $("<div></div>")
                .addClass("columnHeader")
                .text(name);
            const slots = $("<div></div>").addClass("slots");
            $("<div></div>").addClass("dayDisplay").appendTo(header);
            for (let hour = 0; hour < 24; hour++) {
                $("<div></div>")
                    .attr("data-hour", hour)
                    .appendTo(slots)
                    .addClass("slot")
                    .click(() => cal.clickSlot(hour, dayIndex))
                    .hover(
                        () => cal.hoverOver(hour),
                        () => cal.hoverOut()
                    );
            }
            $(this).append(header).append(slots);
        });
    }

    calculateCurrentWeek() {
        const now = new Date();
        this.weekStart = addDays(now, -getDayIndex(now));
        this.weekEnd = addDays(this.weekStart, 6);
    }

    changeWeek(number) {
        this.weekOffset += number;
        this.weekStart = addDays(this.weekStart, 7 * number);
        this.weekEnd = addDays(this.weekEnd, 7 * number);
        this.showWeek();
        this.loadEvents();
    }

    showWeek() {
        const options = {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        };
        $("#weekStartDisplay").text(
            this.weekStart.toLocaleDateString(undefined, options)
        );
        $("#weekEndDisplay").text(
            this.weekEnd.toLocaleDateString(undefined, options)
        );

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const date = addDays(this.weekStart, dayIndex);
            const display = date.toLocaleDateString(undefined, {
                month: "2-digit",
                day: "2-digit",
            });
            $(`.day[data-dayIndex=${dayIndex}] .dayDisplay`).text(
                display
            );
        }
        if (this.weekOffset == 0) {
            this.showCurrentDay();
        } else {
            this.hideCurrentDay();
        }
    }

    showCurrentDay() {
        const now = new Date();
        const dayIndex = getDayIndex(now);
        $(`.day[data-dayIndex=${dayIndex}]`).addClass("currentDay");
    }

    hideCurrentDay() {
        $(".day").removeClass("currentDay");
    }

    hoverOver(hour) {
        $(`.time[data-hour=${hour}]`).addClass("currentTime");
    }

    hoverOut() {
        $(".time").removeClass("currentTime");
    }

    clickSlot(hour, dayIndex) {
        if (this.mode != MODE.VIEW) return;
        this.mode = MODE.CREATE;
        const start = hour.toString().padStart(2, "0") + ":00";
        const end =
            hour < 23
                ? (hour + 1).toString().padStart(2, "0") + ":00"
                : hour.toString().padStart(2, "0") + ":59";

        const date = dateString(addDays(this.weekStart, dayIndex));
        const event = {
            start,
            end,
            date,
            title: "",
            description: "",
            color: "red",
        };
        this.openModal(event);
    }

    changeColor() {
        $(".color").removeClass("active");
        $(this).addClass("active");
    }

    openModal(event) {
        $("#modalTitle").text(
            this.mode == MODE.UPDATE
                ? "Update your event"
                : "Create a new event"
        );
        $("#eventTitle").val(event.title);
        $("#eventDate").val(event.date);
        $("#eventStart").val(event.start);
        $("#eventEnd").val(event.end);
        $("#eventDescription").val(event.description);
        $(".color").removeClass("active");
        $(`.color[data-color=${event.color}]`).addClass("active");
        if (this.mode == MODE.UPDATE) {
            $("#submitButton").val("Update");
            $("#deleteButton")
                .show()
                .off("click")
                .click(() => this.delete(event));
            $("#copyButton")
                .show()
                .off("click")
                .click(() => this.copy(event));
        } else if (this.mode == MODE.CREATE) {
            $("#submitButton").val("Create");
            $("#deleteButton, #copyButton").hide();
        }
        $("#eventModal").fadeIn(200);
        $("#eventTitle").focus();
        $("#calendar").addClass("opaque");
        $("#eventModal")
            .off("submit")
            .submit((e) => {
                e.preventDefault();
                this.submitModal(event);
            });
    }

    async submitModal(event) {
        const isValid = await this.validate(event);
        if (!isValid) return;
        if (this.mode == MODE.CREATE) {
            await this.create(event);
            this.closeModal();
            this.show(event);
        } else if (this.mode == MODE.UPDATE) {
            await this.update(event);
            this.closeModal();
            this.show(event);
        }
    }

    async delete(event) {
        try {
            await this.collection.doc(event.id).delete();
        } catch (error) {
            window.alert(error.message);
        }
        $(`#${event.id}`).remove();
        this.closeModal();
    }

    copy(event) {
        if (this.mode != MODE.UPDATE) return;
        this.closeModal();
        this.mode = MODE.CREATE;
        const copy = {
            title: "Copy of " + event.title,
            start: event.start,
            end: event.end,
            date: event.date,
            description: event.description,
            color: event.color,
        };
        this.openModal(copy);
    }

    click(event) {
        if (this.mode != MODE.VIEW) return;
        this.mode = MODE.UPDATE;
        this.openModal(event);
    }

    show(event) {
        if (
            event.date < dateString(this.weekStart) ||
            event.date > dateString(this.weekEnd)
        ) {
            $(`#${event.id}`).remove();
            return;
        }

        let eventSlot;

        if ($(`#${event.id}`).length) {
            eventSlot = $(`#${event.id}`);
        } else {
            eventSlot = $("<div></div>")
                .addClass("event")
                .attr("id", event.id)
                .click(() => this.click(event));
        }

        const h = this.slotHeight;

        const startHour = parseInt(event.start.substring(0, 2));
        const endHour = parseInt(event.end.substring(0, 2));
        const startMinutes = parseInt(event.start.substring(3, 5));
        const endMinutes = parseInt(event.end.substring(3, 5));
        const dayIndex = getDayIndex(new Date(event.date));

        const duration =
            (new Date(`${event.date}T${event.end}`).getTime() -
                new Date(`${event.date}T${event.start}`).getTime()) /
            (1000 * 60);

        eventSlot
            .text(event.title)
            .css(
                "top",
                (startHour + startMinutes / 60) * h + 2 + "px"
            )
            .css(
                "bottom",
                24 * h - (endHour + endMinutes / 60) * h + 1 + "px"
            )
            .css("backgroundColor", `var(--color-${event.color})`)
            .appendTo(`.day[data-dayIndex=${dayIndex}] .slots`);

        if (duration < 45) {
            eventSlot
                .removeClass("shortEvent")
                .addClass("veryShortEvent");
        } else if (duration < 59) {
            eventSlot
                .removeClass("veryShortEvent")
                .addClass("shortEvent");
        } else {
            eventSlot
                .removeClass("shortEvent")
                .removeClass("veryShortEvent");
        }
    }

    async validate(event) {
        const newStart = $("#eventStart").val();
        const newEnd = $("#eventEnd").val();
        const newDate = $("#eventDate").val();
        const changedTime =
            newStart != event.start ||
            newEnd != event.end ||
            newDate != event.date;

        if (changedTime) {
            const eventsOnNewDate = await this.collection
                .where("date", "==", newDate)
                .get();

            let collidingEvent = null;

            eventsOnNewDate.forEach((doc) => {
                const otherId = doc.id;
                const other = doc.data();
                if (
                    otherId != event.id &&
                    other.end > newStart &&
                    other.start < newEnd
                ) {
                    collidingEvent = other;
                }
            });
            if (collidingEvent) {
                $("#errors").text(
                    `This collides with the event '${collidingEvent.title}'
                         (${collidingEvent.start} - ${collidingEvent.end}).`
                );
                return false;
            }
        }

        const duration =
            (new Date(`${newDate}T${newEnd}`).getTime() -
                new Date(`${newDate}T${newStart}`).getTime()) /
            (1000 * 60);

        if (duration < 0) {
            $("#errors").text("The start cannot be after the end.");
            return false;
        } else if (duration < 30) {
            $("#errors").text(
                "Events should be at least 30 minutes."
            );
            return false;
        }
        return true;
    }

    read(event) {
        event.title = $("#eventTitle").val();
        event.start = $("#eventStart").val();
        event.end = $("#eventEnd").val();
        event.date = $("#eventDate").val();
        event.description = $("#eventDescription").val();
        event.color = $(".color.active").attr("data-color");
    }

    async create(event) {
        this.read(event);
        try {
            const eventRef = await this.collection.add(event);
            event.id = eventRef.id;
        } catch (error) {
            window.alert(error.message);
        }
    }

    async update(event) {
        this.read(event);
        try {
            await this.collection.doc(event.id).update({
                title: event.title,
                start: event.start,
                end: event.end,
                date: event.date,
                description: event.description,
                color: event.color,
            });
        } catch (error) {
            window.alert(error.message);
        }
    }

    closeModal() {
        $("#eventModal").fadeOut(200);
        $("#errors").text("");
        $("#calendar").removeClass("opaque");
        this.mode = MODE.VIEW;
    }

    addNewEvent() {
        if (this.mode != MODE.VIEW) return;
        this.mode = MODE.CREATE;
        const event = {
            start: "12:00",
            end: "13:00",
            date: dateString(this.weekStart),
            title: "",
            description: "",
            color: "red",
        };
        this.openModal(event);
    }

    async loadEvents() {
        $(".event").remove();
        try {
            this.snapShot = await this.collection
                .where("date", ">=", dateString(this.weekStart))
                .where("date", "<=", dateString(this.weekEnd))
                .get();
        } catch (error) {
            window.alert(error.message);
            return;
        }
        this.snapShot.forEach((doc) => {
            const event = doc.data();
            event.id = doc.id;
            this.show(event);
        });
    }

    async trash() {
        if (this.mode != MODE.VIEW) return;
        const confirmed = window.confirm(
            "This will delete all the events in your calendar!\n" +
                "This cannot be undone. Are you sure?"
        );
        if (confirmed) {
            this.snapShot = null;
            try {
                const snapShot = await this.collection.get();
                snapShot.forEach((doc) => {
                    this.collection.doc(doc.id).delete();
                    $(`#${doc.id}`).remove();
                });
            } catch (error) {
                window.alert(error.message);
            }
        }
    }

    showEmail() {
        $("#emailDisplay").text(this.user.email);
    }

    logout() {
        firebase
            .auth()
            .signOut()
            .then(() => {
                window.location.href = "./index.html";
            })
            .catch((error) => {
                window.alert(error.message);
            });
    }
}