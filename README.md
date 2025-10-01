# LibreChat Search Stack Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://librechatlocalwebsearchstack.netlify.app/)

**🌐 Try it now: [https://librechatlocalwebsearchstack.netlify.app/](https://librechatlocalwebsearchstack.netlify.app/)**

## 🔗 Works With LibreChatConfigurator

This tool is designed to work in tandem with **[LibreChatConfigurator](https://github.com/Fritsl/LibreChatConfigurator)** - together they provide a complete 1-click LibreChat search infrastructure setup:

**How They Work Together:**

1. **🔧 LibreChat Search Stack Generator (this tool)** → Generates Docker containers and configuration
   - Creates Docker Compose files for SearXNG, Jina Reader, and BGE Reranker
   - Generates `search-stack-config.json` with all search settings
   - Provides installation scripts for 1-click Docker deployment

2. **⚙️ LibreChatConfigurator** → Configures LibreChat application settings
   - Import the `search-stack-config.json` to auto-fill search settings
   - Configure AI providers, OAuth, database, and all other LibreChat options
   - Generate complete LibreChat deployment files

**Complete Workflow:**
```
Generate Search Stack → Import JSON Config → Configure LibreChat → Deploy Everything
     (this tool)      →  (LibreChatConfigurator)  →        (1-click setup)
```

## Why This Exists

**LibreChat's search capabilities require multiple Docker services working together.** Setting up SearXNG for search, Jina Reader for web scraping, and BGE Reranker for result ranking involves:

- Finding the right Docker images (many are outdated or broken)
- Configuring ports, environment variables, and resource limits
- Writing Docker Compose files with proper service definitions
- Creating installation scripts for different operating systems
- Manually configuring LibreChat to connect to these services

**This tool solves that.** Generate a complete, tested search infrastructure package in one click:

- **Tested Docker Images** - Uses working, community-maintained images (no broken containers)
- **1-Click Installation** - Download a complete package with Docker Compose, environment files, and bash scripts
- **Auto-Configuration** - Includes JSON config that imports directly into LibreChatConfigurator
- **Resource Optimized** - Pre-configured memory limits and health checks
- **Beginner-Friendly** - No Docker knowledge required

## How to Use

**This tool generates Docker infrastructure packages. It doesn't run Docker itself - the generated files work on your local machine or server.**

### 🌐 Use Online (Full Features)

**[Launch Search Stack Generator](https://librechatlocalwebsearchstack.netlify.app/)** 

- ✅ Configure all search service settings
- ✅ Preview all generated files in real-time
- ✅ Download complete ZIP package with all configuration files
- ✅ Export JSON configuration for LibreChatConfigurator
- ✅ No installation required - runs entirely in your browser

### 💻 Run Locally (Alternative)

**Prerequisites:** Node.js 20+ is required

<details>
<summary><strong>📦 Install Node.js (click to expand)</strong></summary>

**Windows:**
```powershell
# Download and run installer from nodejs.org
# Or use winget:
winget install OpenJS.NodeJS
```

**macOS:**
```bash
# Using Homebrew (recommended):
brew install node

# Or download installer from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
# Install Node.js 20:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify installation (all platforms):**
```bash
node --version   # Should show v20.x.x or higher
npm --version    # Should show npm version
```
</details>

<a id="quick-start"></a>

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/librechat-search-stack.git

# Navigate to folder
cd librechat-search-stack

# Install dependencies
npm install

# Start the development server
npm run dev

# Open http://localhost:5000 in your browser
```

**What you get locally:**
- ✅ Configure SearXNG, Jina Reader, and BGE Reranker services
- ✅ Real-time preview of all generated files
- ✅ Download individual files or complete ZIP package
- ✅ Generate `search-stack-config.json` for LibreChatConfigurator import
- ✅ 1-click installation script included

## Production Build

For production deployment:

```bash
npm run build
npm start
```

The app will build and serve on port 5000 in production mode.

## Features

- **3 Essential Search Services**: Configure SearXNG, Jina Reader (Firecrawl alternative), and BGE Reranker v2-m3
- **Tested Docker Images**: Uses working community-maintained images (no broken containers)
- **Live Preview**: See docker-compose.yml, .env.example, README.md, and install script in real-time
- **JSON Export**: Generate `search-stack-config.json` that imports directly into LibreChatConfigurator
- **Complete Package**: Download ZIP with all 5 files ready for deployment
- **1-Click Installation**: Bash script included for automatic Docker deployment

## What's Included in the Package

When you click **"Generate & Download"**, you get a ZIP file containing:

### 📄 Generated Files

| File | Description |
|------|-------------|
| `docker-compose.yml` | Complete Docker Compose configuration with all 3 services |
| `.env.example` | Environment variables template with your configured ports |
| `README.md` | Setup instructions and service documentation |
| `install_dockerimage.sh` | 1-click bash installation script |
| `search-stack-config.json` | LibreChat search configuration (import into LibreChatConfigurator) |

### 🐳 Docker Services

| Service | Docker Image | Purpose | Default Port |
|---------|--------------|---------|--------------|
| **SearXNG** | `searxng/searxng:latest` | Meta-search engine (Google, Bing, etc.) | 8080 |
| **Jina Reader** | `ghcr.io/intergalacticalvariable/reader` | Web scraping & content extraction | 3000 |
| **BGE Reranker** | `wkao/bge-reranker-v2-m3` | ML-based result ranking | 8787 |

## Integration with LibreChatConfigurator

### Step-by-Step Integration

1. **Generate Search Stack** (this tool)
   - Configure service ports and resource limits
   - Click **"Generate & Download"** to get the ZIP package
   - Extract the package and run `./install_dockerimage.sh`

2. **Import Configuration** ([LibreChatConfigurator](https://github.com/Fritsl/LibreChatConfigurator))
   - Open LibreChatConfigurator
   - Go to **Package → Load Configuration**
   - Import the `search-stack-config.json` file
   - Search settings auto-populate with your Docker service URLs

3. **Complete LibreChat Setup** (LibreChatConfigurator)
   - Configure AI providers (OpenAI, Anthropic, etc.)
   - Set up authentication and OAuth
   - Generate LibreChat deployment files

4. **Deploy Everything**
   - Docker search stack runs on your configured ports
   - LibreChat connects to local search services
   - Complete AI-powered search infrastructure ready!

### Configuration Mapping

The `search-stack-config.json` uses LibreChat's official configuration structure:

```json
{
  "name": "Search Stack Configuration",
  "configuration": {
    "webSearch": {
      "searchProvider": "searxng",
      "searxngInstanceUrl": "http://localhost:8080",
      "scraperType": "firecrawl",
      "firecrawlApiUrl": "http://localhost:3000",
      "rerankerType": "jina",
      "jinaRerankerUrl": "http://localhost:8787",
      "safeSearch": true
    }
  }
}
```

**Note:** Ports match your Docker configuration. LibreChatConfigurator reads these values and configures LibreChat to connect to your local search stack.

## Service Configuration

### SearXNG (Search Engine)
- **Purpose**: Meta-search aggregating results from Google, Bing, DuckDuckGo, etc.
- **Default Port**: 8080
- **Resource Limits**: 512MB RAM
- **Environment**: Safe search enabled, JSON format output

### Jina Reader (Web Scraper)
- **Purpose**: Firecrawl-compatible content extraction and web scraping
- **Default Port**: 3000
- **Docker Image**: `ghcr.io/intergalacticalvariable/reader` (community-maintained)
- **Resource Limits**: 1GB RAM

### BGE Reranker v2-m3 (Result Ranking)
- **Purpose**: ML-based reranking for better search result quality
- **Default Port**: 8787
- **Docker Image**: `wkao/bge-reranker-v2-m3` (working community build)
- **Resource Limits**: 2GB RAM
- **Model**: BAAI/bge-reranker-v2-m3

## Architecture

This project follows the same architecture as LibreChatConfigurator for consistency:

```
LibreChat Search Stack Generator
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Service Cards, Preview Panel
│   │   ├── lib/           # File Generation Logic
│   │   ├── pages/         # Home Page
│   │   └── hooks/         # Configuration State
├── server/                 # Express Backend (minimal)
│   ├── routes.ts          # No API routes needed (client-side generation)
│   └── vite.ts            # Development Server
├── shared/                 # Shared Types & Schemas
│   └── schema.ts          # Service Configuration Schemas
└── README.md              # This file
```

### Data Flow

1. **User Input** → Service configuration forms (ports, resources)
2. **Client-Side Generation** → JSZip creates files in browser
3. **File Download** → User gets complete package with all files
4. **Docker Deployment** → User runs installation script
5. **LibreChat Integration** → Import JSON into LibreChatConfigurator

### Key Technical Decisions

- **Client-Side File Generation**: All files generated in browser using JSZip (no backend needed)
- **No Database Required**: Simple configuration tool, no data persistence
- **Reusable Components**: Service cards and preview panels
- **Type Safety**: Zod schemas ensure valid configurations

## For Developers

- **Frontend**: `/client` - React with TypeScript, Tailwind CSS, and shadcn/ui components
- **File Generation**: `/client/src/lib/file-generator.ts` - Docker Compose, env, JSON, and script generation
- **Shared**: `/shared` - Service configuration schemas
- **Presets**: `/client/src/lib/presets.ts` - Default service configurations

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
```

### Adding New Services

1. **Update Schema**: Add new service to `/shared/schema.ts`
2. **Add Preset**: Configure defaults in `/client/src/lib/presets.ts`
3. **Update Generator**: Modify `/client/src/lib/file-generator.ts` to include new service
4. **Add UI Card**: Create service configuration card in `/client/src/components/`
5. **Update JSON Export**: Include new service settings in JSON configuration

## Contributing

We welcome contributions! This tool complements LibreChatConfigurator and should evolve together.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-service`
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description

### Areas We Need Help

- **New Search Services**: Add support for additional search engines or scrapers
- **Docker Image Updates**: Keep track of working community images
- **UI/UX Improvements**: Enhance configuration experience
- **Documentation**: Improve setup guides and integration docs
- **Testing**: Add comprehensive test coverage

## Related Projects

- **[LibreChatConfigurator](https://github.com/Fritsl/LibreChatConfigurator)** - Complete LibreChat configuration tool
- **[LibreChat](https://github.com/danny-avila/LibreChat)** - Enhanced ChatGPT clone with multiple AI providers

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **LibreChat Team** - For creating an amazing open-source AI chat platform
- **Community Docker Maintainers** - For keeping Jina Reader and BGE Reranker images working
- **SearXNG Project** - For the privacy-focused meta-search engine
- **LibreChatConfigurator** - For inspiring the configuration tool approach
