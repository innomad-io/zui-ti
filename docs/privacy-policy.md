# Privacy Policy / 隐私政策

**Last Updated / 最后更新**: January 31, 2026

**English** | [中文](#中文版本)

---

## English Version

### 1. Introduction

ZuiTi ("we", "our", or "the extension") is a Chrome browser extension that helps users generate AI-powered replies for posts on X (formerly Twitter). This Privacy Policy explains how we collect, use, and protect your information.

### 2. Information We Collect

#### 2.1 Data You Provide
- **Tweet Content**: When you use the reply generation feature, the extension reads the text and metadata (author handle, tweet ID) of the tweet you're replying to.
- **API Keys**: If you choose to use your own API keys for AI services, these are stored locally in your browser (encrypted).
- **Generated Replies**: The extension stores a local history of recently generated replies to improve variety and apply rate limiting.

#### 2.2 Automatically Generated Data
- **Device Identifier (deviceId)**: A randomly generated identifier stored locally to encrypt your API keys. This ID never leaves your device.
- **Usage Counters**: Local records of which AI models you've used, to enable smart model rotation within free quotas.
- **OAuth Tokens**: If you sign in with Google OAuth to use Gemini API, the OAuth token is stored locally in your browser.

#### 2.3 Data We Do NOT Collect
- We do **not** collect any analytics or telemetry.
- We do **not** upload your data to our own servers.
- We do **not** track your browsing history outside of X/Twitter pages where the extension is active.

### 3. How We Use Your Information

- **Reply Generation**: Tweet content is sent directly to third-party AI service providers (see Section 4) to generate reply suggestions.
- **Model Rotation**: Usage counters help automatically switch between AI models to maximize free quota usage.
- **Rate Limiting**: Local reply history prevents duplicate replies and applies rate limits.
- **Security**: API keys are encrypted using AES-GCM encryption with a key derived from your device identifier.

### 4. Third-Party Services

The extension sends prompts (including tweet text and context) directly to the following third-party AI service providers, depending on your configuration:

| Service | Domain | Purpose |
|---------|--------|---------|
| **Google Gemini** | `generativelanguage.googleapis.com` | AI reply generation |
| **OpenAI** | `api.openai.com` | AI reply generation |
| **Anthropic (Claude)** | `api.anthropic.com` | AI reply generation |
| **DeepSeek** | `api.deepseek.com` | AI reply generation |

**Important**: When you use the reply generation feature, the tweet content you're replying to is sent to these third-party services. Each provider has its own privacy policy:
- [Google Generative AI Privacy](https://ai.google.dev/gemini-api/terms)
- [OpenAI Privacy Policy](https://openai.com/policies/privacy-policy)
- [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy)
- [DeepSeek Privacy Policy](https://www.deepseek.com/privacy-policy)

**OAuth Integration**: If you use Google OAuth to sign in, the extension uses OAuth scope `https://www.googleapis.com/auth/generative-language.retriever` to access Google's Generative Language API on your behalf. The OAuth client ID is: `513842350533-snqikcv73a0u72tocf8hgng2hfulq0pr.apps.googleusercontent.com`.

### 5. Permissions Explained

The extension requests the following Chrome permissions:

- **`storage`**: To save your settings, encrypted API keys, OAuth tokens, usage counters, and reply history locally in your browser.
- **`activeTab`**: To enable opening new tabs (e.g., linking to X/Twitter from the extension popup).
- **`identity`**: To enable Google OAuth sign-in for Gemini API access.

The extension can access the following domains:
- **`https://x.com/*` and `https://twitter.com/*`**: To read tweet content and inject the reply generation UI.
- **AI Provider Domains**: To send API requests for reply generation (see Section 4).

### 6. Data Storage and Retention

- **Where Data is Stored**: All data is stored locally in your browser using `chrome.storage.local` and `chrome.storage.sync`. No data is sent to our servers.
- **How Long Data is Kept**: Data persists until you manually delete it or uninstall the extension.
- **Encryption**: API keys are encrypted using AES-GCM with a key derived from your device identifier.

### 7. Your Data Rights

You have full control over your data:

- **View Settings**: Click the extension icon → Settings to view stored API keys and preferences.
- **Delete API Keys**: In Settings, click the delete/clear button next to any saved API key.
- **Revoke OAuth**: If you used Google OAuth, revoke access at [Google Account Permissions](https://myaccount.google.com/permissions).
- **Clear All Data**: Uninstalling the extension removes all locally stored data.
- **Export Data**: The extension does not currently provide a data export feature, as all data is already stored locally in your browser.

### 8. Security Measures

- API keys are encrypted using AES-GCM encryption.
- OAuth tokens are stored securely in Chrome's local storage.
- The extension uses Content Security Policy (CSP) to prevent unauthorized code execution.
- All API communications use HTTPS.

### 9. Children's Privacy

The extension is not intended for users under 13 years of age. We do not knowingly collect information from children.

### 10. Changes to This Policy

We may update this Privacy Policy from time to time. The "Last Updated" date at the top of this page indicates when the policy was last revised. Continued use of the extension after changes constitutes acceptance of the updated policy.

### 11. Contact Us

If you have questions about this Privacy Policy or how your data is handled:

- **Email**: [Your contact email - replace this]
- **GitHub Issues**: [https://github.com/innomad-io/zui-ti/issues](https://github.com/innomad-io/zui-ti/issues)
- **Website**: [innomad.io](https://innomad.io)
- **X (Twitter)**: [@innomad_io](https://x.com/innomad_io)

---

## 中文版本

### 1. 简介

ZuiTi（"我们"或"本扩展"）是一款 Chrome 浏览器扩展，帮助用户为 X（原 Twitter）平台的帖子生成 AI 驱动的回复。本隐私政策说明我们如何收集、使用和保护您的信息。

### 2. 我们收集的信息

#### 2.1 您提供的数据
- **推文内容**：当您使用回复生成功能时，扩展会读取您正在回复的推文的文本和元数据（作者账号、推文 ID）。
- **API 密钥**：如果您选择使用自己的 API 密钥访问 AI 服务，这些密钥将加密后存储在您的浏览器本地。
- **生成的回复**：扩展会在本地存储最近生成的回复历史，以提高回复多样性并应用频率限制。

#### 2.2 自动生成的数据
- **设备标识符（deviceId）**：一个随机生成的标识符，存储在本地用于加密您的 API 密钥。此 ID 不会离开您的设备。
- **使用计数器**：记录您使用了哪些 AI 模型的本地记录，用于在免费额度内智能切换模型。
- **OAuth 令牌**：如果您使用 Google OAuth 登录以使用 Gemini API，OAuth 令牌将存储在浏览器本地。

#### 2.3 我们不收集的数据
- 我们**不**收集任何分析或遥测数据。
- 我们**不**将您的数据上传到我们自己的服务器。
- 我们**不**追踪您在 X/Twitter 页面以外的浏览历史。

### 3. 我们如何使用您的信息

- **生成回复**：推文内容直接发送给第三方 AI 服务提供商（见第 4 节）以生成回复建议。
- **模型轮换**：使用计数器帮助自动在 AI 模型之间切换，以最大化免费额度使用。
- **频率限制**：本地回复历史防止重复回复并应用频率限制。
- **安全性**：API 密钥使用 AES-GCM 加密，加密密钥由您的设备标识符派生。

### 4. 第三方服务

根据您的配置，扩展会将提示词（包括推文文本和上下文）直接发送给以下第三方 AI 服务提供商：

| 服务 | 域名 | 用途 |
|------|------|------|
| **Google Gemini** | `generativelanguage.googleapis.com` | AI 回复生成 |
| **OpenAI** | `api.openai.com` | AI 回复生成 |
| **Anthropic (Claude)** | `api.anthropic.com` | AI 回复生成 |
| **DeepSeek** | `api.deepseek.com` | AI 回复生成 |

**重要提示**：当您使用回复生成功能时，您正在回复的推文内容会被发送到这些第三方服务。每个提供商都有自己的隐私政策：
- [Google 生成式 AI 隐私](https://ai.google.dev/gemini-api/terms)
- [OpenAI 隐私政策](https://openai.com/policies/privacy-policy)
- [Anthropic 隐私政策](https://www.anthropic.com/legal/privacy)
- [DeepSeek 隐私政策](https://www.deepseek.com/privacy-policy)

**OAuth 集成**：如果您使用 Google OAuth 登录，扩展将使用 OAuth 范围 `https://www.googleapis.com/auth/generative-language.retriever` 代表您访问 Google 的生成式语言 API。OAuth 客户端 ID 为：`513842350533-snqikcv73a0u72tocf8hgng2hfulq0pr.apps.googleusercontent.com`。

### 5. 权限说明

扩展请求以下 Chrome 权限：

- **`storage`**：在您的浏览器本地保存设置、加密的 API 密钥、OAuth 令牌、使用计数器和回复历史。
- **`activeTab`**：启用打开新标签页（例如，从扩展弹出窗口链接到 X/Twitter）。
- **`identity`**：启用 Google OAuth 登录以访问 Gemini API。

扩展可以访问以下域名：
- **`https://x.com/*` 和 `https://twitter.com/*`**：读取推文内容并注入回复生成 UI。
- **AI 提供商域名**：发送 API 请求以生成回复（见第 4 节）。

### 6. 数据存储和保留

- **数据存储位置**：所有数据使用 `chrome.storage.local` 和 `chrome.storage.sync` 存储在您的浏览器本地。没有数据发送到我们的服务器。
- **数据保留时间**：数据将持续存在，直到您手动删除或卸载扩展。
- **加密**：API 密钥使用 AES-GCM 加密，加密密钥由您的设备标识符派生。

### 7. 您的数据权利

您对您的数据拥有完全控制权：

- **查看设置**：点击扩展图标 → 设置，查看已保存的 API 密钥和偏好设置。
- **删除 API 密钥**：在设置中，点击任何已保存 API 密钥旁边的删除/清除按钮。
- **撤销 OAuth**：如果您使用了 Google OAuth，可在 [Google 账号权限](https://myaccount.google.com/permissions) 撤销访问权限。
- **清除所有数据**：卸载扩展将删除所有本地存储的数据。
- **导出数据**：扩展目前不提供数据导出功能，因为所有数据已经存储在您的浏览器本地。

### 8. 安全措施

- API 密钥使用 AES-GCM 加密。
- OAuth 令牌安全存储在 Chrome 的本地存储中。
- 扩展使用内容安全策略（CSP）防止未经授权的代码执行。
- 所有 API 通信使用 HTTPS。

### 9. 儿童隐私

本扩展不适用于 13 岁以下的用户。我们不会故意收集儿童的信息。

### 10. 政策变更

我们可能会不时更新本隐私政策。本页面顶部的"最后更新"日期表示政策的最后修订时间。变更后继续使用扩展即表示接受更新后的政策。

### 11. 联系我们

如果您对本隐私政策或数据处理方式有任何疑问：

- **邮箱**：[您的联系邮箱 - 请替换此处]
- **GitHub Issues**：[https://github.com/innomad-io/zui-ti/issues](https://github.com/innomad-io/zui-ti/issues)
- **网站**：[innomad.io](https://innomad.io)
- **X (Twitter)**：[@innomad_io](https://x.com/innomad_io)
