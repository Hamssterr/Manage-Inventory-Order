import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/query-key";
import {
  createCustomer,
  deleteCustomer,
  getAllCustomer,
  updateCustomer,
} from "@/services/apis/customer";
import type {
  CustomerParams,
  GetAllCustomerResponse,
  ICreateCustomerRequest,
  IUpdateCustomerRequest,
} from "@/types/customer";
import type { CustomerFormValues } from "@/pages/Customer/schema";

export const useGetAllCustomerQuery = (params: CustomerParams) => {
  return useQuery<GetAllCustomerResponse>({
    queryKey: [QUERY_KEYS.CUSTOMERS, params],
    queryFn: () => getAllCustomer(params).then((res) => res.data),
  });
};

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateCustomerRequest) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CUSTOMERS],
      });
    },
    onError: (err) => {
      console.log("Error creating customer:", err);
    },
  });
};

export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateCustomerRequest }) =>
      updateCustomer(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CUSTOMERS],
      });
    },
    onError: (err) => {
      console.log("Error updating customer:", err);
    },
  });
};

export const deleteCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CUSTOMERS],
      });
    },
    onError: (error) => {
      console.log("Error deleting customer:", error);
    },
  });
};

export const useCustomerActions = (id?: string) => {
  const navigate = useNavigate();
  const { mutate: addCustomer, isPending: isAdding } =
    useCreateCustomerMutation();
  const { mutate: editCustomer, isPending: isUpdating } =
    useUpdateCustomerMutation();

  const handleSuccess = (msg: string) => {
    toast.success(msg);
    navigate("/customers");
  };

  const handleError = (error: any, defaultMsg: string) => {
    toast.error(error?.response?.data?.message || defaultMsg);
    console.error(error);
  };

  const handleSubmit = (data: CustomerFormValues, isEdit: boolean) => {
    if (isEdit && id) {
      editCustomer(
        { id, data },
        {
          onSuccess: () => handleSuccess("Cập nhật khách hàng thành công"),
          onError: (err) => handleError(err, "Cập nhật khách hàng thất bại"),
        },
      );
    } else {
      addCustomer(data, {
        onSuccess: () => handleSuccess("Thêm mới khách hàng thành công"),
        onError: (err) => handleError(err, "Thêm mới khách hàng thất bại"),
      });
    }
  };

  return {
    handleSubmit,
    isPending: isAdding || isUpdating,
  };
};
