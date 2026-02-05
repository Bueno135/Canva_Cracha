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
        selectedIds, selectElement, updateElement, updateElements, scale, activeSide
    } = useBadgeStore();

    const isSelected = selectedIds.includes(element.id);
    const elementRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);

    // --- DRAG LOGIC ---
    const handlePointerDown = (e: React.PointerEvent) => {
        if (isEditing) return;

        e.preventDefault();
        e.stopPropagation();

        // 1. Get fresh state
        const state = useBadgeStore.getState();
        const { selectedIds, elements, updateElement, updateElements, selectElement } = state;

        const isMultiSelect = e.shiftKey;
        const isAlreadySelected = selectedIds.includes(element.id);

        // 2. Handle selection logic for drag start
        if (!isAlreadySelected) {
            // If not selected, select it (and clear others if not multi)
            selectElement(element.id, isMultiSelect);
        }
        // If it IS already selected and not multi, we do NOT clear others yet
        // to allow dragging the whole group. We might clear on mouseUp if no drag happened.

        // Re-read selected IDs after potential update
        const currentSelectedIds = useBadgeStore.getState().selectedIds;

        // Check if clicking a handle
        if ((e.target as HTMLElement).classList.contains('handle')) return;

        const startX = e.clientX;
        const startY = e.clientY;

        // 3. Capture start positions for ALL selected elements
        // We find the elements from the store to get their current x/y
        const draggedElements = elements.filter(el => currentSelectedIds.includes(el.id));
        const startPositions = new Map(draggedElements.map(el => [el.id, { x: el.x, y: el.y }]));

        let hasMoved = false;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const dx = (moveEvent.clientX - startX) / scale;
            const dy = (moveEvent.clientY - startY) / scale;

            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) hasMoved = true;

            // 4. Batch update all selected elements
            const updates = Array.from(startPositions.entries()).map(([id, pos]) => ({
                id,
                changes: {
                    x: pos.x + dx,
                    y: pos.y + dy
                }
            }));

            updateElements(updates);
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);

            // 5. Handle "Click on selected item" behavior (deselect others if no drag)
            if (!hasMoved && !isMultiSelect && isAlreadySelected) {
                // If we clicked an existing selection but didn't drag, and didn't hold shift,
                // now is the time to select JUST this item.
                selectElement(element.id, false);
            }
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

        const state = useBadgeStore.getState();
        const { selectedIds, elements, updateElement, updateElements } = state;

        // Identify operating set
        const rotatingElements = selectedIds.includes(element.id)
            ? elements.filter(el => selectedIds.includes(el.id))
            : [element];

        if (rotatingElements.length === 0) return;

        // 1. Calculate Group Center (Pivot Point)
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        rotatingElements.forEach(el => {
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + el.width);
            maxY = Math.max(maxY, el.y + el.height);
        });
        const groupCx = (minX + maxX) / 2;
        const groupCy = (minY + maxY) / 2;

        // 2. Capture Start State for all items
        // We track the angle of the *mouse* relative to group center to determine delta
        const startMouseX = e.clientX;
        const startMouseY = e.clientY;

        // We'll calculate angle relative to group center provided we know where the canvas is.
        // Actually, since we only need DELTA, we can use screen coordinates if we map groupCx/Cy to screen?
        // Easier: Convert mouse event to canvas space coordinates roughly or just use vector math on changes.
        // Best: Map groupCx/Cy to Client Coordinates? Or map Mouse to Canvas Coordinates.
        // Since we have `scale`, let's map Mouse -> Canvas.

        // We need the Rect of the canvas container to normalize mouse, but we only have `scale`.
        // Let's assume (e.clientX, e.clientY) is correct enough if we just calculate gradients, 
        // BUT `groupCx` is in Canvas Space (e.g. 0-500). `e.clientX` is Screen Space (e.g. 1200).
        // We need the canvas offset. 
        // A simpler hack: Use the element's REF center to offset.
        // `elementRef` gives us the DOM rect of THIS element.
        // We know `element.x/y` (Canvas) <-> `rect.left/top` (Screen).
        // offset X = rect.left - element.x * scale
        // This holds true if no scrolling/panning offset issues.
        // Let's rely on the elementRef of the *initiated* element.

        const rect = elementRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Calculate Canvas Origin in Screen Space
        // rect.left is the screen X of the element's left edge
        // element.x is the canvas X distance.
        // So ScreenX = CanvasOriginX + CanvasX * Scale
        // CanvasOriginX = rect.left - element.x * scale
        const canvasOriginX = rect.left - (element.x * scale);
        const canvasOriginY = rect.top - (element.y * scale);

        const groupCxScreen = canvasOriginX + (groupCx * scale);
        const groupCyScreen = canvasOriginY + (groupCy * scale);

        const startAngleRad = Math.atan2(e.clientY - groupCyScreen, e.clientX - groupCxScreen);

        const initialStates = rotatingElements.map(el => {
            const elCx = el.x + el.width / 2;
            const elCy = el.y + el.height / 2;
            return {
                id: el.id,
                startRotation: el.rotation,
                // Vector from Group Center to Element Center
                vx: elCx - groupCx,
                vy: elCy - groupCy,
                width: el.width,
                height: el.height
            };
        });

        const onPointerMove = (moveEvent: PointerEvent) => {
            const currentAngleRad = Math.atan2(moveEvent.clientY - groupCyScreen, moveEvent.clientX - groupCxScreen);
            const deltaRad = currentAngleRad - startAngleRad;
            const deltaDeg = deltaRad * (180 / Math.PI);

            const updates = initialStates.map(state => {
                // Rotate vector (vx, vy) by deltaRad
                // x' = x cos θ - y sin θ
                // y' = x sin θ + y cos θ
                const newVx = state.vx * Math.cos(deltaRad) - state.vy * Math.sin(deltaRad);
                const newVy = state.vx * Math.sin(deltaRad) + state.vy * Math.cos(deltaRad);

                const newCx = groupCx + newVx;
                const newCy = groupCy + newVy;

                return {
                    id: state.id,
                    changes: {
                        rotation: state.startRotation + deltaDeg,
                        x: newCx - state.width / 2,
                        y: newCy - state.height / 2
                    }
                };
            });

            updateElements(updates);
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
