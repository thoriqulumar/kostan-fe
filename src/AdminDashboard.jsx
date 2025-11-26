import React, { useState } from 'react';
import { Building2, LayoutDashboard, CreditCard, LogOut, DollarSign, Clock, Shield, Home, User, TrendingDown } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import authService from './services/authService';
import NotificationBell from './components/NotificationBell';
import PendingPayments from './components/PendingPayments';
import AllPayments from './components/AllPayments';
import IncomeReport from './components/IncomeReport';
import RoomManagement from './components/RoomManagement';
import UserManagement from './components/UserManagement';
import ExpenseManagement from './components/ExpenseManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('pending');

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'pending':
        return <PendingPayments />;
      case 'all-payments':
        return <AllPayments />;
      case 'income':
        return <IncomeReport />;
      case 'expenses':
        return <ExpenseManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return <PendingPayments />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'pending':
        return 'Pembayaran Menunggu';
      case 'all-payments':
        return 'Semua Pembayaran';
      case 'income':
        return 'Laporan Pendapatan';
      case 'expenses':
        return 'Manajemen Pengeluaran';
      case 'rooms':
        return 'Manajemen Kamar';
      case 'users':
        return 'Manajemen User';
      default:
        return 'Dashboard Admin';
    }
  };

  const getPageDescription = () => {
    switch (currentPage) {
      case 'pending':
        return 'Tinjau dan setujui pembayaran yang menunggu';
      case 'all-payments':
        return 'Lihat riwayat semua pembayaran';
      case 'income':
        return 'Analisis pendapatan dan laporan keuangan';
      case 'expenses':
        return 'Catat dan kelola pengeluaran operasional';
      case 'rooms':
        return 'Kelola kamar kost dan penyewa';
      case 'users':
        return 'Kelola pengguna, ubah status, dan hak akses';
      default:
        return 'Panel administrator';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                Kost Manager
              </h1>
              <p className="text-xs text-purple-600 font-semibold" style={{ fontFamily: '"Inter", sans-serif' }}>
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentPage('pending')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentPage === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span style={{ fontFamily: '"Inter", sans-serif' }}>Menunggu Persetujuan</span>
            </button>
            <button
              onClick={() => setCurrentPage('all-payments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentPage === 'all-payments'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span style={{ fontFamily: '"Inter", sans-serif' }}>Semua Pembayaran</span>
            </button>
            <button
              onClick={() => setCurrentPage('income')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentPage === 'income'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span style={{ fontFamily: '"Inter", sans-serif' }}>Laporan Pendapatan</span>
            </button>
            <button
              onClick={() => setCurrentPage('expenses')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentPage === 'expenses'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              <span style={{ fontFamily: '"Inter", sans-serif' }}>Pengeluaran</span>
            </button>
            <button
              onClick={() => setCurrentPage('rooms')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentPage === 'rooms'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              <span style={{ fontFamily: '"Inter", sans-serif' }}>Manajemen Kamar</span>
            </button>

            <button
              onClick={() => setCurrentPage('users')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentPage === 'users'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className="w-5 h-5" />
              <span style={{ fontFamily: '"Inter", sans-serif' }}>Manajemen User</span>
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: '"Inter", sans-serif' }}>
              {user.fullName || 'Admin'}
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
                {getPageTitle()}
              </h2>
              <p className="text-gray-600" style={{ fontFamily: '"Inter", sans-serif' }}>
                {getPageDescription()}
              </p>
            </div>
            <NotificationBell />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
