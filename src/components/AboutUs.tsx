
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, Award, Users, Crown, CalendarPlus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const celebrities = [
  {
    name: "Rico Lewis",
    location: "Mayfair, London",
    role: "Footballer",

    image: "/img2.webp",
    rating: 5,
    verified: true,
    specialty: "Football Boots & Lifestyle",
    gradient: "from-primary to-accent",
  },
  {
    name: "Nemzzz",
    location: "City Centre, Manchester",
    role: "Recording Artist",

    image: "/img1.webp",

    rating: 5,
    verified: true,
    specialty: "Designer Sneakers",
    gradient: "from-primary/80 to-accent/80",
  },
  {
    id: 3,
    name: "Zidane Iqbal",
    location: "Old Trafford, Manchester",
    role: "Footballer",
    image: "/Zidane.webp",

    rating: 5,
    verified: true,
    specialty: "Limited Editions",
    gradient: "from-primary/90 to-accent/90",
  },
]

const stats = [
  { icon: Crown, label: "VIP Clients", value: "50+", color: "text-primary/90" },
  { icon: Award, label: "Years Experience", value: "3+", color: "text-accent" },
  { icon: Star, label: "5-Star Rating", value: "4.9", color: "text-primary" },
]

export function AboutUs() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % celebrities.length)
    }, 5000) // Increased interval

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % celebrities.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + celebrities.length) % celebrities.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  return (
    <section id="about" className="py-32 px-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -left-40 top-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -right-40 bottom-1/4 w-[500px] h-[500px] bg-accent/30 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">

          <h2 className="text-4xl lg:text-5xl font-bold font-headline mb-6 tracking-tighter">
            <span className="text-foreground">Where</span>
            <br />
            <span className="gradient-text">Legends Trust</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From Premier League pitches to Record Selling Artists, the UK's most influential figures trust us with their most
            precious footwear
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto">
          {/* Stats Section */}
          {/* <div className="mb-12 max-w-md mx-auto md:max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card
                      className="group relative overflow-hidden cursor-pointer h-full border border-border hover:border-primary/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                       <CardContent className="p-6 text-center relative z-10">
                          <div className="inline-flex p-4 rounded-2xl mb-4 bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12">
                            <stat.icon className="h-8 w-8 text-primary" />
                          </div>
                          <div className="text-3xl font-bold font-headline mb-2 text-foreground transition-colors duration-300 group-hover:text-primary">
                            {stat.value}
                          </div>
                          <div className="text-muted-foreground font-medium">{stat.label}</div>
                        </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div> */}

          {/* Celebrity Carousel */}
          <div className="relative">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="h-full"
            >
              <Card className="relative overflow-hidden border border-border group bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

                <CardContent className="p-0 relative z-10">
                  <div className="grid lg:grid-cols-12">
                    {/* Image Section */}
                    <div className="lg:col-span-5 relative">
                      <div className="relative aspect-[4/5] w-full h-full group">
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent z-10"></div>
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${celebrities[currentSlide].gradient} opacity-30 group-hover:opacity-40 transition-opacity duration-700`}
                        ></div>
                        <Image
                          src={celebrities[currentSlide].image || "https://placehold.co/500x600.png"}
                          alt={celebrities[currentSlide].name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          data-ai-hint="person portrait"
                        />

                        {/* Floating Elements */}
                        <div className="absolute top-6 left-6 z-20">
                          <Badge className="bg-black/80 text-white border-primary/50 backdrop-blur-sm">
                            <Crown className="h-3 w-3 mr-1 text-primary" />
                            VIP Client
                          </Badge>
                        </div>

                        <div className="absolute bottom-6 left-6 z-20">
                          <div className="flex items-center space-x-2">
                            {[...Array(celebrities[currentSlide].rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-5 w-5 text-primary fill-primary animate-pulse"
                                style={{ animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold font-headline text-foreground">
                          {celebrities[currentSlide].name}
                        </h3>

                        <div className="space-y-1">
                          <p className="text-primary font-semibold">{celebrities[currentSlide].role}</p>
                          <p className="text-muted-foreground">{celebrities[currentSlide].location}</p>
                        </div>
                      </div>

 
                    </div>
                  </div>
                </CardContent>
                 {/* Navigation Arrows */}
                  <Button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/80 hover:bg-black/90 text-white border-primary/50 backdrop-blur-sm w-12 h-12 rounded-full p-0 transition-all duration-300 hover:scale-110"
                  >
                      <ChevronLeft className="h-6 w-6" />
                  </Button>

                  <Button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/80 hover:bg-black/90 text-white border-primary/50 backdrop-blur-sm w-12 h-12 rounded-full p-0 transition-all duration-300 hover:scale-110"
                  >
                      <ChevronRight className="h-6 w-6" />
                  </Button>
              </Card>
            </motion.div>


            {/* Carousel Indicators */}
            <div className="flex justify-center space-x-3 mt-8">
              {celebrities.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-primary scale-125 shadow-lg shadow-primary/50"
                      : "bg-muted-foreground/30 hover:bg-primary/30"
                  }`}
                />
              ))}
            </div>

            {/* Thumbnail Preview */}
            <div className="flex justify-center space-x-4 mt-12">
              {celebrities.map((celebrity, index) => (
                <button
                  key={celebrity.name}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 relative w-20 h-24 rounded-xl overflow-hidden transition-all duration-300 aspect-[4/5] ${
                    index === currentSlide
                      ? "ring-4 ring-primary scale-110 shadow-xl"
                      : "opacity-60 hover:opacity-100 hover:scale-105 border border-transparent"
                  }`}
                >
                  <Image src={celebrity.image || "https://placehold.co/500x600.png"} alt={celebrity.name} fill className="object-cover" data-ai-hint="person portrait" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${celebrity.gradient} opacity-30`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-20">
            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="group relative overflow-hidden max-w-2xl mx-auto bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <CardContent className="p-12 relative z-10">
                <div className="space-y-6">
                  <div className="inline-flex p-4 bg-primary/10 rounded-2xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                    <Crown className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold font-headline text-foreground group-hover:text-primary transition-colors">
                    Join the Elite
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    Experience the same luxury service trusted by celebrities, athletes, and influencers across the UK
                  </p>
                  <div className="mt-8">
                    <Link href="/book" className="inline-block">
                      <Button size="lg" className="font-semibold text-lg hover-lift glow-effect group">
                          Book Now
                          <CalendarPlus className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
