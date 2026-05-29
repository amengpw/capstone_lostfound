// ── ProfilPage (UMS Edition) ───────────────────────────────────────────────
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Save,
  Camera,
  LogOut,
  Mail,
  CreditCard,
  Smartphone,
  Lock,
  Loader2,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { authAPI } from "@/services/api";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ROLE_LABEL = {
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
  staf: "Staf Kampus",
  security: "Petugas Keamanan",
  admin: "Administrator",
};

export default function ProfilPage() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nama_lengkap: user?.nama_lengkap ?? "",
      nim_nik: user?.nim_nik ?? "",
      no_hp: user?.no_hp ?? "",
    },
  });

  const handleFoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFotoFile(f);
    setFotoPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("nama_lengkap", data.nama_lengkap);
      if (data.nim_nik) fd.append("nim_nik", data.nim_nik);
      if (data.no_hp) fd.append("no_hp", data.no_hp);
      if (fotoFile) fd.append("foto_profil", fotoFile);

      const { data: updated } = await authAPI.updateProfile(fd);
      setUser(updated);
      toast.success("Profil berhasil diperbarui.");
    } catch (err) {
      toast.error("Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil logout.");
    navigate("/login");
  };

  const avatarSrc = fotoPreview ?? user?.foto_profil ?? null;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto px-4 sm:px-6"
      >
        {/* Header Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">
            Pengaturan <span className="text-[#ffcc00]">Profil</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
            Identitas Digital Civitas UMS
          </p>
        </div>

        {/* Profile Card & Avatar */}
        <div className="relative mb-8 text-center bg-white pt-12 pb-8 px-6 rounded-[3rem] shadow-xl shadow-blue-900/5 border border-slate-50">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-500">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={56} className="text-slate-300" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-[#ffcc00] hover:bg-[#e6b800] text-[#003366] w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg border-4 border-white transition-transform hover:scale-110">
                <Camera size={18} strokeWidth={2.5} />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFoto}
                />
              </label>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-black text-[#003366]">
              {user?.nama_lengkap || "Civitas UMS"}
            </h2>
            <div className="inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 bg-[#003366]/5 text-[#003366] rounded-full text-[10px] font-black uppercase tracking-wider border border-[#003366]/10">
              <ShieldCheck size={14} className="text-[#ffcc00]" />
              {ROLE_LABEL[user?.role] ?? user?.role}
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-blue-900/5 border border-slate-50 mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Section (Disabled) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                <Mail size={14} className="text-[#ffcc00]" /> Email Institusi
              </label>
              <div className="relative">
                <input
                  className="w-full bg-slate-50 border-2 border-slate-100 text-slate-400 rounded-2xl px-5 py-4 cursor-not-allowed font-bold text-sm"
                  value={user?.email ?? ""}
                  disabled
                />
                <Lock
                  size={16}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300"
                />
              </div>
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-2">
                <BadgeCheck size={14} className="text-[#ffcc00]" /> Nama Lengkap
              </label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 text-[#003366] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#003366] transition-all font-bold"
                {...register("nama_lengkap", { required: "Nama wajib diisi" })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* NIM / NIK */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-2">
                  <CreditCard size={14} className="text-[#ffcc00]" /> NIM / NIK
                </label>
                <input
                  className="w-full bg-slate-50 border-2 border-slate-100 text-[#003366] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#003366] transition-all font-bold uppercase"
                  {...register("nim_nik")}
                />
              </div>

              {/* No HP */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-2">
                  <Smartphone size={14} className="text-[#ffcc00]" /> WhatsApp
                </label>
                <input
                  className="w-full bg-slate-50 border-2 border-slate-100 text-[#003366] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#003366] transition-all font-bold"
                  placeholder="08..."
                  {...register("no_hp")}
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003366] hover:bg-[#002244] disabled:bg-slate-200 text-[#ffcc00] font-black py-4.5 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 transition-all uppercase tracking-widest text-sm mt-4 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save size={20} /> Simpan Perubahan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className="w-full group bg-white hover:bg-rose-50 text-rose-500 font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-3 border-2 border-rose-50 transition-all uppercase tracking-widest text-xs shadow-sm active:scale-95"
        >
          <LogOut
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Keluar dari Sesi
        </button>
      </motion.div>
    </div>
  );
}
