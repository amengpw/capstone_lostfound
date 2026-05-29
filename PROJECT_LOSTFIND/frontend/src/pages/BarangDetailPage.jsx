import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Phone,
  User,
  ChevronLeft,
  CheckCircle,
  XCircle,
  MessageCircle,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { barangAPI, klaimAPI, chatAPI } from "@/services/api";
import { BadgeJenis, BadgeStatus, LoadingPage } from "@/components/ui";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

export default function BarangDetailPage() {
  const { id: laporanId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [laporan, setLaporan] = useState(null);
  const [klaims, setKlaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  // State form klaim
  const [klaimMode, setKlaimMode] = useState(false);
  const [ktmFile, setKtmFile] = useState(null);
  const [ktmPrev, setKtmPrev] = useState(null);
  const [barangFile, setBarangFile] = useState(null);
  const [barangPrev, setBarangPrev] = useState(null);
  const [keterangan, setKeterangan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOwner = user?.id === laporan?.pelapor?.id;

  useEffect(() => {
    Promise.all([
      barangAPI.getById(laporanId),
      isAuthenticated
        ? klaimAPI.listKlaim(laporanId).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] }),
    ])
      .then(([l, k]) => {
        setLaporan(l.data);
        setKlaims(k.data.results ?? k.data);
      })
      .catch(() => toast.error("Gagal memuat data."))
      .finally(() => setLoading(false));
  }, [laporanId, isAuthenticated]);

  const resetFormKlaim = () => {
    setKlaimMode(false);
    setKtmFile(null);
    setKtmPrev(null);
    setBarangFile(null);
    setBarangPrev(null);
    setKeterangan("");
  };

  const handleKlaimSubmit = async () => {
    if (!ktmFile) return toast.error("Upload foto KTM terlebih dahulu.");
    if (!barangFile) return toast.error("Upload foto barang terlebih dahulu.");
    
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("foto_ktm", ktmFile);
      fd.append("foto_barang", barangFile);
      fd.append("keterangan", keterangan);
      fd.append("laporan", laporanId);
      await klaimAPI.ajukan(laporanId, fd);
      toast.success("Klaim diajukan! Tunggu verifikasi penemu.");
      resetFormKlaim();
      const l = await barangAPI.getById(laporanId);
      setLaporan(l.data);
    } catch (err) {
      toast.error("Gagal mengajukan klaim.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifikasi = async (klaimId, aksi) => {
    try {
      await klaimAPI.verifikasi(klaimId, { aksi });
      toast.success(aksi === "approve" ? "Klaim disetujui!" : "Klaim ditolak.");
      const [l, k] = await Promise.all([
        barangAPI.getById(laporanId),
        klaimAPI.listKlaim(laporanId),
      ]);
      setLaporan(l.data);
      setKlaims(k.data.results ?? k.data);
    } catch {
      toast.error("Gagal memproses klaim.");
    }
  };

  const handleBukaChat = async (userId) => {
    try {
      const { data } = await chatAPI.bukaRuang({ user_id: userId, laporan_id: Number(laporanId) });
      navigate("/chat", { state: { ruangId: data.id } });
    } catch {
      toast.error("Gagal membuka chat.");
    }
  };

  if (loading) return <LoadingPage />;
  if (!laporan) return <div className="text-center py-20 text-slate-400">Laporan tidak ditemukan.</div>;

  const fotos = laporan.fotos ?? [];
  const klaimSaya = laporan.klaim_saya;

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Tombol Kembali */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#003366] font-black hover:gap-4 transition-all mb-8 bg-white py-3 px-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <ChevronLeft size={20} /> KEMBALI
        </motion.button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Kiri: Gallery Section */}
            <div className="p-6 lg:p-10 bg-slate-50/50">
              <div className="aspect-square bg-white rounded-[2rem] overflow-hidden mb-6 relative shadow-inner border border-slate-100 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {fotos.length > 0 ? (
                    <motion.img
                      key={activeImg}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={fotos[activeImg]?.foto_url}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center gap-2">
                      <ImageIcon size={64} strokeWidth={1} />
                      <span className="font-medium text-sm">Tidak ada foto barang</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {fotos.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {fotos.map((f, i) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveImg(i)}
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        i === activeImg ? "border-[#ffcc00] ring-4 ring-[#ffcc00]/20" : "border-transparent opacity-50"
                      }`}
                    >
                      <img src={f.foto_url} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Kanan: Content Section */}
            <div className="p-6 lg:p-10 lg:border-l border-slate-100">
              <div className="flex gap-2 mb-6">
                <BadgeJenis jenis={laporan.jenis} />
                <BadgeStatus status={laporan.status} />
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-[#003366] mb-4 leading-tight">
                {laporan.judul}
              </h1>

              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                {laporan.deskripsi}
              </p>

              <div className="grid grid-cols-1 gap-4 mb-10">
                <div className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Lokasi Temuan</p>
                    <p className="text-[#003366] font-bold">{laporan.lokasi}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tanggal</p>
                    <p className="text-[#003366] font-bold">
                      {format(new Date(laporan.tanggal_kejadian), "d MMMM yyyy", { locale: id })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Dilaporkan Oleh</p>
                    <p className="text-[#003366] font-bold">{laporan.pelapor?.nama_lengkap}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {laporan.kontak_wa && (
                  <a
                    href={`https://wa.me/${laporan.kontak_wa}`}
                    target="_blank"
                    className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white font-black py-4 rounded-2xl hover:shadow-lg hover:shadow-green-500/20 transition-all"
                  >
                    <Phone size={22} /> HUBUNGI VIA WHATSAPP
                  </a>
                )}

                {isAuthenticated && !isOwner && (
                  <button
                    onClick={() => handleBukaChat(laporan.pelapor?.id)}
                    className="flex items-center justify-center gap-3 w-full bg-[#003366] text-white font-black py-4 rounded-2xl hover:bg-[#002d5a] transition-all"
                  >
                    <MessageCircle size={22} /> DIRECT MESSAGE
                  </button>
                )}

                {/* Klaim Section */}
                {isAuthenticated && !isOwner && laporan.status === "aktif" && (
                  <div className="pt-4">
                    {klaimSaya ? (
                      <div className="bg-slate-100 text-[#003366] p-4 rounded-2xl text-center font-bold border border-slate-200">
                        Status Klaim: {klaimSaya.status.toUpperCase()}
                      </div>
                    ) : !klaimMode ? (
                      <button
                        onClick={() => setKlaimMode(true)}
                        className="w-full border-2 border-[#ffcc00] text-[#003366] font-black py-4 rounded-2xl hover:bg-[#ffcc00] transition-all"
                      >
                        AJUKAN KLAIM BARANG
                      </button>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-yellow-50 rounded-3xl border border-yellow-200 space-y-4">
                        <div className="flex items-center gap-2 text-[#003366] font-black mb-2">
                          <ShieldCheck className="text-[#ffcc00]" /> VERIFIKASI KEPEMILIKAN
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                           <label className="cursor-pointer bg-white p-4 rounded-xl border border-dashed border-yellow-400 flex flex-col items-center gap-2">
                              <Upload size={20} className="text-yellow-600"/>
                              <span className="text-[10px] font-bold text-slate-500 text-center">FOTO KTM</span>
                              <input type="file" className="hidden" onChange={(e) => {
                                setKtmFile(e.target.files[0]);
                                setKtmPrev(URL.createObjectURL(e.target.files[0]));
                              }} />
                           </label>
                           <label className="cursor-pointer bg-white p-4 rounded-xl border border-dashed border-yellow-400 flex flex-col items-center gap-2">
                              <Upload size={20} className="text-yellow-600"/>
                              <span className="text-[10px] font-bold text-slate-500 text-center">FOTO BARANG</span>
                              <input type="file" className="hidden" onChange={(e) => {
                                setBarangFile(e.target.files[0]);
                                setBarangPrev(URL.createObjectURL(e.target.files[0]));
                              }} />
                           </label>
                        </div>

                        <textarea
                          placeholder="Jelaskan ciri khusus barang ini..."
                          className="w-full p-4 rounded-xl border border-yellow-200 focus:ring-2 focus:ring-[#ffcc00] outline-none text-sm"
                          rows={2}
                          value={keterangan}
                          onChange={(e) => setKeterangan(e.target.value)}
                        />

                        <div className="flex gap-2">
                          <button onClick={handleKlaimSubmit} disabled={submitting} className="flex-1 bg-[#ffcc00] text-[#003366] font-black py-3 rounded-xl shadow-md">
                            KIRIM
                          </button>
                          <button onClick={resetFormKlaim} className="px-4 bg-white text-slate-400 font-bold py-3 rounded-xl">
                            BATAL
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Klaim (Hanya Owner) */}
        {isOwner && klaims.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-black text-[#003366] mb-6 flex items-center gap-3">
              <ShieldCheck className="text-[#ffcc00]" size={28} /> PENGAJUAN KLAIM ({klaims.length})
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {klaims.map((k) => (
                <div key={k.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="flex gap-2">
                    <img src={k.foto_ktm_url} className="w-32 h-20 object-cover rounded-xl border" title="KTM Pengklaim" />
                    <img src={k.foto_barang_url} className="w-32 h-20 object-cover rounded-xl border" title="Bukti Barang" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[#003366]">{k.pengklaim?.nama_lengkap}</p>
                    <p className="text-sm text-slate-500 italic mt-1">"{k.keterangan}"</p>
                  </div>
                  {k.status === "menunggu" && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleVerifikasi(k.id, "approve")} className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
                        <CheckCircle size={20} />
                      </button>
                      <button onClick={() => handleVerifikasi(k.id, "reject")} className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors">
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}