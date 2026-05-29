// ── NotifikasiPage (UMS Edition) ───────────────────────────────────────────
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Package,
  MessageCircle,
  ShieldCheck,
  Info,
  XCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { notifAPI, chatAPI } from "@/services/api";
import { EmptyState, LoadingPage } from "@/components/ui";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";

const TIPE_ICON = {
  klaim_masuk: {
    icon: Package,
    cls: "bg-blue-50 text-blue-600 border-blue-100",
  },
  klaim_disetujui: {
    icon: ShieldCheck,
    cls: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  klaim_ditolak: {
    icon: XCircle,
    cls: "bg-rose-50 text-rose-600 border-rose-100",
  },
  pesan_baru: {
    icon: MessageCircle,
    cls: "bg-purple-50 text-purple-600 border-purple-100",
  },
  info: { icon: Info, cls: "bg-slate-50 text-slate-500 border-slate-100" },
};

export default function NotifikasiPage() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    notifAPI
      .getAll()
      .then(({ data }) => setNotifs(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleBacaSemua = async () => {
    await notifAPI.bacaSemua();
    setNotifs((prev) => prev.map((n) => ({ ...n, sudah_dibaca: true })));
    toast.success("Semua notifikasi ditandai sudah dibaca.");
  };

  const handleBaca = async (notifId) => {
    await notifAPI.baca(notifId);
    setNotifs((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, sudah_dibaca: true } : n)),
    );
  };

  const unreadCount = notifs.filter((n) => !n.sudah_dibaca).length;

  const handleOpenNotif = async (notif) => {
    if (!notif.sudah_dibaca) await handleBaca(notif.id);
    if (notif.tipe === "pesan_baru") {
      navigate("/chat", {
        state: notif.ruang_chat_id
          ? { ruangId: notif.ruang_chat_id }
          : undefined,
      });
      return;
    }
    if (notif.laporan) navigate(`/barang/${notif.laporan}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div className="flex items-center gap-5">
            <div className="p-4 bg-[#003366] text-[#ffcc00] rounded-[2rem] shadow-xl shadow-blue-900/20 rotate-3">
              <Bell size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">
                Pusat Pesan
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {unreadCount > 0 ? (
                  <span className="flex items-center gap-1.5 bg-[#ffcc00]/20 text-[#003366] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <AlertCircle size={12} /> {unreadCount} Baru
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs font-medium italic">
                    Semua kabar sudah terpantau
                  </span>
                )}
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleBacaSemua}
              className="group flex items-center gap-2 bg-white hover:bg-[#003366] hover:text-[#ffcc00] text-[#003366] px-6 py-3 rounded-2xl text-xs font-black border-2 border-[#003366]/5 transition-all shadow-sm uppercase tracking-widest active:scale-95"
            >
              <CheckCheck
                size={18}
                className="group-hover:scale-110 transition-transform"
              />{" "}
              Tandai Dibaca
            </button>
          )}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingPage />
          </div>
        ) : notifs.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Kotak Masuk Kosong"
            desc="Belum ada aktivitas klaim atau pesan baru untuk akun Anda saat ini."
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {notifs.map((n) => {
                const config = TIPE_ICON[n.tipe] ?? TIPE_ICON.info;
                const Icon = config.icon;

                return (
                  <motion.div
                    variants={itemVariants}
                    key={n.id}
                    onClick={() => handleOpenNotif(n)}
                    className={`group relative flex gap-5 p-6 rounded-[2rem] border-2 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1
                      ${
                        n.sudah_dibaca
                          ? "bg-white border-transparent"
                          : "bg-white border-[#ffcc00]/30 shadow-[#ffcc00]/5"
                      }`}
                  >
                    {/* Unread Indicator */}
                    {!n.sudah_dibaca && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-10 bg-[#ffcc00] rounded-r-full shadow-[4px_0_10px_rgba(255,204,0,0.4)]" />
                    )}

                    {/* Icon Box */}
                    <div
                      className={`w-14 h-14 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${config.cls}`}
                    >
                      <Icon size={28} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p
                          className={`text-base line-clamp-1 pr-4 uppercase tracking-tight ${n.sudah_dibaca ? "font-bold text-slate-700" : "font-black text-[#003366]"}`}
                        >
                          {n.judul}
                        </p>
                        <time className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap mt-1">
                          {format(new Date(n.created_at), "HH:mm • d MMM", {
                            locale: id,
                          })}
                        </time>
                      </div>

                      <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed mb-4">
                        {n.pesan}
                      </p>

                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-[#003366] flex items-center gap-1 group-hover:text-[#ffcc00] transition-colors uppercase tracking-widest">
                          {n.tipe === "pesan_baru"
                            ? "Balas Chat"
                            : "Detail Laporan"}
                          <ChevronRight
                            size={14}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </span>
                      </div>
                    </div>

                    {/* Decoration for Unread */}
                    {!n.sudah_dibaca && (
                      <span className="absolute top-6 right-6 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffcc00] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffcc00]"></span>
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
