import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Answer {
  type: 'assistant';
  content: string;
}

interface AnswerDisplayProps {
  answers: Answer[];
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answers }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 flex-grow">
      <div className="bg-gray-700 rounded-lg p-4 flex-grow overflow-y-auto h-auto">
        {answers.map((item, index) => (
          <div key={index}>
            <ReactMarkdown>{item.content}</ReactMarkdown>
            <hr className="my-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerDisplay;
