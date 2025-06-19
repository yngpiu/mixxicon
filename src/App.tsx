import { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import './App.css';

type Icon = {
  name: string;
  category: string;
  style: string;
  path: string;
  content: string;
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
    setTimeout(() => setCopied(false), 1500);
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
          <h2 className="modal-title">{icon.name}</h2>
          <button onClick={onClose} className="close-button">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div
            className="modal-icon-preview"
            dangerouslySetInnerHTML={{ __html: icon.content }}
          />
        </div>
        <div className="modal-footer">
          <button onClick={copySvg}>{copied ? 'Copied!' : 'Copy SVG'}</button>
          <button onClick={downloadSvg}>Download SVG</button>
        </div>
      </div>
    </div>
  );
}

function IconCard({ icon, onClick }: { icon: Icon; onClick: () => void }) {
  return (
    <div className="icon-card" onClick={onClick}>
      <div
        className="icon-preview"
        dangerouslySetInnerHTML={{ __html: icon.content }}
      />
      <p className="icon-name">{icon.name}</p>
    </div>
  );
}

function App() {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [query, setQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);

  useEffect(() => {
    fetch('/icons.json')
      .then(res => res.json())
      .then(setIcons);
  }, []);

  const styles = useMemo(() => ['all', 'bulk', 'outline', 'solid'], []);

  const fuse = useMemo(
    () =>
      new Fuse(icons, {
        keys: ['name', 'category'],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [icons]
  );

  const filteredIcons = useMemo(() => {
    let results = icons;
    if (query) {
      results = fuse.search(query).map(r => r.item);
    }
    if (selectedStyle !== 'all') {
      results = results.filter(icon => icon.style === selectedStyle);
    }
    return results;
  }, [query, icons, fuse, selectedStyle]);

  const groupedIcons = useMemo(() => {
    return filteredIcons.reduce<Record<string, Icon[]>>((acc, icon) => {
      const { category } = icon;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(icon);
      return acc;
    }, {});
  }, [filteredIcons]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Icon Library</h1>
        <div className="filters">
          <div className="styles-filter">
            {styles.map(style => (
              <button
                key={style}
                className={`filter-button ${
                  selectedStyle === style ? 'active' : ''
                }`}
                onClick={() => setSelectedStyle(style)}
              >
                {style}
              </button>
            ))}
          </div>
          <div className="search-container">
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search ${icons.length} icons...`}
              className="search-input"
            />
          </div>
        </div>
      </header>
      <main className="main-content">
        {Object.entries(groupedIcons).map(([category, icons]) => (
          <section key={category} className="category-section">
            <div className="category-header">
              <h2 className="category-title">{category}</h2>
              <span className="category-count">{icons.length}</span>
            </div>
            <div className="icons-grid">
              {icons.map(icon => (
                <IconCard
                  key={icon.path}
                  icon={icon}
                  onClick={() => setSelectedIcon(icon)}
                />
              ))}
            </div>
          </section>
        ))}
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
