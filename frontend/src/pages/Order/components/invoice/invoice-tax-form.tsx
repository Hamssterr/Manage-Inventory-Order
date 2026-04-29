import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { IOrder } from "@/types/order";
import { numberToVietnameseText } from "@/utils/helper";

interface InvoiceTaxFormProps {
  order: IOrder;
}

export const InvoiceTaxForm = ({ order }: InvoiceTaxFormProps) => {
  // Helper tính tổng số lượng
  const totalQty = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div
      className="max-w-[850px] mx-auto my-10 p-10 bg-white shadow-lg border border-slate-200 text-slate-900"
      id="invoice-print"
    >
      {/* 1. HEADER CÔNG TY */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
            LOGO
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight">
              Công Ty TNHH Phân Phối ABC
            </h1>
            <p className="text-xs text-slate-500">
              ĐC: 123 Đường Số 1, P. Tân Phong, Quận 7, TP. HCM
            </p>
            <p className="text-xs text-slate-500">
              MST: 0102030405 - ĐT: (028) 3888 9999
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-900 uppercase">
            Hóa Đơn Bán Hàng
          </h2>
          <p className="text-sm font-medium mt-1">
            Mã đơn:{" "}
            <span className="text-blue-600 font-bold">{order.orderCode}</span>
          </p>
          <p className="text-xs text-slate-400 italic">
            Ngày lập:{" "}
            {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
              locale: vi,
            })}
          </p>
        </div>
      </div>

      {/* 2. THÔNG TIN KHÁCH HÀNG (Dùng Snapshots) */}
      <div className="grid grid-cols-2 gap-8 py-8 border-b border-slate-100">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Thông tin người mua
          </p>
          <p className="font-bold text-lg">{order.customerNameSnapshot}</p>
          <p className="text-sm flex items-center gap-1">
            <span className="text-slate-500">SĐT:</span>{" "}
            {order.customerPhoneSnapshot}
          </p>
          {order.customerTaxCodeSnapshot && (
            <p className="text-sm flex items-center gap-1">
              <span className="text-slate-500">MST:</span>{" "}
              {order.customerTaxCodeSnapshot}
            </p>
          )}
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Địa chỉ giao hàng
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {order.deliveryAddressSnapshot}
          </p>
        </div>
      </div>

      {/* 3. BẢNG SẢN PHẨM */}
      <div className="py-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-3 text-[11px] font-bold uppercase text-slate-500 w-10">
                STT
              </th>
              <th className="py-3 text-[11px] font-bold uppercase text-slate-500">
                Sản phẩm
              </th>
              <th className="py-3 text-[11px] font-bold uppercase text-slate-500 text-center">
                ĐVT
              </th>
              <th className="py-3 text-[11px] font-bold uppercase text-slate-500 text-right">
                SL
              </th>
              <th className="py-3 text-[11px] font-bold uppercase text-slate-500 text-right">
                Đơn giá
              </th>
              <th className="py-3 text-[11px] font-bold uppercase text-slate-500 text-right">
               Thành tiền
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr
                key={index}
                className="border-b border-slate-50 group hover:bg-slate-50/50"
              >
                <td className="py-4 text-sm text-slate-400">{index + 1}</td>
                <td className="py-4">
                  <p className="font-bold text-sm text-slate-800">
                    {item.productNameSnapshot}
                  </p>
                </td>
                <td className="py-4 text-sm text-center text-slate-600">
                  {item.unitNameSnapshot}
                </td>
                <td className="py-4 text-sm text-right font-medium">
                  {item.quantity}
                </td>
                <td className="py-4 text-sm text-right text-slate-600">
                  {new Intl.NumberFormat("vi-VN").format(
                    item.taxAmountSnapshot || 0,
                  )}
                </td>
                <td className="py-4 text-sm text-right font-bold text-slate-900">
                  {new Intl.NumberFormat("vi-VN").format(
                    (item.taxAmountSnapshot || 0) * item.quantity,
                  )}
                  đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. TỔNG KẾT & CHỮ KÝ */}
      <div className="mt-4 flex justify-between gap-10">
        <div className="flex-1">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
              Ghi chú đơn hàng
            </p>
            <p className="text-sm italic text-slate-600">
              {order.note || "Không có ghi chú."}
            </p>
          </div>
          <div className="mt-6 flex justify-around text-center italic">
            <div>
              <p className="text-sm font-bold not-italic">Người mua hàng</p>
              <p className="text-[10px] text-slate-400">(Ký, họ tên)</p>
              <div className="h-20"></div>
            </div>
            <div>
              <p className="text-sm font-bold not-italic">Người lập phiếu</p>
              <p className="text-[10px] text-slate-400">(Ký, họ tên)</p>
              <div className="h-20"></div>
            </div>
          </div>
        </div>

        <div className="w-[300px] space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tổng số lượng:</span>
            <span className="font-bold">{totalQty}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tạm tính:</span>
            <span className="font-medium">
              {new Intl.NumberFormat("vi-VN").format(order.totalTaxAmount || 0)} đ
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Giảm giá:</span>
            <span className="font-medium text-green-600">- 0 đ</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900">
            <span className="font-black uppercase text-slate-900">
              Tổng cộng:
            </span>
            <span className="text-xl font-black text-blue-600">
              {new Intl.NumberFormat("vi-VN").format(order.totalTaxAmount || 0)} đ
            </span>
          </div>
          <p className="text-[10px] text-right text-slate-400 italic">
            (Bằng chữ: {numberToVietnameseText(order.totalTaxAmount || 0)})
          </p>
        </div>
      </div>

      {/* FOOTER ĐIỀU KHOẢN */}
      <div className="mt-12 pt-6 border-t border-dashed border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
          Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi!
        </p>
      </div>
    </div>
  );
};
