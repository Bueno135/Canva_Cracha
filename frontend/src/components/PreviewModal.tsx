import React, { useState } from 'react';
import { useBadgeStore } from '../store/badgeStore';
import { DraggableElement } from './DraggableElement';
import { X } from 'lucide-react';

interface PreviewModalProps {
    onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ onClose }) => {
    const { elements, badgeDimensions } = useBadgeStore();
    const [showTags, setShowTags] = useState(true);

    const isDynamic = (content?: string) => content?.trim().startsWith('{{') && content?.trim().endsWith('}}');

    const getElements = (side: 'front' | 'back') => {
        return elements.filter(el => {
            if (el.side !== side) return false;
            if (!showTags && isDynamic(el.content)) return false;
            return true;
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">Visualizar Impressão</h2>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={showTags}
                                    onChange={e => setShowTags(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Tags Dinâmicas</span>
                        </label>

                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-gray-100 p-8 flex flex-wrap justify-center gap-8">
                    {/* FRONT */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Frente</span>
                        <div
                            className="bg-white shadow-lg relative overflow-hidden pointer-events-none border border-gray-200"
                            style={{ width: badgeDimensions.width, height: badgeDimensions.height }}
                        >
                            {getElements('front').map(el => (
                                <DraggableElement key={el.id} element={el} />
                            ))}
                        </div>
                    </div>

                    {/* BACK */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Verso</span>
                        <div
                            className="bg-white shadow-lg relative overflow-hidden pointer-events-none border border-gray-200"
                            style={{ width: badgeDimensions.width, height: badgeDimensions.height }}
                        >
                            {getElements('back').map(el => (
                                <DraggableElement key={el.id} element={el} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white text-right text-sm text-gray-500">
                    Mostrando {getElements('front').length + getElements('back').length} elementos visíveis.
                </div>
            </div>
        </div>
    );
};
