import React from 'react';

interface Answer {
  query: string | undefined;
  answer: string;
}

interface AnswerDisplayProps {
  answers: Answer[];
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answers }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 flex-grow">
      <h2 className="text-2xl font-bold mb-4">Answers</h2>
      <div className="bg-gray-700 rounded-lg p-4 flex-grow overflow-y-auto h-96">
        {answers.map((item, index) => (
          <div key={index}>
            <div className="font-bold">{item.query}</div>
            <div>{item.answer}</div>
            <hr className="my-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerDisplay;
