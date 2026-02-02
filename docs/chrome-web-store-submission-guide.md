# Chrome Web Store 上架指南

本文档提供完整的 Chrome Web Store 上架流程和检查清单。

[English Version](./chrome-web-store-submission-guide-en.md)

---

## 📋 上架前检查清单

### ✅ 阶段 1：准备工作（必须完成）

- [x] **构建系统**：Vite + @crxjs/vite-plugin 配置完成
- [x] **扩展图标**：16x16、48x48、128x128 图标已准备
- [x] **隐私政策**：已创建 [`docs/privacy-policy.md`](./privacy-policy.md)
- [ ] **GitHub Pages 部署**：启用 GitHub Pages 托管隐私政策（见下方步骤）
- [ ] **商店截图**：准备至少 1 张功能截图（1280x800px 或 640x400px）
- [ ] **宣传图**（可选但推荐）：440x280px 或 920x680px

---

## 🚀 第一步：启用 GitHub Pages

### 方式一：通过 GitHub 网页界面（推荐）

1. 打开仓库页面：https://github.com/innomad-io/zui-ti
2. 点击 **Settings** 选项卡
3. 在左侧菜单找到 **Pages**
4. 在 "Source" 下拉菜单中选择：
   - **Branch**: `main` (或 `master`)
   - **Folder**: `/docs`
5. 点击 **Save**
6. 等待 1-2 分钟，页面顶部会显示：
   ```
   ✅ Your site is live at https://innomad-io.github.io/zui-ti/
   ```
7. 隐私政策 URL 将是：
   ```
   https://innomad-io.github.io/zui-ti/privacy-policy.html
   ```

### 方式二：通过命令行

```bash
# 1. 在项目根目录创建 .github/workflows/deploy-docs.yml
mkdir -p .github/workflows

# 2. 推送代码后，GitHub Actions 会自动部署
git add docs/privacy-policy.md
git commit -m "Add privacy policy for Chrome Web Store submission"
git push
```

**注意**：如果您已经有自己的网站（如 innomad.io），也可以将隐私政策放在那里，例如：
```
https://innomad.io/zui-ti/privacy-policy
```

---

## 📸 第二步：准备商店素材

### 必需素材

#### 1. 截图（至少 1 张，建议 3-5 张）

**尺寸要求**：
- 1280x800px（推荐）
- 或 640x400px

**内容建议**：
- 第 1 张：在 X/Twitter 回复框中展示「⚡ 闪电图标」按钮
- 第 2 张：点击后弹出的 AI 回复生成面板
- 第 3 张：设置页面（展示多个 AI 提供商选项）
- 第 4 张：生成的回复效果展示
- 第 5 张：多种回复风格选择界面

**制作方法**：
```bash
# macOS 截图快捷键
Cmd + Shift + 4        # 选择区域截图
Cmd + Shift + 4 + 空格  # 截取窗口

# Chrome 开发者工具设备模拟（推荐）
1. F12 打开开发者工具
2. 点击设备切换图标（Toggle device toolbar）
3. 设置自定义尺寸：1280x800
4. 截图保存
```

#### 2. 宣传图（可选但推荐）

**尺寸**：440x280px 或 920x680px

**内容建议**：
- 扩展 Logo + 标语："AI-Powered Replies for X"
- 核心功能图标：多 AI 提供商、智能轮换、安全加密

