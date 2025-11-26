import React, { useState, useEffect } from 'react';
import { Upload, CreditCard, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import paymentService from '../services/paymentService';
import { formatNumber, parseFormattedNumber, handleNumberInput } from '../utils/numberFormat';

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null,
    paymentMonth: new Date().getMonth() + 1,
    paymentYear: new Date().getFullYear(),
    amount: '',
  });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Load payment history on mount
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getMyPayments();
      setPayments(data);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Gagal memuat riwayat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Tipe file tidak valid. Hanya jpg, png, gif, webp yang diperbolehkan.');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }

      setUploadForm((prev) => ({ ...prev, file }));

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError('');
    }
  };

  const handleUploadFormChange = (e) => {
    const { name, value } = e.target;

    // Format amount field with thousand separators
    if (name === 'amount') {
      const formattedValue = handleNumberInput(value);
      setUploadForm((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setUploadForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!uploadForm.file) {
      setError('Silakan pilih file bukti pembayaran');
      return;
    }

    const parsedAmount = parseFormattedNumber(uploadForm.amount);
    if (!uploadForm.amount || parsedAmount <= 0) {
      setError('Silakan masukkan jumlah pembayaran yang valid');
      return;
    }

    try {
      setUploading(true);
      await paymentService.uploadReceipt(
        uploadForm.file,
        parseInt(uploadForm.paymentMonth),
        parseInt(uploadForm.paymentYear),
        parsedAmount
      );

      setSuccess('Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin.');

      // Reset form
      setUploadForm({
        file: null,
        paymentMonth: new Date().getMonth() + 1,
        paymentYear: new Date().getFullYear(),
        amount: '',
      });
      setPreviewUrl('');
      setShowUploadForm(false);

      // Refresh payment list
      fetchPayments();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Gagal mengunggah bukti pembayaran');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: <Clock className="w-4 h-4" />,
        text: 'Menunggu',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
      approved: {
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Disetujui',
        className: 'bg-green-50 text-green-700 border-green-200',
      },
      rejected: {
        icon: <XCircle className="w-4 h-4" />,
        text: 'Ditolak',
        className: 'bg-red-50 text-red-700 border-red-200',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        {config.icon}
        <span>{config.text}</span>
      </span>
    );
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

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Memuat data pembayaran...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Upload Button */}
      {!showUploadForm && (
        <button
          onClick={() => setShowUploadForm(true)}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Bukti Pembayaran</span>
        </button>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: '"DM Sans", sans-serif' }}>
            Upload Bukti Pembayaran
          </h3>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bukti Pembayaran (Gambar)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {previewUrl && (
                <div className="mt-3">
                  <img src={previewUrl} alt="Preview" className="max-w-xs h-auto rounded-lg border border-gray-200" />
                </div>
              )}
            </div>

            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bulan Pembayaran
              </label>
              <select
                name="paymentMonth"
                value={uploadForm.paymentMonth}
                onChange={handleUploadFormChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {getMonthName(month)}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun Pembayaran
              </label>
              <input
                type="number"
                name="paymentYear"
                value={uploadForm.paymentYear}
                onChange={handleUploadFormChange}
                min="2020"
                max="2100"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Pembayaran (IDR)
              </label>
              <input
                type="text"
                name="amount"
                value={uploadForm.amount}
                onChange={handleUploadFormChange}
                placeholder="1.500.000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Mengunggah...' : 'Upload'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setPreviewUrl('');
                  setError('');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: '"DM Sans", sans-serif' }}>
          Riwayat Pembayaran
        </h3>

        {payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">Belum ada pembayaran</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {getMonthName(payment.paymentMonth)} {payment.paymentYear}
                    </h4>
                    <p className="text-lg font-bold text-blue-600 mb-2">
                      {formatCurrency(payment.amount)}
                    </p>
                    <div className="text-sm text-gray-500">
                      Diunggah: {new Date(payment.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>

                {payment.status === 'rejected' && payment.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Alasan penolakan:</strong> {payment.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
