'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { listCompanyActiveVehicles } from '@/services/vehicle/companyVehicleService';
import logger from '@/utils/logger';
import ActiveVehiclesList from './ActiveVehiclesList';
import VehicleEntranceForm from './VehicleEntranceForm';
import VehicleExitForm from './VehicleExitForm';
import VehicleHistory from './VehicleHistory';

type VehicleManagementSectionProps = {
  companyId: string;
  companyTotalSpots: number;
  onVehicleChange?: () => void;
};

type ActiveSection = 'active' | 'history';

export default function VehicleManagementSection({
  companyId,
  companyTotalSpots,
  onVehicleChange,
}: VehicleManagementSectionProps) {
  const [entranceFormOpen, setEntranceFormOpen] = useState(false);
  const [exitFormOpen, setExitFormOpen] = useState(false);
  const [exitVehiclePlate, setExitVehiclePlate] = useState<string | undefined>();
  const [activeSection, setActiveSection] = useState<ActiveSection>('active');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeVehiclesCount, setActiveVehiclesCount] = useState(0);
  const [loadingOccupancy, setLoadingOccupancy] = useState(false);

  const fetchActiveVehiclesCount = useCallback(async () => {
    setLoadingOccupancy(true);
    try {
      const response = await listCompanyActiveVehicles(companyId, {
        skip: 0,
        limit: 1,
      });
      setActiveVehiclesCount(response.total);
    } catch (error) {
      logger.warn({ error }, 'Failed to fetch active vehicles count');
    } finally {
      setLoadingOccupancy(false);
    }
  }, [companyId]);

  const occupancy = {
    total: companyTotalSpots,
    active: activeVehiclesCount,
    available: Math.max(0, companyTotalSpots - activeVehiclesCount),
    percentage:
      companyTotalSpots > 0
        ? Math.round((activeVehiclesCount / companyTotalSpots) * 100)
        : 0,
  };

  useEffect(() => {
    fetchActiveVehiclesCount();
  }, [fetchActiveVehiclesCount, refreshKey]);

  const handleEntranceSuccess = () => {
    setEntranceFormOpen(false);

    setRefreshKey(prev => prev + 1);

    onVehicleChange?.();
  };

  const handleExitSuccess = () => {
    setExitFormOpen(false);
    setExitVehiclePlate(undefined);

    setRefreshKey(prev => prev + 1);

    onVehicleChange?.();
  };

  const handleRegisterExit = (plate: string) => {
    setExitVehiclePlate(plate);
    setExitFormOpen(true);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchActiveVehiclesCount();
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-card rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Ocupação do Estacionamento</h3>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loadingOccupancy}
            aria-label="Atualizar ocupação do estacionamento"
          >
            {loadingOccupancy ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Capacidade Total</p>
            <p className="text-2xl font-bold">{occupancy.total}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Veículos Ativos</p>
            <p className="text-2xl font-bold text-primary">{occupancy.active}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Vagas Disponíveis</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {occupancy.available}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ocupação</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">
                {occupancy.percentage}
                %
              </p>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    occupancy.percentage >= 90
                      ? 'bg-destructive'
                      : occupancy.percentage >= 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(occupancy.percentage, 100)}%` }}
                  aria-label={`${occupancy.percentage}% de ocupação`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground">
            Gerenciamento de Veículos
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setEntranceFormOpen(true)}
              className="w-full sm:w-auto"
              aria-label="Registrar entrada de veículo"
            >
              Registrar Entrada
            </Button>
            <Button
              onClick={() => {
                setExitVehiclePlate(undefined);
                setExitFormOpen(true);
              }}
              variant="outline"
              className="w-full sm:w-auto"
              aria-label="Registrar saída de veículo"
            >
              Registrar Saída
            </Button>
          </div>
        </div>

        <div
          className="flex gap-2 border-b mb-6"
          role="tablist"
          aria-label="Navegação de seções"
        >
          <button
            type="button"
            onClick={() => setActiveSection('active')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeSection === 'active'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            role="tab"
            aria-selected={activeSection === 'active'}
            aria-controls="active-vehicles-panel"
            id="active-vehicles-tab"
          >
            Veículos Ativos
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('history')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeSection === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            role="tab"
            aria-selected={activeSection === 'history'}
            aria-controls="history-panel"
            id="history-tab"
          >
            Histórico
          </button>
        </div>

        {activeSection === 'active' && (
          <div
            id="active-vehicles-panel"
            role="tabpanel"
            aria-labelledby="active-vehicles-tab"
            key={refreshKey}
          >
            <ActiveVehiclesList
              companyId={companyId}
              companyTotalSpots={companyTotalSpots}
              onRegisterExit={handleRegisterExit}
              onRefresh={handleRefresh}
              hideTitle={true}
              hideOccupancy={true}
            />
          </div>
        )}

        {activeSection === 'history' && (
          <div
            id="history-panel"
            role="tabpanel"
            aria-labelledby="history-tab"
            key={`history-${refreshKey}`}
          >
            <VehicleHistory companyId={companyId} hideTitle={true} />
          </div>
        )}
      </div>

      <VehicleEntranceForm
        companyId={companyId}
        open={entranceFormOpen}
        onOpenChange={setEntranceFormOpen}
        onSuccess={handleEntranceSuccess}
      />

      <VehicleExitForm
        companyId={companyId}
        open={exitFormOpen}
        onOpenChange={(open) => {
          setExitFormOpen(open);
          if (!open) {
            setExitVehiclePlate(undefined);
          }
        }}
        onSuccess={handleExitSuccess}
        vehiclePlate={exitVehiclePlate}
      />
    </div>
  );
}
