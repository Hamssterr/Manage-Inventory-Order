import { QUERY_KEYS } from "@/constants/query-key";
import {
  authMeFunction,
  signInFunction,
  signUpFunction,
} from "@/services/apis/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import type { SignInRequest, SignUpRequest } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ApiError {
  message: string;
}

export const useSignUpMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SignUpRequest) => signUpFunction(data),
    onSuccess: () => {
      toast.success("Đăng ký thành công");
      navigate("/");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || "Đăng ký không thành công";
      toast.error(message);
    },
  });
};

export const useSignInMutation = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignInRequest) => signInFunction(data),
    onSuccess: async (response) => {
      const { accessToken } = response.data;

      setAuth(accessToken);

      try {
        const userDataResponse = await queryClient.fetchQuery({
          queryKey: [QUERY_KEYS.AUTHME],
          queryFn: authMeFunction,
        });

        const userData = userDataResponse.data.data;
        setAuth(accessToken, userData);

        toast.success("Đăng nhập thành công!");
        navigate("/");
      } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);
        toast.error(
          "Đăng nhập thành công nhưng không lấy được thông tin cá nhân.",
        );
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(message);
    },
  });
};
