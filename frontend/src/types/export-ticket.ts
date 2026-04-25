import type {
  BaseDetailResponse,
  BaseListResponse,
  BaseResponse,
} from "./pagination";

export interface ExportTicketParams {
  page?: number;
  limit?: number;
  search?: string;
  routeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface IRouteMini {
  _id: string;
  routeName: string;
}

export interface IExportTicketItem {
  _id: string;
  productId: string;
  productName: string;
  sku: string;
  unitName: string;
  totalQuantity: number;
  baseQuantityToExport: number;
  displayQuantity: string;
}

export type ExportTicketStatus = "draft" | "exported" | "completed" | string;

export interface IUserMini {
  _id: string;
  displayName: string;
}

export interface IExportTicket {
  _id: string;
  ticketCode: string;
  routeId: IRouteMini | string;
  orderIds: string[];
  aggregatedItems: IExportTicketItem[];
  status: ExportTicketStatus;
  createdBy: IUserMini | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type GetAllExportTicketResponse = BaseListResponse<IExportTicket>;

export type CreateExportTicketRequest = Pick<IExportTicket, "orderIds">;
export type CreateExportTicketResponse = BaseDetailResponse<IExportTicket>;

export interface ILoadSheetItem {
  _id: string;
  productId: string;
  sku: string;
  productName: string;
  unitName: string;
  totalQuantity: number;
  displayQuantity: string;
  isCombo: boolean;
  category: string;
  isInTicket: boolean;
}

export type GetExportTicketDetailResponse = BaseDetailResponse<{
  _id: string;
  ticketCode: string;
  routeName: string;
  loadSheetItems: ILoadSheetItem[];
}>;

export type DeleteExportTicketResponse = BaseResponse;
