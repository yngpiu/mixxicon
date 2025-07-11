import { useState, useRef, useEffect } from 'react';

interface AppHeaderProps {
  collections: string[];
  selectedCollection: string;
  handleCollectionChange: (collection: string) => void;
  text: string;
  setText: (text: string) => void;
  isLoading: boolean;
  styles: string[];
  selectedStyle: string;
  handleStyleChange: (style: string) => void;
  formatCollectionName: (name: string) => string;
}

export function AppHeader({
  collections,
  selectedCollection,
  handleCollectionChange,
  text,
  setText,
  isLoading,
  styles,
  selectedStyle,
  handleStyleChange,
  formatCollectionName,
}: AppHeaderProps) {
  const [isCollectionSelectorOpen, setCollectionSelectorOpen] = useState(false);
  const collectionSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        collectionSelectorRef.current &&
        !collectionSelectorRef.current.contains(event.target as Node)
      ) {
        setCollectionSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div className="top-row">
          <div className="search-section">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Search in ${formatCollectionName(
                  selectedCollection
                )}...`}
                className="search-input"
                disabled={isLoading}
              />
              {text && (
                <button
                  onClick={() => setText('')}
                  className="clear-search-btn"
                  aria-label="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="20"
                    height="20"
                  >
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="collection-section">
            <div className="collection-filter" ref={collectionSelectorRef}>
              <button
                className="collection-btn"
                onClick={() =>
                  setCollectionSelectorOpen(!isCollectionSelectorOpen)
                }
                disabled={collections.length === 0}
              >
                <span>{formatCollectionName(selectedCollection)}</span>
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`dropdown-arrow ${
                    isCollectionSelectorOpen ? 'open' : ''
                  }`}
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
              {isCollectionSelectorOpen && (
                <div className="collection-selector">
                  {collections.map((c) => (
                    <div
                      key={c}
                      className="collection-option"
                      onClick={() => {
                        handleCollectionChange(c);
                        setCollectionSelectorOpen(false);
                      }}
                    >
                      {formatCollectionName(c)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="style-row">
          <div className="style-filter">
            {styles.map((style) => (
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
  );
}
