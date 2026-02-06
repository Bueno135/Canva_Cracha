import * as fabric from 'fabric';

/**
 * Creates an IText object configured to be centered at the given coordinates.
 * Encapsulates the configuration logic to keep UI components clean.
 */
/**
 * Creates an IText object configured to be positioned at top-left.
 * Matches legacy Angular behavior.
 */
export const createTextObject = (text: string, x: number = 0, y: number = 0): fabric.IText => {
    const textObj = new fabric.IText(text, {
        left: x,
        top: y,
        originX: 'left',
        originY: 'top',
        fontFamily: 'Arial',
        fontSize: 24,
        fill: '#000000', // Matches store default
        selectable: true,
        editable: true,
        textAlign: 'center', // Text alignment within box
        lineHeight: 1,
        padding: 0,
        lockScalingFlip: true,
        objectCaching: false // Default off for sharpness
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
