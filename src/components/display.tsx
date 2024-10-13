import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import AnswerDisplay from '@/display-components/AnswerDisplay'
import InputForm from '@/display-components/InputForm'
import { Loader2 } from 'lucide-react'

export default function Display() {
  const { query } = useParams<{ query: string }>()
  const [answers, setAnswers] = useState<{ type: 'assistant'; content: string }[]>([])
  const [displayedQuery, setDisplayedQuery] = useState(query || '')
  const [isLoading, setIsLoading] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery) {
      console.error('No query to send')
      return
    }

    if (ws.current) {
      ws.current.close()
    }

    setAnswers([])
    setIsLoading(true)

    ws.current = new WebSocket('ws://localhost:4000')

    ws.current.onopen = () => {
      console.log('WebSocket connection opened')
      console.log('sending query:', searchQuery)
      ws.current?.send(JSON.stringify({ query: searchQuery }))
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'assistant') {
        setAnswers((prev) => [...prev, { type: 'assistant', content: data.content }])
      } else if (data.type === 'end') {
        ws.current?.close()
        setIsLoading(false)
      } else if (data.type === 'error') {
        console.error('Error from server:', data.content)
        ws.current?.close()
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

  useEffect(() => {
    if (displayedQuery) {
      handleSearch(displayedQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          onSubmit={() => handleSearch(displayedQuery)}
        />
      </div>
    </div>
  )
}