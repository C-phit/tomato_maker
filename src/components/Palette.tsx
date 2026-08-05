import { useDraggable } from '@dnd-kit/core';
import type { ModuleType } from '../types';

export const Palette = () => {
  return (
    <div className="palette-container">
      <h3 className="palette-title">拡張モジュール</h3>
      <div className="palette-items">
        <DraggableItem id="palette-3-hole" type="3-hole" label="3つ穴" />
        <DraggableItem id="palette-2-hole" type="2-hole" label="2つ穴" />
      </div>
      <p className="palette-hint">ドラッグして真ん中の穴にドロップ！</p>
    </div>
  );
};

interface DraggableItemProps {
  id: string;
  type: ModuleType;
  label: string;
}

const DraggableItem = ({ id, type, label }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`palette-item ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className={`palette-preview ${type}`}>
        <div className="hole-preview"></div>
        <div className="hole-preview"></div>
        {type === '3-hole' && <div className="hole-preview"></div>}
      </div>
      <span>{label}</span>
    </div>
  );
};
