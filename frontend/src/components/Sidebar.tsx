import React, { useState } from 'react';
import { useBadgeStore } from '../store/badgeStore.ts';
import { Type, Image as ImageIcon, Square, Circle, Triangle, User, Smartphone, Monitor } from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
    const {
        addElement,
        activeSide,
        setActiveSide,
        badgeDimensions,
        setDimensions
    } = useBadgeStore();

    const [templateName, setTemplateName] = useState('Nome do Template');

    return (
        <aside className="w-[300px] bg-white border-r border-gray-200 flex flex-col h-full z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] overflow-y-auto">
            <div className="p-5 flex flex-col gap-6">

                {/* Template Name */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Template</span>
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm text-gray-700 focus:border-brand-blue focus:outline-none"
                    />
                </div>

                {/* Dimensions */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tamanho (cm)</span>

                    {/* Size Presets */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                            onClick={() => { setDimensions(153, 244); }} // ~54x86mm scaled
                            className="py-1.5 px-2 text-[10px] font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            Crachá Padrão
                            <span className="block text-[9px] text-gray-400">54x86mm</span>
                        </button>
                        <button
                            onClick={() => { setDimensions(283, 396); }} // ~100x140mm scaled
                            className="py-1.5 px-2 text-[10px] font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            Crachá Evento
                            <span className="block text-[9px] text-gray-400">100x140mm</span>
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[10px] text-gray-500 font-bold">Largura (px)</label>
                            <input
                                type="number"
                                value={badgeDimensions.width}
                                onChange={(e) => setDimensions(Number(e.target.value), badgeDimensions.height)}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[10px] text-gray-500 font-bold">Altura (px)</label>
                            <input
                                type="number"
                                value={badgeDimensions.height}
                                onChange={(e) => setDimensions(badgeDimensions.width, Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Side Toggle */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lado do Crachá</span>
                    <div className="flex border border-gray-300 rounded overflow-hidden">
                        <button
                            onClick={() => setActiveSide('front')}
                            className={clsx("flex-1 py-1.5 text-xs font-medium transition-colors", activeSide === 'front' ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
                        >
                            Frente
                        </button>
                        <button
                            onClick={() => setActiveSide('back')}
                            className={clsx("flex-1 py-1.5 text-xs font-medium transition-colors", activeSide === 'back' ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
                        >
                            Verso
                        </button>
                    </div>
                </div>

                <hr className="border-gray-200" />



                {/* Elements */}
                <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Elementos Fixos</span>

                    <button
                        onClick={() => addElement('text')}
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded hover:border-brand-blue hover:text-brand-blue transition-all group"
                    >
                        <Type size={20} className="text-gray-500 group-hover:text-brand-blue" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-brand-blue">Texto</span>
                    </button>

                    <button
                        onClick={() => addElement('photo')}
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded hover:border-brand-blue hover:text-brand-blue transition-all group"
                    >
                        <User size={20} className="text-gray-500 group-hover:text-brand-blue" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-brand-blue">Foto de Perfil</span>
                    </button>

                    <button
                        onClick={() => addElement('image')}
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded hover:border-brand-blue hover:text-brand-blue transition-all group"
                    >
                        <ImageIcon size={20} className="text-gray-500 group-hover:text-brand-blue" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-brand-blue">Imagem</span>
                    </button>
                </div>

                {/* Shapes */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Formas Básicas</span>
                    <div className="flex gap-2">
                        <button onClick={() => addElement('shape', { shapeType: 'rectangle' })} className="p-3 bg-white border border-gray-200 rounded hover:border-brand-blue text-gray-600 hover:text-brand-blue transition-all flex-1 flex justify-center"><Square size={20} /></button>
                        <button onClick={() => addElement('shape', { shapeType: 'circle' })} className="p-3 bg-white border border-gray-200 rounded hover:border-brand-blue text-gray-600 hover:text-brand-blue transition-all flex-1 flex justify-center"><Circle size={20} /></button>
                        <button onClick={() => addElement('shape', { shapeType: 'triangle' })} className="p-3 bg-white border border-gray-200 rounded hover:border-brand-blue text-gray-600 hover:text-brand-blue transition-all flex-1 flex justify-center"><Triangle size={20} /></button>
                        <button onClick={() => addElement('shape', { shapeType: 'line', fillColor: '#000000' })} className="p-3 bg-white border border-gray-200 rounded hover:border-brand-blue text-gray-600 hover:text-brand-blue transition-all flex-1 flex items-center justify-center"><div className="w-4 h-[2px] bg-current" /></button>
                    </div>
                </div>

            </div>

            <div className="mt-auto p-5 border-t border-gray-200">
                <button className="w-full py-3 bg-brand-blue text-white font-medium rounded shadow hover:bg-blue-600 transition-colors">
                    Salvar Template
                </button>
            </div>
        </aside>
    );
};

