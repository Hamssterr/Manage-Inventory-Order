import { QUERY_KEYS } from "@/constants/query-key";
import { EmployeeColumns } from "@/pages/Employee/components/employee-column";
import type { EmployeeFormValues } from "@/pages/Employee/schema";
import {
  createEmployee,
  deleteEmployee,
  getAllEmployee,
  getEmployeeSalary,
  resetEmployeePassword,
} from "@/services/apis/employee";
import type {
  Employee,
  EmployeeParams,
  ICreateEmployeeRequest,
  ISalaryReportData,
} from "@/types/employee";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export const useGetEmployeesQuery = (params: EmployeeParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES, params],
    queryFn: () => getAllEmployee(params).then((res) => res.data),
  });
};

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateEmployeeRequest) => createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES] });
    },
    onError: (err) => {
      console.log("Lỗi tạo nhân viên:", err);
    },
  });
};

export const useResetPasswordEmployeeMutation = () => {
  return useMutation({
    mutationFn: (id: string) => resetEmployeePassword(id),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu reset-password thành công");
    },
    onError: (err) => {
      console.log("Lỗi reset-password nhân viên:", err);
    },
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES] });
      toast.success("Xóa nhân viên thành công");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Xóa nhân viên thất bại");
    },
  });
};

export const useGetEmployeeSalaryMutation = () => {
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: EmployeeParams }) =>
      getEmployeeSalary(id, params),
  });
};

// Custom-Hook
// --------------------------------------------------------------------------
export const useEmployeePageLogic = () => {
  // Local states
  const LIMIT_PER_PAGE = 15;

  // State: Bộ lọc & Phân trang
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // State: Dữ liệu đang thao tác
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [reportData, setReportData] = useState<ISalaryReportData | null>(null);

  // State: Quản lý ẩn/hiện Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "delete" | "reset-password" | null
  >(null);

  // API HOOKS
  const { data, isLoading, isError, refetch, isFetching } =
    useGetEmployeesQuery({
      page,
      limit: LIMIT_PER_PAGE,
      search: search || undefined,
    });

  const { mutate: createEmployee, isPending: createEmployeePending } =
    useCreateEmployeeMutation();
  const { mutate: deleteEmployeeMutation, isPending: isDeleting } =
    useDeleteEmployeeMutation();
  const { mutate: resetPassword, isPending: isResetting } =
    useResetPasswordEmployeeMutation();
  const { mutateAsync: getSalaryReport, isPending: isExporting } =
    useGetEmployeeSalaryMutation();

  // COMPUTED VALUES (Dữ liệu đã được tính toán/format)
  const columns = useMemo(() => EmployeeColumns(), []);

  const employees = useMemo(() => {
    return data?.data.map((item) => ({ ...item, id: item._id })) || [];
  }, [data]);

  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 1;
  const currentPage = data?.pagination?.currentPage || 1;

  // Tính toán số thứ tự hiển thị (VD: Hiển thị 1 - 15 trên 100 kết quả)
  const startItem =
    employees.length > 0 ? (currentPage - 1) * LIMIT_PER_PAGE + 1 : 0;
  const endItem = Math.min(currentPage * LIMIT_PER_PAGE, totalItems);

  // 4. ACTION HANDLERS (Xử lý tác vụ nghiệp vụ)
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1); // Reset về trang 1 khi tìm kiếm
  }, []);

  const handleNextPage = () =>
    setPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  const handleCreateEmployee = (formData: EmployeeFormValues) => {
    createEmployee(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Thêm nhân viên thất bại");
      },
    });
  };

  const handleConfirmAction = () => {
    if (!selectedEmployee) return;

    if (modalType === "delete") {
      deleteEmployeeMutation(selectedEmployee._id, {
        onSuccess: closeConfirmModal,
      });
    } else if (modalType === "reset-password") {
      resetPassword(selectedEmployee._id, {
        onSuccess: closeConfirmModal,
      });
    }
  };

  const handleExportSalary = async (params: {
    month: number;
    year: number;
  }) => {
    if (!selectedEmployee) return;

    try {
      const response = await getSalaryReport({
        id: selectedEmployee._id,
        params,
      });

      setReportData(response.data.data); // Cất dữ liệu JSON lấy được
      setIsPreviewOpen(true); // Mở modal Preview Phiếu lương
      handleCloseExport(); // Đóng modal chọn tháng
      toast.success("Lấy báo cáo lương thành công");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Lỗi khi lấy báo cáo lương",
      );
    }
  };

  // MODAL TOGGLE HANDLERS (Đóng/mở các popup giao diện)
  // Modal Thêm mới
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Modal Confirm (Xóa / Reset Pass)
  const handleOpenDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalType("delete");
  };

  const handleOpenReset = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalType("reset-password");
  };

  const closeConfirmModal = () => {
    setModalType(null);
    setSelectedEmployee(null); // Clear data
  };

  // Modal Chọn tháng xuất lương
  const handleOpenExport = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsExportModalOpen(true);
  };

  const handleCloseExport = () => {
    setIsExportModalOpen(false);
  };

  // Modal Xem trước Phiếu lương
  const closePreviewModal = () => {
    setIsPreviewOpen(false);
    setTimeout(() => {
      setSelectedEmployee(null);
      setReportData(null);
    }, 200);
  };

  return {
    // UI & Filter States
    search,
    page,

    // Data & Computed Values
    employees,
    columns,
    totalItems,
    totalPages,
    startItem,
    endItem,

    // Modal & Selection States
    isModalOpen,
    modalType,
    selectedEmployee,
    isExportModalOpen,
    isPreviewOpen,
    reportData,

    // Loading & Error States
    isLoading,
    isFetching,
    isError,
    createEmployeePending,
    isConfirming: isDeleting || isResetting,
    isExporting,

    // Actions & Handlers
    refetch,
    handleCreateEmployee,
    handleConfirmAction,
    handleSearch,
    handleNextPage,
    handlePrevPage,
    handleExportSalary,

    // Modal Toggles
    openModal,
    closeModal,
    handleOpenDelete,
    handleOpenReset,
    closeConfirmModal,
    handleOpenExport,
    handleCloseExport,
    closePreviewModal,
  };
};
