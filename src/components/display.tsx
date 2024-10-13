import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import AnswerDisplay from '../display-components/AnswerDisplay';
import InputForm from '../display-components/InputForm';

export default function Display() {
  const { query } = useParams<{ query: string }>();
  const [answers, setAnswers] = useState<{ type: 'assistant'; content: string }[]>([]);
  const [displayedQuery, setDisplayedQuery] = useState(query || '');
  const ws = useRef<WebSocket | null>(null);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery) {
      console.error('No query to send');
      return;
    }

    if (ws.current) {
      ws.current.close();
    }

    setAnswers([]);

    ws.current = new WebSocket('ws://localhost:4000');

    ws.current.onopen = () => {
      console.log('WebSocket connection opened');
      console.log('sending query:', searchQuery);
      ws.current?.send(JSON.stringify({ query: searchQuery }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'assistant') {
        setAnswers((prev) => [...prev, { type: 'assistant', content: data.content }]);
      } else if (data.type === 'end') {
        ws.current?.close();
      } else if (data.type === 'error') {
        console.error('Error from server:', data.content);
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
    if (displayedQuery) {
      handleSearch(displayedQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 p-6">
      <div className="flex-1 flex flex-col mr-6">
        <AnswerDisplay answers={answers} />
        <InputForm
          query={displayedQuery}
          setQuery={setDisplayedQuery}
          onSubmit={() => handleSearch(displayedQuery)}
        />
      </div>
    </div>
  );
}
