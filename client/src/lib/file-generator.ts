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
    image: jinaai/reader:${config.jinaReader.version}
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
    image: bge/reranker-v2-m3:${config.bgeReranker.version}
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

  return `version: '3.8'

services:
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

# Jina AI Reader Configuration  
JINA_PORT=${config.jinaReader.port}
JINA_MEMORY_LIMIT=${config.jinaReader.memoryLimit}
JINA_TIMEOUT=${config.jinaReader.timeout}
JINA_MAX_PAGES=${config.jinaReader.maxPages}

# BGE Reranker Configuration
RERANKER_PORT=${config.bgeReranker.port}
RERANKER_MEMORY_LIMIT=${config.bgeReranker.memoryLimit}
RERANKER_MODEL=${config.bgeReranker.modelType}
RERANKER_BATCH_SIZE=${config.bgeReranker.maxBatchSize}

# LibreChat Integration URLs
SEARXNG_INSTANCE_URL=http://localhost:${config.searxng.port}
FIRECRAWL_API_URL=http://localhost:${config.jinaReader.port}
RERANKER_BASE_URL=http://localhost:${config.bgeReranker.port}`;
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
${config.searxng.enabled ? `SEARXNG_INSTANCE_URL=http://localhost:${config.searxng.port}` : ''}
${config.jinaReader.enabled ? `FIRECRAWL_API_URL=http://localhost:${config.jinaReader.port}` : ''}
${config.bgeReranker.enabled ? `RERANKER_BASE_URL=http://localhost:${config.bgeReranker.port}` : ''}
\`\`\`

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

export async function downloadConfigPackage(config: ServiceConfig): Promise<void> {
  const zip = new JSZip();
  
  zip.file('docker-compose.yml', generateDockerCompose(config));
  zip.file('.env.example', generateEnvFile(config));
  zip.file('README.md', generateReadme(config));
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'librechat-search-stack.zip');
}
