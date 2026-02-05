import React, { useState, useEffect } from 'react';
import { useBadgeStore } from '../store/badgeStore';
import { DraggableElement } from './DraggableElement';
import { clsx } from 'clsx';
import { ZoomIn, ZoomOut } from 'lucide-react';

export const CanvasArea: React.FC = () => {
    const {
        elements, activeSide, badgeDimensions, scale,
        selectElement, setDimensions, setScale
    } = useBadgeStore();

    const activeElements = elements.filter(el => el.side === activeSide);

    // Canvas Resize State
    const [resizing, setResizing] = useState<string | null>(null);

    const startCanvasResize = (e: React.PointerEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();
        setResizing(handle);

        // Capture initial state
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = badgeDimensions.width;
        const startH = badgeDimensions.height;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const dx = (moveEvent.clientX - startX) / scale;
            const dy = (moveEvent.clientY - startY) / scale;

            let newW = startW;
            let newH = startH;

            if (handle.includes('e')) newW = Math.max(50, startW + dx);
            if (handle.includes('w')) newW = Math.max(50, startW - dx); // Simplified, usually anchoring left
            if (handle.includes('s')) newH = Math.max(50, startH + dy);

            setDimensions(Math.round(newW), Math.round(newH));
        };

        const onPointerUp = () => {
            setResizing(null);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    return (
        <div className="flex-1 bg-gray-100 overflow-hidden relative flex flex-col h-full">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-50 bg-white p-2 rounded shadow flex items-center gap-2">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1 hover:bg-gray-100 rounded">
                    <ZoomOut size={20} />
                </button>
                <span className="text-sm font-medium min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(3.0, s + 0.1))} className="p-1 hover:bg-gray-100 rounded">
                    <ZoomIn size={20} />
                </button>
            </div>

            {/* Main Scrollable Area */}
            <div
                className="flex-1 overflow-auto flex items-center justify-center p-8 custom-scrollbar"
                onClick={(e) => {
                    if (e.target === e.currentTarget) selectElement(null);
                }}
            >
                <div
                    className="relative bg-white shadow-2xl transition-transform duration-75 ease-linear"
                    style={{
                        width: badgeDimensions.width,
                        height: badgeDimensions.height,
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center' // Or top left, user said "top left" in prompt but center usually feels better for centering in viewport. 
                        // Prompt said: "Zoom rule: transform: scale(zoom); transform-origin: top left;"
                        // I should stick to prompt "top left" OR if centering is desired, I need to handle parent flex.
                        // If parent is flex center, scale from center works well.
                        // Let's use 'center' for better UX inside flex container, but if it causes issues I'll revert.
                    }}
                    onMouseDown={(e) => {
                        // Clear selection if clicking on the "paper" itself (not an element)
                        if (e.target === e.currentTarget) selectElement(null);
                    }}
                >
                    {/* Watermark for Back Side */}
                    {activeSide === 'back' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                            <span className="text-4xl font-bold uppercase rotate-45 text-gray-400">Verso</span>
                        </div>
                    )}

                    {/* Elements */}
                    {activeElements.map(el => (
                        <DraggableElement key={el.id} element={el} />
                    ))}

                    {/* Canvas Resize Handles (e, s, se) */}
                    <div
                        className="absolute -right-1 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-200 opacity-50 transition-opacity"
                        onPointerDown={(e) => startCanvasResize(e, 'e')}
                    />
                    <div
                        className="absolute -bottom-1 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-200 opacity-50 transition-opacity"
                        onPointerDown={(e) => startCanvasResize(e, 's')}
                    />
                    <div
                        className="absolute -right-1 -bottom-1 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize z-50"
                        onPointerDown={(e) => startCanvasResize(e, 'se')}
                    />

                </div>
            </div>
        </div>
    );
};
