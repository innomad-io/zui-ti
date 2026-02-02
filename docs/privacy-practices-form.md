# Chrome Web Store 隐私实践表单填写指南

本文档提供 Chrome Web Store "Privacy Practices" 标签页所需的所有文案。

---

## ✅ 第一步：账户设置 (Account Tab)

在发布前，您需要：

1. **添加联系邮箱**
   - 进入 Account 标签页
   - 填写您的联系邮箱（建议使用与 @innomad_io 相关的邮箱）
   
2. **验证邮箱**
   - Chrome Web Store 会发送验证邮件
   - 点击邮件中的验证链接

---

## 📋 第二步：隐私实践表单 (Privacy Practices Tab)

以下是每个必填字段的完整答案，**可以直接复制粘贴**。

---

### 1. Single Purpose Description（单一目的描述）

**问题**: What is the single purpose of your extension?

**答案** (直接复制):
```
Generate AI-powered replies for posts on X (Twitter) to help users engage with content more efficiently and effectively.
```

**字符数**: 135

---

### 2. Permission Justifications（权限说明）

#### 🔹 activeTab

**问题**: Justify your use of activeTab

**答案** (直接复制):
```
The activeTab permission is used to open X (Twitter) pages when users click links in the extension popup. This provides a seamless user experience when navigating from the extension settings to X (Twitter). No tab content is accessed or read without explicit user action.
```

---

#### 🔹 storage

**问题**: Justify your use of storage

**答案** (直接复制):
```
The storage permission is required to:
1. Save user settings and preferences (selected AI provider, reply style)
2. Store encrypted API keys locally using AES-GCM encryption
3. Store OAuth tokens when users sign in with Google for Gemini API access
4. Maintain a local history of recently generated replies for similarity checking and rate limiting
5. Track AI model usage counts for smart model rotation feature

All data is stored locally in the user's browser using chrome.storage.local and chrome.storage.sync. No data is transmitted to the developer's servers. Users can delete all stored data by uninstalling the extension or clearing data from the settings page.
```

---

#### 🔹 identity

**问题**: Justify your use of identity

**答案** (直接复制):
```
The identity permission is used to enable Google OAuth sign-in for users who want to access Google's Gemini API without manually entering an API key. When users choose to sign in with Google, this permission allows the extension to:
1. Authenticate users via chrome.identity.getAuthToken
2. Obtain an OAuth token with scope "https://www.googleapis.com/auth/generative-language.retriever"
3. Use the token to call Google's Generative Language API on the user's behalf

The OAuth token is stored locally in the user's browser and can be revoked at any time via Google Account settings. This is an optional feature - users can alternatively use manual API key entry.
```

---

#### 🔹 Host Permissions

**问题**: Justify your use of host permissions

**答案** (直接复制):
```
Host permissions are required for the following purposes:

1. https://x.com/* and https://twitter.com/*
   - Read tweet content (text, author handle, tweet ID) to provide context for AI reply generation
   - Inject the extension UI (lightning icon button) next to reply boxes
   - Enable the content script to function on X (Twitter) pages
   - This is the core functionality of the extension

2. https://api.openai.com/*
   - Send API requests to OpenAI's GPT models for reply generation when user selects OpenAI as their provider
   
3. https://generativelanguage.googleapis.com/*
   - Send API requests to Google's Gemini API for reply generation when user selects Gemini as their provider
   
4. https://api.anthropic.com/*
   - Send API requests to Anthropic's Claude models for reply generation when user selects Claude as their provider
   
5. https://api.deepseek.com/*
   - Send API requests to DeepSeek API for reply generation when user selects DeepSeek as their provider

All API calls are made directly from the extension to the respective AI providers using the user's own API keys. No intermediate servers are used. The extension only accesses these domains when the user explicitly triggers reply generation.
```

---

### 3. Remote Code Justification（远程代码说明）

**问题**: Does your extension execute remotely hosted code?

**答案**: 
- ☑️ **No** (选择 No)

**如果系统要求说明**:
```
This extension does NOT execute remotely hosted code. All extension code is bundled within the package submitted to Chrome Web Store. The extension only makes API calls to AI service providers (Google Gemini, OpenAI, Anthropic, DeepSeek) to send text prompts and receive text responses. No code is downloaded or executed from remote servers.
```

---

### 4. Data Usage Certification（数据使用认证）

#### ☑️ Does your extension handle personal or sensitive user data?

**答案**: **Yes** (选择 Yes)

---

#### Data Collection Details（数据收集详情）

**☑️ What data is collected?**

勾选以下选项并填写说明：

