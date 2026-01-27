import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Copy, Send, Check, AlertCircle, Zap } from 'lucide-react';
import type { ParsedTweet, ReplyStyleId } from '@/shared/types';
import { StyleSelector } from './StyleSelector';
import { useReplyGenerator, useRateLimit } from '../hooks';
import { fillText } from '../utils';

interface ReplyModalProps {
  tweet: ParsedTweet;
  onClose: () => void;
}

export const ReplyModal: React.FC<ReplyModalProps> = ({ tweet, onClose }) => {
  const [style, setStyle] = useState<ReplyStyleId>('friendly');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    isLoading,
    reply,
    alternatives,
    error,
    requireConfirm,
    generate,
    selectAlternative,
    updateReply,
    recordReply,
    reset,
  } = useReplyGenerator();

  const { canReply, waitTime, formatWaitTime, repliesInLastHour } = useRateLimit();

  // 自动生成
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
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = async () => {
    if (!reply) return;

    // 找到 X 的回复输入框
    const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
    
    if (replyBox) {
      // 填充文本
      fillText(replyBox, reply);
      
      // 记录回复
      await recordReply(tweet.id);
      
      setSent(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      // 如果找不到输入框，点击原生回复按钮
      const nativeReplyBtn = tweet.element?.querySelector('[data-testid="reply"]') as HTMLElement;
      if (nativeReplyBtn) {
        nativeReplyBtn.click();
        
        // 等待输入框出现
        setTimeout(async () => {
          const newReplyBox = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
          if (newReplyBox) {
            fillText(newReplyBox, reply);
            await recordReply(tweet.id);
            setSent(true);
            setTimeout(() => onClose(), 1000);
          }
        }, 500);
      }
    }
  };

  const handleRegenerate = () => {
    reset();
    handleGenerate();
  };

  // 点击外部关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="zui-modal-backdrop" onClick={handleBackdropClick}>
      <div className="zui-modal">
        {/* Header */}
        <div className="zui-modal-header">
          <div className="zui-modal-title">
            <Zap size={18} className="zui-icon-primary" />
            <span>AI Reply</span>
          </div>
          <button className="zui-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* 原推文预览 */}
        <div className="zui-tweet-preview">
          <span className="zui-tweet-author">@{tweet.authorHandle}</span>
          <p className="zui-tweet-content">{tweet.content}</p>
        </div>

        {/* 速率限制警告 */}
        {!canReply && (
          <div className="zui-warning">
            <AlertCircle size={16} />
            <span>请等待 {formatWaitTime(waitTime)} 后再生成回复</span>
          </div>
        )}

        {/* 风格选择器 */}
        <StyleSelector
          value={style}
          onChange={setStyle}
          disabled={isLoading}
        />

        {/* 生成按钮 */}
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

        {/* Loading 状态 */}
        {isLoading && (
          <div className="zui-loading">
            <RefreshCw size={20} className="zui-spin" />
            <span>生成中...</span>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="zui-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* 生成结果 */}
        {reply && !isLoading && (
          <div className="zui-reply-result">
            <textarea
              className="zui-reply-textarea"
              value={reply}
              onChange={(e) => updateReply(e.target.value)}
              rows={4}
            />

            {/* 备选回复 */}
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

            {/* 确认提示 */}
            {requireConfirm && (
              <div className="zui-confirm-hint">
                <AlertCircle size={14} />
                <span>严格模式：建议稍作修改后发送</span>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="zui-actions">
              <button className="zui-action-btn" onClick={handleRegenerate}>
                <RefreshCw size={16} />
                <span>重新生成</span>
              </button>
              <button className="zui-action-btn" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? '已复制' : '复制'}</span>
              </button>
              <button
                className="zui-action-btn zui-action-btn-primary"
                onClick={handleSend}
                disabled={sent}
              >
                {sent ? <Check size={16} /> : <Send size={16} />}
                <span>{sent ? '已发送' : '发送'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <div className="zui-footer">
          <span>本小时已回复: {repliesInLastHour}</span>
        </div>
      </div>
    </div>
  );
};
