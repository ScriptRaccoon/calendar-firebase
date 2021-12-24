let user,
    collection,
    mode,
    display,
    weekOffset,
    slotHeight,
    weekStart,
    weekEnd,
    listener,
    currentDayIndex;

const MODE = {
    VIEW: 1,
    UPDATE: 2,
    CREATE: 3,
};

const DISPLAY = {
    DAY: 1,
    WEEK: 2,
};

$(() => {
    firebase.auth().onAuthStateChanged((firebaseUser) => {
        if (
            !firebaseUser ||
            (firebaseUser && !firebaseUser.emailVerified)
        ) {
            window.location.href = "./index.html";
        } else {
            user = firebaseUser;
            setupCalendar();
        }
    });
});

function setupCalendar() {
    setupVariables();
    detectDisplay();
    showEmail();
    setupTimes();
    setupDays();
    calculateCurrentWeek();
    showWeek();
    listenForUpdates();
    setupControls();
}

function setupVariables() {
    collection = database.collection(user.uid);
    mode = MODE.VIEW;
    display = DISPLAY.WEEK;
    weekOffset = 0;
    slotHeight = 30;
    weekStart = null;
    weekEnd = null;
    listener = null;
    currentDayIndex = getDayIndex(new Date());
}

function detectDisplay() {
    if (window.innerWidth < 900) {
        switchToDayDisplay();
    }
    $("#calendar").fadeIn();
}

function showEmail() {
    $("#emailDisplay").text(user.email);
}

function setupTimes() {
    for (let hour = 0; hour < 24; hour++) {
        const time = $("<div></div>")
            .attr("data-hour", hour)
            .addClass("time")
            .appendTo(".dayTime");
        if (hour > 0)
            $("<span></span>").text(`${hour}:00`).appendTo(time);
    }
    $("#calendar").scrollTop(7 * slotHeight);
}

function setupDays() {
    $(".day").each(function () {
        const day = $(this);
        const dayIndex = parseInt(day.attr("data-dayIndex"));
        $("<div></div>").addClass("allDaySection").appendTo(day);
        for (let hour = 0; hour < 24; hour++) {
            $("<div></div>")
                .attr("data-hour", hour)
                .appendTo(day)
                .addClass("slot")
                .on("click", () => handleClick(hour, dayIndex))
                .hover(
                    () =>
                        $(`.time[data-hour=${hour}]`).addClass(
                            "currentTime"
                        ),
                    () => $(".time").removeClass("currentTime")
                );
        }
    });
}

function handleClick(hour, dayIndex) {
    if (mode != MODE.VIEW) return;
    mode = MODE.CREATE;
    const start = hour.toString().padStart(2, "0") + ":00";
    const end =
        hour < 23
            ? (hour + 1).toString().padStart(2, "0") + ":00"
            : hour.toString().padStart(2, "0") + ":59";

    const date = dateString(addDays(weekStart, dayIndex));
    const event = {
        start,
        end,
        date,
        title: "",
        description: "",
        color: "red",
        allDay: false,
    };
    openModal(event);
}

function calculateCurrentWeek() {
    const now = new Date();
    weekStart = addDays(now, -getDayIndex(now));
    weekEnd = addDays(weekStart, 6);
}

function showWeek() {
    const options = {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    };
    $("#weekStartDisplay").text(
        weekStart.toLocaleDateString(undefined, options)
    );
    $("#weekEndDisplay").text(
        weekEnd.toLocaleDateString(undefined, options)
    );

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = addDays(weekStart, dayIndex);
        const display = date.toLocaleDateString(undefined, {
            month: "2-digit",
            day: "2-digit",
        });
        $(`.columnHeader[data-dayIndex=${dayIndex}] .date`).text(
            display
        );
    }
    if (weekOffset == 0) {
        showCurrentDay();
    } else {
        hideCurrentDay();
    }
}

function showCurrentDay() {
    const now = new Date();
    const dayIndex = getDayIndex(now);
    $(`.columnHeader[data-dayIndex=${dayIndex}]`).addClass(
        "currentDay"
    );
}

function hideCurrentDay() {
    $(".columnHeader").removeClass("currentDay");
}

function listenForUpdates() {
    listener = collection
        .where("date", ">=", dateString(weekStart))
        .where("date", "<=", dateString(weekEnd))
        .onSnapshot((snap) => {
            $(".event").remove();
            snap.forEach((doc) => {
                const event = doc.data();
                event.id = doc.id;
                showEvent(event);
            });
        });
}
