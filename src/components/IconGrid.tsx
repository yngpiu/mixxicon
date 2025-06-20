import { memo, useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Icon } from '../lib/types';

function IconCard({ icon, onClick }: { icon: Icon; onClick: () => void }) {
  return (
    <div className="icon-item" onClick={onClick}>
      <div
        className="icon-svg"
        dangerouslySetInnerHTML={{ __html: icon.content }}
      />
      <span className="icon-label">{icon.name}</span>
    </div>
  );
}

interface IconGridProps {
  icons: Icon[];
  onIconClick: (icon: Icon) => void;
  isLoading: boolean;
}

export const IconGrid = memo(function VirtualizedIconGrid({
  icons,
  onIconClick,
  isLoading,
}: IconGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Simple calculation with fixed assumptions for virtualization
  const [containerWidth, setContainerWidth] = useState(1400);
  const ESTIMATED_ITEM_SIZE = 120; // Used only for virtualization estimation

  useEffect(() => {
    const updateWidth = () => {
      if (parentRef.current) {
        setContainerWidth(parentRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const estimatedItemsPerRow =
    Math.floor(containerWidth / ESTIMATED_ITEM_SIZE) || 1;
  const totalRows = Math.ceil(icons.length / estimatedItemsPerRow);

  const virtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ITEM_SIZE,
    overscan: 5, // Render 5 extra rows for smooth scrolling
  });

  if (isLoading) {
    return (
      <div className="empty-state">
        <p>Loading icons...</p>
      </div>
    );
  }

  if (icons.length === 0) {
    return (
      <div className="empty-state">
        <p>No icons found</p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="virtual-container">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => {
          const startIndex = virtualRow.index * estimatedItemsPerRow;
          const endIndex = Math.min(
            startIndex + estimatedItemsPerRow,
            icons.length
          );
          const rowIcons = icons.slice(startIndex, endIndex);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="virtual-row">
                {rowIcons.map(icon => (
                  <IconCard
                    key={icon.path}
                    icon={icon}
                    onClick={() => onIconClick(icon)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
