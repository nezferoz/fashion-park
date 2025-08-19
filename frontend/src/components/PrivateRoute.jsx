import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const roleDashboardMap = {
  owner: "/pemilik/dashboard",
  pemilik: "/pemilik/dashboard",
  admin: "/admin/dashboard",
  kasir: "/kasir/transaksi",
  pelanggan: "/katalog"
};

const PrivateRoute = ({ children, role, redirectToRoleDashboard }) => {
  const { user, isLoading } = useAuth();

  console.log("🔒 PrivateRoute Debug:");
  console.log("- user:", user);
  console.log("- role prop:", role);
  console.log("- redirectToRoleDashboard:", redirectToRoleDashboard);
  console.log("- isLoading:", isLoading);
  console.log("- localStorage token:", localStorage.getItem('token'));
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log("⏳ PrivateRoute: Loading...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log("❌ PrivateRoute: No user, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  if (role) {
    // Mendukung multi-role, misal: role="pemilik,owner"
    const allowedRoles = role.split(',').map(r => r.trim().toLowerCase());
    let userRole = user.role?.toLowerCase();
    // Mapping owner <-> pemilik
    if (userRole === 'owner') userRole = 'pemilik';
    
    console.log("🔍 PrivateRoute: Role check:");
    console.log("- allowedRoles:", allowedRoles);
    console.log("- userRole:", userRole);
    console.log("- isAllowed:", allowedRoles.includes(userRole));
    
    if (!allowedRoles.includes(userRole)) {
      console.log("❌ PrivateRoute: Role not allowed, redirecting to login");
      return <Navigate to="/login" />;
    }
  }
  
  if (redirectToRoleDashboard) {
    const dashboardPath = roleDashboardMap[user.role?.toLowerCase()] || "/";
    console.log("🔄 PrivateRoute: Redirecting to dashboard:", dashboardPath);
    return <Navigate to={dashboardPath} />;
  }
  
  console.log("✅ PrivateRoute: Access granted, rendering children");
  return children || <Outlet />;
};

export default PrivateRoute; 