import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ServiceConfig } from '@shared/schema';

interface ServiceCardProps {
  service: 'searxng' | 'jinaReader' | 'bgeReranker';
  config: ServiceConfig;
  onConfigChange: (updates: Partial<ServiceConfig>) => void;
}

const serviceInfo = {
  searxng: {
    title: "SearXNG",
    description: "Privacy-respecting search engine",
    icon: "🔍",
    iconClass: "bg-blue-500/10 text-blue-500",
  },
  jinaReader: {
    title: "Jina AI Reader", 
    description: "Web scraper and content extractor",
    icon: "📄",
    iconClass: "bg-purple-500/10 text-purple-500",
  },
  bgeReranker: {
    title: "BGE Reranker v2-m3",
    description: "AI-powered search result ranking", 
    icon: "📊",
    iconClass: "bg-orange-500/10 text-orange-500",
  },
};

export function ServiceCard({ service, config, onConfigChange }: ServiceCardProps) {
  const info = serviceInfo[service];
  const serviceConfig = config[service] as any;

  const updateServiceConfig = (updates: any) => {
    onConfigChange({
      [service]: { ...serviceConfig, ...updates }
    });
  };

  return (
    <Card data-testid={`card-${service}`} className="overflow-hidden">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${info.iconClass}`}>
              {info.icon}
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">{info.title}</h3>
              <p className="text-sm text-muted-foreground">{info.description}</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="bg-green-500/10 text-green-500 border-green-500/20"
            data-testid={`status-${service}`}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Enabled
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${service}-port`} className="text-sm font-medium text-foreground mb-2 block">
              Port
            </Label>
            <Input
              id={`${service}-port`}
              data-testid={`input-${service}-port`}
              type="number"
              value={serviceConfig.port}
              onChange={(e) => updateServiceConfig({ port: parseInt(e.target.value) || serviceConfig.port })}
              className="bg-input border-border"
            />
          </div>
          <div>
            <Label htmlFor={`${service}-memory`} className="text-sm font-medium text-foreground mb-2 block">
              Memory Limit
            </Label>
            <Select 
              value={serviceConfig.memoryLimit} 
              onValueChange={(value) => updateServiceConfig({ memoryLimit: value })}
            >
              <SelectTrigger data-testid={`select-${service}-memory`} className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {service === 'bgeReranker' ? (
                  <>
                    <SelectItem value="2GB">2GB</SelectItem>
                    <SelectItem value="4GB">4GB</SelectItem>
                    <SelectItem value="8GB">8GB</SelectItem>
                    <SelectItem value="16GB">16GB</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="512MB">512MB</SelectItem>
                    <SelectItem value="1GB">1GB</SelectItem>
                    <SelectItem value="2GB">2GB</SelectItem>
                    <SelectItem value="4GB">4GB</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {service === 'jinaReader' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jina-timeout" className="text-sm font-medium text-foreground mb-2 block">
                Timeout (seconds)
              </Label>
              <Input
                id="jina-timeout"
                data-testid="input-jina-timeout"
                type="number"
                value={serviceConfig.timeout}
                onChange={(e) => updateServiceConfig({ timeout: parseInt(e.target.value) || serviceConfig.timeout })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label htmlFor="jina-maxpages" className="text-sm font-medium text-foreground mb-2 block">
                Max Pages
              </Label>
              <Input
                id="jina-maxpages"
                data-testid="input-jina-maxpages"
                type="number"
                value={serviceConfig.maxPages}
                onChange={(e) => updateServiceConfig({ maxPages: parseInt(e.target.value) || serviceConfig.maxPages })}
                className="bg-input border-border"
              />
            </div>
          </div>
        )}

        {service === 'bgeReranker' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reranker-model" className="text-sm font-medium text-foreground mb-2 block">
                Model Type
              </Label>
              <Select 
                value={serviceConfig.modelType} 
                onValueChange={(value) => updateServiceConfig({ modelType: value })}
              >
                <SelectTrigger data-testid="select-reranker-model" className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAAI/bge-reranker-v2-m3">BAAI/bge-reranker-v2-m3</SelectItem>
                  <SelectItem value="BAAI/bge-reranker-large">BAAI/bge-reranker-large</SelectItem>
                  <SelectItem value="BAAI/bge-reranker-base">BAAI/bge-reranker-base</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reranker-batch" className="text-sm font-medium text-foreground mb-2 block">
                Max Batch Size
              </Label>
              <Input
                id="reranker-batch"
                data-testid="input-reranker-batch"
                type="number"
                value={serviceConfig.maxBatchSize}
                onChange={(e) => updateServiceConfig({ maxBatchSize: parseInt(e.target.value) || serviceConfig.maxBatchSize })}
                className="bg-input border-border"
              />
            </div>
          </div>
        )}

        {service === 'searxng' && (
          <div>
            <Label htmlFor="searxng-custom" className="text-sm font-medium text-foreground mb-2 block">
              Custom Settings
            </Label>
            <Textarea
              id="searxng-custom"
              data-testid="textarea-searxng-custom"
              rows={3}
              placeholder="Additional environment variables or configuration..."
              value={serviceConfig.customSettings || ''}
              onChange={(e) => updateServiceConfig({ customSettings: e.target.value })}
              className="bg-input border-border resize-none"
            />
          </div>
        )}

        <div>
          <Label htmlFor={`${service}-volumes`} className="text-sm font-medium text-foreground mb-2 block">
            Custom Volumes
          </Label>
          <Textarea
            id={`${service}-volumes`}
            data-testid={`textarea-${service}-volumes`}
            rows={2}
            placeholder="One volume mount per line (e.g., ./data:/app/data:rw)"
            value={serviceConfig.customVolumes || ''}
            onChange={(e) => updateServiceConfig({ customVolumes: e.target.value })}
            className="bg-input border-border resize-none text-xs"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Add additional volume mounts (one per line)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
