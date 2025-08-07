import { useState } from 'react';
import { Upload, Waves, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimatedUploadProps {
  onFileUpload: (files: File[]) => void;
  isProcessing?: boolean;
  selectedCount?: number;
}

export const AnimatedUpload = ({ onFileUpload, isProcessing, selectedCount = 0 }: AnimatedUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files);
      createRipple(e.clientX, e.clientY);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const createRipple = (x: number, y: number) => {
    const rect = document.getElementById('upload-area')?.getBoundingClientRect();
    if (rect) {
      const ripple = {
        id: Date.now(),
        x: x - rect.left,
        y: y - rect.top
      };
      setRipples(prev => [...prev, ripple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== ripple.id));
      }, 600);
    }
  };

  return (
    <div className="relative">
      <div
        id="upload-area"
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 overflow-hidden ${
          isDragOver 
            ? 'border-primary bg-gradient-water scale-105 shadow-glow' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-gradient-water/50'
        } ${isProcessing ? 'pointer-events-none opacity-75' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{ left: ripple.x, top: ripple.y }}
          >
            <div className="w-4 h-4 -ml-2 -mt-2 bg-primary/30 rounded-full animate-ripple" />
          </div>
        ))}

        {/* Main upload icon with animation */}
        <div className={`mx-auto mb-6 transition-all duration-500 ${isDragOver ? 'animate-bounce-in' : 'animate-float'}`}>
          {isProcessing ? (
            <div className="relative">
              <Waves className="h-16 w-16 text-primary mx-auto animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />
            </div>
          ) : isDragOver ? (
            <div className="relative">
              <Camera className="h-16 w-16 text-primary mx-auto" />
              <div className="absolute -inset-2 rounded-full border-2 border-primary/50 animate-pulse-ring" />
            </div>
          ) : (
            <Upload className="h-16 w-16 text-primary mx-auto" />
          )}
        </div>

        {/* Animated text */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">
            {isProcessing 
              ? 'Processing Ocean Images...' 
              : isDragOver 
                ? 'Drop Your Images Here!' 
                : 'Upload Satellite Images'
            }
          </h3>
          <p className="text-muted-foreground">
            {selectedCount > 0 
              ? `${selectedCount} images selected for analysis`
              : 'Drag & drop or click to select images for marine debris detection'
            }
          </p>
        </div>

        {/* Upload button */}
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          id="file-upload"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />
        
        <Button
          variant="outline"
          size="lg"
          className="mt-6 bg-white/80 hover:bg-white shadow-water border-primary/20"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isProcessing}
        >
          <Upload className="h-5 w-5 mr-2" />
          {selectedCount > 0 ? 'Add More Images' : 'Select Images'}
        </Button>

        {/* Background decorative elements */}
        <div className="absolute top-4 right-4 opacity-10">
          <Waves className="h-8 w-8 text-primary animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-4 left-4 opacity-10">
          <Waves className="h-6 w-6 text-primary animate-float" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    </div>
  );
};