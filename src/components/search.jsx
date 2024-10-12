import { useState } from 'react'
import { Search, PlusCircle, Leaf, Calendar, Scale, Coffee } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

export default function SearchEngine() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate();

  const suggestions = [
    { icon: <Leaf className="w-5 h-5 text-green-500" />, text: 'Most common nutrient deficiency' },
    { icon: <Calendar className="w-5 h-5 text-red-500" />, text: 'Upcoming tech conferences' },
    { icon: <Scale className="w-5 h-5 text-blue-500" />, text: 'City with the most bike lanes' },
    { icon: <Coffee className="w-5 h-5 text-yellow-500" />, text: 'Healthiest cooking oils' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">What do you want to know?</h1>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            className="w-full bg-gray-800 rounded-lg py-3 px-4 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 hover:text-white transition-colors">
              <Search className="w-4 h-4" />
              <span>Focus</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-white transition-colors">
              <PlusCircle className="w-4 h-4" />
              <span>Attach</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Pro</span>
            <div className="w-10 h-6 bg-gray-700 rounded-full p-1 cursor-pointer">
              <div className="w-4 h-4 bg-gray-400 rounded-full transition-transform duration-200 transform translate-x-4"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <button key={index} className="flex items-center space-x-3 bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
              {suggestion.icon}
              <span>{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
