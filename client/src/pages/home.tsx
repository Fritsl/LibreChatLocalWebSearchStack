import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ServiceCard } from "@/components/service-card";
import { PreviewPanel } from "@/components/preview-panel";
import { downloadConfigPackage } from "@/lib/file-generator";
import { serviceConfigSchema, type ServiceConfig } from '@shared/schema';
import { configPresets } from "@/lib/presets";
import { Download, Github, Moon, Sun, HeartPulse, Settings, Zap } from "lucide-react";

export default function Home() {
  const [config, setConfig] = useState<ServiceConfig>(serviceConfigSchema.parse({}));
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('custom');

  const handleConfigChange = (updates: Partial<ServiceConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setSelectedPreset('custom');
  };

  const handlePresetChange = (presetId: string) => {
    const preset = configPresets.find(p => p.id === presetId);
    if (preset) {
      setConfig(preset.config);
      setSelectedPreset(presetId);
    }
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
              {/* Preset Selector */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Zap className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium text-foreground">Configuration Preset</Label>
                        <p className="text-xs text-muted-foreground">Quick start with preconfigured settings</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {configPresets.map(preset => (
                        <button
                          key={preset.id}
                          data-testid={`button-preset-${preset.id}`}
                          onClick={() => handlePresetChange(preset.id)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            selectedPreset === preset.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium text-sm text-foreground mb-1">{preset.name}</div>
                          <div className="text-xs text-muted-foreground">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                      onCheckedChange={(checked) => handleConfigChange({ enableHealthChecks: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Options */}
              <Card>
                <Accordion type="single" collapsible>
                  <AccordionItem value="advanced" className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline" data-testid="accordion-advanced">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Advanced Options</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="restart-policy" className="text-sm font-medium text-foreground mb-2 block">
                            Restart Policy
                          </Label>
                          <Select 
                            value={config.restartPolicy} 
                            onValueChange={(value: any) => handleConfigChange({ restartPolicy: value })}
                          >
                            <SelectTrigger data-testid="select-restart-policy" className="bg-input border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unless-stopped">unless-stopped (recommended)</SelectItem>
                              <SelectItem value="always">always</SelectItem>
                              <SelectItem value="on-failure">on-failure</SelectItem>
                              <SelectItem value="no">no</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-2">
                            Controls when containers automatically restart. Applies to all enabled services. 
                            Memory limits are configured per-service above.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
