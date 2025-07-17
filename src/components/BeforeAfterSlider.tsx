
'use client';

import * as React from 'react';
import Image, { type StaticImageData } from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BeforeAfterSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  beforeSrc: StaticImageData | string;
  afterSrc: StaticImageData | string;
  beforeHint?: string;
  afterHint?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeHint,
  afterHint,
  className,
  ...props
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = React.useState(50);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  React.useEffect(() => {
    const handleMouseUpOutside = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUpOutside);
    window.addEventListener('touchend', handleMouseUpOutside);
    return () => {
      window.removeEventListener('mouseup', handleMouseUpOutside);
      window.removeEventListener('touchend', handleMouseUpOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full aspect-[5/6] max-w-md mx-auto overflow-hidden rounded-3xl select-none cursor-ew-resize shadow-2xl hover-lift',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      {...props}
    >
      {/* Before Image */}
      <Image
        src={beforeSrc}
        alt="Dirty sneaker before cleaning"
        width={500}
        height={600}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        data-ai-hint={beforeHint}
        priority
      />
      
      {/* After Image Container */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={afterSrc}
          alt="Clean sneaker after restoration"
          width={500}
          height={600}
          className="absolute inset-0 w-full h-full object-cover"
          data-ai-hint={afterHint}
          priority
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-black/50 backdrop-blur-sm pointer-events-none"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
      />
      
      {/* Slider Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center cursor-ew-resize"
        style={{ left: `calc(${sliderPosition}% - 24px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <ChevronLeft className="h-6 w-6 text-gray-300" />
        <ChevronRight className="h-6 w-6 text-gray-300" />
      </div>
    </div>
  );
}
