import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Zap } from 'lucide-react';
import type { ParsedTweet } from '@/shared/types';
import { ReplyModal } from './ReplyModal';

interface ReplyButtonProps {
  tweet: ParsedTweet;
}

export const ReplyButton: React.FC<ReplyButtonProps> = ({ tweet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        className="zui-reply-btn"
        onClick={handleClick}
        title="AI 生成回复"
      >
        <Zap size={18} />
      </button>

      {isModalOpen &&
        createPortal(
          <ReplyModal tweet={tweet} onClose={() => setIsModalOpen(false)} />,
          document.body
        )}
    </>
  );
};
