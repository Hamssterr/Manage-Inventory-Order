import { QUERY_KEYS } from "@/constants/query-key";
import { getInventoryProduct } from "@/services/apis/inventory";
import type { InventoryParams } from "@/types/inventory";
import { useQuery } from "@tanstack/react-query";

export const useGetInventoryProducts = (params?: InventoryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY_PRODUCTS, params],
    queryFn: () => getInventoryProduct(params).then((res) => res.data),
  });
};
