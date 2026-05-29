import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  PlusCircle,
  Package,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Bell,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { notifAPI, authAPI } from "@/services/api";
import toast from "react-hot-toast";

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Ambil ulang profile user saat refresh halaman agar data tidak hilang
  useEffect(() => {
    if (isAuthenticated && !user) {
      authAPI
        .profile()
        .then(({ data }) => {
          useAuthStore.setState({ user: data });
        })
        .catch(() => {
          logout();
        });
    }
  }, [isAuthenticated, user, logout]);

  // Poll unread count tiap 30 detik
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotif = () =>
      notifAPI
        .unreadCount()
        .then(({ data }) => setUnread(data.unread_count))
        .catch(() => {});
    fetchNotif();
    const timer = setInterval(fetchNotif, 30000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil logout");
    navigate("/login");
  };

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  // ── FIX 1: Daftarkan rute utama ke dalam array agar navigasi desktop & mobile sinkron ──
  const navLinks = [
    { to: "/", label: "Beranda", icon: Home },
    { to: "/barang", label: "Barang", icon: Package },
    { to: "/notifikasi", label: "Notifikasi", icon: Bell },
    { to: "/chat", label: "Chat", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#ffcc00] selection:text-[#003366]">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-[#003366] rounded-lg group-hover:rotate-12 transition-transform">
              <Search size={18} className="text-[#ffcc00]" strokeWidth={3} />
            </div>
            <span className="font-black text-[#003366] text-xl tracking-tighter uppercase">
              Lost<span className="text-[#ffcc00]">Found</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                  ${
                    isActive(to)
                      ? "bg-[#003366] text-white shadow-lg shadow-blue-900/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#003366]"
                  }`}
              >
                {/* ── FIX 2: Tambahkan indikator badge unread khusus untuk icon Bell di desktop ── */}
                <div className="relative">
                  <Icon size={14} strokeWidth={isActive(to) ? 3 : 2} />
                  {label === "Notifikasi" && unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 w-2 h-2 rounded-full border border-white" />
                  )}
                </div>
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/lapor"
                  className="flex items-center gap-2 bg-[#ffcc00] hover:bg-[#e6b800] text-[#003366] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                  <PlusCircle size={16} strokeWidth={3} /> Lapor
                </Link>

                {/* Profile dropdown */}
                <div className="relative group ml-1">
                  <button className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#ffcc00]/50 transition-all">
                    <div className="w-8 h-8 bg-[#003366] rounded-xl flex items-center justify-center text-[#ffcc00] text-sm font-black shadow-inner">
                      {user?.nama_lengkap?.[0] ?? "U"}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">
                        User
                      </p>
                      <p className="text-xs font-bold text-[#003366] max-w-[80px] truncate leading-none">
                        {user?.nama_lengkap ?? "Loading..."}
                      </p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                    <Link
                      to="/laporan-saya"
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#003366] hover:bg-[#003366]/5 transition-colors uppercase tracking-wider"
                    >
                      <Package size={16} className="text-slate-400" /> Laporan
                      Saya
                    </Link>
                    <Link
                      to="/profil"
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#003366] hover:bg-[#003366]/5 transition-colors uppercase tracking-wider"
                    >
                      <User size={16} className="text-slate-400" /> Profil
                    </Link>
                    <div className="h-px bg-slate-50 my-2 mx-4" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-black text-rose-500 hover:bg-rose-50 w-full text-left uppercase tracking-wider"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-5 py-2 text-xs font-black text-[#003366] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="bg-[#003366] hover:bg-[#002244] text-[#ffcc00] px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-[#003366] bg-slate-50 rounded-lg"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-5 space-y-2 shadow-inner">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest
                  ${isActive(to) ? "bg-[#003366] text-[#ffcc00]" : "text-[#003366] bg-slate-50"}`}
              >
                <Icon size={18} />
                {label}
                {label === "Notifikasi" && unread > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <div className="h-px bg-slate-100 my-4" />
                <Link
                  to="/lapor"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-black text-[#003366] bg-[#ffcc00]/20 rounded-xl uppercase tracking-widest"
                >
                  <PlusCircle size={18} /> Buat Laporan
                </Link>
                <Link
                  to="/laporan-saya"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 uppercase tracking-widest"
                >
                  <Package size={18} /> Laporan Saya
                </Link>
                <Link
                  to="/profil"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 uppercase tracking-widest"
                >
                  <User size={18} /> Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-black text-rose-500 w-full uppercase tracking-widest"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-slate-100 my-4" />
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-black text-[#003366] uppercase tracking-widest text-center"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-black text-[#003366] bg-[#ffcc00] rounded-xl uppercase tracking-widest text-center shadow-sm"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-[#f8fafc]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
          Official Platform
        </p>
        <p className="text-xs font-bold text-[#003366]">
          © 2026 Lost<span className="text-[#ffcc00]">&</span>Found —
          Universitas Muhammadiyah Surakarta
        </p>
      </footer>
    </div>
  );
}
