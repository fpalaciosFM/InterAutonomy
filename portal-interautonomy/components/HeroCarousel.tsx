"use client";
import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: 'https://interautonomy.org/wp-content/uploads/2022/12/44.-Sungai-Utik-Case-Photo-scaled.jpg',
    text: (
      <h1 className="text-xl md:text-2xl lg:text-3xl font-black leading-tight md:leading-[1.05] tracking-tight text-white drop-shadow-xl p-2 md:p-4 mb-4">
        Self-Sustainability Strategies<br />
        for Development Initiatives
      </h1>
    ),
    align: 'left',
  },
  {
    image: 'https://interautonomy.org/wp-content/uploads/2022/12/30-scaled.jpg',
    text: (
      <div className="text-right p-2 md:p-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-black leading-tight md:leading-[1.05] tracking-tight text-white drop-shadow-xl mb-3 md:mb-4">
          Are you working to address issues<br />
          of poverty, health, environment, education...?
        </h1>
        <h2 className="text-base md:text-lg lg:text-xl font-bold text-white drop-shadow-xl mb-2">
          These strategies can help make your project more self-sustainable!
        </h2>
      </div>
    ),
    align: 'right',
  },
  {
    image: 'https://interautonomy.org/wp-content/uploads/2022/12/43.-Aldeas-Campesinas-Case-Photo-scaled.jpg',
    text: (
      <h1 className="text-xl md:text-2xl lg:text-3xl font-black leading-tight md:leading-[1.05] tracking-tight text-white drop-shadow-xl p-2 md:p-4 mb-4">
        Strengthen your own initiative<br />
        by learning from the experience<br />
        of projects worldwide!
      </h1>
    ),
    align: 'left',
  },
];

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

  return (
    <section className="relative min-h-[60vh] w-full max-w-7xl mx-auto flex items-stretch pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={slides[current].image}
          alt="Hero background"
          fill
          className="object-cover w-full h-full object-center"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
      </div>

      {/* Slide Content */}
      <div className={`container mx-auto sm:px-6 lg:px-8 relative z-20 flex flex-1 flex-col justify-center ${slides[current].align === 'right' ? 'items-end' : 'items-start'}`}>
        <div className="max-w-3xl p-4 md:p-8 mx-4 md:mx-8">
          {slides[current].text}
          <button className="mt-4 md:mt-6 group flex items-center gap-3 bg-white/90 text-black px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all">
            Explore Strategies
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-30"
        onClick={prev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-30"
        onClick={next}
        aria-label="Next slide"
      >
        <ChevronRight className="w-7 h-7" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full ${i === current ? 'bg-white' : 'bg-white/50'} border border-white`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
