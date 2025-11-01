import { useState } from 'react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function BMIForm({ onNewRecord }) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  async function submit(e){
    e.preventDefault();
    if (!user) return alert('Please login first');
    setLoading(true);
    const payload = { weightKg: Number(weight), heightCm: Number(height) };
    try{
      const res = await API.post('/bmi', payload);
      setResult(res.data);
      onNewRecord?.(res.data);
    }catch(err){
      alert(err?.response?.data?.msg || 'Error');
    } finally {
      setLoading(false);
    }
  }

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return 'text-blue-600 bg-blue-50';
    if (bmi < 25) return 'text-green-600 bg-green-50';
    if (bmi < 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="glass-effect p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl card-hover">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-2">Calculate Your BMI</h2>
        <p className="text-sm sm:text-base text-gray-600">Enter your weight and height to get started</p>
      </div>
      
      <form onSubmit={submit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="weight-input">
              Weight (kg)
            </label>
            <div className="relative">
              <input 
                id="weight-input"
                required 
                type="number"
                step="0.1"
                min="20"
                max="300"
                inputMode="decimal"
                value={weight} 
                onChange={e=>setWeight(e.target.value)} 
                className="w-full border-2 border-gray-200 p-3 sm:p-4 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-base sm:text-lg font-medium"
                placeholder="70.5"
                aria-describedby="weight-help"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>
            <p id="weight-help" className="text-xs text-gray-500">Enter weight in kilograms</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="height-input">
              Height (cm)
            </label>
            <div className="relative">
              <input 
                id="height-input"
                required 
                type="number"
                step="0.1"
                min="100"
                max="250"
                inputMode="decimal"
                value={height} 
                onChange={e=>setHeight(e.target.value)} 
                className="w-full border-2 border-gray-200 p-3 sm:p-4 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-base sm:text-lg font-medium"
                placeholder="175.0"
                aria-describedby="height-help"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <p id="height-help" className="text-xs text-gray-500">Enter height in centimeters</p>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full btn-primary text-base sm:text-lg py-3 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Calculating...</span>
            </div>
          ) : (
            'Calculate & Save BMI'
          )}
        </button>
      </form>
      
      {result && (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-xl border-2 border-gray-100">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{result.bmi}</div>
            <div className={`inline-block px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold ${getBMIColor(result.bmi)}`}>
              {result.category}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
