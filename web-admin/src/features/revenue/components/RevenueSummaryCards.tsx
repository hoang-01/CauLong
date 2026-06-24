import React from 'react';
import { Card } from 'antd';
import {
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  AccountBookOutlined
} from '@ant-design/icons';
import type { RevenueSummary } from '../types/revenue.types';

interface RevenueSummaryCardsProps {
  data: RevenueSummary | null;
  loading: boolean;
}

export const RevenueSummaryCards: React.FC<RevenueSummaryCardsProps> = ({ data, loading }) => {
  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(cents || 0);
  };

  const totalRevenue = data?.total_amount_cents ?? 0;
  const totalTransactions = data?.total_transactions ?? 0;
  const cashRevenue = data?.cash_amount_cents ?? 0;
  const vnpayRevenue = data?.vnpay_amount_cents ?? 0;

  const cardsConfig = [
    {
      title: 'Tổng doanh thu',
      value: formatMoney(totalRevenue),
      icon: <DollarOutlined className="text-2xl text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Tổng số giao dịch',
      value: (totalTransactions).toLocaleString('vi-VN') + ' GD',
      icon: <CalendarOutlined className="text-2xl text-green-600" />,
      bgColor: 'bg-green-50',
    },
    {
      title: 'Doanh thu tiền mặt',
      value: formatMoney(cashRevenue),
      icon: <AccountBookOutlined className="text-2xl text-amber-600" />,
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Doanh thu VNPay',
      value: formatMoney(vnpayRevenue),
      icon: <CreditCardOutlined className="text-2xl text-cyan-600" />,
      bgColor: 'bg-cyan-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cardsConfig.map((card, idx) => (
        <Card
          key={idx}
          bordered={false}
          loading={loading}
          className="shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <div className="text-gray-500 text-sm font-medium mb-1 truncate">{card.title}</div>
              <div className="text-2xl font-bold text-gray-800 truncate">
                {loading ? '...' : card.value}
              </div>
            </div>
            <div className={`p-3 rounded-full flex-shrink-0 ${card.bgColor}`}>
              {card.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
