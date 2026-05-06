import axiosClient from "../../../config/axios";
import type { ApiResponse } from "../../../types/api.type";
import type { BookedSlotDTO, Booking, CreateBookingPayload } from "../types/booking.types";

export const BookingService = {
  getAllBookings: async (params?: any) => {
    return await axiosClient.get<any,ApiResponse<Booking[]>>('/admin/bookings', { params });
  },

 updateBooking: async (id: number, payload: { status?: string, payment_status?: string }) => {
    return await axiosClient.put<any, ApiResponse<Booking>>(`/admin/bookings/${id}/status`, payload);
  },

  createBooking: async (payload: CreateBookingPayload) => {
    return await axiosClient.post<any, ApiResponse<Booking>>('/admin/bookings/hotline', payload);
  },

  getDailySlots: async (facility_id: number, date: string, court_type: string) => {
    return await axiosClient.get<any, ApiResponse<BookedSlotDTO[]>>('/app/bookings/daily-booked-slots', {
      params: { facility_id, date, court_type }
    });
  },

  getUserByPhone: async (phone: string) => {
    return await axiosClient.get<any, ApiResponse<any>>('/admin/users/search-phone', {
      params: { phone }
    });
  }
};