import React, { useState } from 'react';
import { Building2, LayoutDashboard, CreditCard, LogOut, Home } from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

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
            onClick={onLogout}
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
          <h2 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: '"DM Sans", sans-serif' }}>
            {currentPage === 'dashboard' ? 'Dashboard' : 'Pembayaran'}
          </h2>
          <p className="text-gray-600" style={{ fontFamily: '"Inter", sans-serif' }}>
            {currentPage === 'dashboard' 
              ? `Selamat datang, ${user.fullName?.split(' ')[0] || 'thor'}`
              : 'Kelola pembayaran sewa kamar Anda'
            }
          </p>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {currentPage === 'dashboard' ? (
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
          ) : (
            /* Pembayaran Empty State Card */
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <CreditCard className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                Belum Ada Pembayaran
              </h3>
              <p className="text-gray-600 max-w-md mx-auto" style={{ fontFamily: '"Inter", sans-serif' }}>
                Riwayat pembayaran Anda akan muncul di sini
              </p>
            </div>
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