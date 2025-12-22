// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  if (!localStorage.getItem("token")) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
}
