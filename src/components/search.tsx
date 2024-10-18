import React, { useState, useRef, useEffect } from 'react';
import { Search, PlusCircle, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../api/fileUpload';
import { ModeToggle } from '../display-components/mode-toggle';

export default function DarkSearchEngine() {
  const [searchQuery, setSearchQuery] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileText, setFileText] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const response = await FileUpload(event);
      setFileText(response);
    }
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const gridSuggestions = [
    { icon: '📅', text: 'Upcoming tech conferences' },
    { icon: '🔎', text: 'How is Perplexity AI different?' },
    { icon: '🎬', text: 'Most popular YouTube creators in 2024' },
    { icon: '🚨', text: 'Penalty for late tax filing' },
  ]
  const suggestions = [
    "How Yeager Broke the Sound Barrier",
    "TikTok Pivots to AI Moderators",
    "Adobe's AI Video Model, Firefly in Premiere Pro",
    "Historic Starship Chopsticks Catch",
    "AI Tongue Distinguishes Pepsi and Coke",
    "Dario Amodei's 'Machines of Loving Grace'",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8" style={{ color: 'var(--primary)' }}>
          What do you want to know?
        </h1>

        <div className="flex justify-end mb-4">
          <ModeToggle />
        </div>

        {file && (
          <div className="bg-surface rounded-lg text-foreground p-3 mb-2 border border-border">
            <div className="flex items-center gap-3">
              <div className="bg-surface-secondary p-2 rounded-sm">
                <PlusCircle className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{file.name}</div>
                <div className="text-xs">{(file.size / 1024).toFixed(2)} kB</div>
              </div>
              <button onClick={handleRemoveFile} className="p-1 rounded-full hover:bg-hover focus:bg-hover">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="relative mb-4 search-container">
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/search/${encodeURIComponent(searchQuery.trim())}`, { state: { fileText } });
              }
            }}
            className="w-full rounded-t-lg py-3 px-4 pr-12 border border-border focus:outline-none"
            style={{
              backgroundColor: 'var(--input)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)',
              borderBottomLeftRadius: showSuggestions ? '0' : '0.5rem',
              borderBottomRightRadius: showSuggestions ? '0' : '0.5rem',
            }}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Search className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          </div>

          {showSuggestions && (
            <div className="absolute w-full bg-surface border border-t-0 border-border rounded-b-lg shadow-lg z-10" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--suggestion-background)', color: 'var(--foreground)' }}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    navigate(`/search/${encodeURIComponent(suggestion)}`);
                  }}
                  style={{ backgroundColor: 'var(--suggestion-background)', color: 'var(--foreground)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-background)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--suggestion-background)')}
                >
                  <span>{suggestion}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Section under the Search Bar */}
        <div className="relative mt-md">
          <div className="grid grid-cols-1 gap-sm md:auto-rows-fr md:grid-cols-2">
            {gridSuggestions.map((item, index) => (
              <div
                key={index}
                className="group col-span-1 flex h-full w-full items-center gap-x-sm rounded-lg border p-xs transition duration-300 cursor-pointer"
                style={{
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-background)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--background)')}
                onClick={() => {
                  setSearchQuery(item.text);
                  navigate(`/search/${encodeURIComponent(item.text)}`);
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md p-xs">
                  <div className="text-base">{item.icon}</div>
                </div>
                <div className="text-sm font-medium">{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" ref={fileInputRef} />

        <div className="flex items-center justify-between text-sm text-muted">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1" onClick={handleAttachClick}>
              <PlusCircle className="w-4 h-4" />
              <span>Attach</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
