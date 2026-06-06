import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({ baseURL: "/api" });

const AUTH_ROUTES = [
  "/auth/login/",
  "/auth/register/",
  "/auth/refresh/",
  "/auth/logout/",
  "/auth/profile/",
];

const isAuthRoute = (url) => AUTH_ROUTES.some((route) => url?.includes(route));

const normalizeApiErrorMessage = (err) => {
  const response = err.response;
  if (!response) {
    return "Terjadi kesalahan jaringan. Pastikan koneksi internet Anda stabil.";
  }

  const data = response.data;
  const detail = data?.error || data?.message || data?.detail;

  if (detail) {
    if (Array.isArray(detail)) {
      return detail.flatMap((item) => (item ? item.toString() : "")).join(" ").trim();
    }
    if (typeof detail === "object") {
      return Object.values(detail)
        .flat()
        .map((item) => (item ? item.toString() : ""))
        .join(" ")
        .trim();
    }
    return String(detail);
  }

  switch (response.status) {
    case 400:
      return "Permintaan tidak valid. Periksa kembali data Anda.";
    case 401:
      return "Sesi habis. Silakan login ulang.";
    case 403:
      return "Akses ditolak. Anda tidak memiliki izin.";
    case 404:
      return "Data tidak ditemukan.";
    case 500:
      return "Terjadi kesalahan server. Silakan coba lagi nanti.";
    default:
      return `Terjadi kesalahan (${response.status}). Silakan coba lagi.`;
  }
};

const navigateToErrorPage = (status) => {
  const currentPath = window.location.pathname;
  const targetPath = `/error/${status}`;
  if (currentPath !== targetPath) {
    window.location.href = targetPath;
  }
};

const shouldShowErrorPage = (status, url) => {
  return [400, 401, 403, 404, 500].includes(status) && !isAuthRoute(url);
};

// Sisipkan token di setiap request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("access");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-refresh token saat 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config || {};

    if (orig.url?.includes("/auth/login/")) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
          return Promise.reject(err);
        }
        const { data } = await axios.post("/api/auth/refresh/", { refresh });
        localStorage.setItem("access", data.access);
        orig.headers.Authorization = `Bearer ${data.access}`;
        return api(orig);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    const status = err.response?.status;
    const apiMessage = normalizeApiErrorMessage(err);
    if ([400, 401, 403, 404, 500].includes(status)) {
      toast.error(apiMessage);
    }

    if (shouldShowErrorPage(status, orig.url)) {
      navigateToErrorPage(status);
    }

    return Promise.reject(err);
  },
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (d) => api.post("/auth/login/", d),
  register: (d) => api.post("/auth/register/", d),
  logout: (d) => api.post("/auth/logout/", d),
  profile: () => api.get("/auth/profile/"),
  updateProfile: (d) =>
    api.patch("/auth/profile/", d, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ── Barang ────────────────────────────────────────────────────────────────────
export const barangAPI = {
  getKategori: () => api.get("/barang/kategori/"),
  getList: (params) => api.get("/barang/", { params }),
  getById: (id) => api.get(`/barang/${id}/`),
  create: (d) => api.post("/barang/", d),
  update: (id, d) => api.patch(`/barang/${id}/`, d),
  delete: (id) => api.delete(`/barang/${id}/`),
  milikSaya: () => api.get("/barang/saya/"),
  uploadFoto: (id, fd) =>
    api.post(`/barang/${id}/fotos/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateStatus: (id, s) => api.patch(`/barang/${id}/status/`, { status: s }),
};

// ── Klaim ──────────────────────────────────────────────────────────────────────
export const klaimAPI = {
  ajukan: (laporanId, fd) =>
    api.post(`/barang/${laporanId}/klaim/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  listKlaim: (laporanId) => api.get(`/barang/${laporanId}/klaim/list/`),
  klaimSaya: () => api.get("/barang/klaim/saya/"),
  verifikasi: (klaimId, d) =>
    api.post(`/barang/klaim/${klaimId}/verifikasi/`, d),
};

// ── Notifikasi ────────────────────────────────────────────────────────────────
export const notifAPI = {
  getAll: () => api.get("/notif/"),
  unreadCount: () => api.get("/notif/unread-count/"),
  bacaSemua: () => api.patch("/notif/baca-semua/"),
  baca: (id) => api.patch(`/notif/${id}/baca/`),
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatAPI = {
  daftarRuang: () => api.get("/chat/"),
  bukaRuang: (d) => api.post("/chat/buka/", d),
  detailRuang: (id) => api.get(`/chat/${id}/`),
  riwayatPesan: (id) => api.get(`/chat/${id}/pesan/`),
};

// ── WebSocket helper ──────────────────────────────────────────────────────────
export const bukaWsChat = (ruangId) => {
  const token = localStorage.getItem("access");
  return new WebSocket(
    `ws://localhost:8000/ws/chat/${ruangId}/?token=${token}`,
  );
};
