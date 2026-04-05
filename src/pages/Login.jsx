import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, User as UserIcon } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function Login() {
  const [isApply, setIsApply] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isApply) {
      if (!name || !email || !password) {
        setError('All fields are required');
        return;
      }
      setIsApplying(true);
      try {
        const res = await apiFetch('/api/auth/apply', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to submit application');
        }
        setSuccess('Application submitted successfully! You can now sign in.');
        setIsApply(false);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsApplying(false);
      }
    } else {
      try {
        const data = await login(email, password);
        const role = data.user.role.replace('ROLE_', '');
        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'MANAGER') navigate('/manager');
        else if (role === 'CANDIDATE') navigate('/candidate-dashboard');
        else navigate('/profile');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const quickLogin = async (preset) => {
    setError('');
    setSuccess('');
    try {
      const data = await login(preset.email, preset.password);
      const role = data.user.role.replace('ROLE_', '');
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'MANAGER') navigate('/manager');
      else if (role === 'CANDIDATE') navigate('/candidate-dashboard');
      else navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  const presets = [
    { label: 'Admin', email: 'admin@precision.com', password: 'admin123', color: 'bg-red-500/10 text-red-400 hover:bg-red-500/20' },
    { label: 'Manager', email: 'manager.eng@precision.com', password: 'manager123', color: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' },
    { label: 'Employee', email: 'anjali@precision.com', password: 'employee123', color: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' },
    { label: 'Candidate', email: 'arjun.app@precision.com', password: 'candidate123', color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' },
  ];


  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-on-primary font-extrabold text-2xl mb-4 shadow-lg shadow-primary/20">
            P
          </div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">
            {isApply ? 'Join Precision' : 'Welcome back'}
          </h1>
          <p className="text-on-surface-variant mt-2">
            {isApply ? 'Apply for an open position' : 'Sign in to Precision ATS'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-low rounded-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isApply && (
              <div>
                <label className="text-sm font-medium text-on-surface-variant mb-1.5 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full bg-surface-container rounded-xl pl-11 pr-4 py-3 text-on-surface placeholder-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-on-surface-variant mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@precision.com"
                  required
                  className="w-full bg-surface-container rounded-xl pl-11 pr-4 py-3 text-on-surface placeholder-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface-variant mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface-container rounded-xl pl-11 pr-4 py-3 text-on-surface placeholder-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || isApplying}
              className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isApply ? (isApplying ? 'Submitting...' : 'Apply Now') : (loading ? 'Signing in...' : 'Sign In')}
              {!loading && !isApplying && <ArrowRight className="w-4 h-4" />}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setIsApply(!isApply); setError(''); setSuccess(''); }}
                className="text-sm text-primary hover:underline font-medium"
              >
                {isApply ? 'Already have an account? Sign In' : 'Looking for a job? Apply Here'}
              </button>
            </div>
          </form>

          {/* Quick Login */}
          {!isApply && (
            <div className="mt-8 pt-6 border-t border-outline-variant/10">
              <p className="text-xs text-on-surface-variant text-center mb-3 uppercase tracking-wider font-semibold">Quick Login</p>
              <div className="flex gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => quickLogin(p)}
                    disabled={loading}
                    className={`flex-1 text-sm font-semibold py-2.5 rounded-xl transition-colors ${p.color}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
