import { TableData, type ColumnDef } from "@/components/table-data";
import { Badge } from "@/components/ui/badge";

// 1. Định nghĩa kiểu dữ liệu (Product)
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  status: string;
}

const MOCK_PRODUCTS = Array.from({ length: 20 }, (_, i) => ({
  id: `PROD-${1000 + i}`,
  name: i % 2 === 0 ? `iPhone 15 Pro ${i}GB` : `Samsung Galaxy S24 Ultra`,
  sku: `SKU-${2000 + i}`,
  category: i % 3 === 0 ? "Điện thoại" : "Phụ kiện",
  stock: Math.floor(Math.random() * 50),
  price: 25000000 + i * 500000,
  status: i % 5 === 0 ? "Sắp hết hàng" : "Còn hàng",
}));

export const HomePage = () => {
  // 2. Định nghĩa cấu trúc cột
  const columns: ColumnDef<Product>[] = [
    {
      header: "Mã SP",
      accessorKey: "id",
      className: "w-[120px] text-blue-600 font-medium",
    },
    {
      header: "Tên sản phẩm",
      className: "w-[300px]",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium leading-none">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.sku}</span>
        </div>
      ),
    },
    {
      header: "Danh mục",
      accessorKey: "category",
      className: "w-[150px]",
    },
    {
      header: "Tồn kho",
      accessorKey: "stock",
      className: "w-[100px] text-center font-medium",
    },
    {
      header: "Giá bán",
      className: "w-[150px] text-right tabular-nums",
      cell: (row) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(row.price),
    },
    {
      header: "Trạng thái",
      className: "w-[120px] text-center",
      cell: (row) => (
        <Badge
          variant={row.status === "Sắp hết hàng" ? "destructive" : "secondary"}
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-2">
      <TableData
        data={MOCK_PRODUCTS}
        columns={columns}
        onView={(row) => console.log("View", row.id)}
        onDelete={(row) => console.log("Delete", row)}
      />
    </div>
  );
};
