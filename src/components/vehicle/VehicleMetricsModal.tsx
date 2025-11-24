'use client';

import type { VehicleMetrics } from '@/services/vehicle/types';
import { startTransition, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getVehicleMetrics } from '@/services/vehicle/vehicleService';
import { formatDateTimeBrasilia } from '@/utils/dateTimeUtils';

type VehicleMetricsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehiclePlate: string | null;
};

function translateVehicleField(fieldName: string): string {
  const translations: Record<string, string> = {
    plate: 'Placa',
    model: 'Modelo',
    year: 'Ano',
    color: 'Cor',
    country: 'País',
    name: 'Nome',
    brand: 'Marca',
    type: 'Tipo',
  };

  const lowerField = fieldName.toLowerCase();
  return (
    translations[lowerField]
    || fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

function translateEntranceField(fieldName: string): string {
  const translations: Record<string, string> = {
    entrance_date: 'Data de Entrada',
    ended_at: 'Data de Saída',
    total_price: 'Preço Total',
    hourly_rate: 'Taxa por Hora',
    vehicle_id: 'ID do Veículo',
    company_id: 'ID da Empresa',
  };

  const lowerField = fieldName.toLowerCase();
  return (
    translations[lowerField]
    || fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

function formatValue(value: unknown, fieldName?: string): string {
  if (value === null || value === undefined) {
    if (fieldName?.toLowerCase() === 'ended_at') {
      return 'Em andamento';
    }
    return 'N/A';
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }

  if (typeof value === 'number') {
    const lowerFieldName = fieldName?.toLowerCase() || '';
    if (lowerFieldName.includes('price') || lowerFieldName.includes('rate')) {
      const reais = value / 100;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(reais);
    }

    if (fieldName?.toLowerCase() === 'year' || fieldName?.toLowerCase() === 'ano') {
      return value.toString();
    }

    if (value >= 1000 && value < 1900) {
      return new Intl.NumberFormat('pt-BR').format(value);
    }

    if (value >= 1900 && value <= 2100) {
      return value.toString();
    }

    if (value >= 1000) {
      return new Intl.NumberFormat('pt-BR').format(value);
    }
    return value.toString();
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime()) && value.includes('T')) {
      return formatDateTimeBrasilia(value);
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? `${value.length} item(ns)` : 'Vazio';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function renderMetrics(metrics: VehicleMetrics) {
  const paginationFields = ['skip', 'limit', 'total'];
  const entries = Object.entries(metrics).filter(
    ([key]) => !paginationFields.includes(key.toLowerCase()),
  );

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nenhuma métrica disponível para este veículo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => {
        const formattedKey = key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const nestedEntries = Object.entries(value as Record<string, unknown>);

          if (key.toLowerCase() === 'vehicle') {
            const importantFields = ['plate', 'model', 'year', 'color', 'country'];
            const filteredEntries = nestedEntries.filter(
              ([, value]) => value !== null && value !== undefined && value !== '',
            );
            const sortedEntries = filteredEntries.sort(([a], [b]) => {
              const aIndex = importantFields.indexOf(a.toLowerCase());
              const bIndex = importantFields.indexOf(b.toLowerCase());
              if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
              }
              if (aIndex !== -1) {
                return -1;
              }
              if (bIndex !== -1) {
                return 1;
              }
              return a.localeCompare(b);
            });

            if (sortedEntries.length === 0) {
              return null;
            }

            return (
              <div
                key={key}
                className="bg-gradient-to-br from-card to-card/50 rounded-xl border-2 border-primary/20 p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h4 className="text-lg font-semibold text-foreground">
                    Informações do Veículo
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sortedEntries.map(([nestedKey, nestedValue]) => {
                    const translatedKey = translateVehicleField(nestedKey);
                    const formattedValue = formatValue(nestedValue, nestedKey);

                    return (
                      <div
                        key={nestedKey}
                        className="bg-background/50 rounded-lg p-3 border border-border/50"
                      >
                        <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                          {translatedKey}
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          {formattedValue}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-semibold text-foreground mb-3">{formattedKey}</h4>
              <div className="space-y-2 pl-4 border-l-2 border-border">
                {nestedEntries.map(([nestedKey, nestedValue]) => {
                  const formattedNestedKey = nestedKey
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  return (
                    <div key={nestedKey} className="flex justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        {formattedNestedKey}
                        :
                      </span>
                      <span className="text-sm font-medium text-foreground text-right">
                        {formatValue(nestedValue)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        if (Array.isArray(value)) {
          if (key.toLowerCase() === 'entrances') {
            const excludedFields = ['vehicle_id', 'company_id', 'plate'];

            const fieldOrder = [
              'entrance_date',
              'ended_at',
              'total_price',
              'hourly_rate',
            ];

            return (
              <div
                key={key}
                className="bg-gradient-to-br from-card to-card/50 rounded-xl border-2 border-primary/20 p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h4 className="text-lg font-semibold text-foreground">
                    Entradas no Estacionamento
                  </h4>
                </div>
                <div className="space-y-2">
                  {value.length > 0
                    ? (
                        <>
                          <p className="text-sm text-muted-foreground mb-4">
                            Total de entradas:
                            {' '}
                            <span className="font-medium text-foreground">
                              {value.length}
                            </span>
                          </p>
                          <div className="space-y-4">
                            {value.map((item, index) => {
                              if (typeof item !== 'object' || item === null) {
                                return null;
                              }

                              const entries = Object.entries(item as Record<string, unknown>)
                                .filter(
                                  ([itemKey]) =>
                                    !excludedFields.includes(itemKey.toLowerCase()),
                                )
                                .sort(([a], [b]) => {
                                  const aIndex = fieldOrder.indexOf(a.toLowerCase());
                                  const bIndex = fieldOrder.indexOf(b.toLowerCase());
                                  if (aIndex !== -1 && bIndex !== -1) {
                                    return aIndex - bIndex;
                                  }
                                  if (aIndex !== -1) {
                                    return -1;
                                  }
                                  if (bIndex !== -1) {
                                    return 1;
                                  }
                                  return a.localeCompare(b);
                                });

                              if (entries.length === 0) {
                                return null;
                              }

                              return (
                                <div
                                  key={index}
                                  className="bg-background/50 rounded-lg p-4 border border-border/50"
                                >
                                  <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                                    Entrada #
                                    {index + 1}
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {entries.map(([itemKey, itemValue]) => {
                                      const translatedKey = translateEntranceField(itemKey);
                                      let formattedValue = formatValue(itemValue, itemKey);

                                      if (
                                        itemKey.toLowerCase() === 'hourly_rate'
                                        && itemValue !== null
                                        && itemValue !== undefined
                                      ) {
                                        formattedValue = `${formattedValue} por hora`;
                                      }

                                      return (
                                        <div
                                          key={itemKey}
                                          className="bg-card/50 rounded-lg p-3 border border-border/30"
                                        >
                                          <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                                            {translatedKey}
                                          </div>
                                          <div className="text-sm font-semibold text-foreground">
                                            {formattedValue}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )
                    : (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma entrada registrada para este veículo.
                        </p>
                      )}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-semibold text-foreground mb-3">{formattedKey}</h4>
              <div className="space-y-2">
                {value.length > 0
                  ? (
                      value.map((item, index) => {
                        return (
                          <div key={index} className="pl-4 border-l-2 border-border text-sm">
                            {typeof item === 'object' && item !== null
                              ? (
                                  <pre className="text-xs text-muted-foreground overflow-x-auto">
                                    {JSON.stringify(item, null, 2)}
                                  </pre>
                                )
                              : (
                                  <span className="text-foreground">{formatValue(item)}</span>
                                )}
                          </div>
                        );
                      })
                    )
                  : (
                      <p className="text-sm text-muted-foreground">Vazio</p>
                    )}
              </div>
            </div>
          );
        }

        return (
          <div
            key={key}
            className="bg-card rounded-lg border border-border p-4 flex justify-between items-center gap-4"
          >
            <span className="text-sm font-medium text-foreground">{formattedKey}</span>
            <span className="text-sm text-muted-foreground text-right">
              {formatValue(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function VehicleMetricsModal({
  open,
  onOpenChange,
  vehiclePlate,
}: VehicleMetricsModalProps) {
  const [metrics, setMetrics] = useState<VehicleMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && vehiclePlate) {
      startTransition(() => {
        setLoading(true);
        setError(null);
        setMetrics(null);
      });

      getVehicleMetrics(vehiclePlate)
        .then((data) => {
          setMetrics(data);
          setError(null);
        })
        .catch((err) => {
          const errorMessage
            = err instanceof Error ? err.message : 'Erro ao buscar métricas do veículo';
          setError(errorMessage);
          setMetrics(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!open) {
      startTransition(() => {
        setMetrics(null);
        setError(null);
      });
    }
  }, [open, vehiclePlate]);

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle id="metrics-title">
            Métricas do Veículo
            {vehiclePlate && (
              <span className="text-muted-foreground font-normal ml-2">
                (
                {vehiclePlate}
                )
              </span>
            )}
          </DialogTitle>
          <DialogDescription id="metrics-description">
            Estatísticas e informações sobre o uso do veículo
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading && (
            <div
              className="flex justify-center items-center py-12"
              role="status"
              aria-label="Carregando métricas"
              aria-live="polite"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="sr-only">Carregando métricas...</span>
            </div>
          )}

          {error && !loading && (
            <div
              className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center"
              role="alert"
              aria-live="assertive"
            >
              <p className="text-destructive-foreground font-medium mb-4">{error}</p>
              <Button onClick={handleClose} variant="outline" size="sm">
                Fechar
              </Button>
            </div>
          )}

          {!loading && !error && metrics && renderMetrics(metrics)}

          {!loading && !error && !metrics && !vehiclePlate && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma placa fornecida.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
