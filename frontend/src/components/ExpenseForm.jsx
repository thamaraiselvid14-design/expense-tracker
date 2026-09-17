import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, X, Loader2 } from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Food',
  'Shopping',
  'Travel',
  'Bills',
  'Health',
  'Other',
];

const PAYMENT_OPTIONS = [
  'Cash',
  'UPI',
  'Card',
  'Bank Transfer',
];

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const defaultFormValues = {
  title: '',
  amount: '',
  category: 'Food',
  date: getTodayDateString(),
  payment_method: 'Card',
  description: '',
};

const ExpenseForm = ({ initialData = null, onSubmit, onCancel }) => {
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState(defaultFormValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        category: initialData.category || 'Food',
        date: initialData.date || getTodayDateString(),
        payment_method: initialData.payment_method || 'Card',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        ...defaultFormValues,
        date: getTodayDateString(),
      });
    }
    setErrors({});
  }, [initialData]);

  /**
   * Client-side validation:
   * Returns false and blocks form submission if any constraint is violated.
   */
  const validate = () => {
    const newErrors = {};
    const trimmedTitle = formData.title ? formData.title.trim() : '';

    // 1. Title validation: required, non-empty, non-whitespace, max 100 chars
    if (!trimmedTitle) {
      newErrors.title = 'Title is required and cannot be blank or whitespace-only.';
    } else if (trimmedTitle.length > 100) {
      newErrors.title = 'Title must be 100 characters or fewer.';
    }

    // 2. Amount validation: required, positive number strictly > 0
    if (!formData.amount || String(formData.amount).trim() === '') {
      newErrors.amount = 'Amount is required.';
    } else {
      const numAmount = parseFloat(formData.amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Amount must be a positive number greater than 0.';
      }
    }

    // 3. Category validation: required and in allowed choices
    if (!formData.category || !CATEGORY_OPTIONS.includes(formData.category)) {
      newErrors.category = 'Please select a valid category from the allowed choices.';
    }

    // 4. Payment Method validation: required and in allowed choices
    if (!formData.payment_method || !PAYMENT_OPTIONS.includes(formData.payment_method)) {
      newErrors.payment_method = 'Please select a valid payment method from the allowed choices.';
    }

    // 5. Date validation: required, valid date, no future dates
    if (!formData.date) {
      newErrors.date = 'Date is required.';
    } else {
      const today = getTodayDateString();
      if (formData.date > today) {
        newErrors.date = 'Date cannot be in the future.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // BLOCK submission if client-side validation fails
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        amount: parseFloat(Number(formData.amount).toFixed(2)),
        category: formData.category,
        date: formData.date,
        payment_method: formData.payment_method,
        description: formData.description ? formData.description.trim() : '',
      };

      await onSubmit(payload, initialData?.id);

      if (!isEditing) {
        setFormData({
          ...defaultFormValues,
          date: getTodayDateString(),
        });
      }
      setErrors({});
    } catch (err) {
      console.error('Expense form submission error from backend:', err);
      const serverData = err.response?.data;
      if (serverData && typeof serverData === 'object') {
        const fieldErrors = {};
        for (const [key, msg] of Object.entries(serverData)) {
          if (key === 'detail' || key === 'non_field_errors') {
            fieldErrors.form = Array.isArray(msg) ? msg.join(' ') : String(msg);
          } else {
            fieldErrors[key] = Array.isArray(msg) ? msg.join(' ') : String(msg);
          }
        }
        setErrors(fieldErrors);
      } else {
        setErrors({
          form: err.message || 'Could not save expense. Please check your inputs and try again.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel form-card" id="expense-form-container" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isEditing ? <Save size={20} color="#818cf8" /> : <PlusCircle size={20} color="#10b981" />}
          {isEditing ? 'Edit Expense Record' : 'Add New Expense'}
        </h3>
        {isEditing && (
          <span className="pill" style={{ borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818cf8' }}>
            Editing ID #{initialData.id}
          </span>
        )}
      </div>

      {errors.form && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            color: '#fb7185',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}
          id="expense-form-server-error"
        >
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Title Field */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="expense-title" className="form-label">
            Title / Merchant *
          </label>
          <input
            id="expense-title"
            name="title"
            type="text"
            className="form-input"
            placeholder="e.g. Lunch, Grocery Shopping, Electricity Bill"
            value={formData.title}
            onChange={handleChange}
            maxLength={100}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <span className="form-error" id="title-error">{errors.title}</span>}
        </div>

        {/* Amount & Date Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label htmlFor="expense-amount" className="form-label">
              Amount (₹) *
            </label>
            <input
              id="expense-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              aria-invalid={Boolean(errors.amount)}
            />
            {errors.amount && <span className="form-error" id="amount-error">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="expense-date" className="form-label">
              Date *
            </label>
            <input
              id="expense-date"
              name="date"
              type="date"
              max={getTodayDateString()}
              className="form-input"
              value={formData.date}
              onChange={handleChange}
              aria-invalid={Boolean(errors.date)}
            />
            {errors.date && <span className="form-error" id="date-error">{errors.date}</span>}
          </div>
        </div>

        {/* Category & Payment Method Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label htmlFor="expense-category" className="form-label">
              Category *
            </label>
            <select
              id="expense-category"
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <span className="form-error" id="category-error">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="expense-payment-method" className="form-label">
              Payment Method *
            </label>
            <select
              id="expense-payment-method"
              name="payment_method"
              className="form-select"
              value={formData.payment_method}
              onChange={handleChange}
            >
              {PAYMENT_OPTIONS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {errors.payment_method && (
              <span className="form-error" id="payment-method-error">{errors.payment_method}</span>
            )}
          </div>
        </div>

        {/* Description Field */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="expense-description" className="form-label">
            Description (Optional)
          </label>
          <textarea
            id="expense-description"
            name="description"
            className="form-textarea"
            placeholder="Add receipt notes, purpose, or additional details..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          {isEditing && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={submitting}
              id="cancel-edit-btn"
            >
              <X size={16} />
              Cancel Edit
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            id="submit-expense-btn"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              <>
                <Save size={16} />
                Update Expense
              </>
            ) : (
              <>
                <PlusCircle size={16} />
                Add Expense
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
