export const formatTimestamp = (timestampString) => {
  const date = new Date(timestampString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
};

// Function to format the date as "day of the week, day, and month"
export const formatDate = (timestampString) => {
  const date = new Date(timestampString);
  const options = { weekday: "long", day: "numeric", month: "long" };
  return date.toLocaleDateString(undefined, options);
};

export const formatTimeFromDateString = (dateString) => {
  if (!dateString) {
    return ""
  }

  const date = new Date(dateString);
  const currentDate = new Date();

  // Check if the date is in the same day as today
  if (
    date.getDate() === currentDate.getDate() &&
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear()
  ) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  if (
    date.getFullYear() === currentDate.getFullYear() &&
    getWeekNumber(currentDate) === getWeekNumber(date)
  ) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  // Format as day/month like 5/08
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-based
  return `${day}/${month}`;
};

function getWeekNumber(d) {
  d = new Date(+d);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  var yearStart = new Date(d.getFullYear(), 0, 1);
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}
