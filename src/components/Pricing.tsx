import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { services } from "@/lib/services";
import { ArrowRight, Check, Star } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="py-32 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2  backdrop-blur-sm rounded-full px-6 py-3 border border-border mb-6">
            <span className="text-primary">£</span>
            <span className="text-sm text-muted-foreground">Transparent Pricing</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold font-headline mb-6 tracking-tighter">
            <span className="text-foreground">Choose Your</span>
            <br />
            <span className="gradient-text">Perfect Clean</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Simple, upfront pricing for every level of care. No hidden fees, just pristine sneakers.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((tier) => (
            <Card
              key={tier.name}
              className={`flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 ${tier.bestValue ? 'border-primary/50 shadow-lg shadow-primary/10' : ''}`}
            >
              {tier.bestValue && (
                  <div className="absolute -top-4 right-4 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 z-10">
                    <Star className="w-4 h-4" />
                    Best Value
                  </div>
              )}
              <CardHeader className="p-8">
                <CardTitle className="text-3xl font-headline text-white">
                  {tier.name}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground pt-2">
                  <span className="text-4xl font-bold text-white">£{tier.price}</span> / pair
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  size="lg"
                  className="w-full font-bold text-lg group"
                  variant={tier.buttonVariant}
                  asChild
                >
                  <Link href="/book">
                    Choose Wash
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
