import React, { useState } from 'react';
import { X, Maximize2, Minimize2, GripVertical } from 'lucide-react';

const WidgetWrapper = ({ id, title, onRemove, children }) => {
  const [maximized, setMaximized] = useState(false);

  return (
    <div className={`widget-wrapper ${maximized ? 'maximized' : ''}`}>
      <div className="widget-drag-handle drag-handle">
        <GripVertical size={14} className="grip-icon" />
      </div>
      <div className="widget-controls">
        <button className="widget-ctrl-btn" onClick={() => setMaximized(m => !m)} title={maximized ? 'Restore' : 'Maximize'}>
          {maximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>
        <button className="widget-ctrl-btn remove" onClick={() => onRemove(id)} title="Remove widget">
          <X size={12} />
        </button>
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

export default WidgetWrapper;
