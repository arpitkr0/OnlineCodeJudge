import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, History, LogOut, Shield, LogIn, UserPlus, Cpu, Zap, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-nav animate-load-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - Monospace technical aesthetic */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="logo-glow relative w-11 h-11 rounded-xl bg-surface border border-surface-border flex items-center justify-center font-mono font-extrabold text-amber-accent shadow-inner group-hover:border-amber-accent/60 transition-all duration-300">
              <span className="text-lg tracking-tighter">JX</span>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-verdict-pass border-2 border-base animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-mono font-bold tracking-tight text-text-primary flex items-center gap-1">
                Judge<span className="text-amber-accent">X</span>
              </span>
              <span className="block text-[9px] font-mono uppercase font-semibold tracking-[0.25em] text-text-muted -mt-0.5 group-hover:text-text-primary transition-colors duration-300">
                Where Algorithms Compete
              </span>
            </div>
          </Link>

          {/* Navigation Links - Restrained glass panel */}
          <div className="hidden md:flex items-center space-x-1 bg-surface/90 p-1.5 rounded-xl border border-surface-border shadow-inner">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                isActive('/') 
                  ? 'bg-surface-light text-amber-accent border border-surface-border shadow-sm' 
                  : 'text-text-muted hover:bg-surface-card hover:text-text-primary'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-amber-accent" />
              <span className="nav-link-animated">Arena Challenges</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/history"
                className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                  isActive('/history') 
                    ? 'bg-surface-light text-amber-accent border border-surface-border shadow-sm' 
                    : 'text-text-muted hover:bg-surface-card hover:text-text-primary'
                }`}
              >
                <History className="w-3.5 h-3.5 text-verdict-pass" />
                <span className="nav-link-animated">Execution Log</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                  isActive('/admin') 
                    ? 'bg-surface-light text-amber-accent border border-surface-border shadow-sm' 
                    : 'text-text-muted hover:bg-surface-card hover:text-text-primary'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="nav-link-animated">Command Center</span>
              </Link>
            )}
          </div>

          {/* Right Action / User Profile */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3.5 bg-surface px-3.5 py-2 rounded-xl border border-surface-border shadow-lg hover:border-surface-hover transition-all duration-200 glow-card">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-light border border-surface-border flex items-center justify-center font-mono font-bold text-amber-accent text-xs">
                    {(user?.username || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-mono font-bold text-text-primary flex items-center gap-1.5">
                      {user?.username || 'User'}
                      {user.role === 'ADMIN' && (
                        <span className="bg-amber-accent/15 text-amber-accent text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border border-amber-accent/30">
                          PROCTOR
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-text-muted font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-verdict-pass inline-block" />
                      Connected
                    </div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-text-muted hover:text-verdict-fail hover:bg-verdict-fail/15 transition-all duration-150"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5 font-mono">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-surface-border transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-base bg-amber-accent hover:bg-amber-400 shadow-[0_0_15px_rgba(232,184,92,0.25)] hover:shadow-[0_0_20px_rgba(232,184,92,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 flex items-center gap-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Enter Arena
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
