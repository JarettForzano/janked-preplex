import React from 'react'
import { Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface InputFormProps {
  query: string | undefined
  setQuery: (query: string) => void
  onSubmit: (e: React.FormEvent) => void
}

const InputForm: React.FC<InputFormProps> = ({ query, setQuery, onSubmit }) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(e) }} className="flex space-x-2">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your query here..."
        className="flex-grow bg-gray-900 text-gray-200 border-red-900 focus:ring-red-700 focus:border-red-700"
      />
      <Button
        type="submit"
        className="bg-red-700 hover:bg-red-600 text-white"
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  )
}

export default InputForm