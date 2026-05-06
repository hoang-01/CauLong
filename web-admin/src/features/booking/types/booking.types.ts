export interface BookingUser {
  id: number;
  email: string;
  phone: string;
  full_name?: string;
}

// Bổ sung kiểu dữ liệu cho Ca đặt (Slot)
export interface BookingSlot {
  id: number;
  booking_id: number;
  court_id: number;
  start_at: string;
  end_at: string;
  price_cents: number;
  court: {
    name: string;
  };
}

export interface Booking {
  id: number;
  total_cents: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'paid' | 'unpaid';
  created_at: string;
  
  user?: BookingUser;
  facility?: {
    name: string;
  };
  slots?: BookingSlot[];
}

export interface CreateBookingPayload {
  customer_phone: string;
  customer_name?: string;
  facility_id: number;
  court_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed'; 
  payment_method?: 'cash' | 'vnpay';
}

export interface BookedSlotDTO {
  court_id: number;
  court_name: string;
  start_time: string;
  end_time: string;
}