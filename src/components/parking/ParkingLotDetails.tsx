'use client';

import type {
  BaseParkingPriceSchema,
  Company,
  CompanyImage,
  PriceReference,
} from '@/services/company/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heading } from '@/components/ui/heading';
import { getCurrentUser } from '@/services/auth/authService';
import {
  canManageCompany,
  getCompanyById,
  getCompanyImages,
  getCompanyPriceReference,
} from '@/services/company/companyService';
import { listParkingPrices } from '@/services/company/priceService';
import { cn } from '@/utils/cn';
import { textVariants } from '@/utils/textVariants';
import { toastError } from '@/utils/toast';
import { getProfileType } from '@/utils/tokenStorage';
import Breadcrumb from './Breadcrumb';
import ImageCarousel from './ImageCarousel';
import ImageManager from './ImageManager';
import PriceExceptionForm from './PriceExceptionForm';
import PriceForm from './PriceForm';
import PriceTable from './PriceTable';
import VehicleManagementSection from './VehicleManagementSection';

type ParkingLotDetailsProps = {
  companyId: string;
};

type LoadingState = {
  company: boolean;
  images: boolean;
  prices: boolean;
};

type ErrorState = {
  company: string | null;
  images: string | null;
  prices: string | null;
};

export default function ParkingLotDetails({ companyId }: ParkingLotDetailsProps) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [images, setImages] = useState<CompanyImage[]>([]);
  const [priceReference, setPriceReference] = useState<PriceReference | null>(null);
  const [allPrices, setAllPrices] = useState<BaseParkingPriceSchema[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    company: true,
    images: true,
    prices: true,
  });
  const [error, setError] = useState<ErrorState>({
    company: null,
    images: null,
    prices: null,
  });

  const [_isOrganization, setIsOrganization] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [_checkingPermission, setCheckingPermission] = useState(false);

  const fetchData = useCallback(async () => {
    if (!companyId) {
      return;
    }

    setLoading({ company: true, images: true, prices: true });
    setError({ company: null, images: null, prices: null });

    try {
      const [companyData, imagesData, pricesData, allPricesData]
        = await Promise.allSettled([
          getCompanyById(companyId),
          getCompanyImages(companyId),
          getCompanyPriceReference(companyId),
          listParkingPrices(companyId),
        ]);

      if (companyData.status === 'fulfilled') {
        setCompany(companyData.value);
        setLoading(prev => ({ ...prev, company: false }));
      } else {
        const errorMessage
          = companyData.reason?.message || 'Erro ao buscar detalhes do estacionamento';
        setError(prev => ({ ...prev, company: errorMessage }));
        setLoading(prev => ({ ...prev, company: false }));
        toastError(errorMessage);
      }

      if (imagesData.status === 'fulfilled') {
        setImages(imagesData.value);
        setLoading(prev => ({ ...prev, images: false }));
      } else {
        const errorMessage = imagesData.reason?.message || 'Erro ao buscar imagens';
        setError(prev => ({ ...prev, images: errorMessage }));
        setLoading(prev => ({ ...prev, images: false }));
      }

      if (pricesData.status === 'fulfilled') {
        const priceRef = pricesData.value;
        if (
          !priceRef?.current_price_cents
          && companyData.status === 'fulfilled'
          && companyData.value?.today_parking_price
        ) {
          setPriceReference({
            ...priceRef,
            current_price_cents: companyData.value.today_parking_price.price_cents,
          });
        } else {
          setPriceReference(priceRef);
        }
        setLoading(prev => ({ ...prev, prices: false }));
      } else {
        const errorMessage = pricesData.reason?.message || 'Erro ao buscar preços';
        setError(prev => ({ ...prev, prices: errorMessage }));
        setLoading(prev => ({ ...prev, prices: false }));
        if (
          companyData.status === 'fulfilled'
          && companyData.value?.today_parking_price
        ) {
          setPriceReference({
            current_price_cents: companyData.value.today_parking_price.price_cents,
          });
        }
      }

      if (allPricesData.status === 'fulfilled') {
        const prices = allPricesData.value;
        setAllPrices(prices);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError({
        company: errorMessage,
        images: errorMessage,
        prices: errorMessage,
      });
      setLoading({ company: false, images: false, prices: false });
      toastError(errorMessage);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const checkUserAndPermission = async () => {
      try {
        const profileType = getProfileType();

        if (profileType === 'organization') {
          setIsOrganization(true);
          setCheckingPermission(true);

          try {
            const hasPermission = await canManageCompany(companyId);
            setCanManage(hasPermission);
          } catch (error) {
            setCanManage(false);
          } finally {
            setCheckingPermission(false);
          }
        } else if (profileType === 'driver') {
          setIsOrganization(false);
          setCanManage(false);
        } else {
          try {
            const userInfo = await getCurrentUser();
            if (userInfo.organization) {
              setIsOrganization(true);
              setCheckingPermission(true);

              try {
                const hasPermission = await canManageCompany(companyId);
                setCanManage(hasPermission);
              } catch {
                setCanManage(false);
              } finally {
                setCheckingPermission(false);
              }
            } else {
              setIsOrganization(false);
              setCanManage(false);
            }
          } catch (error) {
            setIsOrganization(false);
            setCanManage(false);
          }
        }
      } catch (error) {
        setIsOrganization(false);
        setCanManage(false);
      }
    };

    if (companyId) {
      checkUserAndPermission();
    }
  }, [companyId]);

  const handleRetry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  if (loading.company) {
    return (
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12"
        aria-label="Carregando detalhes do estacionamento"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"
              role="status"
              aria-label="Carregando"
            >
              <span className="sr-only">Carregando...</span>
            </div>
            <p className="text-muted-foreground">
              Carregando detalhes do estacionamento...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error.company && !company) {
    return (
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12"
        aria-label="Erro ao carregar detalhes"
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-destructive mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <Heading level="2-section" className="mb-2">
              Erro ao carregar estacionamento
            </Heading>
            <p className="text-muted-foreground mb-6">{error.company}</p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                aria-label="Tentar novamente"
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                aria-label="Voltar para página inicial"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!company) {
    return null;
  }

  const fullAddress = `${company.address}, ${company.city.name}, ${company.city.country === 'BR' ? 'Brasil' : company.city.country}`;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  const reloadPriceReference = async () => {
    try {
      const [updatedPriceRef, updatedAllPrices, updatedCompany]
        = await Promise.allSettled([
          getCompanyPriceReference(companyId),
          listParkingPrices(companyId),
          getCompanyById(companyId),
        ]);

      if (updatedPriceRef.status === 'fulfilled' && updatedPriceRef.value) {
        setPriceReference(updatedPriceRef.value);
      }

      if (updatedAllPrices.status === 'fulfilled') {
        setAllPrices(updatedAllPrices.value);
      }

      if (updatedCompany.status === 'fulfilled') {
        setCompany(updatedCompany.value);
      }
    } catch {}
  };

  const reloadAllData = async () => {
    try {
      const [updatedCompany, updatedPriceRef, updatedAllPrices]
        = await Promise.allSettled([
          getCompanyById(companyId),
          getCompanyPriceReference(companyId),
          listParkingPrices(companyId),
        ]);

      if (updatedCompany.status === 'fulfilled') {
        setCompany(updatedCompany.value);
      }

      if (updatedPriceRef.status === 'fulfilled' && updatedPriceRef.value) {
        setPriceReference(updatedPriceRef.value);
      }

      if (updatedAllPrices.status === 'fulfilled') {
        setAllPrices(updatedAllPrices.value);
      }
    } catch {}
  };

  const handlePriceCreated = () => {
    setShowPriceForm(false);
    reloadPriceReference();
  };

  const handleExceptionCreated = () => {
    setShowExceptionForm(false);
    reloadPriceReference();
  };

  return (
    <>
      <Breadcrumb companyName={company.name} />

      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12"
        aria-labelledby="parking-details-heading"
      >
        <div className="mb-6 sm:mb-8 space-y-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-lg px-2 py-1"
            aria-label="Voltar para página anterior"
          >
            <svg
              className="w-5 h-5"
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
            <span>Voltar</span>
          </button>

          <h1
            id="parking-details-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground"
          >
            {company.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {loading.images
              ? (
                  <div className="bg-card rounded-3xl shadow-xl overflow-hidden">
                    <div className="relative w-full h-64 sm:h-80 md:h-96 bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"
                          role="status"
                          aria-label="Carregando imagens"
                        >
                          <span className="sr-only">Carregando imagens...</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Carregando imagens...</p>
                      </div>
                    </div>
                  </div>
                )
              : (
                  <ImageCarousel images={images} companyName={company.name} />
                )}

            {!loading.images && (
              <ImageManager
                companyId={companyId}
                images={images}
                onImageAdded={async () => {
                  try {
                    const updatedImages = await getCompanyImages(companyId);
                    setImages(updatedImages);
                  } catch {}
                }}
                onImageRemoved={async () => {
                  try {
                    const updatedImages = await getCompanyImages(companyId);
                    setImages(updatedImages);
                  } catch {}
                }}
              />
            )}

            {company.description && (
              <div className="bg-card rounded-3xl shadow-xl p-6 sm:p-8">
                <Heading level="2-card" className="mb-4">
                  Descrição
                </Heading>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {company.description}
                </p>
              </div>
            )}

            <div className="bg-card rounded-3xl shadow-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <Heading level="2-card">Preços</Heading>

                {canManage && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setShowPriceForm(true)}
                      className="w-full sm:w-auto"
                      aria-label="Adicionar novo preço"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Adicionar Preço
                    </Button>
                    <Button
                      onClick={() => setShowExceptionForm(true)}
                      variant="outline"
                      className="w-full sm:w-auto"
                      aria-label="Adicionar nova exceção de preço"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Adicionar Exceção
                    </Button>
                  </div>
                )}
              </div>
              <PriceTable
                prices={
                  allPrices.length > 0 ? allPrices : priceReference?.weekly_prices || []
                }
                currentPrice={
                  company?.today_parking_price?.price_cents
                  ?? priceReference?.current_price_cents
                }
                currentPriceFormatted={priceReference?.current_price_formatted}
                exceptions={priceReference?.exceptions}
                isCurrentPriceFromException={
                  company?.today_parking_price?.exception_date !== null
                  && company?.today_parking_price?.exception_date !== undefined
                }
                exceptionDescription={company?.today_parking_price?.description || null}
                canManage={canManage}
              />
            </div>

            {canManage && company && (
              <VehicleManagementSection
                companyId={companyId}
                companyTotalSpots={company.total_spots}
                onVehicleChange={reloadAllData}
              />
            )}
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="bg-card rounded-3xl shadow-xl p-6 sm:p-8">
              <Heading level="2-card" className="mb-6">
                Informações
              </Heading>
              <dl className="space-y-4">
                <div>
                  <dt className={cn(textVariants({ variant: 'label-muted' }), 'mb-1')}>
                    Endereço
                  </dt>
                  <dd
                    className={cn(
                      textVariants({ variant: 'body' }),
                      'text-card-foreground',
                    )}
                  >
                    {fullAddress}
                  </dd>
                </div>

                <div>
                  <dt className={cn(textVariants({ variant: 'label-muted' }), 'mb-1')}>
                    CEP
                  </dt>
                  <dd
                    className={cn(
                      textVariants({ variant: 'body' }),
                      'text-card-foreground',
                    )}
                  >
                    {company.postal_code}
                  </dd>
                </div>

                <div>
                  <dt className={cn(textVariants({ variant: 'label-muted' }), 'mb-1')}>
                    Total de Vagas
                  </dt>
                  <dd
                    className={cn(
                      textVariants({ variant: 'body' }),
                      'text-card-foreground font-semibold',
                    )}
                  >
                    {company.total_spots}
                  </dd>
                </div>

                <div>
                  <dt className={cn(textVariants({ variant: 'label-muted' }), 'mb-2')}>
                    Características
                  </dt>
                  <dd>
                    <ul
                      className="space-y-2"
                      aria-label="Características do estacionamento"
                    >
                      {company.is_covered && (
                        <li className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-primary flex-shrink-0"
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
                          <span className="text-base text-card-foreground">Coberto</span>
                        </li>
                      )}
                      {company.has_camera && (
                        <li className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-primary flex-shrink-0"
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
                          <span className="text-base text-card-foreground">
                            Câmera de segurança
                          </span>
                        </li>
                      )}
                      {company.has_charging_station && (
                        <li className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-primary flex-shrink-0"
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
                          <span className="text-base text-card-foreground">
                            Estação de carregamento
                          </span>
                        </li>
                      )}
                      {!company.is_covered
                        && !company.has_camera
                        && !company.has_charging_station && (
                        <li className="text-base text-muted-foreground">
                          Nenhuma característica especial
                        </li>
                      )}
                    </ul>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">
                    Organização
                  </dt>
                  <dd className="text-base text-card-foreground">
                    {company.organization.name}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={showPriceForm} onOpenChange={setShowPriceForm}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Preço</DialogTitle>
          </DialogHeader>
          <PriceForm
            companyId={companyId}
            onSuccess={handlePriceCreated}
            onCancel={() => setShowPriceForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showExceptionForm} onOpenChange={setShowExceptionForm}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Exceção de Preço</DialogTitle>
          </DialogHeader>
          <PriceExceptionForm
            companyId={companyId}
            onSuccess={handleExceptionCreated}
            onCancel={() => setShowExceptionForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
