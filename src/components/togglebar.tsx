// src/components/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import ChatToggleBar from '../display-components/togglebar-info'; // Adjust the import path as necessary

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <ChatToggleBar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
