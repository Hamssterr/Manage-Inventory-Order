import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/query-key";
import {
  cancelOrder,
  confirmedOrder,
  createGuestOrder,
  createOrder,
  deleteOrder,
  getAllOrder,
  getDetailOrder,
  updateOrder,
  bulkReconcileOrders,
  reconcileSingleOrder,
  cancelDeliveryOrder,
  rollbackOrderDelivery,
} from "@/services/apis/order";
import type {
  CreateGuestOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetAllOrdersResponse,
  GetOrderDetailResponse,
  ICancelOrderRequest,
  IConfirmedOrderRequest,
  ICreateGuestOrderRequest,
  IUpdateOrderRequest,
  OrderParams,
  IBulkReconcileOrderRequest,
  IReconcileSingleOrderRequest,
  ICancelDeliveryOrderRequest,
} from "@/types/order";
import { useNavigate } from "react-router-dom";
import { useCreateExportTicket } from "./useExportTicket";

export const useGetAllOrdersQuery = (params: OrderParams, options?: any) => {
  return useQuery<GetAllOrdersResponse>({
    queryKey: [QUERY_KEYS.ORDERS, params],
    queryFn: () => getAllOrder(params).then((res) => res.data),
    ...options,
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
    mutationFn: (data: CreateOrderRequest) =>
      createOrder(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      toast.success("Tạo đơn hàng thành công");
    },
    onError: (err: any) => {
      console.error(err?.response?.data?.message || "Tạo đơn hàng thất bại");
    },
  });
};

export const useCreateGuestOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateGuestOrderResponse, any, ICreateGuestOrderRequest>({
    mutationFn: (data: ICreateGuestOrderRequest) =>
      createGuestOrder(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      toast.success("Tạo đơn hàng vãng lai thành công");
    },
    onError: (err: any) => {
      console.error(err?.response?.data?.message || "Tạo đơn hàng thất bại");
    },
  });
};

export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateOrderRequest }) =>
      updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS],
      });
    },
    onError: (err: any) => {
      console.error(
        err?.response?.data?.message || "Cập nhật đơn hàng thất bại",
      );
    },
  });
};

export const useDeleteOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS],
      });
    },
    onError: (err: any) => {
      console.error(err?.response?.data?.message || "Xóa đơn hàng thất bại");
    },
  });
};

export const useConfirmedOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IConfirmedOrderRequest) => confirmedOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS],
      });
    },
    onError: (err: any) => {
      console.error(
        err?.response?.data?.message || "Xác nhận đơn hàng thất bại",
      );
    },
  });
};

export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICancelOrderRequest) => cancelOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS],
      });
    },
    onError: (err: any) => {
      console.error(err?.response?.data?.message || "Hủy đơn hàng thất bại");
    },
  });
};

export const useBulkReconcileOrdersMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IBulkReconcileOrderRequest) => bulkReconcileOrders(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS],
      });
    },
    onError: (err: any) => {
      console.error(
        err?.response?.data?.message || "Đối soát hàng loạt thất bại",
      );
    },
  });
};

export const useReconcileSingleOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: IReconcileSingleOrderRequest;
    }) => reconcileSingleOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS],
      });
    },
    onError: (err: any) => {
      console.error(
        err?.response?.data?.message || "Đối soát thành công thất bại",
      );
    },
  });
};

export const useCancelDeliveryOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: ICancelDeliveryOrderRequest;
    }) => cancelDeliveryOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS],
      });
    },
    onError: (err: any) => {
      console.error(
        err?.response?.data?.message || "Hủy đơn hàng đang giao thất bại",
      );
    },
  });
};

export const useRollbackOrderDeliveryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rollbackOrderDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS],
      });
    },
    onError: (err: any) => {
      console.error(
        err?.response?.data?.message || "Hoàn tác trạng thái đơn hàng thất bại",
      );
    },
  });
};

