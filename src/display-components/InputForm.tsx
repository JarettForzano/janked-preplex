import React from 'react';
// import { Send } from 'lucide-react';

interface InputFormProps {
  setQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ setQuery, onSubmit, disabled }) => {
  return (
    <form onSubmit={onSubmit} className="flex">
      <input  
        type="text"
        placeholder="Ask a followup question..."
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg py-3 px-4 pr-12 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
        style={{
          backgroundColor: 'var(--input)',
          color: 'var(--foreground)',
          borderColor: 'var(--border)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring-accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {/* <button
        type="submit"
        disabled={disabled}
        className="bg-red-600 hover:bg-red-700 text-white rounded-r-lg px-4 py-2 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-700"
      >
        <Send className="w-5 h-5" style={{ color: 'var(--primary)' }} />
      </button> */}
    </form>
  );
};

export default InputForm;
