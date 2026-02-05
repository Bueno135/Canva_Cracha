import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CanvasArea } from './components/CanvasArea';
import { PropertiesPanel } from './components/PropertiesPanel';
import { PreviewModal } from './components/PreviewModal';
import { useBadgeStore } from './store/badgeStore';
import { Eye, Undo, Redo, LayoutTemplate } from 'lucide-react';
import { clsx } from 'clsx';

function App() {
  const [showPreview, setShowPreview] = useState(false);
  const {
    copy, paste, deleteSelected, activeSide, setActiveSide
  } = useBadgeStore();

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === 'Delete') {
        deleteSelected();
      }
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        copy();
      }
      if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        paste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copy, paste, deleteSelected]);

  return (
    <div className="flex flex-col h-screen w-screen bg-white text-gray-900 overflow-hidden">
      {/* HEADER */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white shrink-0 z-50 relative shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            ⚡
          </div>
          <span className="font-semibold text-lg tracking-tight">iBolt Editor <span className="text-xs font-normal text-gray-400 border border-gray-200 rounded px-1 ml-1">v2.0 React</span></span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1 mr-4">
            <button
              onClick={() => setActiveSide('front')}
              className={clsx("px-3 py-1 text-xs font-medium rounded transition-all", activeSide === 'front' ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-900")}
            >
              Frente
            </button>
            <button
              onClick={() => setActiveSide('back')}
              className={clsx("px-3 py-1 text-xs font-medium rounded transition-all", activeSide === 'back' ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-900")}
            >
              Verso
            </button>
          </div>

          <button
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm text-sm font-medium transition-colors"
            onClick={() => setShowPreview(true)}
          >
            <Eye size={16} />
            Visualizar
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        <main className="flex-1 flex flex-col relative z-0">
          <CanvasArea />
        </main>

        <PropertiesPanel />
      </div>

      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}
    </div>
  );
}

export default App;
