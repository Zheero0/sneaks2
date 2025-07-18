
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, PartyPopper, Sparkles, Truck } from "lucide-react";
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Package,
    title: "Book & Collect",
    description:
      "Schedule your collection online. We'll pick up your sneakers at your convenience.",
    time: "We Come to You",
    color: "from-primary to-accent",
    step: "1",
  },
  {
    icon: Sparkles,
    title: "Clean & Restore",
    description:
      "Meticulous cleaning using premium products and specialized techniques in our state-of-the-art facility.",
    time: "Luxury Treatment",
    color: "from-primary to-accent",
    step: "2",
  },
  {
    icon: Truck,
    title: "Deliver Fresh",
    description:
      "Your sneakers are returned in luxury packaging, looking brand new and protected for the future.",
    time: "Handled with Care",
    color: "from-primary to-accent",
    step: "3",
  },
  {
    icon: PartyPopper,
    title: "Enjoy New Life",
    description:
      "Wear your revitalized sneakers with confidence — it's like having a brand new pair.",
    time: "Step Into Freshness",
    color: "from-primary to-accent",
    step: "4",
  },
];


export function Process() {
  return (
    <section id="process" className="py-32 px-4 relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -left-32 top-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20"></div>
      </div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20">
          {/* <div className="inline-flex items-center space-x-2  backdrop-blur-sm rounded-full px-6 py-3 border border-border mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Our Process</span>
          </div> */}
          <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-6 tracking-tight">
            <span className="text-foreground">Precision Cleaning,</span>
            <br />
            <span className="gradient-text"> Luxury Finish</span>
          </h2>
      
         <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
         Experience high-end sneaker results in just 4 effortless phases
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {steps.map((step, index) => (
               <motion.div
                key={index}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="group h-full"
              >
                <Card className="bg-card/80 backdrop-blur-sm h-full relative overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>

                  <CardContent className="p-8 relative z-10">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors group-hover:scale-110 group-hover:-rotate-6">
                          <step.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider">
                           Phase {step.step}
                          </div>
                          <div className="text-sm text-primary font-semibold">
                            {step.title}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold font-headline text-foreground mb-3 group-hover:text-primary transition-colors">
                          {step.time}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
