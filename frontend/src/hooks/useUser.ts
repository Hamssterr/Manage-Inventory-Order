import { useQuery } from "@tanstack/react-query";
import { getAllUsersFunction, getSalersFunction } from "@/services/apis/user";
import { QUERY_KEYS } from "@/constants/query-key";

export const useGetAllUsersQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: () => getAllUsersFunction().then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetSalersQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SALERS],
    queryFn: () => getSalersFunction().then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  });
};
