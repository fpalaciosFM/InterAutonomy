"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

type SlideDirection = 'next' | 'prev';

type SlideTransition = {
  from: number;
  to: number;
  dir: SlideDirection;
  phase: 'start' | 'animate';
};

export default function GalleryLightbox({
  images,
  title,
  sectionTitle,
}: {
  images: string[];
  title: string;
  sectionTitle: string;
}) {
  const urls = useMemo(() => images.filter(Boolean), [images]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [slide, setSlide] = useState<SlideTransition | null>(null);
  const slideRef = useRef<SlideTransition | null>(null);

  const isOpen = openIndex !== null;

  const close = useCallback(() => {
    setSlide(null);
    setOpenIndex(null);
  }, []);

  const finishSlide = useCallback((toIndex: number) => {
    setOpenIndex(toIndex);
    setSlide(null);
  }, []);

  const goTo = useCallback((idx: number, dir?: SlideDirection) => {
    if (urls.length === 0) return;

    if (openIndex === null) {
      setOpenIndex(idx);
      return;
    }

    if (slideRef.current) return;
    if (idx === openIndex) return;

    const resolvedDir: SlideDirection =
      dir ?? (idx > openIndex ? 'next' : 'prev');

    setSlide({ from: openIndex, to: idx, dir: resolvedDir, phase: 'start' });
  }, [openIndex, urls.length]);

  const prev = useCallback(() => {
    if (openIndex === null) return;
    if (slideRef.current) return;
    goTo((openIndex - 1 + urls.length) % urls.length, 'prev');
  }, [goTo, openIndex, urls.length]);

  const next = useCallback(() => {
    if (openIndex === null) return;
    if (slideRef.current) return;
    goTo((openIndex + 1) % urls.length, 'next');
  }, [goTo, openIndex, urls.length]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close, prev, next]);

  useEffect(() => {
    slideRef.current = slide;
  }, [slide]);

  useEffect(() => {
    if (!slide || slide.phase !== 'start') return;
    // Wait until after paint so the initial transform (start position) is committed,
    // otherwise browsers may skip the transition (especially for the 'prev' direction).
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => {
        setSlide((current) =>
          current && current.phase === 'start' ? { ...current, phase: 'animate' } : current
        );
      });
      return () => cancelAnimationFrame(id2);
    });
    return () => cancelAnimationFrame(id1);
  }, [slide]);

  useEffect(() => {
    if (!slide || slide.phase !== 'animate') return;
    const id = window.setTimeout(() => {
      finishSlide(slide.to);
    }, 400);
    return () => window.clearTimeout(id);
  }, [finishSlide, slide]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (urls.length === 0) return null;

  const baseIndex = slide ? slide.from : openIndex;
  const baseUrl = baseIndex !== null ? urls[baseIndex] : '';
  const incomingUrl = slide ? urls[slide.to] : '';
  const displayIndex = slide ? slide.to : openIndex;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <header className="mb-5">
        <h2 className="text-2xl font-bold">{sectionTitle}</h2>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {urls.map((url, idx) => (
          <button
            key={`${url}:${idx}`}
            type="button"
            onClick={() => goTo(idx)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Open image ${idx + 1}`}
          >
            <Image
              src={url}
              alt={`${title} gallery ${idx + 1}`}
              fill
              className="object-cover transition-opacity duration-200 group-hover:opacity-80"
              unoptimized={true}
            />
          </button>
        ))}
      </div>

      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-[90]">
              <div className="absolute inset-0 bg-black/80" onClick={close} aria-hidden="true" />

              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-5xl">
                  <div className="flex items-center justify-between gap-3 mb-3 text-white">
                    <div className="text-sm opacity-90">
                      {displayIndex !== null ? displayIndex + 1 : 0} / {urls.length}
                    </div>
                    <button
                      type="button"
                      onClick={close}
                      className="rounded-full w-10 h-10 inline-flex items-center justify-center text-lg font-semibold bg-white/10 hover:bg-white/20 border border-white/20"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden bg-black">
                    <div className="relative w-full aspect-video sm:aspect-[16/9]">
                      {slide && baseUrl && incomingUrl ? (
                        <div
                          className={`absolute inset-0 flex w-[200%] will-change-transform ${
                            slide.phase === 'start'
                              ? 'transition-none'
                              : 'transition-transform duration-300 ease-in-out'
                          } ${
                            slide.phase === 'animate'
                              ? slide.dir === 'next'
                                ? '-translate-x-1/2'
                                : 'translate-x-0'
                              : slide.dir === 'next'
                                ? 'translate-x-0'
                                : '-translate-x-1/2'
                          }`}
                          onTransitionEnd={(e) => {
                            if (e.target !== e.currentTarget) return;
                            if (!slide || slide.phase !== 'animate') return;
                            finishSlide(slide.to);
                          }}
                        >
                          <div className="relative w-1/2 h-full flex-none">
                            <Image
                              src={slide.dir === 'next' ? baseUrl : incomingUrl}
                              alt={`${title} gallery image`}
                              fill
                              className="object-contain"
                              unoptimized={true}
                            />
                          </div>
                          <div className="relative w-1/2 h-full flex-none">
                            <Image
                              src={slide.dir === 'next' ? incomingUrl : baseUrl}
                              alt={`${title} gallery image`}
                              fill
                              className="object-contain"
                              unoptimized={true}
                            />
                          </div>
                        </div>
                      ) : baseUrl ? (
                        <div className="absolute inset-0">
                          <Image
                            src={baseUrl}
                            alt={`${title} gallery image`}
                            fill
                            className="object-contain"
                            unoptimized={true}
                          />
                        </div>
                      ) : null}
                    </div>

                    {urls.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            prev();
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full w-11 h-11 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                          aria-label="Previous image"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            next();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full w-11 h-11 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                          aria-label="Next image"
                        >
                          ›
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
