'use client';

import type { Company } from '@/services/company/types';
import { Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { normalizeImageUrl } from '@/utils/Helpers';

type ParkingLotCardProps = {
  company: Company;
  imageUrl: string | null;
  onClick: (companyId: string) => void;
};

export default function ParkingLotCard({
  company,
  imageUrl,
  onClick,
}: ParkingLotCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    onClick(company.id);
    router.push(`/parking/${company.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const fullAddress = `${company.address}, ${company.city.name}`;

  const normalizedImageUrl = normalizeImageUrl(imageUrl);

  return (
    <article
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyPress={handleKeyPress}
      className="bg-card rounded-3xl shadow-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      aria-label={`Estacionamento ${company.name}`}
    >
      <div className="relative w-full h-48 overflow-hidden bg-muted">
        {imageError || !imageUrl
          ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Building2
                  className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground/40"
                  aria-hidden="true"
                />
                <span className="sr-only">Ícone de estacionamento</span>
              </div>
            )
          : (
              <img
                src={normalizedImageUrl || ''}
                alt={`Imagem do estacionamento ${company.name}`}
                onError={handleImageError}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
      </div>

      <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-card-foreground line-clamp-2">
          {company.name}
        </h3>

        <p
          className="text-sm sm:text-base text-muted-foreground line-clamp-2"
          aria-label={`Endereço: ${fullAddress}`}
        >
          {fullAddress}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <span
              className="text-xs sm:text-sm text-muted-foreground"
              aria-label={`Total de vagas: ${company.total_spots}`}
            >
              <span className="font-semibold text-card-foreground">
                {company.total_spots}
              </span>
              {' '}
              vagas
            </span>
          </div>

          <div
            className="flex items-center gap-2 sm:gap-3"
            aria-label="Recursos do estacionamento"
          >
            {company.is_covered && (
              <div
                className="flex items-center gap-1"
                aria-label="Estacionamento coberto"
                title="Coberto"
              >
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="sr-only">Coberto</span>
              </div>
            )}

            {company.has_camera && (
              <div
                className="flex items-center gap-1"
                aria-label="Possui câmera de segurança"
                title="Câmera"
              >
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="sr-only">Câmera</span>
              </div>
            )}

            {company.has_charging_station && (
              <div
                className="flex items-center gap-1"
                aria-label="Possui estação de carregamento"
                title="Estação de carregamento"
              >
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="sr-only">Estação de carregamento</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
