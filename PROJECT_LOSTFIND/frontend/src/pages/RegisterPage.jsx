// ── Register Page (Formal Version) ──────────────────────────────────────────
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  CreditCard,
  Smartphone,
  Briefcase,
  Key,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// 💥 PERBAIKAN DI SINI: Mengubah @/ menjadi ../ agar terbaca sempurna 💥
import useAuthStore from "../store/authStore.js";

const ROLES = [
  { value: "mahasiswa", label: "MAHASISWA" },
  { value: "dosen", label: "DOSEN" },
  { value: "staf", label: "STAF KAMPUS" },
  { value: "security", label: "PETUGAS KEAMANAN" },
];

export default function RegisterPage() {
  const { register: reg } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: "mahasiswa" } });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await reg(data);
      toast.success("Registrasi Berhasil!");
      navigate("/");
    } catch (err) {
      toast.error("Gagal mendaftar, silakan cek data Anda kembali.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 py-16 relative overflow-hidden font-sans">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#003366]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ffcc00]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-[#003366] text-[#ffcc00] rounded-2xl mb-6 shadow-xl shadow-blue-900/20 border-2 border-white"
          >
            <UserPlus size={40} strokeWidth={2} />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-[#003366] tracking-tight uppercase">
            Buat <span className="text-[#ffcc00]">Akun Baru</span>
          </h1>
          <p className="text-slate-500 font-semibold text-sm mt-2 tracking-wide uppercase">
            Gabung ke Sistem Lost & Found UMS
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Nama Lengkap */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                  <User size={14} className="text-[#003366]" /> Nama Lengkap
                </label>
                <input
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 focus:outline-none transition-all font-bold text-slate-700
                    ${errors.nama_lengkap ? "border-rose-300 focus:border-rose-500" : "border-slate-50 focus:border-[#003366]"}`}
                  placeholder="Nama Lengkap Sesuai KTM"
                  {...register("nama_lengkap", {
                    required: "Nama wajib diisi",
                  })}
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                  <Mail size={14} className="text-[#003366]" /> Email Civitas
                </label>
                <input
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 focus:outline-none transition-all font-bold text-slate-700
                    ${errors.email ? "border-rose-300 focus:border-rose-500" : "border-slate-50 focus:border-[#003366]"}`}
                  type="email"
                  placeholder="nim@student.ums.ac.id"
                  {...register("email", { required: "Email wajib diisi" })}
                />
              </div>

              {/* NIM / NIK */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                  <CreditCard size={14} className="text-[#003366]" /> NIM / NIK
                </label>
                <input
                  className="w-full bg-slate-50 border-2 border-slate-50 focus:border-[#003366] rounded-2xl px-5 py-4 focus:outline-none transition-all font-bold text-slate-700 uppercase"
                  placeholder="L200..."
                  {...register("nim_nik")}
                />
              </div>

              {/* No WhatsApp */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                  <Smartphone size={14} className="text-[#003366]" /> No.
                  WhatsApp
                </label>
                <input
                  className="w-full bg-slate-50 border-2 border-slate-50 focus:border-[#003366] rounded-2xl px-5 py-4 focus:outline-none transition-all font-bold text-slate-700"
                  placeholder="08..."
                  {...register("no_hp")}
                />
              </div>

              {/* Peran */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                  <Briefcase size={14} className="text-[#003366]" /> Peran
                  Civitas
                </label>
                <div className="relative group">
                  <select
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-[#003366] rounded-2xl px-5 py-4 focus:outline-none transition-all font-black text-[#003366] appearance-none cursor-pointer"
                    {...register("role")}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ShieldCheck
                    size={20}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#ffcc00] pointer-events-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                  <Key size={14} className="text-[#003366]" /> Password
                </label>
                <div className="relative">
                  <input
                    className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 focus:outline-none transition-all font-bold text-slate-700
                      ${errors.password ? "border-rose-300 focus:border-rose-500" : "border-slate-50 focus:border-[#003366]"}`}
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 Karakter"
                    {...register("password", { required: true, minLength: 8 })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#003366]"
                  >
                    {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                  <Key size={14} className="text-[#003366]" /> Konfirmasi
                </label>
                <div className="relative">
                  <input
                    className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 focus:outline-none transition-all font-bold text-slate-700
                      ${errors.password2 ? "border-rose-300 focus:border-rose-500" : "border-slate-50 focus:border-[#003366]"}`}
                    type={showPw2 ? "text" : "password"}
                    placeholder="Ulangi Password"
                    {...register("password2", {
                      required: true,
                      validate: (v) => v === watch("password"),
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2(!showPw2)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#003366]"
                  >
                    {showPw2 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Tombol Register */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#003366] hover:bg-[#002244] text-[#ffcc00] font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] uppercase tracking-[0.15em] text-sm"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin text-[#ffcc00]" />
              ) : (
                <>
                  Daftar Sekarang <ChevronRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="text-[#003366] hover:text-[#ffcc00] transition-colors ml-1 underline decoration-2 decoration-[#ffcc00]"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
