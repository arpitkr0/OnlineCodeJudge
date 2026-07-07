import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, KeyRound, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(username, email, password, inviteCode || null);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Username or email may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-grid-pattern animate-fade-in">
      
      {/* Ambient Glow Effects */}
      <div className="ambient-glow-2" />
      <div className="ambient-glow-3" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-accent/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-verdict-pass/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl relative z-10 hover:border-cyan-500/30 transition-all duration-500 gradient-border">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-fuchsia-600 p-[1.5px] mx-auto shadow-xl shadow-cyan-500/20 mb-6">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center font-mono font-black text-white text-lg tracking-tighter">
              JX
            </div>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Create Profile
          </h2>
          <p className="mt-2 text-xs uppercase tracking-widest font-extrabold text-slate-400">
            JudgeX — Where Algorithms Compete
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 p-4 rounded-2xl text-xs flex items-center space-x-2 animate-pulse">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-2 font-mono">
              Username *
            </label>
            <div className="relative group">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full pl-11 pr-4 py-3 bg-dark-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 input-glow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-2 font-mono">
              Email Address *
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-dark-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 input-glow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-2 font-mono">
              Password *
            </label>
            <div className="relative group">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-4 py-3 bg-dark-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 input-glow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 font-mono flex items-center justify-between">
              <span>Proctor Invite Code (Optional)</span>
              <span className="text-[10px] text-fuchsia-400 font-bold lowercase">for administrative roles</span>
            </label>
            <div className="relative group">
              <ShieldAlert className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-fuchsia-400 transition-colors" />
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Leave blank for regular Candidate role"
                className="w-full pl-11 pr-4 py-3 bg-dark-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 font-mono text-fuchsia-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-extrabold tracking-widest uppercase text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-2 mt-6 ${
              loading
                ? 'bg-slate-700 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-600 hover:opacity-95 shadow-cyan-500/25 hover:shadow-fuchsia-500/40 hover:scale-102 active:scale-98 btn-shine'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Candidate Profile...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register & Enter Arena</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-6 border-t border-slate-800/80">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 font-extrabold hover:text-cyan-300 hover:underline transition-colors">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
