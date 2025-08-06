import { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle, AlertCircle, Image as ImageIcon, Download, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeverityCodeDisplay } from './SeverityCodeDisplay';

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
  };

  const simulateDetection = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setResults([]);

    // Simulate model loading
    if (!modelLoaded) {
      for (let i = 0; i <= 30; i += 5) {
        setProcessingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      setModelLoaded(true);
    }

    // Simulate processing each image
    const mockResults: DetectionResult[] = [];
    
    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      const objectCount = Math.floor(Math.random() * 25) + 1; // 1-25 objects
      
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
        annotatedImageUrl: URL.createObjectURL(file) // In real implementation, this would be the annotated image
      };

      mockResults.push(result);
      setResults([...mockResults]);
      setProcessingProgress(30 + ((i + 1) / selectedImages.length) * 70);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsProcessing(false);
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
    <div className="space-y-6">
      <Tabs defaultValue="detection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detection">Detection & Classification</TabsTrigger>
          <TabsTrigger value="code">Python Implementation</TabsTrigger>
        </TabsList>

        <TabsContent value="detection" className="space-y-6">
          {/* Upload Section */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Severity Classification System
              </CardTitle>
              <CardDescription>
                Upload satellite images to detect marine debris and classify pollution severity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-all">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Satellite Images</h3>
                <p className="text-muted-foreground mb-4">
                  Select multiple images for batch processing
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  Select Images
                </Button>
              </div>

              {selectedImages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {selectedImages.length} images selected
                    </p>
                    <Button
                      onClick={simulateDetection}
                      disabled={isProcessing}
                      className="bg-gradient-primary hover:shadow-glow"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Analyze Images'}
                    </Button>
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{modelLoaded ? 'Processing images...' : 'Loading model...'}</span>
                        <span>{processingProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Severity Rules */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Classification Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">GREEN</p>
                    <p className="text-sm text-green-600">≤ 5 objects detected</p>
                    <p className="text-xs text-green-500">Low pollution level</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">YELLOW</p>
                    <p className="text-sm text-yellow-600">6-15 objects detected</p>
                    <p className="text-xs text-yellow-500">Moderate pollution level</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">RED</p>
                    <p className="text-sm text-red-600">&gt; 15 objects detected</p>
                    <p className="text-xs text-red-500">Critical pollution level</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    {results.length} images processed with severity classification
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </CardHeader>
              <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{results.length}</div>
                      <p className="text-sm text-muted-foreground">Images Analyzed</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {results.filter(r => r.severityLevel === 'red').length}
                      </div>
                      <p className="text-sm text-red-600">Critical Areas</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {results.filter(r => r.severityLevel === 'yellow').length}
                      </div>
                      <p className="text-sm text-yellow-600">Moderate Areas</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results.filter(r => r.severityLevel === 'green').length}
                      </div>
                      <p className="text-sm text-green-600">Clean Areas</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Individual Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((result, index) => (
                    <Card key={index} className={`border-2 ${getSeverityColor(result.severityLevel)}`}>
                      <CardContent className="p-4">
                        <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                          <img
                            src={result.imageUrl}
                            alt={`Analysis result ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(result.severityLevel)}
                          <Badge variant="secondary" className={getSeverityColor(result.severityLevel)}>
                            {result.severityLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          {getSeverityMessage(result.severityLevel, result.detectionCount)}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Detected classes: {[...new Set(result.detectedObjects.map(obj => obj.class))].join(', ')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="code">
          <SeverityCodeDisplay />
        </TabsContent>
      </Tabs>
    </div>
  );
};