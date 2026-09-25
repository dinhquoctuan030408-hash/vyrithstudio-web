'use client';

import React, { useState } from 'react';
import { Cpu, Terminal, Sparkles, Layers } from 'lucide-react';

interface StudioIconProps {
  src?: string;
  alt?: string;
  className?: string;
  fallbackType?: 'cpu' | 'terminal' | 'sparkles' | 'layers';
}

export default function StudioIcon({
  src,
  alt = 'icon',
  className = 'w-full h-full object-contain',
  fallbackType = 'cpu',
}: StudioIconProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    if (fallbackType === 'terminal') {
      return <Terminal className="w-5 h-5 text-blue-400" />;
    }
    if (fallbackType === 'sparkles') {
      return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
    if (fallbackType === 'layers') {
      return <Layers className="w-4 h-4 text-cyan-400" />;
    }
    return <Cpu className="w-5 h-5 text-blue-400" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}