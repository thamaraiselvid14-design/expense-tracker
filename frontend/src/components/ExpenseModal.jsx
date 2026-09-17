import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/categories';

const ExpenseModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const isEditing = Boolean(initialData && initialData.id);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    payment_method: 'Card',
    date: getTodayString(),
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        category: initialData.category || 'Food',
        payment_method: initialData.payment_method || 'Card',
        date: initialData.date || getTodayString(),
        description: initialData.description || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: 'Food',
        payment_method: 'Card',
        date: getTodayString(),
        description: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    const trimmedTitle = (formData.title || '').trim();
    if (!trimmedTitle) {
      errs.title = 'Title is required and cannot be blank or whitespace-only.';
    } else if (trimmedTitle.length > 100) {
      errs.title = 'Title must be 100 characters or fewer.';
    }

    if (formData.amount === '' || formData.amount === null || formData.amount === undefined) {
      errs.amount = 'Amount is required.';
    } else {
      const numAmount = parseFloat(formData.amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        errs.amount = 'Amount must be a positive number greater than 0.';
      }
    }

    if (!formData.date) {
      errs.date = 'Date is required.';
    } else if (formData.date > getTodayString()) {
      errs.date = 'Date cannot be in the future.';
    }

    const validCategories = CATEGORIES.filter((c) => c !== 'All');
    if (!formData.category || !validCategories.includes(formData.category)) {
      errs.category = 'Please select a valid category from the allowed choices.';
    }

    if (!formData.payment_method || !PAYMENT_METHODS.includes(formData.payment_method)) {
      errs.payment_method = 'Please select a valid payment method from the allowed choices.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        amount: parseFloat(Number(formData.amount).toFixed(2)),
        category: formData.category,
        payment_method: formData.payment_method,
        date: formData.date,
        description: formData.description ? formData.description.trim() : '',
      };

      await onSave(payload, initialData?.id);
      onClose();
    } catch (err) {
      console.error('Error saving expense:', err);
      const serverErrors = err.response?.data;
      if (serverErrors && typeof serverErrors === 'object') {
        const fieldErrs = {};
        for (const [k, v] of Object.entries(serverErrors)) {
          fieldErrs[k] = Array.isArray(v) ? v.join(' ') : String(v);
        }
        setErrors(fieldErrs);
      } else {
        setErrors({
          submit: 'Failed to save expense. Please check your inputs and try again.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        id="expense-modal-card"
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Edit Expense Record' : 'Record New Expense'}
          </h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  color: '#fb7185',
                  fontSize: '0.85rem',
                }}
              >
                {errors.submit}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="expense-title-input" className="form-label">
                Expense Title / Merchant *
              </label>
              <input
                id="expense-title-input"
                type="text"
                maxLength={100}
                className="form-input"
                placeholder="e.g. Whole Foods Groceries, Train ticket"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                autoFocus
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="expense-amount-input" className="form-label">
                  Amount ($ USD) *
                </label>
                <input
                  id="expense-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
                {errors.amount && (
                  <span className="form-error">{errors.amount}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="expense-date-input" className="form-label">
                  Transaction Date *
                </label>
                <input
                  id="expense-date-input"
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
                {errors.date && <span className="form-error">{errors.date}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="expense-category-select" className="form-label">
                  Category *
                </label>
                <select
                  id="expense-category-select"
                  className="form-select"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {CATEGORIES.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="form-error">{errors.category}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="expense-payment-select" className="form-label">
                  Payment Method *
                </label>
                <select
                  id="expense-payment-select"
                  className="form-select"
                  value={formData.payment_method}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_method: e.target.value })
                  }
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                {errors.payment_method && (
                  <span className="form-error">{errors.payment_method}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="expense-desc-input" className="form-label">
                Notes / Description (Optional)
              </label>
              <textarea
                id="expense-desc-input"
                className="form-textarea"
                placeholder="Additional details, itemized info, or receipt notes..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
              id="cancel-expense-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="save-expense-btn"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
