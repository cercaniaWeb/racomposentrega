import React from 'react';

// Simple bar chart component for sales metrics
const BarChart = ({ data, labels, title, color = 'blue' }) => {
  // Find the maximum value to scale the bars
  const maxValue = Math.max(...data, 1); // Ensure minimum of 1 to avoid division by zero

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((value, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-600">{labels[index]}</div>
            <div className="flex-1 ml-4">
              <div className="flex items-center">
                <div 
                  className={`h-6 rounded ${colorClasses[color]} text-white text-xs flex items-center justify-center`}
                  style={{ width: `${(value / maxValue) * 100}%` }}
                >
                  {value}
                </div>
                <span className="ml-2 text-sm text-gray-600">{value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Donut chart component for category distribution
const DonutChart = ({ data, labels, title, colors = [] }) => {
  // Default color palette
  const defaultColors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 
    'bg-purple-500', 'bg-yellow-500', 'bg-indigo-500',
    'bg-pink-500', 'bg-teal-500', 'bg-amber-500'
  ];

  // Calculate total for percentage calculation
  const total = data.reduce((sum, value) => sum + value, 0);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          {/* Donut chart */}
          <div className="absolute inset-0 flex items-center justify-center">
            {data.map((value, index) => {
              const percentage = total > 0 ? (value / total) * 100 : 0;
              const color = colors[index] || defaultColors[index % defaultColors.length];
              
              // Calculate the rotation and size of each segment
              const startAngle = data.slice(0, index).reduce((sum, val) => sum + (total > 0 ? (val / total) * 360 : 0), 0);
              const segmentAngle = total > 0 ? (value / total) * 360 : 0;
              
              return (
                <div
                  key={index}
                  className={`absolute inset-0 rounded-full ${color}`}
                  style={{
                    clipPath: `conic-gradient(from ${startAngle}deg, ${color} ${segmentAngle}deg, transparent ${segmentAngle}deg)`,
                  }}
                />
              );
            })}
            {/* Center circle to create donut effect */}
            <div className="absolute w-20 h-20 bg-white rounded-full z-10"></div>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {labels.map((label, index) => {
          const percentage = total > 0 ? (data[index] / total) * 100 : 0;
          const color = colors[index] || defaultColors[index % defaultColors.length];
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </div>
              <span className="text-sm text-gray-900 font-medium">{percentage.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Trend indicator component
const TrendIndicator = ({ value, title, isPositive = true, icon: Icon }) => {
  const color = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-100' : 'bg-red-100';
  const iconColor = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <div className={`flex items-center mt-4 ${color}`}>
        <Icon className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">{isPositive ? '+' : ''}{value}%</span>
        <span className="text-xs text-gray-500 ml-1">vs anterior</span>
      </div>
    </div>
  );
};

export { BarChart, DonutChart, TrendIndicator };