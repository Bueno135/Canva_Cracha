import { create } from 'zustand';
import type { BadgeElement, BadgeSide, ElementType, ShapeType } from '../types';

interface BadgeStoreState {
    elements: BadgeElement[];
    selectedIds: string[];
    activeSide: BadgeSide;
    badgeDimensions: { width: number; height: number };
    scale: number;
    clipboard: BadgeElement[] | null;

    // Actions
    setElements: (elements: BadgeElement[]) => void;
    addElement: (type: ElementType, opts?: Partial<BadgeElement>) => void;
    updateElement: (id: string, updates: Partial<BadgeElement>) => void;
    updateElements: (updates: { id: string; changes: Partial<BadgeElement> }[]) => void;
    selectElement: (id: string | null, multi?: boolean) => void;
    deleteSelected: () => void;
    setActiveSide: (side: BadgeSide) => void;
    setDimensions: (width: number, height: number) => void;
    setScale: (scale: number | ((prev: number) => number)) => void; // Allow functional update
    setSelectedIds: (ids: string[]) => void;

    // Clipboard
    copy: () => void;
    paste: () => void;

    // History (Simple Stack) - MVP mostly, can expand later
    // undo: () => void;
    // redo: () => void;
}

export const useBadgeStore = create<BadgeStoreState>((set, get) => ({
    elements: [],
    selectedIds: [],
    activeSide: 'front',
    badgeDimensions: { width: 153, height: 244 }, // Default
    scale: 2.0,
    clipboard: null,

    setElements: (elements) => set({ elements }),

    addElement: (type, opts = {}) => {
        const { elements, activeSide } = get();

        // Defaults
        let width = type === 'image' || type === 'qr' ? 100 : 120;
        let height = type === 'image' || type === 'qr' ? 100 : 30;
        let content = 'Novo Item';

        if (type === 'shape') {
            width = 80; height = 80; content = '';
            if (opts.shapeType === 'line') {
                width = 100;
                height = 4; // Thickness
            }
        }
        if (type === 'photo') {
            width = 100; height = 100; content = '{{foto}}';
        }
        if (type === 'qr') content = 'https://example.com';

        const newEl: BadgeElement = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x: 20,
            y: 20,
            width,
            height,
            rotation: 0,
            zIndex: elements.length + 1,
            side: activeSide,
            content,
            fontSize: 14,
            color: '#000000',
            textAlign: 'center',
            writingMode: 'horizontal-tb',
            // Merge overrides
            ...opts
        };

        set({ elements: [...elements, newEl], selectedIds: [newEl.id] });
    },

    updateElement: (id, updates) => {
        set((state) => ({
            elements: state.elements.map((el) =>
                el.id === id ? { ...el, ...updates } : el
            )
        }));
    },

    updateElements: (updates) => {
        set((state) => {
            const updatesMap = new Map(updates.map(u => [u.id, u.changes]));
            return {
                elements: state.elements.map(el => {
                    const changes = updatesMap.get(el.id);
                    return changes ? { ...el, ...changes } : el;
                })
            };
        });
    },

    selectElement: (id, multi = false) => {
        if (id === null) {
            set({ selectedIds: [] });
            return;
        }
        set((state) => ({
            selectedIds: multi
                ? (state.selectedIds.includes(id)
                    ? state.selectedIds.filter(i => i !== id)
                    : [...state.selectedIds, id])
                : [id]
        }));
    },



    setSelectedIds: (ids) => set({ selectedIds: ids }),

    deleteSelected: () => {
        set((state) => ({
            elements: state.elements.filter(el => !state.selectedIds.includes(el.id)),
            selectedIds: []
        }));
    },

    setActiveSide: (side) => set({ activeSide: side, selectedIds: [] }),

    setDimensions: (width, height) => set({ badgeDimensions: { width, height } }),

    setScale: (update) => set((state) => ({
        scale: typeof update === 'function' ? update(state.scale) : update
    })),

    copy: () => {
        const { elements, selectedIds } = get();
        if (selectedIds.length === 0) return;

        // Filter all selected elements
        const toCopy = elements.filter(el => selectedIds.includes(el.id));

        if (toCopy.length > 0) {
            // Deep copy to clipboard
            set({ clipboard: JSON.parse(JSON.stringify(toCopy)) });
        }
    },

    paste: () => {
        const { clipboard, elements } = get();
        if (!clipboard || clipboard.length === 0) return;

        const newElements: BadgeElement[] = [];
        const newSelectedIds: string[] = [];
        let maxZ = Math.max(...elements.map(e => e.zIndex), 0);

        clipboard.forEach((item) => {
            maxZ++;
            const newId = Math.random().toString(36).substr(2, 9);
            const newEl: BadgeElement = {
                ...item,
                id: newId,
                x: item.x + 20,
                y: item.y + 20,
                zIndex: maxZ
            };
            newElements.push(newEl);
            newSelectedIds.push(newId);
        });

        set({ elements: [...elements, ...newElements], selectedIds: newSelectedIds });
    }
}));
