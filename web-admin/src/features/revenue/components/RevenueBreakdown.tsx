import React from 'react';
import { Card, Progress, Empty, Tag } from 'antd';
import type { RevenueBreakdownResponse } from '../types/revenue.types';

interface RevenueBreakdownProps {
  data: RevenueBreakdownResponse | null;
  loading: boolean;
}

export const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({ data, loading }) => {
  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(cents || 0);
  };

  const providerBreakdown = React.useMemo(() => {
    if (!data || !data.by_provider) {
      return {
        cash: { amount: 0, count: 0, pct: 0 },
        vnpay: { amount: 0, count: 0, pct: 0 },
        total: 0,
      };
    }
    
    let cashAmount = 0;
    let cashCount = 0;
    let vnpayAmount = 0;
    let vnpayCount = 0;

    data.by_provider.forEach((item) => {
      if (item.provider === 'cash') {
        cashAmount = item.total_amount_cents;
        cashCount = item.total_transactions;
      } else if (item.provider === 'vnpay') {
        vnpayAmount = item.total_amount_cents;
        vnpayCount = item.total_transactions;
      }
    });

    const totalAmount = cashAmount + vnpayAmount;
    const cashPct = totalAmount > 0 ? Math.round((cashAmount / totalAmount) * 100) : 0;
    const vnpayPct = totalAmount > 0 ? 100 - cashPct : 0;

    return {
      cash: { amount: cashAmount, count: cashCount, pct: cashPct },
      vnpay: { amount: vnpayAmount, count: vnpayCount, pct: vnpayPct },
      total: totalAmount,
    };
  }, [data]);

  const hasData = providerBreakdown.total > 0;

  return (
    <Card
      title="Cấu trúc doanh thu (Theo cổng thanh toán)"
      bordered={false}
      className="shadow-sm border border-gray-100 h-full"
      loading={loading}
    >
      {!hasData ? (
        <div className="py-12 flex justify-center items-center h-full">
          <Empty description="Không có dữ liệu phân tích tỷ lệ" />
        </div>
      ) : (
        <div className="flex flex-col gap-6 py-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">
                <Tag color="gold">Tiền mặt</Tag> ({providerBreakdown.cash.count} giao dịch)
              </span>
              <span className="font-bold text-gray-800">
                {formatMoney(providerBreakdown.cash.amount)} ({providerBreakdown.cash.pct}%)
              </span>
            </div>
            <Progress
              percent={providerBreakdown.cash.pct}
              strokeColor="#d4b106"
              trailColor="#f5f5f5"
              strokeWidth={12}
              showInfo={false}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">
                <Tag color="cyan">VNPay (QR)</Tag> ({providerBreakdown.vnpay.count} giao dịch)
              </span>
              <span className="font-bold text-gray-800">
                {formatMoney(providerBreakdown.vnpay.amount)} ({providerBreakdown.vnpay.pct}%)
              </span>
            </div>
            <Progress
              percent={providerBreakdown.vnpay.pct}
              strokeColor="#13c2c2"
              trailColor="#f5f5f5"
              strokeWidth={12}
              showInfo={false}
            />
          </div>
        </div>
      )}
    </Card>
  );
};
