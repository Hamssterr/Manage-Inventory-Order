import { QUERY_KEYS } from "@/constants/query-key";
import type {
  ImportInventoryFormValues,
  InventoryFormValues,
} from "@/pages/Inventory/schema";
import {
  createInventoryProduct,
  deleteInventoryProduct,
  getInventoryProduct,
  importInventoryProduct,
  updateInventoryProduct,
} from "@/services/apis/inventory";
import type {
  ICreateInventoryPayload,
  IImportInventoryRequest,
  InventoryParams,
  GetInventoryListProduct,
} from "@/types/inventory";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useGetInventoryProducts = (
  params?: InventoryParams,
  options?: Omit<UseQueryOptions<GetInventoryListProduct, Error, GetInventoryListProduct, any[]>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY_PRODUCTS, params],
    queryFn: () => getInventoryProduct(params).then((res) => res.data),
    ...options,
  });
};

export const useCreateInventoryProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateInventoryPayload) => createInventoryProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVENTORY_PRODUCTS],
      });
    },
    onError: (error) => {
      console.log("Error creating product inventory:", error);
    },
  });
};

export const useUpdateInventoryProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ICreateInventoryPayload }) =>
      updateInventoryProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVENTORY_PRODUCTS],
      });
    },
    onError: (error) => {
      console.log("Error updating product:", error);
    },
  });
};

export const useImportInventoryProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IImportInventoryRequest }) =>
      importInventoryProduct(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVENTORY_PRODUCTS],
      });
    },
    onError: (error) => {
      console.log("Error import inventory products", error);
    },
  });
};

export const useDeleteInventoryProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInventoryProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVENTORY_PRODUCTS],
      });
    },
    onError: (error) => {
      console.log("Error delete inventory products", error);
    },
  });
};

export const useInventoryActions = (id?: string) => {
  const navigate = useNavigate();
  const { mutate: createProduct, isPending: isCreating } =
    useCreateInventoryProducts();
  const { mutate: updateProduct, isPending: isUpdating } =
    useUpdateInventoryProducts();
  const { mutate: importProduct, isPending: isImporting } =
    useImportInventoryProducts();

  const handleSuccess = (msg: string) => {
    toast.success(msg);
    navigate("/inventory");
  };

  const handleError = (error: any, defaultMsg: string) => {
    toast.error(error?.response?.data?.message || defaultMsg);
    console.error(error);
  };

  const onInventorySubmit = (data: InventoryFormValues, isEdit: boolean) => {
    if (isEdit && id) {
      updateProduct(
        { id, data },
        {
          onSuccess: () => handleSuccess("Cập nhật thành công"),
          onError: (err) => handleError(err, "Cập nhật thất bại"),
        },
      );
    } else {
      createProduct(data, {
        onSuccess: () => handleSuccess("Thêm mới thành công"),
        onError: (err) => handleError(err, "Thêm mới thất bại"),
      });
    }
  };

  const onImportSubmit = (data: ImportInventoryFormValues) => {
    if (!id) return;
    importProduct(
      { id, data },
      {
        onSuccess: () => handleSuccess("Nhập kho thành công"),
        onError: (err) => handleError(err, "Nhập kho thất bại"),
      },
    );
  };

  return {
    onInventorySubmit,
    onImportSubmit,
    isPending: isCreating || isUpdating || isImporting,
  };
};
