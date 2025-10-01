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
      - SEARXNG_BASE_URL=http://localhost:${config.searxng.port}/
      - SEARXNG_HOSTNAME=searxng
      ${config.searxng.customSettings ? config.searxng.customSettings.split('\n').map(line => `      - ${line.trim()}`).join('\n') : ''}
    ports:
      - "${config.searxng.port}:8080"
    volumes:
      - ./searxng:/etc/searxng:rw${customVolumes ? '\n' + customVolumes : ''}
    restart: ${config.restartPolicy}
    networks:
      - librechat-search${healthCheck}
    deploy:
      resources:
        limits:
          memory: ${config.searxng.memoryLimit}`);
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
      - READER_TIMEOUT=${config.jinaReader.timeout}
      - READER_MAX_PAGES=${config.jinaReader.maxPages}
    ports:
      - "${config.jinaReader.port}:3000"${customVolumes ? `
    volumes:${customVolumes}` : ''}
    restart: ${config.restartPolicy}
    networks:
      - librechat-search${healthCheck}
    deploy:
      resources:
        limits:
          memory: ${config.jinaReader.memoryLimit}`);
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
      - MODEL_NAME=${config.bgeReranker.modelType}
      - MAX_BATCH_SIZE=${config.bgeReranker.maxBatchSize}
    ports:
      - "${config.bgeReranker.port}:8787"${customVolumes ? `
    volumes:${customVolumes}` : ''}
    restart: ${config.restartPolicy}
    networks:
      - librechat-search${healthCheck}
    deploy:
      resources:
        limits:
          memory: ${config.bgeReranker.memoryLimit}`);
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

1. Clone or download this repository
2. Run the stack:

\`\`\`bash
docker compose up -d
\`\`\`

3. Verify services are running:

\`\`\`bash
docker compose ps
\`\`\`

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
LibreChat Search Stack - Service Tester
This script tests the configured services to ensure they're running correctly.
You can modify and reuse this script for further testing.
No external dependencies required - uses Python standard library only.
"""

import urllib.request
import urllib.parse
import urllib.error
import json
import sys

def test_searxng():
    """Test SearXNG search functionality"""
    print("\\n🔍 Testing SearXNG Search...")
    print("=" * 60)
    
    try:
        # Test query - feel free to modify this!
        query = "top 10 news for today"
        params = urllib.parse.urlencode({"q": query, "format": "json"})
        url = f"http://localhost:${config.searxng.port}/search?{params}"
        
        with urllib.request.urlopen(url, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                results = data.get('results', [])
                
                print(f"✅ SearXNG is working!")
                print(f"Query: '{query}'")
                print(f"Found {len(results)} results\\n")
                
                # Display first 10 results
                for i, result in enumerate(results[:10], 1):
                    print(f"{i}. {result.get('title', 'No title')}")
                    print(f"   URL: {result.get('url', 'No URL')}")
                    if result.get('content'):
                        content = result['content'][:100] + "..." if len(result.get('content', '')) > 100 else result.get('content', '')
                        print(f"   {content}")
                    print()
                
                return True
            else:
                print(f"❌ SearXNG returned status code: {response.status}")
                return False
            
    except urllib.error.URLError as e:
        print("❌ Cannot connect to SearXNG")
        print(f"   Make sure it's running on http://localhost:${config.searxng.port}")
        print(f"   Error: {e.reason}")
        return False
    except Exception as e:
        print(f"❌ Error testing SearXNG: {e}")
        return False

def test_jina_reader():
    """Test Jina AI Reader functionality"""
    print("\\n📄 Testing Jina AI Reader...")
    print("=" * 60)
    
    try:
        url = "http://localhost:${config.jinaReader.port}/health"
        
        with urllib.request.urlopen(url, timeout=5) as response:
            if response.status == 200:
                print("✅ Jina AI Reader is running!")
                print(f"   Service available at http://localhost:${config.jinaReader.port}")
                return True
            else:
                print(f"❌ Jina AI Reader returned status code: {response.status}")
                return False
            
    except urllib.error.URLError as e:
        print("❌ Cannot connect to Jina AI Reader")
        print(f"   Make sure it's running on http://localhost:${config.jinaReader.port}")
        return False
    except Exception as e:
        print(f"❌ Error testing Jina AI Reader: {e}")
        return False

def test_bge_reranker():
    """Test BGE Reranker functionality"""
    print("\\n📊 Testing BGE Reranker...")
    print("=" * 60)
    
    try:
        url = "http://localhost:${config.bgeReranker.port}/health"
        
        with urllib.request.urlopen(url, timeout=5) as response:
            if response.status == 200:
                print("✅ BGE Reranker is running!")
                print(f"   Service available at http://localhost:${config.bgeReranker.port}")
                return True
            else:
                print(f"❌ BGE Reranker returned status code: {response.status}")
                return False
            
    except urllib.error.URLError as e:
        print("❌ Cannot connect to BGE Reranker")
        print(f"   Make sure it's running on http://localhost:${config.bgeReranker.port}")
        return False
    except Exception as e:
        print(f"❌ Error testing BGE Reranker: {e}")
        return False

def main():
    print("\\n" + "=" * 60)
    print("LibreChat Search Stack - Service Tests")
    print("=" * 60)
    
    results = {}
    
    # Test enabled services
    ${config.searxng.enabled ? 'results["searxng"] = test_searxng()' : ''}
    ${config.jinaReader.enabled ? 'results["jinaReader"] = test_jina_reader()' : ''}
    ${config.bgeReranker.enabled ? 'results["bgeReranker"] = test_bge_reranker()' : ''}
    
    # Summary
    print("\\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    all_passed = all(results.values()) if results else False
    
    for service, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{service:20} {status}")
    
    print("=" * 60)
    
    if all_passed:
        print("\\n🎉 All tests passed! Your services are ready to use.")
        sys.exit(0)
    else:
        print("\\n⚠️  Some tests failed. Check the output above for details.")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\\n\\nTests cancelled by user.")
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
  zip.file('.env.example', generateEnvFile(config));
  zip.file('README.md', generateReadme(config));
  zip.file('install_dockerimage.sh', generateInstallScript(config));
  zip.file('search-stack-config.json', generateJsonConfig(config));
  zip.file('test_services.py', generateTestScript(config));
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'librechat-search-stack.zip');
}
