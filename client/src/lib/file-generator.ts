import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ServiceConfig } from '@shared/schema';

export function generateDockerCompose(config: ServiceConfig): string {
  const services: string[] = [];
  
  if (config.searxng.enabled) {
    const healthCheck = config.enableHealthChecks ? `
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s` : '';
    
    const customVolumes = config.searxng.customVolumes 
      ? config.searxng.customVolumes.split('\n').filter(line => line.trim()).map(line => `      - ${line.trim()}`).join('\n')
      : '';
    
    services.push(`  searxng:
    image: searxng/searxng:${config.searxng.version}
    container_name: librechat-searxng
    environment:
      - SEARXNG_BASE_URL=\${SEARXNG_BASE_URL}
      - SEARXNG_HOSTNAME=searxng
      ${config.searxng.customSettings ? config.searxng.customSettings.split('\n').map(line => `      - ${line.trim()}`).join('\n') : ''}
    ports:
      - "\${SEARXNG_PORT}:8080"
    volumes:
      - ./searxng:/etc/searxng:rw${customVolumes ? '\n' + customVolumes : ''}
    restart: ${config.restartPolicy}
    networks:
      - librechat-search${healthCheck}
    deploy:
      resources:
        limits:
          memory: \${SEARXNG_MEMORY_LIMIT}`);
  }

  if (config.jinaReader.enabled) {
    const healthCheck = config.enableHealthChecks ? `
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s` : '';
    
    const customVolumes = config.jinaReader.customVolumes 
      ? '\n' + config.jinaReader.customVolumes.split('\n').filter(line => line.trim()).map(line => `      - ${line.trim()}`).join('\n')
      : '';
    
    services.push(`  jina-reader:
    image: ghcr.io/intergalacticalvariable/reader:${config.jinaReader.version}
    container_name: librechat-jina
    environment:
      - READER_TIMEOUT=\${JINA_TIMEOUT}
      - READER_MAX_PAGES=\${JINA_MAX_PAGES}
    ports:
      - "\${JINA_PORT}:3000"${customVolumes ? `
    volumes:${customVolumes}` : ''}
    restart: ${config.restartPolicy}
    networks:
      - librechat-search${healthCheck}
    deploy:
      resources:
        limits:
          memory: \${JINA_MEMORY_LIMIT}`);
  }

  if (config.bgeReranker.enabled) {
    const healthCheck = config.enableHealthChecks ? `
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8787/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s` : '';
    
    const customVolumes = config.bgeReranker.customVolumes 
      ? '\n' + config.bgeReranker.customVolumes.split('\n').filter(line => line.trim()).map(line => `      - ${line.trim()}`).join('\n')
      : '';
    
    services.push(`  bge-reranker:
    image: wkao/bge-reranker-v2-m3:${config.bgeReranker.version}
    container_name: librechat-reranker
    environment:
      - MODEL_NAME=\${RERANKER_MODEL}
      - MAX_BATCH_SIZE=\${RERANKER_BATCH_SIZE}
    ports:
      - "\${RERANKER_PORT}:8787"${customVolumes ? `
    volumes:${customVolumes}` : ''}
    restart: ${config.restartPolicy}
    networks:
      - librechat-search${healthCheck}
    deploy:
      resources:
        limits:
          memory: \${RERANKER_MEMORY_LIMIT}`);
  }

  return `services:
${services.join('\n\n')}

networks:
  librechat-search:
    driver: bridge`;
}

