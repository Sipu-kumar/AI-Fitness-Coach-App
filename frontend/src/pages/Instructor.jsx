import ProgressPopup from '../components/ProgressPopup';

export default function Instructor(){

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-3 sm:mb-4">
          Instructor Dashboard
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Help your clients achieve their health goals with personalized BMI guidance
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Feature 1 - Track Progress with Click Chart */}
        <ProgressPopup>
          <div className="glass-effect p-6 sm:p-8 rounded-2xl shadow-xl card-hover">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Track Progress
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Monitor your clients' BMI progress over time with detailed analytics and insights.
            </p>
            <button className="w-full btn-primary text-xs sm:text-sm py-2 flex items-center justify-center space-x-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>View Progress Chart</span>
            </button>
          </div>
        </ProgressPopup>

        {/* Feature 2 */}
        <div className="glass-effect p-6 sm:p-8 rounded-2xl shadow-xl card-hover">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Client Management</h3>
          <p className="text-sm sm:text-base text-gray-600">Manage multiple clients and provide personalized health recommendations.</p>
        </div>

        {/* Feature 3 */}
        <div className="glass-effect p-6 sm:p-8 rounded-2xl shadow-xl card-hover">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Smart Advice</h3>
          <p className="text-sm sm:text-base text-gray-600">Get AI-powered recommendations based on BMI categories and health trends.</p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="mt-12 sm:mt-16 glass-effect p-6 sm:p-8 rounded-2xl shadow-xl text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-3 sm:mb-4">Advanced Features Coming Soon</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
          We're working on advanced analytics, client communication tools, and personalized workout plans. 
          Stay tuned for these exciting features!
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <span className="px-3 sm:px-4 py-2 bg-gray-100 rounded-full">📊 Advanced Analytics</span>
          <span className="px-3 sm:px-4 py-2 bg-gray-100 rounded-full">💬 Client Messaging</span>
          <span className="px-3 sm:px-4 py-2 bg-gray-100 rounded-full">🏋️ Workout Plans</span>
          <span className="px-3 sm:px-4 py-2 bg-gray-100 rounded-full">📱 Mobile App</span>
        </div>
      </div>
    </div>
  )
}
