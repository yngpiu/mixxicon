import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Fuse from 'fuse.js';
import { useDebounce } from 'use-debounce';
import './App.css';

type Icon = {
  name: string;
  category: string;
  style: string;
  path: string;
  content: string;
  collection: string;
};

function IconDetailModal({
  icon,
  onClose,
}: {
  icon: Icon;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copySvg = useCallback(() => {
    navigator.clipboard.writeText(icon.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [icon.content]);

  const downloadSvg = useCallback(() => {
    const blob = new Blob([icon.content], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${icon.name}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [icon.content, icon.name]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{icon.name}</h3>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>
        <div className="modal-preview">
          <div
            className="icon-large"
            dangerouslySetInnerHTML={{ __html: icon.content }}
          />
        </div>
        <div className="modal-actions">
          <button onClick={copySvg} className="btn-copy">
            {copied ? 'Copied!' : 'Copy SVG'}
          </button>
          <button onClick={downloadSvg} className="btn-download">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

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

const VirtualizedIconGrid = memo(function VirtualizedIconGrid({
  icons,
  onIconClick,
}: {
  icons: Icon[];
  onIconClick: (icon: Icon) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate how many items per row based on container width
  const ITEM_WIDTH = 120; // Exact width of each icon item
  const ITEM_HEIGHT = 120; // Same as width for square items

  const [containerWidth, setContainerWidth] = useState(1400);

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

  const itemsPerRow = Math.floor(containerWidth / ITEM_WIDTH);
  const totalRows = Math.ceil(icons.length / itemsPerRow);

  const virtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5, // Render 5 extra rows for smooth scrolling
  });

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
          const startIndex = virtualRow.index * itemsPerRow;
          const endIndex = Math.min(startIndex + itemsPerRow, icons.length);
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
              <div
                className="virtual-row"
                style={{ gridTemplateColumns: `repeat(${itemsPerRow}, 120px)` }}
              >
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

function App() {
  const [allIcons, setAllIcons] = useState<Icon[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [query] = useDebounce(text, 300);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/icons/manifest.json')
      .then(res => res.json())
      .then(manifest => {
        setCollections(manifest.collections);
        if (manifest.collections.length > 0) {
          setSelectedCollection(manifest.collections[0]);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedCollection) return;

    setIsLoading(true);

    fetch(`/icons/${selectedCollection}.json`)
      .then(res => res.json())
      .then(data => {
        setAllIcons(data);
        setIsLoading(false);
      });
  }, [selectedCollection]);

  const styles = useMemo(() => {
    const availableStyles = allIcons.map(i => i.style);
    return ['all', ...Array.from(new Set(availableStyles))].sort();
  }, [allIcons]);

  const filteredIcons = useMemo(() => {
    let results = allIcons;

    if (query) {
      const fuse = new Fuse(allIcons, { keys: ['name'], threshold: 0.3 });
      results = fuse.search(query).map(r => r.item);
    }

    if (selectedStyle !== 'all') {
      results = results.filter(icon => icon.style === selectedStyle);
    }

    return results;
  }, [query, allIcons, selectedStyle]);

  const handleIconClick = useCallback((icon: Icon) => {
    setSelectedIcon(icon);
  }, []);

  const handleCollectionChange = (collection: string) => {
    setSelectedCollection(collection);
    setSelectedStyle('all');
    setText('');
  };

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="top-row">
            <div className="search-section">
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Search in ${selectedCollection}...`}
                className="search-input"
                disabled={isLoading}
              />
            </div>

            <div className="collection-section">
              <div className="collection-filter">
                <select
                  onChange={e => handleCollectionChange(e.target.value)}
                  value={selectedCollection}
                  disabled={collections.length === 0}
                >
                  {collections.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="style-row">
            <div className="style-filter">
              {styles.map(style => (
                <button
                  key={style}
                  className={selectedStyle === style ? 'active' : ''}
                  onClick={() => handleStyleChange(style)}
                  disabled={isLoading}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="content">
          <div className="results-info">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <span>{filteredIcons.length} icons</span>
            )}
          </div>
          {isLoading ? (
            <div className="empty-state">
              <p>Loading icons...</p>
            </div>
          ) : (
            <VirtualizedIconGrid
              icons={filteredIcons}
              onIconClick={handleIconClick}
            />
          )}
        </div>
      </main>

      {selectedIcon && (
        <IconDetailModal
          icon={selectedIcon}
          onClose={() => setSelectedIcon(null)}
        />
      )}
    </div>
  );
}

export default App;
