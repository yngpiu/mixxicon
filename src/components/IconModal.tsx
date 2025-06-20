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
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(80);
  const [isSizeSelectorOpen, setSizeSelectorOpen] = useState(false);
  const [isColorPickerOpen, setColorPickerOpen] = useState(false);

  const sizeSelectorRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const modifiedSvg = useMemo(() => {
    if (!icon.content) return '';
    let svgString = icon.content;

    const svgTagRegex = /<svg[^>]*>/;
    const svgTagMatch = svgString.match(svgTagRegex);

    if (svgTagMatch) {
      let svgTag = svgTagMatch[0];

      const attributes = {
        width: size,
        height: size,
        fill: color,
      };

      for (const [attr, value] of Object.entries(attributes)) {
        const attrRegex = new RegExp(`${attr}="[^"]*"`);
        if (attrRegex.test(svgTag)) {
          svgTag = svgTag.replace(attrRegex, `${attr}="${value}"`);
        } else {
          svgTag = svgTag.replace('>', ` ${attr}="${value}">`);
        }
      }
      svgString = svgString.replace(svgTagRegex, svgTag);
    }
    return svgString;
  }, [icon.content, size, color]);

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
            style={{ width: size, height: size }}
            dangerouslySetInnerHTML={{ __html: modifiedSvg }}
          />
        </div>
        <div className="modal-controls">
          <div className="control-group" ref={colorPickerRef}>
            <button
              className="color-swatch"
              onClick={() => setColorPickerOpen(!isColorPickerOpen)}
              style={{ backgroundColor: color }}
            ></button>
            {isColorPickerOpen && (
              <div className="color-picker-popover">
                <HexColorPicker color={color} onChange={setColor} />
              </div>
            )}
          </div>
          <div className="control-group" ref={sizeSelectorRef}>
            <button
              className="size-btn"
              onClick={() => setSizeSelectorOpen(!isSizeSelectorOpen)}
            >
              Size: {size}px
            </button>
            {isSizeSelectorOpen && (
              <div className="size-selector">
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
