import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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
        setError('Access denied. Admin only.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#f0fdfd' }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#FF69B4' }}></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: '#00F0FF' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl" style={{ background: '#069494' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-xl mb-4"
            style={{ background: 'linear-gradient(135deg, #FF69B4, #069494)', boxShadow: '0 8px 30px rgba(255,105,180,0.3)' }}>
            <span className="text-4xl">🍱</span>
          </div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#0a3d3d' }}>Rezeki Hunter</h1>
          <p className="mt-1 font-medium" style={{ color: '#069494' }}>Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8" style={{ border: '1px solid rgba(6,148,148,0.12)', boxShadow: '0 8px 40px rgba(6,148,148,0.1)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: '#0a3d3d' }}>Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,105,180,0.08)', border: '1px solid rgba(255,105,180,0.2)', color: '#FF69B4' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3d7a7a' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition text-sm"
                style={{ background: '#f0fdfd', border: '2px solid rgba(6,148,148,0.12)', color: '#0a3d3d' }}
                onFocus={e => e.target.style.borderColor = '#069494'}
                onBlur={e => e.target.style.borderColor = 'rgba(6,148,148,0.12)'}
                placeholder="admin@rezeki.com" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3d7a7a' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition text-sm"
                style={{ background: '#f0fdfd', border: '2px solid rgba(6,148,148,0.12)', color: '#0a3d3d' }}
                onFocus={e => e.target.style.borderColor = '#069494'}
                onBlur={e => e.target.style.borderColor = 'rgba(6,148,148,0.12)'}
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #FF69B4, #069494)', boxShadow: '0 4px 20px rgba(255,105,180,0.3)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#8aafaf' }}>Rezeki Hunter Admin Panel v1.0</p>
      </div>
    </div>
  );
}
