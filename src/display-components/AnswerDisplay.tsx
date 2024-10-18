import React from 'react'
import ReactMarkdown from 'react-markdown'
import { ScrollArea } from "@/components/ui/scroll-area"

interface Answer {
  type: 'assistant'
  content: string
}

interface AnswerDisplayProps {
  answers: Answer[]
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answers }) => {
  return (
    <ScrollArea className="flex-1 border border-red-900 rounded-lg p-4 bg-gray-900">
      {answers.map((item, index) => (
        <div key={index} className="mb-4 last:mb-0">
          <ReactMarkdown className="text-gray-200">{item.content}</ReactMarkdown>
          {index < answers.length - 1 && <hr className="my-4 border-gray-800" />}
        </div>
      ))}
    </ScrollArea>
  )
}

export default AnswerDisplay