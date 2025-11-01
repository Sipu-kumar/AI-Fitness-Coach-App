import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function BMIProgressChart({ bmiData = [] }) {
  // Use real data if available, otherwise show empty state
  const data = bmiData;

  // Sort data by date
  const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Create BMI category zones for better visualization
  const createBMIZones = () => {
    const zones = [];
    
    // Underweight zone (10-18.5)
    zones.push({
      label: 'Underweight',
      data: Array(sortedData.length).fill(18.5),
      borderColor: 'transparent',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: '+1',
      pointRadius: 0,
      borderWidth: 0,
      order: 0
    });
    
    // Normal weight zone (18.5-25)
    zones.push({
      label: 'Normal',
      data: Array(sortedData.length).fill(25),
      borderColor: 'transparent',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: '+1',
      pointRadius: 0,
      borderWidth: 0,
      order: 0
    });
    
    // Overweight zone (25-30)
    zones.push({
      label: 'Overweight',
      data: Array(sortedData.length).fill(30),
      borderColor: 'transparent',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: '+1',
      pointRadius: 0,
      borderWidth: 0,
      order: 0
    });
    
    return zones;
  };

  const chartData = {
    labels: sortedData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: sortedData.length > 7 ? '2-digit' : undefined // Show year if more than 7 records
      });
    }),
    datasets: [
      ...createBMIZones(),
      {
        label: 'BMI Progress',
        data: sortedData.map(item => item.bmi),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 4,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: Math.max(6, Math.min(10, 8 + sortedData.length / 8)), // Larger points for better visibility
        pointHoverRadius: Math.max(8, Math.min(12, 10 + sortedData.length / 8)),
        pointHoverBackgroundColor: 'rgb(79, 70, 229)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 4,
        order: 1
      }
    ]
  };

  // Calculate dynamic Y-axis range based on actual data
  const getYAxisRange = () => {
    if (sortedData.length === 0) return { min: 15, max: 35 };
    
    const bmiValues = sortedData.map(item => item.bmi);
    const minBMI = Math.min(...bmiValues);
    const maxBMI = Math.max(...bmiValues);
    
    // Add padding to make curves more visible
    const padding = Math.max(2, (maxBMI - minBMI) * 0.2);
    const calculatedMin = Math.max(10, minBMI - padding);
    const calculatedMax = Math.min(50, maxBMI + padding);
    
    return { min: calculatedMin, max: calculatedMax };
  };

  const yAxisRange = getYAxisRange();

  // Detect if we're on mobile for responsive adjustments
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        cornerRadius: isMobile ? 8 : 12,
        displayColors: false,
        padding: isMobile ? 8 : 12,
        titleFont: {
          size: isMobile ? 12 : 14,
          weight: 'bold'
        },
        bodyFont: {
          size: isMobile ? 11 : 13
        },
        callbacks: {
          title: function(context) {
            const dataIndex = context[0].dataIndex;
            const record = sortedData[dataIndex];
            const date = new Date(record.date);
            return date.toLocaleDateString('en-US', { 
              weekday: isMobile ? 'short' : 'long',
              year: 'numeric',
              month: isMobile ? 'short' : 'long',
              day: 'numeric'
            });
          },
          label: function(context) {
            const dataIndex = context[0].dataIndex;
            const record = sortedData[dataIndex];
            const bmi = context.parsed.y;
            
            return [
              `BMI: ${bmi.toFixed(1)} (${record.category})`,
              `Weight: ${record.weightKg} kg`,
              `Height: ${record.heightCm} cm`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: !isMobile,
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: isMobile ? 10 : 13,
            weight: '500'
          },
          padding: isMobile ? 4 : 8,
          maxRotation: isMobile ? 45 : 0,
          maxTicksLimit: isMobile ? 6 : 10
        }
      },
      y: {
        min: yAxisRange.min,
        max: yAxisRange.max,
        grid: {
          color: 'rgba(107, 114, 128, 0.15)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: isMobile ? 10 : 13,
            weight: '500'
          },
          padding: isMobile ? 4 : 8,
          stepSize: isMobile ? 1 : 0.5, // Larger steps on mobile for readability
          callback: function(value) {
            return value.toFixed(isMobile ? 0 : 1);
          }
        }
      }
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgb(99, 102, 241)',
        hoverBorderColor: '#fff',
        hoverBorderWidth: 3,
        radius: isMobile ? 4 : 6
      },
      line: {
        borderWidth: isMobile ? 3 : 4,
        tension: 0.3
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    // Better touch interaction for mobile
    onHover: (event, activeElements) => {
      if (isMobile) {
        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
    }
  };

  return (
    <div className="w-full h-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
