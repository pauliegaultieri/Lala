export function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toEpochMs(value) {
  if (!value) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  if (typeof value?.toDate === "function") {
    const ms = value.toDate().getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  if (typeof value?.seconds === "number") {
    return value.seconds * 1000;
  }

  return null;
}

export function timeAgo(timestamp) {
  const tsMs = toEpochMs(timestamp);
  if (!tsMs) return "-";

  const now = Date.now();
  const diffInSeconds = Math.floor((now - tsMs) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  if (!Number.isFinite(diffInSeconds) || diffInSeconds < 1) return "just now";

  for (const interval of intervals) {
    const value = Math.floor(diffInSeconds / interval.seconds);
    if (value >= 1) {
      return `${value} ${interval.label}${value !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

