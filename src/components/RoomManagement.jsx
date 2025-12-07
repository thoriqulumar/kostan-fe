import React, { useState, useEffect } from 'react';
import { Home, Plus, Edit, Trash2, Users, DollarSign, X, Check, UserPlus, UserMinus, Search } from 'lucide-react';
import roomService from '../services/roomService';
import userService from '../services/userService';
import toast from 'react-hot-toast';
import { formatNumber, parseFormattedNumber, handleNumberInput } from '../utils/numberFormat';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // User assignment states
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({ name: '', price: '' });
  const [editForm, setEditForm] = useState({ name: '', price: '' });
  const [assignForm, setAssignForm] = useState({ rentStartDate: '' });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getAllRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      toast.error('Gagal memuat data kamar');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!createForm.name.trim()) {
      toast.error('Nama kamar wajib diisi');
      return;
    }

    const parsedPrice = parseFormattedNumber(createForm.price);
    if (!createForm.price || parsedPrice <= 0) {
      toast.error('Harga harus lebih dari 0');
      return;
    }

    try {
      await roomService.createRoom(createForm.name, parsedPrice);
      toast.success('Kamar berhasil dibuat!');
      setShowCreateModal(false);
      setCreateForm({ name: '', price: '' });
      fetchRooms();
    } catch (err) {
      console.error('Create room error:', err);
      toast.error(err.message || 'Gagal membuat kamar');
    }
  };

  const handleEditRoom = async (e) => {
    e.preventDefault();

    if (!editForm.name.trim()) {
      toast.error('Nama kamar wajib diisi');
      return;
    }

    const parsedPrice = parseFormattedNumber(editForm.price);
    if (!editForm.price || parsedPrice <= 0) {
      toast.error('Harga harus lebih dari 0');
      return;
    }

    try {
      await roomService.updateRoom(selectedRoom.id, {
        name: editForm.name,
        price: parsedPrice,
        rentedUserId: selectedRoom.rentedUserId,
        rentStartDate: selectedRoom.rentStartDate,
      });
      toast.success('Kamar berhasil diupdate!');
      setShowEditModal(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (err) {
      console.error('Update room error:', err);
      toast.error(err.message || 'Gagal mengupdate kamar');
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!confirm(`Yakin ingin menghapus kamar "${room.name}"?`)) {
      return;
    }

    try {
      await roomService.deleteRoom(room.id);
      toast.success('Kamar berhasil dihapus!');
      fetchRooms();
    } catch (err) {
      console.error('Delete room error:', err);
      toast.error(err.message || 'Gagal menghapus kamar');
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await userService.getUnassignedUsers();
      setAvailableUsers(users);
    } catch (err) {
      console.error('Failed to fetch available users:', err);
      toast.error('Gagal memuat daftar user');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssignUser = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error('Silakan pilih user terlebih dahulu');
      return;
    }

    try {
      await roomService.assignUserToRoom(
        selectedRoom.id,
        selectedUser.id,
        assignForm.rentStartDate || new Date().toISOString().split('T')[0]
      );
      toast.success('User berhasil ditugaskan ke kamar!');
      setShowAssignModal(false);
      setSelectedRoom(null);
      setSelectedUser(null);
      setUserSearchQuery('');
      setAssignForm({ rentStartDate: '' });
      fetchRooms();
    } catch (err) {
      console.error('Assign user error:', err);
      toast.error(err.message || 'Gagal menugaskan user');
    }
  };

  const handleRemoveUser = async (room) => {
    if (!confirm(`Yakin ingin mengeluarkan user dari kamar "${room.name}"?`)) {
      return;
    }

    try {
      await roomService.removeUserFromRoom(room.id);
      toast.success('User berhasil dikeluarkan dari kamar!');
      fetchRooms();
    } catch (err) {
      console.error('Remove user error:', err);
      toast.error(err.message || 'Gagal mengeluarkan user');
    }
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setEditForm({ name: room.name, price: formatNumber(room.price) });
    setShowEditModal(true);
  };

  const openAssignModal = async (room) => {
    setSelectedRoom(room);
    setSelectedUser(null);
    setUserSearchQuery('');
    setAssignForm({ rentStartDate: new Date().toISOString().split('T')[0] });
    setShowAssignModal(true);
    await fetchAvailableUsers();
  };

  const getFilteredUsers = () => {
    if (!userSearchQuery.trim()) {
      return availableUsers;
    }

    const query = userSearchQuery.toLowerCase();
    return availableUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStats = () => {
    const total = rooms.length;
    const rented = rooms.filter((r) => r.rentedUserId).length;
    const available = total - rented;
    const totalRevenue = rooms
      .filter((r) => r.rentedUserId)
      .reduce((sum, r) => sum + parseFloat(r.price), 0);

    return { total, rented, available, totalRevenue };
  };

  const stats = getStats();

  if (loading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Memuat data kamar...</div>
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
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Kamar</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Home className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Kamar Tersewa</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.rented}</p>
            </div>
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Kamar Kosong</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.available}</p>
            </div>
            <Home className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Potensi Pendapatan</p>
              <p className="text-lg sm:text-xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Add Room Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
      >
        <Plus className="w-5 h-5" />
        <span>Tambah Kamar Baru</span>
      </button>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`bg-white rounded-xl sm:rounded-2xl border-2 p-4 sm:p-6 transition-all hover:shadow-lg ${
              room.rentedUserId ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            {/* Room Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{formatCurrency(room.price)}</p>
                <p className="text-xs text-gray-500 mt-1">per bulan</p>
              </div>
              <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                room.rentedUserId
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {room.rentedUserId ? 'Tersewa' : 'Kosong'}
              </div>
            </div>

            {/* Rented User Info */}
            {room.rentedUserId && room.rentedUser && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 font-medium mb-1">Penyewa:</p>
                <p className="text-sm font-semibold text-gray-900">{room.rentedUser.fullName}</p>
                <p className="text-xs text-gray-600">{room.rentedUser.email}</p>
                {room.rentStartDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Mulai: {new Date(room.rentStartDate).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <button
                onClick={() => openEditModal(room)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>

              {room.rentedUserId ? (
                <button
                  onClick={() => handleRemoveUser(room)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all text-sm font-medium"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>Keluarkan</span>
                </button>
              ) : (
                <button
                  onClick={() => openAssignModal(room)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign</span>
                </button>
              )}

              <button
                onClick={() => handleDeleteRoom(room)}
                className="sm:flex-initial w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium"
              >
                <Trash2 className="w-4 h-4 mx-auto sm:mx-0" />
              </button>
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada kamar. Klik "Tambah Kamar Baru" untuk mulai.</p>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Tambah Kamar Baru</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({ name: '', price: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Nama Kamar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Contoh: Kamar A1"
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Harga per Bulan (IDR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.price}
                  onChange={(e) => setCreateForm({ ...createForm, price: handleNumberInput(e.target.value) })}
                  placeholder="1.500.000"
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="submit"
                  className="w-full sm:flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ name: '', price: '' });
                  }}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Edit Kamar</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRoom(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <form onSubmit={handleEditRoom} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Nama Kamar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Harga per Bulan (IDR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: handleNumberInput(e.target.value) })}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="submit"
                  className="w-full sm:flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRoom(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex-1 mr-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Assign User ke {selectedRoom.name}</h3>
                {selectedUser && (
                  <p className="text-xs sm:text-sm text-green-600 mt-1">
                    Terpilih: {selectedUser.fullName}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRoom(null);
                  setSelectedUser(null);
                  setUserSearchQuery('');
                  setAssignForm({ rentStartDate: '' });
                }}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {/* Search Input */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Cari User <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan nama atau email..."
                    className="w-full pl-9 sm:pl-10 pr-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Menampilkan user yang belum menyewa kamar (role: user)
                </p>
              </div>

              {/* User List */}
              <div className="mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">
                  Pilih User ({getFilteredUsers().length} tersedia)
                </label>

                {loadingUsers ? (
                  <div className="text-center py-8 text-gray-500">Memuat daftar user...</div>
                ) : getFilteredUsers().length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">
                      {userSearchQuery ? 'Tidak ada user yang cocok' : 'Tidak ada user tersedia'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2">
                    {getFilteredUsers().map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedUser?.id === user.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{user.fullName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-500 mt-1">{user.phone}</p>
                            )}
                          </div>
                          {selectedUser?.id === user.id && (
                            <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Input */}
              <form onSubmit={handleAssignUser} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai Sewa
                  </label>
                  <input
                    type="date"
                    value={assignForm.rentStartDate}
                    onChange={(e) => setAssignForm({ ...assignForm, rentStartDate: e.target.value })}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={!selectedUser}
                    className="w-full sm:flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedRoom(null);
                      setSelectedUser(null);
                      setUserSearchQuery('');
                      setAssignForm({ rentStartDate: '' });
                    }}
                    className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