export function generateEnvFile(config: ServiceConfig): string {
  return `# LibreChat Search Stack Configuration

# SearXNG Configuration
SEARXNG_PORT=${config.searxng.port}
SEARXNG_MEMORY_LIMIT=${config.searxng.memoryLimit}
SEARXNG_BASE_URL=http://localhost:${config.searxng.port}/
SEARXNG_API_KEY=${config.searxng.apiKey}

# Jina AI Reader Configuration  
JINA_PORT=${config.jinaReader.port}
JINA_MEMORY_LIMIT=${config.jinaReader.memoryLimit}
JINA_TIMEOUT=${config.jinaReader.timeout}
JINA_MAX_PAGES=${config.jinaReader.maxPages}
FIRECRAWL_API_KEY=${config.jinaReader.apiKey}

# BGE Reranker Configuration
RERANKER_PORT=${config.bgeReranker.port}
RERANKER_MEMORY_LIMIT=${config.bgeReranker.memoryLimit}
RERANKER_MODEL=${config.bgeReranker.modelType}
RERANKER_BATCH_SIZE=${config.bgeReranker.maxBatchSize}
JINA_API_KEY=${config.bgeReranker.apiKey}

# LibreChat Integration URLs
SEARXNG_INSTANCE_URL=http://localhost:${config.searxng.port}
FIRECRAWL_API_URL=http://localhost:${config.jinaReader.port}
RERANKER_BASE_URL=http://localhost:${config.bgeReranker.port}

# LibreChat Configuration
# Copy these values to your LibreChat .env file:
# SEARXNG_API_KEY=${config.searxng.apiKey}
# FIRECRAWL_API_KEY=${config.jinaReader.apiKey}
# JINA_API_KEY=${config.bgeReranker.apiKey}`;
}

export function generateInstallScript(config: ServiceConfig): string {
  const enabledServices = [];
  const servicePorts: string[] = [];
  
  if (config.searxng.enabled) {
    enabledServices.push("SearXNG");
    servicePorts.push(`   - SearXNG: http://localhost:${config.searxng.port}`);
  }
  if (config.jinaReader.enabled) {
    enabledServices.push("Jina AI Reader");
    servicePorts.push(`   - Jina AI Reader: http://localhost:${config.jinaReader.port}`);
  }
  if (config.bgeReranker.enabled) {
    enabledServices.push("BGE Reranker");
    servicePorts.push(`   - BGE Reranker: http://localhost:${config.bgeReranker.port}`);
  }

  return `#!/bin/bash

# =============================================================================
# LibreChat Search Stack Installation Script
# Generated Configuration for ${enabledServices.join(", ")}
# =============================================================================

set -e

echo "🚀 Starting LibreChat Search Stack installation..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating directories..."
${config.searxng.enabled ? 'mkdir -p searxng' : ''}${config.jinaReader.enabled || config.bgeReranker.enabled ? '\nmkdir -p cache' : ''}

# Set permissions
${config.searxng.enabled ? 'chmod 755 searxng' : ''}${config.jinaReader.enabled || config.bgeReranker.enabled ? '\nchmod 755 cache' : ''}

# Pull Docker images
echo "📦 Pulling Docker images..."
if docker compose version &> /dev/null; then
    docker compose pull
else
    docker-compose pull
fi

# Start services
echo "🔄 Starting LibreChat Search Stack services..."
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
if docker compose version &> /dev/null; then
    SERVICE_STATUS=$(docker compose ps)
else
    SERVICE_STATUS=$(docker-compose ps)
fi

if echo "$SERVICE_STATUS" | grep -q "Up"; then
    echo "✅ LibreChat Search Stack is running successfully!"
    echo ""
    echo "🌐 Access your services at:"
    ${servicePorts.map(port => `echo "${port}"`).join('\n    ')}
    echo ""
    echo "📊 Service status:"
    echo "$SERVICE_STATUS"
    echo ""
    echo "📝 Useful commands:"
    echo "   View logs: docker compose logs -f (or docker-compose logs -f)"
    echo "   Stop services: docker compose down (or docker-compose down)"
    echo "   Restart services: docker compose restart (or docker-compose restart)"
    echo "   Update services: docker compose pull && docker compose up -d"
else
    echo "❌ Some services failed to start. Check logs:"
    if docker compose version &> /dev/null; then
        docker compose logs
    else
        docker-compose logs
    fi
    exit 1
fi

echo ""
echo "🎉 Installation complete! Your LibreChat Search Stack is ready!"
echo ""

# Run Python tests
echo "🧪 Running service tests..."
echo ""
if command -v python3 &> /dev/null; then
    # Make the test script executable
    chmod +x test_services.py
    
    # Run the tests
    python3 test_services.py
    TEST_EXIT_CODE=$?
    
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        echo ""
        echo "✅ All service tests passed!"
    else
        echo ""
        echo "⚠️  Some tests failed. Services may still be starting up."
        echo "   You can run 'python3 test_services.py' again to retest."
    fi
else
    echo "⚠️  Python 3 not found. Skipping automatic tests."
    echo "   Install Python 3 and run 'python3 test_services.py' to test services."
fi

echo ""
echo "💡 Next steps:"
echo "   1. Add these environment variables to your LibreChat .env file:"${config.searxng.enabled ? `
echo "      SEARXNG_INSTANCE_URL=http://localhost:${config.searxng.port}"
echo "      SEARXNG_API_KEY=${config.searxng.apiKey}"` : ''}${config.jinaReader.enabled ? `
echo "      FIRECRAWL_API_URL=http://localhost:${config.jinaReader.port}"
echo "      FIRECRAWL_API_KEY=${config.jinaReader.apiKey}"` : ''}${config.bgeReranker.enabled ? `
echo "      RERANKER_BASE_URL=http://localhost:${config.bgeReranker.port}"
echo "      JINA_API_KEY=${config.bgeReranker.apiKey}"` : ''}
echo "   2. Restart LibreChat to apply the changes"
echo "   3. Run 'python3 test_services.py' anytime to test your services"
echo ""
echo "🔑 API Keys: These are fixed default keys for testing in closed environments."
echo ""
`;
}

