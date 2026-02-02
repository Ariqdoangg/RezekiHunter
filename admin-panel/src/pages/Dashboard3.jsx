import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_foods: 0, available: 0, taken: 0, expired: 0 });
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food post?')) return;
    setDeleteLoading(id);
    try {
      await api.delete(`/foods/${id}`);
      setFoods(foods.filter((f) => f.id !== id));
      setStats((prev) => ({ ...prev, total_foods: prev.total_foods - 1 }));
    } catch (err) {
      alert('Failed to delete');
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

  const filteredFoods = foods.filter((food) => {
    const matchTab = activeTab === 'all' || food.status === activeTab;
    const matchSearch = food.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const recentClaims = foods.filter(f => f.status === 'taken').slice(0, 5);
  const rescueRate = stats.total_foods > 0 ? Math.round((stats.taken / stats.total_foods) * 100) : 0;

  const locationStats = foods.reduce((acc, food) => {
    acc[food.location] = (acc[food.location] || 0) + 1;
    return acc;
  }, {});
  const topLocations = Object.entries(locationStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxLocationCount = topLocations.length > 0 ? topLocations[0][1] : 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0fdfd' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 animate-pulse" style={{ background: 'rgba(6,148,148,0.1)', border: '2px solid rgba(6,148,148,0.2)' }}>
            <span className="text-4xl">🍱</span>
          </div>
          <p className="font-medium" style={{ color: '#069494' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8fffe' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} style={{ background: '#069494' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: '#FF69B4' }}>
              <span className="text-2xl">🍱</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Rezeki Hunter</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Admin Panel v1.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: '📊', label: 'Dashboard', active: true },
            { icon: '🍱', label: 'Food Posts', active: false },
            { icon: '👥', label: 'Users', active: false },
            { icon: '📍', label: 'Locations', active: false },
            { icon: '📈', label: 'Analytics', active: false },
            { icon: '⚙️', label: 'Settings', active: false },
          ].map((item, i) => (
            <a key={i} href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${item.active ? '' : 'hover:bg-white/10'}`}
              style={item.active ? { background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' } : { color: 'rgba(255,255,255,0.7)' }}>
              <span>{item.icon}</span> {item.label}
            </a>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: '#FF69B4' }}>
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full mt-3 px-4 py-2.5 text-sm font-medium rounded-xl transition hover:opacity-90"
            style={{ color: '#FF69B4', background: 'rgba(255,105,180,0.15)', border: '1px solid rgba(255,105,180,0.3)' }}>
            ← Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ background: 'rgba(248,255,254,0.85)', borderColor: '#e0f5f5' }}>
          <div className="flex items-center justify-between px-6 h-16">
            <button className="lg:hidden p-2 rounded-lg text-white" style={{ background: '#069494' }} onClick={() => setSidebarOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div className="hidden lg:block">
              <h2 className="text-lg font-bold" style={{ color: '#0a3d3d' }}>Dashboard Overview</h2>
              <p className="text-xs" style={{ color: '#069494' }}>Monitor campus food rescue in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)' }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00F0FF' }}></div>
                <span className="text-xs font-semibold" style={{ color: '#069494' }}>Live</span>
              </div>
              <button onClick={fetchData} className="px-4 py-2 text-xs font-semibold rounded-lg text-white transition hover:opacity-80" style={{ background: '#069494' }}>
                ↻ Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Posts', value: stats.total_foods, icon: '📊', color: '#FF69B4', bg: 'rgba(255,105,180,0.08)', border: 'rgba(255,105,180,0.2)' },
              { label: 'Available Now', value: stats.available, icon: '🟢', color: '#069494', bg: 'rgba(6,148,148,0.08)', border: 'rgba(6,148,148,0.2)', tag: 'Active' },
              { label: 'Food Rescued', value: stats.taken, icon: '✅', color: '#00bcd4', bg: 'rgba(0,240,255,0.06)', border: 'rgba(0,240,255,0.2)', tag: `${rescueRate}%` },
              { label: 'Expired', value: stats.expired, icon: '⏰', color: '#FF69B4', bg: 'rgba(255,105,180,0.06)', border: 'rgba(255,105,180,0.15)' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-lg cursor-default"
                style={{ border: `1px solid ${card.border}`, boxShadow: '0 2px 12px rgba(6,148,148,0.06)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                    <span className="text-xl">{card.icon}</span>
                  </div>
                  {card.tag && <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ color: card.color, background: card.bg }}>{card.tag}</span>}
                </div>
                <p className="text-3xl font-extrabold" style={{ color: card.color }}>{card.value}</p>
                <p className="text-xs mt-1" style={{ color: '#8aafaf' }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Rescue Rate */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(6,148,148,0.12)', boxShadow: '0 2px 12px rgba(6,148,148,0.06)' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: '#0a3d3d' }}>🎯 Rescue Rate</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e8f8f8" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="url(#grad1)" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${rescueRate * 3.14} ${314 - rescueRate * 3.14}`} />
                    <defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FF69B4" /><stop offset="100%" stopColor="#069494" /></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold" style={{ color: '#069494' }}>{rescueRate}%</span>
                    <span className="text-xs" style={{ color: '#8aafaf' }}>rescued</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-6 text-xs" style={{ color: '#8aafaf' }}>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#069494' }}></span> Rescued</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#e8f8f8' }}></span> Remaining</span>
              </div>
            </div>

            {/* Top Locations */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(6,148,148,0.12)', boxShadow: '0 2px 12px rgba(6,148,148,0.06)' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: '#0a3d3d' }}>📍 Top Locations</h3>
              <div className="space-y-3.5">
                {topLocations.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#8aafaf' }}>No data yet</p>
                ) : topLocations.map(([location, count], i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium truncate max-w-[180px]" style={{ color: '#3d7a7a' }}>{location}</span>
                      <span className="text-xs font-bold" style={{ color: '#069494' }}>{count}</span>
                    </div>
                    <div className="w-full rounded-full h-2.5" style={{ background: '#e8f8f8' }}>
                      <div className="h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${(count / maxLocationCount) * 100}%`, background: i === 0 ? 'linear-gradient(90deg, #FF69B4, #069494)' : i === 1 ? 'linear-gradient(90deg, #069494, #00F0FF)' : '#00F0FF' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Claims */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(6,148,148,0.12)', boxShadow: '0 2px 12px rgba(6,148,148,0.06)' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: '#0a3d3d' }}>✅ Recent Claims</h3>
              {recentClaims.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl">🤷</span>
                  <p className="text-sm mt-2" style={{ color: '#8aafaf' }}>No claims yet</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentClaims.map((food) => (
                    <div key={food.id} className="flex items-center gap-3 p-3 rounded-xl transition hover:shadow-sm"
                      style={{ background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(6,148,148,0.08)' }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(255,105,180,0.1)', border: '1px solid rgba(255,105,180,0.15)' }}>
                        <span className="text-base">✅</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#0a3d3d' }}>{food.title}</p>
                        <p className="text-xs" style={{ color: '#8aafaf' }}>by {food.claimer?.name || 'Unknown'} • {timeAgo(food.claimed_at || food.updated_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Food Table */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(6,148,148,0.12)', boxShadow: '0 2px 12px rgba(6,148,148,0.06)' }}>
            <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(6,148,148,0.08)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold" style={{ color: '#0a3d3d' }}>🍱 All Food Posts</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#8aafaf' }}>{filteredFoods.length} results • Auto-refresh 5s</p>
                </div>
                <div className="relative">
                  <input type="text" placeholder="Search food, location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-56 pl-9 pr-3 py-2.5 text-sm rounded-xl focus:outline-none transition"
                    style={{ background: '#f0fdfd', border: '1px solid rgba(6,148,148,0.15)', color: '#0a3d3d' }} />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
                </div>
              </div>
              <div className="flex gap-1.5 mt-4">
                {[
                  { key: 'all', label: 'All', count: foods.length },
                  { key: 'available', label: 'Available', count: stats.available },
                  { key: 'taken', label: 'Claimed', count: stats.taken },
                  { key: 'expired', label: 'Expired', count: stats.expired },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg transition"
                    style={activeTab === tab.key
                      ? { background: '#069494', color: 'white', boxShadow: '0 2px 8px rgba(6,148,148,0.3)' }
                      : { color: '#8aafaf' }}>
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {filteredFoods.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl">🍽️</span>
                <p className="font-semibold mt-4" style={{ color: '#3d7a7a' }}>No food posts found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px]">
                  <thead>
                    <tr style={{ background: '#f0fdfd', borderBottom: '1px solid rgba(6,148,148,0.08)' }}>
                      {['Food', 'Location', 'Posted By', 'Status', 'Time', 'Action'].map((h, i) => (
                        <th key={h} className={`${i === 5 ? 'text-right' : 'text-left'} px-6 py-3 text-xs font-bold uppercase tracking-wider`} style={{ color: '#069494' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFoods.map((food, idx) => (
                      <tr key={food.id} className="transition"
                        style={{ borderBottom: '1px solid rgba(6,148,148,0.06)', background: idx % 2 === 0 ? 'white' : 'rgba(0,240,255,0.02)' }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {food.image_url ? (
                              <img src={food.image_url} alt="" className="w-11 h-11 rounded-xl object-cover" style={{ border: '2px solid rgba(6,148,148,0.15)' }} />
                            ) : (
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, rgba(255,105,180,0.1), rgba(6,148,148,0.1))', border: '1px solid rgba(6,148,148,0.15)' }}>
                                <span className="text-lg">🍱</span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-sm" style={{ color: '#0a3d3d' }}>{food.title}</p>
                              {food.description && <p className="text-xs truncate max-w-[200px]" style={{ color: '#8aafaf' }}>{food.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="text-sm" style={{ color: '#3d7a7a' }}>📍 {food.location}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: 'linear-gradient(135deg, #FF69B4, #069494)' }}>
                              {food.user?.name?.charAt(0) || '?'}
                            </div>
                            <span className="text-sm font-medium" style={{ color: '#0a3d3d' }}>{food.user?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {food.status === 'available' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ background: 'rgba(6,148,148,0.1)', color: '#069494', border: '1px solid rgba(6,148,148,0.2)' }}>🟢 Available</span>
                          )}
                          {food.status === 'taken' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ background: 'rgba(255,105,180,0.1)', color: '#FF69B4', border: '1px solid rgba(255,105,180,0.2)' }}>✅ Claimed</span>
                          )}
                          {food.status === 'expired' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ background: '#f0f0f0', color: '#999', border: '1px solid #e0e0e0' }}>⏰ Expired</span>
                          )}
                        </td>
                        <td className="px-6 py-4"><span className="text-xs" style={{ color: '#8aafaf' }}>{timeAgo(food.created_at)}</span></td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(food.id)} disabled={deleteLoading === food.id}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition disabled:opacity-50 hover:opacity-80"
                            style={{ color: '#FF69B4', background: 'rgba(255,105,180,0.08)', border: '1px solid rgba(255,105,180,0.2)' }}>
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

          <div className="text-center pt-4 pb-2">
            <p className="text-xs" style={{ color: '#b0d4d4' }}>Rezeki Hunter Admin Panel v1.0 • Campus Food Rescue System</p>
          </div>
        </div>
      </main>
    </div>
  );
}
