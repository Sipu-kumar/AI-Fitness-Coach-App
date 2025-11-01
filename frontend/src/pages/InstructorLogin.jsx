import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';

export default function InstructorLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ loginId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await API.post('/auth/instructor-login', form);
      // Store instructor session info
      localStorage.setItem('instructorSession', JSON.stringify(res.data));
      navigate('/instructor-dashboard');
    } catch(err) {
      setError(err.response?.data?.msg || 'Invalid instructor credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Instructor Login</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Access instructor dashboard to view all users and their BMI data</p>
        </div>
        
        <form onSubmit={submit} className="glass-effect p-6 sm:p-8 rounded-2xl shadow-xl space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-600 font-medium text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="instructor-login-id">
                Instructor Login ID
              </label>
              <input 
                id="instructor-login-id"
                type="text"
                required
                className="w-full border-2 border-gray-200 p-3 sm:p-4 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-base"
                placeholder="Enter instructor login ID"
                value={form.loginId} 
                onChange={e=>setForm({...form, loginId: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="instructor-password">
                Password
              </label>
              <input 
                id="instructor-password"
                type="password"
                required
                className="w-full border-2 border-gray-200 p-3 sm:p-4 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-base"
                placeholder="Enter instructor password"
                value={form.password} 
                onChange={e=>setForm({...form, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 sm:py-4 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Access Instructor Dashboard'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Regular user?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-500 font-semibold">
                User Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
