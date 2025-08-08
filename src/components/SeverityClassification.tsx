import { useState } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Waves, Download, Play, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeverityCodeDisplay } from './SeverityCodeDisplay';
import { WaterBackground } from './WaterBackground';
import { AnimatedUpload } from './AnimatedUpload';
import { ScanningAnimation } from './ScanningAnimation';
import { SeverityResultCard } from './SeverityResultCard';
import { FloatingIcons } from './FloatingIcons';

interface DetectionResult {
  imageUrl: string;
  detectionCount: number;
  severityLevel: 'green' | 'yellow' | 'red';
  detectedObjects: Array<{
    class: string;
    confidence: number;
    bbox: [number, number, number, number];
  }>;
  annotatedImageUrl: string;
}

export const SeverityClassification = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [modelLoaded, setModelLoaded] = useState(false);

  const handleImageUpload = (files: File[]) => {
    setSelectedImages(files);
  };

  const processWithAPI = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setResults([]);

    const API_URL = 'https://your-render-api-url.onrender.com'; // Replace with your Render URL
    
    try {
      const apiResults: DetectionResult[] = [];
      
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        setProcessingProgress((i / selectedImages.length) * 90);
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_URL}/detect`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const apiResult = await response.json();
        
        const result: DetectionResult = {
          imageUrl: URL.createObjectURL(file),
          detectionCount: apiResult.detection_count,
          severityLevel: apiResult.severity_level as 'green' | 'yellow' | 'red',
          detectedObjects: apiResult.detections || [],
          annotatedImageUrl: apiResult.annotated_image || URL.createObjectURL(file)
        };
        
        apiResults.push(result);
        setResults([...apiResults]);
      }
      
      setProcessingProgress(100);
    } catch (error) {
      console.error('API Error:', error);
      // Fallback to simulation if API fails
      await simulateDetection();
    }
    
    setIsProcessing(false);
  };

  const simulateDetection = async () => {
    // Simulation code for demo purposes
    const mockResults: DetectionResult[] = [];
    
    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      const objectCount = Math.floor(Math.random() * 25) + 1;
      
      let severityLevel: 'green' | 'yellow' | 'red';
      if (objectCount > 15) severityLevel = 'red';
      else if (objectCount >= 6) severityLevel = 'yellow';
      else severityLevel = 'green';

      const result: DetectionResult = {
        imageUrl: URL.createObjectURL(file),
        detectionCount: objectCount,
        severityLevel,
        detectedObjects: Array.from({ length: objectCount }, (_, idx) => ({
          class: ['plastic', 'bottles', 'fishing_nets', 'general_debris'][Math.floor(Math.random() * 4)],
          confidence: 0.5 + Math.random() * 0.5,
          bbox: [
            Math.random() * 0.8,
            Math.random() * 0.8,
            0.1 + Math.random() * 0.2,
            0.1 + Math.random() * 0.2
          ]
        })),
        annotatedImageUrl: URL.createObjectURL(file)
      };

      mockResults.push(result);
      setResults([...mockResults]);
      setProcessingProgress(((i + 1) / selectedImages.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (level: string) => {
    switch (level) {
      case 'red': return <AlertTriangle className="h-5 w-5" />;
      case 'yellow': return <AlertCircle className="h-5 w-5" />;
      case 'green': return <CheckCircle className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getSeverityMessage = (level: string, count: number) => {
    switch (level) {
      case 'red': return `Critical pollution detected (${count} objects)`;
      case 'yellow': return `Moderate pollution detected (${count} objects)`;
      case 'green': return `Low pollution detected (${count} objects)`;
      default: return `Unknown pollution level (${count} objects)`;
    }
  };

  const exportResults = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      totalImages: results.length,
      summary: {
        red: results.filter(r => r.severityLevel === 'red').length,
        yellow: results.filter(r => r.severityLevel === 'yellow').length,
        green: results.filter(r => r.severityLevel === 'green').length,
      },
      averageDebrisCount: results.reduce((sum, r) => sum + r.detectionCount, 0) / results.length,
      results: results.map(r => ({
        detectionCount: r.detectionCount,
        severityLevel: r.severityLevel,
        detectedClasses: [...new Set(r.detectedObjects.map(obj => obj.class))]
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debris_analysis_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen">
      <WaterBackground />
      <FloatingIcons />
      
      <div className="relative z-10 space-y-8 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Waves className="h-10 w-10 text-primary animate-float" />
            <h1 className="text-4xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
              Marine Debris Detection
            </h1>
            <Sparkles className="h-8 w-8 text-primary/60 animate-float" style={{ animationDelay: '1s' }} />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered ocean satellite imagery analysis for marine conservation
          </p>
        </div>

        <Tabs defaultValue="detection" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 shadow-water">
            <TabsTrigger value="detection" className="data-[state=active]:bg-gradient-ocean data-[state=active]:text-white">
              Detection & Classification
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-gradient-ocean data-[state=active]:text-white">
              Python Implementation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detection" className="space-y-8">
            {/* Upload Section */}
            <Card className="shadow-water border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <Waves className="h-6 w-6 text-primary" />
                  Ocean Imagery Analysis
                </CardTitle>
                <CardDescription className="text-lg">
                  Upload satellite images to detect marine debris and classify pollution severity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AnimatedUpload 
                  onFileUpload={handleImageUpload}
                  isProcessing={isProcessing}
                  selectedCount={selectedImages.length}
                />

                {selectedImages.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-water rounded-xl border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedImages.length} Images Ready</p>
                          <p className="text-sm text-muted-foreground">
                            Ready for marine debris analysis
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={processWithAPI}
                          disabled={isProcessing}
                          className="bg-gradient-ocean hover:shadow-glow shadow-water"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {isProcessing ? 'Analyzing...' : 'Start Analysis'}
                        </Button>
                        <Button
                          onClick={simulateDetection}
                          disabled={isProcessing}
                          variant="outline"
                          className="border-primary/20 hover:bg-gradient-water"
                        >
                          Demo Mode
                        </Button>
                      </div>
                    </div>

                    {isProcessing && (
                      <ScanningAnimation 
                        progress={processingProgress} 
                        isActive={isProcessing}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Severity Rules */}
            <Card className="shadow-water border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Pollution Classification System
                </CardTitle>
                <CardDescription>
                  AI-driven severity assessment based on debris density
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-water hover:shadow-glow transition-all duration-300">
                    <div className="absolute top-4 right-4">
                      <div className="h-3 w-3 bg-severity-green rounded-full animate-pulse" />
                    </div>
                    <CheckCircle className="h-12 w-12 text-severity-green mb-4 group-hover:animate-bounce-in" />
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-green-800">CLEAN OCEAN</p>
                      <p className="text-green-700 font-medium">≤ 5 objects detected</p>
                      <p className="text-sm text-green-600">Minimal marine debris presence</p>
                    </div>
                  </div>
                  
                  <div className="group relative p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl shadow-water hover:shadow-glow transition-all duration-300">
                    <div className="absolute top-4 right-4">
                      <div className="h-3 w-3 bg-severity-yellow rounded-full animate-pulse" />
                    </div>
                    <AlertCircle className="h-12 w-12 text-severity-yellow mb-4 group-hover:animate-bounce-in" />
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-yellow-800">MODERATE POLLUTION</p>
                      <p className="text-yellow-700 font-medium">6-15 objects detected</p>
                      <p className="text-sm text-yellow-600">Requires monitoring & cleanup</p>
                    </div>
                  </div>
                  
                  <div className="group relative p-6 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-water hover:shadow-glow transition-all duration-300">
                    <div className="absolute top-4 right-4">
                      <div className="h-3 w-3 bg-severity-red rounded-full animate-pulse" />
                    </div>
                    <AlertTriangle className="h-12 w-12 text-severity-red mb-4 group-hover:animate-bounce-in" />
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-red-800">CRITICAL POLLUTION</p>
                      <p className="text-red-700 font-medium">&gt; 15 objects detected</p>
                      <p className="text-sm text-red-600">Urgent intervention required</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {results.length > 0 && (
              <Card className="shadow-water border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-ocean flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Analysis Complete</CardTitle>
                      <CardDescription className="text-lg">
                        {results.length} ocean areas analyzed for marine debris
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={exportResults}
                    className="border-primary/20 hover:bg-gradient-water shadow-water"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gradient-water border-primary/20 shadow-water">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">{results.length}</div>
                        <p className="text-muted-foreground">Ocean Areas Scanned</p>
                        <Waves className="h-6 w-6 text-primary/60 mx-auto mt-2 animate-float" />
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-water">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-severity-red mb-2">
                          {results.filter(r => r.severityLevel === 'red').length}
                        </div>
                        <p className="text-red-600 font-medium">Critical Zones</p>
                        <AlertTriangle className="h-6 w-6 text-severity-red mx-auto mt-2" />
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-water">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-severity-yellow mb-2">
                          {results.filter(r => r.severityLevel === 'yellow').length}
                        </div>
                        <p className="text-yellow-600 font-medium">Moderate Areas</p>
                        <AlertCircle className="h-6 w-6 text-severity-yellow mx-auto mt-2" />
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-water">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-severity-green mb-2">
                          {results.filter(r => r.severityLevel === 'green').length}
                        </div>
                        <p className="text-green-600 font-medium">Clean Waters</p>
                        <CheckCircle className="h-6 w-6 text-severity-green mx-auto mt-2" />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Individual Results */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center">Detailed Analysis Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {results.map((result, index) => (
                        <SeverityResultCard
                          key={index}
                          result={result}
                          index={index}
                          isNew={false}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>

          <TabsContent value="code">
            <div className="relative">
              <SeverityCodeDisplay />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};