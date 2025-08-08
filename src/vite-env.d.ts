/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'lottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      autoplay?: boolean;
      loop?: boolean;
      mode?: string;
      background?: string;
      speed?: number;
      style?: React.CSSProperties;
    };
  }
}

