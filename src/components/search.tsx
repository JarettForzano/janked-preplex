import React, { useState, useRef } from 'react'
import { Search, PlusCircle, Leaf, Calendar, Scale, Coffee, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from '../api/fileUpload'
import { ModeToggle } from './mode-toggle'

export default function DarkSearchEngine() {
  const [searchQuery, setSearchQuery] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [fileText, setFileText] = useState('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const response = await FileUpload(event)
      setFileText(response)
    }
  }

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const suggestions = [
    { icon: <Leaf className="w-5 h-5 text-green-400" />, text: 'Most common nutrient deficiency' },
    { icon: <Calendar className="w-5 h-5 text-red-400" />, text: 'Upcoming tech conferences' },
    { icon: <Scale className="w-5 h-5 text-blue-400" />, text: 'City with the most bike lanes' },
    { icon: <Coffee className="w-5 h-5 text-yellow-400" />, text: 'Healthiest cooking oils' },
  ]
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
              <button
                onClick={handleRemoveFile}
                className="p-1 rounded-full hover:bg-hover focus:bg-hover"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                navigate(`/search/${encodeURIComponent(searchQuery.trim())}`, {
                  state: { fileText },
                });
              }
            }}
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
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Search className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          </div>
        </div>

        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="hidden"
          ref={fileInputRef}
        />

        <div className="flex items-center justify-between text-sm text-muted">
          <div className="flex items-center space-x-4">
            <button
              className="flex items-center space-x-1 transition-colors"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--hover-foreground)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
            >
              <Search className="w-4 h-4" />
              <span>Focus</span>
            </button>
            <button
              className="flex items-center space-x-1 transition-colors"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--hover-foreground)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
              onClick={handleAttachClick}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Attach</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Pro</span>
            <div className="w-10 h-6 rounded-full p-1 cursor-pointer" style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border)' }}>
              <div className="w-4 h-4 rounded-full transition-transform duration-200 transform translate-x-4" style={{ backgroundColor: 'var(--accent-foreground)' }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="flex items-center space-x-3 rounded-lg p-4 hover:bg-hover transition-colors border border-border"
              style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--hover-foreground)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
              onClick={() => {
                setSearchQuery(suggestion.text);
                navigate(`/search/${encodeURIComponent(suggestion.text)}`);
              }}
            >
              {suggestion.icon}
              <span>{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
