import React, { useEffect } from 'react';
import { useFabric } from '../hooks/useFabric';
import { useBadgeStore } from '../store/badgeStore';
import { renderCanvasFromState } from '../utils/canvasRenderer';

interface FabricCanvasProps {
    width: number;
    height: number;
}

// --- Main Component ---
export const FabricCanvas: React.FC<FabricCanvasProps> = ({ width, height }) => {
    // 1. Initialize Canvas (Hook handles lifecycle)
    const { canvasRef, fabricCanvas } = useFabric(width, height);

    // 2. Read "Source of Truth"
    const elements = useBadgeStore((state) => state.elements);

    // 3. Synchronization: Store -> Canvas
    useEffect(() => {
        if (!fabricCanvas) return;

        console.log('Syncing Canvas with Store:', elements);
        renderCanvasFromState(fabricCanvas, elements);

    }, [elements, fabricCanvas]);

    return (
        <div className="flex flex-col gap-4 items-center p-4">
            {/* Canvas Container */}
            <div className="border border-gray-300 shadow-md">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};
