'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  User,
  Zap
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

export default function LoginView() {
  const { login, team } = useBrandFlow();

  const [identifier, setIdentifier] = useState('Darsh');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your name or email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      login(identifier, password);
      setIsSubmitting(false);
    }, 400);
  };

  const handleQuickLogin = (name: string) => {
    setIdentifier(name);
    setIsSubmitting(true);
    setTimeout(() => {
      login(name);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-white flex flex-col justify-between relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-purple-600/10 blur-[160px] pointer-events-none" />

      {/* Top Simple Nav */}
      <header className="relative z-10 px-6 py-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-brand-500/25">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-tight text-base sm:text-lg">BrandFlow</span>
              <span className="text-[10px] font-bold bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Agency Workflow & Content Command Center</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Encrypted Session</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
          
          {/* Header */}
          <div className="space-y-2 mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20 mb-1">
              <Sparkles size={12} />
              Welcome Back
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign in to BrandFlow
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your credentials to access your daily to-dos, content calendar, ad checkpoints, and client brands.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Email / Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Email or Username
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. Darsh or darsh@brandflow.io"
                  className="w-full text-xs pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-500">Any password / Master PIN</span>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full text-xs pl-10 pr-10 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-brand-600 focus:ring-brand-500"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Command Center</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Access for Team Members */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <Zap size={12} className="text-amber-400 fill-current" />
                Quick 1-Click Sign-In:
              </span>
              <span className="text-[10px] text-slate-500">Instant Access</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {team.slice(0, 4).map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleQuickLogin(member.name)}
                  className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-brand-500/40 text-left transition-all flex items-center gap-2.5 group"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/10 group-hover:border-brand-400 transition-colors"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                      {member.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {member.name === 'Darsh' ? 'Brand Manager' : member.department}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-500">
        <p>© 2026 BrandFlow Agency OS • All systems operational</p>
      </footer>
    </div>
  );
}
