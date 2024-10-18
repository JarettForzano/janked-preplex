import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import AnswerDisplay from '../display-components/AnswerDisplay'
import InputForm from '../display-components/InputForm'
import { Loader2 } from 'lucide-react'

export default function Display() {
  const { query } = useParams<{ query: string }>()
  const [answers, setAnswers] = useState<{ type: 'assistant'; content: string }[]>([])
  const [displayedQuery, setDisplayedQuery] = useState(query || '')
  const [isLoading, setIsLoading] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (query) {
      handleSearch(query)
    }
    // Cleanup on unmount or query change
    return () => {
      if (ws.current) {
        ws.current.close()
        ws.current = null
      }
    }
  }, [query])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery) {
      console.error('No query to send')
      return
    }

    if (ws.current) {
      ws.current.close()
    }

    setIsLoading(true)

    ws.current = new WebSocket('ws://localhost:4000')

    ws.current.onopen = () => {
      console.log('WebSocket connection opened')
      console.log('sending query:', searchQuery)
      ws.current?.send(JSON.stringify({ query: searchQuery }))
      setAnswers((prev) => [
        ...prev,
        { type: 'assistant', content: `**Question:** ${searchQuery}` }
      ])
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'assistant') {
        // Include the new query in the answers for context
        setAnswers((prev) => [
          ...prev,
          { type: 'assistant', content: data.content },
        ])
      } else if (data.type === 'end') {
        ws.current?.close()
        ws.current = null
        setIsLoading(false)
      } else if (data.type === 'error') {
        console.error('Error from server:', data.content)
        ws.current?.close()
        ws.current = null
        setIsLoading(false)
      }
    }

    ws.current.onclose = () => {
      console.log('WebSocket connection closed')
      setIsLoading(false)
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayedQuery.trim()) {
      return
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 p-6">
      <div className="flex-1 flex flex-col space-y-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Search Results</h1>
        <AnswerDisplay answers={answers} />
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        )}
        <InputForm
          query={displayedQuery}
          setQuery={setDisplayedQuery}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
