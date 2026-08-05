import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { BlockData } from '../App';

interface TomatoBlockProps {
  block: BlockData;
  index: number;
  updateBlock: (id: string, field: keyof Omit<BlockData, 'id'>, value: string) => void;
  onFocusNextBlock: (currentIndex: number) => void;
  onFocusPrevBlock: (currentIndex: number) => void;
  onDeleteBlock: (id: string, currentIndex: number) => void;
}

// ひらがな、カタカナ、長音記号のみを許可する正規表現
const isValidInput = (val: string) => /^[ぁ-んァ-ヶー]*$/.test(val);

export const TomatoBlock = ({
  block,
  index,
  updateBlock,
  onFocusNextBlock,
  onFocusPrevBlock,
  onDeleteBlock,
}: TomatoBlockProps) => {
  const char1Ref = useRef<HTMLInputElement>(null);
  const char2Ref = useRef<HTMLInputElement>(null);
  const char3Ref = useRef<HTMLInputElement>(null);

  const isCompleted = block.char1 !== '' && block.char3 !== '';
  const isValid = block.char1 === block.char3;

  let blockClass = 'tomato-block animate-fade-in';
  if (isCompleted) {
    blockClass += isValid ? ' is-valid' : ' is-invalid';
  }

  const handleChange = (field: keyof Omit<BlockData, 'id'>, val: string) => {
    // 最後の1文字だけを取得（常に1文字入力とする）
    const lastChar = val.slice(-1);
    if (!isValidInput(lastChar)) return;

    updateBlock(block.id, field, lastChar);

    if (lastChar !== '') {
      if (field === 'char1') {
        char2Ref.current?.focus();
      } else if (field === 'char2') {
        // char2が入力されたらchar3を自動補完し、次のブロックへ
        updateBlock(block.id, 'char3', block.char1);
        onFocusNextBlock(index);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, field: keyof Omit<BlockData, 'id'>) => {
    if (e.key === 'Backspace') {
      if (field === 'char3' && block.char3 === '') {
        char2Ref.current?.focus();
      } else if (field === 'char2' && block.char2 === '') {
        char1Ref.current?.focus();
      } else if (field === 'char1' && block.char1 === '') {
        // char1でバックスペースを押し、かつchar1とchar2が両方空の場合はブロックごと削除
        if (block.char2 === '') {
          e.preventDefault(); // デフォルトの戻る動作などを防ぐ
          onDeleteBlock(block.id, index);
        } else {
           onFocusPrevBlock(index);
        }
      }
    }
  };

  return (
    <div className={blockClass}>
      <input
        ref={char1Ref}
        id={`block-${index}-char1`}
        type="text"
        className="char-input"
        value={block.char1}
        onChange={(e) => handleChange('char1', e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'char1')}
        placeholder="あ"
        autoComplete="off"
      />
      <input
        ref={char2Ref}
        id={`block-${index}-char2`}
        type="text"
        className="char-input"
        value={block.char2}
        onChange={(e) => handleChange('char2', e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'char2')}
        placeholder="い"
        autoComplete="off"
      />
      <input
        ref={char3Ref}
        id={`block-${index}-char3`}
        type="text"
        className={`char-input ${block.char3 === '' && block.char1 !== '' ? 'is-ghost' : ''}`}
        value={block.char3 === '' && block.char1 !== '' ? block.char1 : block.char3}
        onChange={(e) => {
          // ゴースト表示時は実際のvalueは空なので、入力を受け付けた際はchar3として更新
          handleChange('char3', e.target.value);
        }}
        onKeyDown={(e) => handleKeyDown(e, 'char3')}
        placeholder="あ"
        autoComplete="off"
      />
    </div>
  );
};
