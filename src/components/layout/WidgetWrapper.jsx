import { useState, memo, useCallback } from 'react';
import { X, Maximize2, Minimize2, GripVertical } from 'lucide-react';

const WidgetWrapper = memo(({ id, title, onRemove, children }) => {
  const [maximized, setMaximized] = useState(false);

  const toggleMax  = useCallback(() => setMaximized((m) => !m), []);
  const handleRemove = useCallback(() => onRemove(id), [onRemove, id]);

  return (
    <div
      className={
        /* Base — always applied */
        'relative h-full flex flex-col ' +
        'bg-[var(--surface)] border border-[var(--border)] rounded-[16px] overflow-hidden ' +
        'transition-[border-color,box-shadow] duration-200 ' +
        'shadow-[0_2px_12px_rgba(0,0,0,0.3)] ' +
        'hover:border-[var(--border-hover)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] ' +
        /* group — enables group-hover: on children */
        'group ' +
        /* Maximized override */
        (maximized ? 'fixed inset-3 z-[1000] !shadow-[0_8px_40px_rgba(0,0,0,0.5)]' : '')
      }
      role="region"
      aria-label={title}
    >
      {/* Drag handle — hidden until parent hover via group-hover */}
      <div
        className="drag-handle absolute top-2 left-1/2 -translate-x-1/2
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   cursor-grab text-[var(--text-muted)] z-[10]"
        title="Drag to reposition"
        aria-hidden="true"
      >
        <GripVertical size={14} />
      </div>

      {/* Controls — hidden until parent hover */}
      <div
        className="absolute top-[6px] right-2 flex gap-1
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[10]"
        role="group"
        aria-label={`${title} controls`}
      >
        <button
          className="w-[22px] h-[22px] flex items-center justify-center rounded-[5px]
                     text-[var(--text-muted)] transition-all duration-150
                     hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
          onClick={toggleMax}
          aria-label={maximized ? 'Restore widget' : 'Maximize widget'}
          aria-pressed={maximized}
        >
          {maximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>
        <button
          className="w-[22px] h-[22px] flex items-center justify-center rounded-[5px]
                     text-[var(--text-muted)] transition-all duration-150
                     hover:bg-red-500/[.15] hover:text-red-400"
          onClick={handleRemove}
          aria-label={`Remove ${title} widget`}
        >
          <X size={12} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
});

WidgetWrapper.displayName = 'WidgetWrapper';
export default WidgetWrapper;
