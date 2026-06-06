import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeftRight,
  ShieldCheck,
  ServerCog,
} from "lucide-react";

const errorData = {
  400: {
    title: "Permintaan tidak valid",
    description:
      "Data yang dikirim tidak sesuai. Silakan cek kembali dan kirim ulang.",
    action: "Periksa Kembali",
    icon: AlertTriangle,
  },
  401: {
    title: "Sesi berakhir",
    description: "Anda perlu login kembali untuk melanjutkan.",
    action: "Masuk Ulang",
    icon: ShieldCheck,
  },
  403: {
    title: "Akses ditolak",
    description: "Anda tidak memiliki izin untuk melihat halaman ini.",
    action: "Kembali ke Beranda",
    icon: ShieldCheck,
  },
  404: {
    title: "Halaman tidak ditemukan",
    description: "Halaman yang Anda cari tidak ada atau sudah dipindahkan.",
    action: "Kembali ke Beranda",
    icon: ArrowLeftRight,
  },
  500: {
    title: "Kesalahan server",
    description:
      "Terjadi masalah di server kami. Silakan coba lagi beberapa saat lagi.",
    action: "Muat Ulang",
    icon: ServerCog,
  },
};

export default function ErrorPage({ statusCode: statusProp }) {
  const params = useParams();
  const status = Number(statusProp || params.statusCode || 404);
  const info = errorData[status] || errorData[404];
  const Icon = info.icon;
  const isLoginRedirect = status === 401;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] p-8 md:p-12">
          <div className="flex flex-col justify-center gap-6">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-[#003366] px-4 py-3 text-[#ffcc00] shadow-inner shadow-[#003366]/20 w-max">
              <Icon size={24} />
              <span className="text-xs font-black uppercase tracking-[0.35em]">
                Error {status}
              </span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-[#003366] leading-tight">
                {info.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                {info.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Tombol biru murni tanpa diubah logikanya sama sekali */}
              <Link
                to={isLoginRedirect ? "/login" : "/"}
                className="inline-flex items-center justify-center rounded-3xl bg-[#003366] px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-[#ffcc00] shadow-lg shadow-[#003366]/15 transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {info.action}
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] bg-[#003366] p-8 text-white flex flex-col justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#94c7ff]">
                Lost & Found UMS
              </p>
              <h2 className="mt-8 text-3xl font-black leading-tight">
                Kami sedang memperbaiki. Tetap tenang ya.
              </h2>
              <p className="mt-5 text-slate-200 text-sm leading-relaxed">
                Silakan kembali lagi nanti, atau gunakan tombol untuk lanjut.
              </p>
            </div>
            <div className="mt-10 flex items-center gap-4 text-sm text-slate-200">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#ffcc00]/15 text-[#ffcc00]">
                <AlertTriangle size={28} />
              </div>
              <div>
                <p className="font-black uppercase tracking-[0.25em] text-[#ffcc00]">
                  Tips
                </p>
                <p className="mt-2 leading-relaxed text-slate-200/90">
                  Pastikan URL benar, atau kembali ke beranda untuk melanjutkan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
