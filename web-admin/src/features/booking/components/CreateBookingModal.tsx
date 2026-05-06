import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, TimePicker, message, Row, Col, Divider, Alert, Tag, Spin } from 'antd';
import { BookingService } from '../services/booking.service';
import { FacilityService } from '../../facility/services/facility.service';
import { useAuthStore } from '../../auth/store/auth.store'; 
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../../types/api.type';
import type { BookedSlotDTO } from '../types/booking.types';
import { SearchOutlined } from '@ant-design/icons';

dayjs.extend(isBetween);

interface CreateBookingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchingPhone, setSearchingPhone] = useState(false);
  
  // STATES QUẢN LÝ DỮ LIỆU
  const [bookedSlots, setBookedSlots] = useState<BookedSlotDTO[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [facilityCourts, setFacilityCourts] = useState<any[]>([]); // Lưu toàn bộ sân của cơ sở
  const [availableCourtTypes, setAvailableCourtTypes] = useState<string[]>([]); // Lưu các loại sân (ko trùng lặp)
  const [courts, setCourts] = useState<any[]>([]); // Lưu sân đã lọc theo Loại sân để hiển thị Dropdown

  const { user } = useAuthStore();
  const staffFacilityId = (user as any)?.staff_profile?.facility_id;

  // THEO DÕI REAL-TIME
  const selectedDate = Form.useWatch('play_date', form);
  const selectedCourtId = Form.useWatch('court_id', form);
  const selectedFacilityId = Form.useWatch('facility_id', form);
  const selectedCourtType = Form.useWatch('court_type', form);

  // 1. KHI MỞ MODAL: Load danh sách Cơ sở
  useEffect(() => {
    if (open) {
      form.resetFields();
      FacilityService.getAllFacilities()
        .then(res => setFacilities(res.data))
        .catch(err => console.error("Lỗi lấy cơ sở:", err));

      if (staffFacilityId) {
        form.setFieldValue('facility_id', staffFacilityId);
      }
    }
  }, [open, staffFacilityId, form]);

  // 2. KHI ĐỔI CƠ SỞ -> KÉO DANH SÁCH SÂN VÀ TỰ ĐỘNG TÌM CÁC LOẠI SÂN
  useEffect(() => {
    if (selectedFacilityId) {
      // Reset các ô phụ thuộc
      form.setFieldValue('court_type', undefined);
      form.setFieldValue('court_id', undefined); 
      
      FacilityService.getCourtsByFacility(selectedFacilityId)
        .then(res => {
          // Lưu ý: Backend trả về { ..., courts: [...] } nên mảng sân nằm ở res.data.courts
          const courtsData = res.data.courts || [];
          setFacilityCourts(courtsData);

          // Thuật toán lấy danh sách Court Type độc nhất (Unique)
          // Set sẽ loại bỏ các giá trị trùng nhau
          const uniqueTypes = Array.from(new Set(courtsData.map((c: any) => c.court_type)));
          setAvailableCourtTypes(uniqueTypes as string[]);

          // UX Tối ưu: Nếu cơ sở đó chỉ có đúng 1 loại sân, tự động chọn luôn cho Lễ tân!
          if (uniqueTypes.length === 1) {
            form.setFieldValue('court_type', uniqueTypes[0]);
          }
        })
        .catch(err => console.error("Lỗi lấy sân:", err));
    } else {
      setFacilityCourts([]);
      setAvailableCourtTypes([]);
      setCourts([]);
    }
  }, [selectedFacilityId, form]);

  // 3. KHI ĐỔI LOẠI SÂN -> LỌC RA DANH SÁCH SÂN TƯƠNG ỨNG
  useEffect(() => {
    if (selectedCourtType && facilityCourts.length > 0) {
      form.setFieldValue('court_id', undefined); // Đổi loại sân thì phải chọn lại sân
      const filteredCourts = facilityCourts.filter(c => c.court_type === selectedCourtType);
      setCourts(filteredCourts);
    } else {
      setCourts([]);
    }
  }, [selectedCourtType, facilityCourts, form]);

  // 4. CHECK LỊCH TRỐNG 
  useEffect(() => {
    if (selectedDate && selectedFacilityId && selectedCourtType && open) {
      const fetchBookedSlots = async () => {
        try {
          const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
          const res = await BookingService.getDailySlots(selectedFacilityId, dateStr, selectedCourtType); 
          setBookedSlots(res.data || []);
        } catch (error) {
          console.error("Lỗi lấy lịch:", error);
        }
      };
      fetchBookedSlots();
    }
  }, [selectedDate, selectedFacilityId, selectedCourtType, open]);

  const currentCourtBookedSlots = bookedSlots.filter(slot => slot.court_id === selectedCourtId);

  const handlePhoneBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const phone = e.target.value.trim();
    // Bỏ qua nếu chưa nhập đủ số điện thoại cơ bản
    if (!phone || phone.length < 9) return; 

    try {
      setSearchingPhone(true);
      const res = await BookingService.getUserByPhone(phone);
      
      // Nếu API trả về user thành công
      if (res.data && res.data.full_name) {
        form.setFieldValue('full_name', res.data.full_name);
        message.success(`Đã tự động điền thông tin khách: ${res.data.full_name}`);
      }
    } catch (error: any) {
      // Nếu lỗi là 404 (Không tìm thấy), thì kệ nó, cho Lễ tân tự nhập tên mới
      if (error.response?.status !== 404) {
        console.error("Lỗi gọi API tìm SĐT:", error);
      } else {
        // Có thể reset ô tên nếu khách nhập số mới
        form.setFieldValue('full_name', undefined);
      }
    } finally {
      setSearchingPhone(false);
    }
  };

  // 5. VALIDATOR CHẶN TRÙNG LỊCH
  const checkOverlappingTime = (_: any, value: any) => {
    if (!value || !selectedCourtId || currentCourtBookedSlots.length === 0) return Promise.resolve();
    const startTime = form.getFieldValue('start_time');
    const endTime = form.getFieldValue('end_time');
    if (!startTime || !endTime) return Promise.resolve();

    const start = dayjs(startTime).format('HH:mm');
    const end = dayjs(endTime).format('HH:mm');

    const isOverlap = currentCourtBookedSlots.some(slot => {
      return (start < slot.end_time && end > slot.start_time);
    });

    if (isOverlap) return Promise.reject(new Error('Khung giờ này đã bị trùng khách khác!'));
    return Promise.resolve();
  };

  // Hàm helper để dịch chữ tiếng Anh sang tiếng Việt cho đẹp UI
  const formatCourtTypeLabel = (type: string) => {
    if (type === 'standard') return 'Sân Thường';
    if (type === 'vip') return 'Sân VIP';
    return type.toUpperCase(); // Nếu có loại mới thì in hoa lên
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        customer_phone: values.phone,
        customer_name: values.full_name,
        facility_id: values.facility_id,
        court_id: values.court_id,
        date: dayjs(values.play_date).format('YYYY-MM-DD'),
        start_time: dayjs(values.start_time).format('HH:mm'),
        end_time: dayjs(values.end_time).format('HH:mm'),
        status: 'confirmed'as const,
        payment_method: 'cash' as const
      };
      await BookingService.createBooking(payload);
      message.success('Tạo đơn đặt sân thành công!');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      message.error(err.message || 'Lỗi khi tạo đơn');
      console.log("err", err.message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo Đơn Đặt Sân Mới (Hotline/Vãng lai)"
      open={open}
      width={750}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Chốt Đơn"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        
        <Row gutter={16}>
          <Col span={12}>
           <Form.Item label="Số điện thoại Khách" name="phone" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}>
              <Input 
                placeholder="Gõ SĐT rồi bấm ra ngoài..." 
                onBlur={handlePhoneBlur} // Kích hoạt khi click ra khỏi ô
                onPressEnter={handlePhoneBlur}
                disabled={searchingPhone}
                suffix={searchingPhone ? <Spin size="small" /> : <SearchOutlined className="text-gray-400" />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Họ và tên" name="full_name">
              <Input placeholder="Nguyễn Văn A..." />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Row gutter={16}>
          <Col span={10}>
            <Form.Item label="Chọn Cơ Sở" name="facility_id" rules={[{ required: true }]}>
              <Select placeholder="-- Chọn cơ sở --" disabled={!!staffFacilityId}>
                {facilities.map(fac => (
                  <Select.Option key={fac.id} value={fac.id}>{fac.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            {/* RENDER ĐỘNG LOẠI SÂN DỰA TRÊN DỮ LIỆU CỦA CƠ SỞ ĐÓ */}
            <Form.Item label="Loại sân" name="court_type" rules={[{ required: true }]}>
              <Select placeholder="-- Chọn loại --" disabled={!selectedFacilityId || availableCourtTypes.length === 0}>
                {availableCourtTypes.map(type => (
                  <Select.Option key={type} value={type}>
                    {formatCourtTypeLabel(type)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Chọn Sân" name="court_id" rules={[{ required: true }]}>
              <Select placeholder="-- Chọn sân --" disabled={!selectedCourtType || courts.length === 0}>
                {courts.map(court => (
                  <Select.Option key={court.id} value={court.id}>{court.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Ngày chơi" name="play_date" rules={[{ required: true }]}>
              <DatePicker className="w-full" format="YYYY/MM/DD" disabledDate={(current) => current && current < dayjs().startOf('day')} />
            </Form.Item>
          </Col>
        </Row>

        {selectedCourtId && selectedDate && (
          <div className="mb-4">
            {currentCourtBookedSlots.length > 0 ? (
              <Alert 
                type="warning" 
                showIcon 
                message={<span className="font-semibold">Lưu ý: Sân này đã có khách đặt các ca sau:</span>}
                description={
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentCourtBookedSlots.map((slot, index) => (
                      <Tag color="red" key={index} className="text-sm">
                        {slot.start_time} - {slot.end_time}
                      </Tag>
                    ))}
                  </div>
                }
              />
            ) : (
              <Alert type="success" showIcon message="Sân này hiện đang trống cả ngày!" />
            )}
          </div>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="Giờ bắt đầu" 
              name="start_time"
              rules={[{ required: true, message: 'Chọn giờ bắt đầu!' }, { validator: checkOverlappingTime }]}
            >
              <TimePicker className="w-full" format="HH:mm" minuteStep={15} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="Giờ kết thúc" 
              name="end_time"
              dependencies={['start_time']}
              rules={[
                { required: true, message: 'Chọn giờ kết thúc!' },
                { validator: checkOverlappingTime },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('start_time') < value) return Promise.resolve();
                    return Promise.reject(new Error('Giờ kết thúc phải lớn hơn giờ bắt đầu!'));
                  },
                }),
              ]}
            >
              <TimePicker className="w-full" format="HH:mm" minuteStep={15} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateBookingModal;