# LibreChat Search Stack - Docker Compose Generator

## Overview

This is a **companion tool** for [LibreChatConfigurator](https://github.com/Fritsl/LibreChatConfigurator) that generates Docker Compose configurations for LibreChat's local search stack. It provides an interactive UI for configuring three services (SearXNG, Jina AI Reader, and BGE Reranker v2-m3) and generates downloadable configuration files including docker-compose.yml, .env, README.md, installation scripts (Unix and Windows), and a LibreChat-compatible JSON configuration file.

**Integration Workflow**: 
1. Start with LibreChatConfigurator (main tool) to configure your LibreChat instance
2. When you need local search capabilities, use this tool to generate the Docker search stack
3. Run the installation scripts to deploy the Docker services
4. Import the `search-stack-config.json` back into LibreChatConfigurator (Configuration → Import Merge JSON or directly under Search section) to auto-configure LibreChat's search settings

**LibreChat Compatibility (As of October 2025)**:
- LibreChat natively supports only cloud-based APIs for web scraping (Firecrawl) and result reranking (Jina)
- Self-hosted scraper/reranker from this tool are not yet supported by LibreChat
- This tool should be used to configure **SearXNG for basic web search only**
- For full scraping and reranking functionality, users must use official cloud endpoints:
  - Firecrawl: `https://api.firecrawl.dev` (FIRECRAWL_API_URL, FIRECRAWL_API_KEY)
  - Jina: `https://api.jina.ai/v1/rerank` (JINA_API_URL, JINA_API_KEY)
- UI displays a prominent disclaimer alert explaining this limitation

The application is a configuration generator tool - it doesn't require persistent data storage and operates entirely client-side for configuration generation.

### Service Configuration Defaults
- **Default State**: All presets have SearXNG enabled, Jina AI Reader and BGE Reranker disabled
- **Rationale**: LibreChat currently only supports SearXNG for self-hosted search; scraper/reranker require cloud APIs
- Users can manually enable Jina/Reranker services if deploying for non-LibreChat use cases

### API Key Management
- Each service has a configurable API key field with fixed defaults for testing consistency
- Default API keys: `searxng-default-key-12345`, `jina-default-key-67890`, `reranker-default-key-abcde`
- Users can generate random UUID keys using the refresh button next to each API key field
- API keys are included in all generated files (docker-compose.yml, .env, README.md, install script, and JSON config)
- JSON export follows LibreChat schema: `searxngApiKey`, `firecrawlApiKey`, `jinaApiKey`

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite as the build tool

**UI Component System**: Shadcn/ui (Radix UI primitives) with Tailwind CSS for styling
- Uses "new-york" style variant
- CSS variables for theming with dark mode support
- Component library located in `client/src/components/ui/`

**State Management**: Local React state with useState hooks
- No global state management needed (simple configuration form)
- Configuration state managed in the Home component
- Form data validated using Zod schemas
- Default preset: Development (SearXNG enabled, Jina/Reranker disabled due to LibreChat limitations)

**Routing**: Wouter (lightweight client-side routing)
- Minimal routing needs (home page + 404)
- Chosen for simplicity over React Router

**Data Fetching**: TanStack Query (React Query)
- Configured for API interactions
- Set with infinite stale time (configuration doesn't change server-side)

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- Minimal API surface - this is primarily a static file generator
- No authentication/authorization required
- Routes defined in `server/routes.ts` (currently empty - no backend routes needed)

**Development Server**: Vite middleware integration
- Hot Module Replacement (HMR) for development
- Custom error overlay plugin from Replit
- SSR-style template serving for the SPA

**Build Process**: 
- Frontend: Vite builds to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- ESM modules throughout (type: "module" in package.json)

### Data Storage Solutions

**Database**: PostgreSQL via Neon serverless driver
- **Important Note**: Currently configured but NOT actively used
- Drizzle ORM configured with schema in `shared/schema.ts`
- Schema file contains Zod validation schemas for service configuration (not database tables)
- Storage interface exists (`server/storage.ts`) but is a stub implementation
- Future-proofing for potential server-side features

**Rationale**: The application generates files client-side using browser APIs (JSZip, file-saver), so server-side storage isn't needed for core functionality. Database setup exists for template compatibility and potential future features like saving/sharing configurations.

### File Generation System

**Client-Side File Generation**: 
- `client/src/lib/file-generator.ts` contains core generation logic
- JSZip library creates downloadable .zip packages
- FileSaver.js handles browser downloads
- Seven generated files:
  - `docker-compose.yml`: Service definitions using environment variables from .env file
  - `.env`: Pre-configured environment variables (ready to use, not a template)
  - `README.md`: Setup instructions and documentation
  - `install_dockerimage.sh`: Unix/Linux/Mac installation script with bash safety flags (`set -Eeuo pipefail`)
  - `install_dockerimage.bat`: Windows installation script (native batch file for PowerShell/CMD)
  - `search-stack-config.json`: LibreChat-compatible JSON configuration (auto-included in ZIP, can also be exported separately)
  - `test_services.py`: Python script for testing services (uses standard library only, no external dependencies)

**Note:** Both installation scripts (`install_dockerimage.sh` and `install_dockerimage.bat`) are kept synchronized with identical functionality. Any updates to one script must be mirrored in the other to maintain cross-platform compatibility.

**Docker Networking Architecture**:
- Services join a shared external Docker network (default: `librechat`, configurable via UI)
- Network name must match the network LibreChat uses for container-to-container communication
- Installation scripts automatically create the network if it doesn't exist
- JSON export uses container DNS names (searxng:8080, jina-reader:3000, bge-reranker:8787) for LibreChat running in Docker
- Test script and .env file use localhost URLs for host-based testing

**Environment Variable Integration**:
- Docker Compose uses `${VARIABLE}` syntax to reference all configuration from `.env` file
- All ports, memory limits, timeouts, API keys are defined in `.env`
- Works out-of-the-box: users just run `docker compose up -d` after extraction
- No manual configuration or file editing required

**Configuration Schema**: 
- Shared Zod schemas (`shared/schema.ts`) validate service configurations
- Type safety between form inputs and file generation
- Default values defined in schema

**Service Testing System**:
- Interactive Python test script (`test_services.py`) included in generated packages
- Uses only Python standard library (urllib, json) - no external dependencies required
- **Interactive Pipeline Test**: Demonstrates the complete LibreChat search workflow
  - Step 1: Asks user for search query, then queries SearXNG and displays results
  - Step 2: Crawls first result using Jina Reader (format: `http://localhost:3000/URL_TO_CRAWL`)
  - Step 3: Reranks all results using BGE Reranker v2-m3 (POST to `/api/v1/rerank` endpoint)
  - Each step waits for user keypress before continuing
- **API Endpoints Used**:
  - SearXNG: `/search?q={query}&format=json` with X-Forwarded-For header
  - Jina Reader: `/{url_to_crawl}` returns extracted content as text
  - BGE Reranker: `/api/v1/rerank` with JSON payload `{query, documents}`
- Only tests enabled services based on user configuration
- Can be run anytime with `python3 test_services.py`
- Provides complete end-to-end validation of the search stack

### External Dependencies

**UI Component Library**: 
- Radix UI primitives (accordion, dialog, dropdown, select, etc.)
- Provides accessible, unstyled components
- Wrapped with Tailwind styling via Shadcn/ui pattern

**Styling**:
- Tailwind CSS with custom theme configuration
- CSS variables for dynamic theming
- PostCSS for processing

**Font Loading**:
- Google Fonts: Inter (primary), Architects Daughter, DM Sans, Fira Code, Geist Mono
- Loaded via CDN in HTML

**Development Tools**:
- @replit/vite-plugin-runtime-error-modal: Development error overlay
- @replit/vite-plugin-cartographer: Replit integration
- @replit/vite-plugin-dev-banner: Development banner

**Database (configured but unused)**:
- @neondatabase/serverless: PostgreSQL driver
- Drizzle ORM: Type-safe database toolkit
- connect-pg-simple: PostgreSQL session store (unused)

**Build Tools**:
- TypeScript: Type checking and compilation
- Vite: Frontend build and dev server
- esbuild: Backend bundling
- tsx: TypeScript execution for development

**Validation & Forms**:
- Zod: Schema validation
- React Hook Form: Form state management
- @hookform/resolvers: Zod integration for forms

**File Handling**:
- JSZip: Creating downloadable zip files
- file-saver: Browser file downloads

### Design Patterns

**Shared Type Definitions**: 
- TypeScript types and Zod schemas in `shared/` directory
- Imported by both client and server
- Path alias `@shared/*` for clean imports

**Component Composition**:
- ServiceCard: Reusable configuration card for each service
- PreviewPanel: Tabbed preview of generated files
- Separation of concerns between UI and generation logic

**Configuration-Driven UI**:
- Service metadata (icons, colors, descriptions) defined in component constants
- Dynamic form generation based on Zod schema structure
- Type-safe configuration updates

**No Server-Side Rendering**: Pure SPA with client-side routing
- Server only serves static files and Vite middleware in development
- All file generation happens in browser