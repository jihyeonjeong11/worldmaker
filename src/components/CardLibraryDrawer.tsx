/**
 * CardLibraryDrawer Component
 *
 * A drawer panel that displays available story card templates organized by categories.
 * Features collapsible category sections with visual grouping and template card previews.
 * Uses react-window for virtualized rendering to handle large numbers of templates efficiently.
 *
 * @example
 * ```tsx
 * <CardLibraryDrawer
 *   isOpen={isLibraryOpen}
 *   onClose={() => setIsLibraryOpen(false)}
 *   onSelectTemplate={(template) => handleTemplateSelect(template)}
 * />
 * ```
 */
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { List, type ListImperativeAPI } from 'react-window';
import { DrawerPanel } from './DrawerPanel';
import { TemplateCardPreview } from './TemplateCardPreview';
import { useCardSearch } from '@/hooks';
import type { Template, TemplateCategory } from '@/types';

/**
 * Category metadata for display purposes
 */
interface CategoryInfo {
  id: TemplateCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Props for the CardLibraryDrawer component
 */
export interface CardLibraryDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when the drawer should close */
  onClose: () => void;
  /** Callback when a template is selected */
  onSelectTemplate?: (template: Template) => void;
  /** Optional list of templates (uses built-in templates if not provided) */
  templates?: Template[];
  /** Position of the drawer */
  position?: 'left' | 'right';
}

/**
 * Category configuration with metadata
 */
const CATEGORIES: CategoryInfo[] = [
  {
    id: 'story-structure',
    label: 'Story Structure',
    description: 'Templates for organizing story elements',
    icon: '📚',
    color: 'primary',
  },
  {
    id: 'character',
    label: 'Character',
    description: 'Character development and profiles',
    icon: '👤',
    color: 'success',
  },
  {
    id: 'worldbuilding',
    label: 'Worldbuilding',
    description: 'Settings, locations, and world details',
    icon: '🌍',
    color: 'secondary',
  },
  {
    id: 'plot',
    label: 'Plot',
    description: 'Plot points and narrative structure',
    icon: '📈',
    color: 'warning',
  },
  {
    id: 'workflow',
    label: 'Workflow',
    description: 'Writing process and productivity',
    icon: '⚡',
    color: 'error',
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'User-created templates',
    icon: '✨',
    color: 'surface',
  },
];

/**
 * Built-in sample templates for demonstration
 */
