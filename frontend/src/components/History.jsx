import { useEffect, useState } from 'react';
import API from '../api/api';

export default function History() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    specificDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(()=>{
    setLoading(true);
    API.get('/bmi/history')
      .then(r=>{
        setRecords(r.data);
        setFilteredRecords(r.data);
      })
      .catch(err=> {
        setError(err?.response?.data?.msg || 'Please login to see your history');
      })
      .finally(() => setLoading(false));
  },[]);

  // Filter records based on search term and date filters
  useEffect(() => {
    let filtered = [...records];

    // Text search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.bmi.toString().includes(searchTerm) ||
        record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.weightKg.toString().includes(searchTerm) ||
        record.heightCm.toString().includes(searchTerm) ||
        formatDate(record.createdAt).date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(record.createdAt).time.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filters
    if (dateFilter.specificDate) {
      const specificDate = new Date(dateFilter.specificDate);
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.createdAt);
        return recordDate.toDateString() === specificDate.toDateString();
      });
    } else {
      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.createdAt);
          return recordDate >= startDate;
        });
      }

      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.createdAt);
          return recordDate <= endDate;
        });
      }
    }

    setFilteredRecords(filtered);
  }, [records, searchTerm, dateFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter({
      startDate: '',
      endDate: '',
      specificDate: ''
    });
  };

  const getDateRangePresets = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    return {
      today: today.toISOString().split('T')[0],
      yesterday: yesterday.toISOString().split('T')[0],
      lastWeek: lastWeek.toISOString().split('T')[0],
      lastMonth: lastMonth.toISOString().split('T')[0]
    };
  };

  const applyDatePreset = (preset) => {
    const presets = getDateRangePresets();
    switch (preset) {
      case 'today':
        setDateFilter({
          startDate: presets.today,
          endDate: presets.today,
          specificDate: presets.today
        });
        break;
      case 'yesterday':
        setDateFilter({
          startDate: presets.yesterday,
          endDate: presets.yesterday,
          specificDate: presets.yesterday
        });
        break;
      case 'lastWeek':
        setDateFilter({
          startDate: presets.lastWeek,
          endDate: presets.today,
          specificDate: ''
        });
        break;
      case 'lastMonth':
        setDateFilter({
          startDate: presets.lastMonth,
          endDate: presets.today,
          specificDate: ''
        });
        break;
      default:
        break;
    }
  };

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (bmi < 25) return 'text-green-600 bg-green-50 border-green-200';
    if (bmi < 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="glass-effect p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading your history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-effect p-8 rounded-2xl shadow-xl border-2 border-red-200 bg-red-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl card-hover">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold gradient-text">Your BMI History</h3>
        <div className="flex items-center space-x-3">
          <div className="text-xs sm:text-sm text-gray-500">
            {filteredRecords.length} of {records.length} record{records.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Toggle filters"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Records</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by BMI, category, weight, height, date, or time..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Date Filter Presets */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Date Filters</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyDatePreset('today')}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => applyDatePreset('yesterday')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
              >
                Yesterday
              </button>
              <button
                onClick={() => applyDatePreset('lastWeek')}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm hover:bg-yellow-200 transition-colors"
              >
                Last Week
              </button>
              <button
                onClick={() => applyDatePreset('lastMonth')}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
              >
                Last Month
              </button>
            </div>
          </div>

          {/* Custom Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Date</label>
              <input
                type="date"
                value={dateFilter.specificDate}
                onChange={(e) => setDateFilter(prev => ({
                  ...prev,
                  specificDate: e.target.value,
                  startDate: '',
                  endDate: ''
                }))}
                className="w-full border border-gray-300 p-2 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter(prev => ({
                  ...prev,
                  startDate: e.target.value,
                  specificDate: ''
                }))}
                className="w-full border border-gray-300 p-2 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter(prev => ({
                  ...prev,
                  endDate: e.target.value,
                  specificDate: ''
                }))}
                className="w-full border border-gray-300 p-2 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
      
      {records.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-2">No BMI records yet</p>
          <p className="text-xs sm:text-sm text-gray-500">Calculate your first BMI to start tracking your health journey!</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-2">No records found</p>
          <p className="text-xs sm:text-sm text-gray-500">Try adjusting your search criteria or date filters</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
          {filteredRecords.map((record, index) => {
            const { date, time } = formatDate(record.createdAt);
            return (
              <div key={record._id} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2 sm:mb-0">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="text-lg sm:text-2xl font-bold text-gray-400">#{records.findIndex(r => r._id === record._id) + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{date}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{time}</div>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg sm:text-2xl font-bold text-gray-900">{record.bmi}</div>
                    <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getBMIColor(record.bmi)}`}>
                      {record.category}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500">Weight:</span>
                      <span className="ml-1 sm:ml-2 font-medium">{record.weightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Height:</span>
                      <span className="ml-1 sm:ml-2 font-medium">{record.heightCm} cm</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
