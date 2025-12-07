import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit2, Trash2, Search, Filter, Receipt, TrendingDown, Calendar, X } from 'lucide-react';
import expenseService from '../services/expenseService';
import toast from 'react-hot-toast';
import { formatNumber, parseFormattedNumber, handleNumberInput } from '../utils/numberFormat';

const EXPENSE_CATEGORIES = {
  utilities: 'Utilitas',
  maintenance: 'Perawatan',
  supplies: 'Perlengkapan',
  internet: 'Internet',
  salary: 'Gaji',
  tax: 'Pajak',
  other: 'Lainnya',
};

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    category: 'utilities',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptUrl: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, monthFilter, yearFilter]);

  useEffect(() => {
    applyFilters();
  }, [expenses, searchQuery]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const filters = {};

      if (categoryFilter !== 'all') {
        filters.category = categoryFilter;
      }

      if (monthFilter !== 'all') {
        filters.month = monthFilter;
      }

      if (yearFilter !== 'all') {
        filters.year = yearFilter;
      }

      const data = await expenseService.getAllExpenses(filters);
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      toast.error('Gagal memuat data pengeluaran');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (expense) =>
          expense.description.toLowerCase().includes(query) ||
          EXPENSE_CATEGORIES[expense.category].toLowerCase().includes(query)
      );
    }

    setFilteredExpenses(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Format amount field with thousand separators
    if (name === 'amount') {
      const formattedValue = handleNumberInput(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: 'utilities',
      description: '',
      expenseDate: new Date().toISOString().split('T')[0],
      receiptUrl: '',
    });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.description || !formData.expenseDate) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    try {
      await expenseService.createExpense({
        ...formData,
        amount: parseFormattedNumber(formData.amount),
      });
      toast.success('Pengeluaran berhasil ditambahkan!');
      setShowAddModal(false);
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.error('Add expense error:', err);
      toast.error(err.message || 'Gagal menambahkan pengeluaran');
    }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.description || !formData.expenseDate) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    try {
      await expenseService.updateExpense(selectedExpense.id, {
        ...formData,
        amount: parseFormattedNumber(formData.amount),
      });
      toast.success('Pengeluaran berhasil diperbarui!');
      setShowEditModal(false);
      setSelectedExpense(null);
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.error('Edit expense error:', err);
      toast.error(err.message || 'Gagal memperbarui pengeluaran');
    }
  };

  const handleDeleteExpense = async (expense) => {
    if (!confirm(`Yakin ingin menghapus pengeluaran "${expense.description}"?`)) {
      return;
    }

    try {
      await expenseService.deleteExpense(expense.id);
      toast.success('Pengeluaran berhasil dihapus!');
      fetchExpenses();
    } catch (err) {
      console.error('Delete expense error:', err);
      toast.error(err.message || 'Gagal menghapus pengeluaran');
    }
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      amount: formatNumber(expense.amount),
      category: expense.category,
      description: expense.description,
      expenseDate: expense.expenseDate.split('T')[0],
      receiptUrl: expense.receiptUrl || '',
    });
    setShowEditModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return months[month - 1];
  };

  const getUniqueYears = () => {
    const years = [...new Set(expenses.map((e) => e.expenseYear))];
    return years.sort((a, b) => b - a);
  };

  const getStats = () => {
    const total = filteredExpenses.length;
    const totalAmount = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const byCategory = {};

    Object.keys(EXPENSE_CATEGORIES).forEach((cat) => {
      byCategory[cat] = filteredExpenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    });

    return { total, totalAmount, byCategory };
  };

  const stats = getStats();

  if (loading && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Memuat data pengeluaran...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Pengeluaran</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Receipt className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 sm:col-span-1 md:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Biaya</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Pengeluaran per Kategori</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-2 sm:p-3">
              <p className="text-xs text-gray-600 mb-1">{label}</p>
              <p className="text-xs sm:text-sm font-bold text-purple-600">
                {formatCurrency(stats.byCategory[key] || 0)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Add Button */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 flex-1">
            {/* Search */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Cari Pengeluaran
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Deskripsi atau kategori..."
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Semua Kategori</option>
                {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Bulan
              </label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Semua Bulan</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {getMonthName(month)}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Tahun
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Semua Tahun</option>
                {getUniqueYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="w-full md:w-auto bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-600">
              {searchQuery ? 'Tidak ada pengeluaran yang cocok dengan pencarian' : 'Belum ada pengeluaran'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-2">
                        {EXPENSE_CATEGORIES[expense.category]}
                      </span>
                      <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Tanggal</p>
                      <p className="text-sm text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        {new Date(expense.expenseDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Jumlah</p>
                      <p className="text-sm font-bold text-red-600">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(expense)}
                      className="flex-1 inline-flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense)}
                      className="flex-1 inline-flex items-center justify-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(expense.expenseDate).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {EXPENSE_CATEGORIES[expense.category]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-red-600">
                        {formatCurrency(expense.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(expense)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense)}
                          className="text-red-600 hover:text-red-800 font-medium"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Tambah Pengeluaran</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Jumlah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="1.500.000"
                  required
                  className="w-full px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tagihan listrik bulan November..."
                  rows="3"
                  required
                  className="w-full px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  URL Bukti/Invoice (Opsional)
                </label>
                <input
                  type="url"
                  name="receiptUrl"
                  value={formData.receiptUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/receipt.jpg"
                  className="w-full px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="w-full sm:flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Edit Pengeluaran</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedExpense(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleEditExpense} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="1.500.000"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tagihan listrik bulan November..."
                  rows="3"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Bukti/Invoice (Opsional)
                </label>
                <input
                  type="url"
                  name="receiptUrl"
                  value={formData.receiptUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/receipt.jpg"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedExpense(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;
