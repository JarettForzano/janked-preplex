import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Answer {
  type: 'plan' | 'answer';
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
            {item.type === 'plan' ? (
              <>
                <div className="font-bold">Plan:</div>
                <ReactMarkdown>{item.content}</ReactMarkdown>
                <hr className="my-2" />
              </>
            ) : (
              <>
                <div className="font-bold">Answer:</div>
                <ReactMarkdown>{item.content}</ReactMarkdown>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerDisplay;
