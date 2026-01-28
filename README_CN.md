# ZuiTi - X (Twitter) AI 回复助手

> 🚀 **欢迎关注作者的其他创作：关于理财、AI 和个人思考**
>
> 📝 博客：[innomad.io](https://innomad.io) ｜ 𝕏 推特：[@innomad_io](https://x.com/innomad_io)

---

ZuiTi 是一款 Chrome 浏览器扩展，帮助你在 X (Twitter) 上快速生成高质量的 AI 回复。

## 功能特点

- 🤖 **多 AI 模型支持**：Gemini、OpenAI、Claude、DeepSeek
- 🎨 **多种回复风格**：专业认真、友好亲切、幽默风趣、深度见解等 8 种风格
- 🔄 **智能模型轮换**：自动切换模型，突破免费额度限制
- 🔒 **本地加密存储**：API Key 安全存储在本地
- ⚡ **一键生成**：点击回复按钮旁的闪电图标即可生成

## 安装方式

### 方式一：下载 ZIP 包安装（推荐）

1. 前往 [Releases 页面](https://github.com/innomad-io/zui-ti/releases) 下载最新版本的 `zui-ti-vX.X.X.zip`
2. 解压 ZIP 文件到任意目录
3. 打开 Chrome 浏览器，访问 `chrome://extensions/`
4. 开启右上角的「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择刚才解压的文件夹

### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/innomad-io/zui-ti.git
cd zui-ti

# 安装依赖
pnpm install

# 构建
pnpm build

# 然后按上述步骤加载 dist 文件夹
```

## 配置 API Key

扩展安装完成后，需要配置 AI 服务的 API Key 才能使用。

### 获取 Gemini API Key（免费）

<!-- TODO: 补充截图 -->

1. 访问 [Google AI Studio](https://aistudio.google.com/apikey)
2. 登录你的 Google 账号
3. 点击「Create API Key」创建新的 API Key
4. 复制生成的 API Key

### 配置扩展

1. 点击 Chrome 工具栏中的 ZuiTi 扩展图标
2. 点击「设置」进入配置页面
3. 选择 AI 服务商（推荐 Gemini）
4. 粘贴你的 API Key
5. 点击保存

## 使用方法

1. 打开 X (Twitter) 网站
2. 找到你想回复的推文
3. 点击回复按钮，打开回复框
4. 在回复框旁边会出现一个 ⚡ 闪电图标
5. 点击闪电图标，弹出 AI 回复生成窗口
6. 选择你喜欢的回复风格
7. 等待 AI 生成回复
8. 可以直接使用生成的回复，或者进行编辑修改
9. 点击「复制」将回复复制到剪贴板，然后粘贴到回复框发送

## 回复风格说明

| 风格 | 说明 |
|------|------|
| 💼 专业认真 | 正式、专业的回复风格 |
| 😊 友好亲切 | 温暖、友好的回复风格 |
| 😄 幽默风趣 | 轻松、幽默的回复风格 |
| 🧠 深度见解 | 提供深入分析和独特见解 |
| 💪 支持鼓励 | 给予支持和鼓励 |
| 🤔 启发提问 | 通过提问引发思考 |
| ✨ 简洁精炼 | 言简意赅的回复 |
| 🎨 自定义 | 使用自定义 Prompt |

## 常见问题

### Q: 为什么提示 API Key 未配置？
A: 请按照上述「配置 API Key」步骤设置你的 API Key。

### Q: 为什么生成失败？
A: 可能是以下原因：
- API Key 无效或已过期
- 网络连接问题
- API 配额已用尽（扩展会自动尝试切换模型）

### Q: 支持哪些浏览器？
A: 目前仅支持 Chrome 及基于 Chromium 的浏览器（如 Edge、Arc、Brave 等）。

### Q: 我的 API Key 安全吗？
A: API Key 仅存储在你的浏览器本地，不会上传到任何服务器。

## 许可证

MIT
