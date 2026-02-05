import * as fabric from 'fabric';

/**
 * Creates an IText object configured to be centered at the given coordinates.
 * Encapsulates the configuration logic to keep UI components clean.
 */
export const createCenteredTextObject = (text: string, canvasWidth: number, canvasHeight: number): fabric.IText => {
    const textObj = new fabric.IText(text, {
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        fontFamily: 'Arial',
        fontSize: 24,
        fill: '#333333',
        selectable: true,
        editable: true,
        textAlign: 'center',
        lineHeight: 1,
        padding: 0,
        lockScalingFlip: true, // Prevents negative scaling (flipping)
    });

    // Enforce proportional scaling by hiding middle controls
    textObj.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false
    });

    return textObj;
};
