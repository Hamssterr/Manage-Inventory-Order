import type {
  AuthMeResponse,
  SignInRequest,
  SignInResponse,
  SignOutResponse,
  SignUpRequest,
  SignUpResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UploadResponse,
} from "@/types/auth";
import http from "../base";
import {
  AuthMe,
  SignIn,
  SignOut,
  SignUp,
  UpdateProfile,
  ChangePassword,
  Upload,
  
} from "@/constants/api-endpoints";

export const signUpFunction = (data: SignUpRequest) => {
  return http.post<SignUpResponse>(SignUp, data);
};

export const signInFunction = (data: SignInRequest) => {
  return http.post<SignInResponse>(SignIn, data);
};

export const signOutFunction = () => {
  return http.post<SignOutResponse>(SignOut);
};

export const authMeFunction = () => {
  return http.get<AuthMeResponse>(AuthMe);
};

export const updateProfileFunction = (id: string, data: UpdateProfileRequest) => {
  return http.patch<UpdateProfileResponse>(`${UpdateProfile}${id}`, data);
};

export const uploadFunction = (data: FormData) => {
  return http.post<UploadResponse>(Upload, data);
};

export const changePasswordFunction = (data: ChangePasswordRequest) => {
  return http.patch<ChangePasswordResponse>(ChangePassword, data);
};
