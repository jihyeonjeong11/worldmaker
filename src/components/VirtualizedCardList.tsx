/**
 * VirtualizedCardList Component
 *
 * A reusable virtualized list wrapper using react-window v2.
 * Provides efficient rendering for large lists of cards.
 *
 * @example
 * ```tsx
 * <VirtualizedCardList
 *   items={cards}
 *   itemHeight={90}
 *   renderItem={(card, index, style) => (
 *     <div style={style}>
 *       <SortableCard card={card} />
 *     </div>
 *   )}
 * />
 * ```
 */
import { useRef, type CSSProperties, type ReactNode, type ReactElement } from 'react';
import { List, type ListImperativeAPI } from 'react-window';

/**
 * Props for items with variable heights
 */
export interface VariableHeightItemProps<T> {
  /** Item data */
  item: T;
  /** Index in the list */
  index: number;
}

/**
 * Props for the VirtualizedCardList component with fixed item sizes
 */
export interface VirtualizedFixedListProps<T> {
  /** Items to render */
  items: T[];
  /** Fixed height for each item in pixels */
  itemHeight: number;
  /** Container height (defaults to 100% via CSS) */
  height?: number;
  /** Container width (defaults to 100%) */
  width?: string | number;
  /** Render function for each item */
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
  /** Number of items to render outside visible area */
  overscanCount?: number;
  /** CSS class for the container */
  className?: string;
  /** Gap between items in pixels */
  itemGap?: number;
  /** Unique key extractor */
  getItemKey?: (item: T, index: number) => string;
  /** Test ID for the container */
  testId?: string;
}

/**
 * Props for the VirtualizedCardList component with variable item sizes
 */
export interface VirtualizedVariableListProps<T> {
  /** Items to render */
  items: T[];
  /** Function to get height for each item */
  getItemHeight: (index: number) => number;
  /** Container height (defaults to 100% via CSS) */
  height?: number;
  /** Container width (defaults to 100%) */
  width?: string | number;
  /** Render function for each item */
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
  /** Number of items to render outside visible area */
  overscanCount?: number;
  /** CSS class for the container */
  className?: string;
  /** Unique key extractor */
  getItemKey?: (item: T, index: number) => string;
  /** Test ID for the container */
  testId?: string;
  /** Callback when heights need to be recalculated */
  onHeightChange?: () => void;
}

/**
 * Row data type for react-window v2 List component (passed as rowProps)
 * This is the data we pass, react-window adds ariaAttributes, index, and style
 */
interface RowData<T> {
  items: T[];
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
  itemHeight: number;
  itemGap: number;
}

/**
 * Row component for fixed height list
 * Note: In react-window v2, rowProps are spread directly into the component
 * along with ariaAttributes, index, and style added by react-window
 */
function FixedHeightRow<T>(
  props: RowData<T> & { index: number; style: CSSProperties }
): ReactElement | null {
  const { index, style, items, renderItem, itemHeight, itemGap } = props;
  const item = items[index];
  if (!item) return null;

  // Adjust style to account for gap
  const adjustedStyle: CSSProperties = {
    ...style,
    height: itemHeight,
    paddingTop: itemGap / 2,
    paddingBottom: itemGap / 2,
    boxSizing: 'border-box',
  };

  return <>{renderItem(item, index, adjustedStyle)}</>;
}

/**
 * VirtualizedFixedList - A virtualized list with fixed item heights
 *
 * Uses react-window v2's List component for optimal performance
 * when all items have the same height.
 */
export function VirtualizedFixedList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscanCount = 5,
  className = '',
  itemGap = 8,
  testId,
}: VirtualizedFixedListProps<T>): JSX.Element {
  const listRef = useRef<ListImperativeAPI | null>(null);

  // Calculate the actual item height including gap
  const itemSize = itemHeight + itemGap;

  // Determine container height
  const containerHeight = height ?? 400;

  // Row data to pass to the row component (spread as props in v2)
  const rowData: RowData<T> = {
    items,
    renderItem,
    itemHeight,
    itemGap,
  };

  return (
    <div
      className={className}
      data-testid={testId}
      style={{ height: containerHeight, width: '100%' }}
    >
      <List<RowData<T>>
        listRef={(ref) => { listRef.current = ref; }}
        defaultHeight={containerHeight}
        rowCount={items.length}
        rowHeight={itemSize}
        overscanCount={overscanCount}
        rowComponent={FixedHeightRow<T>}
        rowProps={rowData}
      />
    </div>
  );
}

/**
 * Row data type for variable height list
 */
interface VariableRowData<T> {
  items: T[];
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
}

/**
 * Row component for variable height list
 */
function VariableHeightRow<T>(
  props: VariableRowData<T> & { index: number; style: CSSProperties }
): ReactElement | null {
  const { index, style, items, renderItem } = props;
  const item = items[index];
  if (!item) return null;

  return <>{renderItem(item, index, style)}</>;
}

/**
 * VirtualizedVariableList - A virtualized list with variable item heights
 *
 * Uses react-window v2's List component with dynamic height for lists where
 * items have different heights.
 */
export function VirtualizedVariableList<T>({
  items,
  getItemHeight,
  height,
  renderItem,
  overscanCount = 5,
  className = '',
  testId,
}: VirtualizedVariableListProps<T>): JSX.Element {
  const listRef = useRef<ListImperativeAPI | null>(null);

  // Determine container height
  const containerHeight = height ?? 400;

  // Row data to pass to the row component
  const rowData: VariableRowData<T> = {
    items,
    renderItem,
  };

  return (
    <div
      className={className}
      data-testid={testId}
      style={{ height: containerHeight, width: '100%' }}
    >
      <List<VariableRowData<T>>
        listRef={(ref) => { listRef.current = ref; }}
        defaultHeight={containerHeight}
        rowCount={items.length}
        rowHeight={getItemHeight}
        overscanCount={overscanCount}
        rowComponent={VariableHeightRow<T>}
        rowProps={rowData}
      />
    </div>
  );
}

/**
 * Export list ref type for external control
 */
export type VirtualizedListRef = ListImperativeAPI;

export default VirtualizedFixedList;
