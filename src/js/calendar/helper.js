function dateString(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}`;
}

function getDayIndex(date) {
    const falseIndex = date.getDay();
    return falseIndex == 0 ? 6 : falseIndex - 1;
}

const dayInMillis = 1000 * 60 * 60 * 24;

function addDays(date, number) {
    return new Date(date.getTime() + number * dayInMillis);
}
