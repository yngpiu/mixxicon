import { useState, useEffect, useMemo, useCallback, memo } from 'react';
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

const IconGrid = memo(function IconGrid({
  icons,
  onIconClick,
}: {
  icons: Icon[];
  onIconClick: (icon: Icon) => void;
}) {
  if (icons.length === 0) {
    return (
      <div className="empty-state">
        <p>No icons found</p>
      </div>
    );
  }

  return (
    <div className="icons-container">
      {icons.map(icon => (
        <IconCard
          key={icon.path}
          icon={icon}
          onClick={() => onIconClick(icon)}
        />
      ))}
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
          setSelectedCollection(manifest.collections[0]); // Select the first collection by default
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

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Icons</h1>
          <div className="controls">
            <div className="search-box">
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Search in ${selectedCollection}...`}
                className="search-input"
                disabled={isLoading}
              />
            </div>
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
            <div className="style-filter">
              {styles.map(style => (
                <button
                  key={style}
                  className={selectedStyle === style ? 'active' : ''}
                  onClick={() => setSelectedStyle(style)}
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
            <IconGrid icons={filteredIcons} onIconClick={handleIconClick} />
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
