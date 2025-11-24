'use client';

import type { Company } from '@/services/company/types';
import { useEffect, useMemo, useState } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { getCompanyImages, listCompanies } from '@/services/company/companyService';
import { normalizeImageUrl } from '@/utils/Helpers';
import ParkingLotCard from './ParkingLotCard';

type ParkingLotListProps = {
  onCompanyClick?: (companyId: string) => void;
  fetchFn?: (params: { skip: number; limit: number }) => Promise<Company[]>;
  emptyMessage?: string;
};

type CompanyImageMap = Record<string, string | null>;

export default function ParkingLotList({
  onCompanyClick,
  fetchFn,
  emptyMessage,
}: ParkingLotListProps) {
  const [imageMap, setImageMap] = useState<CompanyImageMap>({});

  const fetchFunction = fetchFn || (({ skip, limit }) => listCompanies({ skip, limit }));

  const {
    items: companies,
    loading,
    error,
    hasMore,
    sentinelRef,
  } = useInfiniteScroll<Company>(fetchFunction, 10);

  const companyIds = useMemo(() => companies.map(c => c.id).join(','), [companies]);

  useEffect(() => {
    const fetchImages = async () => {
      const companiesToFetch = companies.filter(company => !imageMap[company.id]);

      if (companiesToFetch.length === 0) {
        return;
      }

      const imagePromises = companiesToFetch.map(async (company) => {
        try {
          const images = await getCompanyImages(company.id);
          const primaryImage = images.find(img => img.is_primary);
          const rawImageUrl = primaryImage?.url || images[0]?.url || null;
          return {
            companyId: company.id,
            imageUrl: normalizeImageUrl(rawImageUrl),
          };
        } catch {
          return {
            companyId: company.id,
            imageUrl: null,
          };
        }
      });

      const results = await Promise.all(imagePromises);
      setImageMap((prevMap) => {
        const newImageMap: CompanyImageMap = { ...prevMap };
        results.forEach(({ companyId, imageUrl }) => {
          newImageMap[companyId] = imageUrl;
        });
        return newImageMap;
      });
    };

    if (companies.length > 0 && !loading) {
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyIds, loading]);

  const handleCompanyClick = (companyId: string) => {
    onCompanyClick?.(companyId);
  };

  if (loading && companies.length === 0) {
    return (
      <div className="w-full py-8" role="status" aria-label="Carregando estacionamentos">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <span className="sr-only">Carregando estacionamentos...</span>
        </div>
      </div>
    );
  }

  if (error && companies.length === 0) {
    return (
      <div className="w-full py-8" role="alert">
        <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-6 text-center">
          <p className="text-destructive-foreground font-medium">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Tente recarregar a página ou verifique sua conexão.
          </p>
        </div>
      </div>
    );
  }

  if (companies.length === 0 && !loading) {
    const defaultMessage
      = 'Oops! Não encontramos estacionamentos disponíveis no momento.';
    const defaultSubMessage = 'Tente novamente mais tarde.';

    return (
      <div className="w-full py-8" role="status">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">
            {emptyMessage || defaultMessage}
          </p>
          {!emptyMessage && (
            <p className="text-sm text-muted-foreground">{defaultSubMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
        role="list"
        aria-label="Lista de estacionamentos disponíveis"
      >
        {companies.map(company => (
          <div key={company.id} role="listitem">
            <ParkingLotCard
              company={company}
              imageUrl={imageMap[company.id] || null}
              onClick={handleCompanyClick}
            />
          </div>
        ))}
      </div>

      {loading && companies.length > 0 && (
        <div
          className="w-full py-6 flex justify-center"
          role="status"
          aria-label="Carregando mais estacionamentos"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="sr-only">Carregando mais estacionamentos...</span>
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />}
    </div>
  );
}
