import React from 'react'
import ChatToggleBar from '../display-components/togglebar-info'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ChatToggleBar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}