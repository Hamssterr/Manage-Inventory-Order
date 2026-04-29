import type {
  BaseDetailResponse,
  BaseListResponse,
  BaseResponse,
} from "./pagination";

export interface OrderParams {
  page?: number;
  limit?: number;
  search?: string;
  routeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface IOrderSaleRep {
  _id: string;
  displayName: string;
}

export interface IOrderRoute {
  _id: string;
  routeName: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "completed";

export interface IOrderItem {
  _id?: string;
  productId: string;
  skuSnapshot: string;
  productNameSnapshot: string;
  unitNameSnapshot: string;
  exchangeValueSnapshot: number;
  quantity: number;
  priceUnit: number;
  taxAmountSnapshot?: number;
  subTotal: number;
  isGift: boolean;
  deliveredQuantity?: number;
}

export interface IOrder {
  _id: string;
  orderCode: string;

  customerId?: string;
  routeId?: string | IOrderRoute;

  saleId: IOrderSaleRep | string;

  customerNameSnapshot: string;
  customerPhoneSnapshot: string;
  deliveryAddressSnapshot: string;
  customerTaxCodeSnapshot?: string;

  items: IOrderItem[];
  totalAmount: number;
  totalTaxAmount?: number;
  status: OrderStatus;

  note?: string;
  exportTicketId?: string;

  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type GetAllOrdersResponse = BaseListResponse<IOrder>;
export type GetOrderDetailResponse = BaseDetailResponse<IOrder>;

export interface ICreateOrderItemRequest {
  productId: string;
  unitName: string;
  quantity: number;
  note?: string;
}

//Create Order for customer
export interface CreateOrderRequest {
  customerId: string;
  saleId: string;
  note?: string;
  items: ICreateOrderItemRequest[];
}

export type CreateOrderResponse = BaseDetailResponse<IOrder>;

// Create Order for guest
export interface ICreateGuestOrderRequest {
  guestName: string;
  guestPhone: string;
  guestAddress: string;
  guestTaxCode?: string;
  items: ICreateOrderItemRequest[];
  note?: string;
}

export type CreateGuestOrderResponse = BaseDetailResponse<IOrder>;

// Update Order
export interface IUpdateOrderRequest {
  customerId: string;
  saleId: string;
  note?: string;
  items: ICreateOrderItemRequest[];
}

export type UpdateOrderResponse = BaseDetailResponse<IOrder>;

export type DeleteOrderReponse = BaseResponse;

// Confirm Order Pending to Confirmed
export interface IConfirmedOrderRequest {
  orderIds: string[];
}

export interface IOrderErrorDetail {
  orderCode: string;
  currentStatus: OrderStatus;
}

export interface ConfirmedOrderResponse extends BaseResponse {
  errors?: IOrderErrorDetail[];
}

// Cancel order không bao gồm status sau: shipping, delivered, completed và cancelled
export interface ICancelOrderRequest {
  orderIds: string[];
  cancelNote?: string;
}

export interface ICancelOrderErrorDetail {
  orderCode: string;
  currentStatus: OrderStatus;
}

export interface CancelOrderResponse extends BaseResponse {
  errors?: ICancelOrderErrorDetail[];
}

// Confirm đơn hàng ở trạng thái shipping thành delivered

export interface IReconcileSingleOrderRequest {
  items?: ICreateOrderItemRequest[];
  note?: string;
}

export interface ICancelDeliveryOrderRequest {
  cancelNote?: string;
}

export interface IBulkReconcileOrderRequest {
  orderIds: string[];
}

export type RollbackOrderDeliveryResponse = BaseResponse;
