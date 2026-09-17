import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Download,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wallet,
  ArrowUpDown,
  Tag,
  Edit2,
  Trash2,
} from 'lucide-react';
import { expenseAPI } from '../api/axios';
import SummaryCards from '../components/SummaryCards';
import CategoryBreakdown from '../components/CategoryBreakdown';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseModal from '../components/ExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { CATEGORIES, getCategoryStyle } from '../utils/categories';

const SAMPLE_EXPENSES = [
  {
    title: 'Whole Foods Grocery Haul',
    amount: 82.45,
    category: 'Food',
    payment_method: 'Card',
    date: new Date().toISOString().split('T')[0],
    description: 'Weekly organic vegetables, fruits, and pantry staples',
  },
  {
    title: 'Fiber Internet Subscription',
    amount: 69.99,
    category: 'Bills',
    payment_method: 'Bank Transfer',
    date: new Date().toISOString().split('T')[0],
    description: 'High-speed 1Gbps internet service monthly billing',
  },
  {
    title: 'Metro Commuter Pass',
    amount: 45.00,
    category: 'Travel',
    payment_method: 'UPI',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    description: 'Monthly rail and bus transit pass',
  },
  {
    title: 'Noise-Cancelling Headphones',
    amount: 199.99,
    category: 'Shopping',
    payment_method: 'Card',
    date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    description: 'Wireless ANC headphones for remote work setup',
  },
  {
    title: 'Dental Checkup & Cleaning',
    amount: 120.00,
    category: 'Health',
    payment_method: 'Card',
    date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    description: 'Annual routine preventive checkup',
  },
  {
    title: 'Book Club Supplies',
    amount: 28.50,
    category: 'Other',
    payment_method: 'Cash',
    date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    description: 'Hardcover fiction and meeting tea',
  },
];

const DashboardPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [ordering, setOrdering] = useState('-date');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals & Operations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch Summary Analytics
  const fetchSummary = useCallback(async () => {
    try {
      const res = await expenseAPI.getSummary();
      setSummary(res.data);
      setBackendStatus('connected');
    } catch (err) {
      console.warn('Error fetching summary analytics:', err);
    }
  }, []);

  // Fetch Expenses List
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (ordering) {
        params.ordering = ordering;
      }

      const res = await expenseAPI.getAllExpenses(params);
      setExpenses(res.data);
      setBackendStatus('connected');
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setBackendStatus('error');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, ordering]);

  // Initial load and filter sync
  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, [fetchExpenses, fetchSummary]);

  // Handle Save (Create or Edit)
  const handleSaveExpense = async (payload, id) => {
    if (id) {
      await expenseAPI.updateExpense(id, payload);
      addToast('Expense updated successfully!', 'success');
    } else {
      await expenseAPI.createExpense(payload);
      addToast('New expense recorded successfully!', 'success');
    }
    await fetchExpenses();
    await fetchSummary();
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await expenseAPI.deleteExpense(deleteTarget.id);
      addToast(`Expense "${deleteTarget.title}" deleted.`, 'success');
      await fetchExpenses();
      await fetchSummary();
    } catch (err) {
      console.error('Failed to delete expense:', err);
      addToast('Failed to delete expense.', 'error');
      throw err;
    }
  };

  // Seed sample data helper
  const handleSeedData = async () => {
    try {
      addToast('Adding sample records...', 'success');
      for (const item of SAMPLE_EXPENSES) {
        await expenseAPI.createExpense(item);
      }
      addToast('Sample expenses populated successfully!', 'success');
      await fetchExpenses();
      await fetchSummary();
    } catch (err) {
      console.error('Failed to seed expenses:', err);
      addToast('Error seeding sample data.', 'error');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      addToast('No expense records to export.', 'error');
      return;
    }

    const headers = ['ID', 'Title', 'Amount (USD)', 'Category', 'Payment Method', 'Date', 'Description'];
    const rows = expenses.map((exp) => [
      exp.id,
      `"${(exp.title || '').replace(/"/g, '""')}"`,
      Number(exp.amount).toFixed(2),
      `"${exp.category || ''}"`,
      `"${exp.payment_method || ''}"`,
      exp.date,
      `"${(exp.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `expenses_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV export downloaded!', 'success');
  };

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} color="#10b981" />
            ) : (
              <AlertCircle size={18} color="#f43f5e" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header Section */}
      <header className="header">
        <div className="brand-wrapper">
          <div className="brand-icon-box">
            <Wallet size={26} />
          </div>
          <div>
            <h1 className="brand-title">Expense Tracker</h1>
            <p className="brand-subtitle">
              Financial Control Center &bull; Django REST Framework & MySQL / SQLite
            </p>
          </div>
        </div>

        <div className="header-actions">
          <div
            className="status-badge"
            style={{
              backgroundColor:
                backendStatus === 'connected'
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              color: backendStatus === 'connected' ? '#10b981' : '#f87171',
              border: `1px solid ${
                backendStatus === 'connected'
                  ? 'rgba(16, 185, 129, 0.25)'
                  : 'rgba(239, 68, 68, 0.25)'
              }`,
            }}
          >
            <span
              className="status-dot"
              style={{
                backgroundColor: backendStatus === 'connected' ? '#10b981' : '#ef4444',
                boxShadow:
                  backendStatus === 'connected'
                    ? '0 0 10px #10b981'
                    : '0 0 10px #ef4444',
              }}
            ></span>
            <span>
              {backendStatus === 'connected'
                ? 'API Connected (localhost:8000)'
                : 'API Reconnecting...'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCSV}
            title="Download records as CSV"
            id="export-csv-btn"
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            id="add-expense-btn"
          >
            <Plus size={18} />
            Record Expense
          </button>
        </div>
      </header>

      {/* Top Analytical KPI Cards */}
      <SummaryCards summary={summary} loading={loading && !summary} />

      {/* Main Two-Column Interactive Dashboard Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Spending Distribution */}
        <aside>
          <CategoryBreakdown
            breakdown={summary?.category_breakdown || []}
            totalSpent={summary?.total_spent || 0}
          />

          {expenses.length === 0 && (
            <div
              className="glass-panel"
              style={{ padding: '1.4rem', marginTop: '1.25rem', textAlign: 'center' }}
            >
              <Sparkles size={24} color="#818cf8" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Need Test Data?
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Quickly populate realistic sample expenses to explore features.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.825rem' }}
                onClick={handleSeedData}
                id="seed-demo-data-btn"
              >
                Populate Sample Expenses
              </button>
            </div>
          )}
        </aside>

        {/* Right Column: Transactions Stream with Search & Filters */}
        <main>
          {/* Controls Toolbar */}
          <div className="glass-panel toolbar-panel">
            <div className="toolbar-top-row">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search expenses by title or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="expense-search-input"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                  className="select-input"
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                  id="sort-select"
                  aria-label="Sort expenses"
                >
                  <option value="-date">Date: Newest First</option>
                  <option value="date">Date: Oldest First</option>
                  <option value="-amount">Amount: Highest First</option>
                  <option value="amount">Amount: Lowest First</option>
                  <option value="title">Title: A to Z</option>
                </select>

                <div className="view-switch" role="group" aria-label="View toggle">
                  <button
                    type="button"
                    className={`view-switch-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid Card View"
                    aria-label="Grid Card View"
                    id="grid-view-btn"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    type="button"
                    className={`view-switch-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Compact Table View"
                    aria-label="Compact Table View"
                    id="table-view-btn"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="category-chips">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  id={`filter-chip-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Records Display */}
          {loading && expenses.length === 0 ? (
            <div className="empty-state">
              <p style={{ color: 'var(--text-muted)' }}>Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="empty-state" id="empty-state-view">
              <div className="empty-state-icon">
                <Wallet size={32} />
              </div>
              <h3 className="empty-state-title">No expenses found</h3>
              <p className="empty-state-desc">
                {searchQuery || selectedCategory !== 'All'
                  ? 'No expense matches your active filters. Try adjusting your search keyword or category.'
                  : 'Start tracking your financial transactions by creating your first expense entry.'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingExpense(null);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus size={16} /> Add Expense
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSeedData}
                >
                  <Sparkles size={16} /> Add Sample Data
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="expenses-grid" id="expenses-grid-view">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={(item) => {
                    setEditingExpense(item);
                    setIsModalOpen(true);
                  }}
                  onDelete={(item) => {
                    setDeleteTarget(item);
                    setIsDeleteModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="table-container" id="expenses-table-view">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title & Description</th>
                    <th>Category</th>
                    <th>Payment Method</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => {
                    const catStyle = getCategoryStyle(expense.category);
                    return (
                      <tr key={expense.id} id={`expense-row-${expense.id}`}>
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-dim)' }}>
                          {expense.date}
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                            {expense.title}
                          </div>
                          {expense.description && (
                            <div
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                marginTop: '0.2rem',
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
                            }}
                          >
                            <Tag size={11} />
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
                            }}
                          >
                            {expense.payment_method || '—'}
                          </span>
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: '700',
                            color: '#818cf8',
                            fontSize: '1rem',
                          }}
                        >
                          ${Number(expense.amount).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              gap: '0.4rem',
                              alignItems: 'center',
                            }}
                          >
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => {
                                setEditingExpense(expense);
                                setIsModalOpen(true);
                              }}
                              title="Edit Expense"
                              aria-label={`Edit ${expense.title}`}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => {
                                setDeleteTarget(expense);
                                setIsDeleteModalOpen(true);
                              }}
                              title="Delete Expense"
                              aria-label={`Delete ${expense.title}`}
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
        </main>
      </div>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        expenseTitle={deleteTarget?.title}
        expenseAmount={deleteTarget?.amount}
      />
    </div>
  );
};

export default DashboardPage;
