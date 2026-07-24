import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { UserPlus, Shield, UserCheck, GraduationCap, ArrowLeft } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'AI & DS',
    mobileNumber: '',
    registerNo: '',
    rollNumber: '',
    year: 'III Year',
    semester: 'Semester 5',
    section: 'A',
    facultyId: '',
    designation: 'Assistant Professor'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/auth/register', { ...formData, role });
      const isSuccess = res?.success || res?.data?.success;
      const msg = res?.message || res?.data?.message || 'Registration request submitted!';
      if (isSuccess) {
        setSuccess(msg);
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(msg || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="card-glass w-full max-w-xl p-8 space-y-6 bg-slate-900/90 border-slate-800 text-white shadow-2xl rounded-2xl">
        <div className="flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-1.5 text-xs text-blue-400 font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
          <div className="font-bold text-xs uppercase text-slate-400">Account Registration</div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-white">Join JP College ERP Portal</h2>
          <p className="text-xs text-slate-400">Register as Student, Faculty, or Request Admin Role</p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
              role === 'student' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Student
          </button>
          <button
            type="button"
            onClick={() => setRole('faculty')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
              role === 'faculty' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Faculty
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
              role === 'admin' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin
          </button>
        </div>

        {error && <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs font-semibold text-center">{error}</div>}
        {success && <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Full Name *</label>
              <input type="text" required name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Email Address *</label>
              <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="user@jpcoe.ac.in" className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Password *</label>
              <input type="password" required name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Confirm Password *</label>
              <input type="password" required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" />
            </div>
          </div>

          {role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Register No *</label>
                <input type="text" required name="registerNo" value={formData.registerNo} onChange={handleChange} placeholder="953621104001" className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Department</label>
                <select name="department" value={formData.department} onChange={handleChange} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white">
                  <option value="AI & DS">AI & DS</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">Mechanical</option>
                  <option value="CIVIL">Civil</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white">
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition text-sm shadow-lg shadow-blue-600/30">
            <UserPlus className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Registration Request'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
