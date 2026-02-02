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
      const [statsRes, foodsRes] = await Promise.all([api.get('/foods/stats'), api.get('/foods/all')]);
      setStats(statsRes.data);
      setFoods(foodsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 5000); return () => clearInterval(i); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food post?')) return;
    setDeleteLoading(id);
    try { await api.delete(`/foods/${id}`); setFoods(f => f.filter(x => x.id !== id)); fetchData(); }
    catch { alert('Failed to delete'); }
    finally { setDeleteLoading(null); }
  };

  const handleLogout = () => { api.post('/logout').catch(() => {}); localStorage.clear(); navigate('/'); };

  const timeAgo = (d) => { const s = Math.floor((Date.now() - new Date(d)) / 1000); if (s < 60) return 'Just now'; if (s < 3600) return `${Math.floor(s/60)}m ago`; if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; };

  const filtered = foods.filter(f => {
    const tab = activeTab === 'all' || f.status === activeTab;
    const search = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.location.toLowerCase().includes(searchQuery.toLowerCase());
    return tab && search;
  });

  const recentClaims = foods.filter(f => f.status === 'taken').slice(0, 4);
  const rescueRate = stats.total_foods > 0 ? Math.round((stats.taken / stats.total_foods) * 100) : 0;
  const locStats = foods.reduce((a, f) => { a[f.location] = (a[f.location] || 0) + 1; return a; }, {});
  const topLocs = Object.entries(locStats).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxLoc = topLocs[0]?.[1] || 1;

  const C = { pink: '#FF69B4', teal: '#069494', cyan: '#00F0FF', dark: '#0a3d3d', mid: '#3d7a7a', light: '#8aafaf', bg: '#f0fdfd', white: '#ffffff' };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse" style={{ background: `${C.teal}15`, border: `2px solid ${C.teal}30` }}><span className="text-3xl">🍱</span></div>
        <p className="font-medium" style={{ color: C.teal }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: C.bg }}>
      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-60 z-50 flex flex-col shrink-0 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} style={{ background: C.teal }}>
        <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: C.pink }}><span className="text-lg">🍱</span></div>
            <div><p className="text-sm font-bold text-white leading-tight">Rezeki Hunter</p><p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin Panel</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {['📊 Dashboard', '🍱 Food Posts', '👥 Users', '📍 Locations', '📈 Analytics', '⚙️ Settings'].map((item, i) => (
            <a key={i} href="#" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition"
              style={i === 0 ? { background: 'rgba(255,255,255,0.18)', color: '#fff' } : { color: 'rgba(255,255,255,0.65)' }}>{item}</a>
          ))}
        </nav>
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: C.pink }}>{user.name?.[0]}</div>
            <div className="min-w-0"><p className="text-xs font-medium text-white truncate">{user.name}</p><p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{user.email}</p></div>
          </div>
          <button onClick={handleLogout} className="w-full mt-2 px-3 py-2 text-xs font-medium rounded-lg transition hover:opacity-80"
            style={{ color: C.pink, background: 'rgba(255,105,180,0.15)', border: '1px solid rgba(255,105,180,0.25)' }}>← Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-5 shrink-0 backdrop-blur-lg" style={{ background: 'rgba(240,253,253,0.88)', borderBottom: `1px solid ${C.teal}15` }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-md text-white" style={{ background: C.teal }} onClick={() => setSidebarOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div><h2 className="text-sm font-bold" style={{ color: C.dark }}>Dashboard</h2><p className="text-[10px]" style={{ color: C.teal }}>Real-time monitoring</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: `${C.cyan}15`, color: C.teal, border: `1px solid ${C.cyan}30` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.cyan }}></span>Live
            </span>
            <button onClick={fetchData} className="px-3 py-1.5 text-[10px] font-semibold rounded-md text-white" style={{ background: C.teal }}>↻ Refresh</button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5 space-y-5">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Posts', val: stats.total_foods, icon: '📊', color: C.pink },
              { label: 'Available', val: stats.available, icon: '🟢', color: C.teal, tag: 'Active' },
              { label: 'Rescued', val: stats.taken, icon: '✅', color: '#00bcd4', tag: `${rescueRate}%` },
              { label: 'Expired', val: stats.expired, icon: '⏰', color: C.pink },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-4 transition hover:-translate-y-0.5 hover:shadow-md" style={{ border: `1px solid ${c.color}20` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: `${c.color}10`, border: `1px solid ${c.color}20` }}>{c.icon}</div>
                  {c.tag && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: c.color, background: `${c.color}10` }}>{c.tag}</span>}
                </div>
                <p className="text-2xl font-extrabold" style={{ color: c.color }}>{c.val}</p>
                <p className="text-[11px] mt-0.5" style={{ color: C.light }}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Rescue Rate */}
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${C.teal}12` }}>
              <p className="text-xs font-bold mb-3" style={{ color: C.dark }}>🎯 Rescue Rate</p>
              <div className="flex items-center justify-center">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="48" fill="none" stroke="#e8f8f8" strokeWidth="12"/>
                    <circle cx="60" cy="60" r="48" fill="none" stroke="url(#rg)" strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={`${rescueRate * 3.02} ${302 - rescueRate * 3.02}`}/>
                    <defs><linearGradient id="rg"><stop offset="0%" stopColor={C.pink}/><stop offset="100%" stopColor={C.teal}/></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold" style={{ color: C.teal }}>{rescueRate}%</span>
                    <span className="text-[9px]" style={{ color: C.light }}>rescued</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-3 text-[10px]" style={{ color: C.light }}>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: C.teal }}/>Rescued</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#e8f8f8' }}/>Remaining</span>
              </div>
            </div>

            {/* Top Locations */}
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${C.teal}12` }}>
              <p className="text-xs font-bold mb-3" style={{ color: C.dark }}>📍 Top Locations</p>
              <div className="space-y-2.5">
                {topLocs.length === 0 ? <p className="text-xs text-center py-6" style={{ color: C.light }}>No data</p> :
                  topLocs.map(([loc, cnt], i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1"><span className="text-[11px] truncate max-w-[160px]" style={{ color: C.mid }}>{loc}</span><span className="text-[11px] font-bold" style={{ color: C.teal }}>{cnt}</span></div>
                      <div className="w-full h-2 rounded-full" style={{ background: '#e8f8f8' }}>
                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${(cnt/maxLoc)*100}%`, background: i === 0 ? `linear-gradient(90deg,${C.pink},${C.teal})` : i === 1 ? `linear-gradient(90deg,${C.teal},${C.cyan})` : C.cyan }}/>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Recent Claims */}
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${C.teal}12` }}>
              <p className="text-xs font-bold mb-3" style={{ color: C.dark }}>✅ Recent Claims</p>
              {recentClaims.length === 0 ? <div className="text-center py-6"><span className="text-3xl">🤷</span><p className="text-xs mt-1" style={{ color: C.light }}>No claims yet</p></div> :
                <div className="space-y-2">
                  {recentClaims.map(f => (
                    <div key={f.id} className="flex items-center gap-2.5 p-2.5 rounded-lg" style={{ background: `${C.cyan}06`, border: `1px solid ${C.teal}08` }}>
                      <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-sm" style={{ background: `${C.pink}10`, border: `1px solid ${C.pink}15` }}>✅</div>
                      <div className="min-w-0"><p className="text-xs font-semibold truncate" style={{ color: C.dark }}>{f.title}</p><p className="text-[10px]" style={{ color: C.light }}>{f.claimer?.name || 'Unknown'} • {timeAgo(f.claimed_at || f.updated_at)}</p></div>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${C.teal}12` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.teal}08` }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: C.dark }}>🍱 All Food Posts</h3>
                  <p className="text-[10px]" style={{ color: C.light }}>{filtered.length} results • Auto-refresh 5s</p>
                </div>
                <div className="relative">
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-44 pl-7 pr-3 py-2 text-xs rounded-lg focus:outline-none" style={{ background: C.bg, border: `1px solid ${C.teal}15`, color: C.dark }}/>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px]">🔍</span>
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                {[{ k:'all', l:'All', c:foods.length }, { k:'available', l:'Available', c:stats.available }, { k:'taken', l:'Claimed', c:stats.taken }, { k:'expired', l:'Expired', c:stats.expired }].map(t => (
                  <button key={t.k} onClick={() => setActiveTab(t.k)} className="px-3 py-1.5 text-[11px] font-semibold rounded-md transition"
                    style={activeTab === t.k ? { background: C.teal, color: '#fff' } : { color: C.light }}>{t.l} ({t.c})</button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12"><span className="text-4xl">🍽️</span><p className="text-xs mt-3" style={{ color: C.light }}>No posts found</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {['Food','Location','Posted By','Status','Time',''].map((h,i) => (
                        <th key={h||i} className={`${i===5?'text-right':'text-left'} px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap`} style={{ color: C.teal, borderBottom: `1px solid ${C.teal}10` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((f, idx) => (
                      <tr key={f.id} style={{ borderBottom: `1px solid ${C.teal}06`, background: idx%2===0? '#fff' : `${C.cyan}03` }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm"
                              style={{ background: `linear-gradient(135deg,${C.pink}12,${C.teal}12)`, border: `1px solid ${C.teal}15` }}>
                              {f.image_url ? <img src={f.image_url} alt="" className="w-9 h-9 rounded-lg object-cover"/> : '🍱'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate" style={{ color: C.dark }}>{f.title}</p>
                              {f.description && <p className="text-[10px] truncate max-w-[160px]" style={{ color: C.light }}>{f.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-xs" style={{ color: C.mid }}>📍 {f.location}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: `linear-gradient(135deg,${C.pink},${C.teal})` }}>{f.user?.name?.[0]}</div>
                            <span className="text-xs" style={{ color: C.dark }}>{f.user?.name || '?'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={f.status==='available' ? { background:`${C.teal}10`, color:C.teal, border:`1px solid ${C.teal}20` }
                              : f.status==='taken' ? { background:`${C.pink}10`, color:C.pink, border:`1px solid ${C.pink}20` }
                              : { background:'#f0f0f0', color:'#999', border:'1px solid #e0e0e0' }}>
                            {f.status==='available'?'🟢 Available':f.status==='taken'?'✅ Claimed':'⏰ Expired'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-[10px]" style={{ color: C.light }}>{timeAgo(f.created_at)}</span></td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button onClick={() => handleDelete(f.id)} disabled={deleteLoading===f.id}
                            className="px-2.5 py-1 text-[10px] font-semibold rounded-md transition hover:opacity-80 disabled:opacity-50"
                            style={{ color: C.pink, background:`${C.pink}08`, border:`1px solid ${C.pink}20` }}>
                            {deleteLoading===f.id ? '...' : '🗑 Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-center text-[10px] py-2" style={{ color: '#c0dede' }}>Rezeki Hunter Admin Panel v1.0 • Campus Food Rescue</p>
        </div>
      </div>
    </div>
  );
}
