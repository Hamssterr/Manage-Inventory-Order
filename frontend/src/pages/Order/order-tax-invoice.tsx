import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Printer, Download, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";

import { useGetOrderDetailQuery } from "@/hooks/useOrder";
import { Button } from "@/components/ui/button";
import type { IOrder } from "@/types/order";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbLink } from "@/components/ui/breadcrumb";
import { InvoiceTaxForm } from "./components/invoice/invoice-tax-form";
import { OrderTaxPdf } from "./components/invoice/order-tax-pdf";

export const OrderTaxInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef<HTMLDivElement>(null);

  // Ưu tiên lấy dữ liệu từ state của location (nếu có)
  const [order, setOrder] = useState<IOrder | null>(
    (location.state as { order: IOrder })?.order || null,
  );

  // Nếu không có trong state, fetch từ API
  const { data, isLoading, isError, refetch } = useGetOrderDetailQuery(
    id as string,
  );

  useEffect(() => {
    if (data?.data && !order) {
      setOrder(data.data);
    }
  }, [data, order]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `HoaDon_${order?.orderCode}`,
    onAfterPrint: () => toast.success("Đã hoàn thành lệnh in"),
  });

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading && !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30 h-full">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Đang tải chi tiết đơn hàng...
        </p>
      </div>
    );
  }

  if (isError && !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30 p-6 text-center h-full">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Lỗi tải dữ liệu
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Không tìm thấy thông tin đơn hàng hoặc đã có lỗi xảy ra.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBack}>
            Quay lại
          </Button>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/50 overflow-hidden">
      {/* HEADER TRANG CHI TIẾT */}
      <header className="shrink-0 z-50 bg-white border-b border-slate-200 p-2 sm:px-4 gap-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <SidebarTrigger />

          <Separator orientation="vertical" className="mr-2 h-10" />

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <BreadcrumbLink
              className="text-muted-foreground text-sm cursor-pointer"
              onClick={() => handleBack()}
            >
              Quay lại
            </BreadcrumbLink>
            {order && (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline text-slate-300">/</span>
                <span className="font-semibold text-primary text-sm">
                  {order.orderCode}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order && (
            <PDFDownloadLink
              document={<OrderTaxPdf order={order} />}
              fileName={`HoaDonThue_${order.orderCode}.pdf`}
            >
              {({ loading }) => (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 lg:px-6 gap-2 rounded-lg border-slate-200 bg-white hover:bg-slate-50 shadow-sm hidden md:flex"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>{loading ? "Đang chuẩn bị..." : "Tải PDF"}</span>
                </Button>
              )}
            </PDFDownloadLink>
          )}
          <Button
            variant="default"
            size="sm"
            className="h-9 lg:px-6 gap-2 rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 transition-all px-4"
            onClick={() => handlePrint()}
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">In hóa đơn</span>
            <span className="sm:hidden">In</span>
          </Button>
        </div>
      </header>

      {/* VÙNG NỘI DUNG CUỘN */}
      <main className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          {order && (
            <div ref={printRef} className="w-full">
              <InvoiceTaxForm order={order} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
