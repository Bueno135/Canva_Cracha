import React, { useState } from 'react';
import { useBadgeStore } from '../store/badgeStore.ts';
import { FabricCanvas } from './FabricCanvas.tsx';
import { clsx } from 'clsx';
import { ZoomIn, ZoomOut } from 'lucide-react';

export const CanvasArea: React.FC = () => {
    const {
        badgeDimensions, scale,
        setDimensions, setScale
    } = useBadgeStore();

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

    return (
        <div className="flex-1 bg-gray-100 overflow-hidden relative flex flex-col h-full">
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
                // Pointer events now handled by FabricCanvas internally
                >
                    <FabricCanvas width={badgeDimensions.width} height={badgeDimensions.height} />

                    {/* Canvas Resize Handles (External to Fabric) */}
                    <div
                        className="absolute -right-1 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-200 opacity-50 transition-opacity z-10"
                        onPointerDown={(e) => startCanvasResize(e, 'e')}
                    />
                    <div
                        className="absolute -bottom-1 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-200 opacity-50 transition-opacity z-10"
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
