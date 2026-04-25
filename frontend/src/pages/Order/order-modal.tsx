import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HeaderActions } from "./components/header-actions";
import { useGetOrderDetailQuery, useOrderActions } from "@/hooks/useOrder";
import { FormProvider, useForm } from "react-hook-form";
import { createOrderSchema, type CreateOrderFormValues } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomerInfoCard } from "./components/customer-info-card";
import { OrderItemsCard } from "./components/order-items-card";
import { OrderSummaryCard } from "./components/order-summary-card";
import { OrderNoteCard } from "./components/order-note-card";
import { useEffect } from "react";
import type { IOrder } from "@/types/order";

export const OrderModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isEditMode = location.pathname.includes("edit") && !!id;
  const { onOrderSubmit, isPending } = useOrderActions(id);

  // Dữ liệu truyền từ trang danh sách (nếu có)
  const stateOrder = location.state?.order as IOrder;

  // Lấy dữ liệu chi tiết từ API làm fallback (chỉ gọi khi không có dữ liệu từ state)
  const { data: orderDetail, isLoading: isLoadingDetail } =
    useGetOrderDetailQuery(!stateOrder && isEditMode ? id || "" : "");

  const methods = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: "",
      saleId: "",
      items: [],
      note: "",
    },
  });

  // Tự động điền dữ liệu khi có dữ liệu (từ State hoặc API)
  useEffect(() => {
    const dataToReset = stateOrder || orderDetail;

    if (isEditMode && dataToReset) {
      const saleIdRaw = dataToReset.saleId;
      const saleId =
        typeof saleIdRaw === "object" && saleIdRaw !== null
          ? saleIdRaw._id
          : (saleIdRaw as string);

      methods.reset({
        customerId: dataToReset.customerId || "",
        customerNameSnapshot: dataToReset.customerNameSnapshot
          ? `${dataToReset.customerNameSnapshot} - ${dataToReset.customerPhoneSnapshot || ""}`
          : "",
        saleId: saleId || "",
        note: dataToReset.note || "",
        items: dataToReset.items.map((item: any) => ({
          productId: item.productId,
          productNameSnapshot: item.productNameSnapshot,
          unitName: item.unitNameSnapshot || item.unitName,
          quantity: item.quantity,
          price: item.priceUnit, // Để UI OrderSummaryCard tính toán ngay
          note: item.note,
        })),
      });
    }
  }, [isEditMode, orderDetail, stateOrder, methods]);

  const handleCancel = () => {
    navigate("/orders");
  };

  const onSubmit = (data: CreateOrderFormValues) => {
    // Mapping format for API
    const submitData = {
      customerId: data.customerId,
      saleId: data.saleId,
      note: data.note,
      items: data.items.map((item) => ({
        productId: item.productId,
        unitName: item.unitName,
        quantity: item.quantity,
        note: item.note,
      })),
    };

    onOrderSubmit(submitData, isEditMode);
  };

  const onError = (errors: any) => {
    console.log("Validation Errors:", errors);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, onError)}
        className="flex flex-col h-screen bg-slate-50/50"
      >
        {/* Phần Header cố định */}
        <HeaderActions
          isEditMode={isEditMode}
          isPending={isPending}
          onCancel={handleCancel}
        />

        {/* Phần nội dung có thể cuộn */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {!stateOrder && isLoadingDetail ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">
                  Đang tải dữ liệu đơn hàng...
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full mx-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 lg:gap-8 xl:gap-10">
                {/* Cột trái: Thông tin khách & Tổng kết */}
                <div className="md:col-span-5 lg:col-span-4 xl:col-span-3 space-y-6">
                  <CustomerInfoCard />
                  <OrderSummaryCard />
                </div>

                {/* Cột phải: Danh sách sản phẩm */}
                <div className="md:col-span-7 lg:col-span-8 xl:col-span-9 space-y-6">
                  <OrderItemsCard />
                  <OrderNoteCard />
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
};
