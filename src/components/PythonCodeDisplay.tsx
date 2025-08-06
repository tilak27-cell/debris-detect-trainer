import { Copy, Download, Code, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface TrainingParams {
  epochs: number;
  batchSize: number;
  imageSize: number;
  learningRate: number;
  modelSize: string;
}

interface PythonCodeDisplayProps {
  params: TrainingParams;
}

export const PythonCodeDisplay = ({ params }: PythonCodeDisplayProps) => {
  const { toast } = useToast();

  const trainingCode = `# YOLOv8 Marine Debris Detection Training Script
from ultralytics import YOLO
import yaml
import os
from pathlib import Path

def train_debris_detection_model():
    """
    Train YOLOv8 model for marine debris detection
    Dataset should be in YOLO format with the following structure:
    
    dataset/
    ├── images/
    │   ├── train/
    │   └── val/
    ├── labels/
    │   ├── train/
    │   └── val/
    └── data.yaml
    """
    
    # Configuration
    MODEL_SIZE = "${params.modelSize}"
    EPOCHS = ${params.epochs}
    BATCH_SIZE = ${params.batchSize}
    IMAGE_SIZE = ${params.imageSize}
    LEARNING_RATE = ${params.learningRate}
    
    # Dataset configuration
    data_config = {
        'path': './dataset',
        'train': 'images/train',
        'val': 'images/val',
        'names': {
            0: 'plastic',
            1: 'bottles', 
            2: 'fishing_nets',
            3: 'general_debris',
            4: 'background'
        }
    }
    
    # Save data.yaml file
    with open('dataset/data.yaml', 'w') as f:
        yaml.dump(data_config, f)
    
    print("🚀 Starting YOLOv8 training for marine debris detection...")
    print(f"Model: {MODEL_SIZE}")
    print(f"Epochs: {EPOCHS}")
    print(f"Batch Size: {BATCH_SIZE}")
    print(f"Image Size: {IMAGE_SIZE}")
    print(f"Learning Rate: {LEARNING_RATE}")
    
    # Load YOLOv8 model
    model = YOLO(f'{MODEL_SIZE}.pt')
    
    # Train the model
    results = model.train(
        data='dataset/data.yaml',
        epochs=EPOCHS,
        batch=BATCH_SIZE,
        imgsz=IMAGE_SIZE,
        lr0=LEARNING_RATE,
        device='0',  # Use GPU 0, change to 'cpu' for CPU training
        project='debris_detection',
        name='marine_debris_v1',
        save=True,
        save_period=10,  # Save checkpoint every 10 epochs
        patience=50,  # Early stopping patience
        verbose=True,
        plots=True,  # Generate training plots
        val=True,  # Validate during training
        resume=False,  # Set to True to resume training
    )
    
    # Save the best model
    best_model_path = results.save_dir / 'weights' / 'best.pt'
    print(f"\\n✅ Training completed!")
    print(f"📁 Best model saved at: {best_model_path}")
    print(f"📊 Results saved in: {results.save_dir}")
    
    # Validate the model
    print("\\n🔍 Validating model...")
    model = YOLO(best_model_path)
    validation_results = model.val()
    
    print(f"mAP@0.5: {validation_results.box.map50:.3f}")
    print(f"mAP@0.5:0.95: {validation_results.box.map:.3f}")
    
    return best_model_path, results

def test_model_inference(model_path, test_image_path):
    """
    Test the trained model on a sample image
    """
    model = YOLO(model_path)
    results = model(test_image_path)
    
    # Process results
    for r in results:
        boxes = r.boxes
        if boxes is not None:
            for box in boxes:
                cls = int(box.cls)
                conf = float(box.conf)
                coords = box.xyxy[0].tolist()
                print(f"Detected: {model.names[cls]} (confidence: {conf:.2f})")
    
    # Save results
    results[0].save(filename='detection_result.jpg')
    return results

if __name__ == "__main__":
    # Train the model
    best_model, training_results = train_debris_detection_model()
    
    # Test inference (uncomment when you have a test image)
    # test_results = test_model_inference(best_model, "path/to/test/image.jpg")
    
    print("\\n🎉 Training pipeline completed successfully!")`;

  const inferenceCode = `# YOLOv8 Marine Debris Detection Inference Script
from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path
import matplotlib.pyplot as plt

def run_debris_detection(model_path, source):
    """
    Run marine debris detection on images, videos, or webcam
    
    Args:
        model_path: Path to trained YOLOv8 model
        source: Image path, video path, or 0 for webcam
    """
    
    # Load trained model
    model = YOLO(model_path)
    
    # Class names for marine debris
    class_names = {
        0: 'plastic',
        1: 'bottles', 
        2: 'fishing_nets',
        3: 'general_debris',
        4: 'background'
    }
    
    # Run detection
    results = model(
        source=source,
        save=True,  # Save results
        save_txt=True,  # Save labels
        save_conf=True,  # Save confidence scores
        show=True,  # Display results
        conf=0.5,  # Confidence threshold
        iou=0.45,  # IoU threshold for NMS
        device='0',  # GPU device
        project='inference_results',
        name='marine_debris_detection'
    )
    
    return results

def batch_process_satellite_images(model_path, image_dir, output_dir):
    """
    Process multiple satellite images for debris detection
    """
    model = YOLO(model_path)
    image_dir = Path(image_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)
    
    # Supported image formats
    image_extensions = {'.jpg', '.jpeg', '.png', '.tiff', '.tif'}
    
    detection_summary = []
    
    for image_path in image_dir.iterdir():
        if image_path.suffix.lower() in image_extensions:
            print(f"Processing: {image_path.name}")
            
            # Run detection
            results = model(str(image_path))
            
            # Process results
            for r in results:
                # Count detections by class
                class_counts = {}
                if r.boxes is not None:
                    for box in r.boxes:
                        cls = int(box.cls)
                        class_name = model.names[cls]
                        class_counts[class_name] = class_counts.get(class_name, 0) + 1
                
                detection_summary.append({
                    'image': image_path.name,
                    'detections': class_counts,
                    'total_objects': len(r.boxes) if r.boxes is not None else 0
                })
                
                # Save annotated image
                output_path = output_dir / f"detected_{image_path.name}"
                r.save(filename=str(output_path))
    
    # Print summary
    print("\\n🎯 Detection Summary:")
    for summary in detection_summary:
        print(f"{summary['image']}: {summary['total_objects']} objects detected")
        for class_name, count in summary['detections'].items():
            print(f"  - {class_name}: {count}")
    
    return detection_summary

# Example usage
if __name__ == "__main__":
    # Path to your trained model
    MODEL_PATH = "debris_detection/marine_debris_v1/weights/best.pt"
    
    # Single image detection
    # run_debris_detection(MODEL_PATH, "path/to/satellite/image.jpg")
    
    # Batch processing
    # batch_process_satellite_images(
    #     MODEL_PATH, 
    #     "satellite_images/", 
    #     "detection_results/"
    # )
    
    # Webcam detection
    # run_debris_detection(MODEL_PATH, 0)`;

  const setupCode = `# Setup and Installation Script for YOLOv8 Marine Debris Detection

# 1. Install required packages
pip install ultralytics opencv-python matplotlib pyyaml

# 2. Install CUDA (if using GPU)
# Visit: https://developer.nvidia.com/cuda-downloads
# Make sure PyTorch is installed with CUDA support:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 3. Verify installation
python -c "from ultralytics import YOLO; print('YOLOv8 installed successfully!')"

# 4. Download pre-trained weights (this happens automatically on first run)
# YOLOv8n: ~6MB
# YOLOv8s: ~22MB  
# YOLOv8m: ~52MB
# YOLOv8l: ~87MB
# YOLOv8x: ~131MB

# 5. Dataset structure example:
"""
dataset/
├── images/
│   ├── train/           # Training images
│   │   ├── img1.jpg
│   │   ├── img2.jpg
│   │   └── ...
│   └── val/             # Validation images
│       ├── val1.jpg
│       ├── val2.jpg
│       └── ...
├── labels/
│   ├── train/           # Training labels (YOLO format)
│   │   ├── img1.txt
│   │   ├── img2.txt
│   │   └── ...
│   └── val/             # Validation labels
│       ├── val1.txt
│       ├── val2.txt
│       └── ...
└── data.yaml            # Dataset configuration
"""

# 6. Label format (YOLO):
# Each .txt file contains one line per object:
# class_id center_x center_y width height
# All coordinates are normalized (0-1)
# Example: 0 0.5 0.5 0.2 0.3
#          ^   ^   ^   ^   ^
#          |   |   |   |   height
#          |   |   |   width  
#          |   |   center_y
#          |   center_x
#          class_id (0=plastic, 1=bottles, etc.)`;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${type} code has been copied to your clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const downloadCode = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `${filename} has been downloaded.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Python Implementation Code
          </CardTitle>
          <CardDescription>
            Complete YOLOv8 training and inference code for marine debris detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="training" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="training">Training Script</TabsTrigger>
              <TabsTrigger value="inference">Inference Script</TabsTrigger>
              <TabsTrigger value="setup">Setup & Install</TabsTrigger>
            </TabsList>

            <TabsContent value="training" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="secondary">Python 3.8+</Badge>
                  <Badge variant="secondary">PyTorch</Badge>
                  <Badge variant="secondary">Ultralytics</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(trainingCode, "Training")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCode(trainingCode, "yolo_training.py")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  <code>{trainingCode}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="inference" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="secondary">Real-time Detection</Badge>
                  <Badge variant="secondary">Batch Processing</Badge>
                  <Badge variant="secondary">Satellite Imagery</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(inferenceCode, "Inference")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCode(inferenceCode, "yolo_inference.py")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  <code>{inferenceCode}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="setup" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="secondary">Installation</Badge>
                  <Badge variant="secondary">Dependencies</Badge>
                  <Badge variant="secondary">Dataset Format</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(setupCode, "Setup")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCode(setupCode, "setup_instructions.txt")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  <code>{setupCode}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-gradient-success text-white shadow-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-white/90">
            <li>Install dependencies using the setup script</li>
            <li>Prepare your dataset in YOLO format</li>
            <li>Configure training parameters in the web interface</li>
            <li>Run the training script with your parameters</li>
            <li>Use the inference script to detect debris in new images</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};