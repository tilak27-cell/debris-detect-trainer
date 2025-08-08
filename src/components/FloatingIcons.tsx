import { Fish, Waves, Leaf } from 'lucide-react';

export const FloatingIcons = () => {
  const items = [
    { Icon: Fish, className: 'top-20 left-10 text-primary/30', delay: '0s' },
    { Icon: Waves, className: 'top-40 right-12 text-primary/20', delay: '0.5s' },
    { Icon: Leaf, className: 'bottom-24 left-16 text-accent/30', delay: '1s' },
    { Icon: Fish, className: 'bottom-16 right-20 text-primary/25', delay: '1.2s' },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {items.map(({ Icon, className, delay }, idx) => (
        <Icon key={idx} className={`absolute h-8 w-8 animate-float ${className}`} style={{ animationDelay: delay }} />
      ))}
    </div>
  );
};
