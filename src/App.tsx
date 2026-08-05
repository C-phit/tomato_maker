import { useState, useEffect } from 'react';
import { TomatoBlock } from './components/TomatoBlock';
import { OutputArea } from './components/OutputArea';
import { Palette } from './components/Palette';
import { NewspaperBlock } from './components/NewspaperBlock';
import { Leaf } from 'lucide-react';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { AppMode, ModuleNode, ModuleType } from './types';
import { flattenHoles, autoFillMirror, computeGhostStrings, isPalindrome, fillHoles } from './utils';
import './index.css';

export interface BlockData {
  id: string;
  char1: string;
  char2: string;
  char3: string;
}

export const generateId = () => Math.random().toString(36).substring(2, 9);

function App() {
  const [mode, setMode] = useState<AppMode>('tomato');
  
  // Tomato Mode State
  const [tomatoBlocks, setTomatoBlocks] = useState<BlockData[]>([
    { id: generateId(), char1: '', char2: '', char3: '' }
  ]);

  // Newspaper Mode State
  const [newspaperBlocks, setNewspaperBlocks] = useState<ModuleNode[]>([
    { id: generateId(), type: '3-hole', left: '', center: '', right: '' }
  ]);

  // Data Protection
  const hasData = () => {
    if (mode === 'tomato') {
      return tomatoBlocks.some(b => b.char1 || b.char2 || b.char3);
    } else {
      return newspaperBlocks.some(b => flattenHoles(b).some(c => c !== ''));
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasData()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [mode, tomatoBlocks, newspaperBlocks]);

  const toggleMode = () => {
    if (hasData()) {
      if (!window.confirm('書き込まれた文は消えますがよろしいですか？')) {
        return;
      }
    }
    if (mode === 'tomato') {
      setMode('newspaper');
      setNewspaperBlocks([{ id: generateId(), type: '3-hole', left: '', center: '', right: '' }]);
    } else {
      setMode('tomato');
      setTomatoBlocks([{ id: generateId(), char1: '', char2: '', char3: '' }]);
    }
  };

  // --- Tomato Mode Logic ---
  const updateTomatoBlock = (id: string, field: keyof Omit<BlockData, 'id'>, value: string) => {
    setTomatoBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const onFocusNextTomatoBlock = (currentIndex: number) => {
    if (currentIndex === tomatoBlocks.length - 1) {
      setTomatoBlocks(prev => [...prev, { id: generateId(), char1: '', char2: '', char3: '' }]);
      setTimeout(() => {
        document.getElementById(`block-${currentIndex + 1}-char1`)?.focus();
      }, 0);
    } else {
      document.getElementById(`block-${currentIndex + 1}-char1`)?.focus();
    }
  };

  const onFocusPrevTomatoBlock = (currentIndex: number) => {
    if (currentIndex > 0) {
      document.getElementById(`block-${currentIndex - 1}-char1`)?.focus();
    }
  };

  const onDeleteTomatoBlock = (id: string, currentIndex: number) => {
    if (tomatoBlocks.length <= 1) return;
    setTomatoBlocks(prev => prev.filter(b => b.id !== id));
    if (currentIndex > 0) {
      setTimeout(() => {
        document.getElementById(`block-${currentIndex - 1}-char1`)?.focus();
      }, 0);
    }
  };

  // --- Newspaper Mode Logic ---
  const updateNewspaperBlock = (index: number, newNode: ModuleNode) => {
    setNewspaperBlocks(prev => {
      const next = [...prev];
      
      // Auto-fill logic check
      const strings = flattenHoles(newNode);
      const autofilled = autoFillMirror(strings);
      
      const { newNode: filledNode } = fillHoles(newNode, autofilled);
        
      setNewspaperBlocks(current => {
        const updated = [...current];
        updated[index] = filledNode;
        
        // Next block logic
        const isComplete = autofilled.every(s => s !== '');
        if (isComplete && index === current.length - 1) {
          updated.push({ id: generateId(), type: '3-hole', left: '', center: '', right: '' });
          setTimeout(() => {
            const rootBlocks = document.querySelectorAll('.newspaper-block.is-root');
            const lastRootBlock = rootBlocks[rootBlocks.length - 1];
            const firstInput = lastRootBlock?.querySelector('.char-input') as HTMLInputElement;
            firstInput?.focus();
          }, 0);
        }
        return updated;
      });

      next[index] = newNode;
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const moduleType = active.data.current?.type as ModuleType;
    const targetId = over.id;

    // Search and replace in the AST
    const insertModule = (node: ModuleNode): ModuleNode => {
      if (node.type === '3-hole') {
        if (node.id === targetId && typeof node.center === 'string') {
          return {
            ...node,
            center: moduleType === '3-hole' 
              ? { id: generateId(), type: '3-hole', left: '', center: '', right: '' }
              : { id: generateId(), type: '2-hole', left: '', right: '' }
          };
        } else if (typeof node.center !== 'string') {
          return { ...node, center: insertModule(node.center) };
        }
      }
      return node;
    };

    setNewspaperBlocks(prev => prev.map(insertModule));
  };

  // --- Render logic ---
  const outputText = mode === 'tomato' 
    ? tomatoBlocks.map(b => `${b.char1}${b.char2}${b.char3}`).join('')
    : newspaperBlocks.map(b => flattenHoles(b).join('')).join('');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          <Leaf color="#4caf50" size={36} style={{ transform: 'rotate(45deg)' }} />
          トマト文メーカー
        </h1>
        <p className="app-subtitle">上から読んでも下から読んでも同じ文字になる「トマト文」をスムーズに作ろう！</p>
        
        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={toggleMode}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '2px solid var(--tomato-400)',
              background: mode === 'newspaper' ? 'var(--tomato-500)' : 'white',
              color: mode === 'newspaper' ? 'white' : 'var(--tomato-600)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            {mode === 'tomato' ? '🍅 トマト文モード' : '📰 新聞紙文モード'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <DndContext onDragEnd={handleDragEnd}>
          <main className="editor-area" style={{ flex: 1 }}>
            {mode === 'tomato' ? (
              tomatoBlocks.map((block, index) => (
                <TomatoBlock
                  key={block.id}
                  block={block}
                  index={index}
                  updateBlock={updateTomatoBlock}
                  onFocusNextBlock={onFocusNextTomatoBlock}
                  onFocusPrevBlock={onFocusPrevTomatoBlock}
                  onDeleteBlock={onDeleteTomatoBlock}
                />
              ))
            ) : (
              newspaperBlocks.map((block, index) => {
                const strings = flattenHoles(block);
                const isCompleted = strings.every(s => s !== '');
                const valid = isCompleted && isPalindrome(strings);
                
                const ghostStrings = computeGhostStrings(strings);
                const { newNode: ghostNode } = fillHoles(block, ghostStrings);

                return (
                  <NewspaperBlock
                    key={block.id}
                    node={block}
                    ghostNode={ghostNode}
                    isRoot={true}
                    isValid={valid}
                    isCompleted={isCompleted}
                    onChange={(newNode) => updateNewspaperBlock(index, newNode)}
                  />
                );
              })
            )}
          </main>
          
          {mode === 'newspaper' && (
            <div style={{ width: '200px' }}>
              <Palette />
            </div>
          )}
        </DndContext>
      </div>

      <OutputArea text={outputText} />
    </div>
  );
}

export default App;
