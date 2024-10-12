import React, { useState } from 'react'
import { Send } from 'lucide-react'
import { useParams } from 'react-router-dom';

export default function Display() {
  const { query } = useParams();
  const [answer, setAnswer] = useState('')
  const [steps, setSteps] = useState([])

  const handleSearch = async () => {
    setAnswer('')
    setSteps([])
    
    const response = "This is a simulated answer to your query. It would normally be streamed from an API."
    const simulatedSteps = [
      "Analyzing query...",
      "Searching database...",
      "Processing results...",
      "Generating response..."
    ]

    for (let step of simulatedSteps) {
      setSteps(prev => [...prev, step])
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    for (let char of response) {
      setAnswer(prev => prev + char)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 p-6">
      <div className="flex-1 flex flex-col mr-6">
        <div className="bg-gray-800 rounded-lg p-6 mb-6 flex-grow">
          <h2 className="text-2xl font-bold mb-4">Search Query</h2>
          <div className="bg-gray-700 rounded-lg p-4 h-24 mb-4">
            {query || "Your search query will appear here"}
          </div>
          <h2 className="text-2xl font-bold mb-4">Answer</h2>
          <div className="bg-gray-700 rounded-lg p-4 h-64 overflow-auto">
            {answer || "The answer will be streamed here"}
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => console.log(e.target.value)}
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
      </div>
      <div className="w-1/3 bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Steps</h2>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-2">
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
