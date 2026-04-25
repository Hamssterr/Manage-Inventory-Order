import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetOrderDetailQuery, useOrderActions } from "@/hooks/useOrder";
import { FormProvider, useForm } from "react-hook-form";
import { createOrderSchema, type CreateOrderFormValues } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { OrderItemsCard } from "./order-items-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ReconcileOrderDialogProps {
  orderId: string | null;
  onClose: () => void;
}

export const ReconcileOrderDialog = ({
  orderId,
  onClose,
}: ReconcileOrderDialogProps) => {
  const { onReconcileSingleOrder, isPending } = useOrderActions();

  const { data: orderDetail, isLoading } = useGetOrderDetailQuery(
    orderId || "",
  );

  const methods = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: "temp",
      saleId: "temp",
      items: [],
      note: "",
    },
  });

  const orderInfo = orderDetail?.data;

  useEffect(() => {
    if (orderInfo) {
      methods.reset({
        customerId: orderInfo.customerId || "temp",
        saleId:
          (typeof orderInfo.saleId === "object"
            ? (orderInfo.saleId as any)?._id
            : orderInfo.saleId) || "temp",
        note: orderInfo.note || "",
        items: orderInfo.items.map((item: any) => ({
          productId: item.productId,
          productNameSnapshot: item.productNameSnapshot,
          unitName: item.unitNameSnapshot || item.unitName,
          quantity: item.quantity,
          price: item.priceUnit,
          note: item.note,
        })),
      });
    }
  }, [orderInfo, methods]);

  const onSubmit = (data: CreateOrderFormValues) => {
    if (!orderId) return;

    const reconcileData = {
      items: data.items.map((item, index) => {
        // Tìm orderItemId tương ứng nếu có
        const originalItem = orderInfo?.items[index];
        return {
          orderItemId: originalItem?._id,
          productId: item.productId,
          unitName: item.unitName,
          quantity: item.quantity,
        };
      }),
    };

    onReconcileSingleOrder(orderId, reconcileData, () => {
      onClose();
    });
  };

  return (
    <Dialog open={!!orderId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[92vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
        <DialogHeader className="p-4 md:p-6 pb-2 border-b">
          <DialogTitle className="text-lg md:text-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-normal">Đối soát đơn:</span>
              <span className="text-blue-600">{orderInfo?.orderCode}</span>
            </div>
            <div className="hidden md:block">
              <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                Chế độ chỉnh sửa thực giao
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-slate-500 font-medium">
                Đang tải dữ liệu đơn hàng...
              </p>
            </div>
          ) : (
            <FormProvider {...methods}>
              <form
                id="reconcile-form"
                onSubmit={methods.handleSubmit(onSubmit)}
                className="p-4 md:p-6 space-y-6"
              >
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <span className="font-bold text-lg">
                        {orderInfo?.customerNameSnapshot?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                        Khách hàng nhận
                      </p>
                      <p className="font-bold text-slate-800 text-base">
                        {orderInfo?.customerNameSnapshot}
                      </p>
                      <p className="text-xs text-slate-500">
                        {orderInfo?.customerPhoneSnapshot} •{" "}
                        {orderInfo?.deliveryAddressSnapshot}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8 md:text-right md:border-l md:pl-8 border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                        Trạng thái
                      </p>
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                        Đang giao hàng
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                        Tổng tiền dự kiến
                      </p>
                      <p className="font-bold text-blue-600 text-lg">
                        {new Intl.NumberFormat("vi-VN").format(
                          orderInfo?.totalAmount || 0,
                        )}
                        đ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                      Danh sách hàng hóa thực giao
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Dữ liệu đang được đồng bộ thời gian thực
                    </div>
                  </div>
                  <OrderItemsCard />
                </div>
              </form>
            </FormProvider>
          )}
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 rounded-b-lg">
          <Button
            variant="outline"
            className="h-10"
            onClick={onClose}
            disabled={isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            form="reconcile-form"
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 h-10 px-6 shadow-lg shadow-blue-200"
            disabled={isPending || isLoading}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
