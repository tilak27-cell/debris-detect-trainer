import { useState } from 'react';
import { Play, Pause, Square, TrendingUp, Clock, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface TrainingParams {
  epochs: number;
  batchSize: number;
  imageSize: number;
  learningRate: number;
  modelSize: string;
}

interface TrainingProgressProps {
  isTraining: boolean;
  progress: number;
  datasetUploaded: boolean;
  onStartTraining: () => void;
  params: TrainingParams;
}

export const TrainingProgress = ({ 
  isTraining, 
  progress, 
  datasetUploaded, 
  onStartTraining, 
  params 
}: TrainingProgressProps) => {
  const [metrics] = useState({
    loss: 0.234,
    precision: 0.856,
    recall: 0.792,
    mAP: 0.734
  });

  const currentEpoch = Math.floor((progress / 100) * params.epochs);
  const estimatedTime = Math.round((params.epochs * 2.5) * (1 - progress / 100));

  return (
    <div className="space-y-6">
      {!datasetUploaded && (
        <Alert>
          <Target className="h-4 w-4" />
          <AlertDescription>
            Please upload your dataset first before starting training.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Training Status
            </span>
            <Badge variant={isTraining ? "default" : "secondary"} className="animate-pulse-glow">
              {isTraining ? 'TRAINING' : datasetUploaded ? 'READY' : 'WAITING'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Monitor your YOLOv8 model training progress and metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Control Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={onStartTraining}
              disabled={!datasetUploaded || isTraining}
              className="bg-gradient-primary hover:shadow-glow transition-all"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Training
            </Button>
            <Button variant="outline" disabled={!isTraining}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button variant="outline" disabled={!isTraining}>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </div>

          {/* Progress Bar */}
          {isTraining && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Epoch {currentEpoch} of {params.epochs}</span>
                <span>{progress.toFixed(1)}% Complete</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{estimatedTime} min remaining
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  GPU Utilization: 87%
                </span>
              </div>
            </div>
          )}

          {/* Training Metrics */}
          {isTraining && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-success text-white">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{metrics.loss.toFixed(3)}</div>
                  <p className="text-white/80 text-sm">Loss</p>
                </CardContent>
              </Card>
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{(metrics.precision * 100).toFixed(1)}%</div>
                  <p className="text-primary-foreground/80 text-sm">Precision</p>
                </CardContent>
              </Card>
              <Card className="bg-warning text-warning-foreground">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{(metrics.recall * 100).toFixed(1)}%</div>
                  <p className="text-warning-foreground/80 text-sm">Recall</p>
                </CardContent>
              </Card>
              <Card className="bg-accent text-accent-foreground">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{(metrics.mAP * 100).toFixed(1)}%</div>
                  <p className="text-accent-foreground/80 text-sm">mAP@0.5</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Configuration Summary */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Configuration</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="font-medium">Model</p>
                  <p className="text-muted-foreground">{params.modelSize.toUpperCase()}</p>
                </div>
                <div>
                  <p className="font-medium">Epochs</p>
                  <p className="text-muted-foreground">{params.epochs}</p>
                </div>
                <div>
                  <p className="font-medium">Batch Size</p>
                  <p className="text-muted-foreground">{params.batchSize}</p>
                </div>
                <div>
                  <p className="font-medium">Image Size</p>
                  <p className="text-muted-foreground">{params.imageSize}px</p>
                </div>
                <div>
                  <p className="font-medium">Learning Rate</p>
                  <p className="text-muted-foreground">{params.learningRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Log Preview */}
          {isTraining && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Training Log</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs max-h-40 overflow-y-auto">
                  <div>Epoch {currentEpoch}/{params.epochs}: 100%|██████████| 28/28 [00:45&lt;00:00,  1.62s/it]</div>
                  <div>      Class     Images  Instances          P          R      mAP50   mAP50-95</div>
                  <div>        all        90        127      0.856      0.792      0.734      0.445</div>
                  <div>    plastic        90         45      0.892      0.812      0.876      0.542</div>
                  <div>    bottles        90         32      0.834      0.781      0.798      0.387</div>
                  <div>  nets        90         28      0.812      0.756      0.712      0.434</div>
                  <div>     debris        90         22      0.876      0.823      0.845      0.465</div>
                  <div className="text-yellow-400">Speed: 0.3ms preprocess, 12.4ms inference, 0.2ms NMS per image</div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};