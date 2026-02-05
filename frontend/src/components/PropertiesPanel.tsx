import React from 'react';
import { useBadgeStore } from '../store/badgeStore.ts';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Palette, Trash2, ArrowDown, Bold, Italic, Underline } from 'lucide-react';
import { clsx } from 'clsx';

export const PropertiesPanel: React.FC = () => {
    const {
        selectedIds, elements, updateElement, deleteSelected
    } = useBadgeStore();

    const selectedElement = elements.find(el => selectedIds.includes(el.id));

    if (!selectedElement) {
        return (
            <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col items-center justify-center text-gray-400 gap-2">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Palette size={24} />
                </div>
                <p className="text-center text-sm">Selecione um elemento para editar suas propriedades.</p>
            </div>
        );
    }

    const isText = selectedElement.type === 'text';
    const isShape = selectedElement.type === 'shape';
    const isImageObs = selectedElement.type === 'image' || selectedElement.type === 'qr' || selectedElement.type === 'photo';
    const isDynamic = selectedElement.content?.startsWith('{{') && selectedElement.content?.endsWith('}}');

    // Helpers
    const handleChange = (key: string, value: any) => updateElement(selectedElement.id, { [key]: value });

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                <span className="font-semibold text-gray-700">Propriedades</span>
                <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-600 uppercase font-bold tracking-wider">
                    {selectedElement.type}
                </span>
            </div>

            <div className="p-4 flex flex-col gap-6">

                {/* Content Section */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Conteúdo</label>

                    {isText && (
                        <>
                            {isDynamic ? (
                                <select
                                    value={selectedElement.content}
                                    onChange={(e) => handleChange('content', e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="{{nome}}">Nome</option>
                                    <option value="{{cargo}}">Cargo</option>
                                    <option value="{{setor}}">Setor</option>
                                    <option value="{{matricula}}">Matrícula</option>
                                    <option value="{{cpf}}">CPF</option>
                                </select>
                            ) : (
                                <textarea
                                    value={selectedElement.content}
                                    onChange={(e) => handleChange('content', e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                                />
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="checkbox"
                                    id="isDynamic"
                                    checked={isDynamic}
                                    onChange={(e) => handleChange('content', e.target.checked ? '{{nome}}' : 'Novo Texto')}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isDynamic" className="text-sm text-gray-600 select-none cursor-pointer">Tag Dinâmica</label>
                            </div>
                        </>
                    )}

                    {isImageObs && (
                        <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded border border-gray-200 break-all">
                            {selectedElement.content || 'Sem conteúdo'}
                        </div>
                    )}
                    {isText && (
                        <div className="flex flex-col gap-2 mt-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Inserir Variável</span>
                            <div className="flex flex-wrap gap-2">
                                {['{{Nome}}', '{{Cargo}}', '{{Setor}}', '{{Matrícula}}', '{{CPF}}'].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            const newContent = selectedElement.content ? selectedElement.content + ' ' + tag : tag;
                                            handleChange('content', newContent);
                                        }}
                                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-100 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <hr className="border-gray-100" />

                {/* Style Section (Text) */}
                {isText && (
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Estilo de Texto</label>

                        {/* Font Size */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Tamanho</span>
                                <span className="text-sm font-medium">{selectedElement.fontSize}px</span>
                            </div>
                            <input
                                type="range" min="4" max="300"
                                value={selectedElement.fontSize || 14}
                                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start">
                            <button
                                onClick={() => handleChange('fontWeight', selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                                className={clsx("p-1.5 rounded", selectedElement.fontWeight === 'bold' ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-900")}
                            >
                                <Bold size={16} />
                            </button>
                            <button
                                onClick={() => handleChange('fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                                className={clsx("p-1.5 rounded", selectedElement.fontStyle === 'italic' ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-900")}
                            >
                                <Italic size={16} />
                            </button>
                            <button
                                onClick={() => handleChange('textDecoration', selectedElement.textDecoration === 'underline' ? 'none' : 'underline')}
                                className={clsx("p-1.5 rounded", selectedElement.textDecoration === 'underline' ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-900")}
                            >
                                <Underline size={16} />
                            </button>
                        </div>

                        {/* Alignment & Orientation */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                {[
                                    { val: 'left', Icon: AlignLeft },
                                    { val: 'center', Icon: AlignCenter },
                                    { val: 'right', Icon: AlignRight },
                                    { val: 'justify', Icon: AlignJustify }
                                ].map(({ val, Icon }) => (
                                    <button
                                        key={val}
                                        onClick={() => handleChange('textAlign', val)}
                                        className={clsx("p-1.5 rounded", selectedElement.textAlign === val ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-900")}
                                    >
                                        <Icon size={16} />
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handleChange('writingMode', selectedElement.writingMode === 'vertical-rl' ? 'horizontal-tb' : 'vertical-rl')}
                                className={clsx("p-1.5 rounded flex items-center gap-1 border", selectedElement.writingMode === 'vertical-rl' ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-600")}
                                title="Texto Vertical"
                            >
                                <ArrowDown size={14} />
                                <span className="text-xs font-medium">Vertical</span>
                            </button>
                        </div>

                        {/* Color */}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded border border-gray-300 cursor-pointer shadow-sm relative overflow-hidden"
                                style={{ backgroundColor: selectedElement.color || '#000' }}
                            >
                                <input
                                    type="color"
                                    className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                                    value={selectedElement.color || '#000000'}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                />
                            </div>
                            <span className="text-sm text-gray-600">{selectedElement.color?.toUpperCase()}</span>
                        </div>
                    </div>
                )}

                {/* Shape Properties */}
                {isShape && (
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Estilo da Forma</label>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Fill */}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">Cor Fundo</span>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer shadow-sm relative overflow-hidden"
                                        style={{ backgroundColor: selectedElement.fillColor || 'transparent' }}
                                    >
                                        <input
                                            type="color"
                                            className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                                            value={selectedElement.fillColor || '#ffffff'}
                                            onChange={(e) => handleChange('fillColor', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Border Color */}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">Cor Borda</span>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer shadow-sm relative overflow-hidden"
                                        style={{ backgroundColor: selectedElement.borderColor || 'transparent' }}
                                    >
                                        <input
                                            type="color"
                                            className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                                            value={selectedElement.borderColor || '#000000'}
                                            onChange={(e) => handleChange('borderColor', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Espessura Borda</span>
                                <span className="text-xs font-mono">{selectedElement.borderWidth}px</span>
                            </div>
                            <input
                                type="range" min="0" max="20"
                                value={selectedElement.borderWidth || 0}
                                onChange={(e) => handleChange('borderWidth', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>
                )}

                <hr className="border-gray-100" />

                {/* Layout Section */}
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Layout</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <span className="text-gray-400 text-xs font-bold">X</span>
                            <input
                                type="number"
                                value={Math.round(selectedElement.x)}
                                onChange={(e) => handleChange('x', parseInt(e.target.value))}
                                className="w-full bg-transparent text-sm text-right outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <span className="text-gray-400 text-xs font-bold">Y</span>
                            <input
                                type="number"
                                value={Math.round(selectedElement.y)}
                                onChange={(e) => handleChange('y', parseInt(e.target.value))}
                                className="w-full bg-transparent text-sm text-right outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <span className="text-gray-400 text-xs font-bold">L</span>
                            <input
                                type="number"
                                value={Math.round(selectedElement.width)}
                                onChange={(e) => handleChange('width', parseInt(e.target.value))}
                                className="w-full bg-transparent text-sm text-right outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <span className="text-gray-400 text-xs font-bold">A</span>
                            <input
                                type="number"
                                value={Math.round(selectedElement.height)}
                                onChange={(e) => handleChange('height', parseInt(e.target.value))}
                                className="w-full bg-transparent text-sm text-right outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <span className="text-gray-400 text-xs font-bold">↻</span>
                        <input
                            type="number"
                            value={Math.round(selectedElement.rotation || 0)}
                            onChange={(e) => handleChange('rotation', parseInt(e.target.value))}
                            className="w-full bg-transparent text-sm text-right outline-none"
                        />
                        <span className="text-xs text-gray-400">deg</span>
                    </div>
                </div>

                <div className="mt-auto pt-4">
                    <button
                        onClick={deleteSelected}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                        <span className="font-medium">Excluir</span>
                    </button>
                </div>

            </div>
        </div>
    );
};
