import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_foods: 0, available: 0, taken: 0, expired: 0 });
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, foodsRes] = await Promise.all([
        api.get('/foods/stats'),
        api.get('/foods/all'),
      ]);
      setStats(statsRes.data);
      setFoods(foodsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food post?')) return;
    setDeleteLoading(id);
    try {
      await api.delete(`/foods/${id}`);
      setFoods(foods.filter((f) => f.id !== id));
      setStats((prev) => ({
        ...prev,
        total_foods: prev.total_foods - 1,
      }));
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleLogout = () => {
    api.post('/logout').catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const statusBadge = (status) => {
    const styles = {
      available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      taken: 'bg-blue-100 text-blue-700 border-blue-200',
      expired: 'bg-gray-100 text-gray-500 border-gray-200',
    };
    const icons = { available: '🟢', taken: '✅', expired: '⏰' };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4 animate-pulse">
            <span className="text-3xl">🍱</span>
          </div>
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-emerald-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-xl">🍱</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Rezeki Hunter</h1>
                <p className="text-xs text-gray-400 -mt-1">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-700 font-medium">Live</span>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.total_foods}</p>
            <p className="text-sm text-gray-400 mt-1">Total Posts</p>
          </div>

          {/* Available */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🟢</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.available}</p>
            <p className="text-sm text-gray-400 mt-1">Available Now</p>
          </div>

          {/* Rescued */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.taken}</p>
            <p className="text-sm text-gray-400 mt-1">Food Rescued</p>
          </div>

          {/* Expired */}
          <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600">{stats.expired}</p>
            <p className="text-sm text-gray-400 mt-1">Expired</p>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">Live Feed</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                Auto-refresh 5s
              </span>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
            >
              ↻ Refresh
            </button>
          </div>

          {foods.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl">🍽️</span>
              <p className="text-gray-400 mt-4 font-medium">No food posts yet</p>
              <p className="text-gray-300 text-sm">Posts will appear here in real-time</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Food</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Posted By</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {foods.map((food) => (
                    <tr key={food.id} className="hover:bg-emerald-50/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {food.image_url ? (
                            <img
                              src={food.image_url}
                              alt={food.title}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                              <span className="text-xl">🍱</span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{food.title}</p>
                            {food.description && (
                              <p className="text-xs text-gray-400 truncate max-w-[200px]">{food.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          📍 {food.location}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 font-medium">{food.user?.name || 'Unknown'}</p>
                      </td>
                      <td className="px-6 py-4">{statusBadge(food.status)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">{timeAgo(food.created_at)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(food.id)}
                          disabled={deleteLoading === food.id}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                        >
                          {deleteLoading === food.id ? '...' : '🗑 Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-300">Rezeki Hunter Admin Panel v1.0 • Campus Food Rescue</p>
        </div>
      </div>
    </div>
  );
}
