import { useState } from 'react';
import { Upload, Play, Settings, BarChart3, FileText, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DatasetUpload } from './DatasetUpload';
import { TrainingConfig } from './TrainingConfig';
import { TrainingProgress } from './TrainingProgress';
import { PythonCodeDisplay } from './PythonCodeDisplay';

interface TrainingParams {
  epochs: number;
  batchSize: number;
  imageSize: number;
  learningRate: number;
  modelSize: string;
}

export const YOLOTraining = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [datasetUploaded, setDatasetUploaded] = useState(false);
  const [trainingParams, setTrainingParams] = useState<TrainingParams>({
    epochs: 100,
    batchSize: 16,
    imageSize: 640,
    learningRate: 0.01,
    modelSize: 'yolov8n'
  });

  const handleStartTraining = () => {
    setIsTraining(true);
    // Simulate training progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setTrainingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsTraining(false);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8" />
            <h1 className="text-3xl font-bold">YOLOv8 Training Suite</h1>
          </div>
          <p className="text-primary-foreground/90 text-lg">
            Professional marine debris detection model training platform
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Object Detection
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Marine Environment
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Satellite Imagery
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <Tabs defaultValue="dataset" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dataset" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Dataset
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Training
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Python Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dataset">
            <DatasetUpload 
              onDatasetUploaded={setDatasetUploaded} 
              isUploaded={datasetUploaded} 
            />
          </TabsContent>

          <TabsContent value="config">
            <TrainingConfig 
              params={trainingParams}
              onParamsChange={setTrainingParams}
            />
          </TabsContent>

          <TabsContent value="training">
            <TrainingProgress
              isTraining={isTraining}
              progress={trainingProgress}
              datasetUploaded={datasetUploaded}
              onStartTraining={handleStartTraining}
              params={trainingParams}
            />
          </TabsContent>

          <TabsContent value="code">
            <PythonCodeDisplay params={trainingParams} />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Model Architecture</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">YOLOv8{trainingParams.modelSize.slice(-1).toUpperCase()}</div>
              <p className="text-xs text-muted-foreground">
                Optimized for debris detection
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Status</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isTraining ? 'Active' : datasetUploaded ? 'Ready' : 'Waiting'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isTraining ? `${trainingProgress}% complete` : 'Upload dataset to begin'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detection Classes</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Plastic, bottles, nets, debris, background
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};