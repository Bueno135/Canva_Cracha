import React, { useState, useEffect } from 'react';
import { useBadgeStore } from '../store/badgeStore.ts';
import { DraggableElement } from './DraggableElement.tsx';
import { clsx } from 'clsx';
import { ZoomIn, ZoomOut } from 'lucide-react';

export const CanvasArea: React.FC = () => {
    const {
        elements, activeSide, badgeDimensions, scale,
        selectElement, setDimensions, setScale, setSelectedIds
    } = useBadgeStore();

    const activeElements = elements.filter(el => el.side === activeSide);

    const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number; isSelecting: boolean } | null>(null);

    const startCanvasResize = (e: React.PointerEvent, handle: 'e' | 's' | 'se') => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = badgeDimensions.width;
        const startHeight = badgeDimensions.height;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const dx = (moveEvent.clientX - startX) / scale;
            const dy = (moveEvent.clientY - startY) / scale;

            let newWidth = startWidth;
            let newHeight = startHeight;

            if (handle === 'e' || handle === 'se') {
                newWidth = Math.max(50, startWidth + dx);
            }
            if (handle === 's' || handle === 'se') {
                newHeight = Math.max(50, startHeight + dy);
            }

            setDimensions(Math.round(newWidth), Math.round(newHeight));
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    // --- SELECTION BOX LOGIC ---
    const handleCanvasPointerDown = (e: React.PointerEvent) => {
        // Only start selection if clicking on the canvas background directly
        if (e.target !== e.currentTarget) return;

        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const startX = (e.clientX - rect.left) / scale;
        const startY = (e.clientY - rect.top) / scale;

        setSelectionBox({
            startX,
            startY,
            currentX: startX,
            currentY: startY,
            isSelecting: true
        });

        // Clear selection unless shift is held (windows style usually clears)
        if (!e.shiftKey) {
            selectElement(null);
        }
    };

    const handleCanvasPointerMove = (e: React.PointerEvent) => {
        if (!selectionBox?.isSelecting) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / scale;
        const currentY = (e.clientY - rect.top) / scale;

        setSelectionBox(prev => prev ? { ...prev, currentX, currentY } : null);
    };

    const handleCanvasPointerUp = () => {
        if (!selectionBox?.isSelecting) return;

        // Calculate final box geometry
        const x = Math.min(selectionBox.startX, selectionBox.currentX);
        const y = Math.min(selectionBox.startY, selectionBox.currentY);
        const width = Math.abs(selectionBox.currentX - selectionBox.startX);
        const height = Math.abs(selectionBox.currentY - selectionBox.startY);

        // Find intersecting elements
        const selected = activeElements.filter(el => {
            return (
                el.x < x + width &&
                el.x + el.width > x &&
                el.y < y + height &&
                el.y + el.height > y
            );
        }).map(el => el.id);

        if (selected.length > 0) {
            setSelectedIds(selected);
        }

        setSelectionBox(null);
    };

    return (
        <div className="flex-1 bg-gray-100 overflow-hidden relative flex flex-col h-full" onPointerUp={handleCanvasPointerUp} onPointerLeave={handleCanvasPointerUp}>
            {/* Zoom Controls */}
            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2 bg-white p-2 rounded-lg shadow-lg z-50">
                <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                    title="Zoom Out"
                >
                    <ZoomOut size={20} />
                </button>
                <span className="flex items-center text-sm min-w-[3rem] justify-center">
                    {Math.round(scale * 100)}%
                </span>
                <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => setScale(s => Math.min(3, s + 0.1))}
                    title="Zoom In"
                >
                    <ZoomIn size={20} />
                </button>
            </div>

            {/* Main Scrollable Area */}
            <div
                className="flex-1 overflow-auto flex items-center justify-center p-8 custom-scrollbar"
                onClick={(e) => {
                    // Click handler removed/merged into pointer down logic to avoid conflicts
                    // if (e.target === e.currentTarget) selectElement(null);
                }}
            >
                <div
                    className="relative bg-white shadow-2xl transition-transform duration-75 ease-linear select-none"
                    style={{
                        width: badgeDimensions.width,
                        height: badgeDimensions.height,
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center'
                    }}
                    onPointerDown={handleCanvasPointerDown}
                    onPointerMove={handleCanvasPointerMove}
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

                    {/* Selection Box Overlay */}
                    {selectionBox?.isSelecting && (
                        <div
                            className="absolute bg-blue-500/20 border border-blue-500 z-50 pointer-events-none"
                            style={{
                                left: Math.min(selectionBox.startX, selectionBox.currentX),
                                top: Math.min(selectionBox.startY, selectionBox.currentY),
                                width: Math.abs(selectionBox.currentX - selectionBox.startX),
                                height: Math.abs(selectionBox.currentY - selectionBox.startY),
                            }}
                        />
                    )}

                    {/* Canvas Resize Handles */}
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
