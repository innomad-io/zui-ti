import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Check, AlertCircle, Zap, Shield, Palette, LogIn, LogOut } from 'lucide-react';
import type { UserSettings, AIProviderId, SafetyLevel, GeminiAuthType } from '@/shared/types';
import { DEFAULT_SETTINGS, SAFETY_PRESETS } from '@/shared/types';
import { AI_PROVIDERS, getProvider, STYLE_LIST } from '@/shared/constants';

export const Options: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // 加载设置
  useEffect(() => {
    loadSettings();
    checkGoogleAuth();
  }, []);

  const checkGoogleAuth = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CHECK_GOOGLE_AUTH',
        payload: null,
      });
      if (response?.isSignedIn) {
        setIsGoogleSignedIn(true);
      }
    } catch (err) {
      console.error('Failed to check Google auth:', err);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_SETTINGS',
        payload: null,
      });
      if (response) {
        setSettings(response);
        // API Key 单独处理（加密存储）
        if (response.ai?.apiKey) {
          setApiKey('••••••••••••••••');
        }
      }
    } catch (err) {
      setError('Failed to load settings');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      // 保存设置
      const settingsToSave = { ...settings };
      
      // 如果 API Key 被修改了（不是占位符）
      if (apiKey && !apiKey.startsWith('••')) {
        settingsToSave.ai = {
          ...settingsToSave.ai,
          apiKey: apiKey,
        };
      }

      await chrome.runtime.sendMessage({
        type: 'SAVE_SETTINGS',
        payload: settingsToSave,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleProviderChange = (providerId: AIProviderId) => {
    const provider = getProvider(providerId);
    setSettings(prev => ({
      ...prev,
      ai: {
        ...prev.ai,
        provider: providerId,
        model: provider?.models[0]?.id || '',
      },
    }));
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GOOGLE_SIGN_IN',
        payload: null,
      });
      if (response?.error) {
        setError(response.error);
      } else if (response?.success) {
        setIsGoogleSignedIn(true);
        setSettings(prev => ({
          ...prev,
          ai: { ...prev.ai, geminiAuthType: 'oauth' },
        }));
      }
    } catch (err) {
      setError('Failed to sign in with Google');
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GOOGLE_SIGN_OUT',
        payload: null,
      });
      if (response?.success) {
        setIsGoogleSignedIn(false);
        setSettings(prev => ({
          ...prev,
          ai: { ...prev.ai, geminiAuthType: 'apiKey' },
        }));
      }
    } catch (err) {
      setError('Failed to sign out');
    }
  };

  const handleAuthTypeChange = (authType: GeminiAuthType) => {
    setSettings(prev => ({
      ...prev,
      ai: { ...prev.ai, geminiAuthType: authType },
    }));
  };

  const currentProvider = getProvider(settings.ai.provider);
  const currentSafetyConfig = settings.safety.customConfig || SAFETY_PRESETS[settings.safety.level];
  const isGemini = settings.ai.provider === 'gemini';
  const geminiAuthType = settings.ai.geminiAuthType || 'apiKey';

  return (
    <div className="options-container">
      <header className="options-header">
        <div className="header-title">
          <Zap size={28} className="icon-primary" />
          <h1>X AI Reply Assistant</h1>
        </div>
        <p className="header-subtitle">Configure your AI-powered reply assistant</p>
      </header>

      <main className="options-content">
        {/* AI Provider 设置 */}
        <section className="settings-section">
          <div className="section-header">
            <Zap size={20} />
            <h2>AI Provider</h2>
          </div>

          <div className="form-group">
            <label>Provider</label>
            <select
              value={settings.ai.provider}
              onChange={(e) => handleProviderChange(e.target.value as AIProviderId)}
            >
              {AI_PROVIDERS.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Model</label>
            <select
              value={settings.ai.model}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                ai: { ...prev.ai, model: e.target.value },
              }))}
            >
              {currentProvider?.models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gemini 认证方式选择 */}
          {isGemini && (
            <div className="form-group">
              <label>Authentication Method</label>
              <div className="auth-options">
                <button
                  className={`auth-option ${geminiAuthType === 'apiKey' ? 'active' : ''}`}
                  onClick={() => handleAuthTypeChange('apiKey')}
                >
                  <span className="auth-name">API Key</span>
                  <span className="auth-desc">Use Google AI Studio API Key</span>
                </button>
                <button
                  className={`auth-option ${geminiAuthType === 'oauth' ? 'active' : ''}`}
                  onClick={() => handleAuthTypeChange('oauth')}
                >
                  <span className="auth-name">Google Account</span>
                  <span className="auth-desc">Use Gemini Pro subscription</span>
                </button>
              </div>
            </div>
          )}

          {/* API Key 输入 - 仅在选择 API Key 认证时显示 */}
          {(!isGemini || geminiAuthType === 'apiKey') && (
            <div className="form-group">
              <label>API Key</label>
              <div className="input-with-icon">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="form-hint">
                Your API key is encrypted and stored locally. It is never sent to any server except the AI provider.
              </p>
            </div>
          )}

          {/* Google 登录按钮 - 仅在选择 OAuth 认证时显示 */}
          {isGemini && geminiAuthType === 'oauth' && (
            <div className="form-group">
              <label>Google Account</label>
              {isGoogleSignedIn ? (
                <div className="google-auth-status">
                  <div className="auth-status-info">
                    <Check size={18} className="icon-success" />
                    <span>Connected with Google</span>
                  </div>
                  <button
                    className="google-sign-out-btn"
                    onClick={handleGoogleSignOut}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  className="google-sign-in-btn"
                  onClick={handleGoogleSignIn}
                  disabled={signingIn}
                >
                  <LogIn size={18} />
                  <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
              )}
              <p className="form-hint">
                Sign in with your Google account to use your Gemini Pro subscription.
              </p>
            </div>
          )}
        </section>

        {/* 回复设置 */}
        <section className="settings-section">
          <div className="section-header">
            <Palette size={20} />
            <h2>Reply Settings</h2>
          </div>

          <div className="form-group">
            <label>Default Style</label>
            <div className="style-grid">
              {STYLE_LIST.filter(s => s.id !== 'custom').map(style => (
                <button
                  key={style.id}
                  className={`style-option ${settings.reply.defaultStyle === style.id ? 'active' : ''}`}
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    reply: { ...prev.reply, defaultStyle: style.id },
                  }))}
                >
                  <span className="style-emoji">{style.emoji}</span>
                  <span className="style-name">{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Default Language</label>
            <select
              value={settings.reply.defaultLanguage}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                reply: { ...prev.reply, defaultLanguage: e.target.value as 'zh' | 'en' | 'auto' },
              }))}
            >
              <option value="auto">Auto Detect</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div className="form-group">
            <label>Max Reply Length</label>
            <input
              type="number"
              value={settings.reply.maxLength}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                reply: { ...prev.reply, maxLength: parseInt(e.target.value) || 280 },
              }))}
              min={50}
              max={500}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.reply.generateAlternatives}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reply: { ...prev.reply, generateAlternatives: e.target.checked },
                }))}
              />
              <span>Generate alternative replies</span>
            </label>
          </div>
        </section>

        {/* 安全设置 */}
        <section className="settings-section">
          <div className="section-header">
            <Shield size={20} />
            <h2>Safety Settings</h2>
          </div>

          <div className="form-group">
            <label>Safety Level</label>
            <div className="safety-options">
              {(['relaxed', 'balanced', 'strict'] as SafetyLevel[]).map(level => (
                <button
                  key={level}
                  className={`safety-option ${settings.safety.level === level ? 'active' : ''}`}
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    safety: { level, customConfig: undefined },
                  }))}
                >
                  <span className="safety-name">
                    {level === 'relaxed' ? '宽松' : level === 'balanced' ? '平衡' : '严格'}
                  </span>
                  <span className="safety-desc">
                    {level === 'relaxed' 
                      ? '25/hour, 15s interval' 
                      : level === 'balanced' 
                        ? '15/hour, 30s interval' 
                        : '8/hour, 60s interval'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="safety-info">
            <h4>Current Limits</h4>
            <ul>
              <li>Max replies per hour: <strong>{currentSafetyConfig.maxRepliesPerHour}</strong></li>
              <li>Min interval: <strong>{currentSafetyConfig.minIntervalSeconds}s</strong></li>
              <li>Manual confirm: <strong>{currentSafetyConfig.requireManualConfirm ? 'Yes' : 'No'}</strong></li>
              <li>Add variation: <strong>{currentSafetyConfig.addRandomVariation ? 'Yes' : 'No'}</strong></li>
            </ul>
          </div>
        </section>

        {/* 错误/成功消息 */}
        {error && (
          <div className="message error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="message success">
            <Check size={18} />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* 保存按钮 */}
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save size={18} />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </main>

      <footer className="options-footer">
        <p>X AI Reply Assistant v1.0.0</p>
        <p>Your API keys are stored locally and never shared.</p>
      </footer>
    </div>
  );
};
