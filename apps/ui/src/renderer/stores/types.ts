/**
 * World Tree Graph Types
 *
 * Defines the data structures for nodes and edges in the World Tree graph system.
 * These types are used by the Zustand store for state management.
 */

export interface Position {
  x: number;
  y: number;
}

export interface WorldTreeNode {
  id: string;
  label: string;
  description: string;
  position: Position;
  parentId: string | null;
  isRoot: boolean;
  isDraggable: boolean;
}

export interface WorldTreeEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface WorldTreeState {
  nodes: WorldTreeNode[];
  edges: WorldTreeEdge[];
}

export interface WorldTreeActions {
  /**
   * Add a new node as a child of the specified parent.
   * Creates a new node with a unique ID and a corresponding edge connecting to the parent.
   */
  addNode: (
    parentId: string,
    data: { label: string; description: string; position: Position }
  ) => void;

  /**
   * Update the position of a node.
   * Constraint: Cannot update position if the node is the root (isRoot: true).
   */
  updateNodePosition: (id: string, position: Position) => void;

  /**
   * Delete a node and all edges connected to it.
   * Constraint: Cannot delete the root node.
   */
  deleteNode: (id: string) => void;

  /**
   * Reset the store to initial state with only the root node.
   */
  reset: () => void;

  /**
   * Create a new root node with custom label and description.
   * This resets the store and creates a fresh root node with the provided data.
   */
  createRootNode: (data: { label: string; description: string }) => void;
}

export type WorldTreeStore = WorldTreeState & WorldTreeActions;
