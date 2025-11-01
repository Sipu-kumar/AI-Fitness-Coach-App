import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { createDietPlan, getUserDietPlans } from '../api/dietPlan';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [instructorSession, setInstructorSession] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBMIRecords, setUserBMIRecords] = useState([]);
  const [filteredBMIRecords, setFilteredBMIRecords] = useState([]);
  const [loadingUserRecords, setLoadingUserRecords] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUser, setLoadingUser] = useState(null);
  const [showDietPlanForm, setShowDietPlanForm] = useState(false);
  const [selectedUserForDiet, setSelectedUserForDiet] = useState(null);
  const [dietPlanForm, setDietPlanForm] = useState({
    title: '',
    description: '',
    bmiCategory: '',
    targetBMI: '',
    duration: '',
    dailyCalories: '',
    meals: {
      breakfast: { description: '', calories: '', foods: [] },
      lunch: { description: '', calories: '', foods: [] },
      dinner: { description: '', calories: '', foods: [] },
      snacks: { description: '', calories: '', foods: [] }
    },
    instructions: [''],
    tips: ['']
  });
  const [creatingDietPlan, setCreatingDietPlan] = useState(false);

  useEffect(() => {
    // Check if instructor is logged in
    const session = localStorage.getItem('instructorSession');
    if (!session) {
      navigate('/instructor-login');
      return;
    }
    
    setInstructorSession(JSON.parse(session));
    fetchAllUsers();
  }, [navigate]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/instructor/all-users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('instructorSession');
    navigate('/instructor-login');
  };

  const fetchUserBMIRecords = async (userId) => {
    try {
      setLoadingUserRecords(true);
      const response = await API.get(`/instructor/user/${userId}/bmi-history`);
      setUserBMIRecords(response.data.bmiRecords);
      setFilteredBMIRecords(response.data.bmiRecords);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch user BMI records');
    } finally {
      setLoadingUserRecords(false);
    }
  };

  // Filter BMI records based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = userBMIRecords.filter(record => 
        record.bmi.toString().includes(searchTerm) ||
        record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.weightKg.toString().includes(searchTerm) ||
        record.heightCm.toString().includes(searchTerm) ||
        formatDate(record.createdAt).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBMIRecords(filtered);
    } else {
      setFilteredBMIRecords(userBMIRecords);
    }
  }, [searchTerm, userBMIRecords]);

  const handleViewAllRecords = async (user) => {
    setLoadingUser(user._id);
    setSelectedUser(user);
    setShowUserDetails(true);
    await fetchUserBMIRecords(user._id);
    setLoadingUser(null);
  };

  const handleCloseUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
    setUserBMIRecords([]);
    setFilteredBMIRecords([]);
    setSearchTerm('');
    setLoadingUser(null);
  };

  const handleCreateDietPlan = (user) => {
    setSelectedUserForDiet(user);
    setShowDietPlanForm(true);
    
    // Pre-fill form with user's latest BMI data
    if (user.bmiRecords && user.bmiRecords.length > 0) {
      const latestRecord = user.bmiRecords[0];
      setDietPlanForm(prev => ({
        ...prev,
        bmiCategory: latestRecord.category,
        targetBMI: latestRecord.bmi < 18.5 ? '20' : 
                   latestRecord.bmi < 25 ? '22' : 
                   latestRecord.bmi < 30 ? '24' : '26'
      }));
    }
  };

  const handleCloseDietPlanForm = () => {
    setShowDietPlanForm(false);
    setSelectedUserForDiet(null);
    setDietPlanForm({
      title: '',
      description: '',
      bmiCategory: '',
      targetBMI: '',
      duration: '',
      dailyCalories: '',
      meals: {
        breakfast: { description: '', calories: '', foods: [] },
        lunch: { description: '', calories: '', foods: [] },
        dinner: { description: '', calories: '', foods: [] },
        snacks: { description: '', calories: '', foods: [] }
      },
      instructions: [''],
      tips: ['']
    });
  };

  const handleDietPlanSubmit = async (e) => {
    e.preventDefault();
    setCreatingDietPlan(true);
    
    try {
      const formData = {
        userId: selectedUserForDiet._id,
        title: dietPlanForm.title,
        description: dietPlanForm.description,
        bmiCategory: dietPlanForm.bmiCategory,
        targetBMI: parseFloat(dietPlanForm.targetBMI),
        duration: dietPlanForm.duration,
        dailyCalories: parseInt(dietPlanForm.dailyCalories),
        meals: {
          breakfast: {
            description: dietPlanForm.meals.breakfast.description,
            calories: parseInt(dietPlanForm.meals.breakfast.calories),
            foods: dietPlanForm.meals.breakfast.foods.filter(food => food.trim())
          },
          lunch: {
            description: dietPlanForm.meals.lunch.description,
            calories: parseInt(dietPlanForm.meals.lunch.calories),
            foods: dietPlanForm.meals.lunch.foods.filter(food => food.trim())
          },
          dinner: {
            description: dietPlanForm.meals.dinner.description,
            calories: parseInt(dietPlanForm.meals.dinner.calories),
            foods: dietPlanForm.meals.dinner.foods.filter(food => food.trim())
          },
          snacks: {
            description: dietPlanForm.meals.snacks.description,
            calories: parseInt(dietPlanForm.meals.snacks.calories),
            foods: dietPlanForm.meals.snacks.foods.filter(food => food.trim())
          }
        },
        instructions: dietPlanForm.instructions.filter(instruction => instruction.trim()),
        tips: dietPlanForm.tips.filter(tip => tip.trim())
      };

      await createDietPlan(formData);
      alert('Diet plan created successfully!');
      handleCloseDietPlanForm();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to create diet plan');
    } finally {
      setCreatingDietPlan(false);
    }
  };

  const addInstruction = () => {
    setDietPlanForm(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index) => {
    setDietPlanForm(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const addTip = () => {
    setDietPlanForm(prev => ({
      ...prev,
      tips: [...prev.tips, '']
    }));
  };

  const removeTip = (index) => {
    setDietPlanForm(prev => ({
      ...prev,
      tips: prev.tips.filter((_, i) => i !== index)
    }));
  };

  const addFoodItem = (mealType) => {
    setDietPlanForm(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: {
          ...prev.meals[mealType],
          foods: [...prev.meals[mealType].foods, '']
        }
      }
    }));
  };

  const removeFoodItem = (mealType, index) => {
    setDietPlanForm(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: {
          ...prev.meals[mealType],
          foods: prev.meals[mealType].foods.filter((_, i) => i !== index)
        }
      }
    }));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showUserDetails) {
        handleCloseUserDetails();
      }
    };

    if (showUserDetails) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showUserDetails]);

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (bmi < 25) return 'text-green-600 bg-green-50 border-green-200';
    if (bmi < 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading users data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="glass-effect sticky top-0 z-50 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Instructor Dashboard</h1>
              <p className="text-sm text-gray-600">User BMI Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {instructorSession?.name || 'Instructor'}
            </span>
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition-colors duration-200 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-effect p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.bmiRecords && user.bmiRecords.length > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total BMI Records</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((total, user) => total + (user.bmiRecords?.length || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg BMI</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(() => {
                    const allBMIs = users.flatMap(user => 
                      user.bmiRecords?.map(record => record.bmi) || []
                    );
                    if (allBMIs.length === 0) return '0.0';
                    const avg = allBMIs.reduce((sum, bmi) => sum + bmi, 0) / allBMIs.length;
                    return avg.toFixed(1);
                  })()}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="glass-effect rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold gradient-text">All Users & BMI Records</h2>
            <p className="text-sm text-gray-600 mt-1">View and manage all user BMI data</p>
          </div>

          {error && (
            <div className="p-6 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No users found</p>
                <p className="text-sm text-gray-500 mt-1">Users will appear here once they register</p>
              </div>
            ) : (
              <div className="space-y-6">
                {users.map((user) => (
                  <div key={user._id} className="bg-white rounded-xl border border-gray-200 p-6">
                    {/* User Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500 capitalize">Role: {user.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">BMI Records</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {user.bmiRecords?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* BMI Records */}
                    {user.bmiRecords && user.bmiRecords.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent BMI Records:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {user.bmiRecords.slice(0, 6).map((record, index) => (
                            <div key={record._id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500">#{user.bmiRecords.length - index}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getBMIColor(record.bmi)}`}>
                                  {record.category}
                                </span>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{record.bmi}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {record.weightKg}kg / {record.heightCm}cm
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {formatDate(record.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {user.bmiRecords.length > 6 && (
                          <p className="text-xs text-gray-500 text-center mt-2">
                            ... and {user.bmiRecords.length - 6} more records
                          </p>
                        )}
                        <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                          <button
                            onClick={() => handleViewAllRecords(user)}
                            disabled={loadingUser === user._id}
                            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingUser === user._id ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Loading...</span>
                              </div>
                            ) : (
                              `View All Records (${user.bmiRecords.length})`
                            )}
                          </button>
                          <button
                            onClick={() => handleCreateDietPlan(user)}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                          >
                            Create Diet Plan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">No BMI records yet</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseUserDetails}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <p className="text-xs text-gray-500 capitalize">Role: {selectedUser.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseUserDetails}
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
              {loadingUserRecords ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading BMI records...</span>
                  </div>
                </div>
              ) : userBMIRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No BMI records found</p>
                  <p className="text-sm text-gray-500 mt-1">This user hasn't calculated any BMI yet</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Complete BMI History ({filteredBMIRecords.length} of {userBMIRecords.length} records)
                    </h4>
                    <div className="text-sm text-gray-500">
                      Latest: {formatDate(userBMIRecords[0]?.createdAt)}
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search BMI records by BMI, category, weight, height, or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
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

                  {/* BMI Records Grid */}
                  {filteredBMIRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">No records found</p>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredBMIRecords.map((record, index) => (
                      <div key={record._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-500">#{userBMIRecords.findIndex(r => r._id === record._id) + 1}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBMIColor(record.bmi)}`}>
                            {record.category}
                          </span>
                        </div>
                        
                        <div className="text-center mb-3">
                          <div className="text-3xl font-bold text-gray-900 mb-1">{record.bmi}</div>
                          <div className="text-sm text-gray-600">BMI Score</div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Weight:</span>
                            <span className="font-medium">{record.weightKg} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Height:</span>
                            <span className="font-medium">{record.heightCm} cm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Date:</span>
                            <span className="font-medium">{formatDate(record.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      ))}
                    </div>
                  )}

                  {/* BMI Progress Summary */}
                  {userBMIRecords.length > 1 && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Progress Summary</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {userBMIRecords[userBMIRecords.length - 1].bmi}
                          </div>
                          <div className="text-sm text-gray-600">First BMI</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {userBMIRecords[0].bmi}
                          </div>
                          <div className="text-sm text-gray-600">Latest BMI</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${(userBMIRecords[0].bmi - userBMIRecords[userBMIRecords.length - 1].bmi) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {((userBMIRecords[0].bmi - userBMIRecords[userBMIRecords.length - 1].bmi) >= 0 ? '+' : '') + (userBMIRecords[0].bmi - userBMIRecords[userBMIRecords.length - 1].bmi).toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">Change</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {searchTerm ? `Showing ${filteredBMIRecords.length} of ${userBMIRecords.length} records` : `Total records: ${userBMIRecords.length}`}
                </div>
                <button
                  onClick={handleCloseUserDetails}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diet Plan Creation Modal */}
      {showDietPlanForm && selectedUserForDiet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {selectedUserForDiet.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Create Diet Plan</h3>
                    <p className="text-sm text-gray-600">For {selectedUserForDiet.name}</p>
                    <p className="text-xs text-gray-500">Latest BMI: {selectedUserForDiet.bmiRecords?.[0]?.bmi} ({selectedUserForDiet.bmiRecords?.[0]?.category})</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDietPlanForm}
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
              <form onSubmit={handleDietPlanSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Title</label>
                    <input
                      type="text"
                      required
                      value={dietPlanForm.title}
                      onChange={(e) => setDietPlanForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                      placeholder="e.g., Weight Loss Plan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      required
                      value={dietPlanForm.duration}
                      onChange={(e) => setDietPlanForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                      placeholder="e.g., 4 weeks"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">BMI Category</label>
                    <select
                      required
                      value={dietPlanForm.bmiCategory}
                      onChange={(e) => setDietPlanForm(prev => ({ ...prev, bmiCategory: e.target.value }))}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                    >
                      <option value="">Select BMI Category</option>
                      <option value="Underweight">Underweight</option>
                      <option value="Normal weight">Normal weight</option>
                      <option value="Overweight">Overweight</option>
                      <option value="Obesity">Obesity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target BMI</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={dietPlanForm.targetBMI}
                      onChange={(e) => setDietPlanForm(prev => ({ ...prev, targetBMI: e.target.value }))}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                      placeholder="e.g., 22.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={dietPlanForm.description}
                    onChange={(e) => setDietPlanForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                    placeholder="Describe the diet plan goals and approach..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Calories</label>
                  <input
                    type="number"
                    required
                    value={dietPlanForm.dailyCalories}
                    onChange={(e) => setDietPlanForm(prev => ({ ...prev, dailyCalories: e.target.value }))}
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                    placeholder="e.g., 1800"
                  />
                </div>

                {/* Meals Section */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Meal Plans</h4>
                  
                  {['breakfast', 'lunch', 'dinner', 'snacks'].map((mealType) => (
                    <div key={mealType} className="bg-gray-50 rounded-xl p-4">
                      <h5 className="text-md font-semibold text-gray-800 mb-3 capitalize">{mealType}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            required
                            value={dietPlanForm.meals[mealType].description}
                            onChange={(e) => setDietPlanForm(prev => ({
                              ...prev,
                              meals: {
                                ...prev.meals,
                                [mealType]: { ...prev.meals[mealType], description: e.target.value }
                              }
                            }))}
                            className="w-full border border-gray-300 p-2 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                            placeholder={`${mealType} description`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                          <input
                            type="number"
                            required
                            value={dietPlanForm.meals[mealType].calories}
                            onChange={(e) => setDietPlanForm(prev => ({
                              ...prev,
                              meals: {
                                ...prev.meals,
                                [mealType]: { ...prev.meals[mealType], calories: e.target.value }
                              }
                            }))}
                            className="w-full border border-gray-300 p-2 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                            placeholder="Calories"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Food Items</label>
                        {dietPlanForm.meals[mealType].foods.map((food, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={food}
                              onChange={(e) => {
                                const newFoods = [...dietPlanForm.meals[mealType].foods];
                                newFoods[index] = e.target.value;
                                setDietPlanForm(prev => ({
                                  ...prev,
                                  meals: {
                                    ...prev.meals,
                                    [mealType]: { ...prev.meals[mealType], foods: newFoods }
                                  }
                                }));
                              }}
                              className="flex-1 border border-gray-300 p-2 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                              placeholder="Food item"
                            />
                            <button
                              type="button"
                              onClick={() => removeFoodItem(mealType, index)}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addFoodItem(mealType)}
                          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          Add Food Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h4>
                  {dietPlanForm.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        required
                        value={instruction}
                        onChange={(e) => {
                          const newInstructions = [...dietPlanForm.instructions];
                          newInstructions[index] = e.target.value;
                          setDietPlanForm(prev => ({ ...prev, instructions: newInstructions }));
                        }}
                        className="flex-1 border border-gray-300 p-2 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                        placeholder="Instruction"
                      />
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Add Instruction
                  </button>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Tips (Optional)</h4>
                  {dietPlanForm.tips.map((tip, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => {
                          const newTips = [...dietPlanForm.tips];
                          newTips[index] = e.target.value;
                          setDietPlanForm(prev => ({ ...prev, tips: newTips }));
                        }}
                        className="flex-1 border border-gray-300 p-2 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                        placeholder="Tip"
                      />
                      <button
                        type="button"
                        onClick={() => removeTip(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTip}
                    className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  >
                    Add Tip
                  </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseDietPlanForm}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingDietPlan}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingDietPlan ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Diet Plan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
