'use client';

import type { CompanyImage } from '@/services/company/types';
import useEmblaCarousel from 'embla-carousel-react';
import { Building2 } from 'lucide-react';
import { startTransition, useCallback, useEffect, useState } from 'react';
import { normalizeImageUrl } from '@/utils/Helpers';

type ImageCarouselProps = {
  images: CompanyImage[];
  companyName: string;
  onImageClick?: (image: CompanyImage) => void;
};

export default function ImageCarousel({
  images,
  companyName,
  onImageClick,
}: ImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(() => new Set());

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) {
      return -1;
    }
    if (!a.is_primary && b.is_primary) {
      return 1;
    }
    return 0;
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: sortedImages.length > 1,
      align: 'start',
      dragFree: false,
    },
    [],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    startTransition(() => {
      onSelect();
    });
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
      }
    },
    [emblaApi],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!emblaApi || isLightboxOpen) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emblaApi, scrollPrev, scrollNext, isLightboxOpen]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  const handleImageClick = (image: CompanyImage, index: number) => {
    if (onImageClick) {
      onImageClick(image);
    } else {
      openLightbox(index);
    }
  };

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft' && sortedImages.length > 1) {
        e.preventDefault();
        setLightboxIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight' && sortedImages.length > 1) {
        e.preventDefault();
        setLightboxIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, sortedImages.length]);

  const handleImageError = (imageId: string) => {
    setImageErrors((prev) => new Set(prev).add(imageId));
  };

  if (sortedImages.length === 0) {
    return (
      <div
        className="relative w-full h-64 sm:h-80 md:h-96 bg-muted rounded-3xl overflow-hidden flex flex-col items-center justify-center gap-4"
        role="region"
        aria-label={`Imagens do estacionamento ${companyName}`}
      >
        <Building2
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-muted-foreground/40"
          aria-hidden="true"
        />
        <p className="text-muted-foreground text-sm sm:text-base">
          Nenhuma imagem disponível
        </p>
      </div>
    );
  }

  const canScrollPrev = emblaApi?.canScrollPrev() ?? false;
  const canScrollNext = emblaApi?.canScrollNext() ?? false;
  const hasMultipleImages = sortedImages.length > 1;

  return (
    <>
      <div
        className="relative w-full bg-card rounded-3xl shadow-xl overflow-hidden"
        role="region"
        aria-label={`Carrossel de imagens do estacionamento ${companyName}`}
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {sortedImages.map((image, index) => (
              <div
                key={image.id}
                className="flex-[0_0_100%] min-w-0 relative"
                style={{ aspectRatio: '16/9' }}
              >
                <div className="relative w-full h-full bg-muted">
                  {imageErrors.has(image.id) ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Building2
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-muted-foreground/40"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Ícone de estacionamento</span>
                    </div>
                  ) : (
                    <img
                      src={normalizeImageUrl(image.url) || ''}
                      alt={`Imagem ${index + 1} do estacionamento ${companyName}`}
                      className="w-full h-full object-cover cursor-pointer"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      onClick={() => handleImageClick(image, index)}
                      onError={() => handleImageError(image.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleImageClick(image, index);
                        }
                      }}
                      tabIndex={0}
                      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                      role="button"
                      aria-label={`Ver imagem ${index + 1} em tamanho maior`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/80 hover:bg-background shadow-lg flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                !canScrollPrev ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
              }`}
              aria-label="Imagem anterior"
              aria-disabled={!canScrollPrev}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/80 hover:bg-background shadow-lg flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                !canScrollNext ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
              }`}
              aria-label="Próxima imagem"
              aria-disabled={!canScrollNext}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {hasMultipleImages && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2"
            role="tablist"
            aria-label="Indicadores de posição do carrossel"
          >
            {sortedImages.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                  index === selectedIndex
                    ? 'bg-primary w-6 sm:w-8'
                    : 'bg-background/60 hover:bg-background/80'
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
                aria-selected={index === selectedIndex}
                role="tab"
              />
            ))}
          </div>
        )}

        {hasMultipleImages && (
          <div
            className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-background/80 text-sm font-medium text-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {selectedIndex + 1} /{sortedImages.length}
          </div>
        )}
      </div>

      {isLightboxOpen && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <div
          className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Visualização ampliada da imagem ${lightboxIndex + 1} de ${sortedImages.length}`}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/80 hover:bg-background shadow-lg flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            aria-label="Fechar visualização ampliada"
          >
            <svg
              className="w-6 h-6 text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {sortedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev === 0 ? sortedImages.length - 1 : prev - 1,
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background/80 hover:bg-background shadow-lg flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                aria-label="Imagem anterior"
              >
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev === sortedImages.length - 1 ? 0 : prev + 1,
                  );
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background/80 hover:bg-background shadow-lg flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                aria-label="Próxima imagem"
              >
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                closeLightbox();
              }
            }}
            tabIndex={-1}
          >
            {sortedImages[lightboxIndex] &&
              (imageErrors.has(sortedImages[lightboxIndex].id) ? (
                <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                  <Building2
                    className="w-32 h-32 sm:w-40 sm:h-40 text-muted-foreground/40"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Ícone de estacionamento</span>
                </div>
              ) : (
                <img
                  src={normalizeImageUrl(sortedImages[lightboxIndex].url) || ''}
                  alt={`Imagem ${lightboxIndex + 1} ampliada do estacionamento ${companyName}`}
                  className="max-w-full max-h-[90vh] object-contain"
                  loading="lazy"
                  onError={() => handleImageError(sortedImages[lightboxIndex]!.id)}
                />
              ))}
          </div>

          {sortedImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-background/80 text-sm font-medium text-foreground">
              {lightboxIndex + 1} /{sortedImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
