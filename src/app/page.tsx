
'use client';

import * as React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Process } from '@/components/Process';
import { Services } from '@/components/Services';
import { Testimonials } from '@/components/Testimonials';
import { InstagramFeed } from '@/components/InstagramFeed';
import { Pricing } from '@/components/Pricing';


export default function Home() {
  return (
    <div className="bg-background text-foreground">
      {/* Background elements are now isolated and fixed to the background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-1/2 top-0 h-[100vh] w-[100vw] -translate-x-1/2 bg-[radial-gradient(circle_50%_50%_at_50%_50%,#8EACFF33,transparent)]"></div>
      </div>

      {/* All content is wrapped in a relative div with a higher z-index to ensure it's on top and clickable */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Hero />
          <Process />
          <Services />
          <Pricing />
          <Testimonials />
          <InstagramFeed />
        </main>

        <footer className="py-6 border-t border-border bg-gray-950/50 backdrop-blur-sm">
          <div className="container text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SneaksWash. All Rights Reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
