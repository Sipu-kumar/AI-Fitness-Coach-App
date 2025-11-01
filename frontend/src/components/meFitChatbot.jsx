import React, { useState, useEffect, useRef } from 'react';
import { getMyActiveDietPlan } from '../api/dietPlan';
import API from '../api/api';

const MeFitChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userBmiData, setUserBmiData] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsApiKeySet(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isApiKeySet && messages.length === 0) {
      // Initialize conversation when chatbot opens
      initializeConversation();
    }
  }, [isOpen, isApiKeySet]);

  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's BMI data
      const bmiResponse = await API.get('/bmi/history');
      const bmiData = bmiResponse.data;
      
      // Fetch user's diet plan
      let dietPlanData = null;
      try {
        const dietResponse = await getMyActiveDietPlan();
        dietPlanData = dietResponse.data;
      } catch (err) {
        // No diet plan found, that's okay
      }

      setUserBmiData(bmiData);
      setDietPlan(dietPlanData);

      // Add welcome message
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Hello! I'm meFit, your AI fitness assistant! 🏃‍♂️

I can see you have ${bmiData.length} BMI record${bmiData.length !== 1 ? 's' : ''} in your history. ${dietPlanData ? 'I also notice you have an active diet plan!' : ''}

I'm here to help you create personalized exercise recommendations based on your BMI data. What would you like to know about your fitness journey?`
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: 'Sorry, I had trouble accessing your BMI data. Please make sure you\'re logged in and try again.'
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiKey = async (key) => {
    try {
      // Try the newer Gemini 1.5 Flash model first
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello, this is a test message."
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      console.log('Test API Response Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Details:', errorData);
        
        // If 1.5-flash fails, try the older gemini-pro model
        if (response.status === 404) {
          console.log('Trying gemini-pro model...');
          const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: "Hello, this is a test message."
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              }
            })
          });
          
          if (!fallbackResponse.ok) {
            const fallbackErrorData = await fallbackResponse.json();
            console.error('Fallback API Error Details:', fallbackErrorData);
            throw new Error(`API Error: ${fallbackResponse.status} - ${fallbackErrorData.error?.message || 'Unknown error'}`);
          }
          
          const fallbackData = await fallbackResponse.json();
          return fallbackData.candidates && fallbackData.candidates[0] && fallbackData.candidates[0].content;
        }
        
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Test API Success:', data);
      return data.candidates && data.candidates[0] && data.candidates[0].content;
    } catch (error) {
      console.error('API Key Test Failed:', error);
      throw error;
    }
  };

  const handleApiKeySubmit = async (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      try {
        setIsLoading(true);
        await testApiKey(apiKey.trim());
        localStorage.setItem('geminiApiKey', apiKey.trim());
        setIsApiKeySet(true);
      } catch (error) {
        alert('Invalid API key. Please check your Gemini API key and try again.');
        console.error('API Key validation failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare context for AI
      const context = {
        bmiData: userBmiData,
        dietPlan: dietPlan,
        userMessage: content.trim()
      };

      // Call Gemini API - try 1.5-flash first, fallback to gemini-pro
      let response;
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are meFit, an AI fitness assistant. The user has the following BMI data: ${JSON.stringify(userBmiData)} and diet plan: ${JSON.stringify(dietPlan)}. 

User's question: "${content.trim()}"

Please provide helpful, personalized fitness advice based on their BMI data. Focus on exercise recommendations, fitness tips, and motivation. Keep responses conversational and encouraging. If they don't have much BMI data, suggest they start tracking regularly.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });
      } catch (error) {
        // Fallback to gemini-pro if 1.5-flash fails
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are meFit, an AI fitness assistant. The user has the following BMI data: ${JSON.stringify(userBmiData)} and diet plan: ${JSON.stringify(dietPlan)}. 

User's question: "${content.trim()}"

Please provide helpful, personalized fitness advice based on their BMI data. Focus on exercise recommendations, fitness tips, and motivation. Keep responses conversational and encouraging. If they don't have much BMI data, suggest they start tracking regularly.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.candidates[0].content.parts[0].text
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure from AI');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      let errorMessage = 'Sorry, I encountered an error while processing your request.';
      
      if (error.message.includes('API Error: 400')) {
        errorMessage = 'Invalid API key. Please check your Gemini API key and try again.';
      } else if (error.message.includes('API Error: 403')) {
        errorMessage = 'API key access denied. Please check if your API key has the correct permissions.';
      } else if (error.message.includes('API Error: 429')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error.message.includes('API Error: 500')) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      const botErrorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMessage
      };
      setMessages(prev => [...prev, botErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const input = e.target;
      sendMessage(input.value);
      input.value = '';
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const clearApiKey = () => {
    localStorage.removeItem('geminiApiKey');
    setApiKey('');
    setIsApiKeySet(false);
    setMessages([]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChatbot}
          className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">meFit</h3>
                  <p className="text-xs opacity-90">AI Fitness Assistant</p>
                </div>
              </div>
              <button
                onClick={toggleChatbot}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* API Key Setup */}
          {!isApiKeySet ? (
            <div className="flex-1 p-4 flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Setup Required</h3>
                <p className="text-sm text-gray-600 mb-4">
                  To use meFit, please enter your Gemini API key. This allows me to provide personalized fitness recommendations based on your BMI data.
                </p>
              </div>
              
              <form onSubmit={handleApiKeySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Testing API Key...</span>
                    </>
                  ) : (
                    <span>Connect meFit</span>
                  )}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowInfoPopup(true)}
                  className="text-xs text-purple-600 hover:text-purple-800 hover:underline flex items-center justify-center space-x-1 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>How to get your API key</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask me about your fitness journey..."
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]');
                      if (input.value.trim()) {
                        sendMessage(input.value);
                        input.value = '';
                      }
                    }}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                
                {/* Settings */}
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                  <span>Connected to Gemini AI</span>
                  <button
                    onClick={clearApiKey}
                    className="text-red-500 hover:text-red-700 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Info Popup */}
      {showInfoPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInfoPopup(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Popup Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Get Your Gemini API Key</h3>
                    <p className="text-sm text-gray-600">Follow these simple steps</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInfoPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Popup Content */}
            <div className="p-4 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Step-by-Step Guide:</h4>
                  <ol className="space-y-2 text-blue-700">
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">1</span>
                      <span>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Google AI Studio</a></span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">2</span>
                      <span>Sign in with your Google account</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">3</span>
                      <span>Click the "Create API Key" button</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">4</span>
                      <span>Copy the generated API key (starts with "AIza...")</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">5</span>
                      <span>Paste it in the chatbot and click "Connect meFit"</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✅ What you get:</h4>
                  <ul className="space-y-1 text-green-700 text-sm">
                    <li>• Personalized fitness advice based on your BMI data</li>
                    <li>• Exercise recommendations tailored to your goals</li>
                    <li>• 24/7 AI fitness assistant</li>
                    <li>• Free to use with your API key</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">🔒 Privacy & Security:</h4>
                  <ul className="space-y-1 text-gray-600 text-sm">
                    <li>• Your API key is stored locally in your browser only</li>
                    <li>• We never store or share your personal data</li>
                    <li>• Your BMI data stays private and secure</li>
                    <li>• You can disconnect anytime by clearing your API key</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Popup Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Get API Key</span>
                </a>
                <button
                  onClick={() => setShowInfoPopup(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeFitChatbot;
