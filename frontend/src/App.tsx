import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { NavigationSidebar } from './components/NavigationSidebar.tsx';
import { CanvasArea } from './components/CanvasArea.tsx';
import { PropertiesPanel } from './components/PropertiesPanel.tsx';
import { PreviewModal } from './components/PreviewModal.tsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.ts';
import { Eye, Menu } from 'lucide-react';

function App() {
  const [showPreview, setShowPreview] = useState(false);

  // Custom Hook for Shortcuts
  useKeyboardShortcuts();

  return (
    <div className="flex flex-col h-screen w-screen bg-brand-bg text-gray-900 overflow-hidden font-sans">
      {/* HEADER */}
      <header className="h-[60px] flex items-center justify-between px-4 bg-brand-indigo text-white shrink-0 z-50 relative shadow-md">
        {/* Left: Brand / Menu */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Menu size={20} />
          </button>
          <span className="font-bold text-xl tracking-wide">iBolt</span>
        </div>

        {/* Center: Preview Button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            className="flex items-center gap-2 px-4 py-1.5 bg-white text-brand-text rounded shadow-sm text-sm font-semibold hover:bg-gray-50 transition-colors"
            onClick={() => setShowPreview(true)}
          >
            <Eye size={16} className="text-red-500" />
            Visualizar Impressão
          </button>
        </div>

        {/* Right: Company/User Info */}
        <div className="flex items-center gap-4">
          <span className="font-semibold text-lg opacity-90">Aegea</span>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 1. Navigation Sidebar (Leftmost) */}
        <NavigationSidebar />

        {/* 2. Editor Sidebar (Tools) */}
        <Sidebar />

        {/* 3. Canvas Area (Center) */}
        <main className="flex-1 flex flex-col relative z-0 bg-[#f4f6f8]">
          <CanvasArea />
        </main>

        {/* 4. Properties Panel (Right) */}
        <div className="w-[300px] border-l border-gray-200 bg-white z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
          <PropertiesPanel />
        </div>
      </div>

      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}
    </div>
  );
}

export default App;

