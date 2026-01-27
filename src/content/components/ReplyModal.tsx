import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Copy, Check, AlertCircle, Zap } from 'lucide-react';
import type { ParsedTweet, ReplyStyleId } from '@/shared/types';
import { StyleSelector } from './StyleSelector';
import { useReplyGenerator, useRateLimit } from '../hooks';

interface ReplyModalProps {
  tweet: ParsedTweet;
  onClose: () => void;
}

export const ReplyModal: React.FC<ReplyModalProps> = ({ tweet, onClose }) => {
  const [style, setStyle] = useState<ReplyStyleId>('friendly');
  const [copied, setCopied] = useState(false);

  const {
    isLoading,
    reply,
    alternatives,
    error,
    requireConfirm,
    generate,
    selectAlternative,
    updateReply,
    reset,
  } = useReplyGenerator();

  const { canReply, waitTime, formatWaitTime, repliesInLastHour } = useRateLimit();

  useEffect(() => {
    if (canReply) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    await generate({
      tweetContent: tweet.content,
      tweetAuthor: tweet.authorHandle,
      style,
    });
  };

  const handleCopy = async () => {
    if (reply) {
      await navigator.clipboard.writeText(reply);
      setCopied(true);
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const handleRegenerate = () => {
    reset();
    handleGenerate();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="zui-modal-backdrop" onClick={handleBackdropClick}>
      <div className="zui-modal">
        <div className="zui-modal-header">
          <div className="zui-modal-title">
            <Zap size={18} className="zui-icon-primary" />
            <span>AI Reply</span>
          </div>
          <button className="zui-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="zui-tweet-preview">
          <span className="zui-tweet-author">@{tweet.authorHandle}</span>
          <p className="zui-tweet-content">{tweet.content}</p>
        </div>

        {!canReply && (
          <div className="zui-warning">
            <AlertCircle size={16} />
            <span>请等待 {formatWaitTime(waitTime)} 后再生成回复</span>
          </div>
        )}

        <StyleSelector
          value={style}
          onChange={setStyle}
          disabled={isLoading}
        />

        {!reply && !isLoading && (
          <button
            className="zui-generate-btn"
            onClick={handleGenerate}
            disabled={!canReply || isLoading}
          >
            <Zap size={16} />
            <span>生成回复</span>
          </button>
        )}

        {isLoading && (
          <div className="zui-loading">
            <RefreshCw size={20} className="zui-spin" />
            <span>生成中...</span>
          </div>
        )}

        {error && (
          <div className="zui-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {reply && !isLoading && (
          <div className="zui-reply-result">
            <textarea
              className="zui-reply-textarea"
              value={reply}
              onChange={(e) => updateReply(e.target.value)}
              rows={4}
            />

            {alternatives.length > 0 && (
              <div className="zui-alternatives">
                <span className="zui-alternatives-label">备选:</span>
                {alternatives.map((_, i) => (
                  <button
                    key={i}
                    className="zui-alt-btn"
                    onClick={() => selectAlternative(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

            {requireConfirm && (
              <div className="zui-confirm-hint">
                <AlertCircle size={14} />
                <span>严格模式：建议稍作修改后发送</span>
              </div>
            )}

            <div className="zui-actions">
              <button className="zui-action-btn" onClick={handleRegenerate}>
                <RefreshCw size={16} />
                <span>重新生成</span>
              </button>
              <button className="zui-action-btn zui-action-btn-primary" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? '已复制' : '复制'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="zui-footer">
          <span>本小时已回复: {repliesInLastHour}</span>
        </div>
      </div>
    </div>
  );
};
