import type {
  AddProductResponse,
  DeleteProductResponse,
  GetProductResponse,
  IAddProductRequest,
  IUpdateProductRequest,
  ProductParams,
  UpdateProductResponse,
} from "@/types/product";
import http from "../base";
import {
  AddProduct,
  DeleteProduct,
  GetProduct,
  UpdateProduct,
} from "@/constants/api-endpoints";

export const getProduct = (params: ProductParams) => {
  return http.get<GetProductResponse>(GetProduct, { params });
};

export const addProduct = (data: IAddProductRequest) => {
  return http.post<AddProductResponse>(AddProduct, data);
};

export const updateProduct = (data: IUpdateProductRequest, id: string) => {
  return http.put<UpdateProductResponse>(`${UpdateProduct}${id}`, data);
};

export const deleteProduct = (id: string) => {
  return http.delete<DeleteProductResponse>(`${DeleteProduct}${id}`);
};
