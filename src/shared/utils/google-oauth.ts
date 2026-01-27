import type { OAuthToken } from '../types';

// Google OAuth 配置
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

// Gemini API 需要的 scope
const GEMINI_SCOPES = [
  'https://www.googleapis.com/auth/generative-language.retriever',
  'https://www.googleapis.com/auth/cloud-platform',
];

// 存储 key
const OAUTH_TOKEN_KEY = 'zui-oauth-token';

/**
 * 使用 Chrome Identity API 进行 Google OAuth 登录
 * 这种方式使用 Chrome 扩展的内置 OAuth 支持
 */
export async function signInWithGoogle(): Promise<OAuthToken> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken(
      { interactive: true },
      (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        if (!token) {
          reject(new Error('Failed to get auth token'));
          return;
        }

        // Chrome Identity API 返回的 token 不包含过期时间
        // 我们设置一个默认的过期时间（1小时）
        const oauthToken: OAuthToken = {
          accessToken: token,
          expiresAt: Date.now() + 3600 * 1000,
        };

        // 保存 token
        saveOAuthToken(oauthToken).then(() => {
          resolve(oauthToken);
        }).catch(reject);
      }
    );
  });
}

/**
 * 使用 launchWebAuthFlow 进行 OAuth 登录（备用方案）
 * 这种方式可以获取 refresh token，但需要配置 OAuth Client ID
 */
export async function signInWithGoogleWebFlow(clientId: string): Promise<OAuthToken> {
  const redirectUrl = chrome.identity.getRedirectURL();
  
  const authUrl = new URL(GOOGLE_AUTH_ENDPOINT);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUrl);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('scope', GEMINI_SCOPES.join(' '));
  authUrl.searchParams.set('prompt', 'consent');

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive: true,
      },
      (responseUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!responseUrl) {
          reject(new Error('No response URL'));
          return;
        }

        // 解析返回的 URL 获取 token
        const url = new URL(responseUrl);
        const hashParams = new URLSearchParams(url.hash.slice(1));
        const accessToken = hashParams.get('access_token');
        const expiresIn = hashParams.get('expires_in');

        if (!accessToken) {
          reject(new Error('No access token in response'));
          return;
        }

        const oauthToken: OAuthToken = {
          accessToken,
          expiresAt: Date.now() + (parseInt(expiresIn || '3600') * 1000),
        };

        saveOAuthToken(oauthToken).then(() => {
          resolve(oauthToken);
        }).catch(reject);
      }
    );
  });
}

/**
 * 登出 Google 账号
 */
export async function signOutGoogle(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 获取当前 token
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        // 撤销 token
        chrome.identity.removeCachedAuthToken({ token }, () => {
          // 清除存储的 token
          clearOAuthToken().then(resolve).catch(reject);
        });
      } else {
        clearOAuthToken().then(resolve).catch(reject);
      }
    });
  });
}

/**
 * 获取有效的 OAuth Token
 * 如果 token 过期，会尝试刷新
 */
export async function getValidOAuthToken(): Promise<string | null> {
  const token = await getOAuthToken();
  
  if (!token) {
    return null;
  }

  // 检查是否过期（提前 5 分钟刷新）
  if (token.expiresAt < Date.now() + 5 * 60 * 1000) {
    try {
      // 使用 Chrome Identity API 刷新 token
      const newToken = await refreshToken();
      return newToken.accessToken;
    } catch {
      // 刷新失败，需要重新登录
      return null;
    }
  }

  return token.accessToken;
}

/**
 * 刷新 token
 */
async function refreshToken(): Promise<OAuthToken> {
  return new Promise((resolve, reject) => {
    // 先清除缓存的 token
    chrome.identity.getAuthToken({ interactive: false }, (oldToken) => {
      if (oldToken) {
        chrome.identity.removeCachedAuthToken({ token: oldToken }, () => {
          // 获取新 token
          chrome.identity.getAuthToken({ interactive: false }, (newToken) => {
            if (chrome.runtime.lastError || !newToken) {
              reject(new Error('Failed to refresh token'));
              return;
            }

            const oauthToken: OAuthToken = {
              accessToken: newToken,
              expiresAt: Date.now() + 3600 * 1000,
            };

            saveOAuthToken(oauthToken).then(() => {
              resolve(oauthToken);
            }).catch(reject);
          });
        });
      } else {
        reject(new Error('No token to refresh'));
      }
    });
  });
}

/**
 * 保存 OAuth Token
 */
async function saveOAuthToken(token: OAuthToken): Promise<void> {
  await chrome.storage.local.set({ [OAUTH_TOKEN_KEY]: token });
}

/**
 * 获取存储的 OAuth Token
 */
async function getOAuthToken(): Promise<OAuthToken | null> {
  const result = await chrome.storage.local.get(OAUTH_TOKEN_KEY);
  return result[OAUTH_TOKEN_KEY] || null;
}

/**
 * 清除 OAuth Token
 */
async function clearOAuthToken(): Promise<void> {
  await chrome.storage.local.remove(OAUTH_TOKEN_KEY);
}

/**
 * 检查是否已登录 Google
 */
export async function isGoogleSignedIn(): Promise<boolean> {
  const token = await getValidOAuthToken();
  return token !== null;
}
