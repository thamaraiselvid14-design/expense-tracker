import React from 'react';
import { Edit2, Trash2, Calendar, CreditCard, DollarSign, Inbox, Search, Filter, X } from 'lucide-react';
import { getCategoryStyle, CATEGORIES } from '../utils/categories';

const ExpenseList = ({
  expenses = [],
  onEdit,
  onDelete,
  loading = false,
  searchQuery = '',
  onSearchChange,
  selectedCategory = 'All',
  onCategoryChange,
}) => {
  // Compute running total of currently listed expenses
  const runningTotal = expenses.reduce((acc, curr) => {
    const amt = parseFloat(curr.amount);
    return acc + (isNaN(amt) ? 0 : amt);
  }, 0);

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toFixed(2)}`;
  };

  const hasActiveFilters = searchQuery.trim() !== '' || (selectedCategory && selectedCategory !== 'All');

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }} id="expense-list-container">
      {/* Top Header: Title & Dynamic Running Total */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1.25rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <h3 className="section-title">Expense Records</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {expenses.length} {expenses.length === 1 ? 'transaction' : 'transactions'} displayed
          </p>
        </div>

        {/* Running Total Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
          id="running-total-badge"
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={18} />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.725rem',
                color: '#cbd5e1',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Running Total
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc', lineHeight: 1.1 }}>
              {formatCurrency(runningTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '1.5rem',
          background: 'rgba(15, 23, 42, 0.5)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
        id="list-filter-controls"
      >
        {/* Search by Title */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{
              paddingLeft: '2.4rem',
              paddingTop: '0.55rem',
              paddingBottom: '0.55rem',
              fontSize: '0.875rem',
            }}
            placeholder="Search by title (e.g. lunch, bill)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="search-by-title-input"
          />
        </div>

        {/* Category Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{
              paddingTop: '0.55rem',
              paddingBottom: '0.55rem',
              fontSize: '0.875rem',
              minWidth: '140px',
            }}
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            id="category-filter-select"
            aria-label="Filter expenses by category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem' }}
            onClick={() => {
              onSearchChange('');
              onCategoryChange('All');
            }}
            id="clear-filters-btn"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Loading state indicator */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }} id="loading-indicator">
          <div
            style={{
              display: 'inline-block',
              width: '28px',
              height: '28px',
              border: '3px solid rgba(99, 102, 241, 0.2)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '0.75rem',
            }}
          ></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '0.9rem' }}>Loading expenses from API...</p>
        </div>
      ) : expenses.length === 0 ? (
        /* Empty state */
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
          }}
          id="empty-expense-notice"
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: 'var(--text-dim)',
            }}
          >
            <Inbox size={28} />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            {hasActiveFilters ? 'No matching expenses found' : 'No expenses recorded yet'}
          </h4>
          <p style={{ fontSize: '0.875rem', maxWidth: '360px', margin: '0 auto' }}>
            {hasActiveFilters
              ? 'Try adjusting your search keyword or clearing the category filter.'
              : 'Fill out the form on the left to record your first transaction.'}
          </p>
        </div>
      ) : (
        /* Table View */
        <div className="table-container">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title & Description</th>
                <th>Category</th>
                <th>Payment</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => {
                const catStyle = getCategoryStyle(expense.category);
                const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <tr key={expense.id} id={`expense-row-${expense.id}`}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-dim)', fontSize: '0.825rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.925rem' }}>
                        {expense.title}
                      </div>
                      {expense.description && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.2rem',
                            lineHeight: 1.3,
                            maxWidth: '340px',
                          }}
                        >
                          {expense.description}
                        </div>
                      )}
                    </td>

                    <td>
                      <span
                        className="expense-category-pill"
                        style={{
                          backgroundColor: catStyle.bg,
                          color: catStyle.color,
                          border: `1px solid ${catStyle.border}`,
                          fontWeight: '600',
                          fontSize: '0.75rem',
                        }}
                      >
                        {expense.category}
                      </span>
                    </td>

                    <td>
                      <span
                        className="expense-category-pill"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <CreditCard size={12} />
                        {expense.payment_method}
                      </span>
                    </td>

                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: '800',
                        color: '#818cf8',
                        fontSize: '1.05rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ₹{Number(expense.amount).toFixed(2)}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          gap: '0.4rem',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => onEdit(expense)}
                          title={`Edit ${expense.title}`}
                          aria-label={`Edit ${expense.title}`}
                          id={`edit-btn-${expense.id}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => onDelete(expense)}
                          title={`Delete ${expense.title}`}
                          aria-label={`Delete ${expense.title}`}
                          id={`delete-btn-${expense.id}`}
                          style={{ color: '#fb7185' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
