import type { AuthState } from "@/types/auth";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { queryClient } from "@/lib/queryClient";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,

      setAuth: (token, user) => {
        set((state) => ({
          accessToken: token,
          user: user !== undefined ? user : state.user,
        }));
      },

      logout: () => {
        set({ accessToken: null, user: null });
        queryClient.clear();
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Optional: Chỉ chọn lưu accessToken và user vào localStorage
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);
