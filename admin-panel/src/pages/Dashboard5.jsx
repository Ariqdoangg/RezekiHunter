import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
// Import Icons (PENTING untuk rupa premium)
import { LayoutDashboard, Utensils, Users, MapPin, BarChart3, Settings, LogOut, Search, RefreshCw, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
// Sila import font ini di main.jsx atau index.css: @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

// PALETTE BARU: Lebih "SaaS" & "Clean"
const C = {
  primary: '#0F766E',      // Teal yang lebih deep/mahal
  primaryLight: '#2DD4BF', // Teal cerah untuk accent
  accent: '#F43F5E',       // Rose (ganti Pink biasa)
  dark: '#0f172a',         // Slate dark (bukan hitam mati)
  gray: '#64748b',         // Slate gray (teks secondary)
  bg: '#F0F9FF',           // Very light blue/gray background
  card: '#ffffff',
  border: '#e2e8f0',
  shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Soft shadow
  shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)' // Hover lift
};

export default function Dashboard() {
  // ... (Kekalkan semua state & logic asal awak di sini, tak perlu ubah)
  const [stats, setStats] = useState({ total_foods: 0, available: 0, taken: 0, expired: 0 });
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sidebar, setSidebar] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ... (Kekalkan logic fetch, useEffect, logout, doDelete, ago di sini)
  const fetchData = useCallback(async () => {
    try {
      const [s, f] = await Promise.all([api.get('/foods/stats'), api.get('/foods/all')]);
      setStats(s.data); setFoods(f.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); const i = setInterval(fetchData, 5000); return () => clearInterval(i); }, [fetchData]);
  const doDelete = async (id) => { if (!confirm('Delete?')) return; setDeleting(id); try { await api.delete(`/foods/${id}`); fetchData(); } catch { alert('Failed'); } finally { setDeleting(null); } };
  const logout = () => { api.post('/logout').catch(() => {}); localStorage.clear(); navigate('/'); };
  const ago = (d) => { const s = Math.floor((Date.now() - new Date(d)) / 1000); return s < 60 ? 'Just now' : s < 3600 ? `${Math.floor(s/60)}m ago` : s < 86400 ? `${Math.floor(s/3600)}h ago` : `${Math.floor(s/86400)}d ago`; };

  // ... (Kekalkan logic filter rows, claims, rate, locs)
  const rows = foods.filter(f => (tab === 'all' || f.status === tab) && (f.title + f.location + (f.user?.name || '')).toLowerCase().includes(search.toLowerCase()));
  const claims = foods.filter(f => f.status === 'taken').slice(0, 4);
  const rate = stats.total_foods > 0 ? Math.round((stats.taken / stats.total_foods) * 100) : 0;
  const locs = Object.entries(foods.reduce((a, f) => { a[f.location] = (a[f.location] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxL = locs[0]?.[1] || 1;


  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: C.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}><div className="animate-pulse">Loading Rezeki Hunter...</div></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.dark }}>

      {/* SIDEBAR: Tukar jadi gelap atau gradient supaya contrast dengan content */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
        background: '#0F172A', // Slate 900 (Dark theme sidebar)
        zIndex: 50, display: 'flex', flexDirection: 'column',
        transform: sidebar ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s',
        boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
      }} className="sidebar-panel">

        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #2DD4BF 0%, #0F766E 100%)', display: 'grid', placeItems: 'center', color: 'white', boxShadow: '0 4px 12px rgba(45, 212, 191, 0.3)' }}>
            <Utensils size={20} />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '-0.5px' }}>Rezeki Hunter</div>
            <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 500 }}>Admin Workspace</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '10px 16px' }}>
          {/* Menu Items dengan Hover Effect */}
          {[
            { l: 'Dashboard', i: <LayoutDashboard size={18} /> },
            { l: 'Food Posts', i: <Utensils size={18} /> },
            { l: 'Users', i: <Users size={18} /> },
            { l: 'Locations', i: <MapPin size={18} /> },
            { l: 'Analytics', i: <BarChart3 size={18} /> },
          ].map((x, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10,
              fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s',
              color: i === 0 ? '#fff' : '#94A3B8',
              background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}>
              {x.i} {x.l}
            </div>
          ))}
        </div>

        <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
           <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#F43F5E', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>
             <LogOut size={14} /> Sign Out
           </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, marginLeft: 0, paddingLeft: 0 /* Reset for mobile, adjust via media query */, width: '100%' }} className="main-content">

        {/* TOPBAR: Glassmorphism yang betul */}
        <div style={{
          height: 70, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`,
          position: 'sticky', top: 0, zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={() => setSidebar(true)} className="mobile-menu" style={{ cursor: 'pointer', padding: 8 }}>☰</div>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: 18, margin: 0, letterSpacing: '-0.5px' }}>Dashboard Overview</h1>
              <span style={{ fontSize: 12, color: C.gray, fontWeight: 500 }}>Welcome back, {user.name?.split(' ')[0]} 👋</span>
            </div>
          </div>
          <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 50, background: '#fff', border: `1px solid ${C.border}`, boxShadow: C.shadow, color: C.dark, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>

        <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>

          {/* STATS CARDS: Clean, Shadow, No Border */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            {[
              { label: 'Total Posts', val: stats.total_foods, icon: <LayoutDashboard size={20}/>, c1: '#3B82F6', c2: '#EBF5FF' },
              { label: 'Active Now', val: stats.available, icon: <CheckCircle size={20}/>, c1: '#10B981', c2: '#D1FAE5' },
              { label: 'Rescued', val: stats.taken, icon: <Utensils size={20}/>, c1: '#8B5CF6', c2: '#EDE9FE' },
              { label: 'Expired', val: stats.expired, icon: <AlertCircle size={20}/>, c1: '#F43F5E', c2: '#FFE4E6' },
            ].map((c, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: C.shadow, display: 'flex', flexDirection: 'column', gap: 12, transition: 'transform 0.2s', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: c.c2, color: c.c1, display: 'grid', placeItems: 'center' }}>{c.icon}</div>
                  {i === 1 && <span style={{ background: '#DCFCE7', color: '#166534', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>LIVE</span>}
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.dark, letterSpacing: '-1px', lineHeight: 1 }}>{c.val}</div>
                  <div style={{ fontSize: 13, color: C.gray, fontWeight: 500, marginTop: 6 }}>{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 32 }}>
            {/* RESCUE RATE CARD */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: C.shadow, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Impact Rate</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: C.gray }}>Foods saved vs wasted</p>
                <div style={{ marginTop: 20, fontSize: 36, fontWeight: 800, color: C.primary }}>{rate}%</div>
                <div style={{ fontSize: 12, color: C.primaryLight, fontWeight: 600 }}>Success Rate</div>
              </div>
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                {/* SVG Graph Code Kekal Sama cuma ubah warna stroke */}
                <svg width="120" height="120" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="55" cy="55" r="44" fill="none" stroke="#F1F5F9" strokeWidth="12" strokeLinecap="round" />
                  <circle cx="55" cy="55" r="44" fill="none" stroke={C.primary} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${rate * 2.76} ${276 - rate * 2.76}`} />
                </svg>
              </div>
            </div>

            {/* TOP LOCATIONS */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: C.shadow }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>🔥 Hotspots</h3>
              {locs.map(([loc, cnt], i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                    <span>{loc}</span>
                    <span style={{ color: C.dark, fontWeight: 700 }}>{cnt}</span>
                  </div>
                  <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(cnt/maxL)*100}%`, background: C.primary, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TABLE SECTION */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: C.shadow, overflow: 'hidden' }}>
            <div style={{ padding: 24, borderBottom: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, background: '#F8FAFC', padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
                {['all', 'available', 'taken'].map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                    background: tab === t ? '#fff' : 'transparent',
                    color: tab === t ? C.dark : C.gray,
                    boxShadow: tab === t ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                  }}>{t}</button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: C.gray }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..."
                  style={{ padding: '8px 12px 8px 36px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, width: 200, outline: 'none' }} />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#F8FAFC' }}>
                  <tr>
                    {['Food Details', 'Location', 'Status', 'Posted', 'Action'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '16px 24px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f) => (
                    <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s' }} className="hover:bg-gray-50">
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <img src={f.image_url || 'https://via.placeholder.com/40'} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', background: '#f1f5f9' }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: C.dark }}>{f.title}</div>
                            <div style={{ fontSize: 12, color: C.gray }}>by {f.user?.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 13, color: C.gray }}><div style={{display:'flex', gap:6, alignItems:'center'}}><MapPin size={14}/> {f.location}</div></td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: f.status === 'available' ? '#DCFCE7' : f.status === 'taken' ? '#F3E8FF' : '#FEE2E2',
                          color: f.status === 'available' ? '#166534' : f.status === 'taken' ? '#6B21A8' : '#991B1B'
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}/>
                          {f.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 13, color: C.gray }}>{ago(f.created_at)}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <button onClick={() => doDelete(f.id)} style={{ padding: 8, borderRadius: 6, border: `1px solid ${C.border}`, background: '#fff', cursor: 'pointer', color: C.accent }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* CSS untuk media queries sidebar */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { margin: 0; background: #F0F9FF; }
        .sidebar-panel { transform: translateX(-100%); }
        .main-content { margin-left: 0; }
        @media (min-width: 1024px) {
          .sidebar-panel { transform: translateX(0) !important; }
          .main-content { margin-left: 240px !important; }
          .mobile-menu { display: none !important; }
        }
        tr:hover { background-color: #F8FAFC; }
      `}</style>
    </div>
  );
}