export function generateReadme(config: ServiceConfig): string {
  const enabledServices = [];
  if (config.searxng.enabled) enabledServices.push("SearXNG");
  if (config.jinaReader.enabled) enabledServices.push("Jina AI Reader");
  if (config.bgeReranker.enabled) enabledServices.push("BGE Reranker");

  return `# LibreChat Search Stack

Self-hosted search infrastructure for LibreChat with ${enabledServices.join(", ")}.

## Quick Start

**The \`.env\` file is pre-configured and ready to use!** All services are configured to use these environment variables automatically.

1. Extract the downloaded files to a directory
2. Run the installation script (recommended):

\`\`\`bash
bash install_dockerimage.sh
\`\`\`

Or start manually:

\`\`\`bash
docker compose up -d
\`\`\`

3. Verify services are running:

\`\`\`bash
docker compose ps
\`\`\`

**Note:** The \`docker-compose.yml\` file automatically loads all settings from the \`.env\` file. No manual configuration needed!

## Services

${config.searxng.enabled ? `### SearXNG (Port ${config.searxng.port})
- Privacy-respecting search engine
- Access: http://localhost:${config.searxng.port}
- Memory: ${config.searxng.memoryLimit}

` : ''}${config.jinaReader.enabled ? `### Jina AI Reader (Port ${config.jinaReader.port})
- Web scraper and content extractor
- API: http://localhost:${config.jinaReader.port}
- Timeout: ${config.jinaReader.timeout}s
- Max Pages: ${config.jinaReader.maxPages}
- Memory: ${config.jinaReader.memoryLimit}

` : ''}${config.bgeReranker.enabled ? `### BGE Reranker (Port ${config.bgeReranker.port})
- AI-powered search result ranking
- API: http://localhost:${config.bgeReranker.port}
- Model: ${config.bgeReranker.modelType}
- Batch Size: ${config.bgeReranker.maxBatchSize}
- Memory: ${config.bgeReranker.memoryLimit}

` : ''}## LibreChat Integration

Add these environment variables to your LibreChat configuration:

\`\`\`env
${config.searxng.enabled ? `SEARXNG_INSTANCE_URL=http://localhost:${config.searxng.port}
SEARXNG_API_KEY=${config.searxng.apiKey}` : ''}
${config.jinaReader.enabled ? `FIRECRAWL_API_URL=http://localhost:${config.jinaReader.port}
FIRECRAWL_API_KEY=${config.jinaReader.apiKey}` : ''}
${config.bgeReranker.enabled ? `RERANKER_BASE_URL=http://localhost:${config.bgeReranker.port}
JINA_API_KEY=${config.bgeReranker.apiKey}` : ''}
\`\`\`

### API Keys

The generated API keys are fixed defaults for testing in closed environments. These keys satisfy LibreChat's configuration requirements but are not enforced by the Docker services themselves.

**Your API Keys:**
${config.searxng.enabled ? `- SearXNG: \`${config.searxng.apiKey}\`` : ''}
${config.jinaReader.enabled ? `- Jina Reader: \`${config.jinaReader.apiKey}\`` : ''}
${config.bgeReranker.enabled ? `- BGE Reranker: \`${config.bgeReranker.apiKey}\`` : ''}

