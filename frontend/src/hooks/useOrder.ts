import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/query-key";
import {
  createGuestOrder,
  createOrder,
  getAllOrder,
  getDetailOrder,
} from "@/services/apis/order";
import type {
  CreateGuestOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetAllOrdersResponse,
  GetOrderDetailResponse,
  ICreateGuestOrderRequest,
  OrderParams,
} from "@/types/order";

export const useGetAllOrdersQuery = (params: OrderParams) => {
  return useQuery<GetAllOrdersResponse>({
    queryKey: [QUERY_KEYS.ORDERS, params],
    queryFn: () => getAllOrder(params).then((res) => res.data),
  });
};

export const useGetOrderDetailQuery = (orderId: string) => {
  return useQuery<GetOrderDetailResponse>({
    queryKey: [QUERY_KEYS.ORDERS, orderId],
    queryFn: () => getDetailOrder(orderId).then((res) => res.data),
    enabled: !!orderId,
  });
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateOrderResponse, any, CreateOrderRequest>({
    mutationFn: (data: CreateOrderRequest) => createOrder(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      toast.success("Tạo đơn hàng thành công");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Tạo đơn hàng thất bại");
    },
  });
};

export const useCreateGuestOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateGuestOrderResponse, any, ICreateGuestOrderRequest>({
    mutationFn: (data: ICreateGuestOrderRequest) => createGuestOrder(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      toast.success("Tạo đơn hàng vãng lai thành công");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Tạo đơn hàng thất bại");
    },
  });
};
