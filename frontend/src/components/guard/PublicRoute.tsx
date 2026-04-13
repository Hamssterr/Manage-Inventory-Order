import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

export const PublicRoute = () => {
  const { accessToken, user } = useAuthStore();

  if (accessToken && user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
