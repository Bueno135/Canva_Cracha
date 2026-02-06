import * as fabric from 'fabric';
import type { BadgeElement } from '../types';
import { createTextObject } from './canvasUtils';

export const renderCanvasFromState = (canvas: fabric.Canvas, elements: BadgeElement[]) => {
    // Prevent auto rendering during batch update
    canvas.renderOnAddRemove = false;

    // Clear existing objects (naive approach for MVP)
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    // Configure global selection styles for better visibility
    fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: '#3b82f6',
        borderColor: '#3b82f6',
        cornerSize: 10,
        cornerStyle: 'circle',
        padding: 5,
        // Disable caching to fix blurriness on retina screens/text resizing
        objectCaching: false
    });

    elements.forEach(el => {
        let fabricObj: fabric.Object | null = null;

        const baseOptions = {
            objectCaching: false, // Critical for sharp text/shapes
            cornerStrokeColor: '#3b82f6',
            originX: 'left' as const,
            originY: 'top' as const
        };

        if (el.type === 'text') {
            // Re-use our centralized factory
            const textObj = createTextObject(el.content || "", 0, 0);

            // Apply state properties
            textObj.set({
                ...baseOptions,
                left: el.x,
                top: el.y,
                width: el.width,
                scaleX: 1,
                scaleY: 1,
                fontSize: el.fontSize,
                fill: el.color,
                angle: el.rotation,
                // @ts-ignore
                id: el.id
            });
            // Ensure ID is set (Fabric v7/Strictness might strip it from options)
            (textObj as any).id = el.id;
            fabricObj = textObj;
        }

        if (el.type === 'shape') {
            const commonOpts = {
                ...baseOptions,
                left: el.x,
                top: el.y,
                fill: el.color || el.fillColor || '#ccc',
                stroke: el.borderColor || null, // null is better than transparent for performance
                strokeWidth: el.borderWidth || 0,
                width: el.width,
                height: el.height,
                angle: el.rotation,
                // @ts-ignore
                id: el.id
            };

            if (el.shapeType === 'circle') {
                fabricObj = new fabric.Circle({
                    ...commonOpts,
                    radius: el.width / 2, // Fabric circle radius is width/2
                    scaleX: 1,
                    scaleY: el.height / el.width
                });
            } else if (el.shapeType === 'triangle') {
                fabricObj = new fabric.Triangle(commonOpts);
            } else if (el.shapeType === 'line') {
                fabricObj = new fabric.Rect(commonOpts);
            } else {
                fabricObj = new fabric.Rect(commonOpts);
            }
            // Ensure ID (Fix for Fabric 7)
            if (fabricObj) (fabricObj as any).id = el.id;
        }

        if (el.type === 'image' || el.type === 'photo' || el.type === 'qr') {
            // Placeholder while loading
            const placeholder = new fabric.Rect({
                ...baseOptions,
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
            (placeholder as any).id = el.id;
            canvas.add(placeholder);

            // Attempt to load if it's a URL
            const isUrl = el.content && (el.content.startsWith('http') || el.content.startsWith('data:'));

            if (isUrl) {
                // @ts-ignore
                fabric.Image.fromURL(el.content, { crossOrigin: 'anonymous' })
                    .then((img: fabric.Image) => {
                        if (!canvas.contains(placeholder)) return;

                        canvas.remove(placeholder);

                        img.set({
                            ...baseOptions,
                            left: el.x,
                            top: el.y,
                            scaleX: el.width / (img.width || 1),
                            scaleY: el.height / (img.height || 1),
                            angle: el.rotation,
                            // @ts-ignore
                            id: el.id
                        });
                        (img as any).id = el.id;

                        canvas.add(img);
                        canvas.requestRenderAll();
                    })
                    .catch((err: any) => {
                        console.error('Failed to load image:', err);
                        placeholder.set({ stroke: 'red' });
                        canvas.requestRenderAll();
                    });
            } else {
                // Static Placeholder
                const label = new fabric.Text(el.type === 'qr' ? 'QR Code' : 'Foto', {
                    ...baseOptions,
                    // Center label manually relative to the placeholder rect
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
