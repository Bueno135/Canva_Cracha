import * as fabric from 'fabric';

/**
 * Creates an IText object configured to be centered at the given coordinates.
 * Encapsulates the configuration logic to keep UI components clean.
 */
export const createCenteredTextObject = (text: string, canvasWidth: number, canvasHeight: number): fabric.IText => {
    return new fabric.IText(text, {
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        fontFamily: 'Arial',
        fontSize: 24,
        fill: '#333333',
        selectable: true,
        editable: true,
        textAlign: 'center'
    });
};
