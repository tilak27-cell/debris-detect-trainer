import { Copy, Download, Code } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export const SeverityCodeDisplay = () => {
  const { toast } = useToast();

  const severityClassificationCode = `# Marine Debris Severity Classification System
from ultralytics import YOLO
import cv2
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw, ImageFont
import os
from datetime import datetime
import json

class DebrisSeverityClassifier:
    """
    Marine debris detection with severity classification based on object count
    
    Severity Levels:
    - GREEN: ≤ 5 objects (Low pollution)
    - YELLOW: 6-15 objects (Moderate pollution) 
    - RED: > 15 objects (Critical pollution)
    """
    
    def __init__(self, model_path, confidence_threshold=0.5):
        """
        Initialize the severity classifier
        
        Args:
            model_path (str): Path to trained YOLOv8 model
            confidence_threshold (float): Minimum confidence for detections
        """
        self.model = YOLO(model_path)
        self.confidence_threshold = confidence_threshold
        
        # Severity classification rules
        self.severity_rules = {
            'green': {'min': 0, 'max': 5, 'label': 'LOW POLLUTION'},
            'yellow': {'min': 6, 'max': 15, 'label': 'MODERATE POLLUTION'},
            'red': {'min': 16, 'max': float('inf'), 'label': 'CRITICAL POLLUTION'}
        }
        
        # Color mapping for severity levels
        self.severity_colors = {
            'green': (0, 255, 0),    # Green
            'yellow': (0, 255, 255), # Yellow  
            'red': (0, 0, 255)       # Red
        }
        
        print("🔍 Debris Severity Classifier initialized")
        print(f"📊 Model: {model_path}")
        print(f"🎯 Confidence threshold: {confidence_threshold}")
    
    def classify_severity(self, object_count):
        """
        Classify severity based on detected object count
        
        Args:
            object_count (int): Number of detected debris objects
            
        Returns:
            tuple: (severity_level, severity_label, color)
        """
        for level, rules in self.severity_rules.items():
            if rules['min'] <= object_count <= rules['max']:
                return level, rules['label'], self.severity_colors[level]
        
        # Default to red if count exceeds all thresholds
        return 'red', self.severity_rules['red']['label'], self.severity_colors['red']
    
    def detect_and_classify(self, image_path, output_path=None):
        """
        Detect debris and classify severity for a single image
        
        Args:
            image_path (str): Path to input image
            output_path (str): Path to save annotated image (optional)
            
        Returns:
            dict: Detection results with severity classification
        """
        print(f"\\n🖼️  Processing: {os.path.basename(image_path)}")
        
        # Run YOLO detection
        results = self.model(image_path, conf=self.confidence_threshold)
        
        # Load image for annotation
        image = cv2.imread(image_path)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        height, width = image.shape[:2]
        
        # Process detections
        detected_objects = []
        
        for r in results:
            if r.boxes is not None:
                boxes = r.boxes.cpu().numpy()
                
                for box in boxes:
                    # Extract box information
                    x1, y1, x2, y2 = box.xyxy[0].astype(int)
                    confidence = float(box.conf[0])
                    class_id = int(box.cls[0])
                    class_name = self.model.names[class_id]
                    
                    detected_objects.append({
                        'class': class_name,
                        'confidence': confidence,
                        'bbox': [x1, y1, x2, y2],
                        'bbox_normalized': [x1/width, y1/height, x2/width, y2/height]
                    })
                    
                    # Draw bounding box
                    cv2.rectangle(image_rgb, (x1, y1), (x2, y2), (255, 255, 255), 2)
                    
                    # Add class label
                    label = f"{class_name}: {confidence:.2f}"
                    cv2.putText(image_rgb, label, (x1, y1-10), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Count total objects and classify severity
        object_count = len(detected_objects)
        severity_level, severity_label, severity_color = self.classify_severity(object_count)
        
        # Add severity banner to image
        banner_height = 80
        banner_image = np.zeros((banner_height, width, 3), dtype=np.uint8)
        banner_image[:] = severity_color
        
        # Add severity text to banner
        font_scale = min(width / 800.0, 2.0)  # Scale font based on image width
        thickness = max(1, int(font_scale * 2))
        
        # Main severity label
        text = f"{severity_label} - {object_count} OBJECTS DETECTED"
        text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)[0]
        text_x = (width - text_size[0]) // 2
        text_y = 35
        
        cv2.putText(banner_image, text, (text_x, text_y), 
                   cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), thickness)
        
        # Add timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(banner_image, f"Analysis: {timestamp}", (10, 65), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        # Combine banner with image
        annotated_image = np.vstack([banner_image, image_rgb])
        
        # Save annotated image if output path provided
        if output_path:
            Image.fromarray(annotated_image).save(output_path)
            print(f"💾 Annotated image saved: {output_path}")
        
        # Prepare results
        result = {
            'image_path': image_path,
            'timestamp': timestamp,
            'object_count': object_count,
            'severity_level': severity_level,
            'severity_label': severity_label,
            'detected_objects': detected_objects,
            'class_summary': self._get_class_summary(detected_objects),
            'annotated_image': annotated_image if not output_path else None
        }
        
        # Print results
        print(f"🎯 Objects detected: {object_count}")
        print(f"🚨 Severity: {severity_level.upper()} - {severity_label}")
        print(f"📋 Classes found: {', '.join(result['class_summary'].keys())}")
        
        return result
    
    def _get_class_summary(self, detected_objects):
        """Get summary of detected object classes"""
        class_counts = {}
        for obj in detected_objects:
            class_name = obj['class']
            class_counts[class_name] = class_counts.get(class_name, 0) + 1
        return class_counts
    
    def batch_process(self, input_dir, output_dir):
        """
        Process multiple images and generate severity report
        
        Args:
            input_dir (str): Directory containing input images
            output_dir (str): Directory to save annotated images and report
        """
        os.makedirs(output_dir, exist_ok=True)
        
        # Supported image formats
        image_extensions = {'.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp'}
        
        # Find all images
        image_files = []
        for file in os.listdir(input_dir):
            if any(file.lower().endswith(ext) for ext in image_extensions):
                image_files.append(file)
        
        if not image_files:
            print("❌ No images found in input directory")
            return
        
        print(f"\\n📁 Processing {len(image_files)} images from {input_dir}")
        print(f"📁 Output directory: {output_dir}")
        
        # Process each image
        all_results = []
        severity_summary = {'green': 0, 'yellow': 0, 'red': 0}
        
        for i, filename in enumerate(image_files, 1):
            print(f"\\n--- Processing {i}/{len(image_files)} ---")
            
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, f"analyzed_{filename}")
            
            try:
                result = self.detect_and_classify(input_path, output_path)
                all_results.append(result)
                severity_summary[result['severity_level']] += 1
                
            except Exception as e:
                print(f"❌ Error processing {filename}: {str(e)}")
                continue
        
        # Generate summary report
        report = {
            'analysis_timestamp': datetime.now().isoformat(),
            'total_images': len(all_results),
            'severity_summary': severity_summary,
            'average_objects_per_image': sum(r['object_count'] for r in all_results) / len(all_results),
            'most_common_classes': self._get_overall_class_summary(all_results),
            'detailed_results': [
                {
                    'filename': os.path.basename(r['image_path']),
                    'object_count': r['object_count'],
                    'severity_level': r['severity_level'],
                    'severity_label': r['severity_label'],
                    'class_summary': r['class_summary']
                }
                for r in all_results
            ]
        }
        
        # Save report
        report_path = os.path.join(output_dir, 'severity_analysis_report.json')
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        print("\\n" + "="*60)
        print("🎯 BATCH ANALYSIS COMPLETE")
        print("="*60)
        print(f"📊 Total images processed: {len(all_results)}")
        print(f"🟢 Green (Low): {severity_summary['green']} images")
        print(f"🟡 Yellow (Moderate): {severity_summary['yellow']} images") 
        print(f"🔴 Red (Critical): {severity_summary['red']} images")
        print(f"📈 Average objects per image: {report['average_objects_per_image']:.1f}")
        print(f"📋 Report saved: {report_path}")
        
        return report
    
    def _get_overall_class_summary(self, all_results):
        """Get overall class statistics across all images"""
        overall_classes = {}
        for result in all_results:
            for class_name, count in result['class_summary'].items():
                overall_classes[class_name] = overall_classes.get(class_name, 0) + count
        
        # Sort by frequency
        return dict(sorted(overall_classes.items(), key=lambda x: x[1], reverse=True))

def main():
    """
    Example usage of the DebrisSeverityClassifier
    """
    # Initialize classifier with your trained model
    MODEL_PATH = "debris_detection/marine_debris_v1/weights/best.pt"
    classifier = DebrisSeverityClassifier(MODEL_PATH, confidence_threshold=0.5)
    
    # Single image analysis
    # result = classifier.detect_and_classify(
    #     "path/to/satellite/image.jpg",
    #     "path/to/output/analyzed_image.jpg"
    # )
    
    # Batch processing
    # report = classifier.batch_process(
    #     input_dir="satellite_images/",
    #     output_dir="severity_analysis_results/"
    # )
    
    print("\\n✅ Severity classification system ready!")
    print("🔍 Use detect_and_classify() for single images")
    print("📁 Use batch_process() for multiple images")

if __name__ == "__main__":
    main()`;

  const visualizationCode = `# Advanced Visualization for Severity Classification Results
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from matplotlib.patches import Rectangle
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

class SeverityVisualization:
    """
    Create advanced visualizations for debris severity analysis results
    """
    
    def __init__(self, results_data):
        """
        Initialize with results from DebrisSeverityClassifier
        
        Args:
            results_data: List of detection results or path to JSON report
        """
        if isinstance(results_data, str):
            import json
            with open(results_data, 'r') as f:
                data = json.load(f)
                self.results = data['detailed_results']
                self.summary = data['severity_summary']
        else:
            self.results = results_data
            self.summary = self._calculate_summary()
        
        self.df = pd.DataFrame(self.results)
        
    def _calculate_summary(self):
        """Calculate severity summary from results"""
        summary = {'green': 0, 'yellow': 0, 'red': 0}
        for result in self.results:
            summary[result['severity_level']] += 1
        return summary
    
    def create_severity_dashboard(self, save_path=None):
        """
        Create a comprehensive dashboard showing all analysis results
        """
        fig = make_subplots(
            rows=2, cols=3,
            subplot_titles=(
                'Severity Distribution', 'Object Count Distribution', 
                'Class Frequency', 'Severity Over Time', 
                'Object Count vs Severity', 'Detailed Heatmap'
            ),
            specs=[[{"type": "pie"}, {"type": "histogram"}, {"type": "bar"}],
                   [{"type": "scatter"}, {"type": "box"}, {"type": "heatmap"}]]
        )
        
        # 1. Severity Distribution (Pie Chart)
        severity_counts = [self.summary['green'], self.summary['yellow'], self.summary['red']]
        severity_labels = ['Green (Low)', 'Yellow (Moderate)', 'Red (Critical)']
        colors = ['#00ff00', '#ffff00', '#ff0000']
        
        fig.add_trace(
            go.Pie(
                labels=severity_labels,
                values=severity_counts,
                marker_colors=colors,
                name="Severity Distribution"
            ),
            row=1, col=1
        )
        
        # 2. Object Count Distribution
        object_counts = [r['object_count'] for r in self.results]
        fig.add_trace(
            go.Histogram(
                x=object_counts,
                nbinsx=20,
                name="Object Count Distribution",
                marker_color='lightblue'
            ),
            row=1, col=2
        )
        
        # 3. Class Frequency
        all_classes = {}
        for result in self.results:
            for class_name, count in result.get('class_summary', {}).items():
                all_classes[class_name] = all_classes.get(class_name, 0) + count
        
        if all_classes:
            fig.add_trace(
                go.Bar(
                    x=list(all_classes.keys()),
                    y=list(all_classes.values()),
                    name="Class Frequency",
                    marker_color='lightgreen'
                ),
                row=1, col=3
            )
        
        # 4. Object Count vs Severity (Box Plot)
        severity_mapping = {'green': 1, 'yellow': 2, 'red': 3}
        severity_numbers = [severity_mapping[r['severity_level']] for r in self.results]
        
        fig.add_trace(
            go.Box(
                y=object_counts,
                x=[r['severity_level'].title() for r in self.results],
                name="Object Count by Severity",
                marker_color='orange'
            ),
            row=2, col=2
        )
        
        # Update layout
        fig.update_layout(
            title="Marine Debris Severity Analysis Dashboard",
            height=800,
            showlegend=False
        )
        
        if save_path:
            fig.write_html(save_path)
            print(f"📊 Dashboard saved: {save_path}")
        
        fig.show()
        return fig
    
    def create_severity_map(self, coordinates=None, save_path=None):
        """
        Create a geographical map showing severity levels
        
        Args:
            coordinates: List of (lat, lon) coordinates for each image
            save_path: Path to save the map HTML file
        """
        if coordinates is None:
            # Generate random coordinates for demo
            np.random.seed(42)
            coordinates = [
                (np.random.uniform(25, 45), np.random.uniform(-125, -70))
                for _ in range(len(self.results))
            ]
        
        # Prepare data for mapping
        lats, lons = zip(*coordinates)
        colors = {'green': '#00ff00', 'yellow': '#ffff00', 'red': '#ff0000'}
        
        fig = go.Figure()
        
        for severity in ['green', 'yellow', 'red']:
            severity_results = [r for r in self.results if r['severity_level'] == severity]
            if not severity_results:
                continue
                
            severity_indices = [i for i, r in enumerate(self.results) if r['severity_level'] == severity]
            severity_lats = [lats[i] for i in severity_indices]
            severity_lons = [lons[i] for i in severity_indices]
            severity_counts = [self.results[i]['object_count'] for i in severity_indices]
            
            fig.add_trace(go.Scattermapbox(
                lat=severity_lats,
                lon=severity_lons,
                mode='markers',
                marker=dict(
                    size=[max(8, min(30, count * 2)) for count in severity_counts],
                    color=colors[severity],
                    opacity=0.7
                ),
                text=[f"Objects: {count}<br>Severity: {severity.title()}" 
                      for count in severity_counts],
                name=f"{severity.title()} Severity",
                hovertemplate="<b>%{text}</b><br>Lat: %{lat}<br>Lon: %{lon}<extra></extra>"
            ))
        
        fig.update_layout(
            title="Marine Debris Severity Geographical Distribution",
            mapbox=dict(
                style="open-street-map",
                center=dict(lat=np.mean(lats), lon=np.mean(lons)),
                zoom=5
            ),
            height=600
        )
        
        if save_path:
            fig.write_html(save_path)
            print(f"🗺️  Severity map saved: {save_path}")
        
        fig.show()
        return fig
    
    def create_trend_analysis(self, save_path=None):
        """
        Create trend analysis charts
        """
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('Marine Debris Analysis Trends', fontsize=16, fontweight='bold')
        
        # 1. Severity distribution pie chart
        ax1 = axes[0, 0]
        colors = ['#00ff00', '#ffff00', '#ff0000']
        wedges, texts, autotexts = ax1.pie(
            [self.summary['green'], self.summary['yellow'], self.summary['red']],
            labels=['Green\\n(≤5 objects)', 'Yellow\\n(6-15 objects)', 'Red\\n(>15 objects)'],
            colors=colors,
            autopct='%1.1f%%',
            startangle=90
        )
        ax1.set_title('Severity Level Distribution')
        
        # 2. Object count histogram
        ax2 = axes[0, 1]
        object_counts = [r['object_count'] for r in self.results]
        ax2.hist(object_counts, bins=20, color='skyblue', alpha=0.7, edgecolor='black')
        ax2.axvline(5.5, color='green', linestyle='--', label='Green threshold')
        ax2.axvline(15.5, color='red', linestyle='--', label='Red threshold')
        ax2.set_xlabel('Number of Objects Detected')
        ax2.set_ylabel('Frequency')
        ax2.set_title('Object Count Distribution')
        ax2.legend()
        
        # 3. Class frequency bar chart
        ax3 = axes[1, 0]
        all_classes = {}
        for result in self.results:
            for class_name, count in result.get('class_summary', {}).items():
                all_classes[class_name] = all_classes.get(class_name, 0) + count
        
        if all_classes:
            classes = list(all_classes.keys())
            counts = list(all_classes.values())
            bars = ax3.bar(classes, counts, color='lightcoral')
            ax3.set_xlabel('Debris Classes')
            ax3.set_ylabel('Total Count')
            ax3.set_title('Detected Object Classes')
            ax3.tick_params(axis='x', rotation=45)
            
            # Add value labels on bars
            for bar, count in zip(bars, counts):
                ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                        str(count), ha='center', va='bottom')
        
        # 4. Severity vs Object Count scatter
        ax4 = axes[1, 1]
        severity_order = ['green', 'yellow', 'red']
        severity_colors = {'green': '#00ff00', 'yellow': '#ffff00', 'red': '#ff0000'}
        
        for i, severity in enumerate(severity_order):
            severity_data = [r for r in self.results if r['severity_level'] == severity]
            if severity_data:
                counts = [r['object_count'] for r in severity_data]
                y_positions = [i] * len(counts)
                ax4.scatter(counts, y_positions, 
                           c=severity_colors[severity], 
                           alpha=0.6, s=60, 
                           label=f'{severity.title()} ({len(counts)} images)')
        
        ax4.set_yticks(range(len(severity_order)))
        ax4.set_yticklabels([s.title() for s in severity_order])
        ax4.set_xlabel('Number of Objects')
        ax4.set_ylabel('Severity Level')
        ax4.set_title('Object Count by Severity Level')
        ax4.legend()
        ax4.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"📈 Trend analysis saved: {save_path}")
        
        plt.show()
        return fig

# Example usage
def create_analysis_report(results_json_path):
    """
    Create a complete visual analysis report
    """
    viz = SeverityVisualization(results_json_path)
    
    # Create dashboard
    viz.create_severity_dashboard("severity_dashboard.html")
    
    # Create geographical map
    viz.create_severity_map(save_path="severity_map.html")
    
    # Create trend analysis
    viz.create_trend_analysis("trend_analysis.png")
    
    print("\\n📊 Complete analysis report generated!")
    print("📁 Files created:")
    print("   - severity_dashboard.html")
    print("   - severity_map.html") 
    print("   - trend_analysis.png")

if __name__ == "__main__":
    # Example usage
    # create_analysis_report("severity_analysis_report.json")
    pass`;

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
            Severity Classification Implementation
          </CardTitle>
          <CardDescription>
            Complete Python code for marine debris severity classification with advanced analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="classification" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="classification">Main Classification</TabsTrigger>
              <TabsTrigger value="visualization">Visualization & Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="classification" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="secondary">YOLOv8</Badge>
                  <Badge variant="secondary">OpenCV</Badge>
                  <Badge variant="secondary">Severity Rules</Badge>
                  <Badge variant="secondary">Batch Processing</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(severityClassificationCode, "Severity Classification")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCode(severityClassificationCode, "severity_classifier.py")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                <pre className="text-sm">
                  <code>{severityClassificationCode}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="visualization" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="secondary">Matplotlib</Badge>
                  <Badge variant="secondary">Plotly</Badge>
                  <Badge variant="secondary">Dashboard</Badge>
                  <Badge variant="secondary">Geographic Maps</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(visualizationCode, "Visualization")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCode(visualizationCode, "severity_visualization.py")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                <pre className="text-sm">
                  <code>{visualizationCode}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Key Features Summary */}
      <Card className="bg-gradient-success text-white shadow-glow">
        <CardHeader>
          <CardTitle>Key Features Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
            <div>
              <h4 className="font-semibold mb-2">🎯 Core Classification</h4>
              <ul className="space-y-1 text-sm">
                <li>• Automated severity rules (Red/Yellow/Green)</li>
                <li>• Confidence threshold filtering</li>
                <li>• Object counting and classification</li>
                <li>• Annotated image generation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📊 Advanced Analytics</h4>
              <ul className="space-y-1 text-sm">
                <li>• Interactive dashboards</li>
                <li>• Geographic severity mapping</li>
                <li>• Trend analysis and reporting</li>
                <li>• Batch processing capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Quick Start Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Install dependencies: <code className="bg-muted px-2 py-1 rounded">pip install ultralytics opencv-python matplotlib plotly pandas seaborn</code></li>
            <li>Initialize classifier with your trained model path</li>
            <li>Use <code className="bg-muted px-2 py-1 rounded">detect_and_classify()</code> for single images</li>
            <li>Use <code className="bg-muted px-2 py-1 rounded">batch_process()</code> for multiple images</li>
            <li>Generate visualizations with <code className="bg-muted px-2 py-1 rounded">SeverityVisualization</code> class</li>
            <li>Export detailed JSON reports for further analysis</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};