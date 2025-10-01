import { z } from "zod";

export const serviceConfigSchema = z.object({
  enableHealthChecks: z.boolean().default(true),
  restartPolicy: z.enum(["unless-stopped", "always", "on-failure", "no"]).default("unless-stopped"),
  networkName: z.string().min(1).default("librechat"),
  searxng: z.object({
    enabled: z.boolean().default(true),
    port: z.number().min(1000).max(65535).default(8080),
    memoryLimit: z.enum(["512MB", "1GB", "2GB", "4GB"]).default("1GB"),
    version: z.string().default("latest"),
    apiKey: z.string().default("searxng-default-key-12345"),
    customVolumes: z.string().optional(),
    customSettings: z.string().optional(),
  }).default({
    enabled: true,
    port: 8080,
    memoryLimit: "1GB",
    version: "latest",
    apiKey: "searxng-default-key-12345",
  }),
  jinaReader: z.object({
    enabled: z.boolean().default(true),
    port: z.number().min(1000).max(65535).default(3000),
    memoryLimit: z.enum(["512MB", "1GB", "2GB", "4GB"]).default("1GB"),
    version: z.string().default("latest"),
    timeout: z.number().min(10).max(300).default(30),
    maxPages: z.number().min(1).max(100).default(10),
    apiKey: z.string().default("jina-default-key-67890"),
    customVolumes: z.string().optional(),
  }).default({
    enabled: true,
    port: 3000,
    memoryLimit: "1GB",
    version: "latest",
    timeout: 30,
    maxPages: 10,
    apiKey: "jina-default-key-67890",
  }),
  bgeReranker: z.object({
    enabled: z.boolean().default(true),
    port: z.number().min(1000).max(65535).default(8787),
    memoryLimit: z.enum(["2GB", "4GB", "8GB", "16GB"]).default("4GB"),
    version: z.string().default("latest"),
    modelType: z.enum([
      "BAAI/bge-reranker-v2-m3",
      "BAAI/bge-reranker-large", 
      "BAAI/bge-reranker-base"
    ]).default("BAAI/bge-reranker-v2-m3"),
    maxBatchSize: z.number().min(1).max(128).default(32),
    apiKey: z.string().default("reranker-default-key-abcde"),
    customVolumes: z.string().optional(),
  }).default({
    enabled: true,
    port: 8787,
    memoryLimit: "4GB",
    version: "latest",
    modelType: "BAAI/bge-reranker-v2-m3",
    maxBatchSize: 32,
    apiKey: "reranker-default-key-abcde",
  }),
});

export type ServiceConfig = z.infer<typeof serviceConfigSchema>;
