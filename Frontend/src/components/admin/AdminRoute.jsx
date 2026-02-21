import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../auth/useAuth";   

export default function AdminRoute() {
  const { user, booting } = useAuth();
  const loc = useLocation();

  if (booting) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-slate-600">
        Loading...
      </div>
    );
  }

  if (!user)
    return <Navigate to="/signin" replace state={{ from: loc.pathname }} />;

  if (user?.role !== "admin")
    return <Navigate to="/" replace />;

  return <Outlet />;
}