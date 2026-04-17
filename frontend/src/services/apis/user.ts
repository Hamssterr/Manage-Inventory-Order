import { GetAllUsers, GetSalers } from "@/constants/api-endpoints";
import http from "../base";

export const getAllUsersFunction = () => {
  return http.get<any>(GetAllUsers);
};

export const getSalersFunction = () => {
  return http.get<any>(GetSalers);
};
