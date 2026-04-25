import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { ILoadSheetItem } from "@/types/export-ticket";

interface LoadSheetFormProps {
  data: {
    ticketCode: string;
    routeName: string;
    loadSheetItems: ILoadSheetItem[];
  };
}

export const LoadSheetForm = ({ data }: LoadSheetFormProps) => {
  const { ticketCode, routeName, loadSheetItems } = data;

  return (
    // Giảm padding tổng thể để tận dụng lề giấy
    <div className="bg-white p-2 sm:p-2 shadow-none border-0 text-slate-900 font-sans max-w-[210mm] mx-auto min-h-[297mm] flex flex-col">
      {/* HEADER PHIẾU - Ép margin và padding */}
      <div className="flex flex-col items-center mb-3 border-b border-slate-900 pb-2">
        <h1 className="text-lg font-black uppercase tracking-tighter mb-1">
          Bảng Kê Xuất Kho (Load Sheet)
        </h1>
        <div className="flex gap-4 text-xs font-medium">
          <p>
            Mã: <span className="font-bold">{ticketCode}</span>
          </p>
          <p className="text-slate-400">|</p>
          <p>
            Ngày in:{" "}
            <span>
              {format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi })}
            </span>
          </p>
        </div>
      </div>

      {/* THÔNG TIN TUYẾN ĐƯỜNG - Thu nhỏ icon và padding */}
      <div className="mb-3 flex items-center gap-2 bg-slate-50 p-2 px-3 rounded border border-slate-200">
        <div className="w-7 h-7 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-sm shrink-0">
          R
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Tuyến:
          </p>
          <p className="text-sm font-black text-slate-900 capitalize">
            {routeName}
          </p>
        </div>
      </div>

      {/* DANH SÁCH SẢN PHẨM */}
      <div className="border border-slate-900 rounded">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="py-1.5 px-2 text-[10px] font-bold uppercase border-r border-slate-700 w-[40px] text-center">
                STT
              </th>
              <th className="py-1.5 px-2 text-[10px] font-bold uppercase border-r border-slate-700">
                Tên sản phẩm / Quy cách
              </th>
              <th className="py-1.5 px-2 text-[10px] font-bold uppercase text-center w-[120px]">
                SL Bốc
              </th>
            </tr>
          </thead>
          <tbody>
            {loadSheetItems.map((item, index) => {
              const isEmpty = item.totalQuantity === 0;
              return (
                <tr
                  key={item._id}
                  className={`border-b border-slate-900 last:border-0 ${
                    isEmpty ? "bg-slate-50 opacity-40" : "bg-white"
                  }`}
                >
                  {/* GIẢM PADDING (py-1) ĐỂ ÉP CHIỀU CAO DÒNG */}
                  <td className="py-1 px-2 text-xs font-bold text-slate-500 text-center border-r border-slate-900">
                    {index + 1}
                  </td>
                  <td className="py-1 px-2 border-r border-slate-900 leading-tight">
                    <div className="flex flex-col">
                      <span
                        className={`font-bold text-xs ${isEmpty ? "text-slate-400" : "text-slate-900"}`}
                      >
                        {item.productName}
                      </span>
                      {/* Đưa SKU sát vào tên sản phẩm, bỏ margin-top */}
                      <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                        {item.sku}
                      </span>
                    </div>
                  </td>
                  <td className="py-1 px-2 text-center">
                    <span
                      className={`text-sm font-black px-2 py-0.5 rounded ${
                        isEmpty
                          ? "text-slate-300"
                          : "text-blue-700 bg-blue-50 border border-blue-100"
                      }`}
                    >
                      {item.displayQuantity}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PHẦN KÝ TÊN TẠI KHO - Đẩy lên gần bảng hơn */}
      <div className="mt-6 grid grid-cols-2 gap-8 text-center invisible print:visible">
        <div>
          <p className="font-bold text-xs uppercase mb-12 text-slate-500">
            Người lập phiếu
          </p>
          <div className="border-t border-slate-200 mt-2 pt-1">
            <p className="text-[10px] italic text-slate-400">
              (Ký và ghi rõ họ tên)
            </p>
          </div>
        </div>
        <div>
          <p className="font-bold text-xs uppercase mb-12 text-slate-500">
            Thủ kho xác nhận
          </p>
          <div className="border-t border-slate-200 mt-2 pt-1">
            <p className="text-[10px] italic text-slate-400">
              (Ký và ghi rõ họ tên)
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER IN ẤN - Dính chặt xuống đáy (nhờ flex flex-col ở container) */}
      <div className="mt-auto pt-4 text-[9px] text-slate-400 text-center border-t border-dashed border-slate-200 uppercase tracking-widest hidden print:block">
        Phiếu xuất kho tự động - {format(new Date(), "yyyy")}
      </div>
    </div>
  );
};
