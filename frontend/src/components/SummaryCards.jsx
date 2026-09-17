import React from 'react';
import { DollarSign, Calendar, TrendingUp, Receipt } from 'lucide-react';

const SummaryCards = ({ summary, loading }) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const cards = [
    {
      id: 'stat-total-spent',
      label: 'Total Expenditures',
      value: formatCurrency(summary?.total_spent),
      meta: `${summary?.total_count || 0} recorded items`,
      icon: DollarSign,
      iconBg: 'rgba(99, 102, 241, 0.15)',
      iconColor: '#818cf8',
    },
    {
      id: 'stat-month-spent',
      label: 'This Month',
      value: formatCurrency(summary?.current_month_spent),
      meta: `${summary?.current_month_count || 0} this month`,
      icon: Calendar,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#34d399',
    },
    {
      id: 'stat-avg-spent',
      label: 'Average Expense',
      value: formatCurrency(summary?.average_expense),
      meta: 'Per transaction',
      icon: TrendingUp,
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#fbbf24',
    },
    {
      id: 'stat-max-spent',
      label: 'Highest Expense',
      value: formatCurrency(summary?.highest_expense),
      meta: 'Single peak transaction',
      icon: Receipt,
      iconBg: 'rgba(236, 72, 153, 0.15)',
      iconColor: '#f472b6',
    },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} id={card.id} className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: card.iconBg, color: card.iconColor }}
            >
              <IconComponent size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">
                {loading ? '...' : card.value}
              </div>
              <div className="stat-meta">{card.meta}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