const BUILT_IN_TEMPLATES: Template[] = [
  // Story Structure Templates
  {
    id: 'three-act-structure',
    name: 'Three Act Structure',
    description: 'Classic narrative structure with Setup, Confrontation, and Resolution',
    type: 'project',
    category: 'story-structure',
    isBuiltIn: true,
    columns: [
      { title: 'Act 1: Setup', color: '#3b82f6', position: 0, cards: [] },
      { title: 'Act 2: Confrontation', color: '#f59e0b', position: 1, cards: [] },
      { title: 'Act 3: Resolution', color: '#22c55e', position: 2, cards: [] },
    ],
    cards: [],
    tags: ['structure', 'classic', 'narrative'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'heros-journey',
    name: "Hero's Journey",
    description: 'Joseph Campbell\'s monomyth structure for epic storytelling',
    type: 'project',
    category: 'story-structure',
    isBuiltIn: true,
    columns: [
      { title: 'Ordinary World', color: '#6366f1', position: 0, cards: [] },
      { title: 'Call to Adventure', color: '#8b5cf6', position: 1, cards: [] },
      { title: 'Crossing Threshold', color: '#a855f7', position: 2, cards: [] },
      { title: 'Transformation', color: '#d946ef', position: 3, cards: [] },
      { title: 'Return', color: '#ec4899', position: 4, cards: [] },
    ],
    cards: [],
    tags: ['structure', 'epic', 'monomyth'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Character Templates
  {
    id: 'character-profile',
    name: 'Character Profile',
    description: 'Comprehensive character development template',
    type: 'card',
    category: 'character',
    isBuiltIn: true,
    columns: [],
    cards: [
      { title: 'Background', description: 'Character history and origin', priority: 'high', tags: ['backstory'], position: 0 },
      { title: 'Personality', description: 'Traits, quirks, and behaviors', priority: 'high', tags: ['traits'], position: 1 },
      { title: 'Goals & Motivations', description: 'What drives this character', priority: 'medium', tags: ['motivation'], position: 2 },
    ],
    tags: ['character', 'development', 'profile'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'character-arc',
    name: 'Character Arc',
    description: 'Track character transformation throughout the story',
    type: 'column',
    category: 'character',
    isBuiltIn: true,
    columns: [
      { title: 'Starting Point', color: '#ef4444', position: 0, cards: [] },
      { title: 'Catalyst', color: '#f97316', position: 1, cards: [] },
      { title: 'Growth', color: '#eab308', position: 2, cards: [] },
      { title: 'Transformation', color: '#22c55e', position: 3, cards: [] },
    ],
    cards: [],
    tags: ['character', 'arc', 'growth'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Worldbuilding Templates - Six card types with cues
  {
    id: 'wb-region',
    name: '🏔️ Region',
    description: 'Main terrain type base for the area. Draw one to describe the environment type.',
    type: 'card',
    category: 'worldbuilding',
    isBuiltIn: true,
    columns: [],
    cards: [
      {
        title: 'Region',
        description: 'Describes the environment type of the area',
        priority: 'high',
        tags: ['worldbuilding', 'region', 'terrain'],
        position: 0,
        worldbuilding: {
          cardType: 'region',
          cues: [
            { text: 'Dense canopy forest', suggestion: 'Towering trees block sunlight, creating a dim undergrowth' },
            { text: 'Arid desert plateau', suggestion: 'Wind-carved rock formations dotting an endless expanse' },
            { text: 'Coastal wetlands', suggestion: 'Salt marshes and tidal flats teeming with migratory wildlife' },
          ],
        },
      },
    ],
    tags: ['worldbuilding', 'region', 'terrain', 'environment'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wb-landmark',
    name: '🏰 Landmark',
    description: 'POI or geographical sites for the region. Tuck under a Region card.',
    type: 'card',
    category: 'worldbuilding',
    isBuiltIn: true,
    columns: [],
    cards: [
      {
        title: 'Landmark',
        description: 'A point of interest or geographical site within the region',
        priority: 'high',
        tags: ['worldbuilding', 'landmark', 'POI'],
        position: 0,
        worldbuilding: {
          cardType: 'landmark',
          cues: [
            { text: 'Crumbling stone tower', suggestion: 'Once a watchtower, now overtaken by ivy and nesting birds' },
            { text: 'Underground river cavern', suggestion: 'Echoing chambers where bioluminescent fungi light the way' },
            { text: 'Ancient crossroads marker', suggestion: 'A weathered obelisk at the junction of forgotten trade routes' },
          ],
        },
      },
    ],
    tags: ['worldbuilding', 'landmark', 'POI', 'geography'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wb-namesake',
    name: '🏷️ Namesake',
    description: 'Combine with regions or landmarks to create in-world nicknames.',
    type: 'card',
    category: 'worldbuilding',
    isBuiltIn: true,
    columns: [],
    cards: [
      {
        title: 'Namesake',
        description: 'Each cue can be tucked under a region or landmark and read as though it ends the name',
        priority: 'medium',
        tags: ['worldbuilding', 'namesake', 'naming'],
        position: 0,
        worldbuilding: {
          cardType: 'namesake',
          cues: [
            { text: '...of the Fallen King', suggestion: 'Named after a ruler who met their end here' },
            { text: '...the Whispering', suggestion: 'Known for eerie sounds carried by the wind' },
            { text: '...of Ashenmere', suggestion: 'A compound name evoking fire and water' },
          ],
        },
      },
    ],
    tags: ['worldbuilding', 'namesake', 'naming', 'lore'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wb-origin',
    name: '🌱 Origin',
    description: 'Record significant events of the area\'s past. Tuck under a Region or Landmark.',
    type: 'card',
    category: 'worldbuilding',
    isBuiltIn: true,
    columns: [],
    cards: [
      {
        title: 'Origin',
        description: 'Explains the lore-based backstory of the region or landmark',
        priority: 'medium',
        tags: ['worldbuilding', 'origin', 'history', 'lore'],
        position: 0,
        worldbuilding: {
          cardType: 'origin',
          cues: [
            { text: 'Founded by exiled scholars', suggestion: 'Academics banished from a distant empire built a haven for knowledge' },
            { text: 'Scarred by a magical cataclysm', suggestion: 'The landscape still bears the marks of arcane devastation' },
            { text: 'Sacred ground of an extinct civilization', suggestion: 'Remnants of rituals and structures hint at a forgotten people' },
          ],
        },
      },
    ],
    tags: ['worldbuilding', 'origin', 'history', 'backstory'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wb-attribute',
    name: '🎭 Attribute',
    description: 'Highlight present-day features of the area and its people.',
    type: 'card',
    category: 'worldbuilding',
    isBuiltIn: true,
    columns: [],
    cards: [
      {
        title: 'Attribute',
        description: 'Present-day details about the area itself or its people',
        priority: 'medium',
        tags: ['worldbuilding', 'attribute', 'culture', 'present'],
        position: 0,
        worldbuilding: {
          cardType: 'attribute',
          cues: [
            { text: 'Fiercely independent populace', suggestion: 'The people here reject outside authority and govern themselves' },
            { text: 'Known for rare mineral exports', suggestion: 'The local economy thrives on a unique natural resource' },
            { text: 'Perpetual twilight phenomenon', suggestion: 'An unusual atmospheric condition keeps the area in dim light' },
          ],
        },
      },
    ],
    tags: ['worldbuilding', 'attribute', 'culture', 'present-day'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wb-advent',
    name: '🔮 Advent',
    description: 'Introduce events that may change the area\'s future or serve as story hooks.',
    type: 'card',
    category: 'worldbuilding',
    isBuiltIn: true,
    columns: [],
    cards: [
      {
        title: 'Advent',
        description: 'An event that could change the future of the area or serve as a story hook',
        priority: 'high',
        tags: ['worldbuilding', 'advent', 'future', 'hook'],
        position: 0,
        worldbuilding: {
          cardType: 'advent',
          cues: [
            { text: 'A dormant volcano shows signs of life', suggestion: 'Tremors and steam vents suggest an eruption may be imminent' },
            { text: 'A foreign envoy arrives with an ultimatum', suggestion: 'Diplomatic tensions could escalate into conflict' },
            { text: 'An ancient seal is weakening', suggestion: 'Whatever was imprisoned is stirring, and the wards are failing' },
          ],
        },
      },
    ],
    tags: ['worldbuilding', 'advent', 'future', 'story-hook'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Worldbuilding Project Templates
  {
    id: 'wb-simple-setting',
    name: '🗺️ Simple Setting',
    description: 'Create a simple setting: Region + Landmark + Namesake + Origin + Attribute + Advent',
    type: 'project',
    category: 'worldbuilding',
    isBuiltIn: true,
    columns: [
      { title: '🏔️ Regions', color: '#6366f1', position: 0, cards: [] },
      { title: '🏰 Landmarks', color: '#f59e0b', position: 1, cards: [] },
      { title: '🏷️ Namesakes', color: '#8b5cf6', position: 2, cards: [] },
      { title: '🌱 Origins', color: '#22c55e', position: 3, cards: [] },
      { title: '🎭 Attributes', color: '#ec4899', position: 4, cards: [] },
      { title: '🔮 Advents', color: '#06b6d4', position: 5, cards: [] },
    ],
    cards: [],
    tags: ['worldbuilding', 'setting', 'region', 'complete'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Plot Templates
  {
    id: 'scene-beat',
    name: 'Scene Beat Sheet',
    description: 'Break down scenes into key beats',
    type: 'card',
    category: 'plot',
    isBuiltIn: true,
    columns: [],
    cards: [
      { title: 'Opening Hook', description: 'Grab reader attention', priority: 'high', tags: ['opening'], position: 0 },
      { title: 'Conflict', description: 'Central tension of the scene', priority: 'critical', tags: ['conflict'], position: 1 },
      { title: 'Resolution/Cliffhanger', description: 'How the scene ends', priority: 'high', tags: ['ending'], position: 2 },
    ],
    tags: ['plot', 'scene', 'beats'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'subplot-tracker',
    name: 'Subplot Tracker',
    description: 'Organize and track multiple story threads',
    type: 'project',
    category: 'plot',
    isBuiltIn: true,
    columns: [
      { title: 'Main Plot', color: '#dc2626', position: 0, cards: [] },
      { title: 'Subplot A', color: '#ea580c', position: 1, cards: [] },
      { title: 'Subplot B', color: '#ca8a04', position: 2, cards: [] },
      { title: 'Subplot C', color: '#16a34a', position: 3, cards: [] },
    ],
    cards: [],
    tags: ['plot', 'subplot', 'organization'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Genre Templates - Thriller
  {
    id: 'genre-thriller',
    name: 'Thriller',
    description: 'High-tension narrative structure for thriller and suspense stories with escalating stakes',
    type: 'project',
    category: 'story-structure',
    isBuiltIn: true,
    columns: [
      { title: 'Setup & Hook', color: '#1e40af', position: 0, cards: [
        { title: 'Opening Hook', description: 'Start with an attention-grabbing scene that establishes the threat or mystery', priority: 'critical', tags: ['opening', 'hook'], position: 0 },
        { title: 'Protagonist Introduction', description: 'Introduce the main character in their ordinary world before the inciting event', priority: 'high', tags: ['character', 'setup'], position: 1 },
      ]},
      { title: 'Inciting Incident', color: '#dc2626', position: 1, cards: [
        { title: 'The Trigger Event', description: 'The event that pulls the protagonist into the central conflict', priority: 'critical', tags: ['inciting-incident'], position: 0 },
      ]},
      { title: 'Rising Tension', color: '#ea580c', position: 2, cards: [
        { title: 'First Complication', description: 'Initial obstacles that raise the stakes', priority: 'high', tags: ['complication', 'tension'], position: 0 },
        { title: 'Ticking Clock', description: 'Introduce a time pressure element', priority: 'high', tags: ['urgency', 'stakes'], position: 1 },
        { title: 'False Lead / Twist', description: 'A misdirection that keeps the reader guessing', priority: 'medium', tags: ['twist', 'misdirection'], position: 2 },
      ]},
      { title: 'Climax', color: '#b91c1c', position: 3, cards: [
        { title: 'Confrontation', description: 'The protagonist faces the central threat head-on', priority: 'critical', tags: ['climax', 'confrontation'], position: 0 },
      ]},
      { title: 'Resolution', color: '#166534', position: 4, cards: [
        { title: 'Aftermath', description: 'Show the consequences and new normal after the climax', priority: 'high', tags: ['resolution', 'aftermath'], position: 0 },
      ]},
    ],
    cards: [],
    tags: ['genre', 'thriller', 'suspense', 'tension'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Genre Templates - Romance
  {
    id: 'genre-romance',
    name: 'Romance',
    description: 'Classic romance story arc from meet-cute to happily ever after',
    type: 'project',
    category: 'story-structure',
    isBuiltIn: true,
    columns: [
      { title: 'Meet Cute', color: '#ec4899', position: 0, cards: [
        { title: 'First Encounter', description: 'The memorable first meeting between the love interests', priority: 'critical', tags: ['meet-cute', 'opening'], position: 0 },
        { title: 'Initial Impressions', description: 'First impressions and immediate chemistry or friction', priority: 'high', tags: ['character', 'chemistry'], position: 1 },
      ]},
      { title: 'Building Attraction', color: '#f472b6', position: 1, cards: [
        { title: 'Shared Experiences', description: 'Situations that bring the characters closer together', priority: 'high', tags: ['bonding', 'connection'], position: 0 },
        { title: 'Vulnerability Moment', description: 'A scene where one character reveals their true self', priority: 'high', tags: ['vulnerability', 'depth'], position: 1 },
      ]},
      { title: 'Conflict & Obstacles', color: '#e11d48', position: 2, cards: [
        { title: 'External Obstacle', description: 'Outside forces threatening the relationship', priority: 'high', tags: ['conflict', 'obstacle'], position: 0 },
        { title: 'Internal Conflict', description: 'Personal fears, past wounds, or misunderstandings', priority: 'critical', tags: ['conflict', 'internal'], position: 1 },
      ]},
      { title: 'Dark Moment', color: '#881337', position: 3, cards: [
        { title: 'The Breakup / Separation', description: 'The lowest point where all seems lost for the relationship', priority: 'critical', tags: ['dark-moment', 'separation'], position: 0 },
      ]},
      { title: 'Grand Gesture & HEA', color: '#be185d', position: 4, cards: [
        { title: 'The Grand Gesture', description: 'One character makes a bold move to win the other back', priority: 'critical', tags: ['grand-gesture', 'climax'], position: 0 },
        { title: 'Happily Ever After', description: 'The resolution showing the couple together and happy', priority: 'high', tags: ['resolution', 'HEA'], position: 1 },
      ]},
    ],
    cards: [],
    tags: ['genre', 'romance', 'love-story', 'relationship'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Genre Templates - Fantasy
  {
    id: 'genre-fantasy',
    name: 'Fantasy',
    description: 'Epic fantasy quest structure with world-building and transformation elements',
    type: 'project',
    category: 'story-structure',
    isBuiltIn: true,
    columns: [
      { title: 'Ordinary World', color: '#6366f1', position: 0, cards: [
        { title: 'The Mundane Life', description: 'Establish the protagonist in their everyday world before the adventure', priority: 'high', tags: ['setup', 'ordinary-world'], position: 0 },
        { title: 'World Rules', description: 'Introduce the fundamental rules of the fantasy world', priority: 'medium', tags: ['worldbuilding', 'rules'], position: 1 },
      ]},
      { title: 'Call to Adventure', color: '#8b5cf6', position: 1, cards: [
        { title: 'The Summons', description: 'A challenge, prophecy, or event that calls the hero to action', priority: 'critical', tags: ['call', 'inciting-incident'], position: 0 },
        { title: 'The Mentor', description: 'Introduce a guide who provides wisdom, tools, or training', priority: 'high', tags: ['mentor', 'character'], position: 1 },
      ]},
      { title: 'World Discovery', color: '#a855f7', position: 2, cards: [
        { title: 'New Lands & Peoples', description: 'Exploration of the fantasy world and its inhabitants', priority: 'high', tags: ['exploration', 'worldbuilding'], position: 0 },
        { title: 'Allies & Enemies', description: 'Form alliances and encounter adversaries', priority: 'high', tags: ['allies', 'enemies', 'character'], position: 1 },
        { title: 'Magic / Power System', description: 'Reveal the special abilities or magic of the world', priority: 'medium', tags: ['magic', 'power'], position: 2 },
      ]},
      { title: 'Trials & Transformation', color: '#d946ef', position: 3, cards: [
        { title: 'The Ordeal', description: 'The greatest challenge that tests the hero to their limits', priority: 'critical', tags: ['trial', 'ordeal'], position: 0 },
        { title: 'Sacrifice & Growth', description: 'What the hero must give up to succeed', priority: 'high', tags: ['sacrifice', 'growth'], position: 1 },
      ]},
      { title: 'Final Battle', color: '#c026d3', position: 4, cards: [
        { title: 'The Climactic Battle', description: 'The ultimate confrontation with the main antagonist', priority: 'critical', tags: ['climax', 'battle'], position: 0 },
      ]},
      { title: 'Return', color: '#ec4899', position: 5, cards: [
        { title: 'The New World', description: 'The hero returns transformed, and the world is changed', priority: 'high', tags: ['return', 'resolution'], position: 0 },
      ]},
    ],
    cards: [],
    tags: ['genre', 'fantasy', 'quest', 'epic', 'worldbuilding'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Genre Templates - Mystery
  {
    id: 'genre-mystery',
    name: 'Mystery',
    description: 'Classic mystery/detective structure from crime discovery through investigation to resolution',
    type: 'project',
    category: 'story-structure',
    isBuiltIn: true,
    columns: [
      { title: 'Crime Discovery', color: '#7c3aed', position: 0, cards: [
        { title: 'The Crime Scene', description: 'The discovery of the crime or mystery that needs solving', priority: 'critical', tags: ['crime', 'opening'], position: 0 },
        { title: 'Initial Clues', description: 'First pieces of evidence found at the scene', priority: 'high', tags: ['clues', 'evidence'], position: 1 },
      ]},
      { title: 'Investigation', color: '#2563eb', position: 1, cards: [
        { title: 'Witness Interviews', description: 'Questioning suspects and witnesses for information', priority: 'high', tags: ['investigation', 'interviews'], position: 0 },
        { title: 'Evidence Gathering', description: 'Collecting and analyzing physical and circumstantial evidence', priority: 'high', tags: ['evidence', 'analysis'], position: 1 },
        { title: 'Key Discovery', description: 'A crucial breakthrough in the investigation', priority: 'critical', tags: ['discovery', 'breakthrough'], position: 2 },
      ]},
      { title: 'Red Herrings', color: '#dc2626', position: 2, cards: [
        { title: 'False Suspect', description: 'A character who appears guilty but is innocent', priority: 'high', tags: ['red-herring', 'suspect'], position: 0 },
        { title: 'Misleading Evidence', description: 'Clues that point in the wrong direction', priority: 'medium', tags: ['red-herring', 'misdirection'], position: 1 },
      ]},
      { title: 'Revelation', color: '#f59e0b', position: 3, cards: [
        { title: 'The Final Clue', description: 'The last piece of the puzzle that ties everything together', priority: 'critical', tags: ['revelation', 'clue'], position: 0 },
        { title: 'Confrontation', description: 'Confronting the true culprit with the evidence', priority: 'critical', tags: ['confrontation', 'climax'], position: 1 },
      ]},
      { title: 'Resolution', color: '#16a34a', position: 4, cards: [
        { title: 'The Explanation', description: 'Full reveal of how and why the crime was committed', priority: 'high', tags: ['explanation', 'resolution'], position: 0 },
        { title: 'Justice & Aftermath', description: 'The consequences for the culprit and closure for victims', priority: 'medium', tags: ['justice', 'aftermath'], position: 1 },
      ]},
    ],
    cards: [],
    tags: ['genre', 'mystery', 'detective', 'crime', 'investigation'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Workflow Templates
  {
    id: 'writing-sprint',
    name: 'Writing Sprint',
    description: 'Focused writing session workflow',
    type: 'project',
    category: 'workflow',
    isBuiltIn: true,
    columns: [
      { title: 'Backlog', color: '#6b7280', position: 0, cards: [] },
      { title: 'This Sprint', color: '#3b82f6', position: 1, cards: [] },
      { title: 'In Progress', color: '#f59e0b', position: 2, cards: [] },
      { title: 'Done', color: '#22c55e', position: 3, cards: [] },
    ],
    cards: [],
    tags: ['workflow', 'sprint', 'productivity'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'revision-checklist',
    name: 'Revision Checklist',
    description: 'Systematic approach to story revision',
    type: 'column',
    category: 'workflow',
    isBuiltIn: true,
    columns: [
      { title: 'First Pass', color: '#ef4444', position: 0, cards: [] },
      { title: 'Line Edits', color: '#f59e0b', position: 1, cards: [] },
      { title: 'Polish', color: '#22c55e', position: 2, cards: [] },
    ],
    cards: [],
    tags: ['workflow', 'revision', 'editing'],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Get the color classes for a category
 */
function getCategoryColorClasses(color: string): { bg: string; text: string; border: string } {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: 'bg-primary-500/20', text: 'text-primary-300', border: 'border-primary-500/30' },
    success: { bg: 'bg-success-500/20', text: 'text-success-400', border: 'border-success-500/30' },
    secondary: { bg: 'bg-secondary-500/20', text: 'text-secondary-300', border: 'border-secondary-500/30' },
    warning: { bg: 'bg-warning-500/20', text: 'text-warning-400', border: 'border-warning-500/30' },
    error: { bg: 'bg-error-500/20', text: 'text-error-400', border: 'border-error-500/30' },
    surface: { bg: 'bg-surface-600/50', text: 'text-text-muted', border: 'border-surface-500/30' },
  };
  return colorMap[color] ?? colorMap.surface;
}

/**
 * Item types for virtualized list
 */
type VirtualListItem =
  | { type: 'category-header'; category: CategoryInfo; templateCount: number }
  | { type: 'template'; template: Template; categoryId: TemplateCategory; isLast: boolean };

/**
 * Constants for virtualized list sizing
 */
const CATEGORY_HEADER_HEIGHT = 56; // Height of category header in pixels
const TEMPLATE_CARD_HEIGHT = 130; // Height of template card in pixels (including margin)
const CATEGORY_BOTTOM_PADDING = 8; // Padding after category content

/**
 * Collapsible Category Section Component (Non-virtualized version for fallback)
 */
interface CategorySectionProps {
  category: CategoryInfo;
  templates: Template[];
  isExpanded: boolean;
  onToggle: () => void;
  onSelectTemplate: (template: Template) => void;
  /** Optional function to highlight search matches in text */
  highlightText?: (text: string, field: 'title' | 'description' | 'tag') => { text: string; isHighlighted: boolean }[];
}

function CategorySection({
  category,
  templates,
  isExpanded,
  onToggle,
  onSelectTemplate,
  highlightText,
}: CategorySectionProps): JSX.Element {
  const colorClasses = getCategoryColorClasses(category.color);

  return (
    <div
      className={`rounded-card border ${colorClasses.border} overflow-hidden transition-all duration-200`}
      data-testid={`category-section-${category.id}`}
    >
      {/* Category Header - Clickable to toggle */}
      <button
        type="button"
        className={`w-full flex items-center justify-between px-3 py-2.5 ${colorClasses.bg} hover:brightness-110 transition-all duration-200`}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`category-content-${category.id}`}
        data-testid={`category-header-${category.id}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" role="img" aria-hidden="true">
            {category.icon}
          </span>
          <div className="text-left">
            <h3 className={`font-medium text-sm ${colorClasses.text}`}>
              {category.label}
            </h3>
            <p className="text-xs text-text-muted">
              {templates.length} {templates.length === 1 ? 'template' : 'templates'}
            </p>
          </div>
        </div>
        {/* Chevron icon */}
        <svg
          className={`w-4 h-4 ${colorClasses.text} transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Category Content - Template Cards */}
      <div
        id={`category-content-${category.id}`}
        className={`transition-all duration-200 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
        data-testid={`category-content-${category.id}`}
      >
        {templates.length > 0 ? (
          <div className="p-2 space-y-2 bg-surface-800/30">
            {templates.map((template) => (
              <TemplateCardPreview
                key={template.id}
                template={template}
                onClick={() => onSelectTemplate(template)}
                highlightText={highlightText}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-text-muted text-sm bg-surface-800/30">
            No templates in this category
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Virtualized Category Header Component
 */
interface VirtualizedCategoryHeaderProps {
  category: CategoryInfo;
  templateCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  style: React.CSSProperties;
}

function VirtualizedCategoryHeader({
  category,
  templateCount,
  isExpanded,
  onToggle,
  style,
}: VirtualizedCategoryHeaderProps): JSX.Element {
  const colorClasses = getCategoryColorClasses(category.color);

  return (
    <div style={style} className="px-4 pt-3">
      <div className={`rounded-t-card border ${colorClasses.border} border-b-0`}>
        <button
          type="button"
          className={`w-full flex items-center justify-between px-3 py-2.5 ${colorClasses.bg} hover:brightness-110 transition-all duration-200 rounded-t-card`}
          onClick={onToggle}
          aria-expanded={isExpanded}
          data-testid={`category-header-${category.id}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-hidden="true">
              {category.icon}
            </span>
            <div className="text-left">
              <h3 className={`font-medium text-sm ${colorClasses.text}`}>
                {category.label}
              </h3>
              <p className="text-xs text-text-muted">
                {templateCount} {templateCount === 1 ? 'template' : 'templates'}
              </p>
            </div>
          </div>
          <svg
            className={`w-4 h-4 ${colorClasses.text} transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Virtualized Template Card Component
 */
interface VirtualizedTemplateCardProps {
  template: Template;
  categoryId: TemplateCategory;
  isLast: boolean;
  onSelect: (template: Template) => void;
  highlightText?: (text: string, field: 'title' | 'description' | 'tag') => { text: string; isHighlighted: boolean }[];
  style: React.CSSProperties;
}

function VirtualizedTemplateCard({
  template,
  categoryId,
  isLast,
  onSelect,
  highlightText,
  style,
}: VirtualizedTemplateCardProps): JSX.Element {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const colorClasses = getCategoryColorClasses(category?.color ?? 'surface');

  return (
    <div style={style} className="px-4">
      <div
        className={`border-x ${colorClasses.border} ${isLast ? `border-b rounded-b-card` : ''} bg-surface-800/30 px-2 ${isLast ? 'pb-2' : ''}`}
      >
        <TemplateCardPreview
          template={template}
          onClick={() => onSelect(template)}
          highlightText={highlightText}
        />
      </div>
    </div>
  );
}

/**
 * CardLibraryDrawer - A drawer panel for browsing and selecting story card templates
 *
 * Features:
 * - Collapsible category sections for organized browsing
 * - Visual grouping by template category
 * - Template card previews with type indicators
 * - Search and filter functionality (ready for extension)
 * - Smooth animations and transitions
 */
export function CardLibraryDrawer({
  isOpen,
  onClose,
  onSelectTemplate,
  templates = BUILT_IN_TEMPLATES,
  position = 'right',
}: CardLibraryDrawerProps): JSX.Element {
  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<TemplateCategory>>(
    new Set(['story-structure']) // Default expand the first category
  );

  // Track container height for virtualization
  const [containerHeight, setContainerHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ListImperativeAPI | null>(null);

  // Use the search hook with debouncing for performance
  const {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    isSearching,
    results,
    filteredCount,
    clearSearch,
    highlightText,
  } = useCardSearch({
    items: templates,
    getTitle: (t) => t.name,
    getDescription: (t) => t.description,
    getTags: (t) => t.tags,
    debounceMs: 300, // 300ms debounce for responsive feel
  });

  // Group templates by category (using search results when searching)
  const templatesByCategory = useMemo(() => {
    const grouped: Record<TemplateCategory, Template[]> = {
      'story-structure': [],
      character: [],
      worldbuilding: [],
      plot: [],
      workflow: [],
      custom: [],
    };

    // When searching, use the filtered results; otherwise use all templates
    const itemsToGroup = isSearching
      ? results.map((r) => r.item)
      : templates;

    for (const template of itemsToGroup) {
      if (grouped[template.category]) {
        grouped[template.category].push(template);
      }
    }

    return grouped;
  }, [templates, results, isSearching]);

  // Toggle category expansion
  const handleToggleCategory = useCallback((categoryId: TemplateCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
    // No reset needed in v2 API - it handles this automatically
  }, []);

  // Handle template selection
  const handleSelectTemplate = useCallback(
    (template: Template) => {
      onSelectTemplate?.(template);
    },
    [onSelectTemplate]
  );

  // Expand all categories
  const handleExpandAll = useCallback(() => {
    setExpandedCategories(new Set(CATEGORIES.map((c) => c.id)));
  }, []);

  // Collapse all categories
  const handleCollapseAll = useCallback(() => {
    setExpandedCategories(new Set());
  }, []);

  // Calculate total template count
  const totalTemplates = templates.length;

  // Get non-empty categories for rendering
  const nonEmptyCategories = useMemo(
    () => CATEGORIES.filter((cat) => templatesByCategory[cat.id].length > 0),
    [templatesByCategory]
  );

  // Build flat list of items for virtualization
  const virtualItems = useMemo<VirtualListItem[]>(() => {
    const items: VirtualListItem[] = [];

    for (const category of nonEmptyCategories) {
      const categoryTemplates = templatesByCategory[category.id];

      // Add category header
      items.push({
        type: 'category-header',
        category,
        templateCount: categoryTemplates.length,
      });

      // Add templates if category is expanded
      if (expandedCategories.has(category.id)) {
        categoryTemplates.forEach((template, idx) => {
          items.push({
            type: 'template',
            template,
            categoryId: category.id,
            isLast: idx === categoryTemplates.length - 1,
          });
        });
      }
    }

    return items;
  }, [nonEmptyCategories, templatesByCategory, expandedCategories]);

  // Get item height for virtualization
  const getItemHeight = useCallback((index: number): number => {
    const item = virtualItems[index];
    if (!item) return 0;

    if (item.type === 'category-header') {
      return CATEGORY_HEADER_HEIGHT;
    }

    // Template card height with bottom padding for last item
    return item.isLast ? TEMPLATE_CARD_HEIGHT + CATEGORY_BOTTOM_PADDING : TEMPLATE_CARD_HEIGHT;
  }, [virtualItems]);

  // Measure container height
  useEffect(() => {
    const measureHeight = (): void => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        if (height > 0) {
          setContainerHeight(height);
        }
      }
    };

    measureHeight();

    // Use ResizeObserver to handle resizes
    const observer = new ResizeObserver(measureHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isOpen]);

  /**
   * Row data for virtualized list (passed as rowProps, spread into component props)
   */
  interface VirtualRowData {
    virtualItems: VirtualListItem[];
    expandedCategories: Set<TemplateCategory>;
    handleToggleCategory: (categoryId: TemplateCategory) => void;
    handleSelectTemplate: (template: Template) => void;
    isSearching: boolean;
    highlightText?: (text: string, field: 'title' | 'description' | 'tag') => { text: string; isHighlighted: boolean }[];
  }

  /**
   * Full row component props (react-window v2 flattens rowProps into component props)
   */
  interface VirtualRowProps extends VirtualRowData {
    ariaAttributes: {
      "aria-posinset": number;
      "aria-setsize": number;
      role: "listitem";
    };
    index: number;
    style: React.CSSProperties;
  }

  // Row data for the virtualized list
  const rowData: VirtualRowData = useMemo(() => ({
    virtualItems,
    expandedCategories,
    handleToggleCategory,
    handleSelectTemplate,
    isSearching,
    highlightText: isSearching ? highlightText : undefined,
  }), [virtualItems, expandedCategories, handleToggleCategory, handleSelectTemplate, isSearching, highlightText]);

  // Row component for virtualized list (react-window v2 API - props are flattened)
  const VirtualRow = useCallback(
    ({
      index,
      style,
      virtualItems: items,
      expandedCategories: expanded,
      handleToggleCategory: onToggle,
      handleSelectTemplate: onSelect,
      highlightText: highlight,
    }: VirtualRowProps): React.ReactElement | null => {
      const item = items[index];
      if (!item) return null;

      if (item.type === 'category-header') {
        return (
          <VirtualizedCategoryHeader
            category={item.category}
            templateCount={item.templateCount}
            isExpanded={expanded.has(item.category.id)}
            onToggle={() => onToggle(item.category.id)}
            style={style}
          />
        );
      }

      return (
        <VirtualizedTemplateCard
          template={item.template}
          categoryId={item.categoryId}
          isLast={item.isLast}
          onSelect={onSelect}
          highlightText={highlight}
          style={style}
        />
      );
    },
    []
  );

  // Determine if we should use virtualization (more than 20 items)
  const useVirtualization = virtualItems.length > 20;

  return (
    <DrawerPanel
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      title="Template Library"
      size="lg"
      className="flex flex-col"
    >
      <div className="flex flex-col h-full -m-4" data-testid="card-library-drawer">
        {/* Header Stats */}
        <div className="px-4 py-3 border-b border-border bg-surface-800/50">
          <div className="flex items-center justify-between mb-3">
            <span className="badge badge-primary">
              {totalTemplates} {totalTemplates === 1 ? 'Template' : 'Templates'}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleExpandAll}
                className="text-xs text-text-muted hover:text-text-primary transition-colors px-2 py-1"
                data-testid="expand-all-btn"
              >
                Expand All
              </button>
              <span className="text-text-muted">|</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="text-xs text-text-muted hover:text-text-primary transition-colors px-2 py-1"
                data-testid="collapse-all-btn"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 pr-8 py-2 text-sm"
              data-testid="template-search-input"
              aria-label="Search templates by title, description, or tags"
            />
            {/* Clear search button */}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Clear search"
                data-testid="clear-search-btn"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Search Results Info */}
          {isSearching && (
            <div
              className="mt-2 text-xs text-text-muted flex items-center gap-2"
              data-testid="search-results-info"
              aria-live="polite"
            >
              <span>
                Found <span className="text-primary-400 font-medium">{filteredCount}</span> matching{' '}
                {filteredCount === 1 ? 'template' : 'templates'}
              </span>
              {debouncedQuery !== searchQuery && (
                <span className="text-text-muted animate-pulse">Searching...</span>
              )}
            </div>
          )}
        </div>

        {/* Category Sections */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden"
          data-testid="category-list"
        >
          {nonEmptyCategories.length > 0 ? (
            useVirtualization ? (
              // Virtualized rendering for large lists using react-window v2
              <List
                listRef={(ref) => { listRef.current = ref; }}
                defaultHeight={containerHeight}
                rowCount={virtualItems.length}
                rowHeight={getItemHeight}
                overscanCount={5}
                rowComponent={VirtualRow}
                rowProps={rowData}
              />
            ) : (
              // Non-virtualized rendering for small lists
              <div className="p-4 space-y-3 overflow-y-auto h-full">
                {nonEmptyCategories.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    templates={templatesByCategory[category.id]}
                    isExpanded={expandedCategories.has(category.id)}
                    onToggle={() => handleToggleCategory(category.id)}
                    onSelectTemplate={handleSelectTemplate}
                    highlightText={isSearching ? highlightText : undefined}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8" data-testid="no-results-message">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-text-muted mb-1">No templates found</p>
              {searchQuery && (
                <>
                  <p className="text-xs text-text-muted mb-3">
                    No results for "{debouncedQuery}"
                  </p>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                    data-testid="clear-search-link"
                  >
                    Clear search
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-surface-800/50">
          <p className="text-xs text-text-muted text-center">
            Click a template to preview and apply it to your project
          </p>
        </div>
      </div>
    </DrawerPanel>
  );
}

export { BUILT_IN_TEMPLATES };
export default CardLibraryDrawer;
