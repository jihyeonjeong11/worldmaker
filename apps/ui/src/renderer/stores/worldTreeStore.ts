/**
 * World Tree Zustand Store
 *
 * Manages the state of a hierarchical graph system for worldbuilding.
 * Features:
 * - Persistent state using localStorage
 * - Automatic initialization with a root node
 * - Type-safe actions for node/edge manipulation
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WorldTreeStore,
  WorldTreeNode,
  WorldTreeEdge,
  Position,
} from './types';

const STORAGE_KEY = 'world-tree-store';

/**
 * Generate a unique ID for nodes and edges
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create the initial root node
 */
function createRootNode(): WorldTreeNode {
  return {
    id: 'root',
    label: 'World Root',
    description: '',
    position: { x: 0, y: 0 },
    parentId: null,
    isRoot: true,
    isDraggable: false,
  };
}

/**
 * Get the initial state with just the root node
 */
function getInitialState(): { nodes: WorldTreeNode[]; edges: WorldTreeEdge[] } {
  return {
    nodes: [createRootNode()],
    edges: [],
  };
}

export const useWorldTreeStore = create<WorldTreeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...getInitialState(),

      addNode: (parentId, data) => {
        const state = get();

        // Verify parent exists
        const parentNode = state.nodes.find((node) => node.id === parentId);
        if (!parentNode) {
          console.warn(`Parent node with id "${parentId}" not found`);
          return;
        }

        const newNodeId = generateId();

        // Create the new node
        const newNode: WorldTreeNode = {
          id: newNodeId,
          label: data.label,
          description: data.description,
          position: data.position,
          parentId: parentId,
          isRoot: false,
          isDraggable: true,
        };

        // Create the edge connecting parent to new node
        const newEdge: WorldTreeEdge = {
          id: generateId(),
          sourceId: parentId,
          targetId: newNodeId,
        };

        set({
          nodes: [...state.nodes, newNode],
          edges: [...state.edges, newEdge],
        });
      },

      updateNodePosition: (id, position) => {
        const state = get();
        const node = state.nodes.find((n) => n.id === id);

        // Constraint: Do not allow updates if isRoot is true
        if (!node) {
          console.warn(`Node with id "${id}" not found`);
          return;
        }

        if (node.isRoot) {
          console.warn('Cannot update position of root node');
          return;
        }

        set({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, position } : n
          ),
        });
      },

      deleteNode: (id) => {
        const state = get();
        const node = state.nodes.find((n) => n.id === id);

        if (!node) {
          console.warn(`Node with id "${id}" not found`);
          return;
        }

        // Constraint: Prevent deletion of the Root node
        if (node.isRoot) {
          console.warn('Cannot delete root node');
          return;
        }

        // Remove the node and all edges connected to it
        set({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter(
            (edge) => edge.sourceId !== id && edge.targetId !== id
          ),
        });
      },

      reset: () => {
        set(getInitialState());
      },

      createRootNode: (data) => {
        // Create a new root node with custom label and description
        const newRootNode: WorldTreeNode = {
          id: 'root',
          label: data.label,
          description: data.description,
          position: { x: 0, y: 0 },
          parentId: null,
          isRoot: true,
          isDraggable: false,
        };

        // Reset state with the new custom root node
        set({
          nodes: [newRootNode],
          edges: [],
        });
      },
    }),
    {
      name: STORAGE_KEY,
      // Ensure the store initializes with root node if storage is empty
      onRehydrateStorage: () => (state) => {
        // If no nodes exist after rehydration, initialize with root node
        if (!state || state.nodes.length === 0) {
          useWorldTreeStore.setState(getInitialState());
        }
      },
    }
  )
);

export default useWorldTreeStore;
