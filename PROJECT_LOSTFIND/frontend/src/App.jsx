import React from "react";
import { Routes, Route } from "react-router-dom";
// 💥 TAMBAHKAN IMPORT INI:
import { Toaster } from "react-hot-toast";

import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LaporPage from "./pages/LaporPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BarangListPage from "./pages/BarangListPage.jsx";
import BarangDetailPage from "./pages/BarangDetailPage.jsx";
import NotifikasiPage from "./pages/NotifikasiPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ProfilPage from "./pages/ProfilPage.jsx";
import LaporanSayaPage from "./pages/LaporanSayaPage.jsx";

function App() {
  return (
    <>
      {/* 💥 TAMBAHKAN KOMPONEN TOASTER DI SINI AGAR NOTIFIKASI BISA MUNCUL DI SELURUH HALAMAN */}
      <Toaster position="top-center" />

      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Halaman Utama */}
          <Route index element={<HomePage />} />

          {/* Auth */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="barang" element={<BarangListPage />} />
          <Route path="barang/:id" element={<BarangDetailPage />} />
          <Route path="notifikasi" element={<NotifikasiPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="profil" element={<ProfilPage />} />
          <Route path="laporan-saya" element={<LaporanSayaPage />} />

          {/* Halaman Lapor (Dilindungi Satpam/ProtectedRoute) */}
          <Route
            path="lapor"
            element={
              <ProtectedRoute>
                <LaporPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback Route jika user mengetik URL asal */}
        <Route
          path="*"
          element={
            <div style={{ padding: "20px", textAlign: "center" }}>
              <h2>404 - Halaman Tidak Ditemukan</h2>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