**工具推荐**：
- [Canva](https://www.canva.com/)（免费模板）
- Figma
- Adobe Express

---

## 📝 第三步：注册开发者账号

1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 使用 Google 账号登录
3. 同意开发者协议
4. **支付 5 美元一次性注册费**（必须使用信用卡）

---

## 📦 第四步：准备提交包

### 自动构建（推荐）

```bash
# 1. 安装依赖
pnpm install

# 2. 构建扩展
pnpm build

# 3. 打包 dist 目录
cd dist
zip -r ../zui-ti-v1.1.0.zip .
cd ..
```

生成的 `zui-ti-v1.1.0.zip` 即可上传到 Chrome Web Store。

### 检查清单

在上传前，请确认 `dist/` 目录包含：

- [x] `manifest.json`
- [x] `src/` 目录（包含所有编译后的代码）
- [x] `assets/` 目录（包含图标）
- [x] `content.css`
- [ ] **不包含**：`node_modules/`、`.git/`、`.env` 等开发文件

---

## 🌐 第五步：填写 Chrome Web Store 表单

### 1. 上传 ZIP 包

1. 进入 [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 点击 **"New Item"**
3. 上传 `zui-ti-v1.1.0.zip`

### 2. 填写商店详情

#### **Product Details（产品详情）**

| 字段 | 内容 |
|------|------|
| **Extension Name** | `ZuiTi - AI Reply Assistant for X` |
| **Summary** | AI-powered reply generation for X (Twitter). Support multiple AI providers (Gemini, OpenAI, Claude, DeepSeek) with smart model rotation. |
| **Description** | 复制下方详细描述 ↓ |
| **Category** | Social & Communication |
| **Language** | English (可添加中文为次要语言) |

**详细描述（Description）**：

```
ZuiTi helps you quickly generate high-quality AI-powered replies on X (Twitter) with just one click.

🚀 KEY FEATURES
• Multiple AI Providers: Gemini, OpenAI, Claude, DeepSeek
• Smart Model Rotation: Automatically switches models to maximize free quota
• 8 Reply Styles: Professional, Friendly, Humorous, Insightful, Supportive, Questioning, Concise, Custom
• Secure: API keys encrypted and stored locally (never uploaded to our servers)
• One-Click Generation: Click the ⚡ lightning icon next to the reply button

🔒 PRIVACY & SECURITY
Your API keys are encrypted using AES-GCM and stored only in your browser's local storage. We never collect analytics or upload your data to our servers. See our Privacy Policy for details.

📖 HOW TO USE
1. Install the extension
2. Click the extension icon → Settings
3. Add your API key (get free Gemini API key at https://aistudio.google.com/apikey)
4. Visit X (Twitter) and find a tweet to reply to
5. Click the ⚡ lightning icon next to the reply box
6. Select your preferred reply style
7. AI generates the reply → Click "Copy" → Paste and send

🆓 FREE QUOTA
• Gemini: 15 requests/min
• DeepSeek: 10 requests/min
• OpenAI/Claude: Depends on your API key

💡 SMART MODEL ROTATION
The extension automatically tracks your usage and switches models to maximize free quota utilization.

⭐ SUPPORT
GitHub: https://github.com/innomad-io/zui-ti
X (Twitter): @innomad_io
```

#### **Graphic Assets（图形素材）**

| 素材 | 尺寸 | 必需 | 文件路径 |
|------|------|------|----------|
| 商店图标 | 128x128 | ✅ 是 | `src/assets/icons/icon128.png` |
| 截图 1-5 | 1280x800 | ✅ 至少 1 张 | 需要自己创建（见上方"准备商店素材"） |
| 宣传小图 | 440x280 | ❌ 否 | 可选 |
| 宣传大图 | 920x680 | ❌ 否 | 可选 |

#### **Privacy Practices（隐私实践）**

这是**最重要**的部分，必须准确填写，否则会被拒审。

**Single Purpose（单一目的）**：
```
Generate AI-powered replies for posts on X (Twitter)
```

**Permission Justification（权限说明）**：

| 权限 | 说明（复制到表单） |
|------|-------------------|
| `storage` | Store user settings, encrypted API keys, OAuth tokens, and local reply history to provide reply generation functionality. |
| `activeTab` | Open X (Twitter) pages from the extension popup. |
| `identity` | Enable Google OAuth sign-in for Gemini API access. |
| `host_permissions: x.com, twitter.com` | Read tweet content to generate contextual replies and inject the reply generation UI. |
| `host_permissions: AI provider domains` | Send API requests to third-party AI providers (Google Gemini, OpenAI, Anthropic, DeepSeek) for reply generation. |

**Data Usage（数据使用）**：

**☑️ Does this extension collect user data?**  
→ 选择 **Yes**

然后填写：

| 问题 | 答案 |
|------|------|
| What data is collected? | • Tweet content and metadata (text, author, tweet ID)<br>• API keys (encrypted, stored locally)<br>• Device identifier (deviceId, generated locally)<br>• OAuth tokens (if Google sign-in is used)<br>• Local reply history |
| How is the data used? | To generate AI-powered replies by sending prompts to third-party AI providers. |
| Is data shared with third parties? | **Yes** - Tweet content and prompts are sent to AI service providers (Google Gemini, OpenAI, Anthropic, DeepSeek) as necessary to generate replies. |
| Is data sent off the user's device? | **Yes** - Only to third-party AI providers for reply generation. No data is sent to the developer's servers. |
| Is data used for purposes unrelated to the extension's core functionality? | **No** |
| Is data sold? | **No** |

**Privacy Policy URL（隐私政策链接）**：
```
https://innomad-io.github.io/zui-ti/privacy-policy.html
```
（或您自己网站的链接）

#### **Distribution（分发设置）**

| 字段 | 建议 |
|------|------|
| **Visibility** | Public（公开） |
| **Countries** | All regions（所有地区） |

---

## ✅ 第六步：提交审核

1. 检查所有信息无误
2. 点击 **"Submit for Review"**
3. 等待审核（通常 1-3 个工作日）

### 审核常见拒审原因

| 原因 | 解决方法 |
|------|----------|
| 功能描述不清晰 | 确保描述准确说明扩展功能 |
| 权限说明不足 | 在 Permission Justification 中详细说明每个权限的用途 |
| 缺少隐私政策 | 确保隐私政策 URL 可访问且内容完整 |
| 图标/截图不符合规范 | 检查尺寸和格式（PNG/JPEG） |
| 敏感权限未充分说明 | 详细说明为何需要 `storage`、`identity` 等权限 |

---

## 🎉 审核通过后

1. **更新发布**：
   ```bash
   # 修改版本号
   vim manifest.json  # 修改 "version": "1.1.1"
   vim package.json   # 修改 "version": "1.1.1"
   
   # 构建并打包
   pnpm build
   cd dist && zip -r ../zui-ti-v1.1.1.zip . && cd ..
   
   # 上传到 Developer Dashboard
   ```

2. **监控反馈**：
   - 查看用户评论
   - 检查安装量和评分
   - 及时响应用户反馈

---

## 📞 需要帮助？

- **GitHub Issues**: https://github.com/innomad-io/zui-ti/issues
- **邮箱**: [需要添加您的联系邮箱]
- **X (Twitter)**: [@innomad_io](https://x.com/innomad_io)

---

## 附录：快速命令参考

```bash
# 构建扩展
pnpm install && pnpm build

# 打包 ZIP
cd dist && zip -r ../zui-ti-v$(grep -o '"version": "[^"]*' ../package.json | cut -d'"' -f4).zip . && cd ..

# 本地测试
# 1. 打开 chrome://extensions/
# 2. 启用"开发者模式"
# 3. 点击"加载已解压的扩展程序"
# 4. 选择 dist/ 目录
```

---

**最后更新**：2026-01-31
