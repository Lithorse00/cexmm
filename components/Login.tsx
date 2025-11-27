
import React, { useState } from 'react';
import { ShieldCheck, Lock, User, KeyRound } from 'lucide-react';
import { UserSession } from '../types';

interface LoginProps {
  onLogin: (user: UserSession) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      // Hardcoded credentials as requested
      if (account === 'admin' && password === '123456' && code.length === 6) {
        onLogin({ username: 'admin', role: 'Admin' });
      } else if (account !== 'admin' || password !== '123456') {
        setError('Invalid account or password (Try: admin / 123456)');
      } else if (code.length !== 6) {
        setError('Invalid 2FA Code (Must be 6 digits)');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 backdrop-blur-xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CEX Market Maker</h1>
          <p className="text-slate-400 mt-2">Professional Quant Trading System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-500">
                <User size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Account"
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-500">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-500">
                <KeyRound size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Google Authenticator Code (6 digits)"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono tracking-widest"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
             {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
             ) : 'Login to System'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-600">
          <p>Protected by Enterprise Grade Encryption</p>
          <p>© 2024 Market Maker Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
