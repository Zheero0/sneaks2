"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, ArrowRight } from "lucide-react"

const feedImages = [
    { src: "https://placehold.co/400x400.png", alt: "Cleaned white sneakers", hint: "white sneaker" },
    { src: "https://placehold.co/400x400.png", alt: "Restored colorful running shoes", hint: "colorful shoes" },
    { src: "https://placehold.co/400x400.png", alt: "Sneaker soles after deep clean", hint: "sneaker sole" },
]

export function InstagramFeed() {
    return (
        <section id="instagram" className="py-32 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center space-x-2 bg-secondary/50 backdrop-blur-sm rounded-full px-6 py-3 border border-border mb-6">
                        <Instagram className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Follow Our Journey</span>
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-4 tracking-tighter">
                        <span className="text-white">Fresh From The Gram</span>
                    </h2>
                     <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        See our latest restorations and happy customers.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto">
                    {feedImages.map((image, index) => (
                        <Link key={index} href="https://www.instagram.com/sneakswash/" target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-lg aspect-square">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                width={400}
                                height={400}
                                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                data-ai-hint={image.hint}
                            />
                        </Link>
                    ))}
                </div>

                <div className="text-center">
                    <Button asChild size="lg" className="font-semibold hover-lift glow-effect group">
                        <Link href="https://www.instagram.com/sneakswash/" target="_blank" rel="noopener noreferrer">
                            Follow @sneakswash
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
