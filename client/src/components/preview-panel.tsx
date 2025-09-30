import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateDockerCompose, generateEnvFile, generateReadme } from "@/lib/file-generator";
import type { ServiceConfig } from '@shared/schema';

interface PreviewPanelProps {
  config: ServiceConfig;
}

type TabType = 'docker-compose' | 'env' | 'readme';

export function PreviewPanel({ config }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('docker-compose');

  const tabs = [
    { id: 'docker-compose' as TabType, label: 'docker-compose.yml' },
    { id: 'env' as TabType, label: '.env.example' },
    { id: 'readme' as TabType, label: 'README.md' },
  ];

  const getContent = (tab: TabType) => {
    switch (tab) {
      case 'docker-compose':
        return generateDockerCompose(config);
      case 'env':
        return generateEnvFile(config);
      case 'readme':
        return generateReadme(config);
      default:
        return '';
    }
  };

  return (
    <div className="sticky top-8">
      <Card className="overflow-hidden">
        <div className="border-b border-border">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "text-primary border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-96 overflow-y-auto">
          <pre 
            data-testid={`preview-${activeTab}`}
            className="p-4 text-xs text-foreground bg-muted/30 font-mono leading-relaxed"
          >
            <code>{getContent(activeTab)}</code>
          </pre>
        </div>
      </Card>
    </div>
  );
}
