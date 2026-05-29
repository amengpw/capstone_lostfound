import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Upload,
  X,
  ImagePlus,
  Megaphone,
  FileText,
  MapPin,
  Calendar,
  Phone,
  Info,
  Loader2,
  Search,
  Package,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// ── PERBAIKAN PATH: Sesuaikan folder jika @/services tidak terbaca di Vite kamu ──
import { barangAPI } from "../services/api.js";

export function LaporPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [kategori, setKategori] = useState([]);
  const [photos, setPhotos] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { jenis: "hilang" },
  });

  // ── PENGAMAN 1: Ambil Kategori dengan cadangan (Fallback) jika API bermasalah ──
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        if (barangAPI && typeof barangAPI.getKategori === "function") {
          const { data } = await barangAPI.getKategori();
          setKategori(data.results ?? data ?? []);
        }
      } catch (err) {
        console.error(
          "Gagal mengambil kategori dari API, menggunakan opsi cadangan:",
          err,
        );
        // Opsi cadangan agar UI tidak kosong/blank saat backend mati
        setKategori([
          { id: 1, nama: "Dokumen & Kartu (KTM/KTP)" },
          { id: 2, nama: "Gawai & Elektronik" },
          { id: 3, nama: "Dompet & Kunci" },
          { id: 4, nama: "Perlengkapan Belajar" },
          { id: 5, nama: "Lainnya" },
        ]);
      }
    };
    fetchKategori();
  }, []);

  // Fungsi mengelola foto preview
  const addPhoto = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) =>
      [
        ...prev,
        ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
      ].slice(0, 5),
    );
    e.target.value = "";
  };

  // ── PENGAMAN 2: Proses kirim laporan berlapis anti-crash ──
  const onSubmit = async (data) => {
    if (photos.length === 0) {
      toast.error("Upload minimal 1 foto barang sebagai bukti.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        jenis: data.jenis,
        judul: data.judul,
        deskripsi: data.deskripsi,
        lokasi: data.lokasi,
        tanggal_kejadian: data.tanggal_kejadian,
        kontak_wa: data.kontak_wa || null,
      };
      if (data.kategori_id) payload.kategori_id = Number(data.kategori_id);

      if (!barangAPI || typeof barangAPI.create !== "function") {
        throw new Error("Layanan API tidak terhubung dengan benar.");
      }

      // 1. Kirim data teks laporan
      const res = await barangAPI.create(payload);
      const laporan = res?.data ?? res;

      // 2. Kirim berkas foto satu per satu jika data teks berhasil
      if (laporan && laporan.id && typeof barangAPI.uploadFoto === "function") {
        for (let i = 0; i < photos.length; i++) {
          const fd = new FormData();
          fd.append("fotos", photos[i].file);
          await barangAPI.uploadFoto(laporan.id, fd);
        }
      }

      toast.success("Laporan UMS Lost & Found berhasil diterbitkan!");
      navigate(`/barang/${laporan.id || ""}`);
    } catch (err) {
      console.error("Eror submit laporan:", err);
      const d = err.response?.data;
      if (d) {
        Object.entries(d).forEach(([k, v]) =>
          toast.error(`${k}: ${Array.isArray(v) ? v[0] : v}`),
        );
      } else {
        toast.error(
          err.message ||
            "Gagal membuat laporan. Coba cek koneksi backend kamu.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const jenis = watch("jenis");

  // --- Framer Motion Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row items-center gap-5 text-center md:text-left"
        >
          <div className="p-4 bg-[#003366] text-[#ffcc00] rounded-[2rem] shadow-xl shadow-blue-900/20 rotate-3">
            <Megaphone size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tight">
              Buat Laporan Baru
            </h1>
            <p className="text-slate-500 font-medium italic">
              Bantu sesama Civitas UMS dengan informasi yang akurat.
            </p>
          </div>
        </motion.div>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* Section: Jenis Laporan */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-50"
          >
            <label className="flex items-center gap-2 text-sm font-black text-[#003366] mb-6 uppercase tracking-wider">
              <Info size={18} className="text-[#ffcc00]" /> Pilih Tipe Kejadian{" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Pilihan: Kehilangan */}
              <label
                className={`relative flex flex-col gap-3 border-2 rounded-3xl p-6 cursor-pointer transition-all duration-300 group
                ${jenis === "hilang" ? "border-rose-500 bg-rose-50/30" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}`}
              >
                <input
                  type="radio"
                  value="hilang"
                  className="sr-only"
                  {...register("jenis")}
                />
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 rounded-2xl ${jenis === "hilang" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30" : "bg-white text-slate-400 group-hover:text-slate-600 shadow-sm"}`}
                  >
                    <Search size={24} />
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${jenis === "hilang" ? "border-rose-500" : "border-slate-300"}`}
                  >
                    {jenis === "hilang" && (
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                    )}
                  </div>
                </div>
                <div>
                  <span
                    className={`block font-black text-lg ${jenis === "hilang" ? "text-rose-700" : "text-[#003366]"}`}
                  >
                    KEHILANGAN
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Saya kehilangan barang pribadi dan ingin mencarinya.
                  </p>
                </div>
              </label>

              {/* Pilihan: Penemuan */}
              <label
                className={`relative flex flex-col gap-3 border-2 rounded-3xl p-6 cursor-pointer transition-all duration-300 group
                ${jenis === "temuan" ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}`}
              >
                <input
                  type="radio"
                  value="temuan"
                  className="sr-only"
                  {...register("jenis")}
                />
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 rounded-2xl ${jenis === "temuan" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-white text-slate-400 group-hover:text-slate-600 shadow-sm"}`}
                  >
                    <Package size={24} />
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${jenis === "temuan" ? "border-emerald-500" : "border-slate-300"}`}
                  >
                    {jenis === "temuan" && (
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </div>
                <div>
                  <span
                    className={`block font-black text-lg ${jenis === "temuan" ? "text-emerald-700" : "text-[#003366]"}`}
                  >
                    PENEMUAN
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Saya menemukan barang orang lain dan ingin mengembalikan.
                  </p>
                </div>
              </label>
            </div>
          </motion.div>

          {/* Section: Detail Barang */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-50 space-y-6"
          >
            <h2 className="font-black text-lg text-[#003366] flex items-center gap-3 border-b border-slate-100 pb-5 uppercase tracking-tight">
              <FileText size={22} className="text-[#ffcc00]" /> Informasi Detail
              Barang
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase ml-1">
                  Nama / Judul Barang <span className="text-rose-500">*</span>
                </label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 text-[#003366] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#003366] transition-all placeholder:text-slate-400 font-medium"
                  placeholder="Cth: KTM di Perpustakaan Pusat"
                  {...register("judul", {
                    required: "Nama/Judul barang wajib diisi",
                  })}
                />
                {errors.judul && (
                  <p className="text-[10px] text-rose-500 mt-2 font-bold flex items-center gap-1 uppercase tracking-tighter">
                    <AlertCircle size={12} /> {errors.judul.message}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase ml-1">
                  Kategori
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 text-[#003366] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#003366] transition-all font-medium appearance-none"
                  {...register("kategori_id")}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {kategori.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-full">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase ml-1">
                  Deskripsi Ciri-Ciri Barang{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 text-[#003366] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#003366] transition-all resize-none font-medium"
                  rows={4}
                  placeholder="Sebutkan ciri khusus barang seperti warna casing, merk, stiker, atau gantungan kunci..."
                  {...register("deskripsi", {
                    required: "Deskripsi ciri barang wajib diisi",
                  })}
                />
                {errors.deskripsi && (
                  <p className="text-[10px] text-rose-500 mt-2 font-bold flex items-center gap-1 uppercase tracking-tighter">
                    <AlertCircle size={12} /> {errors.deskripsi.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase ml-1 flex items-center gap-1.5">
                  <MapPin size={14} /> Lokasi Kejadian{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 text-[#003366] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#003366] transition-all font-medium"
                  placeholder="Cth: Gedung Induk lt 2, Parkiran FIK"
                  {...register("lokasi", {
                    required: "Lokasi kejadian wajib diisi",
                  })}
                />
                {errors.lokasi && (
                  <p className="text-[10px] text-rose-500 mt-2 font-bold flex items-center gap-1 uppercase tracking-tighter">
                    <AlertCircle size={12} /> {errors.lokasi.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase ml-1 flex items-center gap-1.5">
                  <Calendar size={14} /> Tanggal Kejadian{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 text-[#003366] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#003366] transition-all font-medium"
                  {...register("tanggal_kejadian", {
                    required: "Tanggal wajib ditentukan",
                  })}
                />
                {errors.tanggal_kejadian && (
                  <p className="text-[10px] text-rose-500 mt-2 font-bold flex items-center gap-1 uppercase tracking-tighter">
                    <AlertCircle size={12} /> {errors.tanggal_kejadian.message}
                  </p>
                )}
              </div>

              <div className="col-span-full">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase ml-1 flex items-center gap-1.5">
                  <Phone size={14} /> No. WhatsApp yang Bisa Dihubungi{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold border-r border-slate-200 pr-3">
                    +62
                  </span>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 text-[#003366] rounded-2xl pl-16 pr-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#003366] transition-all font-medium"
                    placeholder="81234567xxx"
                    {...register("kontak_wa", {
                      required: "Nomor kontak WhatsApp aktif wajib diisi",
                    })}
                  />
                </div>
                {errors.kontak_wa && (
                  <p className="text-[10px] text-rose-500 mt-2 font-bold flex items-center gap-1 uppercase tracking-tighter">
                    <AlertCircle size={12} /> {errors.kontak_wa.message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Section: Upload Foto */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-50"
          >
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="font-black text-lg text-[#003366] flex items-center gap-3 uppercase tracking-tight">
                  <ImagePlus size={22} className="text-[#ffcc00]" /> Foto Bukti
                  Barang <span className="text-rose-500">*</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-1 italic font-medium">
                  Wajib mengunggah minimal 1 foto (Maksimal 5 foto, Format: JPG,
                  PNG)
                </p>
              </div>
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">
                {photos.length}/5
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <AnimatePresence>
                {photos.map((p, i) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={p.preview}
                    className="relative group aspect-square rounded-[1.5rem] overflow-hidden border-2 border-slate-100 shadow-sm"
                  >
                    <img
                      src={p.preview}
                      alt={`Preview ${i}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-[#ffcc00] text-[#003366] text-[8px] font-black px-2 py-1 rounded-lg uppercase shadow-sm">
                        Utama
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-2 right-2 bg-rose-500 text-white rounded-xl p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {photos.length < 5 && (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[1.5rem] aspect-square cursor-pointer hover:border-[#ffcc00] hover:bg-yellow-50/30 transition-all group active:scale-95">
                  <div className="p-3 bg-slate-50 text-slate-300 rounded-full group-hover:bg-[#ffcc00]/20 group-hover:text-[#ffcc00] transition-colors mb-2">
                    <ImagePlus size={24} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 group-hover:text-[#003366] uppercase">
                    Tambah
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={addPhoto}
                  />
                </label>
              )}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="pt-6 pb-12">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003366] hover:bg-[#002244] disabled:bg-slate-300 text-[#ffcc00] disabled:text-slate-500 text-sm font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-widest"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" /> Memproses
                  Laporan...
                </>
              ) : (
                <>
                  <Upload size={22} /> Terbitkan Laporan Sekarang
                </>
              )}
            </button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}

export default LaporPage;
