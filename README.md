# CopilotKit MCP Apps Demo

This project demonstrates how to integrate **MCP (Model Context Protocol) Apps** with **CopilotKit** to create interactive AI-powered applications.

## Features

- **CopilotKit Integration**: AI-powered chat sidebar with streaming responses
- **MCP Server**: Sample MCP server with demo tools (weather, calculator, time, UUID generator, word counter)
- **Next.js 16**: Modern React framework with App Router
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Google Gemini API Key

### Installation

1. Clone and install dependencies:

```bash
npm install
npm run mcp:install
```

2. Configure environment variables:

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and add your Google Gemini API key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
```

3. Start the development servers:

```bash
npm run dev
```

This will start:
- Next.js app on `http://localhost:3000`
- MCP server on `http://localhost:3100`

### Running Separately

To run the servers separately:

```bash
# Terminal 1: Start MCP server
npm run dev:mcp

# Terminal 2: Start Next.js
npm run dev:next
```

## Project Structure

```
copilotmcpapp/
├── src/
│   └── app/
│       ├── api/
│       │   └── copilotkit/
│       │       └── route.ts    # CopilotKit API endpoint
│       ├── layout.tsx          # Root layout with CopilotKit provider
│       ├── page.tsx            # Main page with CopilotSidebar
│       └── globals.css         # Global styles
├── mcp-server/
│   ├── index.js                # MCP server with demo tools
│   └── package.json            # MCP server dependencies
├── .env.example                # Environment variables template
├── .env.local                  # Local environment variables
└── package.json                # Main project dependencies
```

## Available MCP Tools

The demo MCP server includes these tools:

| Tool | Description |
|------|-------------|
| `get_weather` | Get simulated weather data for a location |
| `calculate` | Perform mathematical calculations |
| `get_time` | Get current time for a timezone |
| `generate_uuid` | Generate a random UUID |
| `word_count` | Count words, characters, and lines in text |

## Customization

### Adding Custom Tools

Edit `mcp-server/index.js` to add new tools:

1. Add the tool definition to the `tools` array
2. Add the handler in the `switch` statement in `handleToolCall`

### Connecting External MCP Servers

Update the `MCP_SERVER_URL` in `.env.local` to connect to a different MCP server.

## Learn More

- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [MCP Apps Specification](https://docs.copilotkit.ai/generative-ui/specs/mcp-apps)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
