import type { IProduct } from "@/types/product";

interface StockCardProps {
  isViewMode: boolean;
  product?: IProduct;
}

export const StockCard = ({ isViewMode, product }: StockCardProps) => {
  if (!isViewMode || !product) return null;
  return (
    <div className="border rounded-xl shadow-sm bg-white">
      <div className="flex flex-col bg-gray-100 p-3 rounded-t">
        <p className="font-bold text-md">Thông tin kho</p>
        <p className="text-muted-foreground text-xs">
          Số lượng tồn kho hiện tại của sản phẩm
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Tổng số lượng (Base):
          </span>
          <span className="font-semibold">
            {product.totalBaseQuantity || 0}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Tồn kho hiển thị:
          </span>
          <span className="font-semibold text-red-600">
            {product.displayQuantity || "0"}
          </span>
        </div>
      </div>
    </div>
  );  
};
