# LibreChat Search Stack Generator

## 🎥 Demo (Coming Soon)

<!-- Add video demo when available -->
**[▶️ Try the live demo](https://librechatlocalwebsearchstack.netlify.app/)** - Generate your local search stack in seconds!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![LibreChat](https://img.shields.io/badge/LibreChat-v0.7.9+-blue)](https://www.librechat.ai/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://librechatlocalwebsearchstack.netlify.app/)

## 🔗 Side Tool for LibreChatConfigurator

This is a **companion tool** for **[LibreChatConfigurator](https://github.com/Fritsl/LibreChatConfigurator)** that simplifies setting up a local search stack for LibreChat.

**Main Tool: [LibreChatConfigurator](https://github.com/Fritsl/LibreChatConfigurator)** - Configure all LibreChat settings (AI providers, OAuth, database, etc.)

**This Tool: Local Search Stack Generator** - Generate Docker containers for LibreChat's search capabilities when you need them

**How They Work Together:**

1. **⚙️ Start with LibreChatConfigurator** - Configure your LibreChat instance
   - Set up AI providers (OpenAI, Anthropic, etc.)
   - Configure authentication and OAuth
   - Set up database and file storage

2. **🔍 When you need local search** - Use this tool to generate the Docker stack
   - Configure SearXNG, Jina Reader, and BGE Reranker services
   - Download the generated package with Docker Compose files
   - Run the installation script to deploy services

3. **🔄 Import configuration back** - Auto-configure LibreChat's search settings
   - In LibreChatConfigurator: **Configuration → Import Merge JSON**
   - Or directly under **Search** section, use the import function
   - Your local search stack is now connected to LibreChat!

**Complete Workflow:**
```
LibreChatConfigurator → Need Local Search? → Generate Stack → Run Install → Import JSON Config
   (main tool)              (this tool)         (Docker)      (back to main tool)
```

## Why This Exists

**LibreChat's local search stack requires three Docker services working in harmony, but setting them up shouldn't require hours of Docker debugging.**

Configuring LibreChat's web search feature (available in v0.7.9+) involves deploying SearXNG for meta-search, Jina Reader for web scraping, and BGE Reranker for ML-powered result ranking. This requires:

- Finding working Docker images (many community images are outdated or broken)
- Configuring complex networking between containers and LibreChat
- Setting up environment variables, ports, and resource limits correctly
- Writing Docker Compose files with health checks and restart policies
- Creating cross-platform installation scripts
- Manually configuring LibreChat's YAML to connect to these services

**This tool solves that.** Whether you're setting up LibreChat for your own use or deploying for others, you get:

- **Working Docker Images** - Pre-tested, community-maintained images (no broken containers)
- **Docker Networking** - Automatic shared network setup for LibreChat container communication
- **1-Click Installation** - Complete package with Docker Compose, scripts for Windows/Mac/Linux
- **Auto-Configuration** - JSON config that imports directly into LibreChatConfigurator
- **Resource Optimized** - Pre-configured memory limits and health checks for stable operation
- **Beginner-Friendly** - No Docker or YAML knowledge required

**Built by the community, for the community.** As LibreChat adds new search features, this tool evolves with it. Missing a configuration option or want to add a new service? Contributions welcome!

**Help make LibreChat's search accessible to everyone.** Whether you're fixing a bug, improving Docker configurations, or enhancing the user experience, your contributions help more people deploy powerful local search without the setup headaches.

## Quick Start - Use Online

**When you reach the search configuration step in [LibreChatConfigurator](https://github.com/Fritsl/LibreChatConfigurator)**, follow this workflow:

### 🚀 1-Minute Setup

1. **Open the online generator**: [https://librechatlocalwebsearchstack.netlify.app/](https://librechatlocalwebsearchstack.netlify.app/)

2. **Configure your services** (optional - defaults work great!)
   - Adjust ports if needed
   - Set resource limits for your system
   - Click **"Generate & Download"**

3. **Install the Docker stack**
   ```bash
   # Extract the downloaded ZIP
   unzip librechat-search-stack.zip
   cd librechat-search-stack
   
   # Run the installation script
   ./install_dockerimage.sh    # Unix/Linux/Mac
   # OR
   install_dockerimage.bat     # Windows
   ```

4. **Import into LibreChatConfigurator**
   - Open the extracted folder and find `search-stack-config.json`
   - In LibreChatConfigurator: **Configuration → Import Merge JSON**
   - Or use the import function directly under the **Search** section
   - Select the `search-stack-config.json` file
   - Done! Your search settings are auto-configured 🎉

### ✨ What You Get

- ✅ No installation required - runs entirely in your browser
- ✅ Configure all search service settings with live preview
- ✅ Download complete ZIP package with all configuration files
- ✅ Export JSON configuration for LibreChatConfigurator import
- ✅ 1-click installation scripts for all platforms

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

### Run Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/librechat-search-stack.git
cd librechat-search-stack

# Install dependencies
npm install

# Start the development server
npm run dev

# Open http://localhost:5000 in your browser
```

Same features as the online version, but running on your own machine.

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
- **Live Preview**: See docker-compose.yml, .env, README.md, and install scripts in real-time
- **JSON Export**: Generate `search-stack-config.json` that imports directly into LibreChatConfigurator
- **Complete Package**: Download ZIP with all 5 files ready for deployment
- **1-Click Installation**: Bash script included for automatic Docker deployment

## What's Included in the Package

When you click **"Generate & Download"**, you get a ZIP file containing:

### 📄 Generated Files

| File | Description |
|------|-------------|
| `docker-compose.yml` | Complete Docker Compose configuration with all 3 services |
| `.env` | Pre-configured environment variables (ready to use, no editing needed) |
| `README.md` | Setup instructions and service documentation |
| `install_dockerimage.sh` | Unix/Linux/Mac installation script |
| `install_dockerimage.bat` | Windows installation script |
| `search-stack-config.json` | **LibreChat search configuration** - Import into LibreChatConfigurator |
| `test_services.py` | Python test script to verify all services are working |

### 🐳 Docker Services

| Service | Docker Image | Purpose | Default Port |
|---------|--------------|---------|--------------|
| **SearXNG** | `searxng/searxng:latest` | Meta-search engine (Google, Bing, etc.) | 8080 |
| **Jina Reader** | `ghcr.io/intergalacticalvariable/reader` | Web scraping & content extraction | 3000 |
| **BGE Reranker** | `wkao/bge-reranker-v2-m3` | ML-based result ranking | 8787 |

## LibreChat Compatibility

### Supported Versions

This tool generates configurations compatible with **LibreChat v0.7.9+** (web search feature introduced in v0.7.9).

### Service Components

LibreChat's web search requires three components working together:

| Component | Role | This Tool Provides | LibreChat Config Mapping |
|-----------|------|-------------------|--------------------------|
| **Search Provider** | Performs web searches | **SearXNG** (`latest`) | `searchProvider: "searxng"` |
| **Scraper** | Extracts content from URLs | **Jina Reader** (Firecrawl-compatible) | `scraperType: "firecrawl"` |
| **Reranker** | ML-powered result ranking | **BGE Reranker v2-m3** (Jina API-compatible) | `rerankerType: "jina"` |

### Technical Details

**SearXNG** (Search Engine)
- **Version**: Latest stable release
- **API Format**: JSON output (`format=json`)
- **Features**: Privacy-focused meta-search aggregating 70+ search engines
- **Network**: Supports X-Forwarded-For headers for query logging
- **Authentication**: Configurable API key (default: `searxng-default-key-12345`)

**Jina Reader** (Web Scraper / Firecrawl Alternative)
- **Version**: Latest from `ghcr.io/intergalacticalvariable/reader`
- **Compatibility**: Drop-in Firecrawl replacement
- **API**: RESTful endpoint at `http://service:3000/{url_to_crawl}`
- **Features**: Clean content extraction, JavaScript rendering
- **Configuration**: Timeout (30s default), max pages limit
- **Authentication**: Configurable API key (default: `jina-default-key-67890`)

**BGE Reranker v2-m3** (Result Ranking)
- **Version**: BAAI/bge-reranker-v2-m3 (278M parameters)
- **Docker Image**: `wkao/bge-reranker-v2-m3` (community-maintained)
- **API Compatibility**: Jina Reranker API-compatible endpoint
- **Endpoint**: POST `/api/v1/rerank` with JSON payload
- **Features**: Multilingual support (100+ languages), optimized for RAG
- **Performance**: Batch processing up to 16 documents
- **Authentication**: Configurable API key (default: `reranker-default-key-abcde`)

### Docker Network Architecture

- **Shared Network**: All services join external Docker network (default: `librechat`)
- **Container DNS**: Services accessible via container names (`searxng:8080`, `jina-reader:3000`, `bge-reranker:8787`)
- **LibreChat Integration**: Import `search-stack-config.json` to auto-configure container URLs
- **Host Access**: Services also available via localhost URLs for testing

**[📚 LibreChat Web Search Documentation](https://www.librechat.ai/docs/features/web_search)**

## Integration Workflow

### The Recommended Way to Set Up LibreChat with Local Search

**Start with [LibreChatConfigurator](https://github.com/Fritsl/LibreChatConfigurator)** (the main configuration tool), then use this tool when you need local search capabilities.

### Step-by-Step

1. **🔧 Configure LibreChat** ([LibreChatConfigurator](https://github.com/Fritsl/LibreChatConfigurator))
   - Run LibreChatConfigurator
   - Set up AI providers (OpenAI, Anthropic, etc.)
   - Configure authentication and OAuth
   - Set up database and file storage

2. **🔍 Need Local Search?** Use this tool to generate the Docker stack
   - Open [https://librechatlocalwebsearchstack.netlify.app/](https://librechatlocalwebsearchstack.netlify.app/)
   - Configure service ports and resource limits (or use defaults)
   - Click **"Generate & Download"** to get the ZIP package
   - Extract and run the installation script (`./install_dockerimage.sh` or `.bat`)

3. **🔄 Import Search Config** Back to LibreChatConfigurator
   - In LibreChatConfigurator: **Configuration → Import Merge JSON**
   - Or use the import function directly under the **Search** section
   - Select `search-stack-config.json` from the downloaded ZIP
   - Search settings auto-populate with your Docker service URLs

4. **🚀 Deploy Everything**
   - Docker search stack runs on your configured ports
   - LibreChat connects to local search services via the imported config
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

**For detailed service specifications, see [LibreChat Compatibility](#librechat-compatibility) above.**

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
