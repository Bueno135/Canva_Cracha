import React, { useCallback } from 'react';
import { createCenteredTextObject } from '../utils/canvasUtils';
import { useFabric } from '../hooks/useFabric';

interface FabricCanvasProps {
    width: number;
    height: number;
}

// --- Main Component ---
export const FabricCanvas: React.FC<FabricCanvasProps> = ({ width, height }) => {
    const { canvasRef, fabricCanvas } = useFabric(width, height);

    const addCenteredText = useCallback((text: string) => {
        if (!fabricCanvas) return;

        const textObj = createCenteredTextObject(text, width, height);

        fabricCanvas.add(textObj);
        fabricCanvas.setActiveObject(textObj);
        fabricCanvas.renderAll();
    }, [fabricCanvas, width, height]);

    return (
        <div className="flex flex-col gap-4 items-center p-4">
            {/* Toolbar Area */}
            <div className="flex gap-2 p-2 bg-white rounded shadow-sm border border-gray-200">
                <button
                    onClick={() => addCenteredText("Hello World")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                    Adicionar Texto Centralizado
                </button>
            </div>

            {/* Canvas Container */}
            <div className="border border-gray-300 shadow-md">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};
