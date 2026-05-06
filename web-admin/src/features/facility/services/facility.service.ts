import axiosClient from '../../../config/axios';
import type { ApiResponse } from '../../../types/api.type';

export const FacilityService = {

  getAllFacilities: async () => {
    return await axiosClient.get<any, ApiResponse<any[]>>('/admin/facilities');
  },

  getCourtsByFacility: async (facilityId: number) => {
    return await axiosClient.get<any, ApiResponse<any[]>>(`/admin/facilities/${facilityId}/courts`);
  }
};