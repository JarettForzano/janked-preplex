import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import InputForm from '../display-components/InputForm'
import { Loader2 } from 'lucide-react'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

export default function Display() {
  const { query } = useParams<{ query: string }>()
  const [chat, setChat] = useState<{ type: 'assistant' | 'user'; content: string }[]>([])
  const [displayedQuery, setDisplayedQuery] = useState(query || '')
  const [isLoading, setIsLoading] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query) {
      setIsLoading(true)
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
  }, [chat])

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
      ws.current?.send(JSON.stringify({ query: searchQuery }))
      setDisplayedQuery('');
      setChat((prev) => [
        ...prev,
        { type: 'user', content: `${searchQuery}` }
      ])
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      //console.log(data.content)
      if (data.type === 'assistant') {
        setChat((prev) => [
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
    <div className="flex h-screen p-6 " style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="flex-1 flex flex-col space-y-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--primary)' }}>Search Results</h1>
        <div
          ref={containerRef}
          className="rounded-lg p-4 flex-grow overflow-y-auto h-64"
          style={{ backgroundColor: 'var(--background-secondary)'}}
        >
          {chat.map((item, index) => (
            <div key={index}>
              {item.type === 'assistant' ? (
                <ReactMarkdown className="markdown-container leading-7 [&:not(:first-child)]:mt-6" remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {item.content}
                </ReactMarkdown>
              ) : (
                <>
                  {index > 0 && ( // Show line only if it's not the first question
                    <div className="py-2">
                      <hr className="my-2" style={{ borderColor: 'var(--border)' }} />
                    </div>
                  )}
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4">
                    {item.content}
                  </h4>
                </>
              )}
            </div>
          ))}
        </div>
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        )}
        <div className="sticky bottom-0">
          <InputForm
            setQuery={setDisplayedQuery}
            onSubmit={handleSubmit}
            disabled={isLoading}
            query={displayedQuery}
          />
        </div>
      </div>
    </div>
  )
}
