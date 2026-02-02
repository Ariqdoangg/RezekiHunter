import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Utensils, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      const { token, user } = res.data;
      if (user.role !== 'admin') {
        setError('Access denied. Admin accounts only.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const P = {
    teal: '#0F766E',
    tealLight: '#2DD4BF',
    pink: '#FF69B4',
    dark: '#0F172A',
    gray: '#64748B',
    border: '#E2E8F0',
    bg: '#F8FFFE',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: P.bg, fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: `${P.tealLight}12`, filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -100, width: 350, height: 350, borderRadius: '50%', background: `${P.pink}10`, filter: 'blur(60px)' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
            background: `linear-gradient(135deg, ${P.tealLight}, ${P.teal})`,
            display: 'grid', placeItems: 'center',
            boxShadow: `0 12px 32px ${P.tealLight}30`,
          }}>
            <Utensils size={28} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: P.dark, letterSpacing: '-0.5px' }}>Rezeki Hunter</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: P.gray, fontWeight: 500 }}>Admin Dashboard</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: '36px 32px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 40px -5px rgba(0,0,0,0.04)',
          border: `1px solid ${P.border}`,
        }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: P.dark }}>Welcome back</h2>
          <p style={{ margin: '0 0 28px', fontSize: 13, color: P.gray }}>Sign in to manage campus food rescue</p>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 20,
              background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
              fontSize: 13, fontWeight: 500,
            }}>{error}</div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: P.dark, marginBottom: 8 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@rezeki.com" required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12,
                    border: `1.5px solid ${P.border}`, fontSize: 14, color: P.dark,
                    outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
                    background: '#FAFAFA',
                  }}
                  onFocus={e => { e.target.style.borderColor = P.tealLight; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = P.border; e.target.style.background = '#FAFAFA'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: P.dark, marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12,
                    border: `1.5px solid ${P.border}`, fontSize: 14, color: P.dark,
                    outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
                    background: '#FAFAFA',
                  }}
                  onFocus={e => { e.target.style.borderColor = P.tealLight; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = P.border; e.target.style.background = '#FAFAFA'; }}
                />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg, ${P.teal}, ${P.tealLight})`,
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 4px 16px ${P.tealLight}30`,
              opacity: loading ? 0.7 : 1, transition: '0.2s',
            }}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 24 }}>
          Rezeki Hunter Admin Panel v1.0
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
