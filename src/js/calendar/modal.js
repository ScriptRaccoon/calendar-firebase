function openModal(event) {
    $("#modalTitle").text(
        mode == MODE.UPDATE
            ? "Update your event"
            : "Create a new event"
    );
    $("#eventTitle").val(event.title);
    $("#eventDate").val(event.date);
    $("#eventStart").val(event.start);
    $("#eventEnd").val(event.end);
    $("#eventDescription").val(event.description);
    $("#allDayCheckBox").prop("checked", event.allDay);
    if (event.allDay) {
        $("#timeLabel, #timeInputs").hide();
    } else {
        $("#timeLabel, #timeInputs").show();
    }
    $(".color").removeClass("active");
    $(`.color[data-color=${event.color}]`).addClass("active");
    if (mode == MODE.UPDATE) {
        $("#submitButton").val("Update");
        $("#deleteButton")
            .show()
            .off("click")
            .click(() => deleteEvent(event));
        $("#copyButton")
            .show()
            .off("click")
            .click(() => copyEvent(event));
    } else if (mode == MODE.CREATE) {
        $("#submitButton").val("Create");
        $("#deleteButton, #copyButton").hide();
    }
    $("#modalContainer").fadeIn(200).css("display", "flex");
    $("#eventModal")
        .off("submit")
        .submit((e) => {
            e.preventDefault();
            submitModal(event);
        });
}

function closeModal() {
    $("#modalContainer").fadeOut(200);
    $("#errors").text("");
    mode = MODE.VIEW;
}

async function submitModal(event) {
    const isValid = await validateEvent(event);
    if (!isValid) return;
    if (mode == MODE.CREATE) {
        await createEvent(event);
    } else if (mode == MODE.UPDATE) {
        await updateEvent(event);
    }
}
