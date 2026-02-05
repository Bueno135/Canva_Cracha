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

        // TODO: Add Shape, Image, QR handlers here as needed
        // if (el.type === 'shape') { ... }

        if (fabricObj) {
            canvas.add(fabricObj);
        }
    });

    canvas.renderOnAddRemove = true;
    canvas.renderAll();
};
