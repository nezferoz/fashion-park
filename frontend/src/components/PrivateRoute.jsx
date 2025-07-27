import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Ambil user dari localStorage
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

const roleToDashboard = {
  admin: "/dashboard/admin",
  kasir: "/dashboard/kasir",
  pemilik: "/dashboard/pemilik",
  pelanggan: "/dashboard/pelanggan",
};

const PrivateRoute = ({ children, role, redirectToRoleDashboard }) => {
  const location = useLocation();
  const user = getUser();

  if (!user) {
    // Belum login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (redirectToRoleDashboard) {
    // Redirect ke dashboard sesuai role user
    return <Navigate to={roleToDashboard[user.role] || "/"} replace />;
  }

  if (role && user.role !== role) {
    // Role tidak sesuai, redirect ke dashboard sesuai role user
    return <Navigate to={roleToDashboard[user.role] || "/"} replace />;
  }

  return children;
};

export default PrivateRoute; 