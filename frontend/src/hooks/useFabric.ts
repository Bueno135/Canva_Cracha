import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

export const useFabric = (width: number, height: number) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width,
            height,
            backgroundColor: '#ffffff',
            enableRetinaScaling: true, // Fix for High DPI displays
            preserveObjectStacking: true, // Garante que a ordem visual bata com o array
        });

        setFabricCanvas(canvas);

        return () => {
            canvas.dispose();
        };
    }, [width, height]);

    return { canvasRef, fabricCanvas };
};
