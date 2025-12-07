import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye, Filter, Search } from "lucide-react";
import paymentService from "../services/paymentService";
import toast from "react-hot-toast";

const AllPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  useEffect(() => {
    fetchAllPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, statusFilter, searchQuery, monthFilter, yearFilter]);

  useEffect(() => {
    if (selectedPayment?.id) {
      fetchImagePaymentReciept(selectedPayment.id);
    }

    // Cleanup function to revoke object URL when component unmounts or selectedPayment changes
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [selectedPayment]);

  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAllPayments();
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch all payments:", err);
      toast.error("Gagal memuat data pembayaran");
    } finally {
      setLoading(false);
    }
  };

  const fetchImagePaymentReciept = async (paymentId) => {
    if (!paymentId) return;
    try {
      setLoadingImage(true);
      const blob = await paymentService.getReceiptImage(paymentId);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err) {
      console.error("Failed to load image:", err);
      setImageUrl(null);
    } finally {
      setLoadingImage(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Month filter
    if (monthFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.paymentMonth === parseInt(monthFilter)
      );
    }

    // Year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter((p) => p.paymentYear === parseInt(yearFilter));
    }

    // Search query (by user ID)
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.userId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  };

  const viewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowImageModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: <Clock className="w-4 h-4" />,
        text: "Menunggu",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      approved: {
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Disetujui",
        className: "bg-green-50 text-green-700 border-green-200",
      },
      rejected: {
        icon: <XCircle className="w-4 h-4" />,
        text: "Ditolak",
        className: "bg-red-50 text-red-700 border-red-200",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        {config.icon}
        <span>{config.text}</span>
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month) => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return months[month - 1];
  };

  const getUniqueYears = () => {
    const years = [...new Set(payments.map((p) => p.paymentYear))];
    return years.sort((a, b) => b - a);
  };

  const getStats = () => {
    const total = filteredPayments.length;
    const approved = filteredPayments.filter(
      (p) => p.status === "approved"
    ).length;
    const pending = filteredPayments.filter(
      (p) => p.status === "pending"
    ).length;
    const rejected = filteredPayments.filter(
      (p) => p.status === "rejected"
    ).length;
    const totalAmount = filteredPayments
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return { total, approved, pending, rejected, totalAmount };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Pembayaran</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Disetujui</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Menunggu</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Ditolak</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Total Income Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <p className="text-green-100 text-xs sm:text-sm mb-1">
          Total Pendapatan (Disetujui)
        </p>
        <h3 className="text-2xl sm:text-3xl font-bold">
          {formatCurrency(stats.totalAmount)}
        </h3>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Cari User ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID pengguna..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Semua</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
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
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-gray-600">Tidak ada data pembayaran</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">User ID</p>
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {payment.userId?.substring(0, 8)}...
                      </p>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Periode</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {getMonthName(payment.paymentMonth)} {payment.paymentYear}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Jumlah</p>
                      <p className="text-sm font-bold text-purple-600">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tanggal</p>
                      <p className="text-sm text-gray-900">
                        {new Date(payment.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => viewReceipt(payment)}
                    className="w-full inline-flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Bukti</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.userId?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {getMonthName(payment.paymentMonth)}{" "}
                        {payment.paymentYear}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-purple-600">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => viewReceipt(payment)}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Lihat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex-1 mr-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Bukti Pembayaran
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {getMonthName(selectedPayment.paymentMonth)}{" "}
                  {selectedPayment.paymentYear} -{" "}
                  {formatCurrency(selectedPayment.amount)}
                </p>
                <div className="mt-2">
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedPayment(null);
                  setImageUrl(null);
                }}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {loadingImage ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-sm sm:text-base text-gray-600">Memuat gambar...</div>
                </div>
              ) : (
                <img
                  src={
                    imageUrl ||
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%239ca3af" font-size="16"%3EGambar tidak dapat dimuat%3C/text%3E%3C/svg%3E'
                  }
                  alt="Payment Receipt"
                  className="w-full h-auto rounded-lg border border-gray-200"
                />
              )}
              {selectedPayment.status === "rejected" &&
                selectedPayment.rejectionReason && (
                  <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-red-700">
                      <strong>Alasan Penolakan:</strong>{" "}
                      {selectedPayment.rejectionReason}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPayments;
