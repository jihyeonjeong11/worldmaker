import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useWorldTreeStore } from '../renderer/stores/worldTreeStore';
import type { WorldTreeNode, WorldTreeEdge, Position } from '../renderer/stores/types';

describe('worldTreeStore', () => {
  // Store the original console methods
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    // Reset store to initial state before each test
    useWorldTreeStore.setState({
      nodes: [
        {
          id: 'root',
          label: 'World Root',
          description: '',
          position: { x: 0, y: 0 },
          parentId: null,
          isRoot: true,
          isDraggable: false,
        },
      ],
      edges: [],
    });

    // Mock console.warn to suppress warnings during tests
    console.warn = vi.fn();
  });

  afterEach(() => {
    // Restore console.warn
    console.warn = originalConsoleWarn;
  });

  describe('Initial State', () => {
    it('should have a root node on initialization', () => {
      const state = useWorldTreeStore.getState();

      expect(state.nodes).toHaveLength(1);
      expect(state.nodes[0]).toMatchObject({
        id: 'root',
        label: 'World Root',
        description: '',
        position: { x: 0, y: 0 },
        parentId: null,
        isRoot: true,
        isDraggable: false,
      });
    });

    it('should have no edges on initialization', () => {
      const state = useWorldTreeStore.getState();

      expect(state.edges).toHaveLength(0);
    });

    it('should have root node at origin position', () => {
      const state = useWorldTreeStore.getState();

      expect(state.nodes[0].position).toEqual({ x: 0, y: 0 });
    });
  });

  describe('addNode', () => {
    it('should add a new node as child of root', () => {
      const { addNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'Child Node',
          description: 'A child node',
          position: { x: 100, y: 100 },
        });
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes).toHaveLength(2);

      const childNode = state.nodes.find((n) => n.id !== 'root');
      expect(childNode).toBeDefined();
      expect(childNode?.label).toBe('Child Node');
      expect(childNode?.description).toBe('A child node');
      expect(childNode?.position).toEqual({ x: 100, y: 100 });
      expect(childNode?.parentId).toBe('root');
      expect(childNode?.isRoot).toBe(false);
      expect(childNode?.isDraggable).toBe(true);
    });

    it('should create an edge connecting parent to new node', () => {
      const { addNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'Child Node',
          description: '',
          position: { x: 50, y: 50 },
        });
      });

      const state = useWorldTreeStore.getState();
      expect(state.edges).toHaveLength(1);

      const childNode = state.nodes.find((n) => n.id !== 'root');
      expect(state.edges[0].sourceId).toBe('root');
      expect(state.edges[0].targetId).toBe(childNode?.id);
    });

    it('should generate unique IDs for nodes', () => {
      const { addNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'Node 1',
          description: '',
          position: { x: 0, y: 0 },
        });
      });

      act(() => {
        addNode('root', {
          label: 'Node 2',
          description: '',
          position: { x: 100, y: 0 },
        });
      });

      const state = useWorldTreeStore.getState();
      const nodeIds = state.nodes.map((n) => n.id);
      const uniqueIds = new Set(nodeIds);

      expect(uniqueIds.size).toBe(nodeIds.length);
    });

    it('should generate unique IDs for edges', () => {
      const { addNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'Node 1',
          description: '',
          position: { x: 0, y: 0 },
        });
      });

      act(() => {
        addNode('root', {
          label: 'Node 2',
          description: '',
          position: { x: 100, y: 0 },
        });
      });

      const state = useWorldTreeStore.getState();
      const edgeIds = state.edges.map((e) => e.id);
      const uniqueIds = new Set(edgeIds);

      expect(uniqueIds.size).toBe(edgeIds.length);
    });

    it('should warn and not add node when parent does not exist', () => {
      const { addNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('nonexistent-parent', {
          label: 'Orphan Node',
          description: '',
          position: { x: 0, y: 0 },
        });
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes).toHaveLength(1); // Only root
      expect(state.edges).toHaveLength(0);
      expect(console.warn).toHaveBeenCalledWith(
        'Parent node with id "nonexistent-parent" not found'
      );
    });

    it('should allow adding nodes to non-root parent nodes', () => {
      const { addNode } = useWorldTreeStore.getState();

      // Add a child to root
      act(() => {
        addNode('root', {
          label: 'Level 1',
          description: '',
          position: { x: 100, y: 0 },
        });
      });

      const stateAfterFirst = useWorldTreeStore.getState();
      const level1Node = stateAfterFirst.nodes.find((n) => n.label === 'Level 1');

      // Add a grandchild to the level 1 node
      act(() => {
        addNode(level1Node!.id, {
          label: 'Level 2',
          description: '',
          position: { x: 200, y: 0 },
        });
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes).toHaveLength(3);

      const level2Node = state.nodes.find((n) => n.label === 'Level 2');
      expect(level2Node?.parentId).toBe(level1Node!.id);

      // Verify edge exists between level 1 and level 2
      const connectingEdge = state.edges.find(
        (e) => e.sourceId === level1Node!.id && e.targetId === level2Node!.id
      );
      expect(connectingEdge).toBeDefined();
    });
  });

  describe('updateNodePosition', () => {
    it('should update position of a draggable node', () => {
      const { addNode, updateNodePosition } = useWorldTreeStore.getState();

      // Add a child node first
      act(() => {
        addNode('root', {
          label: 'Movable Node',
          description: '',
          position: { x: 0, y: 0 },
        });
      });

      const stateAfterAdd = useWorldTreeStore.getState();
      const movableNode = stateAfterAdd.nodes.find((n) => n.label === 'Movable Node');

      // Update position
      act(() => {
        updateNodePosition(movableNode!.id, { x: 200, y: 300 });
      });

      const state = useWorldTreeStore.getState();
      const updatedNode = state.nodes.find((n) => n.id === movableNode!.id);
      expect(updatedNode?.position).toEqual({ x: 200, y: 300 });
    });

    it('should not update position of root node', () => {
      const { updateNodePosition } = useWorldTreeStore.getState();

      act(() => {
        updateNodePosition('root', { x: 100, y: 100 });
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes[0].position).toEqual({ x: 0, y: 0 });
      expect(console.warn).toHaveBeenCalledWith('Cannot update position of root node');
    });

    it('should warn when trying to update non-existent node', () => {
      const { updateNodePosition } = useWorldTreeStore.getState();

      act(() => {
        updateNodePosition('nonexistent-node', { x: 100, y: 100 });
      });

      expect(console.warn).toHaveBeenCalledWith(
        'Node with id "nonexistent-node" not found'
      );
    });

    it('should preserve other node properties when updating position', () => {
      const { addNode, updateNodePosition } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'Test Node',
          description: 'Test description',
          position: { x: 0, y: 0 },
        });
      });

      const stateAfterAdd = useWorldTreeStore.getState();
      const testNode = stateAfterAdd.nodes.find((n) => n.label === 'Test Node');

      act(() => {
        updateNodePosition(testNode!.id, { x: 500, y: 500 });
      });

      const state = useWorldTreeStore.getState();
      const updatedNode = state.nodes.find((n) => n.id === testNode!.id);

      expect(updatedNode?.label).toBe('Test Node');
      expect(updatedNode?.description).toBe('Test description');
      expect(updatedNode?.parentId).toBe('root');
      expect(updatedNode?.isRoot).toBe(false);
      expect(updatedNode?.isDraggable).toBe(true);
    });

    it('should handle multiple position updates', () => {
      const { addNode, updateNodePosition } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'Moving Node',
          description: '',
          position: { x: 0, y: 0 },
        });
      });

      const stateAfterAdd = useWorldTreeStore.getState();
      const movingNode = stateAfterAdd.nodes.find((n) => n.label === 'Moving Node');

      // Multiple updates
      act(() => {
        updateNodePosition(movingNode!.id, { x: 100, y: 100 });
      });

      act(() => {
        updateNodePosition(movingNode!.id, { x: 200, y: 200 });
      });

      act(() => {
        updateNodePosition(movingNode!.id, { x: 300, y: 400 });
      });

      const state = useWorldTreeStore.getState();
      const updatedNode = state.nodes.find((n) => n.id === movingNode!.id);
      expect(updatedNode?.position).toEqual({ x: 300, y: 400 });
    });
  });

  describe('deleteNode', () => {
    it('should delete a non-root node', () => {
      const { addNode, deleteNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'Deletable Node',
          description: '',
          position: { x: 100, y: 100 },
        });
      });

      const stateAfterAdd = useWorldTreeStore.getState();
      const deletableNode = stateAfterAdd.nodes.find(
        (n) => n.label === 'Deletable Node'
      );
      expect(stateAfterAdd.nodes).toHaveLength(2);

      act(() => {
        deleteNode(deletableNode!.id);
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes).toHaveLength(1);
      expect(state.nodes[0].id).toBe('root');
    });

    it('should remove edges connected to deleted node', () => {
      const { addNode, deleteNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'Node with Edge',
          description: '',
          position: { x: 100, y: 100 },
        });
      });

      const stateAfterAdd = useWorldTreeStore.getState();
      expect(stateAfterAdd.edges).toHaveLength(1);

      const nodeToDelete = stateAfterAdd.nodes.find(
        (n) => n.label === 'Node with Edge'
      );

      act(() => {
        deleteNode(nodeToDelete!.id);
      });

      const state = useWorldTreeStore.getState();
      expect(state.edges).toHaveLength(0);
    });

    it('should not delete root node', () => {
      const { deleteNode } = useWorldTreeStore.getState();

      act(() => {
        deleteNode('root');
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes).toHaveLength(1);
      expect(state.nodes[0].id).toBe('root');
      expect(console.warn).toHaveBeenCalledWith('Cannot delete root node');
    });

    it('should warn when trying to delete non-existent node', () => {
      const { deleteNode } = useWorldTreeStore.getState();

      act(() => {
        deleteNode('nonexistent-node');
      });

      expect(console.warn).toHaveBeenCalledWith(
        'Node with id "nonexistent-node" not found'
      );
    });

    it('should remove all edges connected to a middle node', () => {
      const { addNode, deleteNode } = useWorldTreeStore.getState();

      // Create a chain: root -> middle -> leaf
      act(() => {
        addNode('root', {
          label: 'Middle Node',
          description: '',
          position: { x: 100, y: 0 },
        });
      });

      const stateAfterMiddle = useWorldTreeStore.getState();
      const middleNode = stateAfterMiddle.nodes.find(
        (n) => n.label === 'Middle Node'
      );

      act(() => {
        addNode(middleNode!.id, {
          label: 'Leaf Node',
          description: '',
          position: { x: 200, y: 0 },
        });
      });

      const stateBeforeDelete = useWorldTreeStore.getState();
      expect(stateBeforeDelete.edges).toHaveLength(2);

      // Delete the middle node
      act(() => {
        deleteNode(middleNode!.id);
      });

      const state = useWorldTreeStore.getState();
      // Should only have 1 edge remaining (root to nothing, since we only delete the middle node)
      // Actually, the leaf node should still exist, just the edges involving middle node are gone
      expect(state.nodes).toHaveLength(2); // root and leaf
      expect(state.edges).toHaveLength(0); // All edges involving middle node are removed
    });

    it('should preserve other nodes when deleting a specific node', () => {
      const { addNode, deleteNode } = useWorldTreeStore.getState();

      // Add multiple children
      act(() => {
        addNode('root', {
          label: 'Keep Me',
          description: '',
          position: { x: 100, y: 0 },
        });
      });

      act(() => {
        addNode('root', {
          label: 'Delete Me',
          description: '',
          position: { x: 200, y: 0 },
        });
      });

      act(() => {
        addNode('root', {
          label: 'Keep Me Too',
          description: '',
          position: { x: 300, y: 0 },
        });
      });

      const stateAfterAdd = useWorldTreeStore.getState();
      const nodeToDelete = stateAfterAdd.nodes.find(
        (n) => n.label === 'Delete Me'
      );

      act(() => {
        deleteNode(nodeToDelete!.id);
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes).toHaveLength(3); // root + 2 kept nodes

      const labels = state.nodes.map((n) => n.label);
      expect(labels).toContain('World Root');
      expect(labels).toContain('Keep Me');
      expect(labels).toContain('Keep Me Too');
      expect(labels).not.toContain('Delete Me');
    });
  });

  describe('reset', () => {
    it('should reset store to initial state with only root node', () => {
      const { addNode, reset } = useWorldTreeStore.getState();

      // Add some nodes
      act(() => {
        addNode('root', {
          label: 'Node 1',
          description: '',
          position: { x: 100, y: 0 },
        });
      });

      act(() => {
        addNode('root', {
          label: 'Node 2',
          description: '',
          position: { x: 200, y: 0 },
        });
      });

      const stateBeforeReset = useWorldTreeStore.getState();
      expect(stateBeforeReset.nodes).toHaveLength(3);
      expect(stateBeforeReset.edges).toHaveLength(2);

      // Reset
      act(() => {
        reset();
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes).toHaveLength(1);
      expect(state.nodes[0].id).toBe('root');
      expect(state.nodes[0].label).toBe('World Root');
      expect(state.edges).toHaveLength(0);
    });

    it('should reset root node to default values', () => {
      const { reset } = useWorldTreeStore.getState();

      act(() => {
        reset();
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes[0]).toMatchObject({
        id: 'root',
        label: 'World Root',
        description: '',
        position: { x: 0, y: 0 },
        parentId: null,
        isRoot: true,
        isDraggable: false,
      });
    });
  });

  describe('createRootNode', () => {
    it('should create a new root node with custom label', () => {
      const { createRootNode } = useWorldTreeStore.getState();

      act(() => {
        createRootNode({
          label: 'My Custom World',
          description: 'A fantasy world',
        });
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes).toHaveLength(1);
      expect(state.nodes[0].label).toBe('My Custom World');
      expect(state.nodes[0].description).toBe('A fantasy world');
    });

    it('should preserve root node properties when creating custom root', () => {
      const { createRootNode } = useWorldTreeStore.getState();

      act(() => {
        createRootNode({
          label: 'Custom Root',
          description: 'Custom description',
        });
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes[0]).toMatchObject({
        id: 'root',
        position: { x: 0, y: 0 },
        parentId: null,
        isRoot: true,
        isDraggable: false,
      });
    });

    it('should clear all existing nodes and edges when creating custom root', () => {
      const { addNode, createRootNode } = useWorldTreeStore.getState();

      // Add some nodes first
      act(() => {
        addNode('root', {
          label: 'Child 1',
          description: '',
          position: { x: 100, y: 0 },
        });
      });

      act(() => {
        addNode('root', {
          label: 'Child 2',
          description: '',
          position: { x: 200, y: 0 },
        });
      });

      const stateBeforeCreate = useWorldTreeStore.getState();
      expect(stateBeforeCreate.nodes).toHaveLength(3);
      expect(stateBeforeCreate.edges).toHaveLength(2);

      // Create new custom root
      act(() => {
        createRootNode({
          label: 'New World',
          description: 'Starting fresh',
        });
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes).toHaveLength(1);
      expect(state.nodes[0].label).toBe('New World');
      expect(state.edges).toHaveLength(0);
    });

    it('should allow adding children to custom root node', () => {
      const { createRootNode, addNode } = useWorldTreeStore.getState();

      act(() => {
        createRootNode({
          label: 'Custom World',
          description: '',
        });
      });

      act(() => {
        addNode('root', {
          label: 'Child of Custom',
          description: '',
          position: { x: 100, y: 100 },
        });
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes).toHaveLength(2);
      expect(state.edges).toHaveLength(1);

      const childNode = state.nodes.find((n) => n.label === 'Child of Custom');
      expect(childNode?.parentId).toBe('root');
    });
  });

  describe('State Immutability', () => {
    it('should return new nodes array reference on add', () => {
      const stateBefore = useWorldTreeStore.getState();
      const nodesBefore = stateBefore.nodes;

      const { addNode } = stateBefore;

      act(() => {
        addNode('root', {
          label: 'New Node',
          description: '',
          position: { x: 0, y: 0 },
        });
      });

      const stateAfter = useWorldTreeStore.getState();
      expect(stateAfter.nodes).not.toBe(nodesBefore);
    });

    it('should return new edges array reference on add', () => {
      const stateBefore = useWorldTreeStore.getState();
      const edgesBefore = stateBefore.edges;

      const { addNode } = stateBefore;

      act(() => {
        addNode('root', {
          label: 'New Node',
          description: '',
          position: { x: 0, y: 0 },
        });
      });

      const stateAfter = useWorldTreeStore.getState();
      expect(stateAfter.edges).not.toBe(edgesBefore);
    });

    it('should return new nodes array reference on delete', () => {
      const { addNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'To Delete',
          description: '',
          position: { x: 0, y: 0 },
        });
      });

      const stateBefore = useWorldTreeStore.getState();
      const nodesBefore = stateBefore.nodes;
      const nodeToDelete = nodesBefore.find((n) => n.label === 'To Delete');

      const { deleteNode } = stateBefore;

      act(() => {
        deleteNode(nodeToDelete!.id);
      });

      const stateAfter = useWorldTreeStore.getState();
      expect(stateAfter.nodes).not.toBe(nodesBefore);
    });
  });

  describe('Edge Cases', () => {
    it('should handle adding node with empty strings', () => {
      const { addNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: '',
          description: '',
          position: { x: 0, y: 0 },
        });
      });

      const state = useWorldTreeStore.getState();
      expect(state.nodes).toHaveLength(2);

      const emptyNode = state.nodes.find((n) => n.label === '');
      expect(emptyNode).toBeDefined();
    });

    it('should handle negative position values', () => {
      const { addNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'Negative Position',
          description: '',
          position: { x: -100, y: -200 },
        });
      });

      const state = useWorldTreeStore.getState();
      const node = state.nodes.find((n) => n.label === 'Negative Position');
      expect(node?.position).toEqual({ x: -100, y: -200 });
    });

    it('should handle very large position values', () => {
      const { addNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'Large Position',
          description: '',
          position: { x: 999999, y: 999999 },
        });
      });

      const state = useWorldTreeStore.getState();
      const node = state.nodes.find((n) => n.label === 'Large Position');
      expect(node?.position).toEqual({ x: 999999, y: 999999 });
    });

    it('should handle decimal position values', () => {
      const { addNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: 'Decimal Position',
          description: '',
          position: { x: 100.5, y: 200.75 },
        });
      });

      const state = useWorldTreeStore.getState();
      const node = state.nodes.find((n) => n.label === 'Decimal Position');
      expect(node?.position).toEqual({ x: 100.5, y: 200.75 });
    });

    it('should handle special characters in label and description', () => {
      const { addNode } = useWorldTreeStore.getState();

      act(() => {
        addNode('root', {
          label: '特殊文字 <script>alert("XSS")</script>',
          description: 'Description with "quotes" and \'apostrophes\'',
          position: { x: 0, y: 0 },
        });
      });

      const state = useWorldTreeStore.getState();
      const node = state.nodes.find((n) =>
        n.label.includes('特殊文字')
      );
      expect(node).toBeDefined();
      expect(node?.label).toBe('特殊文字 <script>alert("XSS")</script>');
    });
  });

  describe('Store Actions Availability', () => {
    it('should have all expected actions available', () => {
      const state = useWorldTreeStore.getState();

      expect(typeof state.addNode).toBe('function');
      expect(typeof state.updateNodePosition).toBe('function');
      expect(typeof state.deleteNode).toBe('function');
      expect(typeof state.reset).toBe('function');
      expect(typeof state.createRootNode).toBe('function');
    });
  });
});