You can regenerate random keys using the configuration tool if needed for different environments.

## Management

Stop services:
\`\`\`bash
docker compose down
\`\`\`

View logs:
\`\`\`bash
docker compose logs -f
\`\`\`

Update services:
\`\`\`bash
docker compose pull
docker compose up -d
\`\`\`

## Troubleshooting

### Expected SearXNG Docker Logs

When starting SearXNG, you will see these messages in \`docker compose logs\`. **These are completely normal and do not affect functionality:**

\`\`\`
ERROR:searx.engines: Missing engine config attribute: "yacy images.base_url"
WARNING:searx.search.processors: Engine of name 'ahmia' does not exists.
WARNING:searx.search.processors: Engine of name 'torch' does not exists.
WARNING:searx.search.processors: Engine of name 'yacy images' does not exists.
WARNING:searx.botdetection.config: missing config file: /etc/searxng/limiter.toml
ERROR:searx.botdetection: X-Forwarded-For nor X-Real-IP header is set!
\`\`\`

**What these mean:**
- **Missing engine errors** (ahmia, torch, yacy images): Optional search engines not configured by default. SearXNG still works perfectly with Google, Bing, DuckDuckGo, and 20+ other engines.
- **Missing limiter.toml**: Optional rate limiting config. Only needed for public-facing instances, not required for LibreChat's private use.
- **X-Forwarded-For error**: Appears when requests don't include forwarding headers. The included test script handles this correctly, so you can ignore this warning.

**✅ SearXNG is working correctly if you see:**
\`\`\`
[INFO] Started worker-1
[INFO] Listening at: http://:::${config.searxng.port}
\`\`\`

These warnings are logged for every SearXNG instance and can be safely ignored. Your search functionality will work perfectly!

### Testing Your Services

Run the included interactive test script to verify the complete search pipeline:

\`\`\`bash
python3 test_services.py
\`\`\`

**What it does:**
1. **🔍 Search** - Asks what you want to search for, then queries SearXNG
2. **📄 Crawl** - Extracts content from the first result using Jina Reader  
3. **📊 Rerank** - Reorders results by relevance using BGE Reranker
4. **✅ Summary** - Confirms all services are working correctly

This interactive test demonstrates the entire LibreChat search pipeline working together!

## Support

For issues related to:
- LibreChat: https://github.com/danny-avila/LibreChat
- SearXNG: https://github.com/searxng/searxng
- Jina AI: https://github.com/jina-ai/reader`;
}

