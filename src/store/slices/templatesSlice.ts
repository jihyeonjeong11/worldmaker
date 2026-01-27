/**
 * Templates Slice
 * Manages card template state and actions for creating reusable card templates
 */
import type {
  Template,
  TemplateId,
  TemplateCard,
  TemplatesState,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  TemplateType,
  TemplateCategory,
  Card,
  CardId,
  ColumnId,
  ProjectId,
} from '@/types';
import { generateId, getTimestamp } from '../utils';

/**
 * Payload for creating a card template from an existing card
 */
export interface SaveCardAsTemplatePayload {
  card: Card;
  name: string;
  description?: string;
  category?: TemplateCategory;
  tags?: string[];
}

/**
 * Payload for duplicating a card
 */
export interface DuplicateCardPayload {
  cardId: CardId;
  targetColumnId?: ColumnId;
  titleSuffix?: string;
}

/**
 * Templates slice actions
 */
export interface TemplatesActions {
  /** Create a new template */
  createTemplate: (payload: CreateTemplatePayload) => TemplateId;
  /** Update an existing template */
  updateTemplate: (payload: UpdateTemplatePayload) => void;
  /** Delete a template (only non-built-in) */
  deleteTemplate: (id: TemplateId) => boolean;
  /** Get a template by ID */
  getTemplate: (id: TemplateId) => Template | undefined;
  /** Get all templates */
  getAllTemplates: () => Template[];
  /** Get templates by type */
  getTemplatesByType: (type: TemplateType) => Template[];
  /** Get templates by category */
  getTemplatesByCategory: (category: TemplateCategory) => Template[];
  /** Get custom (non-built-in) templates */
  getCustomTemplates: () => Template[];
  /** Set the selected template ID */
  setSelectedTemplate: (id: TemplateId | null) => void;
  /** Save a card as a reusable template */
  saveCardAsTemplate: (payload: SaveCardAsTemplatePayload) => TemplateId;
  /** Create a card from a template */
  createCardFromTemplate: (
    templateId: TemplateId,
    projectId: ProjectId,
    columnId: ColumnId
  ) => CardId | null;
  /** Duplicate an existing card */
  duplicateCard: (payload: DuplicateCardPayload) => CardId | null;
}

/**
 * Combined templates state and actions
 */
export interface TemplatesSlice extends TemplatesState, TemplatesActions {}

/**
 * Create the templates slice
 * @param set - Zustand set function
 * @param get - Zustand get function
 */
export const createTemplatesSlice = (
  set: (fn: (state: TemplatesSlice) => void) => void,
  get: () => TemplatesSlice & {
    cards: Record<CardId, Card>;
    createCard: (payload: {
      projectId: ProjectId;
      columnId: ColumnId;
      title: string;
      description?: string;
      priority?: Card['priority'];
      tags?: string[];
    }) => CardId;
    getCard: (id: CardId) => Card | undefined;
    getCardsByColumn: (columnId: ColumnId) => Card[];
  }
): TemplatesSlice => ({
  // Initial state
  templates: {},
  selectedTemplateId: null,

  // Actions
  createTemplate: (payload) => {
    const id = generateId();
    const now = getTimestamp();

    // Process columns with positions
    const columns = (payload.columns || []).map((col, index) => ({
      ...col,
      position: index,
      cards: col.cards?.map((card, cardIndex) => ({
        ...card,
        position: cardIndex,
      })) || [],
    }));

    // Process cards with positions
    const cards: TemplateCard[] = (payload.cards || []).map((card, index) => ({
      ...card,
      position: index,
    }));

    const newTemplate: Template = {
      id,
      name: payload.name,
      description: payload.description ?? '',
      type: payload.type,
      category: payload.category ?? 'custom',
      isBuiltIn: false,
      columns,
      cards,
      tags: payload.tags ?? [],
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      state.templates[id] = newTemplate;
    });

    return id;
  },

  updateTemplate: (payload) => {
    set((state) => {
      const template = state.templates[payload.id];
      if (template && !template.isBuiltIn) {
        if (payload.name !== undefined) template.name = payload.name;
        if (payload.description !== undefined) template.description = payload.description;
        if (payload.category !== undefined) template.category = payload.category;
        if (payload.columns !== undefined) template.columns = payload.columns;
        if (payload.cards !== undefined) template.cards = payload.cards;
        if (payload.tags !== undefined) template.tags = payload.tags;
        template.updatedAt = getTimestamp();
      }
    });
  },

  deleteTemplate: (id) => {
    const template = get().templates[id];
    if (!template || template.isBuiltIn) {
      return false;
    }

    set((state) => {
      delete state.templates[id];
      if (state.selectedTemplateId === id) {
        state.selectedTemplateId = null;
      }
    });

    return true;
  },

  getTemplate: (id) => {
    return get().templates[id];
  },

  getAllTemplates: () => {
    return Object.values(get().templates);
  },

  getTemplatesByType: (type) => {
    return Object.values(get().templates).filter(
      (template) => template.type === type
    );
  },

  getTemplatesByCategory: (category) => {
    return Object.values(get().templates).filter(
      (template) => template.category === category
    );
  },

  getCustomTemplates: () => {
    return Object.values(get().templates).filter(
      (template) => !template.isBuiltIn
    );
  },

  setSelectedTemplate: (id) => {
    set((state) => {
      state.selectedTemplateId = id;
    });
  },

  saveCardAsTemplate: (payload) => {
    const { card, name, description, category, tags } = payload;
    const id = generateId();
    const now = getTimestamp();

    // Create a TemplateCard from the existing card
    const templateCard: TemplateCard = {
      title: card.title,
      description: card.description,
      priority: card.priority,
      tags: card.tags,
      position: 0,
      ...(card.worldbuilding ? { worldbuilding: card.worldbuilding } : {}),
    };

    const newTemplate: Template = {
      id,
      name,
      description: description ?? `Template created from card: ${card.title}`,
      type: 'card',
      category: category ?? 'custom',
      isBuiltIn: false,
      columns: [],
      cards: [templateCard],
      tags: tags ?? card.tags,
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      state.templates[id] = newTemplate;
    });

    return id;
  },

  createCardFromTemplate: (templateId, projectId, columnId) => {
    const template = get().templates[templateId];
    if (!template || template.type !== 'card' || template.cards.length === 0) {
      return null;
    }

    const templateCard = template.cards[0];

    // Use the store's createCard action
    const cardId = get().createCard({
      projectId,
      columnId,
      title: templateCard.title,
      description: templateCard.description,
      priority: templateCard.priority,
      tags: templateCard.tags,
      ...(templateCard.worldbuilding ? { worldbuilding: templateCard.worldbuilding } : {}),
    });

    return cardId;
  },

  duplicateCard: (payload) => {
    const { cardId, targetColumnId, titleSuffix = ' (Copy)' } = payload;
    const originalCard = get().getCard(cardId);

    if (!originalCard) {
      return null;
    }

    // Create a new card with the same properties
    const newCardId = get().createCard({
      projectId: originalCard.projectId,
      columnId: targetColumnId ?? originalCard.columnId,
      title: originalCard.title + titleSuffix,
      description: originalCard.description,
      priority: originalCard.priority,
      tags: [...originalCard.tags],
      ...(originalCard.worldbuilding ? {
        worldbuilding: {
          cardType: originalCard.worldbuilding.cardType,
          cues: originalCard.worldbuilding.cues.map((cue) => ({ ...cue })),
        },
      } : {}),
    });

    return newCardId;
  },
});
