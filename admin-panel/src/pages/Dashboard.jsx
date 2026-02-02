import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  LayoutDashboard, Utensils, Users, MapPin, BarChart3,
  LogOut, Search, RefreshCw, Trash2, CheckCircle, AlertCircle,
  TrendingUp, Flame, Clock, ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_foods: 0, available: 0, taken: 0, expired: 0 });
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sidebar, setSidebar] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = useCallback(async () => {
    try {
      const [s, f] = await Promise.all([api.get('/foods/stats'), api.get('/foods/all')]);
      setStats(s.data);
      setFoods(f.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 5000);
    return () => clearInterval(i);
  }, [fetchData]);

  const doDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    setDeleting(id);
    try { await api.delete(`/foods/${id}`); fetchData(); }
    catch { alert('Failed'); }
    finally { setDeleting(null); }
  };

  const logout = () => {
    api.post('/logout').catch(() => {});
    localStorage.clear();
    navigate('/');
  };

  const ago = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const rows = foods.filter(f =>
    (tab === 'all' || f.status === tab) &&
    (f.title + f.location + (f.user?.name || '')).toLowerCase().includes(search.toLowerCase())
  );
  const claims = foods.filter(f => f.status === 'taken').slice(0, 5);
  const rate = stats.total_foods > 0 ? Math.round((stats.taken / stats.total_foods) * 100) : 0;
  const locs = Object.entries(
    foods.reduce((a, f) => { a[f.location] = (a[f.location] || 0) + 1; return a; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxL = locs[0]?.[1] || 1;

  // Color palette
  const P = {
    pink: '#FF69B4',
    pinkSoft: '#FFF0F6',
    teal: '#0F766E',
    tealLight: '#2DD4BF',
    tealSoft: '#F0FDFA',
    cyan: '#00F0FF',
    dark: '#0F172A',
    gray: '#64748B',
    grayLight: '#94A3B8',
    bg: '#F8FFFE',
    card: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: P.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${P.tealLight}, ${P.teal})`, display: 'grid', placeItems: 'center', margin: '0 auto 16px', boxShadow: `0 8px 24px ${P.tealLight}40` }}>
          <Utensils size={24} color="#fff" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: P.gray }}>Loading Rezeki Hunter...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: P.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: P.dark }}>

      {/* Mobile overlay */}
      {sidebar && <div onClick={() => setSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 45, backdropFilter: 'blur(4px)' }} />}

      {/* Sidebar */}
      <aside className="rh-sidebar" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 250, background: P.dark,
        zIndex: 50, display: 'flex', flexDirection: 'column',
        transform: sidebar ? 'translateX(0)' : undefined,
        boxShadow: '4px 0 32px rgba(0,0,0,0.1)',
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `linear-gradient(135deg, ${P.tealLight}, ${P.teal})`,
            display: 'grid', placeItems: 'center',
            boxShadow: `0 4px 16px ${P.tealLight}30`,
          }}>
            <Utensils size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px' }}>Rezeki Hunter</div>
            <div style={{ color: P.grayLight, fontSize: 11, fontWeight: 500 }}>Admin Workspace</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 16px' }}>
          {[
            { label: 'Dashboard', icon: <LayoutDashboard size={18} />, active: true },
            { label: 'Food Posts', icon: <Utensils size={18} /> },
            { label: 'Users', icon: <Users size={18} /> },
            { label: 'Locations', icon: <MapPin size={18} /> },
            { label: 'Analytics', icon: <BarChart3 size={18} /> },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 16px', borderRadius: 10, marginBottom: 2,
              fontSize: 13, fontWeight: item.active ? 600 : 500, cursor: 'pointer',
              color: item.active ? '#fff' : '#94A3B8',
              background: item.active ? 'rgba(45,212,191,0.12)' : 'transparent',
              borderLeft: item.active ? `3px solid ${P.tealLight}` : '3px solid transparent',
              transition: 'all 0.15s',
            }}>
              {item.icon}
              {item.label}
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '8px 4px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, ${P.pink}, ${P.teal})`,
              color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700,
            }}>{user.name?.[0] || 'A'}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ color: '#64748B', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px', borderRadius: 10, background: 'transparent',
            border: `1px solid ${P.pink}35`, color: P.pink,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: '0.2s',
          }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="rh-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 68, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${P.border}`, position: 'sticky', top: 0, zIndex: 40, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="rh-hamburger" onClick={() => setSidebar(true)} style={{
              width: 36, height: 36, borderRadius: 8, background: P.dark, color: '#fff',
              border: 'none', fontSize: 16, cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}>☰</button>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>Dashboard Overview</h1>
              <p style={{ margin: 0, fontSize: 12, color: P.gray, fontWeight: 500 }}>Welcome back, {user.name?.split(' ')[0] || 'Admin'} 👋</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: `${P.tealLight}15`, border: `1px solid ${P.tealLight}25`,
              fontSize: 11, fontWeight: 600, color: P.teal,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: P.tealLight, animation: 'pulse 2s infinite' }} />
              Live
            </div>
            <button onClick={fetchData} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px',
              borderRadius: 50, background: '#fff', border: `1px solid ${P.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)', color: P.dark,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
          <div style={{ maxWidth: 1300, margin: '0 auto' }}>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Posts', val: stats.total_foods, icon: <LayoutDashboard size={20} />, c: '#3B82F6', bg: '#EFF6FF' },
                { label: 'Active Now', val: stats.available, icon: <CheckCircle size={20} />, c: '#10B981', bg: '#ECFDF5', badge: 'LIVE' },
                { label: 'Rescued', val: stats.taken, icon: <TrendingUp size={20} />, c: '#8B5CF6', bg: '#F5F3FF', badge: `${rate}%` },
                { label: 'Expired', val: stats.expired, icon: <AlertCircle size={20} />, c: P.pink, bg: P.pinkSoft },
              ].map((c, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 16, padding: '22px 24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, color: c.c, display: 'grid', placeItems: 'center' }}>{c.icon}</div>
                    {c.badge && (
                      <span style={{
                        background: i === 1 ? '#DCFCE7' : `${c.c}12`, color: i === 1 ? '#166534' : c.c,
                        fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.3px',
                      }}>{c.badge}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1, color: P.dark }}>{c.val}</div>
                  <div style={{ fontSize: 13, color: P.gray, fontWeight: 500, marginTop: 6 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Middle Row: Impact Rate + Hotspots + Recent Claims */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

              {/* Impact Rate */}
              <div style={{
                background: '#fff', borderRadius: 16, padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: P.dark }}>Impact Rate</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: P.gray }}>Foods saved vs wasted</p>
                  <div style={{ marginTop: 20, fontSize: 36, fontWeight: 800, color: P.teal, letterSpacing: '-1px' }}>{rate}%</div>
                  <div style={{ fontSize: 12, color: P.tealLight, fontWeight: 600, marginTop: 2 }}>Success Rate</div>
                </div>
                <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                  <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke={P.borderLight} strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={P.teal} strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${rate * 2.51} ${251 - rate * 2.51}`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                    <Utensils size={20} color={P.teal} />
                  </div>
                </div>
              </div>

              {/* Hotspots */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                  <Flame size={16} color="#F97316" />
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Hotspots</h3>
                </div>
                {locs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: P.gray, fontSize: 13 }}>No data yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {locs.map(([loc, cnt], i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                          <span style={{ color: P.dark }}>{loc}</span>
                          <span style={{ fontWeight: 700, color: P.teal }}>{cnt}</span>
                        </div>
                        <div style={{ height: 6, background: P.borderLight, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 3, transition: 'width 0.6s ease',
                            width: `${(cnt / maxL) * 100}%`,
                            background: i === 0 ? `linear-gradient(90deg, ${P.pink}, ${P.teal})` :
                                        i === 1 ? `linear-gradient(90deg, ${P.teal}, ${P.tealLight})` : P.tealLight,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Claims */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={16} color={P.teal} />
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Recent Claims</h3>
                  </div>
                  <span style={{ fontSize: 11, color: P.gray, fontWeight: 500 }}>{claims.length} total</span>
                </div>
                {claims.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: P.gray, fontSize: 13 }}>No claims yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {claims.map(f => (
                      <div key={f.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                        borderRadius: 10, background: P.tealSoft, border: `1px solid ${P.tealLight}15`,
                        transition: 'background 0.15s',
                      }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8,
                          background: `linear-gradient(135deg, ${P.tealLight}30, ${P.teal}20)`,
                          display: 'grid', placeItems: 'center', flexShrink: 0,
                        }}>
                          <CheckCircle size={14} color={P.teal} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: P.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.title}</div>
                          <div style={{ fontSize: 10, color: P.gray, marginTop: 1 }}>
                            {f.claimer?.name || 'Unknown'} · {ago(f.claimed_at || f.updated_at)}
                          </div>
                        </div>
                        <ChevronRight size={14} color={P.grayLight} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${P.border}`, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>All Food Posts</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: P.gray }}>{rows.length} results · Auto-refresh 5s</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Tabs */}
                  <div style={{ display: 'flex', background: P.borderLight, padding: 3, borderRadius: 10, border: `1px solid ${P.border}` }}>
                    {[
                      { k: 'all', l: 'All' },
                      { k: 'available', l: 'Available' },
                      { k: 'taken', l: 'Claimed' },
                      { k: 'expired', l: 'Expired' },
                    ].map(t => (
                      <button key={t.k} onClick={() => setTab(t.k)} style={{
                        padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s',
                        background: tab === t.k ? '#fff' : 'transparent',
                        color: tab === t.k ? P.dark : P.gray,
                        boxShadow: tab === t.k ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      }}>{t.l}</button>
                    ))}
                  </div>
                  {/* Search */}
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: P.grayLight }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..."
                      style={{
                        padding: '8px 14px 8px 34px', borderRadius: 10, border: `1px solid ${P.border}`,
                        fontSize: 13, width: 180, outline: 'none', color: P.dark, background: '#fff',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.target.style.borderColor = P.tealLight}
                      onBlur={e => e.target.style.borderColor = P.border}
                    />
                  </div>
                </div>
              </div>

              {/* Table body */}
              {rows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Utensils size={40} color={P.border} />
                  <p style={{ fontSize: 14, color: P.gray, marginTop: 12, fontWeight: 500 }}>No posts found</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        {['Food Details', 'Location', 'Status', 'Posted', 'Action'].map(h => (
                          <th key={h} style={{
                            textAlign: h === 'Action' ? 'center' : 'left',
                            padding: '14px 24px', fontSize: 11, fontWeight: 700,
                            color: P.gray, textTransform: 'uppercase', letterSpacing: '0.5px',
                            borderBottom: `1px solid ${P.border}`,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((f, idx) => (
                        <tr key={f.id} className="rh-row" style={{ borderBottom: `1px solid ${P.borderLight}`, transition: 'background 0.15s' }}>
                          <td style={{ padding: '14px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                              {f.image_url ? (
                                <img src={f.image_url} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', background: P.borderLight }} />
                              ) : (
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: P.borderLight, display: 'grid', placeItems: 'center' }}>
                                  <Utensils size={18} color={P.grayLight} />
                                </div>
                              )}
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: P.dark }}>{f.title}</div>
                                <div style={{ fontSize: 12, color: P.gray, marginTop: 1 }}>by {f.user?.name || '?'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 24px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: P.gray }}>
                              <MapPin size={14} color={P.grayLight} /> {f.location}
                            </div>
                          </td>
                          <td style={{ padding: '14px 24px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                              ...(f.status === 'available'
                                ? { background: '#DCFCE7', color: '#166534' }
                                : f.status === 'taken'
                                ? { background: '#F3E8FF', color: '#7C3AED' }
                                : { background: '#FEE2E2', color: '#991B1B' }),
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                              {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: '14px 24px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: P.gray }}>
                              <Clock size={13} color={P.grayLight} /> {ago(f.created_at)}
                            </div>
                          </td>
                          <td style={{ padding: '14px 24px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <button onClick={() => doDelete(f.id)} disabled={deleting === f.id}
                              style={{
                                width: 36, height: 36, borderRadius: 8,
                                border: `1px solid ${P.border}`, background: '#fff',
                                cursor: 'pointer', color: P.pink, display: 'grid', placeItems: 'center',
                                opacity: deleting === f.id ? 0.4 : 1, transition: '0.15s',
                              }}
                              title="Delete post">
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p style={{ textAlign: 'center', padding: '20px 0', fontSize: 11, color: '#CBD5E1' }}>
              Rezeki Hunter Admin v1.0 · Campus Food Rescue System
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .rh-sidebar { transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .rh-main { margin-left: 0; }
        .rh-row:hover { background: #F8FAFC !important; }
        @media (min-width: 1024px) {
          .rh-sidebar { transform: translateX(0) !important; position: fixed !important; }
          .rh-main { margin-left: 250px !important; }
          .rh-hamburger { display: none !important; }
        }
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="gridTemplateColumns: 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
