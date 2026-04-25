import { QUERY_KEYS } from "@/constants/query-key";
import {
  createExportTicket,
  deleteExportTicket,
  getAllExportTicket,
  getExportTicketDetail,
} from "@/services/apis/export-ticket";
import type {
  CreateExportTicketRequest,
  CreateExportTicketResponse,
  ExportTicketParams,
  GetAllExportTicketResponse,
  GetExportTicketDetailResponse,
} from "@/types/export-ticket";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetAllExportTicket = (params: ExportTicketParams) => {
  return useQuery<GetAllExportTicketResponse>({
    queryKey: [QUERY_KEYS.EXPORT_TICKETS, params],
    queryFn: () => getAllExportTicket(params).then((res) => res.data),
  });
};

export const useCreateExportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation<
    CreateExportTicketResponse,
    any,
    CreateExportTicketRequest
  >({
    mutationFn: (data: CreateExportTicketRequest) =>
      createExportTicket(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.EXPORT_TICKETS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS],
      });
    },
    onError: (err: any) => {
      console.error(err?.response?.data?.message || "Tạo phiếu xuất thất bại");
    },
  });
};

export const useGetExportTicketDetail = (ticketId: string) => {
  return useQuery<GetExportTicketDetailResponse>({
    queryKey: [QUERY_KEYS.EXPORT_TICKETS, ticketId],
    queryFn: () => getExportTicketDetail(ticketId).then((res) => res.data),
    enabled: !!ticketId,
  });
};

export const useDeleteExportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) =>
      deleteExportTicket(ticketId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.EXPORT_TICKETS],
      });
    },
    onError: (err: any) => {
      console.error(err?.response?.data?.message || "Xóa phiếu xuất thất bại");
    },
  });
};
