function setupControls() {
    $("#nextWeekButton").click(() => changeWeek(1));
    $("#prevWeekButton").click(() => changeWeek(-1));
    $("#displayButton").click(toggleDisplay);
    $("#addButton").click(addNewEvent);
    $("#trashButton").click(trashCalendar);
    $("#logoutButton").click(logout);
    $("#cancelButton").click(closeModal);
    $(".color").click(changeColor);
    $(".columnHeader .fa-chevron-right").click(() =>
        changeCurrentDay(+1)
    );
    $(".columnHeader .fa-chevron-left").click(() =>
        changeCurrentDay(-1)
    );
    $("#allDayCheckBox").change(toggleTimes);
}

async function changeWeek(number) {
    weekOffset += number;
    weekStart = addDays(weekStart, 7 * number);
    weekEnd = addDays(weekEnd, 7 * number);
    await loadEvents();
    showWeek();
    if (listener) listener();
    listenForUpdates();
}

function addNewEvent() {
    if (mode != MODE.VIEW) return;
    mode = MODE.CREATE;
    const dayIndex =
        display == DISPLAY.SINGLE_DAY ? currentDayIndex : 0;
    const event = {
        start: "12:00",
        end: "13:00",
        date: dateString(addDays(weekStart, dayIndex)),
        title: "",
        description: "",
        color: "red",
        allDay: false,
    };
    openModal(event);
}

async function trashCalendar() {
    if (mode != MODE.VIEW) return;
    const confirmed = window.confirm(
        "This will delete all the events in your calendar!\n" +
            "This cannot be undone. Are you sure?"
    );
    if (confirmed) {
        try {
            const snap = await collection.get();
            snap.forEach((doc) => {
                collection.doc(doc.id).delete();
                $(`#${doc.id}`).remove();
            });
        } catch (error) {
            window.alert(error.message);
        }
    }
}

function changeColor() {
    $(".color").removeClass("active");
    $(this).addClass("active");
}

function logout() {
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

function toggleDisplay() {
    $("#displayButton")
        .toggleClass("fa-calendar-day")
        .toggleClass("fa-calendar-week");
    $("#calendar").toggleClass("singleDay");
    if (display == DISPLAY.WEEK) {
        switchToSingleDayDisplay();
    } else {
        switchToWeekDisplay();
    }
}

function switchToSingleDayDisplay() {
    display = DISPLAY.SINGLE_DAY;
    $("#calendar").addClass("singleDay");
    $("#displayButton")
        .removeClass("fa-calendar-week")
        .addClass("fa-calendar-day");
    $("#displayButton").attr("title", "Change to week view");
    $(`.day[data-dayIndex="${currentDayIndex}"`).addClass("current");
    $(`.columnHeader[data-dayIndex="${currentDayIndex}"`).addClass(
        "current"
    );
}

function switchToWeekDisplay() {
    display = DISPLAY.WEEK;
    $("#calendar").removeClass("singleDay");
    $("#displayButton")
        .removeClass("fa-calendar-day")
        .addClass("fa-calendar-week");

    $("#displayButton").attr("title", "Change to day view");
    $(".day, .columnHeader").removeClass("current");
}

function changeCurrentDay(direction) {
    if (display == DISPLAY.WEEK) return;
    $(".day, .columnHeader").removeClass("current");
    currentDayIndex += direction;
    if (currentDayIndex < 0) {
        changeWeek(-1);
        currentDayIndex = 6;
    } else if (currentDayIndex >= 7) {
        changeWeek(+1);
        currentDayIndex = 0;
    }
    $(`.day[data-dayIndex="${currentDayIndex}"`).addClass("current");
    $(`.columnHeader[data-dayIndex="${currentDayIndex}"`).addClass(
        "current"
    );
}

function toggleTimes() {
    $("#timeLabel").toggle();
    $("#timeInputs").toggle();
}
