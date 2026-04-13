import type {
  AuthMeResponse,
  SignInRequest,
  SignInResponse,
  SignOutResponse,
  SignUpRequest,
  SignUpResponse,
} from "@/types/auth";
import http from "../base";
import { AuthMe, SignIn, SignOut, SignUp } from "@/constants/api-endpoints";

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
