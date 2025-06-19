import { useState, useCallback, useEffect } from 'react';
import type { Icon } from '../lib/types';

export function IconDetailModal({
  icon,
  onClose,
}: {
  icon: Icon;
  onClose: () => void;
}) {
  const [copyStatus, setCopyStatus] = useState<'Copy SVG' | 'Copied!'>(
    'Copy SVG'
  );

  const handleCopySvg = useCallback(() => {
    navigator.clipboard.writeText(icon.content);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy SVG'), 1500);
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
          <button onClick={handleCopySvg}>{copyStatus}</button>
          <button onClick={downloadSvg} className="btn-download">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
