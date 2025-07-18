"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Star, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { siteStats } from "@/lib/siteData";
import { motion } from "framer-motion";

import { BeforeAfterSlider } from "./BeforeAfterSlider";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const imageVariants = {
    initial: {
      y: 0,
    },
    animate: {
      y: [-10, 10],
      transition: {
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror",
      },
    },
  };

  return (
    <section className="pt-20 pb-12 px-4 min-h-screen flex items-center">
      <motion.div
        className="container mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          <motion.div
            className="space-y-8 text-center pb-8 lg:text-left lg:max-w-xl"
            variants={containerVariants}
          >
            <div className="space-y-4">
              <motion.h1
                className="text-[55px] lg:text-7xl font-bold leading-tight font-headline tracking-tighter"
                variants={itemVariants}
              >
                <span className="text-foreground">Your Sneakers</span>
                <br />
                <span className="gradient-text">Deserve Better</span>
              </motion.h1>
              <motion.p
                className="text-md md:text-xl text-muted-foreground max-w-md mx-auto lg:mx-0"
                variants={itemVariants}
              >
                Enjoy luxury cleaning and fast, secure delivery, beautifully
                restored in as little as 24 hours.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={itemVariants}
            >
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
            </motion.div>

            <motion.div
              className="flex items-center justify-center lg:justify-start space-x-8 pt-4"
              variants={itemVariants}
            >
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
            </motion.div>
          </motion.div>

          <motion.div
            className="relative mt-12 lg:mt-0 w-full max-w-md"
            variants={imageVariants}
            initial="initial"
            animate="animate"
          >
            <div className="absolute -inset-8 bg-gradient-to-r from-primary to-accent rounded-3xl blur-3xl opacity-30 lg:opacity-30"></div>
            <BeforeAfterSlider
              beforeSrc="/HeroImage1.jpg"
              afterSrc="/HeroImage2.jpg"
              beforeHint="dirty sneaker"
              afterHint="clean sneaker"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
