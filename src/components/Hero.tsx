"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Star, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { siteStats } from "@/lib/siteData";
import HeroImage1 from "@/../public/HeroImage1.jpg";
import HeroImage2 from "@/../public/HeroImage2.jpg";

import { BeforeAfterSlider } from "./BeforeAfterSlider";

export function Hero() {
  return (
    <section className="pt-20 pb-12 px-4 min-h-screen flex items-center">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          <div className="space-y-8 animate-fade-in text-center lg:text-left lg:max-w-xl">
            <div className="space-y-4">
              {/* <div className="inline-flex items-center space-x-2 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
                <Star className="h-3 w-3 text-primary" />
                <span className="text-xs md-sm text-muted-foreground">
                  UK's Premier Sneaker Cleaning Service
                </span>
              </div> */}
              <h1 className="text-[55px] lg:text-7xl font-bold leading-tight font-headline tracking-tighter">
                <span className="text-foreground">Your Sneakers</span>
                <br />
                <span className="gradient-text">Deserve Better</span>
              </h1>
              <p className="text-md md:text-xl text-muted-foreground max-w-md mx-auto lg:mx-0">
                Enjoy luxury cleaning and fast, secure delivery, beautifully
                restored in as little as 24 hours
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="font-semibold hover-lift glow-effect group"
                asChild
              >
                <Link href="/book">
                  Book Now
                  <CalendarPlus className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="hidden md:flex font-semibold hover-lift glow-effect group"
                asChild
                variant="outline"
              >
                <Link href="/book">
                  Learn more
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {siteStats.sneakersCleaned}
                </div>
                <div className="text-sm text-muted-foreground">
                  Sneakers Cleaned
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {siteStats.customerRating}
                </div>
                <div className="text-sm text-muted-foreground">
                  Customer Rating
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {siteStats.turnaround}
                </div>
                <div className="text-sm text-muted-foreground">Turnaround</div>
              </div>
            </div>
          </div>

          <div className="relative animate-float mt-12 lg:mt-0 w-full max-w-md">
            <div className="absolute -inset-8 bg-gradient-to-r from-primary to-accent rounded-3xl blur-3xl opacity-30 lg:opacity-30"></div>
            <BeforeAfterSlider
              beforeSrc="/HeroImage1.jpg"
              afterSrc="/HeroImage2.jpg"
              beforeHint="dirty sneaker"
              afterHint="clean sneaker"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
