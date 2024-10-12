import React from 'react';

interface StepsDisplayProps {
  steps: string[];
}

const StepsDisplay: React.FC<StepsDisplayProps> = ({ steps }) => {
  return (
    <div className="w-1/3 bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Steps</h2>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-2">
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsDisplay;
