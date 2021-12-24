async function createEvent(event) {
    readEvent(event);
    try {
        const eventRef = await collection.add(event);
        event.id = eventRef.id;
        closeModal();
    } catch (error) {
        $("#errors").text(error.message);
    }
}

async function updateEvent(event) {
    readEvent(event);
    try {
        await collection.doc(event.id).update({
            title: event.title,
            start: event.start,
            end: event.end,
            date: event.date,
            description: event.description,
            color: event.color,
            allDay: event.allDay,
        });
        closeModal();
    } catch (error) {
        $("#errors").text(error.message);
    }
}

function readEvent(event) {
    event.title = $("#eventTitle").val();
    event.start = $("#eventStart").val();
    event.end = $("#eventEnd").val();
    event.date = $("#eventDate").val();
    event.description = $("#eventDescription").val();
    event.allDay = $("#allDayCheckBox").prop("checked");
    event.color = $(".color.active").attr("data-color");
}

async function deleteEvent(event) {
    const confirmed = window.confirm(
        "Do you really want to delete this event?"
    );
    if (confirmed) {
        try {
            await collection.doc(event.id).delete();
            $(`#${event.id}`).remove();
            closeModal();
        } catch (error) {
            $("#errors").text(error.message);
        }
    }
}

function copyEvent(event) {
    if (mode != MODE.UPDATE) return;
    closeModal();
    mode = MODE.CREATE;
    const eventCopy = {
        title: "Copy of " + event.title,
        start: event.start,
        end: event.end,
        date: event.date,
        description: event.description,
        color: event.color,
        allDay: event.allDay,
    };
    openModal(eventCopy);
}

function showEvent(event) {
    if (
        event.date < dateString(weekStart) ||
        event.date > dateString(weekEnd)
    ) {
        $(`#${event.id}`).remove();
        return;
    }

    let eventElement;

    if ($(`#${event.id}`).length) {
        eventElement = $(`#${event.id}`);
    } else {
        eventElement = $("<div></div>")
            .addClass("event")
            .attr("id", event.id)
            .click(() => clickEvent(event));
    }

    const h = slotHeight;
    const dayIndex = getDayIndex(new Date(event.date));

    if (!event.allDay) {
        const startHour = parseInt(event.start.substring(0, 2));
        const endHour = parseInt(event.end.substring(0, 2));
        const startMinutes = parseInt(event.start.substring(3, 5));
        const endMinutes = parseInt(event.end.substring(3, 5));

        const duration =
            (new Date(`${event.date}T${event.end}`).getTime() -
                new Date(`${event.date}T${event.start}`).getTime()) /
            (1000 * 60);

        eventElement
            .removeClass("allDay")
            .text(event.title)
            .css(
                "top",
                (startHour + startMinutes / 60) * h + 1 + "px"
            )
            .css(
                "bottom",
                24 * h - (endHour + endMinutes / 60) * h + 2 + "px"
            )
            .css("backgroundColor", `var(--color-${event.color})`)
            .appendTo(`.day[data-dayIndex=${dayIndex}]`);

        if (duration < 45) {
            eventElement
                .removeClass("shortEvent")
                .addClass("veryShortEvent");
        } else if (duration < 59) {
            eventElement
                .removeClass("veryShortEvent")
                .addClass("shortEvent");
        } else {
            eventElement
                .removeClass("shortEvent")
                .removeClass("veryShortEvent");
        }
    } else {
        eventElement
            .addClass("allDay")
            .text(event.title)
            .css("backgroundColor", `var(--color-${event.color})`)
            .appendTo(
                `.columnHeader[data-dayIndex=${dayIndex}] .allDaySection`
            );
    }
}

function clickEvent(event) {
    if (mode != MODE.VIEW) return;
    mode = MODE.UPDATE;
    openModal(event);
}

async function validateEvent(event) {
    if (event.allDay) return true;
    const newStart = $("#eventStart").val();
    const newEnd = $("#eventEnd").val();
    const newDate = $("#eventDate").val();
    const changedTime =
        newStart != event.start ||
        newEnd != event.end ||
        newDate != event.date;

    if (changedTime) {
        const eventsOnNewDate = await collection
            .where("date", "==", newDate)
            .get();

        let collidingEvent = null;

        eventsOnNewDate.forEach((doc) => {
            const otherId = doc.id;
            const other = doc.data();
            if (
                !other.allDay &&
                otherId != event.id &&
                other.end > newStart &&
                other.start < newEnd
            ) {
                collidingEvent = other;
            }
        });
        if (collidingEvent) {
            $("#errors").text(
                `This collides with the event '${collidingEvent.title}'` +
                    `(${collidingEvent.start} - ${collidingEvent.end}).`
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
        $("#errors").text("Events should be at least 30 minutes.");
        return false;
    }
    return true;
}
