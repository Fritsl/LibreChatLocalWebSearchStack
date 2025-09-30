import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ServiceCard } from "@/components/service-card";
import { PreviewPanel } from "@/components/preview-panel";
import { downloadConfigPackage } from "@/lib/file-generator";
import { serviceConfigSchema, type ServiceConfig } from '@shared/schema';
import { Download, Github, Moon, Sun, HeartPulse } from "lucide-react";

export default function Home() {
  const [config, setConfig] = useState<ServiceConfig>(serviceConfigSchema.parse({}));
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleConfigChange = (updates: Partial<ServiceConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleGenerate = async () => {
    try {
      await downloadConfigPackage(config);
    } catch (error) {
      console.error('Failed to generate package:', error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
                  L
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">LibreChat Search Stack</h1>
                  <p className="text-sm text-muted-foreground">Docker Compose Generator</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  data-testid="button-theme-toggle"
                  className="hover:bg-accent"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  data-testid="link-github"
                  className="hover:bg-accent"
                >
                  <a href="https://github.com/danny-avila/LibreChat" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview Card */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                      🐳
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-foreground mb-2">Self-Hosted Search Stack</h2>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Configure and generate a complete Docker Compose setup with SearXNG, Jina AI Reader, and BGE Reranker services for LibreChat integration.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-3">
                      <HeartPulse className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="health-checks" className="text-sm font-medium text-foreground">
                          Enable Health Checks
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Monitor service health automatically
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="health-checks"
                      data-testid="switch-health-checks"
                      checked={config.enableHealthChecks}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableHealthChecks: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Service Configuration Cards */}
              <div className="space-y-6">
                <ServiceCard 
                  service="searxng" 
                  config={config} 
                  onConfigChange={handleConfigChange} 
                />
                <ServiceCard 
                  service="jinaReader" 
                  config={config} 
                  onConfigChange={handleConfigChange} 
                />
                <ServiceCard 
                  service="bgeReranker" 
                  config={config} 
                  onConfigChange={handleConfigChange} 
                />
              </div>

              {/* Generate Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-1">Generate Stack</h3>
                      <p className="text-sm text-muted-foreground">Create your Docker Compose configuration files</p>
                    </div>
                    <Button 
                      onClick={handleGenerate}
                      data-testid="button-generate"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Generate & Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <PreviewPanel config={config} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
