export default function Advice({ bmi }) {
  if (!bmi) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-gray-600">Calculate your BMI to get personalized health advice</p>
      </div>
    );
  }

  const getAdviceData = (bmi) => {
    if (bmi < 18.5) {
      return {
        title: "Underweight",
        icon: "📈",
        color: "blue",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-800",
        advice: "Focus on healthy weight gain through increased caloric intake and strength training. Consider consulting a nutritionist or fitness instructor.",
        tips: ["Increase protein intake", "Strength training 3x/week", "Eat nutrient-dense foods", "Consult a professional"]
      };
    } else if (bmi < 25) {
      return {
        title: "Normal Weight",
        icon: "✅",
        color: "green",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-800",
        advice: "Great job! Maintain your healthy weight with a balanced diet and regular exercise routine.",
        tips: ["Maintain balanced diet", "Mix cardio & strength", "Stay hydrated", "Regular health checkups"]
      };
    } else if (bmi < 30) {
      return {
        title: "Overweight",
        icon: "⚖️",
        color: "yellow",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        textColor: "text-yellow-800",
        advice: "Focus on creating a calorie deficit through diet and exercise. Aim for gradual, sustainable weight loss.",
        tips: ["Calorie deficit diet", "Cardio exercises", "Resistance training", "Track progress"]
      };
    } else {
      return {
        title: "Obesity",
        icon: "🏥",
        color: "red",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        advice: "Please consult with a healthcare professional for a structured weight-loss plan. Medical supervision is recommended.",
        tips: ["Consult healthcare provider", "Structured weight-loss plan", "Medical checkup", "Professional guidance"]
      };
    }
  };

  const adviceData = getAdviceData(bmi);

  return (
    <div className={`${adviceData.bgColor} ${adviceData.borderColor} border-2 rounded-2xl p-6`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-3xl">{adviceData.icon}</div>
        <div>
          <h3 className={`text-lg font-bold ${adviceData.textColor}`}>{adviceData.title}</h3>
          <p className="text-sm text-gray-600">BMI: {bmi}</p>
        </div>
      </div>
      
      <p className={`${adviceData.textColor} mb-4 leading-relaxed`}>
        {adviceData.advice}
      </p>
      
      <div className="space-y-2">
        <h4 className={`font-semibold ${adviceData.textColor} text-sm`}>Recommended Actions:</h4>
        <ul className="space-y-1">
          {adviceData.tips.map((tip, index) => (
            <li key={index} className={`text-sm ${adviceData.textColor} flex items-center space-x-2`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-current`}></div>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
