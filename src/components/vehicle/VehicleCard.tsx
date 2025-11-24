'use client';

import type { Vehicle } from '@/services/vehicle/types';
import { Button } from '@/components/ui/button';

type VehicleCardProps = {
  vehicle: Vehicle;
  onViewMetrics?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
};

const VehiclePlaceholder = () => (
  <svg
    className="w-full h-full text-muted-foreground/30"
    fill="none"
    viewBox="0 0 200 120"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="200" height="120" fill="currentColor" opacity="0.1" rx="8" />
    <g transform="translate(50, 30)">
      <rect
        x="20"
        y="30"
        width="60"
        height="30"
        rx="4"
        fill="currentColor"
        opacity="0.3"
      />

      <path d="M 30 30 L 40 15 L 60 15 L 70 30 Z" fill="currentColor" opacity="0.3" />

      <circle cx="35" cy="65" r="8" fill="currentColor" opacity="0.4" />
      <circle cx="65" cy="65" r="8" fill="currentColor" opacity="0.4" />

      <rect
        x="35"
        y="20"
        width="20"
        height="12"
        rx="2"
        fill="currentColor"
        opacity="0.2"
      />
    </g>
  </svg>
);

export default function VehicleCard({
  vehicle,
  onViewMetrics,
  onDelete,
}: VehicleCardProps) {
  const handleViewMetrics = () => {
    if (onViewMetrics) {
      onViewMetrics(vehicle);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(vehicle);
    }
  };

  return (
    <article
      className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] focus-within:outline-2 focus-within:outline-primary focus-within:outline-offset-2"
      aria-label={`Veículo ${vehicle.name}`}
    >
      <div className="w-full h-40 sm:h-48 bg-muted/30 flex items-center justify-center overflow-hidden">
        <VehiclePlaceholder />
      </div>

      <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">
          {vehicle.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base text-muted-foreground">Placa:</span>
          <span className="text-sm sm:text-base font-medium text-card-foreground">
            {vehicle.plate}
          </span>
          {vehicle.country && (
            <span className="text-xs text-muted-foreground">
              (
              {vehicle.country}
              )
            </span>
          )}
        </div>

        {(vehicle.model || vehicle.year || vehicle.color) && (
          <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-muted-foreground">
            {vehicle.model && (
              <div className="flex items-center gap-1">
                <span aria-label={`Modelo: ${vehicle.model}`}>{vehicle.model}</span>
              </div>
            )}
            {vehicle.year && (
              <div className="flex items-center gap-1">
                <span aria-label={`Ano: ${vehicle.year}`}>{vehicle.year}</span>
              </div>
            )}
            {vehicle.color && (
              <div className="flex items-center gap-1">
                <span aria-label={`Cor: ${vehicle.color}`}>{vehicle.color}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-3 border-t border-border">
          {onViewMetrics && (
            <Button
              variant="outline"
              size="default"
              onClick={handleViewMetrics}
              className="w-full h-11 text-base sm:h-9 sm:text-sm"
              aria-label={`Ver métricas do veículo ${vehicle.name}`}
            >
              <svg
                className="w-5 h-5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Ver Métricas
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="default"
              onClick={handleDelete}
              className="w-full h-11 text-base sm:h-9 sm:text-sm border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              aria-label={`Remover veículo ${vehicle.name}`}
            >
              <svg
                className="w-5 h-5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Remover
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
