import { Request } from "express";

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export const getPaginationParams = (req: Request) => {
  // Lấy params từ query, đặt mặc định page = 1, limit = 10
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  // Tính số lượng document cần bỏ qua
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Hàm hỗ trợ format kết quả trả về
export const formatPaginationResponse = <T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number,
): PaginationResult<T> => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};
