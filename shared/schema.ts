import { z } from "zod";

export const serviceConfigSchema = z.object({
  enableHealthChecks: z.boolean().default(true),
  searxng: z.object({
    enabled: z.boolean().default(true),
    port: z.number().min(1000).max(65535).default(8080),
    memoryLimit: z.enum(["512MB", "1GB", "2GB", "4GB"]).default("1GB"),
    customSettings: z.string().optional(),
  }).default({
    enabled: true,
    port: 8080,
    memoryLimit: "1GB",
  }),
  jinaReader: z.object({
    enabled: z.boolean().default(true),
    port: z.number().min(1000).max(65535).default(3000),
    memoryLimit: z.enum(["512MB", "1GB", "2GB", "4GB"]).default("1GB"),
    timeout: z.number().min(10).max(300).default(30),
    maxPages: z.number().min(1).max(100).default(10),
  }).default({
    enabled: true,
    port: 3000,
    memoryLimit: "1GB",
    timeout: 30,
    maxPages: 10,
  }),
  bgeReranker: z.object({
    enabled: z.boolean().default(true),
    port: z.number().min(1000).max(65535).default(8787),
    memoryLimit: z.enum(["2GB", "4GB", "8GB", "16GB"]).default("4GB"),
    modelType: z.enum([
      "BAAI/bge-reranker-v2-m3",
      "BAAI/bge-reranker-large", 
      "BAAI/bge-reranker-base"
    ]).default("BAAI/bge-reranker-v2-m3"),
    maxBatchSize: z.number().min(1).max(128).default(32),
  }).default({
    enabled: true,
    port: 8787,
    memoryLimit: "4GB",
    modelType: "BAAI/bge-reranker-v2-m3",
    maxBatchSize: 32,
  }),
});

export type ServiceConfig = z.infer<typeof serviceConfigSchema>;
