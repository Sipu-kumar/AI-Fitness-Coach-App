import BMIForm from '../components/BMIForm'
import History from '../components/History'
import Advice from '../components/Advice'
import DietPlanViewer from '../components/DietPlanViewer'
import { useState } from 'react'

export default function Home(){
  const [last, setLast] = useState(null)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-3 sm:mb-4">
          Track Your Health Journey
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Calculate your BMI, get personalized advice, and monitor your progress over time
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* BMI Calculator - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <BMIForm onNewRecord={r=>setLast(r)} />
          <Advice bmi={last?.bmi} />
        </div>
        
        {/* Right Column - History and Diet Plan */}
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
          <DietPlanViewer />
          <History />
        </div>
      </div>
    </div>
  )
}
