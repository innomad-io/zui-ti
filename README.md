# X AI Reply Assistant

AI-powered reply generation for X (Twitter).

## Features

- AI-powered reply generation (Gemini, OpenAI, Claude, DeepSeek)
- Multiple reply styles (Professional, Friendly, Humorous, etc.)
- Anti-detection measures (rate limiting, content variation)
- Secure API key storage (encrypted locally)

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Loading the Extension

1. Run `pnpm build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder

## Configuration

1. Click the extension icon and go to Settings
2. Select your AI provider
3. Enter your API key
4. Configure safety settings

## License

MIT
