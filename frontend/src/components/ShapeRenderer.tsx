import React from 'react';
import { ShapeType } from '../types';

interface ShapeRendererProps {
    shapeType?: ShapeType;
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;
    width: number;
    height: number;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
    shapeType = 'rectangle',
    fillColor = '#4f46e5',
    borderColor = 'transparent',
    borderWidth = 0,
    width,
    height
}) => {
    const commonStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: fillColor,
        border: `${borderWidth}px solid ${borderColor}`,
        boxSizing: 'border-box'
    };

    if (shapeType === 'circle') {
        return <div style={{ ...commonStyle, borderRadius: '50%' }} />;
    }

    if (shapeType === 'triangle') {
        // Triangle via clip-path is easiest for scaling
        // But standard border trick doesn't support border-color well + fill well simultaneously easily
        // SVG is robust.
        return (
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <polygon
                    points="50,0 100,100 0,100"
                    fill={fillColor}
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                />
            </svg>
        );
    }

    // Default Rectangle
    return <div style={commonStyle} />;
};
