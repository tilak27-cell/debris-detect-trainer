import { useState } from 'react';
import { Upload, CheckCircle, FolderOpen, Image, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface DatasetUploadProps {
  onDatasetUploaded: (uploaded: boolean) => void;
  isUploaded: boolean;
}

export const DatasetUpload = ({ onDatasetUploaded, isUploaded }: DatasetUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
    if (files.length > 0) {
      onDatasetUploaded(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    if (files.length > 0) {
      onDatasetUploaded(true);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Dataset Upload
          </CardTitle>
          <CardDescription>
            Upload your labeled YOLO format dataset for marine debris detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? 'border-primary bg-primary/5 animate-pulse-glow'
                : isUploaded
                ? 'border-accent bg-accent/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploaded ? (
              <div className="space-y-4">
                <CheckCircle className="mx-auto h-12 w-12 text-accent" />
                <div>
                  <h3 className="text-lg font-semibold text-accent">Dataset Uploaded Successfully</h3>
                  <p className="text-muted-foreground">
                    {selectedFiles.length} files detected
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Images: 450</Badge>
                  <Badge variant="secondary">Labels: 450</Badge>
                  <Badge variant="secondary">Classes: 5</Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Drop your dataset here</h3>
                  <p className="text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  {...({ webkitdirectory: "" } as any)}
                  className="hidden"
                  id="dataset-upload"
                  onChange={handleFileSelect}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('dataset-upload')?.click()}
                >
                  Select Dataset Folder
                </Button>
              </div>
            )}
          </div>

          {isUploaded && (
            <div className="mt-6 space-y-4">
              <Alert>
                <Image className="h-4 w-4" />
                <AlertDescription>
                  Dataset validation successful. Ready for training with marine debris classes:
                  plastic, bottles, fishing_nets, general_debris, background.
                </AlertDescription>
              </Alert>
              
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Dataset Structure</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm space-y-1 font-mono text-muted-foreground">
                    <div>📁 dataset/</div>
                    <div>  📁 images/</div>
                    <div>    📄 train/ (360 images)</div>
                    <div>    📄 val/ (90 images)</div>
                    <div>  📁 labels/</div>
                    <div>    📄 train/ (360 labels)</div>
                    <div>    📄 val/ (90 labels)</div>
                    <div>  📄 data.yaml</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>YOLO Format Requirements:</strong> Ensure your dataset follows the YOLO format with
          images in .jpg/.png and corresponding .txt label files with normalized coordinates.
        </AlertDescription>
      </Alert>
    </div>
  );
};