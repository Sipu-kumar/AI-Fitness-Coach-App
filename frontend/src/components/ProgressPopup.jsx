import React, { useState, useRef, useEffect } from 'react';
import BMIProgressChart from './BMIProgressChart';
import API from '../api/api';

export default function ProgressPopup({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [bmiData, setBmiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);
  const popupRef = useRef(null);

  const fetchBMIData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/bmi/history');
      const records = response.data;
      
      // Transform the data to match chart format
      const transformedData = records.map(record => ({
        date: record.createdAt,
        bmi: record.bmi,
        weightKg: record.weightKg,
        heightCm: record.heightCm,
        category: record.category
      }));
      
      setBmiData(transformedData);
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to fetch BMI data');
      setBmiData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePopup = async () => {
    if (!isVisible) {
      // Fetch data when opening the popup
      await fetchBMIData();
    }
    setIsVisible(!isVisible);
  };

  const handleClosePopup = () => {
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (cardRef.current && isVisible) {
      // Responsive popup sizing
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;
      
      const popupWidth = isMobile ? window.innerWidth - 40 : isTablet ? 600 : 700;
      const popupHeight = isMobile ? window.innerHeight - 40 : isTablet ? 500 : 650;
      
      const x = (window.innerWidth - popupWidth) / 2;
      const y = (window.innerHeight - popupHeight) / 2;

      // Ensure popup stays within screen bounds
      const finalX = Math.max(20, Math.min(x, window.innerWidth - popupWidth - 20));
      const finalY = Math.max(20, Math.min(y, window.innerHeight - popupHeight - 20));

      if (popupRef.current) {
        popupRef.current.style.left = `${finalX}px`;
        popupRef.current.style.top = `${finalY}px`;
        popupRef.current.style.width = `${popupWidth}px`;
        popupRef.current.style.height = `${popupHeight}px`;
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible]);

  // Handle window resize and orientation changes
  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        updatePosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isVisible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible && 
          popupRef.current && 
          !popupRef.current.contains(event.target) &&
          cardRef.current &&
          !cardRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  return (
    <>
      <div
        ref={cardRef}
        onClick={handleTogglePopup}
        className="relative cursor-pointer"
      >
        {children}
      </div>

      {/* Backdrop */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      )}

      {/* Popup Modal */}
      {isVisible && (
        <div
          ref={popupRef}
          className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 animate-in fade-in-0 zoom-in-95 duration-300 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text">BMI Progress Chart</h3>
            <button
              onClick={handleClosePopup}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0"
              aria-label="Close chart"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Description */}
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-gray-600">
              Track your BMI changes over time to monitor your health journey and progress
            </p>
          </div>

          {/* Chart */}
          <div className="h-64 sm:h-80 lg:h-96 mb-4 sm:mb-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600">Loading your BMI data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                  <button 
                    onClick={fetchBMIData}
                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-500 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : bmiData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">No BMI data yet</p>
                  <p className="text-xs text-gray-500 mt-1">Calculate your first BMI to see progress</p>
                </div>
              </div>
            ) : (
              <BMIProgressChart bmiData={bmiData} />
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500">
                {bmiData.length > 0 ? `Your BMI history` : 'No records yet'}
              </span>
              <span className="text-indigo-600 font-semibold">
                {bmiData.length > 0 ? `${bmiData.length} record${bmiData.length !== 1 ? 's' : ''}` : '0 records'}
              </span>
            </div>
            {bmiData.length > 0 && (
              <div className="mt-1 sm:mt-2 text-xs text-gray-500">
                Last updated: {new Date(bmiData[bmiData.length - 1].date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}