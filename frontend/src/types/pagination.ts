interface IPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface BaseListResponse<T> {
  success: boolean;
  data: T[];
  pagination: IPagination;
  message?: string;
}

export interface BaseDetailResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
