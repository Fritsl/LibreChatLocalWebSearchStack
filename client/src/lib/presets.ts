import { ServiceConfig } from '@shared/schema';

export interface ConfigPreset {
  id: string;
  name: string;
  description: string;
  config: ServiceConfig;
}

export const configPresets: ConfigPreset[] = [
  {
    id: 'development',
    name: 'Development',
    description: 'All services with lower resources, ideal for local testing',
    config: {
      enableHealthChecks: true,
      restartPolicy: 'unless-stopped',
      searxng: {
        enabled: true,
        port: 8080,
        memoryLimit: '512MB',
        customVolumes: '',
        customSettings: '',
      },
      jinaReader: {
        enabled: true,
        port: 3000,
        memoryLimit: '512MB',
        timeout: 30,
        maxPages: 5,
        customVolumes: '',
      },
      bgeReranker: {
        enabled: true,
        port: 8787,
        memoryLimit: '2GB',
        modelType: 'BAAI/bge-reranker-base',
        maxBatchSize: 16,
        customVolumes: '',
      },
    },
  },
  {
    id: 'production',
    name: 'Production',
    description: 'All services with higher resources, optimized for production workloads',
    config: {
      enableHealthChecks: true,
      restartPolicy: 'unless-stopped',
      searxng: {
        enabled: true,
        port: 8080,
        memoryLimit: '2GB',
        customVolumes: '',
        customSettings: '',
      },
      jinaReader: {
        enabled: true,
        port: 3000,
        memoryLimit: '2GB',
        timeout: 60,
        maxPages: 20,
        customVolumes: '',
      },
      bgeReranker: {
        enabled: true,
        port: 8787,
        memoryLimit: '8GB',
        modelType: 'BAAI/bge-reranker-v2-m3',
        maxBatchSize: 64,
        customVolumes: '',
      },
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Only essential services with minimal resources',
    config: {
      enableHealthChecks: false,
      restartPolicy: 'unless-stopped',
      searxng: {
        enabled: true,
        port: 8080,
        memoryLimit: '512MB',
        customVolumes: '',
        customSettings: '',
      },
      jinaReader: {
        enabled: true,
        port: 3000,
        memoryLimit: '512MB',
        timeout: 30,
        maxPages: 5,
        customVolumes: '',
      },
      bgeReranker: {
        enabled: false,
        port: 8787,
        memoryLimit: '2GB',
        modelType: 'BAAI/bge-reranker-base',
        maxBatchSize: 16,
        customVolumes: '',
      },
    },
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Configure services manually',
    config: {
      enableHealthChecks: true,
      restartPolicy: 'unless-stopped',
      searxng: {
        enabled: true,
        port: 8080,
        memoryLimit: '1GB',
        customVolumes: '',
        customSettings: '',
      },
      jinaReader: {
        enabled: true,
        port: 3000,
        memoryLimit: '1GB',
        timeout: 30,
        maxPages: 10,
        customVolumes: '',
      },
      bgeReranker: {
        enabled: true,
        port: 8787,
        memoryLimit: '4GB',
        modelType: 'BAAI/bge-reranker-v2-m3',
        maxBatchSize: 32,
        customVolumes: '',
      },
    },
  },
];
