import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Wallet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../api/expenseApi';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ConfirmDialog from '../components/ConfirmDialog';

/**
 * Format error response into clean, human-readable message instead of raw stack trace.
 * e.g., "Could not save expense: Title is required."
 */
const formatApiErrorMessage = (err, action = 'save expense') => {
  if (!err) return `Could not ${action}.`;

  const serverData = err.response?.data;
  if (serverData) {
    if (typeof serverData === 'string') {
      return `Could not ${action}: ${serverData}`;
    }
    if (serverData.detail) {
      return `Could not ${action}: ${serverData.detail}`;
    }
    if (typeof serverData === 'object') {
      const messages = [];
      for (const [field, errorVal] of Object.entries(serverData)) {
        const errorText = Array.isArray(errorVal) ? errorVal.join(', ') : String(errorVal);
        const formattedField = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
        messages.push(`${formattedField}: ${errorText}`);
      }
      if (messages.length > 0) {
        return `Could not ${action}: ${messages.join(' ')}`;
      }
    }
  }

  if (err.message) {
    return `Could not ${action}: ${err.message}`;
  }

  return `Could not ${action}: An unexpected error occurred.`;
};

const Dashboard = () => {
  // Main data state
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(true);

  // Form editing state
  const [editingExpense, setEditingExpense] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filter & search state (query parameters)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Notification state
  const [notification, setNotification] = useState(null);
  const [apiErrorBanner, setApiErrorBanner] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Fetch expenses from API with query params (?category=..., ?search=...)
  const fetchExpenses = useCallback(async (cat = selectedCategory, search = searchQuery) => {
    try {
      setLoading(true);
      setApiErrorBanner(null);

      const params = {};
      if (cat && cat !== 'All') {
        params.category = cat;
      }
      if (search && search.trim() !== '') {
        params.search = search.trim();
      }

      const res = await getExpenses(params);
      setExpenses(res.data);
      setApiConnected(true);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setApiConnected(false);
      const msg = formatApiErrorMessage(err, 'load expenses');
      setApiErrorBanner(msg);
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // Initial load
  useEffect(() => {
    fetchExpenses(selectedCategory, searchQuery);
  }, []);

  // Debounced search / filter watcher
  const searchDebounceTimer = useRef(null);
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    searchDebounceTimer.current = setTimeout(() => {
      fetchExpenses(selectedCategory, query);
    }, 300);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchExpenses(category, searchQuery);
  };

  // 1 & 2. Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (payload, id) => {
    setApiErrorBanner(null);
    try {
      if (id) {
        // 3. Edit mode: call PUT/PATCH and update that row in place
        const res = await updateExpense(id, payload);
        const updatedItem = res.data;

        setExpenses((prev) =>
          prev.map((item) => (item.id === id ? updatedItem : item))
        );
        setEditingExpense(null);
        showNotification(`Expense "${updatedItem.title}" updated successfully!`, 'success');
      } else {
        // 2. Add mode: call POST and prepend the new expense to the list on success
        const res = await createExpense(payload);
        const newItem = res.data;

        setExpenses((prev) => [newItem, ...prev]);
        showNotification(`New expense "${newItem.title}" added successfully!`, 'success');
      }
    } catch (err) {
      const errorMsg = formatApiErrorMessage(err, id ? 'update expense' : 'save expense');
      setApiErrorBanner(errorMsg);
      showNotification(errorMsg, 'error');
      throw err; // Allow ExpenseForm to display inline field errors
    }
  };

  // 3. Trigger Edit mode
  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    const formElement = document.getElementById('expense-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  // 4. Trigger Delete confirmation
  const handleDeleteClick = (expense) => {
    setDeleteTarget(expense);
  };

  // 4. Confirm and execute Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteExpense(deleteTarget.id);
      const targetId = deleteTarget.id;
      const targetTitle = deleteTarget.title;

      // Remove row from list in place
      setExpenses((prev) => prev.filter((item) => item.id !== targetId));
      setDeleteTarget(null);
      showNotification(`Expense "${targetTitle}" deleted successfully.`, 'success');
    } catch (err) {
      const errorMsg = formatApiErrorMessage(err, 'delete expense');
      setApiErrorBanner(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className="toast-container"
          style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999 }}
        >
          <div className={`toast ${notification.type}`}>
            {notification.type === 'success' ? (
              <CheckCircle2 size={18} color="#10b981" />
            ) : (
              <AlertCircle size={18} color="#f43f5e" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="brand-wrapper">
          <div className="brand-icon-box">
            <Wallet size={26} />
          </div>
          <div>
            <h1 className="brand-title">Expense Tracker</h1>
            <p className="brand-subtitle">
              End-to-End Financial Management &bull; React + Vite &bull; Django REST Framework
            </p>
          </div>
        </div>

        <div className="header-actions">
          <div
            className="status-badge"
            style={{
              backgroundColor: apiConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: apiConnected ? '#10b981' : '#f87171',
              border: `1px solid ${apiConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
            }}
          >
            <span
              className="status-dot"
              style={{
                backgroundColor: apiConnected ? '#10b981' : '#ef4444',
                boxShadow: apiConnected ? '0 0 10px #10b981' : '0 0 10px #ef4444',
              }}
            ></span>
            <span>{apiConnected ? 'Django API Connected (localhost:8000)' : 'Backend API Offline'}</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchExpenses(selectedCategory, searchQuery)}
            title="Refresh expenses list"
            id="refresh-list-btn"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </header>

      {/* Persistent Error Banner (if error occurs) */}
      {apiErrorBanner && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.9rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
          id="api-error-banner"
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{apiErrorBanner}</span>
        </div>
      )}

      {/* Main Two-Column Interactive View */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Add / Edit Expense Form */}
        <div>
          <ExpenseForm
            initialData={editingExpense}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelEdit}
          />
        </div>

        {/* Right Column: Filter Controls + Expenses List */}
        <div style={{ minWidth: 0 }}>
          <ExpenseList
            expenses={expenses}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Expense Record"
        message={
          deleteTarget ? (
            <p>
              Are you sure you want to delete{' '}
              <strong style={{ color: 'var(--text-main)' }}>"{deleteTarget.title}"</strong>{' '}
              for <strong style={{ color: '#818cf8' }}>₹{Number(deleteTarget.amount).toFixed(2)}</strong>? This action cannot be undone.
            </p>
          ) : null
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Dashboard;
