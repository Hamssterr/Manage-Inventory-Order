import { RefreshToken, SignIn } from "@/constants/api-endpoints";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

// 1. Cấu hình chung
const config: AxiosRequestConfig = {
  baseURL: `${import.meta.env.VITE_API_URL}`, // Prefix URL của bạn
  timeout: 10000, // Timeout sau 10 giây nếu server không phản hồi
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
};

class Http {
  instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: FailedRequest[] = [];

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);

    this.instance.interceptors.request.use(
      async (config) => {
        // KHÔNG intercept chính request refresh token
        if (config.url?.includes(RefreshToken)) return config;

        let token = useAuthStore.getState().accessToken;

        if (token) {
          try {
            const { exp } = jwtDecode<{ exp: number }>(token);
            const currentTime = Math.floor(Date.now() / 1000);

            // Tăng lên 30s để bù đắp độ trễ mạng
            if (exp - currentTime < 30) {
              if (this.isRefreshing) {
                token = await new Promise((resolve, reject) => {
                  this.failedQueue.push({ resolve, reject });
                });
              } else {
                this.isRefreshing = true;
                try {
                  const res = await axios.post(
                    `${config.baseURL}/${RefreshToken}`,
                    {},
                    { withCredentials: true },
                  );
                  token = res.data.accessToken;
                  useAuthStore
                    .getState()
                    .setAuth(token, useAuthStore.getState().user);
                  this.processQueue(null, token);
                } catch (refreshError) {
                  this.processQueue(refreshError, null);
                  useAuthStore.getState().logout();
                  return Promise.reject(refreshError);
                } finally {
                  this.isRefreshing = false;
                }
              }
            }
          } catch (e) {
            console.error("JWT Decode Error", e);
          }
        }

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;
        const status = error.response?.status;

        // Nếu lỗi 401/403 và KHÔNG phải request refresh
        if (
          (status === 401 || status === 403) &&
          !originalRequest._retry &&
          !originalRequest.url?.includes(RefreshToken) &&
          !originalRequest.url?.includes(SignIn)
        ) {
          originalRequest._retry = true;

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.instance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          this.isRefreshing = true;
          try {
            const res = await axios.post(
              `${config.baseURL}/${RefreshToken}`,
              {},
              { withCredentials: true },
            );
            const token = res.data.accessToken;
            useAuthStore
              .getState()
              .setAuth(token, useAuthStore.getState().user);
            this.processQueue(null, token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        return Promise.reject(error);
      },
    );
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve(token);
    });
    this.failedQueue = [];
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.get<T>(url, config);
  }

  post<T>(url: string, data?: object, config?: AxiosRequestConfig) {
    return this.instance.post<T>(url, data, config);
  }

  put<T>(url: string, data?: object, config?: AxiosRequestConfig) {
    return this.instance.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete<T>(url, config);
  }

  patch<T>(url: string, data?: object, config?: AxiosRequestConfig) {
    return this.instance.patch<T>(url, data, config);
  }
}

// Export một instance duy nhất để dùng toàn app
const http = new Http(config);
export default http;
