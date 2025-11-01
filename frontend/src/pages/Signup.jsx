import { useState } from 'react';
import { signup } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const { setUser } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'user' });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signup(form);
      setUser(res.data);
      nav('/');
    } catch(err) {
      alert(err.response?.data?.msg || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white font-bold text-lg sm:text-xl">BMI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Create your account</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Start tracking your health journey today</p>
        </div>
        
        <form onSubmit={submit} className="glass-effect p-6 sm:p-8 rounded-2xl shadow-xl space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="signup-name">
                Full name
              </label>
              <input 
                id="signup-name"
                type="text"
                required
                autoComplete="name"
                className="w-full border-2 border-gray-200 p-3 sm:p-4 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-base"
                placeholder="Enter your full name"
                value={form.name} 
                onChange={e=>setForm({...form,name:e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="signup-email">
                Email address
              </label>
              <input 
                id="signup-email"
                type="email"
                required
                inputMode="email"
                autoComplete="email"
                className="w-full border-2 border-gray-200 p-3 sm:p-4 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-base"
                placeholder="Enter your email"
                value={form.email} 
                onChange={e=>setForm({...form,email:e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="signup-password">
                Password
              </label>
              <input 
                id="signup-password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full border-2 border-gray-200 p-3 sm:p-4 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-base"
                placeholder="Create a password"
                value={form.password} 
                onChange={e=>setForm({...form,password:e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="signup-role">
                Account type
              </label>
              <select 
                id="signup-role"
                className="w-full border-2 border-gray-200 p-3 sm:p-4 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-base"
                value={form.role} 
                onChange={e=>setForm({...form,role:e.target.value})}
              >
                <option value="user">User - Track your BMI</option>
                <option value="instructor">Instructor - Help others</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              'Create account'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
