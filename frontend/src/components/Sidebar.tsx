import React from 'react';
import { useBadgeStore } from '../store/badgeStore';
import { Type, Image as ImageIcon, Square, Circle, Triangle, QrCode } from 'lucide-react';

export const Sidebar: React.FC = () => {
    const { addElement } = useBadgeStore();

    return (
        <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4 z-40 shadow-sm">
            {/* Tools */}

            <button
                className="flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-700 w-full"
                onClick={() => addElement('text')}
            >
                <Type size={24} />
                <span className="text-xs font-medium">Texto</span>
            </button>

            <button
                className="flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-700 w-full"
                onClick={() => addElement('photo')}
            >
                <div className="relative">
                    <ImageIcon size={24} />
                    <span className="absolute -bottom-1 -right-1 text-[10px] bg-blue-100 px-1 rounded">Ref</span>
                </div>
                <span className="text-xs font-medium">Foto</span>
            </button>

            <button
                className="flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-700 w-full"
                onClick={() => addElement('image')}
            >
                <ImageIcon size={24} />
                <span className="text-xs font-medium">Imagem</span>
            </button>

            <button
                className="flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-700 w-full"
                onClick={() => addElement('qr')}
            >
                <QrCode size={24} />
                <span className="text-xs font-medium">QR Code</span>
            </button>

            <div className="w-12 h-px bg-gray-200 my-2" />

            {/* Shapes */}
            <div className="flex flex-col items-center gap-3 w-full">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Formas</span>

                <button
                    onClick={() => addElement('shape', { shapeType: 'rectangle' })}
                    className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Retângulo"
                >
                    <Square size={20} />
                </button>

                <button
                    onClick={() => addElement('shape', { shapeType: 'circle' })}
                    className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Círculo"
                >
                    <Circle size={20} />
                </button>

                <button
                    onClick={() => addElement('shape', { shapeType: 'triangle' })}
                    className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Triângulo"
                >
                    <Triangle size={20} />
                </button>
            </div>
        </div>
    );
};
