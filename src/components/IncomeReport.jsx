import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, BarChart3, TrendingDown, Wallet } from 'lucide-react';
import paymentService from '../services/paymentService';
import expenseService from '../services/expenseService';
import toast from 'react-hot-toast';

const IncomeReport = () => {
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    fetchIncomeData();
  }, [selectedYear]);

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      const [summaryData, reportData, expensesData] = await Promise.all([
        paymentService.getIncomeSummary(selectedYear),
        paymentService.getIncomeReport(selectedYear),
        expenseService.getAllExpenses({ year: selectedYear }),
      ]);

      setSummary(summaryData);
      setReport(reportData);
      setExpenses(expensesData);

      // Extract unique years from report
      const years = [...new Set(reportData.map((r) => r.paymentYear))].sort((a, b) => b - a);
      setAvailableYears(years);
    } catch (err) {
      console.error('Failed to fetch income data:', err);
      toast.error('Gagal memuat laporan pendapatan');
    } finally {
      setLoading(false);
    }
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
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const calculateMonthlyAverage = () => {
    if (!summary?.incomeByMonth || summary.incomeByMonth.length === 0) return 0;
    return summary.totalIncome / summary.incomeByMonth.length;
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  };

  const calculateNetProfit = () => {
    return (summary?.totalIncome || 0) - calculateTotalExpenses();
  };

  const getMonthlyData = () => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: getMonthName(i + 1),
      income: 0,
      expenses: 0,
      netProfit: 0,
      count: 0,
    }));

    // Add income data
    if (summary?.incomeByMonth) {
      summary.incomeByMonth.forEach((item) => {
        const index = item.month - 1;
        if (index >= 0 && index < 12) {
          monthlyData[index].income = parseFloat(item.total);
          monthlyData[index].count = item.count || 0;
        }
      });
    }

    // Add expense data
    expenses.forEach((expense) => {
      const index = expense.expenseMonth - 1;
      if (index >= 0 && index < 12) {
        monthlyData[index].expenses += parseFloat(expense.amount || 0);
      }
    });

    // Calculate net profit for each month
    monthlyData.forEach((month) => {
      month.netProfit = month.income - month.expenses;
    });

    return monthlyData;
  };

  const monthlyData = getMonthlyData();
  const maxValue = Math.max(...monthlyData.map((m) => Math.max(m.income, m.expenses)), 1);

  const exportToCSV = () => {
    if (!report || report.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['Tanggal', 'Bulan', 'Tahun', 'Jumlah', 'User ID', 'Room ID', 'Deskripsi'];
    const rows = report.map((item) => [
      new Date(item.createdAt).toLocaleDateString('id-ID'),
      getMonthName(item.paymentMonth),
      item.paymentYear,
      item.amount,
      item.user.fullName,
      item.room.name,
      item.description || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-pendapatan-${selectedYear}.csv`;
    link.click();

    toast.success('Laporan berhasil diekspor');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Memuat laporan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Year Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          >
            {availableYears.length > 0 ? (
              availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))
            ) : (
              <option value={new Date().getFullYear()}>
                {new Date().getFullYear()}
              </option>
            )}
          </select>
        </div>
        <button
          onClick={exportToCSV}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Income */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-green-100 text-xs sm:text-sm">Total Pendapatan</p>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-1">
            {formatCurrency(summary?.totalIncome || 0)}
          </h3>
          <p className="text-green-100 text-xs">
            {summary?.incomeByMonth?.length || 0} bulan
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-red-100 text-xs sm:text-sm">Total Pengeluaran</p>
            <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-200" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-1">
            {formatCurrency(calculateTotalExpenses())}
          </h3>
          <p className="text-red-100 text-xs">
            {expenses.length} transaksi
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-purple-100 text-xs sm:text-sm">Laba Bersih</p>
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-1">
            {formatCurrency(calculateNetProfit())}
          </h3>
          <p className="text-purple-100 text-xs">
            Pendapatan - Pengeluaran
          </p>
        </div>

        {/* Average Monthly */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-gray-600 text-xs sm:text-sm">Rata-rata/Bulan</p>
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(calculateMonthlyAverage())}
          </h3>
          <p className="text-gray-500 text-xs">
            {summary?.incomeByMonth?.length || 0} bulan aktif
          </p>
        </div>

        {/* Highest Month */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-gray-600 text-xs sm:text-sm">Bulan Tertinggi</p>
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
          </div>
          {monthlyData.length > 0 && (
            <>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(Math.max(...monthlyData.map((m) => m.income)))}
              </h3>
              <p className="text-gray-500 text-xs">
                {monthlyData.find((m) => m.income === Math.max(...monthlyData.map((d) => d.income)))?.monthName || '-'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Laporan Keuangan Bulanan {selectedYear}</h3>
        <div className="space-y-4">
          {monthlyData.map((month) => (
            <div key={month.month} className="pb-4 border-b border-gray-100 last:border-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">{month.monthName}</span>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm font-bold ${month.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    Laba: {formatCurrency(month.netProfit)}
                  </span>
                </div>
              </div>

              {/* Income Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Pendapatan</span>
                  <span className="text-xs font-semibold text-green-600">{formatCurrency(month.income)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: maxValue > 0 ? `${(month.income / maxValue) * 100}%` : '0%',
                    }}
                  ></div>
                </div>
              </div>

              {/* Expenses Bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Pengeluaran</span>
                  <span className="text-xs font-semibold text-red-600">{formatCurrency(month.expenses)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: maxValue > 0 ? `${(month.expenses / maxValue) * 100}%` : '0%',
                    }}
                  ></div>
                </div>
              </div>

              {month.count > 0 && (
                <p className="text-xs text-gray-500 mt-2">{month.count} pembayaran diterima</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Detail Pendapatan</h3>
        </div>
        {report.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-gray-600">Tidak ada data pendapatan untuk tahun ini</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {report.map((item, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Tanggal</p>
                      <p className="text-sm text-gray-900">
                        {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Period</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {getMonthName(item.paymentMonth)} {item.paymentYear}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Jumlah</p>
                      <p className="text-sm font-bold text-purple-600">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="text-sm text-gray-600">
                        {item.userId?.substring(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Room ID</p>
                      <p className="text-sm text-gray-600">
                        {item.roomId?.substring(0, 8)}...
                      </p>
                    </div>
                    {item.description && (
                      <div>
                        <p className="text-xs text-gray-500">Deskripsi</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    )}
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
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {getMonthName(item.paymentMonth)} {item.paymentYear}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-purple-600">
                        {formatCurrency(item.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {item.userId?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {item.roomId?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {item.description || '-'}
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
    </div>
  );
};

export default IncomeReport;
