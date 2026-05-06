import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import LoginPage from '../features/auth/components/login';
import BookingPage from '../features/booking/components/BookingPage';

// (Tạm thời mock các component để test, sau này em sẽ import từ thư mục features)
const DashboardPage = () => <div>Trang Tổng quan (Thống kê doanh thu)</div>;

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true, // index = path '/'
        element: <DashboardPage />,
      },
      {
        path: 'booking',
        element: <BookingPage />,
      },
      {
        path: 'products',
        element: <div>Trang Hàng hóa (W2 code ở đây)</div>,
      },
      {
        path: 'staff',
        element: <div>Trang Nhân viên</div>,
      },
    ],
  },
]);