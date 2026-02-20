import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "./useAuth";

export default function RequireAuth() {
  const { user, booting } = useAuth();
  const loc = useLocation();

  if (booting) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-slate-200">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}
