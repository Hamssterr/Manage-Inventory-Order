import { QUERY_KEYS } from "@/constants/query-key";
import type { ComboFormValues } from "@/pages/Product/schema";
import {
  addProduct,
  deleteProduct,
  getProduct,
  updateProduct,
} from "@/services/apis/product";
import type {
  GetProductResponse,
  IAddProductRequest,
  IUpdateProductRequest,
  ProductParams,
} from "@/types/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useGetProduct = (params: ProductParams) => {
  return useQuery<GetProductResponse>({
    queryKey: [QUERY_KEYS.PRODUCTS, params],
    queryFn: () => getProduct(params).then((res) => res.data),
  });
};

export const useAddProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IAddProductRequest) => addProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCTS],
      });
    },
    onError: (error) => {
      console.log("Error creating product:", error);
    },
  });
};

const updateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateProductRequest }) =>
      updateProduct(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCTS],
      });
    },
    onError: (error) => {
      console.log("Error updating product:", error);
    },
  });
};

export const deleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCTS],
      });
    },
    onError: (error) => {
      console.log("Error deleting product:", error);
    },
  });
};

export const useProductActions = (id?: string) => {
  const navigate = useNavigate();
  const { mutate: addProduct, isPending: isAdding } = useAddProductMutation();
  const { mutate: updateProduct, isPending: isUpdating } =
    updateProductMutation();

  const handleSuccess = (msg: string) => {
    toast.success(msg);
    navigate("/products");
  };

  const handleError = (error: any, defaultMsg: string) => {
    toast.error(error?.response?.data?.message || defaultMsg);
    console.error(error);
  };

  const handleSubmit = (data: ComboFormValues, isEdit: boolean) => {
    if (isEdit && id) {
      updateProduct(
        { id, data },
        {
          onSuccess: () => handleSuccess("Cập nhật thành công"),
          onError: (err) => handleError(err, "Cập nhật thất bại"),
        },
      );
    } else {
      addProduct(data, {
        onSuccess: () => handleSuccess("Tạo mới thành công"),
        onError: (err) => handleError(err, "Tạo mới thất bại"),
      });
    }
  };

  return {
    handleSubmit,
    isPending: isAdding || isUpdating,
  };
};
