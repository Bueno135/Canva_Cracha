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

    // Flag to skip re-render when update comes from Fabric itself (drag/drop/edit)
    const skipNextRender = useRef(false);

    // 1. Sincronização: Store -> Canvas (Leitura)
    useEffect(() => {
        if (!fabricCanvas) return;

        // Se a atualização veio do próprio canvas (ex: usuário arrastou), não redesenhamos tudo
        if (skipNextRender.current) {
            skipNextRender.current = false;
            return;
        }

        // Flag para ignorar eventos enquanto desenhamos via código
        isRendering.current = true;

        // Desliga listeners temporariamente para segurança
        fabricCanvas.off('object:modified');
        fabricCanvas.off('text:changed');
        fabricCanvas.off('selection:created');
        fabricCanvas.off('selection:updated');
        fabricCanvas.off('selection:cleared');

        console.log('Syncing Canvas with Store:', elements);
        renderCanvasFromState(fabricCanvas, elements);

        // Religa listeners
        attachCanvasListeners(fabricCanvas);

        isRendering.current = false;

    }, [elements, fabricCanvas]);

    // 2. Sincronização: Canvas -> Store (Escrita)
    const attachCanvasListeners = (canvas: fabric.Canvas) => {

        // Helper para atualizar sem disparar re-render do canvas
        const updateStoreFromCanvas = (id: string, updates: any) => {
            skipNextRender.current = true; // AVISA O EFFECT: "Eu que mudei, não redesenhe!"
            updateElement(id, updates);
        };

        // Listener de Modificação (Drag, Resize, Rotate)
        canvas.on('object:modified', (e) => {
            if (isRendering.current) return; // Ignora se for renderização do Store

            const target = e.target;
            if (!target) return;

            // O ID foi injetado no objeto pelo renderCanvasFromState
            // @ts-ignore 
            const id = target.id;

            if (id) {

                const updates: any = {
                    x: target.left,
                    y: target.top,
                    rotation: target.angle,
                };

                const isImage = target.type === 'image' || target.type === 'photo' || target.type === 'qr';

                if (isImage) {
                    // IMAGES: Must use Scale. Changing width crops the image.
                    updates.scaleX = target.scaleX;
                    updates.scaleY = target.scaleY;
                    updates.width = target.width;   // Keep original dimensions
                    updates.height = target.height;
                } else {
                    // SHAPES/TEXT: Normalize to Width/Height for clean CSS-like logic
                    updates.width = (target.width || 0) * (target.scaleX || 1);
                    updates.height = (target.height || 0) * (target.scaleY || 1);
                    updates.scaleX = 1;
                    updates.scaleY = 1;
                }

                if (target.type === 'text' || target.type === 'i-text' || target.type === 'textbox') {
                    // @ts-ignore
                    const currentFontSize = target.fontSize || 20;
                    // @ts-ignore
                    updates.fontSize = currentFontSize * (target.scaleY || 1);
                    // Text specific: If you normalized scale to 1, you must update fontSize.
                    // Width is already calculated above.
                }

                updateStoreFromCanvas(id, updates);

                // Only reset scale for non-images to avoid "pop"
                if (!isImage) {
                    target.set({ scaleX: 1, scaleY: 1 });
                }
            }
        });

        // Listener de Texto (Edição de Conteúdo)
        const handleTextChange = (e: any) => {
            const target = e.target;
            // @ts-ignore
            if (target && target.id) {
                // @ts-ignore
                updateStoreFromCanvas(target.id, { content: target.text });
            }
        };
        canvas.on('text:changed', handleTextChange);

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
        <div className="flex flex-col gap-4 items-center justify-center bg-gray-100 h-full w-full">
            <div
                className="shadow-2xl bg-white"
                style={{ width, height, position: 'relative' }}
            >
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};
