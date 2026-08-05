import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface OutputAreaProps {
  text: string;
}

export const OutputArea = ({ text }: OutputAreaProps) => {
  const [outputValue, setOutputValue] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // テキストが更新されるたびに出力テキストを同期
  useEffect(() => {
    setOutputValue(text);
  }, [text]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputValue);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="output-area">
      <div className="output-header">
        <h2 className="output-title">完成したトマト文</h2>
        <button 
          className={`copy-button ${isCopied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="クリップボードにコピー"
        >
          {isCopied ? (
            <>
              <Check size={18} />
              コピーしました！
            </>
          ) : (
            <>
              <Copy size={18} />
              コピーする
            </>
          )}
        </button>
      </div>
      <textarea
        className="output-textarea"
        value={outputValue}
        onChange={(e) => setOutputValue(e.target.value)}
        placeholder="ここに作成したテキストが表示されます。漢字変換など自由に編集できます。"
      />
    </div>
  );
};
