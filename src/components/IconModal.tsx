import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { Icon } from '../lib/types';

const SIZES = [16, 24, 32, 48, 64, 80, 128];

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
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<number | null>(80);
  const [isColorChangeable, setIsColorChangeable] = useState(false);
  const [isSizeSelectorOpen, setSizeSelectorOpen] = useState(false);
  const [isColorPickerOpen, setColorPickerOpen] = useState(false);

  const sizeSelectorRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (icon.content) {
      const fillCount = (icon.content.match(/fill="/g) || []).length;
      setIsColorChangeable(fillCount <= 1);
      setColor(null);
    }
  }, [icon.content]);

  const modifiedSvg = useMemo(() => {
    if (!icon.content) return '';
    let svgString = icon.content;
    const fillCount = (icon.content.match(/fill="/g) || []).length;

    if (isColorChangeable && fillCount === 1) {
      const fillValue = color === null ? 'currentColor' : color;
      svgString = svgString.replace(/fill="[^"]*"/, `fill="${fillValue}"`);
    }

    const svgTagRegex = /<svg[^>]*>/;
    const svgTagMatch = svgString.match(svgTagRegex);

    if (svgTagMatch) {
      let svgTag = svgTagMatch[0];
      const attrsToSet: { [key: string]: string | number } = {};

      if (size !== null) {
        attrsToSet.width = size;
        attrsToSet.height = size;
      }

      if (isColorChangeable && fillCount === 0) {
        attrsToSet.fill = color === null ? 'currentColor' : color;
      }

      svgTag = svgTag
        .replace(/ width="[^"]*"/, '')
        .replace(/ height="[^"]*"/, '');
      if (attrsToSet.fill) {
        svgTag = svgTag.replace(/ fill="[^"]*"/, '');
      }

      const attrsString = Object.entries(attrsToSet)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

      if (attrsString) {
        if (svgTag.endsWith('/>')) {
          svgTag = svgTag.slice(0, -2) + ' ' + attrsString + ' />';
        } else {
          svgTag = svgTag.slice(0, -1) + ' ' + attrsString + '>';
        }
      }

      svgString = svgString.replace(svgTagRegex, svgTag);
    }

    return svgString;
  }, [icon.content, size, color, isColorChangeable]);

  const handleCopySvg = useCallback(() => {
    navigator.clipboard.writeText(modifiedSvg);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy SVG'), 1500);
  }, [modifiedSvg]);

  const downloadSvg = useCallback(() => {
    const blob = new Blob([modifiedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${icon.name}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [modifiedSvg, icon.name]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sizeSelectorRef.current &&
        !sizeSelectorRef.current.contains(event.target as Node)
      ) {
        setSizeSelectorOpen(false);
      }
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setColorPickerOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
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
            style={{ width: size ?? 128, height: size ?? 128 }}
            dangerouslySetInnerHTML={{ __html: modifiedSvg }}
          />
        </div>
        <div className="modal-controls">
          {isColorChangeable && (
            <div className="control-group" ref={colorPickerRef}>
              <button
                className="color-swatch"
                onClick={() => setColorPickerOpen(!isColorPickerOpen)}
                style={{
                  backgroundColor: color ?? '#fff',
                  border:
                    color === null ? '1px dashed #999' : `1px solid ${color}`,
                }}
              ></button>
              {isColorPickerOpen && (
                <div className="color-picker-popover">
                  <HexColorPicker
                    color={color ?? '#000000'}
                    onChange={setColor}
                  />
                </div>
              )}
            </div>
          )}
          <div className="control-group" ref={sizeSelectorRef}>
            <button
              className="size-btn"
              onClick={() => setSizeSelectorOpen(!isSizeSelectorOpen)}
            >
              Size: {size !== null ? `${size}px` : 'Default'}
            </button>
            {isSizeSelectorOpen && (
              <div className="size-selector">
                <div
                  className="size-option"
                  onClick={() => {
                    setSize(null);
                    setSizeSelectorOpen(false);
                  }}
                >
                  Default
                </div>
                {SIZES.map(s => (
                  <div
                    key={s}
                    className="size-option"
                    onClick={() => {
                      setSize(s);
                      setSizeSelectorOpen(false);
                    }}
                  >
                    {s}px
                  </div>
                ))}
              </div>
            )}
          </div>
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
