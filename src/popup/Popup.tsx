import React, { useState, useEffect } from 'react';
import { Zap, Settings, Shield, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import type { UserSettings, RateLimitStatus } from '@/shared/types';
import { DEFAULT_SETTINGS, SAFETY_PRESETS } from '@/shared/types';

export const Popup: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [rateStatus, setRateStatus] = useState<RateLimitStatus | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 加载设置
      const settingsResponse = await chrome.runtime.sendMessage({
        type: 'GET_SETTINGS',
        payload: null,
      });
      if (settingsResponse) {
        setSettings(settingsResponse);
        setIsConfigured(!!settingsResponse.ai?.apiKey);
      }

      // 检查速率限制
      const rateResponse = await chrome.runtime.sendMessage({
        type: 'CHECK_RATE_LIMIT',
        payload: null,
      });
      if (rateResponse) {
        setRateStatus(rateResponse);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const openX = () => {
    chrome.tabs.create({ url: 'https://x.com' });
  };

  const safetyConfig = settings.safety.customConfig || SAFETY_PRESETS[settings.safety.level];
  const usagePercent = rateStatus 
    ? Math.min((rateStatus.repliesInLastHour / safetyConfig.maxRepliesPerHour) * 100, 100)
    : 0;

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="popup-header">
        <div className="header-left">
          <Zap size={24} className="icon-primary" />
          <span className="header-title">X AI Reply</span>
        </div>
        <button className="icon-btn" onClick={openOptions} title="Settings">
          <Settings size={20} />
        </button>
      </header>

      {/* Status */}
      <div className="status-section">
        {isConfigured ? (
          <div className="status-item success">
            <CheckCircle size={18} />
            <span>API Configured</span>
          </div>
        ) : (
          <div className="status-item warning">
            <AlertCircle size={18} />
            <span>API Key Required</span>
          </div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="usage-section">
        <div className="usage-header">
          <Shield size={16} />
          <span>Usage (Last Hour)</span>
        </div>
        <div className="usage-bar">
          <div 
            className="usage-fill" 
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <div className="usage-text">
          {rateStatus?.repliesInLastHour || 0} / {safetyConfig.maxRepliesPerHour} replies
        </div>
      </div>

      {/* Quick Info */}
      <div className="info-section">
        <div className="info-item">
          <span className="info-label">Provider</span>
          <span className="info-value">{settings.ai.provider}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Model</span>
          <span className="info-value">{settings.ai.model}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Safety</span>
          <span className="info-value">{settings.safety.level}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="actions-section">
        {!isConfigured && (
          <button className="action-btn primary" onClick={openOptions}>
            <Settings size={16} />
            <span>Configure API Key</span>
          </button>
        )}
        <button className="action-btn" onClick={openX}>
          <ExternalLink size={16} />
          <span>Open X</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="popup-footer">
        <p>Click ⚡ on any tweet to generate AI replies</p>
      </footer>
    </div>
  );
};
