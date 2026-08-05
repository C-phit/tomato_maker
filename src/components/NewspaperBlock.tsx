import { useDroppable } from '@dnd-kit/core';
import type { ModuleNode, Module3Hole } from '../types';

interface NewspaperBlockProps {
  node: ModuleNode;
  ghostNode?: ModuleNode;
  onChange: (newNode: ModuleNode) => void;
  onDelete?: () => void;
  isRoot?: boolean;
  isValid?: boolean;
  isCompleted?: boolean;
}

// ひらがな、カタカナ、長音記号のみ許可
const isValidInput = (val: string) => /^[ぁ-んァ-ヶー]*$/.test(val);

export const NewspaperBlock = ({ node, ghostNode, onChange, onDelete, isRoot = false, isValid = false, isCompleted = false }: NewspaperBlockProps) => {
  const is3Hole = node.type === '3-hole';

  let blockClass = `newspaper-block ${isRoot ? 'is-root animate-fade-in' : 'is-nested'}`;
  if (isRoot && isCompleted) {
    blockClass += isValid ? ' is-valid' : ' is-invalid';
  }

  const handleChange = (field: 'left' | 'right' | 'center', value: string) => {
    const lastChar = value.slice(-1);
    if (!isValidInput(lastChar)) return;
    onChange({ ...node, [field]: lastChar } as ModuleNode);
  };

  return (
    <div className={blockClass}>
      {!isRoot && onDelete && (
        <button className="delete-module-btn" onClick={onDelete} title="モジュールを解除">
          ×
        </button>
      )}

      {/* Left Input */}
      <input
        type="text"
        className={`char-input ${!node.left && ghostNode?.left ? 'is-ghost' : ''}`}
        value={!node.left && ghostNode?.left ? ghostNode.left : node.left}
        onChange={(e) => handleChange('left', e.target.value)}
        placeholder=""
      />

      {/* Center (Only for 3-hole) */}
      {is3Hole && (
        <CenterHole
          node={node as Module3Hole}
          ghostNode={ghostNode as Module3Hole}
          onChange={(newCenter) => onChange({ ...node, center: newCenter } as ModuleNode)}
        />
      )}

      {/* Right Input */}
      <input
        type="text"
        className={`char-input ${!node.right && ghostNode?.right ? 'is-ghost' : ''}`}
        value={!node.right && ghostNode?.right ? ghostNode.right : node.right}
        onChange={(e) => handleChange('right', e.target.value)}
        placeholder=""
      />
    </div>
  );
};

interface CenterHoleProps {
  node: Module3Hole;
  ghostNode?: Module3Hole;
  onChange: (newCenter: string | ModuleNode) => void;
}

const CenterHole = ({ node, ghostNode, onChange }: CenterHoleProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: node.id,
    data: { type: 'center-hole' },
  });

  if (typeof node.center === 'string') {
    const isGhost = !node.center && ghostNode && typeof ghostNode.center === 'string' && ghostNode.center !== '';
    const displayValue = isGhost ? (ghostNode.center as string) : node.center;

    return (
      <div
        ref={setNodeRef}
        className={`center-droppable ${isOver ? 'is-over' : ''}`}
      >
        <input
          type="text"
          className={`char-input ${isGhost ? 'is-ghost' : ''}`}
          value={displayValue}
          onChange={(e) => {
            const val = e.target.value.slice(-1);
            if (isValidInput(val)) {
              onChange(val);
            }
          }}
          placeholder=""
        />
      </div>
    );
  }

  // If it's a nested module, render it recursively
  return (
    <NewspaperBlock
      node={node.center}
      ghostNode={ghostNode?.center as ModuleNode}
      onChange={onChange}
      onDelete={() => onChange('')} // 削除時は空文字列に戻す
    />
  );
};
