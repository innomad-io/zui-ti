import React, { useState, useEffect } from 'react';
import { Zap, Settings, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import type { UserSettings } from '@/shared/types';
import { DEFAULT_SETTINGS } from '@/shared/types';

export const Popup: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isConfigured, setIsConfigured] = useState(false);
  const [geminiUsage, setGeminiUsage] = useState<{ model: string; count: number; remaining: number }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const settingsResponse = await chrome.runtime.sendMessage({
        type: 'GET_SETTINGS',
        payload: null,
      });
      if (settingsResponse) {
        setSettings(settingsResponse);
        setIsConfigured(!!settingsResponse.ai?.apiKey);
      }

      if (settingsResponse?.ai?.provider === 'gemini') {
        const usageResponse = await chrome.runtime.sendMessage({
          type: 'GET_GEMINI_USAGE',
          payload: null,
        });
        if (usageResponse?.stats) {
          setGeminiUsage(usageResponse.stats);
        }
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

  const totalRemaining = geminiUsage.reduce((sum, stat) => sum + stat.remaining, 0);

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="popup-header">
        <div className="header-left">
          <Zap size={24} className="icon-primary" />
          <span className="header-title">ZuiTi</span>
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

      {/* Gemini Usage Stats (只在 Gemini 时显示) */}
      {settings.ai.provider === 'gemini' && geminiUsage.length > 0 && (
        <div className="gemini-usage-section">
          <div className="gemini-usage-header">
            <Zap size={14} />
            <span>Gemini Models (Today)</span>
          </div>
          <div className="gemini-models-compact">
            {geminiUsage.map(stat => {
              const shortName = stat.model
                .replace('gemini-2.5-flash-lite', 'lite')
                .replace('gemini-2.5-flash', 'flash')
                .replace('gemini-3-flash-preview', 'preview');
              const percent = (stat.count / 20) * 100;
              return (
                <div key={stat.model} className="model-mini">
                  <span className="model-mini-name">{shortName}</span>
                  <div className="model-mini-bar">
                    <div 
                      className="model-mini-fill" 
                      style={{ width: `${percent}%` }}
                      data-status={stat.remaining === 0 ? 'danger' : stat.remaining < 5 ? 'warning' : 'normal'}
                    />
                  </div>
                  <span className="model-mini-count">{stat.count}/20</span>
                </div>
              );
            })}
          </div>
          <div className="gemini-total">
            Total: {totalRemaining}/60 remaining
          </div>
        </div>
      )}

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
