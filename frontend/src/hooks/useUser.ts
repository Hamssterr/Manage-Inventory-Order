import { useQuery } from "@tanstack/react-query";
import { getAllUsersFunction } from "@/services/apis/user";
import { getAllEmployee } from "@/services/apis/employee";
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
    queryFn: () => getAllEmployee({ limit: 100 }).then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  });
};
