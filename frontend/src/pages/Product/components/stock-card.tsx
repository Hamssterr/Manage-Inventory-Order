import type { IProduct } from "@/types/product";

interface StockCardProps {
  isViewMode: boolean;
  product?: IProduct;
}

export const StockCard = ({ isViewMode, product }: StockCardProps) => {
  if (!isViewMode || !product) return null;
  
  return (
    <div className="border rounded shadow-sm bg-white">
      <div className="flex flex-col bg-gray-100 p-3 rounded-t">
        <p className="font-bold text-md">Thông tin kho lập</p>
        <p className="text-muted-foreground text-xs">
          Khả năng cung ứng tối đa dựa trên tồn kho nguyên liệu
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Tổng số lượng (Base):
          </span>
          <span className="font-semibold">
            {product.totalQuantity || 0}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Khả năng bán tối đa:
          </span>
          <span className="font-semibold text-red-600">
            {product.stockDisplay || "0"}
          </span>
        </div>
      </div>
    </div>
  );
};
