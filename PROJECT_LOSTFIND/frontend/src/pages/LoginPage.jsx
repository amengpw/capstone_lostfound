// ── Login Page (Formal UMS Version) ─────────────────────────────────────────────
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Mail,
  Key,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// 💥 INI YANG DIPERBAIKI: Mengubah @/ menjadi ../ 💥
import useAuthStore from "../store/authStore.js";

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Memecah objek data menjadi dua parameter (email dan password)
      // agar sesuai dengan ekspektasi fungsi login di authStore.js
      await login(data.email, data.password);

      toast.success("Selamat Datang Kembali!");
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Login gagal, cek kembali akun Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dekorasi Background Lembut */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#003366]" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#003366]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-[#003366] text-[#ffcc00] rounded-2xl mb-6 shadow-xl shadow-blue-900/20 border-2 border-white"
          >
            <ShieldCheck size={40} strokeWidth={2} />
          </motion.div>

          <h1 className="text-3xl font-extrabold text-[#003366] tracking-tight uppercase">
            Masuk <span className="text-[#ffcc00]">Portal</span>
          </h1>
          <p className="text-slate-500 font-semibold text-sm mt-2 tracking-wide uppercase">
            Sistem Informasi Barang Hilang UMS
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                <Mail size={14} className="text-[#003366]" /> Email
              </label>
              <input
                className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 focus:outline-none transition-all font-bold text-slate-700
                  ${errors.email ? "border-rose-300 focus:border-rose-500" : "border-slate-50 focus:border-[#003366]"}`}
                type="email"
                placeholder="nama@ums.ac.id"
                {...register("email", { required: "Email wajib diisi" })}
              />
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Key size={14} className="text-[#003366]" /> Kata Sandi
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-bold text-[#003366] hover:underline uppercase"
                >
                  Lupa?
                </Link>
              </div>
              <div className="relative">
                <input
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 focus:outline-none transition-all font-bold text-slate-700
                    ${errors.password ? "border-rose-300 focus:border-rose-500" : "border-slate-50 focus:border-[#003366]"}`}
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password wajib diisi",
                  })}
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

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003366] hover:bg-[#002244] text-[#ffcc00] font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] uppercase tracking-[0.15em] text-sm"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin text-[#ffcc00]" />
              ) : (
                <>
                  Masuk Sekarang <ChevronRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Belum terdaftar?{" "}
              <Link
                to="/register"
                className="text-[#003366] hover:text-[#ffcc00] transition-colors ml-1 underline decoration-2 decoration-[#ffcc00]"
              >
                Buat Akun Baru
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
