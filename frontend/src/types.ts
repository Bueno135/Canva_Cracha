export type ElementType = 'text' | 'image' | 'photo' | 'shape' | 'qr';
export type ShapeType = 'rectangle' | 'circle' | 'triangle';

export interface BadgeElement {
    id: string;
    type: ElementType;

    // Position & Size
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;

    // Content (Text, Image URL, QR Value)
    content?: string;

    // Text Specific
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    writingMode?: 'horizontal-tb' | 'vertical-rl';

    // Shape/Photo Specific
    shapeType?: ShapeType;
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;

    // Side
    side: 'front' | 'back';
}

export type BadgeSide = 'front' | 'back';

export interface BadgeState {
    elements: BadgeElement[];
    selectedIds: string[];
    activeSide: BadgeSide;
    badgeDimensions: { width: number; height: number };
}
