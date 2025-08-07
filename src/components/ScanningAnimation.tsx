import { useState, useEffect } from 'react';
import { Radar, Waves, Zap } from 'lucide-react';

interface ScanningAnimationProps {
  progress: number;
  isActive: boolean;
}

export const ScanningAnimation = ({ progress, isActive }: ScanningAnimationProps) => {
  const [scanLines, setScanLines] = useState<Array<{ id: number; delay: number }>>([]);

  useEffect(() => {
    if (isActive) {
      const lines = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        delay: i * 0.5
      }));
      setScanLines(lines);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="relative w-full">
      {/* Main scanning container */}
      <div className="relative bg-gradient-ocean/10 rounded-2xl p-8 border border-primary/20 shadow-water">
        {/* Radar animation */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Radar className="h-16 w-16 text-primary animate-spin" style={{ animationDuration: '2s' }} />
            
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-pulse-ring" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Scanning text */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2 animate-fade-in-up">
            Scanning for Marine Debris
          </h3>
          <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            AI is analyzing ocean imagery for pollution detection...
          </p>
        </div>

        {/* Progress bar with wave effect */}
        <div className="relative mb-4">
          <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-ocean transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Flowing water effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" />
            </div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Analyzing...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Scan lines */}
        <div className="relative h-2 mb-6 overflow-hidden rounded-full bg-muted/20">
          {scanLines.map((line) => (
            <div
              key={line.id}
              className="absolute top-0 left-0 h-full w-1 bg-primary/60 animate-scan"
              style={{ 
                animationDelay: `${line.delay}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>

        {/* Floating icons */}
        <div className="flex justify-center gap-8">
          <div className="animate-float">
            <Waves className="h-6 w-6 text-primary/60" />
          </div>
          <div className="animate-float" style={{ animationDelay: '0.5s' }}>
            <Zap className="h-6 w-6 text-primary/60" />
          </div>
          <div className="animate-float" style={{ animationDelay: '1s' }}>
            <Waves className="h-6 w-6 text-primary/60" />
          </div>
        </div>

        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};