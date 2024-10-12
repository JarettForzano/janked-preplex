import React from 'react';
import { Send } from 'lucide-react';

interface InputFormProps {
  query: string | undefined;
  setQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const InputForm: React.FC<InputFormProps> = ({ query, setQuery, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="flex">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your query here..."
        className="flex-grow bg-gray-800 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-4 py-2 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
};

export default InputForm;