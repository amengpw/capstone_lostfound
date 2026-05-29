import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore"; // Sesuaikan path jika folder store kamu berbeda

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Jika BELUM login, tendang paksa ke halaman login resmi
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Jika SUDAH login, ijinkan akses ke halaman laporan
  return children;
};

export default ProtectedRoute;
