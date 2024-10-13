import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import InputForm from '../display-components/InputForm'
import { Loader2 } from 'lucide-react'

export default function Display() {
  const { query } = useParams<{ query: string }>()
  const [answers, setAnswers] = useState<{ type: 'assistant'; content: string }[]>([])
  const [displayedQuery, setDisplayedQuery] = useState(query || '')
  const [isLoading, setIsLoading] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [answers])

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
    handleSearch(displayedQuery);
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 p-6">
      <div className="flex-1 flex flex-col space-y-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Search Results</h1>
        <div
          ref={containerRef}
          className="bg-gray-900 rounded-lg p-4 flex-grow overflow-y-auto h-64"
        >
          {answers.map((item, index) => (
            <div key={index}>
              <ReactMarkdown className="text-gray-200">{item.content}</ReactMarkdown>
              <hr className="my-2 border-red-700" />
            </div>
          ))}
        </div>
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        )}
        <div className="sticky bottom-0 bg-gray-950">
          <InputForm
            query={displayedQuery}
            setQuery={setDisplayedQuery}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
