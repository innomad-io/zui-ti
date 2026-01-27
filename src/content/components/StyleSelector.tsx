import React from 'react';
import type { ReplyStyleId } from '@/shared/types';
import { REPLY_STYLES, STYLE_LIST } from '@/shared/constants';

interface StyleSelectorProps {
  value: ReplyStyleId;
  onChange: (style: ReplyStyleId) => void;
  disabled?: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  // 过滤掉 custom，它需要单独处理
  const styles = STYLE_LIST.filter(s => s.id !== 'custom');

  return (
    <div className="zui-style-selector">
      <div className="zui-styles-scroll">
        {styles.map((style) => (
          <button
            key={style.id}
            className={`zui-style-btn ${value === style.id ? 'zui-style-btn-active' : ''}`}
            onClick={() => onChange(style.id)}
            disabled={disabled}
            title={style.description}
          >
            <span className="zui-style-emoji">{style.emoji}</span>
            <span className="zui-style-name">{style.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const getStyleInfo = (id: ReplyStyleId) => {
  return REPLY_STYLES[id] || REPLY_STYLES.friendly;
};