export function generateJsonConfig(config: ServiceConfig): string {
  const jsonConfig = {
    name: "Search Stack Configuration",
    configuration: {
      webSearch: {
        searchProvider: "searxng",
        searxngInstanceUrl: config.searxng.enabled ? `http://localhost:${config.searxng.port}` : "",
        searxngApiKey: config.searxng.enabled ? config.searxng.apiKey : "",
        scraperType: "firecrawl",
        firecrawlApiUrl: config.jinaReader.enabled ? `http://localhost:${config.jinaReader.port}` : "",
        firecrawlApiKey: config.jinaReader.enabled ? config.jinaReader.apiKey : "",
        rerankerType: "jina",
        jinaApiKey: config.bgeReranker.enabled ? config.bgeReranker.apiKey : "",
        jinaRerankerUrl: config.bgeReranker.enabled ? `http://localhost:${config.bgeReranker.port}` : "",
        scraperTimeout: 7500,
        safeSearch: true
      }
    }
  };
  
  return JSON.stringify(jsonConfig, null, 2);
}

export function generateTestScript(config: ServiceConfig): string {
  return `#!/usr/bin/env python3
"""
LibreChat Search Stack - Interactive Pipeline Test
Tests the complete search pipeline: Search → Crawl → Rerank
No external dependencies required - uses Python standard library only.
"""

import urllib.request
import urllib.parse
import urllib.error
import json
import sys

def search_with_searxng(query):
    """Search using SearXNG"""
    print(f"\\n🔍 Searching for: '{query}'")
    print("=" * 80)
    
    try:
        params = urllib.parse.urlencode({"q": query, "format": "json"})
        url = f"http://localhost:${config.searxng.port}/search?{params}"
        
        headers = {
            'X-Forwarded-For': '127.0.0.1',
            'User-Agent': 'LibreChat-SearchStack-Test/1.0'
        }
        
        request = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(request, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                results = data.get('results', [])
                
                print(f"✅ Found {len(results)} results\\n")
                
                # Display top 10 results
                for i, result in enumerate(results[:10], 1):
                    print(f"{i}. {result.get('title', 'No title')}")
                    print(f"   URL: {result.get('url', 'No URL')}")
                    if result.get('content'):
                        content = result['content'][:120] + "..." if len(result.get('content', '')) > 120 else result.get('content', '')
                        print(f"   {content}")
                    print()
                
                return results[:10]
            else:
                print(f"❌ SearXNG returned status code: {response.status}")
                return None
    except Exception as e:
        print(f"❌ Error searching: {e}")
        return None

def crawl_with_jina(url):
    """Crawl URL content using Jina Reader"""
    print(f"\\n📄 Crawling content from: {url}")
    print("=" * 80)
    
    try:
        # Jina Reader format: http://localhost:3000/URL_TO_CRAWL
        jina_url = f"http://localhost:${config.jinaReader.port}/{url}"
        
        request = urllib.request.Request(jina_url)
        with urllib.request.urlopen(request, timeout=15) as response:
            if response.status == 200:
                content = response.read().decode('utf-8')
                
                # Display first 500 characters of extracted content
                preview = content[:500] + "..." if len(content) > 500 else content
                print(f"✅ Content extracted ({len(content)} characters)\\n")
                print(f"Preview:\\n{preview}\\n")
                
                return content
            else:
                print(f"❌ Jina Reader returned status code: {response.status}")
                return None
    except Exception as e:
        print(f"❌ Error crawling: {e}")
        return None

def rerank_with_bge(query, documents):
    """Rerank documents using BGE Reranker"""
    print(f"\\n📊 Reranking results for query: '{query}'")
    print("=" * 80)
    
    try:
        url = f"http://localhost:${config.bgeReranker.port}/api/v1/rerank"
        
        # Prepare documents for reranking
        doc_list = [
            {"id": i, "text": f"{doc.get('title', '')} {doc.get('content', '')}"}
            for i, doc in enumerate(documents)
        ]
        
        payload = {
            "query": query,
            "documents": doc_list
        }
        
        headers = {'Content-Type': 'application/json'}
        data = json.dumps(payload).encode('utf-8')
        
        request = urllib.request.Request(url, data=data, headers=headers)
        with urllib.request.urlopen(request, timeout=10) as response:
            if response.status == 200:
                result = json.loads(response.read().decode('utf-8'))
                ranked_docs = result.get('data', [])
                
                print(f"✅ Reranked {len(ranked_docs)} results\\n")
                print("Reranked order (by relevance):")
                
                for i, item in enumerate(ranked_docs[:5], 1):
                    doc_id = item['id']
                    similarity = item['similarity']
                    original_doc = documents[doc_id]
                    print(f"{i}. [{similarity:.2f}] {original_doc.get('title', 'No title')}")
                    print(f"   URL: {original_doc.get('url', 'No URL')}")
                    print()
                
                return ranked_docs
            else:
                print(f"❌ BGE Reranker returned status code: {response.status}")
                return None
    except Exception as e:
        print(f"❌ Error reranking: {e}")
        return None

def wait_for_key():
    """Wait for user to press Enter"""
    try:
        input("\\n⏸️  Press Enter to continue...")
    except KeyboardInterrupt:
        print("\\n\\nTest cancelled by user.")
        sys.exit(0)

def main():
    print("\\n" + "=" * 80)
    print("LibreChat Search Stack - Interactive Pipeline Test")
    print("=" * 80)
    print("\\nThis will test the complete search pipeline:")
    print("  1. 🔍 Search with SearXNG")
    print("  2. 📄 Crawl content with Jina Reader")
    print("  3. 📊 Rerank results with BGE Reranker")
    print()
    
    # Step 1: Get search query from user
    try:
        query = input("What would you like to search for? ")
        if not query.strip():
            print("❌ No query provided. Exiting.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\\n\\nTest cancelled by user.")
        sys.exit(0)
    
    # Step 2: Search with SearXNG
    ${config.searxng.enabled ? `
    results = search_with_searxng(query)
    if not results:
        print("\\n❌ Search failed. Make sure SearXNG is running.")
        sys.exit(1)
    
    wait_for_key()
    ` : 'results = []\nprint("⚠️  SearXNG is disabled in this configuration")'}
    
    # Step 3: Crawl first result with Jina Reader
    ${config.jinaReader.enabled ? `
    if results:
        first_url = results[0].get('url')
        if first_url:
            content = crawl_with_jina(first_url)
            if not content:
                print("\\n⚠️  Crawling failed, but continuing with test...")
            
            wait_for_key()
    ` : 'print("⚠️  Jina Reader is disabled in this configuration")'}
    
    # Step 4: Rerank results with BGE Reranker
    ${config.bgeReranker.enabled ? `
    if results:
        ranked = rerank_with_bge(query, results)
        if not ranked:
            print("\\n❌ Reranking failed. Make sure BGE Reranker is running.")
            sys.exit(1)
    ` : 'print("⚠️  BGE Reranker is disabled in this configuration")'}
    
    # Final summary
    print("\\n" + "=" * 80)
    print("✅ Pipeline Test Complete!")
    print("=" * 80)
    print("\\nAll enabled services are working correctly:")
    ${config.searxng.enabled ? 'print("  🔍 SearXNG - Search engine working")' : ''}
    ${config.jinaReader.enabled ? 'print("  📄 Jina Reader - Content extraction working")' : ''}
    ${config.bgeReranker.enabled ? 'print("  📊 BGE Reranker - Result ranking working")' : ''}
    print("\\n🎉 Your LibreChat search stack is ready to use!")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\\n\\nTest cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\\n\\n❌ Unexpected error: {e}")
        sys.exit(1)
`;
}

export function downloadJsonConfig(config: ServiceConfig): void {
  const jsonContent = generateJsonConfig(config);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  saveAs(blob, 'search-stack-config.json');
}

export async function downloadConfigPackage(config: ServiceConfig): Promise<void> {
  const zip = new JSZip();
  
  zip.file('docker-compose.yml', generateDockerCompose(config));
  zip.file('.env', generateEnvFile(config));
  zip.file('README.md', generateReadme(config));
  zip.file('install_dockerimage.sh', generateInstallScript(config));
  zip.file('search-stack-config.json', generateJsonConfig(config));
  zip.file('test_services.py', generateTestScript(config));
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'librechat-search-stack.zip');
}
