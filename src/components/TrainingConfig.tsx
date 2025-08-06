import { Settings, Cpu, Zap, Target, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface TrainingParams {
  epochs: number;
  batchSize: number;
  imageSize: number;
  learningRate: number;
  modelSize: string;
}

interface TrainingConfigProps {
  params: TrainingParams;
  onParamsChange: (params: TrainingParams) => void;
}

export const TrainingConfig = ({ params, onParamsChange }: TrainingConfigProps) => {
  const updateParam = (key: keyof TrainingParams, value: number | string) => {
    onParamsChange({ ...params, [key]: value });
  };

  const modelOptions = [
    { value: 'yolov8n', label: 'YOLOv8n', desc: 'Nano - Fastest, lowest accuracy' },
    { value: 'yolov8s', label: 'YOLOv8s', desc: 'Small - Good balance' },
    { value: 'yolov8m', label: 'YOLOv8m', desc: 'Medium - Higher accuracy' },
    { value: 'yolov8l', label: 'YOLOv8l', desc: 'Large - Best accuracy' },
    { value: 'yolov8x', label: 'YOLOv8x', desc: 'Extra Large - Maximum accuracy' },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Training Configuration
          </CardTitle>
          <CardDescription>
            Configure training parameters for optimal marine debris detection performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Model Architecture
            </Label>
            <Select value={params.modelSize} onValueChange={(value) => updateParam('modelSize', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select model size" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Badge variant="secondary">Parameters: ~{params.modelSize === 'yolov8n' ? '3.2M' : params.modelSize === 'yolov8s' ? '11.2M' : params.modelSize === 'yolov8m' ? '25.9M' : params.modelSize === 'yolov8l' ? '43.7M' : '68.2M'}</Badge>
              <Badge variant="secondary">FLOPS: ~{params.modelSize === 'yolov8n' ? '8.7G' : params.modelSize === 'yolov8s' ? '28.6G' : params.modelSize === 'yolov8m' ? '78.9G' : params.modelSize === 'yolov8l' ? '165.2G' : '257.8G'}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Epochs */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Training Epochs
              </Label>
              <div className="space-y-2">
                <Slider
                  value={[params.epochs]}
                  onValueChange={(value) => updateParam('epochs', value[0])}
                  max={300}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10</span>
                  <span className="font-medium">{params.epochs} epochs</span>
                  <span>300</span>
                </div>
              </div>
            </div>

            {/* Batch Size */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Batch Size
              </Label>
              <Select value={params.batchSize.toString()} onValueChange={(value) => updateParam('batchSize', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 (Low memory)</SelectItem>
                  <SelectItem value="8">8 (Recommended)</SelectItem>
                  <SelectItem value="16">16 (Balanced)</SelectItem>
                  <SelectItem value="32">32 (High memory)</SelectItem>
                  <SelectItem value="64">64 (Very high memory)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Size */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Image Size
              </Label>
              <Select value={params.imageSize.toString()} onValueChange={(value) => updateParam('imageSize', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="416">416x416 (Fast)</SelectItem>
                  <SelectItem value="512">512x512 (Balanced)</SelectItem>
                  <SelectItem value="640">640x640 (Recommended)</SelectItem>
                  <SelectItem value="800">800x800 (High detail)</SelectItem>
                  <SelectItem value="1024">1024x1024 (Maximum)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Learning Rate */}
            <div className="space-y-3">
              <Label>Learning Rate</Label>
              <div className="space-y-2">
                <Input
                  type="number"
                  value={params.learningRate}
                  onChange={(e) => updateParam('learningRate', parseFloat(e.target.value))}
                  step="0.001"
                  min="0.001"
                  max="0.1"
                />
                <p className="text-xs text-muted-foreground">
                  Typical range: 0.001 - 0.01
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Summary */}
      <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
        <CardHeader>
          <CardTitle>Training Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-primary-foreground/80 text-sm">Model</p>
              <p className="font-bold">{params.modelSize.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-primary-foreground/80 text-sm">Duration</p>
              <p className="font-bold">~{Math.round(params.epochs * 2.5 / 60)} hours</p>
            </div>
            <div>
              <p className="text-primary-foreground/80 text-sm">Memory</p>
              <p className="font-bold">~{params.batchSize * 2}GB</p>
            </div>
            <div>
              <p className="text-primary-foreground/80 text-sm">Resolution</p>
              <p className="font-bold">{params.imageSize}px</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};