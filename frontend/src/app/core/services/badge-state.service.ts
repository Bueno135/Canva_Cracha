import { Injectable, signal, computed, inject } from '@angular/core';
import { BadgeElement, BadgeSide, DEFAULT_BADGE_HEIGHT, DEFAULT_BADGE_WIDTH, ElementType, BadgeTemplate, PhotoShape, ShapeType } from '../models/badge.model';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BadgeStateService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/templates';

    // State Signals
    readonly elements = signal<BadgeElement[]>([]);
    readonly selectedElementIds = signal<string[]>([]);
    readonly activeSide = signal<BadgeSide>('front');
    readonly badgeDimensions = signal({ width: DEFAULT_BADGE_WIDTH, height: DEFAULT_BADGE_HEIGHT });

    // Constants
    readonly PIXELS_PER_CM = 37.8;

    // Template management signals
    readonly currentCnpj = signal<string>('');
    readonly currentSlot = signal<number>(1);
    readonly templateName = signal<string>('');

    // Computed
    readonly activeElements = computed(() =>
        this.elements().filter(el => el.side === this.activeSide())
    );

    readonly selectedElement = computed(() => {
        const ids = this.selectedElementIds();
        if (ids.length === 0) return null;
        return this.elements().find(el => el.id === ids[0]) || null;
    });

    // Actions
    addElement(
        type: ElementType,
        initialContent = 'New Item',
        photoShape?: PhotoShape,
        style?: any,
        dimensions?: { width: number, height: number, x: number, y: number, zIndex?: number },
        shapeType?: ShapeType
    ) {
        const isImage = type === 'image' || type === 'qr';
        const isShape = type === 'shape';

        let width = dimensions?.width ?? (isImage ? 100 : 120);
        let height = dimensions?.height ?? (isImage ? 100 : 30);

        if (isShape) {
            width = dimensions?.width ?? 80;
            height = dimensions?.height ?? 80;
        }

        const newEl: BadgeElement = {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            type,
            x: dimensions?.x ?? 20,
            y: dimensions?.y ?? 20,
            width,
            height,
            content: initialContent,
            style: {
                color: '#000000',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'center',
                backgroundColor: 'transparent',
                borderRadius: '0px',
                border: 'none',
                objectFit: 'cover',
                ...style // Allow override
            },
            side: this.activeSide(),
            zIndex: dimensions?.zIndex ?? (this.elements().length + 1),
            photoShape: photoShape,

            // Shape Defaults
            shapeType: shapeType,
            fillColor: isShape ? '#000000' : undefined,
            borderColor: isShape ? '#000000' : undefined,
            borderWidth: isShape ? 0 : undefined
        };

        this.elements.update(els => [...els, newEl]);
        this.selectElement(newEl.id);
    }

    addShapeElement(shapeType: ShapeType) {
        this.addElement('shape', '', undefined, undefined, undefined, shapeType);
    }

    addPhotoElement(shape: PhotoShape = 'square') {
        this.addElement('image', '{{foto}}', shape);
    }

    updateElement(id: string, changes: Partial<BadgeElement>) {
        this.elements.update(els =>
            els.map(el => el.id === id ? { ...el, ...changes } : el)
        );
    }

    updateElementPosition(id: string, x: number, y: number) {
        this.updateElement(id, { x, y });
    }

    updateElementSize(id: string, width: number, height: number) {
        this.updateElement(id, { width, height });
    }

    updateElementStyle(id: string, styleKey: string, value: string | number) {
        this.elements.update(els =>
            els.map(el => {
                if (el.id !== id) return el;
                return { ...el, style: { ...el.style, [styleKey]: value } };
            })
        );
    }

    updatePhotoShape(id: string, shape: PhotoShape) {
        this.updateElement(id, { photoShape: shape });
    }

    removeElement(id: string) {
        this.elements.update(els => els.filter(el => el.id !== id));
        if (this.selectedElementIds().includes(id)) {
            this.selectedElementIds.set([]);
        }
    }

    selectElement(id: string) {
        this.selectedElementIds.set([id]);
    }

    clearSelection() {
        this.selectedElementIds.set([]);
    }

    removeSelectedElements() {
        const idsToRemove = this.selectedElementIds();
        this.elements.update(elements => elements.filter(el => !idsToRemove.includes(el.id)));
        this.clearSelection();
    }

    // --- Clipboard ---
    readonly clipboard = signal<BadgeElement | null>(null);

    copySelectedElement() {
        const selected = this.selectedElement();
        if (selected) {
            this.clipboard.set(JSON.parse(JSON.stringify(selected))); // Deep copy
        }
    }

    pasteElement() {
        const copied = this.clipboard();
        if (!copied) return;

        const newEl: BadgeElement = {
            ...copied,
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            x: copied.x + 20,
            y: copied.y + 20,
            zIndex: this.elements().length + 1
        };

        this.elements.update(els => [...els, newEl]);
        this.selectElement(newEl.id);
    }


    resizeSelectedElement(delta: number) {
        const selectedId = this.selectedElementIds()[0];
        if (!selectedId) return;

        this.elements.update(els =>
            els.map(el => {
                if (el.id !== selectedId) return el;

                const currentFontSize = parseInt(el.style['fontSize']?.toString() || '14', 10);
                const newFontSize = Math.max(4, currentFontSize + (delta * 2));
                const widthScale = Math.round(el.width * 0.1);
                const heightScale = Math.round(el.height * 0.1);

                return {
                    ...el,
                    width: Math.max(5, el.width + (delta * Math.max(widthScale, 5))),
                    height: Math.max(5, el.height + (delta * Math.max(heightScale, 3))),
                    style: {
                        ...el.style,
                        fontSize: `${newFontSize}px`
                    }
                };
            })
        );
    }

    setSide(side: BadgeSide) {
        this.activeSide.set(side);
        this.clearSelection();
    }

    setBadgeDimensions(width: number, height: number) {
        this.badgeDimensions.set({ width, height });
    }


    // Template Management
    setCnpj(cnpj: string) {
        this.currentCnpj.set(cnpj);
    }

    setSlot(slot: number) {
        this.currentSlot.set(slot);
    }

    setTemplateName(name: string) {
        this.templateName.set(name);
    }

    async loadTemplate(cnpj: string, slot: number) {
        try {
            const template = await firstValueFrom(this.http.get<BadgeTemplate>(`${this.apiUrl}/${cnpj}/${slot}`));

            // Update state
            this.currentCnpj.set(cnpj);
            this.currentSlot.set(slot);
            this.templateName.set(template.templateName || '');

            // Set Layout
            if (template.layoutJson) {
                const elements = JSON.parse(template.layoutJson);
                this.elements.set(elements);
            } else {
                this.elements.set([]);
            }
        } catch (error) {
            console.warn('Template not found or error loading', error);
            // Reset if no template found
            this.elements.set([]);
        }
    }

    loadTemplateBySlot(slot: number) {
        // For now, just reset the canvas for the selected slot
        // CNPJ-based loading will be implemented later
        this.currentSlot.set(slot);
        this.elements.set([]);
        this.templateName.set('');
        console.log(`Loaded empty slot ${slot}`);
    }


    async loadTemplatesForCnpj(cnpj: string): Promise<BadgeTemplate[]> {
        try {
            return await firstValueFrom(this.http.get<BadgeTemplate[]>(`${this.apiUrl}/${cnpj}`));
        } catch (error) {
            console.warn('Error loading templates for CNPJ', error);
            return [];
        }
    }

    async saveTemplate() {
        const cnpj = this.currentCnpj();
        const slot = this.currentSlot();
        const name = this.templateName();

        if (!cnpj) {
            alert('Por favor, informe o CNPJ.');
            return;
        }

        const template: BadgeTemplate = {
            cnpj,
            slotNumber: slot,
            templateName: name,
            frenteImagem: '', // Deprecated / Unused
            versoImagem: '',  // Deprecated / Unused
            layoutJson: JSON.stringify(this.elements())
        };

        try {
            await firstValueFrom(this.http.post(this.apiUrl, template));
            alert('Template salvo com sucesso!');
        } catch (error) {
            console.error('Error saving template', error);
            alert('Erro ao salvar template.');
        }
    }

    clearCanvas() {
        this.elements.set([]);
        this.templateName.set('');
    }
}

