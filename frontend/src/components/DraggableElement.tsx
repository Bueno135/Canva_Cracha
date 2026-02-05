import React, { useRef, useState, useEffect } from 'react';
import type { BadgeElement } from '../types';
import { useBadgeStore } from '../store/badgeStore.ts';
import { ShapeRenderer } from './ShapeRenderer';
import { clsx } from 'clsx';
import { RefreshCcw } from 'lucide-react';

interface DraggableElementProps {
    element: BadgeElement;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({ element }) => {
    const {
        selectedIds, selectElement, updateElement, scale, activeSide
    } = useBadgeStore();

    const isSelected = selectedIds.includes(element.id);
    const elementRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);

    // --- DRAG LOGIC ---
    const handlePointerDown = (e: React.PointerEvent) => {
        if (isEditing) return;

        e.preventDefault();
        e.stopPropagation();

        selectElement(element.id, e.shiftKey);

        // Check if clicking a handle
        if ((e.target as HTMLElement).classList.contains('handle')) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const elStartX = element.x;
        const elStartY = element.y;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const dx = (moveEvent.clientX - startX) / scale;
            const dy = (moveEvent.clientY - startY) / scale;

            updateElement(element.id, {
                x: elStartX + dx,
                y: elStartY + dy
            });
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    // --- RESIZE LOGIC ---
    const handleResizeStart = (e: React.PointerEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = element.width;
        const startHeight = element.height;
        const startLeft = element.x;
        const startTop = element.y;
        const startFontSize = element.fontSize || 14;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const dx = (moveEvent.clientX - startX) / scale;
            const dy = (moveEvent.clientY - startY) / scale;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newX = startLeft;
            let newY = startTop;

            // Horizontal
            if (handle.includes('e')) newWidth = Math.max(5, startWidth + dx);
            if (handle.includes('w')) {
                newWidth = Math.max(5, startWidth - dx);
                newX = startLeft + dx;
            }

            // Vertical
            if (handle.includes('s')) newHeight = Math.max(5, startHeight + dy);
            if (handle.includes('n')) {
                newHeight = Math.max(5, startHeight - dy);
                newY = startTop + dy;
            }

            const updates: Partial<BadgeElement> = {
                width: newWidth, height: newHeight, x: newX, y: newY
            };

            // Aspect Ratio Font Scaling for corners (Simplified)
            if (element.type === 'text' && ['nw', 'ne', 'sw', 'se'].includes(handle)) {
                const scaleFactor = newHeight / startHeight;
                updates.fontSize = Math.max(4, Math.round(startFontSize * scaleFactor));
            }

            updateElement(element.id, updates);
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    // --- ROTATE LOGIC ---
    const handleRotateStart = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const rect = elementRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const dx = moveEvent.clientX - centerX;
            const dy = moveEvent.clientY - centerY;
            const radian = Math.atan2(dy, dx);
            const deg = radian * (180 / Math.PI) + 90; // +90 because handle is at top
            updateElement(element.id, { rotation: deg });
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }

    // --- RENDER CONTENT ---
    const renderContent = () => {
        if (element.type === 'shape') {
            return (
                <ShapeRenderer
                    shapeType={element.shapeType}
                    fillColor={element.fillColor} // Use prop, not style object to match interface
                    borderColor={element.borderColor}
                    borderWidth={element.borderWidth}
                    width={element.width}
                    height={element.height}
                />
            );
        }

        if (element.type === 'image' || element.type === 'qr' || element.type === 'photo') {
            const isPlaceholder = element.content === '{{foto}}' || !element.content;

            if (isPlaceholder) {
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 border border-dashed border-gray-400 text-gray-400 select-none">
                        <span>📷</span>
                        <span className="text-xs">{element.type === 'qr' ? 'QR Code' : 'Foto'}</span>
                    </div>
                )
            }
            return <img src={element.content} alt="" className="w-full h-full object-cover pointer-events-none" />;
        }

        if (element.type === 'text') {
            if (isEditing) {
                return (
                    <textarea
                        className="w-full h-full bg-transparent resize-none outline-none overflow-hidden p-0 m-0 leading-tight"
                        style={{
                            fontSize: element.fontSize,
                            color: element.color,
                            fontFamily: element.fontFamily,
                            fontWeight: element.fontWeight,
                            fontStyle: element.fontStyle,
                            textDecoration: element.textDecoration,
                            textAlign: element.textAlign,
                            writingMode: element.writingMode,
                        }}
                        value={element.content}
                        onChange={(e) => updateElement(element.id, { content: e.target.value })}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) e.currentTarget.blur(); }}
                        autoFocus
                    />
                );
            }
            const isTag = element.content?.startsWith('{{') && element.content?.endsWith('}}');

            return (
                <div
                    className={clsx(
                        "w-full h-full whitespace-pre-wrap leading-tight",
                        isTag && "flex items-center justify-center bg-blue-100/50 border border-blue-400/30 rounded px-1"
                    )}
                    style={{
                        fontSize: element.fontSize,
                        color: isTag ? '#2563eb' : element.color,
                        fontFamily: element.fontFamily,
                        fontWeight: isTag ? '600' : element.fontWeight,
                        fontStyle: element.fontStyle,
                        textDecoration: element.textDecoration,
                        textAlign: element.textAlign,
                        writingMode: element.writingMode,
                        userSelect: 'none'
                    }}
                >
                    {element.content}
                </div>
            );
        }
        return null;
    };

    if (element.side !== activeSide) return null;

    return (
        <div
            ref={elementRef}
            className={clsx(
                "absolute touch-none select-none",
                isSelected && !isEditing ? "ring-2 ring-blue-500 z-50" : "z-10"
            )}
            style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                transform: `rotate(${element.rotation}deg)`,
                zIndex: element.zIndex,
                cursor: isEditing ? 'text' : 'move'
            }}
            onPointerDown={handlePointerDown}
            onDoubleClick={() => setIsEditing(true)}
        >
            {renderContent()}

            {isSelected && !isEditing && (
                <>
                    {/* Resize Handles */}
                    {['nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w'].map(h => (
                        <div
                            key={h}
                            className={clsx(
                                "handle absolute w-3 h-3 bg-white border border-blue-500 rounded-full z-50",
                                // Positioning logic
                                h.includes('n') ? '-top-1.5' : '',
                                h.includes('s') ? '-bottom-1.5' : '',
                                h.includes('w') ? '-left-1.5' : '',
                                h.includes('e') ? '-right-1.5' : '',
                                (h === 'n' || h === 's') ? 'left-1/2 -ml-1.5 cursor-ns-resize' : '',
                                (h === 'w' || h === 'e') ? 'top-1/2 -mt-1.5 cursor-ew-resize' : '',
                                h === 'nw' && 'top-0 left-0 -mt-1.5 -ml-1.5 cursor-nwse-resize',
                                h === 'ne' && 'top-0 right-0 -mt-1.5 -mr-1.5 cursor-nesw-resize',
                                h === 'sw' && 'bottom-0 left-0 -mb-1.5 -ml-1.5 cursor-nesw-resize',
                                h === 'se' && 'bottom-0 right-0 -mb-1.5 -mr-1.5 cursor-nwse-resize',
                            )}
                            onPointerDown={(e) => handleResizeStart(e, h)}
                        />
                    ))}

                    {/* Rotation Handle */}
                    <div
                        className="rotate-handle absolute -top-8 left-1/2 -ml-3 w-6 h-6 bg-white border border-blue-500 rounded-full flex items-center justify-center cursor-move z-50 shadow-sm"
                        onPointerDown={handleRotateStart}
                    >
                        <RefreshCcw size={12} className="text-blue-600" />
                    </div>
                </>
            )}
        </div>
    );
};
