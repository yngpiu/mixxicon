import { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { useDebounce } from 'use-debounce';
import './App.css';
import type { Icon } from './lib/types';
import { formatCollectionName } from './lib/utils';
import { AppHeader } from './components/Header';
import { IconGrid } from './components/IconGrid';
import { IconDetailModal } from './components/IconModal';

function App() {
  const [allIcons, setAllIcons] = useState<Icon[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [query] = useDebounce(text, 200);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = selectedCollection
      ? `Mixxicon - ${formatCollectionName(selectedCollection)}`
      : 'Mixxicon';
  }, [selectedCollection]);

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
  };

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
  };

  return (
    <div className="app">
      <AppHeader
        collections={collections}
        selectedCollection={selectedCollection}
        handleCollectionChange={handleCollectionChange}
        text={text}
        setText={setText}
        isLoading={isLoading}
        styles={styles}
        selectedStyle={selectedStyle}
        handleStyleChange={handleStyleChange}
        formatCollectionName={formatCollectionName}
      />
      <main className="main">
        <div className="content">
          <div className="results-info">{filteredIcons.length} Icons</div>
          <IconGrid
            icons={filteredIcons}
            onIconClick={handleIconClick}
            isLoading={isLoading}
          />
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
