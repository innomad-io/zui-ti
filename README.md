# ZuiTi - AI Reply Assistant for X (Twitter)

> 🚀 **Follow the author for more content on investing, AI, and personal reflections**
>
> 📝 Blog: [innomad.io](https://innomad.io) ｜ 𝕏 Twitter: [@innomad_io](https://x.com/innomad_io)

---

[中文文档](./README_CN.md)

ZuiTi is a Chrome extension that helps you quickly generate high-quality AI-powered replies on X (Twitter).

## Features

- 🤖 **Multiple AI Providers**: Gemini, OpenAI, Claude, DeepSeek
- 🎨 **Multiple Reply Styles**: Professional, Friendly, Humorous, Insightful, and more
- 🔄 **Smart Model Rotation**: Automatically switches models to maximize free quota
- 🔒 **Secure Local Storage**: API keys are encrypted and stored locally
- ⚡ **One-Click Generation**: Click the lightning icon next to the reply button

## Installation

### Option 1: Download ZIP (Recommended)

1. Go to the [Releases page](https://github.com/innomad-io/zui-ti/releases) and download the latest `zui-ti-vX.X.X.zip`
2. Extract the ZIP file to any directory
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right corner
5. Click "Load unpacked"
6. Select the extracted folder

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/innomad-io/zui-ti.git
cd zui-ti

# Install dependencies
pnpm install

# Build
pnpm build

# Then load the dist folder as described above
```

## Configuration

After installation, you need to configure an API key to use the extension.

### Get a Gemini API Key (Free)

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Configure the Extension

1. Click the ZuiTi extension icon in Chrome toolbar
2. Click "Settings" to open the configuration page
3. Select your AI provider (Gemini recommended)
4. Paste your API key
5. Click Save

## Usage

1. Open X (Twitter)
2. Find a tweet you want to reply to
3. Click the reply button to open the reply box
4. A ⚡ lightning icon will appear next to the reply box
5. Click the lightning icon to open the AI reply generator
6. Select your preferred reply style
7. Wait for AI to generate the reply
8. Edit if needed, then click "Copy" to copy to clipboard
9. Paste into the reply box and send

## Reply Styles

| Style | Description |
|-------|-------------|
| 💼 Professional | Formal and professional tone |
| 😊 Friendly | Warm and approachable tone |
| 😄 Humorous | Light-hearted and witty tone |
| 🧠 Insightful | Deep analysis and unique perspectives |
| 💪 Supportive | Encouraging and empathetic tone |
| 🤔 Questioning | Thought-provoking questions |
| ✨ Concise | Brief and to the point |
| 🎨 Custom | Use your own custom prompt |

## FAQ

### Q: Why does it say API Key not configured?
A: Please follow the "Configuration" steps above to set up your API key.

### Q: Why did generation fail?
A: Possible reasons:
- Invalid or expired API key
- Network connection issues
- API quota exhausted (the extension will automatically try switching models)

### Q: Which browsers are supported?
A: Currently supports Chrome and Chromium-based browsers (Edge, Arc, Brave, etc.).

### Q: Is my API key secure?
A: Your API key is stored only in your browser's local storage and is never uploaded to any server.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Privacy

Your privacy is important to us. Please read our [Privacy Policy](./docs/privacy-policy.md) to understand how we handle your data.

**Key Points:**
- API keys are encrypted and stored locally in your browser
- No data is uploaded to our servers
- Tweet content is sent only to third-party AI providers (Gemini, OpenAI, Claude, DeepSeek)
- No analytics or telemetry collected

## License

MIT
