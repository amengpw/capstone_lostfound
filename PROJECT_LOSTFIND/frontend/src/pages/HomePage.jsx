import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, PlusCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

// PERBAIKAN ALAMAT IMPORT (Menggunakan Path Relatif Aman)
import { barangAPI } from "../services/api.js";
import { ItemCard, LoadingPage } from "../components/ui.jsx";
import useAuthStore from "../store/authStore.js";
import heroImg from "../assets/hero-ums.png";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    barangAPI
      .getList({ page: 1 })
      .then(({ data }) => setRecent(data.results?.slice(0, 6) ?? []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="overflow-hidden bg-white">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-[#004b8d] text-white py-20 lg:py-32 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 z-10">
          {/* SISI KIRI: TEXT */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex-1 text-left"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffcc00] text-[#004b8d] text-sm font-bold shadow-lg">
                TEMUKAN BARANG HILANG DI KAMPUS
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight"
            >
              Lost & Found <br />
              <span className="text-[#ffcc00]">Kampus UMS</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-blue-100 text-lg lg:text-xl mb-10 max-w-xl leading-relaxed opacity-90"
            >
              Platform terpusat untuk melaporkan dan menemukan barang hilang.
              Cari berdasarkan kategori, klaim dengan verifikasi KTM, dan chat
              langsung dengan penemu.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link
                to="/barang"
                className="flex items-center gap-2 bg-[#ffcc00] text-[#004b8d] font-black px-8 py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-xl"
              >
                <Search size={22} /> Cari Barang
              </Link>

              <Link
                to={isAuthenticated ? "/lapor" : "/register"}
                className="flex items-center gap-2 bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-[#004b8d] transition-all"
              >
                {isAuthenticated ? (
                  <>
                    <PlusCircle size={22} /> Buat Laporan
                  </>
                ) : (
                  <>
                    <ArrowRight size={22} /> Mulai Sekarang
                  </>
                )}
              </Link>
            </motion.div>
          </motion.div>

          {/* SISI KANAN: GAMBAR */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full lg:w-auto flex justify-center items-center relative"
          >
            <div className="absolute w-[80%] h-[80%] bg-[#ffcc00] rounded-full blur-[120px] opacity-[0.15] -z-10"></div>

            <div className="relative w-full max-w-2xl">
              <img
                src={heroImg}
                alt="Hero UMS"
                className="w-full h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.3)]"
              />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-4 right-0 lg:-right-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl hidden md:flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-[#ffcc00] rounded-lg flex items-center justify-center text-[#004b8d]">
                  <ShieldCheck size={20} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CARA KERJA SECTION --- */}
      <section className="py-24 px-6 bg-white relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#004b8d] mb-4">
              Cara Melapor
            </h2>
            <div className="w-20 h-1.5 bg-[#ffcc00] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: PlusCircle,
                title: "1. Laporkan",
                desc: "Upload foto barang temuan beserta rincian lokasi dan kategori dengan mudah.",
              },
              {
                step: "02",
                icon: Search,
                title: "2. Cari & Temukan",
                desc: "Pemilik mencari berdasarkan kategori, lalu mengajukan klaim dengan foto KTM.",
              },
              {
                step: "03",
                icon: ShieldCheck,
                title: "3. Verifikasi & Ambil",
                desc: 'Penemu memverifikasi foto KTM, dan status otomatis berubah jadi "Telah Diambil".',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-slate-50 p-10 rounded-[2rem] border border-slate-100 relative overflow-hidden group"
              >
                <span className="absolute -top-4 -right-2 text-8xl font-black text-slate-200/40 group-hover:text-[#ffcc00]/10 transition-colors">
                  {item.step}
                </span>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-slate-100">
                  <item.icon className="text-[#004b8d]" size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#004b8d] mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- RECENT ITEMS --- */}
      <section className="py-24 px-6 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-black text-[#004b8d]">
                Laporan Terbaru
              </h2>
              <p className="text-slate-500 mt-2 font-medium">
                Barang yang baru saja ditemukan di sekitar kampus.
              </p>
            </div>
            <Link
              to="/barang"
              className="flex items-center gap-2 text-[#004b8d] font-bold hover:gap-4 transition-all"
            >
              Lihat Semua Barang <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingPage />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                >
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