1. **☑️ Personal communications**
   ```
   Tweet text content and author information from X (Twitter) that users choose to reply to. This data is sent to the user's selected AI provider to generate contextual replies.
   ```

2. **☑️ Authentication information**
   ```
   User API keys for AI services (OpenAI, Anthropic, DeepSeek) are encrypted with AES-GCM and stored locally. Google OAuth tokens are stored locally when users sign in with Google for Gemini access.
   ```

3. **☑️ User-generated content**
   ```
   Generated reply history stored locally for similarity checking and rate limiting. Users can clear this data at any time.
   ```

---

#### ☑️ How is the data used?

**Primary purpose**:
```
App functionality - To generate contextual AI replies for X (Twitter) posts based on the original tweet content and user's selected style.
```

**Additional uses**:
- ☑️ None - the data is only used for the primary purpose above

---

#### ☑️ Is data shared with third parties?

**答案**: **Yes** (选择 Yes)

**Third parties receiving data**:
```
Tweet content and user prompts are sent to the following third-party AI service providers based on user's selection:
- Google (Generative Language API / Gemini)
- OpenAI (GPT models)
- Anthropic (Claude models)  
- DeepSeek (DeepSeek models)

Data is sent directly from the extension to these providers using the user's own API keys. No data passes through the developer's servers. Each provider has their own privacy policy governing data usage.
```

**Purpose of data sharing**:
```
To generate AI-powered reply suggestions. This is the core functionality of the extension and users explicitly trigger this by clicking the reply generation button.
```

---

#### ☑️ How is data transmitted?

勾选以下选项:
- ☑️ **Data is transmitted over a secure connection** (HTTPS)

说明:
```
All API requests to AI providers use HTTPS. API keys are encrypted locally with AES-GCM before storage. OAuth tokens are handled securely via Chrome's identity API.
```

---

#### ☑️ Data retention and deletion

**Data retention**:
```
Local storage: Data persists in the user's browser until they uninstall the extension or manually clear it from settings.

Third-party AI providers: Data handling and retention is governed by each provider's privacy policy. We recommend users review the privacy policies of their chosen AI provider.
```

**How users can delete data**:
```
Users can delete stored data by:
1. Uninstalling the extension (removes all local data)
2. Clearing API keys from the extension settings page
3. Revoking OAuth access via Google Account settings (for Gemini OAuth users)
4. Clearing browser data via Chrome settings
```

---

### 5. Compliance Certification（合规认证）

#### ☑️ Certify compliance with policies

在提交前，您需要勾选:

- ☑️ **I certify that my extension complies with Chrome Web Store policies, including the User Data Privacy policy**

- ☑️ **I certify that my extension's use of personal or sensitive data complies with the Limited Use requirements**

---

## 📋 快速检查清单

提交前确认以下所有项目:

- [ ] **Account Tab**: 联系邮箱已添加并验证
- [ ] **Privacy Practices Tab - Single Purpose**: 已填写单一目的描述
- [ ] **Privacy Practices Tab - activeTab**: 权限说明已填写
- [ ] **Privacy Practices Tab - storage**: 权限说明已填写  
- [ ] **Privacy Practices Tab - identity**: 权限说明已填写
- [ ] **Privacy Practices Tab - Host Permissions**: 权限说明已填写
- [ ] **Privacy Practices Tab - Remote Code**: 已选择 "No"
- [ ] **Privacy Practices Tab - Data Usage**: 数据收集和使用详情已填写
- [ ] **Privacy Practices Tab - Certification**: 已勾选合规认证

---

## 💡 填写技巧

1. **复制粘贴**: 所有文案都可以直接复制粘贴，已针对 Chrome Web Store 要求优化

2. **保存草稿**: 填写每个部分后记得点击 "Save draft"

3. **字符限制**: 如果某个字段有字符限制且文案超出，可以删除示例部分或联系我缩减

4. **诚实透明**: 所有说明都基于实际代码行为，符合商店政策

---

## 🔗 相关政策链接

在填写时可能需要参考:
- [Chrome Web Store User Data FAQ](https://developer.chrome.com/docs/webstore/user_data/)
- [Limited Use Policy](https://developer.chrome.com/docs/webstore/program-policies/limited-use/)
- [Privacy Policy Guidelines](https://developer.chrome.com/docs/webstore/privacy/)

---

## 📞 需要帮助？

如果填写时遇到问题:
1. 检查是否所有必填字段都已填写
2. 确认邮箱已验证
3. 确保隐私政策 URL 可访问: https://innomad-io.github.io/zui-ti/privacy-policy.html

---

**准备好所有文案！现在可以填写 Privacy Practices 表单了。** ✅
