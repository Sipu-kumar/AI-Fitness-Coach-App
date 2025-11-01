import { useState, useEffect } from 'react';
import { getMyActiveDietPlan } from '../api/dietPlan';
import jsPDF from 'jspdf';

export default function DietPlanViewer() {
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDietPlan();
  }, []);

  const fetchDietPlan = async () => {
    try {
      setLoading(true);
      const response = await getMyActiveDietPlan();
      setDietPlan(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No active diet plan found');
      } else {
        setError(err.response?.data?.msg || 'Failed to fetch diet plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDietPlan = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const generatePDF = () => {
    if (!dietPlan) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text with word wrapping
    const addText = (text, x, y, maxWidth, fontSize = 10, color = '#000000') => {
      doc.setFontSize(fontSize);
      doc.setTextColor(color);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    };

    // Helper function to add a section header
    const addSectionHeader = (title, y) => {
      doc.setFillColor(255, 140, 0); // Orange color
      doc.rect(15, y - 5, pageWidth - 30, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(title, 20, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      return y + 15;
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 69, 0); // Orange-red color
    doc.text(dietPlan.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Subtitle
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Duration: ${dietPlan.duration} | Target BMI: ${dietPlan.targetBMI}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Description
    yPosition = addSectionHeader('Plan Description', yPosition);
    yPosition = addText(dietPlan.description, 20, yPosition, pageWidth - 40, 10) + 10;

    // Daily Calories
    checkNewPage(25);
    yPosition = addSectionHeader('Daily Calorie Target', yPosition);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 100, 200);
    doc.text(`${dietPlan.dailyCalories} calories`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Meals
    checkNewPage(30);
    yPosition = addSectionHeader('Meal Plans', yPosition);
    
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    mealTypes.forEach((mealType, index) => {
      const meal = dietPlan.meals[mealType];
      if (!meal) return;

      checkNewPage(40);
      
      // Meal type header
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 69, 0);
      doc.text(mealType.charAt(0).toUpperCase() + mealType.slice(1), 20, yPosition);
      
      // Calories
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${meal.calories} calories`, pageWidth - 60, yPosition, { align: 'right' });
      yPosition += 8;

      // Description
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      yPosition = addText(meal.description, 20, yPosition, pageWidth - 40, 10) + 5;

      // Food items
      if (meal.foods && meal.foods.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Food Items:', 20, yPosition);
        yPosition += 5;
        
        meal.foods.forEach((food, foodIndex) => {
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(`• ${food}`, 25, yPosition);
          yPosition += 4;
        });
      }
      
      yPosition += 10;
    });

    // Instructions
    if (dietPlan.instructions && dietPlan.instructions.length > 0) {
      checkNewPage(30);
      yPosition = addSectionHeader('Instructions', yPosition);
      
      dietPlan.instructions.forEach((instruction, index) => {
        checkNewPage(15);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${instruction}`, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Tips
    if (dietPlan.tips && dietPlan.tips.length > 0) {
      checkNewPage(30);
      yPosition = addSectionHeader('Health Tips', yPosition);
      
      dietPlan.tips.forEach((tip, index) => {
        checkNewPage(15);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`💡 ${tip}`, 20, yPosition);
        yPosition += 6;
      });
    }

    // Footer
    const finalY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by BMI Health Tracker', pageWidth / 2, finalY, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, finalY + 5, { align: 'center' });

    // Download the PDF
    const fileName = `Diet_Plan_${dietPlan.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="glass-effect p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading diet plan...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-effect p-6 rounded-2xl shadow-xl border-2 border-yellow-200 bg-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Diet Plan Available</h3>
          <p className="text-yellow-700 mb-4">{error}</p>
          <p className="text-sm text-yellow-600">
            Your instructor will create a personalized diet plan based on your BMI data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-effect p-6 rounded-2xl shadow-xl card-hover">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Diet Plan</h3>
              <p className="text-sm text-gray-600">{dietPlan.title}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={generatePDF}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm flex items-center space-x-1"
              title="Download as PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>PDF</span>
            </button>
            <button
              onClick={handleViewDietPlan}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              View Diet Plan
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="text-gray-500">Duration</div>
            <div className="font-semibold text-gray-900">{dietPlan.duration}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="text-gray-500">Daily Calories</div>
            <div className="font-semibold text-gray-900">{dietPlan.dailyCalories}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="text-gray-500">Target BMI</div>
            <div className="font-semibold text-gray-900">{dietPlan.targetBMI}</div>
          </div>
        </div>
      </div>

      {/* Diet Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{dietPlan.title}</h3>
                    <p className="text-sm text-gray-600">Duration: {dietPlan.duration}</p>
                    <p className="text-xs text-gray-500">Target BMI: {dietPlan.targetBMI}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Description */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Plan Description</h4>
                <p className="text-gray-700 leading-relaxed">{dietPlan.description}</p>
              </div>

              {/* Daily Calories */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{dietPlan.dailyCalories}</div>
                  <div className="text-sm text-gray-600">Daily Calories</div>
                </div>
              </div>

              {/* Meals */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Meal Plans</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(dietPlan.meals).map(([mealType, meal]) => (
                    <div key={mealType} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h5 className="text-md font-semibold text-gray-800 mb-3 capitalize flex items-center justify-between">
                        {mealType}
                        <span className="text-sm font-normal text-orange-600">{meal.calories} cal</span>
                      </h5>
                      <p className="text-sm text-gray-700 mb-3">{meal.description}</p>
                      {meal.foods && meal.foods.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium text-gray-600 mb-2">Food Items:</h6>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {meal.foods.map((food, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                <span>{food}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              {dietPlan.instructions && dietPlan.instructions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h4>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <ul className="space-y-2">
                      {dietPlan.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-gray-700">{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tips */}
              {dietPlan.tips && dietPlan.tips.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Tips</h4>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <ul className="space-y-2">
                      {dietPlan.tips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                            💡
                          </div>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Created by your instructor
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={generatePDF}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