export const useOrderActions = (id?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: createOrder, isPending: isCreating } =
    useCreateOrderMutation();
  const { mutate: updateOrder, isPending: isUpdating } =
    useUpdateOrderMutation();
  const { mutate: createGuest, isPending: isCreatingGuest } =
    useCreateGuestOrderMutation();
  const { mutate: deleteOrder, isPending: isDeleting } =
    useDeleteOrderMutation();
  const { mutate: confirmOrders, isPending: isConfirming } =
    useConfirmedOrderMutation();
  const { mutate: cancelOrders, isPending: isCancelling } =
    useCancelOrderMutation();

  const { mutate: bulkReconcile, isPending: isBulkReconciling } =
    useBulkReconcileOrdersMutation();
  const { mutate: reconcileSingle, isPending: isReconcilingSingle } =
    useReconcileSingleOrderMutation();
  const { mutate: cancelDelivery, isPending: isCancelingDelivery } =
    useCancelDeliveryOrderMutation();
  const { mutate: rollbackDelivery, isPending: isRollbackingDelivery } =
    useRollbackOrderDeliveryMutation();

  // Create Export-Ticket
  const { mutate: createExportTicket, isPending: isExportTicketPending } =
    useCreateExportTicket();

  const handleSuccess = (msg: string) => {
    toast.success(msg);
    if (!id) navigate("/orders");
  };

  const handleError = (error: any, defaultMsg: string) => {
    toast.error(error?.response?.data?.message || defaultMsg);
  };

  const onOrderSubmit = (data: CreateOrderRequest, isEdit: boolean) => {
    if (isEdit && id) {
      updateOrder(
        { id, data },
        {
          onSuccess: () => {
            handleSuccess("Cập nhật đơn hàng thành công");
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
          },
          onError: (err) => handleError(err, "Cập nhật đơn hàng thất bại"),
        },
      );
    } else {
      createOrder(data, {
        onSuccess: () => {
          handleSuccess("Tạo đơn hàng thành công");
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
        },
        onError: (err) => handleError(err, "Tạo đơn hàng thất bại"),
      });
    }
  };

  const onGuestOrderSubmit = (data: ICreateGuestOrderRequest) => {
    createGuest(data, {
      onSuccess: () => {
        handleSuccess("Tạo đơn hàng vãng lai thành công");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      },
      onError: (err) => handleError(err, "Tạo đơn hàng vãng lai thất bại"),
    });
  };

  const onDeleteOrder = (orderId: string, onSuccess?: () => void) => {
    deleteOrder(orderId, {
      onSuccess: () => {
        toast.success("Xóa đơn hàng thành công");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
        onSuccess?.();
      },
      onError: (err) => handleError(err, "Xóa đơn hàng thất bại"),
    });
  };

  const onConfirmOrders = (orderIds: string[], onSuccess?: () => void) => {
    confirmOrders(
      { orderIds },
      {
        onSuccess: () => {
          toast.success(`Đã xác nhận ${orderIds.length} đơn hàng`);
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
          onSuccess?.();
        },
        onError: (err) => handleError(err, "Xác nhận đơn hàng thất bại"),
      },
    );
  };

  const onCancelOrders = (orderIds: string[], onSuccess?: () => void) => {
    cancelOrders(
      { orderIds },
      {
        onSuccess: () => {
          toast.success(`Đã hủy ${orderIds.length} đơn hàng`);
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
          onSuccess?.();
        },
        onError: (err) => handleError(err, "Hủy đơn hàng thất bại"),
      },
    );
  };

  // Các hàm mới
  const onBulkReconcileOrders = (
    orderIds: string[],
    onSuccess?: () => void,
  ) => {
    bulkReconcile(
      { orderIds },
      {
        onSuccess: () => {
          toast.success(`Đã giao hàng thành công ${orderIds.length} đơn hàng`);
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
          onSuccess?.();
        },
        onError: (err) => handleError(err, "Giao hàng loạt thất bại"),
      },
    );
  };

  const onReconcileSingleOrder = (
    orderId: string,
    data?: IReconcileSingleOrderRequest,
    onSuccess?: () => void,
  ) => {
    reconcileSingle(
      { id: orderId, data },
      {
        onSuccess: () => {
          toast.success("Giao hàng và đối soát thành công");
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
          onSuccess?.();
        },
        onError: (err) => handleError(err, "Đối soát thất bại"),
      },
    );
  };

  const onCancelDeliveryOrder = (
    orderId: string,
    cancelNote?: string,
    onSuccess?: () => void,
  ) => {
    cancelDelivery(
      { id: orderId, data: { cancelNote } },
      {
        onSuccess: () => {
          toast.success("Đã hủy đơn hàng đang giao");
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
          onSuccess?.();
        },
        onError: (err) => handleError(err, "Hủy đơn hàng thất bại"),
      },
    );
  };

  const onRollbackOrderDelivery = (orderId: string, onSuccess?: () => void) => {
    rollbackDelivery(orderId, {
      onSuccess: () => {
        toast.success("Đã hoàn tác trạng thái đơn hàng");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
        onSuccess?.();
      },
      onError: (err) =>
        handleError(err, "Hoàn tác trạng thái đơn hàng thất bại"),
    });
  };

  const onCreateExportTicket = (
    orderIds: string | string[],
    onSuccess?: () => void,
  ) => {
    const ids = Array.isArray(orderIds) ? orderIds : [orderIds];
    createExportTicket(
      { orderIds: ids },
      {
        onSuccess: () => {
          toast.success("Tạo phiếu xuất thành công");
          onSuccess?.();
        },
        onError: (err) => handleError(err, "Tạo phiếu xuất thất bại"),
      },
    );
  };

  return {
    onOrderSubmit,
    onGuestOrderSubmit,
    onDeleteOrder,
    onConfirmOrders,
    onCancelOrders,
    onBulkReconcileOrders,
    onReconcileSingleOrder,
    onCancelDeliveryOrder,
    onRollbackOrderDelivery,
    onCreateExportTicket,
    isPending:
      isCreating ||
      isUpdating ||
      isCreatingGuest ||
      isDeleting ||
      isConfirming ||
      isCancelling ||
      isBulkReconciling ||
      isReconcilingSingle ||
      isCancelingDelivery ||
      isRollbackingDelivery ||
      isExportTicketPending,
  };
};
