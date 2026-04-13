import type { User } from "./user";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (token: string | null, user?: User | null) => void;
  logout: () => void;
}

export interface SignUpRequest {
  phoneNumber: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SignUpResponse {
  message: string;
  user: {
    _id: string;
    phoneNumber: string;
    displayName: string;
    email: string;
  };
}

export interface SignInRequest {
  phoneNumber: string;
  password: string;
}

export interface SignInResponse {
  message: string;
  accessToken: string;
}

export interface SignOutResponse {
  message: string;
}

export interface refreshTokenResponse {
  message: string;
  accessToken: string;
}

export interface AuthMeResponse {
  message: string;
  data: User;
}
