import React, { useState, useEffect } from 'react';
import { Building2, LayoutDashboard, CreditCard, LogOut, Home, MapPin, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import authService from './services/authService';
import rentalService from './services/rentalService';
import PaymentPage from './components/PaymentPage';
import NotificationBell from './components/NotificationBell';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [myRoom, setMyRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);

  useEffect(() => {
    fetchMyRoom();
  }, []);

  const fetchMyRoom = async () => {
    try {
      setLoadingRoom(true);
      const room = await rentalService.getMyRoom();
      setMyRoom(room);
    } catch (err) {
      console.error('Failed to fetch room:', err);
      // If error is 404 or user has no room, that's okay - just set null
      setMyRoom(null);
    } finally {
      setLoadingRoom(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout(); // Clear local state regardless of API call success
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                Kost Manager
              </h1>
              <p className="text-xs text-gray-500" style={{ fontFamily: '"Inter", sans-serif' }}>
                Member Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentPage === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span style={{ fontFamily: '"Inter", sans-serif' }}>Dashboard</span>
            </button>
            <button 
              onClick={() => setCurrentPage('pembayaran')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentPage === 'pembayaran'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span style={{ fontFamily: '"Inter", sans-serif' }}>Pembayaran</span>
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: '"Inter", sans-serif' }}>
              {user.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-500" style={{ fontFamily: '"Inter", sans-serif' }}>
              {user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2.5 text-red-600 rounded-xl font-medium transition-all duration-200 hover:bg-red-50 border border-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span style={{ fontFamily: '"Inter", sans-serif' }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                {currentPage === 'dashboard' ? 'Dashboard' : 'Pembayaran'}
              </h2>
              <p className="text-gray-600" style={{ fontFamily: '"Inter", sans-serif' }}>
                {currentPage === 'dashboard'
                  ? `Selamat datang, ${user.fullName?.split(' ')[0] || 'thor'}`
                  : 'Kelola pembayaran sewa kamar Anda'
                }
              </p>
            </div>
            <NotificationBell />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {currentPage === 'dashboard' ? (
            loadingRoom ? (
              /* Loading State */
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-gray-600">Memuat informasi kamar...</div>
              </div>
            ) : myRoom ? (
              /* Room Info Card */
              <div className="space-y-6">
                {/* Main Room Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-blue-100 text-sm mb-2">Kamar Saya</p>
                      <h3 className="text-3xl font-bold mb-1" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                        {myRoom.name}
                      </h3>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 rounded-lg p-2">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-blue-100 text-xs mb-1">Harga Sewa per Bulan</p>
                          <p className="text-xl font-bold">{formatCurrency(myRoom.price)}</p>
                        </div>
                      </div>
                    </div>

                    {myRoom.rentStartDate && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white/20 rounded-lg p-2">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-blue-100 text-xs mb-1">Mulai Sewa</p>
                            <p className="text-xl font-bold">
                              {new Date(myRoom.rentStartDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Reminder */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 rounded-xl p-3">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Pembayaran Bulanan</h4>
                        <p className="text-sm text-gray-600">
                          Jangan lupa untuk membayar sewa setiap bulan. Upload bukti pembayaran di menu Pembayaran.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 rounded-xl p-3">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Butuh Bantuan?</h4>
                        <p className="text-sm text-gray-600">
                          Hubungi admin jika ada pertanyaan tentang kamar atau pembayaran Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Dashboard Empty State Card */
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                  <Home className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                  Belum Ada Penyewaan
                </h3>
                <p className="text-gray-600 max-w-md mx-auto" style={{ fontFamily: '"Inter", sans-serif' }}>
                  Anda belum memiliki kamar yang disewa. Silakan hubungi admin untuk menyewa kamar.
                </p>
              </div>
            )
          ) : (
            /* Pembayaran Page */
            <PaymentPage />
          )}
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;