import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "../ui/loading";

export const ProtectedRoute = () => {
  const { accessToken, user } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  if (accessToken && !user) {
    return <LoadingSpinner />;
  }
  return <Outlet />;
};
