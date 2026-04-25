import type {
  CancelOrderResponse,
  ConfirmedOrderResponse,
  CreateGuestOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  DeleteOrderReponse,
  GetAllOrdersResponse,
  GetOrderDetailResponse,
  ICancelOrderRequest,
  IConfirmedOrderRequest,
  ICreateGuestOrderRequest,
  IUpdateOrderRequest,
  OrderParams,
  UpdateOrderResponse,
  IBulkReconcileOrderRequest,
  IReconcileSingleOrderRequest,
  ICancelDeliveryOrderRequest,
  RollbackOrderDeliveryResponse,
} from "@/types/order";
import http from "../base";
import {
  CancelOrder,
  ConfirmedOrder,
  CreateGuestOrder,
  CreateOrder,
  DeleteOrder,
  GetAllOrder,
  GetDetailOrder,
  UpdateOrder,
  BulkReconcileOrder,
} from "@/constants/api-endpoints";

export const getAllOrder = (params?: OrderParams) => {
  return http.get<GetAllOrdersResponse>(GetAllOrder, { params });
};

export const getDetailOrder = (orderId: string) => {
  return http.get<GetOrderDetailResponse>(`${GetDetailOrder}${orderId}`);
};

export const createOrder = (data?: CreateOrderRequest) => {
  return http.post<CreateOrderResponse>(CreateOrder, data);
};

export const createGuestOrder = (data?: ICreateGuestOrderRequest) => {
  return http.post<CreateGuestOrderResponse>(CreateGuestOrder, data);
};

export const updateOrder = (orderId: string, data?: IUpdateOrderRequest) => {
  return http.put<UpdateOrderResponse>(`${UpdateOrder}${orderId}`, data);
};

export const deleteOrder = (orderId: string) => {
  return http.delete<DeleteOrderReponse>(`${DeleteOrder}${orderId}`);
};

// Confirm Order pending to confirmed
export const confirmedOrder = (data?: IConfirmedOrderRequest) => {
  return http.patch<ConfirmedOrderResponse>(ConfirmedOrder, data);
};

// Cancel Order
export const cancelOrder = (data?: ICancelOrderRequest) => {
  return http.patch<CancelOrderResponse>(CancelOrder, data);
};

export const bulkReconcileOrders = (data?: IBulkReconcileOrderRequest) => {
  return http.patch<UpdateOrderResponse>(BulkReconcileOrder, data);
};

export const reconcileSingleOrder = (
  orderId: string,
  data?: IReconcileSingleOrderRequest,
) => {
  return http.patch<UpdateOrderResponse>(
    `${GetDetailOrder}${orderId}/reconcile`,
    data,
  );
};

export const cancelDeliveryOrder = (
  orderId: string,
  data?: ICancelDeliveryOrderRequest,
) => {
  return http.patch<UpdateOrderResponse>(
    `${GetDetailOrder}${orderId}/cancel-delivery`,
    data,
  );
};

export const rollbackOrderDelivery = (orderId: string) => {
  return http.put<RollbackOrderDeliveryResponse>(
    `${GetDetailOrder}${orderId}/rollback`,
  );
};
