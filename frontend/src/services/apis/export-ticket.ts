import type {
  CreateExportTicketRequest,
  CreateExportTicketResponse,
  DeleteExportTicketResponse,
  ExportTicketParams,
  GetAllExportTicketResponse,
  GetExportTicketDetailResponse,
} from "@/types/export-ticket";
import http from "../base";
import { CreateExportTicket, ExportTicket } from "@/constants/api-endpoints";

export const getAllExportTicket = (params: ExportTicketParams) => {
  return http.get<GetAllExportTicketResponse>(ExportTicket, { params });
};

export const createExportTicket = (data?: CreateExportTicketRequest) => {
  return http.post<CreateExportTicketResponse>(CreateExportTicket, data);
};

export const getExportTicketDetail = (ticketId: string) => {
  return http.get<GetExportTicketDetailResponse>(`${ExportTicket}${ticketId}`);
};

export const deleteExportTicket = (ticketId: string) => {
  return http.delete<DeleteExportTicketResponse>(`${ExportTicket}${ticketId}`);
};
