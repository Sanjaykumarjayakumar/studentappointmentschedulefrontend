export const todayISO = (date = new Date()) => {
  const d = date;
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const fmtDate = (value) => {
  if (!value) return "-";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const fmtTime = (value) => {
  if (!value) return "";
  const text = String(value).trim();
  if (/am|pm/i.test(text)) return text.toUpperCase();
  const match = /^(\d{1,2}):(\d{2})/.exec(text);
  if (!match) return text;
  let h = Number(match[1]);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${match[2]} ${suffix}`;
};

export const timeRange = (start, end) =>
  end ? `${fmtTime(start)} - ${fmtTime(end)}` : fmtTime(start);

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "?";

// Works whether the API sends a populated object or just an id.
export const nameOf = (value, fallback = "-") => {
  if (!value) return fallback;
  if (typeof value === "string") return fallback;
  return value.name || value.email || fallback;
};

export const idOf = (value) => (value && typeof value === "object" ? value._id || value.id : value);

export const isEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v || "").trim());

export const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
