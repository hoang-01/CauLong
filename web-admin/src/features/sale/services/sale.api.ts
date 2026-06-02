import axiosClient from "../../../config/axios";

import type {
  PosProduct,
  Facility,
  CreateOrderPayload,
} from "../types/sale.types";

export const PosService = {
  // Danh sách cơ sở
  getFacilities: async () => {
    return axiosClient.get<Facility[]>(
      "/admin/facilities"
    );
  },

  // Variant của sản phẩm
  getVariants: async (
    productId: number
  ) => {
    return axiosClient.get(
      `/admin/products/${productId}/variants`
    );
  },

  // Tồn kho theo cơ sở
  getProductsByFacility: async (
    facilityId: number
  ) => {
    return axiosClient.get<PosProduct[]>(
      `/admin/inventory/facility/${facilityId}`
    );
  },

  createOrder: async (
    payload: CreateOrderPayload
  ) => {
    return axiosClient.post(
      "/app/orders",
      payload
    );
  },
};