import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, MessageSquarePlus, MessageSquare, User } from "lucide-react"

export default function ChatToggleBar() {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const chats = [
    { id: 1, name: "Project Discussion" },
    { id: 2, name: "Team Meeting" },
    { id: 3, name: "Client Feedback" },
    { id: 4, name: "Brainstorming Session" },
    { id: 5, name: "Bug Report" },
  ]

  return (
    <div className={`relative h-screen bg-background border-r transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 -right-4 z-10 rounded-full bg-background border shadow-md"
        onClick={toggleSidebar}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <div className="p-4">
        <Button variant="outline" className={`w-full justify-start ${!isExpanded && 'px-0 justify-center'}`}>
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          {isExpanded && "New Chat"}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-2 p-4">
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              className={`w-full justify-start ${!isExpanded && 'px-0 justify-center'}`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {isExpanded && chat.name}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="absolute bottom-4 left-4 right-4">
        <Link href="/profile">
          <Button variant="ghost" className={`w-full justify-start ${!isExpanded && 'px-0 justify-center'}`}>
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {isExpanded && "User Profile"}
          </Button>
        </Link>
      </div>
    </div>
  )
}