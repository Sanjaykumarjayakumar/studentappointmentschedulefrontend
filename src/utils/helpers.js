import { toast } from "react-toastify";

export const errorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.code === "ERR_NETWORK")
    return "Cannot reach the server. Check that the backend is running.";
  if (err?.code === "ECONNABORTED") return "The server took too long to respond.";
  if (err?.message && !err.response) return err.message;
  return fallback;
};

export const notify = {
  success: (m) => toast.success(m),
  error: (m) => toast.error(m),
  info: (m) => toast.info(m),
  warn: (m) => toast.warn(m),
  fail: (err, fallback) => toast.error(errorMessage(err, fallback)),
};

// Backends return lists in different shapes. Accept an array or any common wrapper key.
export const toList = (data, ...keys) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const k of [...keys, "data", "items", "results"]) {
    if (Array.isArray(data[k])) return data[k];
  }
  return [];
};

export const idOf = (v) => (v && typeof v === "object" ? v._id || v.id : v);

export const todayStr = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

export const formatDate = (s) => {
  if (!s) return "-";
  const d = new Date(`${s}T00:00:00`);
  if (isNaN(d)) return s;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = String(t).split(":");
  if (m === undefined) return t;
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${((hour + 11) % 12) + 1}:${m} ${suffix}`;
};

export const timeRange = (s) =>
  s?.endTime ? `${formatTime(s.startTime)} - ${formatTime(s.endTime)}` : formatTime(s?.startTime);

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

export const decodeJwt = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
};

export const isObjectId = (v) => /^[a-f0-9]{24}$/i.test(String(v).trim());
