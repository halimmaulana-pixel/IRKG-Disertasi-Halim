const API_BASE = (import.meta.env.VITE_API_BASE || "/api").trim().replace(/\/$/, "");

export { API_BASE };
