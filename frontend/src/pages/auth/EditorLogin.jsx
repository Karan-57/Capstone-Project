import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CollaboLogo from '../../assets/logos/CollaboLogo';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const EditorLogin = () => {
  const [email, setEmail] = useState('alex@motioncraft.co');
  const [password, setPassword] = useState('password123');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login('editor', {
      name: 'Alex Rivera',
      email: email || 'alex@motioncraft.co',
      role: 'editor',
      title: 'Senior Motion & Video Editor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });
    navigate('/editor/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090E] p-4">
      <div className="w-full max-w-md p-8 rounded-2xl glass-card border border-white/[0.08] shadow-2xl">
        <div className="flex justify-center mb-6">
          <CollaboLogo className="w-10 h-10" textClassName="text-2xl font-bold text-white tracking-tight" />
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-900/40 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/20">
            Editor Pro Portal
          </div>
          <h2 className="text-xl font-bold text-white">Editor Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access high-ticket creator editing projects and manage contracts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5">
            Sign In as Video Editor
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-xs text-slate-400 space-y-2">
          <div>
            Don't have an editor portfolio?{' '}
            <Link to="/auth/editor-signup" className="text-purple-400 hover:underline">
              Apply to join
            </Link>
          </div>
          <div>
            Looking to hire editors?{' '}
            <Link to="/auth/creator-login" className="text-purple-400 hover:underline">
              Creator Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorLogin;
