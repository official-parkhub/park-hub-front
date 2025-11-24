'use client';

import type { ActiveVehicle } from '@/services/vehicle/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useVehiclePolling } from '@/hooks/useVehiclePolling';
import { formatDateTimeBrasilia } from '@/utils/dateTimeUtils';

function formatPrice(cents?: number): string {
  if (cents === undefined || cents === null) {
    return 'Preço não disponível';
  }

  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
}

export default function ActiveVehiclesSection() {
  const router = useRouter();
  const { activeVehicles, loading, error, refresh } = useVehiclePolling();

  const handleRefresh = async () => {
    await refresh();
  };

  const handleViewCompany = (companyId: string) => {
    router.push(`/parking/${companyId}`);
  };

  const safeActiveVehicles = (Array.isArray(activeVehicles) ? activeVehicles : []).filter(
    (activeVehicle: ActiveVehicle) =>
      activeVehicle
      && activeVehicle.vehicle
      && activeVehicle.vehicle.id
      && activeVehicle.vehicle.plate
      && activeVehicle.company
      && activeVehicle.company.id,
  );

  if (loading && safeActiveVehicles.length === 0) {
    return (
      <section className="w-full" aria-label="Veículos ativos" aria-live="polite">
        <div className="flex items-center justify-between mb-4">
          <Heading level="2-section">Veículos Ativos</Heading>
        </div>
        <div
          className="w-full py-8 flex justify-center items-center"
          role="status"
          aria-label="Carregando veículos ativos"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="sr-only">Carregando veículos ativos...</span>
        </div>
      </section>
    );
  }

  if (error && safeActiveVehicles.length === 0) {
    return (
      <section className="w-full" aria-label="Veículos ativos" aria-live="assertive">
        <div className="flex items-center justify-between mb-4">
          <Heading level="2-section">Veículos Ativos</Heading>
        </div>
        <div
          className="bg-destructive/10 border border-destructive/20 rounded-3xl p-6 text-center"
          role="alert"
        >
          <Text variant="error" className="mb-4">
            {error}
          </Text>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Tentar Novamente
          </Button>
        </div>
      </section>
    );
  }

  if (safeActiveVehicles.length === 0 && !loading) {
    return (
      <section className="w-full" aria-label="Veículos ativos" aria-live="polite">
        <div className="flex items-center justify-between mb-4">
          <Heading level="2-section">Veículos Ativos</Heading>
        </div>
        <div className="bg-card rounded-3xl border border-border p-6 text-center">
          <Text variant="body-medium" className="mb-2">
            Nenhum veículo estacionado no momento
          </Text>
          <Text variant="body-muted">
            Quando você estacionar um veículo, ele aparecerá aqui.
          </Text>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full" aria-label="Veículos ativos" aria-live="polite">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Veículos Ativos</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={loading}
          aria-label="Atualizar lista de veículos ativos"
        >
          <svg
            className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Atualizar
        </Button>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
        role="list"
        aria-label="Lista de veículos ativos"
      >
        {safeActiveVehicles.map((activeVehicle: ActiveVehicle) => (
          <div
            key={`${activeVehicle.vehicle.id}-${activeVehicle.company.id}`}
            role="listitem"
          >
            <div className="bg-card rounded-3xl shadow-xl border-2 border-primary/20 overflow-hidden transition-all duration-200 hover:shadow-2xl hover:border-primary/40">
              <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Heading level="3">{activeVehicle.vehicle.name}</Heading>
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                        aria-label="Veículo ativo"
                      >
                        Ativo
                      </span>
                    </div>
                    <Text variant="body-muted-lg">
                      Placa:
                      {' '}
                      <span className="font-medium">{activeVehicle.vehicle.plate}</span>
                    </Text>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div>
                    <Text variant="body-small" className="mb-1">
                      Estacionamento
                    </Text>
                    <Text variant="body-medium">{activeVehicle.company.name}</Text>
                  </div>
                  <div>
                    <Text variant="body-small" className="mb-1">
                      Endereço
                    </Text>
                    <Text variant="body" className="text-sm text-card-foreground">
                      {activeVehicle.company.address}
                    </Text>
                  </div>
                  <div>
                    <Text variant="body-small" className="mb-1">
                      Horário de Entrada
                    </Text>
                    <Text variant="body-medium" className="text-sm">
                      {activeVehicle.entrance_date
                        ? formatDateTimeBrasilia(activeVehicle.entrance_date)
                        : 'Não disponível'}
                    </Text>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <Text variant="body-small" className="mb-1">
                    Preço Atual
                  </Text>
                  <Text variant="price">
                    {formatPrice(activeVehicle.current_price_cents)}
                  </Text>
                </div>

                <div className="pt-3 border-t border-border">
                  <Button
                    onClick={() => handleViewCompany(activeVehicle.company.id)}
                    variant="outline"
                    className="w-full"
                    aria-label={`Ver detalhes do estacionamento ${activeVehicle.company.name}`}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Ver Estacionamento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && safeActiveVehicles.length > 0 && (
        <div
          className="w-full py-4 flex justify-center"
          role="status"
          aria-label="Atualizando veículos ativos"
          aria-live="polite"
        >
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          <span className="sr-only">Atualizando veículos ativos...</span>
        </div>
      )}
    </section>
  );
}
