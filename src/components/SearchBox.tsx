import { useEffect, useRef } from 'react';

type SearchBoxProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function SearchBox({ value, onChange, placeholder = '搜索标题、标签、摘要', autoFocus = false }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = Boolean(value);

  useEffect(() => {
    if (!autoFocus) return;
    inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className={`search-box ${hasValue ? 'has-value' : ''}`} role="search">
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="站内搜索"
      />
      <button
        type="button"
        className="search-clear"
        onClick={() => onChange('')}
        aria-hidden={!hasValue}
        tabIndex={hasValue ? 0 : -1}
      >
        清除
      </button>
    </div>
  );
}
