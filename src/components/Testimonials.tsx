"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import Image from "next/image";
import { siteStats } from "@/lib/siteData";

const testimonials = [
  {
    name: "Rico Lewis",
    location: "Mayfair, London",
    role: "Footballer",
    rating: 5,
    text: "Absolutely incredible service! My vintage Jordan 1s looked completely ruined, but SneaksWash brought them back to museum quality. The attention to detail is unmatched.",
    image: "/img2.webp",
    verified: true,
  },
  {
    name: "Nemzzz",
    location: "City Centre, Manchester",
    role: "Recording Artist",
    rating: 5,
    text: "The collection service is incredibly convenient and professional. My entire sneaker collection gets the VIP treatment. The protection coating is revolutionary.",
    image: "/img1.webp",
    verified: true,
  },
  {
    name: "Zidane Iqbal",
    location: "Old Trafford, Manchester",
    role: "Footballer",
    rating: 5,
    text: "Best luxury sneaker service in the UK! The white-glove treatment and premium packaging made me feel like royalty. My Louboutin sneakers have never looked better.",
    image: "/zidane.webp",
    verified: true,
  },
];

export function Testimonials() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -right-32 bottom-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-30"></div>
      </div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20">
          {/* <div className="inline-flex items-center space-x-2  backdrop-blur-sm rounded-full px-6 py-3 border border-border mb-6">
            <Star className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Client Stories</span>
          </div> */}
          <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-6 tracking-tighter">
            <span className="gradient-text">Trusted by</span>
            <br />
            <span className="text-white">Connoisseurs</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join thousands of discerning clients who trust us with their most
            precious footwear
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group gradient-border-bg hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10"></div>
              <CardContent className="p-8 relative z-10">
                <div className="mb-6">
                  <Quote className="h-8 w-8 text-primary/50 group-hover:text-primary transition-colors" />
                </div>

                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-primary fill-current"
                    />
                  ))}
                  {testimonial.verified && (
                    <div className="ml-3 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      Verified
                    </div>
                  )}
                </div>

                <blockquote className="text-muted-foreground mb-8 italic text-lg leading-relaxed group-hover:text-white transition-colors">
                  "{testimonial.text}"
                </blockquote>

                <div className="flex items-center space-x-4">
<div className="relative w-[60px] h-[60px]">
  {/* Glowing background effect */}
  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />

  {/* Avatar image */}
  <Image
    src={testimonial.image}
    alt={testimonial.name}
    width={60}
    height={60}
    className="relative w-full h-full rounded-full border-2 border-border group-hover:border-primary/50 transition-colors object-cover"
    data-ai-hint="person avatar"
  />
</div>

                  <div className="flex-1">
                    <div className="font-bold text-white text-lg group-hover:text-primary transition-colors">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-muted-foreground/80">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {siteStats.premiumRestorations}
              </div>
              <div className="text-sm text-muted-foreground">
                Premium Restorations
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {siteStats.clientSatisfaction}
              </div>
              <div className="text-sm text-muted-foreground">
                Client Satisfaction
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {siteStats.insuredService}
              </div>
              <div className="text-sm text-muted-foreground">
                Insured Service
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {siteStats.conciergeSupport}
              </div>
              <div className="text-sm text-muted-foreground">
                Concierge Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
