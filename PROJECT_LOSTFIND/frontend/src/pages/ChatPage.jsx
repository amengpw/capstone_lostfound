// ── Chat Page (UMS Theme Version - Updated with Instagram Style Unread) ──
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Send,
  MessageCircle,
  User,
  WifiOff,
  Loader2,
  ChevronRight,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatAPI, bukaWsChat } from "@/services/api";
import { Spinner } from "@/components/ui";
import useAuthStore from "@/store/authStore";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { user } = useAuthStore();
  const location = useLocation();

  const [ruangs, setRuangs] = useState([]);
  const [activeRuang, setActiveRuang] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [loadingRuang, setLoadingRuang] = useState(true);
  const [wsStatus, setWsStatus] = useState("idle");

  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  const fetchRuangs = useCallback(() => {
    chatAPI
      .daftarRuang()
      .then(({ data }) => setRuangs(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoadingRuang(false));
  }, []);

  const markRuangAsRead = useCallback((ruangId) => {
    setRuangs((prev) =>
      prev.map((r) =>
        r.id === ruangId ? { ...r, jumlah_belum_dibaca: 0 } : r,
      ),
    );
  }, []);

  useEffect(() => {
    fetchRuangs();
  }, [fetchRuangs]);

  useEffect(() => {
    if (location.state?.ruangId) {
      bukaRuangChat(location.state.ruangId);
    }
  }, [location.state]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const bukaRuangChat = (ruangId) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setMessages([]);
    setActiveRuang(ruangId);
    markRuangAsRead(ruangId);
    setWsStatus("connecting");

    const ws = bukaWsChat(ruangId);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("open");
      ws.send(JSON.stringify({ type: "baca" }));
      markRuangAsRead(ruangId);
      fetchRuangs();
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "riwayat") {
        setMessages(data.pesan);
      } else if (data.type === "pesan_baru") {
        setMessages((prev) => [...prev, data.pesan]);
        fetchRuangs();
      } else if (data.type === "error") {
        toast.error(data.message);
      }
    };

    ws.onclose = (e) => {
      setWsStatus("closed");
      if (e.code !== 4001 && e.code !== 4003 && e.code !== 1000) {
        setTimeout(() => bukaRuangChat(ruangId), 3000);
      }
    };
    ws.onerror = () => setWsStatus("closed");
  };

  const kirimPesan = () => {
    const isi = inputMsg.trim();
    if (!isi || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
      return;
    wsRef.current.send(JSON.stringify({ type: "pesan", isi }));
    setInputMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      kirimPesan();
    }
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close(1000);
    };
  }, []);

  const detailRuangAktif = ruangs.find((r) => r.id === activeRuang);
  const nameLawan =
    detailRuangAktif?.peserta
      ?.filter((p) => p.id !== user?.id)
      ?.map((p) => p.nama_lengkap)
      ?.join(", ") ?? "Chat";

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="p-4 bg-[#003366] text-[#ffcc00] rounded-2xl shadow-xl shadow-blue-900/20 border-2 border-white">
            <Inbox size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#003366] tracking-tight uppercase">
              Pesan <span className="text-[#ffcc00]">Masuk</span>
            </h1>
          </div>
        </motion.div>

        {/* Main Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col md:flex-row h-[75vh] min-h-[650px] bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden"
        >
          {/* Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30">
            <div className="px-8 py-6 border-b border-slate-100 bg-white">
              <h2 className="font-black text-sm text-[#003366] uppercase tracking-[0.15em]">
                Percakapan
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {loadingRuang ? (
                <div className="h-full flex items-center justify-center">
                  <Spinner />
                </div>
              ) : ruangs.length === 0 ? (
                <div className="text-center p-8 mt-10">
                  <MessageCircle
                    size={40}
                    className="mx-auto text-slate-200 mb-4"
                  />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                    Belum ada <br /> percakapan
                  </p>
                </div>
              ) : (
                ruangs.map((r) => {
                  const isActive = activeRuang === r.id;
                  const lawan = r.peserta?.find((p) => p.id !== user?.id);
                  const isUnread = r.jumlah_belum_dibaca > 0;

                  return (
                    <button
                      key={r.id}
                      onClick={() => bukaRuangChat(r.id)}
                      className={`w-full text-left p-4 rounded-3xl transition-all duration-300 group
                        ${isActive ? "bg-[#003366] shadow-xl shadow-blue-900/30" : "hover:bg-white hover:shadow-lg hover:shadow-slate-200/50"}`}
                    >
                      <div className="flex gap-4 items-center">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-colors
                          ${isActive ? "bg-[#ffcc00] text-[#003366]" : "bg-slate-100 text-[#003366]"}`}
                        >
                          {lawan?.nama_lengkap.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3
                              className={`text-[13px] uppercase truncate transition-all
                                ${
                                  isActive
                                    ? "text-white font-black"
                                    : isUnread
                                      ? "text-[#003366] font-black" // BOLD jika belum dibaca
                                      : "text-[#003366]/80 font-medium" // NORMAL jika sudah dibaca
                                }`}
                            >
                              {lawan?.nama_lengkap}
                            </h3>

                            {/* Indikator Titik Biru ala IG */}
                            {!isActive && isUnread && (
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm ml-2 flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex justify-between items-center mt-1">
                            <p
                              className={`text-[11px] truncate pr-2 transition-all
                                ${
                                  isActive
                                    ? "text-[#ffcc00] font-bold"
                                    : isUnread
                                      ? "text-[#003366] font-black" // BOLD untuk pesan terakhir
                                      : "text-slate-400 font-medium"
                                }`}
                            >
                              {r.laporan_info?.judul || "Tanpa Judul"}
                            </p>

                            {/* Notif Bubble tetap ada */}
                            {isUnread && (
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg flex-shrink-0
                                ${isActive ? "bg-[#ffcc00] text-[#003366]" : "bg-rose-500 text-white"}`}
                              >
                                {r.jumlah_belum_dibaca}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-[#FDFDFF] relative">
            {!activeRuang ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                  <MessageCircle size={48} className="text-slate-200" />
                </div>
                <h3 className="text-[#003366] font-black uppercase tracking-widest text-sm">
                  Pilih Percakapan
                </h3>
                <p className="text-slate-400 text-xs font-bold mt-2">
                  Pilih salah satu teman bicara dari sisi kiri
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#003366]/5 rounded-2xl flex items-center justify-center text-[#003366]">
                      <User size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-black text-[#003366] uppercase text-sm tracking-wide">
                        {nameLawan}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Terhubung ke Ruang
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2
                    ${wsStatus === "open" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${wsStatus === "open" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                    />
                    {wsStatus === "open" ? "Online" : "Connecting"}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  <AnimatePresence>
                    {messages.map((msg) => {
                      const isSaya = msg.pengirim_id === user?.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: isSaya ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex ${isSaya ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] ${isSaya ? "items-end" : "items-start"} flex flex-col gap-2`}
                          >
                            <div
                              className={`px-6 py-4 text-sm font-bold leading-relaxed shadow-lg
                              ${
                                isSaya
                                  ? "bg-[#003366] text-white rounded-[2rem] rounded-tr-none shadow-blue-900/10"
                                  : "bg-white text-[#003366] border border-slate-100 rounded-[2rem] rounded-tl-none"
                              }`}
                            >
                              {msg.isi}
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter px-2">
                              {msg.created_at
                                ? format(new Date(msg.created_at), "HH:mm", {
                                    locale: id,
                                  })
                                : ""}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-slate-100">
                  <div className="flex gap-4 items-end max-w-5xl mx-auto">
                    <div className="relative flex-1">
                      <textarea
                        className="w-full bg-slate-50 border-2 border-slate-50 focus:border-[#003366] text-[#003366] font-bold rounded-3xl px-6 py-4 focus:outline-none resize-none transition-all placeholder:text-slate-300 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest shadow-inner"
                        placeholder="Ketik pesan anda di sini..."
                        rows={1}
                        style={{ minHeight: "60px", maxHeight: "150px" }}
                        value={inputMsg}
                        onChange={(e) => setInputMsg(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={wsStatus !== "open"}
                      />
                    </div>
                    <button
                      onClick={kirimPesan}
                      disabled={!inputMsg.trim() || wsStatus !== "open"}
                      className="bg-[#003366] hover:bg-[#002244] disabled:bg-slate-200 text-[#ffcc00] h-[60px] w-[60px] rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-xl shadow-blue-900/20 transition-all active:scale-90"
                    >
                      <Send size={22} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
