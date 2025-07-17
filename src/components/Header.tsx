'use client';

import * as React from 'react';
import Link from 'next/link';
import { Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
          : 'bg-transparent'
      )}
    >
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 ml-4 flex flex-1">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Droplets className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">SneaksWash</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/#services"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Services
            </Link>
            <Link
              href="/#pricing"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Pricing
            </Link>
            <Link
              href="/#process"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Process
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
