import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Sparkles, Waves } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface SeverityResultCardProps {
  result: DetectionResult;
  index: number;
  isNew?: boolean;
}

export const SeverityResultCard = ({ result, index, isNew = false }: SeverityResultCardProps) => {
  const [showResult, setShowResult] = useState(!isNew);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (isNew) {
      // Delay showing result for dramatic effect
      const timer = setTimeout(() => {
        setShowResult(true);
        // Add sparkle effects for new results
        const newSparkles = Array.from({ length: 5 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100
        }));
        setSparkles(newSparkles);
        
        // Clear sparkles after animation
        setTimeout(() => setSparkles([]), 2000);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const getSeverityConfig = (level: string) => {
    switch (level) {
      case 'red':
        return {
          color: 'text-severity-red bg-red-50 border-red-200',
          icon: <AlertTriangle className="h-5 w-5" />,
          gradient: 'from-red-500/20 to-red-600/20',
          message: 'Critical Pollution'
        };
      case 'yellow':
        return {
          color: 'text-severity-yellow bg-yellow-50 border-yellow-200',
          icon: <AlertCircle className="h-5 w-5" />,
          gradient: 'from-yellow-500/20 to-yellow-600/20',
          message: 'Moderate Pollution'
        };
      case 'green':
        return {
          color: 'text-severity-green bg-green-50 border-green-200',
          icon: <CheckCircle className="h-5 w-5" />,
          gradient: 'from-green-500/20 to-green-600/20',
          message: 'Low Pollution'
        };
      default:
        return {
          color: 'text-muted-foreground bg-muted border-muted',
          icon: <AlertCircle className="h-5 w-5" />,
          gradient: 'from-gray-500/20 to-gray-600/20',
          message: 'Unknown'
        };
    }
  };

  const config = getSeverityConfig(result.severityLevel);

  if (!showResult) {
    return (
      <Card className="border-2 border-primary/20 shadow-water">
        <CardContent className="p-6">
          <div className="aspect-video bg-gradient-water rounded-xl mb-4 flex items-center justify-center">
            <div className="text-center">
              <Waves className="h-12 w-12 text-primary/60 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">Processing...</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted/50 rounded animate-pulse" />
            <div className="h-3 bg-muted/30 rounded animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const uniqueClasses = [...new Set(result.detectedObjects.map(obj => obj.class))];

  return (
    <Card 
      className={`relative border-2 ${config.color} shadow-water overflow-hidden ${
        isNew ? 'animate-bounce-in' : 'animate-fade-in-up'
      }`}
      style={{ animationDelay: isNew ? '0s' : `${index * 0.1}s` }}
    >
      {/* Sparkle effects for new results */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute pointer-events-none z-10"
          style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
        >
          <Sparkles className="h-4 w-4 text-primary animate-bounce-in" />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-30`} />
      
      <CardContent className="relative p-6">
        {/* Image with bounding boxes */}
        <div className="aspect-video bg-muted/20 rounded-xl mb-4 overflow-hidden shadow-inner">
          <img
            src={result.annotatedImageUrl || result.imageUrl}
            alt={`Marine debris analysis ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Severity indicator */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            {config.icon}
            <Badge variant="secondary" className={`${config.color} font-medium shadow-sm`}>
              {result.severityLevel.toUpperCase()}
            </Badge>
          </div>
          <div className={`h-2 w-2 rounded-full ${
            result.severityLevel === 'red' ? 'bg-severity-red' :
            result.severityLevel === 'yellow' ? 'bg-severity-yellow' :
            'bg-severity-green'
          } animate-pulse`} />
        </div>

        {/* Details */}
        <div className="space-y-2">
          <p className="font-medium text-foreground">
            {config.message} Detected
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{result.detectionCount} objects</span> found in ocean imagery
          </p>
          
          {uniqueClasses.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Types:</span> {uniqueClasses.join(', ')}
            </div>
          )}
        </div>

        {/* Floating animation overlay */}
        <div className="absolute top-2 right-2 opacity-60">
          <Waves className="h-4 w-4 text-primary animate-float" />
        </div>
      </CardContent>
    </Card>
  );
};