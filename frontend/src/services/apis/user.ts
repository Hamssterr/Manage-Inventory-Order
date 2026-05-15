import { GetAllUsers } from "@/constants/api-endpoints";
import http from "../base";

export const getAllUsersFunction = () => {
  return http.get<any>(GetAllUsers);
};
