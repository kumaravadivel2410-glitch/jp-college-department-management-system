import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, UserCheck, Shield, GraduationCap, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('Adminjpcoe@gmail.com');
  const [password, setPassword] = useState('Adminhod123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    if (selectedRole === 'admin') {
      setEmail('Adminjpcoe@gmail.com');
      setPassword('Adminhod123');
    } else if (selectedRole === 'faculty') {
      setEmail('senthil@jpcoe.ac.in');
      setPassword('faculty123');
    } else {
      setEmail('953621104001');
      setPassword('student123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password, role);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="card-glass w-full max-w-md p-8 space-y-6 bg-slate-900/90 border-slate-800 text-white shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/30">
            JPC
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">J.P. COLLEGE OF ENGINEERING</h2>
          <p className="text-xs font-bold uppercase text-blue-400 tracking-wider">Department Management ERP Portal</p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
              role === 'admin' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('faculty')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
              role === 'faculty' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Faculty
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
              role === 'student' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Student
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              {role === 'student' ? 'Register Number' : (role === 'faculty' ? 'Faculty ID / Email' : 'Admin Email')} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'student' ? 'Enter Register No' : 'Enter Email'}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30 disabled:opacity-50 text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Logging in...' : 'Login to ERP System'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 font-bold hover:underline">
            Register / Request Access
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
