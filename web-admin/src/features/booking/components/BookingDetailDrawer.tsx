import React from 'react';
import { Drawer, Descriptions, Divider, Tag, List, Typography } from 'antd';
import type { Booking } from '../types/booking.types';

const { Text } = Typography;

interface BookingDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({ open, onClose, booking }) => {
  
  // Hàm format ngày giờ ra chuẩn Việt Nam
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <Drawer
      title={`Chi tiết đơn hàng #${booking?.id || ''}`}
      placement="right"
      width={500}
      onClose={onClose}
      open={open}
    >
      {booking && (
        <div>
          {/* 1. THÔNG TIN KHÁCH HÀNG */}
          <Descriptions title="Thông tin Khách hàng" column={1} bordered size="small">
            <Descriptions.Item label="Họ tên">{booking.user?.full_name || 'Khách vãng lai'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{booking.user?.phone || 'Chưa cập nhật'}</Descriptions.Item>
            <Descriptions.Item label="Email">{booking.user?.email || 'N/A'}</Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 2. THÔNG TIN ĐƠN HÀNG */}
          <Descriptions title="Thông tin Đơn hàng" column={1} bordered size="small">
            <Descriptions.Item label="Cơ sở đặt">
              <Text strong>{booking.facility?.name || 'N/A'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo đơn">
              {formatDateTime(booking.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái đơn">
              <Tag color={booking.status === 'confirmed' ? 'green' : 'blue'}>
                {booking.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán">
              <Tag color={booking.payment_status === 'paid' ? 'success' : 'warning'}>
                {booking.payment_status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <span className="text-lg font-bold text-red-500">
                {booking.total_cents.toLocaleString('vi-VN')} VNĐ
              </span>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 3. CHI TIẾT CA ĐẶT SÂN (SLOTS) */}
          <Typography.Title level={5}>Chi tiết Sân / Khung giờ</Typography.Title>
          <List
            itemLayout="horizontal"
            dataSource={booking.slots || []}
            renderItem={(slot) => (
              <List.Item>
                <List.Item.Meta
                  title={<Text className="text-blue-600 font-semibold">{slot.court?.name}</Text>}
                  description={
                    <div>
                      <div>Thời gian: <b>{formatDateTime(slot.start_at)}</b> - <b>{formatDateTime(slot.end_at)}</b></div>
                      <div>Giá ca này: <Text type="danger">{slot.price_cents.toLocaleString('vi-VN')} đ</Text></div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </Drawer>
  );
};

export default BookingDetailDrawer;