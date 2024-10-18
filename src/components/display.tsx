import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import AnswerDisplay from '../display-components/AnswerDisplay';
import StepsDisplay from '../display-components/StepsDisplay';
import InputForm from '../display-components/InputForm';

export default function Display() {
  const { query } = useParams<{ query: string }>();
  const [answers, setAnswers] = useState<{ query: string | undefined; answer: string }[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [displayedQuery, setDisplayedQuery] = useState('');
  const ws = useRef<WebSocket | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSteps([]);
    setAnswers([]);

    // Close existing WebSocket if any
    if (ws.current) {
      ws.current.close();
    }

    // Establish WebSocket connection
    ws.current = new WebSocket('ws://localhost:4000');

    ws.current.onopen = () => {
      console.log('WebSocket connection opened');
      // Send the query to the server
      console.log('sending query:', query);
      ws.current?.send(JSON.stringify({ query: displayedQuery }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received data:', data);
      if (data.type === 'assistant') {
        // Append assistant's thought process to steps
        setSteps((prev) => [...prev, data.content]);
      } else if (data.type === 'answer') {
        // Final answer
        setAnswers((prev) => [...prev, { query: displayedQuery, answer: data.content }]);
      } else if (data.type === 'end') {
        // The assistant has finished
        ws.current?.close();
      } else if (data.type === 'error') {
        // Handle errors
        setSteps((prev) => [...prev, `Error: ${data.content}`]);
        ws.current?.close();
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  useEffect(() => {
    // Clean up WebSocket when component unmounts
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 p-6">
      <div className="flex-1 flex flex-col mr-6">
        <AnswerDisplay answers={answers} />
        <InputForm query={displayedQuery} setQuery={setDisplayedQuery} onSubmit={handleSearch} />
      </div>
      <StepsDisplay steps={steps} />
    </div>
  );
}
