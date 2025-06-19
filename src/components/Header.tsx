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
  return (
    <header className="header">
      <div className="header-content">
        <div className="top-row">
          <div className="search-section">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Search in ${formatCollectionName(
                selectedCollection
              )}...`}
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
                    {formatCollectionName(c)}
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
  );
}
