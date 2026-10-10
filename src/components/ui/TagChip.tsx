import React from 'react';

interface TagChipProps {
  label: string;
  className?: string;
  onRemove?: () => void;
  selected?: boolean;
  onClick?: () => void;
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  className = '',
  onRemove,
  selected,
  onClick,
}) => {
  const isInteractive = Boolean(onClick);

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-r1 text-[11px] font-medium font-ui transition-colors duration-120
        ${
          selected
            ? 'bg-primary-tint text-primary border border-primary/30'
            : 'bg-surface text-ink-2 border border-line-strong'
        }
        ${isInteractive ? 'cursor-pointer hover:border-ink-3' : ''}
        ${className}`}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-error ml-0.5"
        >
          ×
        </button>
      )}
    </span>
  );
};
