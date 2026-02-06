import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { useFabric } from '../hooks/useFabric';
import { useBadgeStore } from '../store/badgeStore';
import { renderCanvasFromState } from '../utils/canvasRenderer';

interface FabricCanvasProps {
    width: number;
    height: number;
}

export const FabricCanvas: React.FC<FabricCanvasProps> = ({ width, height }) => {
    const { canvasRef, fabricCanvas } = useFabric(width, height);

    // Seletores para performance e evitar loops
    const elements = useBadgeStore((state) => state.elements);
    const updateElement = useBadgeStore((state) => state.updateElement);
    const selectElement = useBadgeStore((state) => state.selectElement);

    // Referência para controlar se estamos desenhando (evita loops infinitos)
    const isRendering = useRef(false);

    // 1. Sincronização: Store -> Canvas (Leitura)
    useEffect(() => {
        if (!fabricCanvas) return;

        // Flag para ignorar eventos enquanto desenhamos via código
        isRendering.current = true;

        // Desliga listeners temporariamente para segurança
        fabricCanvas.off('object:modified');

        console.log('Syncing Canvas with Store:', elements);
        renderCanvasFromState(fabricCanvas, elements);

        // Religa listeners
        attachCanvasListeners(fabricCanvas);

        isRendering.current = false;

    }, [elements, fabricCanvas]);

    // 2. Sincronização: Canvas -> Store (Escrita)
    const attachCanvasListeners = (canvas: fabric.Canvas) => {

        // Listener de Modificação (Drag, Resize, Rotate)
        canvas.on('object:modified', (e) => {
            if (isRendering.current) return; // Ignora se for renderização do Store

            const target = e.target;
            if (!target) return;

            // O ID foi injetado no objeto pelo renderCanvasFromState
            // @ts-ignore 
            const id = target.id;

            if (id) {
                console.log('Object modified, updating store:', id);

                const updates: any = {
                    x: target.left,
                    y: target.top,
                    rotation: target.angle,
                    width: (target.width || 0) * (target.scaleX || 1),
                    height: (target.height || 0) * (target.scaleY || 1),
                };

                if (target.type === 'text' || target.type === 'i-text' || target.type === 'textbox') {
                    // @ts-ignore
                    const currentFontSize = target.fontSize || 20;
                    // @ts-ignore
                    updates.fontSize = currentFontSize * (target.scaleY || 1);
                }

                updateElement(id, updates);
            }
        });

        // Listener de Seleção (Para mostrar propriedades corretas no painel)
        const handleSelection = (e: any) => {
            const selected = e.selected?.[0];
            // @ts-ignore
            selectElement(selected ? selected.id : null);
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', () => selectElement(null));
    };

    return (
        <div className="flex flex-col gap-4 items-center p-4">
            <div className="border border-gray-300 shadow-md">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};
