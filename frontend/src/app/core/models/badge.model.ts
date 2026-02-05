export type ElementType = 'text' | 'image' | 'qr' | 'barcode' | 'shape';
export type PhotoShape = 'circle' | 'square';
export type ShapeType = 'rectangle' | 'circle' | 'triangle';

export interface BadgeTemplate {
    id?: number;
    cnpj: string;
    slotNumber: number;
    templateName: string;
    frenteImagem: string;
    versoImagem: string;
    layoutJson: string;
}

export interface BadgeElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    content: string; // text value or image url
    style: Record<string, string | number>; // custom styles like color, fontSize
    side: 'front' | 'back';
    zIndex: number;
    rotation?: number;

    // Photo specific
    photoShape?: PhotoShape; // circle or square

    // Shape specific
    shapeType?: ShapeType;
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;
}

export type BadgeSide = 'front' | 'back';

export const DEFAULT_BADGE_WIDTH = 153; // User defined vertical
export const DEFAULT_BADGE_HEIGHT = 244; // User defined vertical


export interface BadgeProperties {
    width: number;
    height: number;
    backgroundColor: string;
}

