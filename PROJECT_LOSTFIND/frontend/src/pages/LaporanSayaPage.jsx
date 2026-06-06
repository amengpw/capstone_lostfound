// ── LaporanSayaPage (UMS Style) ──────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Package,
  Trash2,
  CheckCircle,
  Archive,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { barangAPI, klaimAPI } from "@/services/api";
import { ItemCard, EmptyState, LoadingPage } from "@/components/ui";
import toast from "react-hot-toast";

export default function LaporanSayaPage() {
  const [items, setItems] = useState([]);
  const [klaimSaya, setKlaimSaya] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("laporan");

  const fetchData = () => {
    setLoading(true);
    Promise.all([barangAPI.milikSaya(), klaimAPI.klaimSaya()])
      .then(([l, k]) => {
        setItems(l.data.results ?? l.data);
        setKlaimSaya(k.data.results ?? k.data);
      })
      .catch(() => toast.error("Gagal memuat data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus laporan ini secara permanen?")) return;
    try {
      await barangAPI.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Laporan berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus laporan.");
    }
  };

  const handleTandaiSelesai = async (id) => {
    try {
      await barangAPI.updateStatus(id, "diambil");
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "diambil" } : i)),
      );
      toast.success('Status berhasil diubah ke "Selesai".');
    } catch {
      toast.error("Gagal mengubah status.");
    }
  };

  const STATUS_KLAIM = {
    menunggu: {
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
      label: "Menunggu Verifikasi",
    },
    disetujui: {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
      label: "Disetujui",
    },
    ditolak: {
      cls: "bg-rose-50 text-rose-700 border-rose-200",
      icon: XCircle,
      label: "Ditolak",
    },
  };

  // --- Animasi ---
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#003366] text-[#ffcc00] rounded-[2rem] shadow-xl shadow-blue-900/20 rotate-3">
              <Archive size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#003366] tracking-tight uppercase">
                Aktivitas Saya
              </h1>
              <p className="text-slate-500 font-medium italic">
                Pantau perkembangan laporan & klaim Anda
              </p>
            </div>
          </div>
          <Link
            to="/lapor"
            className="flex items-center justify-center gap-2 bg-[#ffcc00] hover:bg-[#e6b800] text-[#003366] px-8 py-4 rounded-2xl font-black transition-all shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-1 active:scale-95 uppercase text-sm"
          >
            <PlusCircle size={20} /> Buat Laporan Baru
          </Link>
        </motion.div>

        {/* Custom Tab Switcher (UMS Styled) */}
        <div className="flex justify-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex p-2 bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100"
          >
            {[
              { key: "laporan", label: "Laporan Saya", count: items.length },
              { key: "klaim", label: "Klaim Saya", count: klaimSaya.length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative px-8 py-3 rounded-[1.5rem] text-sm font-black transition-all duration-300 flex items-center gap-3 ${
                  tab === key
                    ? "text-white"
                    : "text-slate-400 hover:text-[#003366]"
                }`}
              >
                {tab === key && (
                  <motion.div
                    layoutId="activeTabBackground"
                    // DI SINI LETAK PERBAIKANNYA: -z-10 sudah dihapus supaya background birunya muncul
                    className="absolute inset-0 bg-[#003366] rounded-[1.5rem]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{label.toUpperCase()}</span>
                <span
                  className={`relative z-10 px-2 py-0.5 rounded-lg text-[10px] ${
                    tab === key
                      ? "bg-[#ffcc00] text-[#003366]"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingPage />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {tab === "laporan" ? (
                items.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="Belum Ada Laporan"
                    desc="Ayo bantu sesama Civitas UMS dengan melaporkan barang temuan!"
                  />
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                  >
                    {items.map((item) => (
                      <motion.div
                        variants={itemUp}
                        key={item.id}
                        className="flex flex-col gap-3"
                      >
                        <div className="flex-1 transform transition-transform hover:scale-[1.02]">
                          <ItemCard item={item} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 px-1">
                          {item.status === "aktif" && (
                            <button
                              onClick={() => handleTandaiSelesai(item.id)}
                              className="flex items-center justify-center gap-1 text-[10px] font-black py-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-tighter"
                            >
                              <CheckCircle size={14} /> Selesai
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center justify-center gap-1 text-[10px] font-black py-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all uppercase tracking-tighter"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )
              ) : /* Tab: Klaim Saya */
              klaimSaya.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="Belum Ada Klaim"
                  desc="Riwayat pengajuan klaim barang Anda akan muncul di sini."
                />
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6 max-w-4xl mx-auto"
                >
                  {klaimSaya.map((k) => {
                    const st = STATUS_KLAIM[k.status] ?? STATUS_KLAIM.menunggu;
                    const StatusIcon = st.icon;
                    return (
                      <motion.div
                        variants={itemUp}
                        key={k.id}
                        className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-50 flex flex-col sm:flex-row gap-6 items-center hover:border-[#ffcc00]/30 transition-all group"
                      >
                        <div className="w-full sm:w-32 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-slate-50">
                          {k.foto_ktm_url ? (
                            <img
                              src={k.foto_ktm_url}
                              alt="Proof"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Archive />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 text-center sm:text-left space-y-2">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <span
                              className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${st.cls}`}
                            >
                              <StatusIcon size={12} /> {st.label}
                            </span>
                            <span
                              className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${k.laporan_info?.jenis === "hilang" ? "bg-rose-100 text-rose-600" : "bg-[#ffcc00]/20 text-[#003366]"}`}
                            >
                              {k.laporan_info?.jenis}
                            </span>
                          </div>
                          <Link
                            to={`/barang/${k.laporan_info?.id}`}
                            className="block text-xl font-bold text-[#003366] hover:text-[#ffcc00] transition-colors line-clamp-1 uppercase tracking-tight"
                          >
                            {k.laporan_info?.judul || "Barang Terhapus"}
                          </Link>
                          {k.catatan_admin && (
                            <div className="bg-slate-50 border-l-4 border-[#ffcc00] p-3 rounded-r-xl inline-block mt-2">
                              <p className="text-xs italic text-slate-600">
                                <span className="font-bold text-[#003366] not-italic">
                                  Admin:
                                </span>{" "}
                                {k.catatan_admin}
                              </p>
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/barang/${k.laporan_info?.id}`}
                          className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-[#003366] hover:text-[#ffcc00] transition-all"
                        >
                          <ChevronRight size={24} />
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
