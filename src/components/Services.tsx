
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Shield, Truck, Clock } from "lucide-react"

const services = [
  {
    icon: Sparkles,
    title: "Deep Clean & Restore",
    description: "Complete cleaning and restoration using premium products and techniques.",
    features: ["Stain removal", "Colour restoration", "Material protection", "Odour elimination"],
  },
  {
    icon: Shield,
    title: "Protection Treatment",
    description: "Advanced protection coating to keep your sneakers looking fresh longer.",
    features: ["Water repellent", "Stain resistance", "UV protection", "Extended lifespan"],
  },
  {
    icon: Truck,
    title: "Collection & Delivery",
    description: "Convenient pickup and delivery service across the UK.",
    features: ["Free collection", "Insured transport", "Real-time tracking", "Flexible scheduling"],
  },
  {
    icon: Clock,
    title: "Express Service",
    description: "Need them back quickly? Our same day service delivers within 24 hours.",
    features: ["24-hour turnaround", "Priority handling", "Same-day collection", "Rush delivery"],
  },
]

export function Services() {
  return (
    <section id="services" className="py-32 px-4 overflow-hidden relative">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-3/4 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-20"></div>
        </div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20">
          {/* <div className="inline-flex items-center space-x-2  backdrop-blur-sm rounded-full px-6 py-3 border border-border mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Premium Services</span>
          </div> */}
          <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-6 tracking-tighter">
            <span className="gradient-text">Luxury Care</span>
            <br />
            <span className="text-white">For Your Sneakers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Professional sneaker care services designed to restore and protect your most valuable footwear with
            uncompromising attention to detail
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group bg-card/80 backdrop-blur-sm relative overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10 hover-lift glow-effect"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <div className="p-8 relative z-10">
                <CardHeader className="p-0 pb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-4 bg-primary/10 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      <service.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-white font-headline group-hover:text-primary transition-colors duration-300 mb-3">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-lg leading-relaxed text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {service.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center text-sm text-gray-300 group-hover:text-white transition-colors"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
