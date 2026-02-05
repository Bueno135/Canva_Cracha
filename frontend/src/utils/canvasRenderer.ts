import * as fabric from 'fabric';
import type { BadgeElement } from '../types';
import { createCenteredTextObject } from './canvasUtils';

export const renderCanvasFromState = (canvas: fabric.Canvas, elements: BadgeElement[]) => {
    // Prevent auto rendering during batch update
    canvas.renderOnAddRemove = false;

    // Clear existing objects (naive approach for MVP)
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    elements.forEach(el => {
        let fabricObj: fabric.Object | null = null;

        if (el.type === 'text') {
            // Re-use our centralized factory, but override with stored element properties
            const textObj = createCenteredTextObject(el.content || "", 0, 0); // Pos will be set below

            // Apply state properties
            textObj.set({
                left: el.x,
                top: el.y,
                width: el.width, // Note: Text width/height behavior is distinctive in fabric
                scaleX: 1, // Reset scale if width is handled via fontSize/properties
                scaleY: 1,
                fontSize: el.fontSize,
                fill: el.color,
                angle: el.rotation,
                // Ensure IDs match for future reconciliation (if we go that route)
                // @ts-ignore - Fabric objects can hold custom data
                id: el.id
            });
            fabricObj = textObj;
        }

        if (el.type === 'shape') {
            const commonOpts = {
                left: el.x,
                top: el.y,
                fill: el.color || el.fillColor || '#ccc',
                stroke: el.borderColor || 'transparent',
                strokeWidth: el.borderWidth || 0,
                width: el.width,
                height: el.height,
                angle: el.rotation,
                // @ts-ignore
                id: el.id
            };

            if (el.shapeType === 'circle') {
                // Fabric circle radius is width/2
                fabricObj = new fabric.Circle({
                    ...commonOpts,
                    radius: el.width / 2,
                    // Restore width/height aspect to avoid oval unless scaled
                    scaleX: 1,
                    scaleY: el.height / el.width
                });
            } else if (el.shapeType === 'triangle') {
                fabricObj = new fabric.Triangle(commonOpts);
            } else if (el.shapeType === 'line') {
                fabricObj = new fabric.Rect(commonOpts); // Simple line as rect
            } else {
                fabricObj = new fabric.Rect(commonOpts);
            }
        }

        if (el.type === 'image' || el.type === 'photo' || el.type === 'qr') {
            // Placeholder while loading
            const placeholder = new fabric.Rect({
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                fill: '#f3f4f6',
                stroke: '#d1d5db',
                strokeDashArray: [4, 4],
                // @ts-ignore
                id: el.id
            });
            canvas.add(placeholder);

            // Attempt to load if it's a URL
            const isUrl = el.content && (el.content.startsWith('http') || el.content.startsWith('data:'));

            if (isUrl) {
                // Fabric 6+ Promise API or compat
                // @ts-ignore - Check if fabric version supports promise or usage of callback
                fabric.Image.fromURL(el.content, { crossOrigin: 'anonymous' })
                    .then((img: fabric.Image) => {
                        if (!canvas.contains(placeholder)) return; // Canvas cleared already?

                        canvas.remove(placeholder);

                        img.set({
                            left: el.x,
                            top: el.y,
                            scaleX: el.width / (img.width || 1),
                            scaleY: el.height / (img.height || 1),
                            angle: el.rotation,
                            // @ts-ignore
                            id: el.id
                        });

                        canvas.add(img);
                        canvas.requestRenderAll();
                    })
                    .catch((err: any) => {
                        console.error('Failed to load image:', err);
                        // Convert placeholder to error state
                        placeholder.set({ stroke: 'red' });
                        canvas.requestRenderAll();
                    });
            } else {
                // Static Placeholder for empty/template items
                const label = new fabric.Text(el.type === 'qr' ? 'QR Code' : 'Foto', {
                    left: el.x + el.width / 2,
                    top: el.y + el.height / 2,
                    originX: 'center',
                    originY: 'center',
                    fontSize: 12,
                    fill: '#9ca3af',
                    selectable: false
                });
                canvas.add(label);
            }
        }

        if (fabricObj) {
            canvas.add(fabricObj);
        }
    });

    canvas.renderOnAddRemove = true;
    canvas.renderAll();
};
