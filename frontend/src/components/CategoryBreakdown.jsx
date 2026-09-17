import React from 'react';
import { PieChart } from 'lucide-react';
import { getCategoryStyle } from '../utils/categories';

const CategoryBreakdown = ({ breakdown = [], totalSpent = 0 }) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="glass-panel category-card" id="category-breakdown-panel">
      <div className="category-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <PieChart size={20} color="#818cf8" />
          <h3 className="section-title">Spending by Category</h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {breakdown.length} active categories
        </span>
      </div>

      {breakdown.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
          No categorized expenses yet.
        </div>
      ) : (
        <div className="category-list">
          {breakdown.map((item) => {
            const style = getCategoryStyle(item.category);
            return (
              <div key={item.category} className="category-item">
                <div className="category-item-top">
                  <div className="category-info">
                    <span
                      className="category-color-dot"
                      style={{ backgroundColor: style.color }}
                    ></span>
                    <span>{item.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      ({item.count})
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="category-amount">
                      {formatCurrency(item.total)}
                    </span>
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                <div className="category-bar-bg">
                  <div
                    className="category-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: style.color,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryBreakdown;
