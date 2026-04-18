import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createRoute,
  deleteRoute,
  getAllRoute,
  updateRoute,
} from "@/services/apis/route";
import { QUERY_KEYS } from "@/constants/query-key";
import type {
  GetAllRouteResponse,
  ICreateRouteRequest,
  IUpdateRouteRequest,
  RouteParams,
} from "@/types/route";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { RouteFormValues } from "@/pages/Route/schema";

export const useGetAllRouteQuery = (
  params: RouteParams,
  options?: Omit<UseQueryOptions<GetAllRouteResponse>, "queryKey" | "queryFn">,
) => {
  return useQuery<GetAllRouteResponse>({
    queryKey: [QUERY_KEYS.ROUTES, params],
    queryFn: () => getAllRoute(params).then((res) => res.data),
    ...options,
  });
};

export const useGetInfiniteRouteQuery = (params: RouteParams) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.ROUTES, "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getAllRoute({ ...params, page: pageParam as number }).then(
        (res) => res.data,
      ),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useCreateRouteMutaion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateRouteRequest) => createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROUTES] });
    },
    onError: (err) => {
      console.log("Error in create route", err);
    },
  });
};

export const useUpdateRouteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateRouteRequest }) =>
      updateRoute(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROUTES] });
    },
    onError: (err) => {
      console.log("Error in update route", err);
    },
  });
};

export const deleteRouteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROUTES] });
    },
    onError: (error) => {
      console.log("Error deleting route:", error);
    },
  });
};

export const handleRouteActions = (id?: string) => {
  const navigate = useNavigate();
  const { mutate: createRoute, isPending: isCreating } =
    useCreateRouteMutaion();
  const { mutate: updateRoute, isPending: isUpdating } =
    useUpdateRouteMutation();

  const handleSuccess = (msg: string) => {
    toast.success(msg);
    navigate("/routes");
  };
  const handleError = (error: any, defaultMsg: string) => {
    toast.error(error?.response?.data?.message || defaultMsg);
    console.error(error);
  };

  const handleSubmit = (data: RouteFormValues, isEdit: boolean) => {
    if (isEdit && id) {
      updateRoute(
        { id, data },
        {
          onSuccess: () => handleSuccess("Cập nhật thành công"),
          onError: (err) => handleError(err, "Cập nhật thất bại"),
        },
      );
    } else {
      createRoute(data, {
        onSuccess: () => handleSuccess("Cập nhật thành công"),
        onError: (err) => handleError(err, "Cập nhật thất bại"),
      });
    }
  };

  return { handleSubmit, isPending: isCreating || isUpdating };
};
