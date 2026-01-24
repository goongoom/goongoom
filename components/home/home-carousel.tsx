'use client'

import Autoplay from 'embla-carousel-autoplay'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

interface HomeCarouselProps {
  children: React.ReactNode
}

export function HomeCarousel({ children }: HomeCarouselProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent md:w-24" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent md:w-24" />

      <Carousel
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 3000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent className="-ml-4 py-4">{children}</CarouselContent>
      </Carousel>
    </div>
  )
}
