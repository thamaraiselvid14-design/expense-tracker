import React from 'react';
import { Edit2, Trash2, Calendar, Tag, CreditCard } from 'lucide-react';
import { getCategoryStyle } from '../utils/categories';

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const { id, title, amount, category, payment_method, date, description } = expense;
  const categoryStyle = getCategoryStyle(category);

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="expense-card" id={`expense-card-${id}`}>
      <div>
        <div className="expense-card-top">
          <div>
            <h4 className="expense-title">{title}</h4>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
              <div
                className="expense-category-pill"
                style={{
                  backgroundColor: categoryStyle.bg,
                  color: categoryStyle.color,
                  border: `1px solid ${categoryStyle.border}`,
                  margin: 0,
                }}
              >
                <Tag size={12} />
                <span>{category}</span>
              </div>
              {payment_method && (
                <div
                  className="expense-category-pill"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    margin: 0,
                  }}
                >
                  <CreditCard size={12} />
                  <span>{payment_method}</span>
                </div>
              )}
            </div>
          </div>
          <div className="expense-amount">
            ${Number(amount).toFixed(2)}
          </div>
        </div>

        {description && <p className="expense-desc">{description}</p>}
      </div>

      <div className="expense-card-bottom">
        <div className="expense-date" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={13} />
          <span>{formattedDate}</span>
        </div>

        <div className="expense-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={() => onEdit(expense)}
            title="Edit Expense"
            aria-label={`Edit ${title}`}
            id={`edit-expense-${id}`}
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => onDelete(expense)}
            title="Delete Expense"
            aria-label={`Delete ${title}`}
            id={`delete-expense-${id}`}
            style={{ color: '#fb7185' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
