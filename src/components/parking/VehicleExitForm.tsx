'use client';

import type { VehicleExitResponse } from '@/services/vehicle/types';
import { startTransition, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { registerVehicleExit } from '@/services/vehicle/vehicleExitService';
import { convertBrasiliaToUTC, getCurrentDateBrasilia } from '@/utils/dateTimeUtils';
import { toastError, toastSuccess } from '@/utils/toast';
import { vehicleExitSchema } from '@/validations/vehicleExit';

type VehicleExitFormProps = {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  vehiclePlate?: string;
};

const convertToISO8601 = (date: string, time: string): string => {
  if (!date || !time) {
    return '';
  }

  const dateTimeString = `${date}T${time}:00`;
  return convertBrasiliaToUTC(dateTimeString);
};

const formatCurrency = (cents: number): string => {
  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const calculateParkingTime = (entranceDate: string, endedAt: string): string => {
  const entrance = new Date(entranceDate);
  const exit = new Date(endedAt);
  const diffMs = exit.getTime() - entrance.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return `${minutes}min`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}min`;
};

export default function VehicleExitForm({
  companyId,
  open,
  onOpenChange,
  onSuccess,
  vehiclePlate,
}: VehicleExitFormProps) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [exitResponse, setExitResponse] = useState<VehicleExitResponse | null>(null);

  const [plate, setPlate] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (vehiclePlate && open) {
      startTransition(() => {
        setPlate(vehiclePlate);
      });
    }
  }, [vehiclePlate, open]);

  const clearForm = useCallback(() => {
    startTransition(() => {
      setPlate('');
      setDate('');
      setTime('');
      setValidationErrors({});
      setExitResponse(null);
    });
  }, []);

  useEffect(() => {
    if (!open) {
      startTransition(() => {
        clearForm();
      });
    }
  }, [open, clearForm]);

  const handleClose = () => {
    if (!loading) {
      clearForm();
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationErrors({});
    setExitResponse(null);

    const formData: { plate: string; ended_at?: string } = {
      plate: plate.trim(),
    };

    if (date && time) {
      const iso8601DateTime = convertToISO8601(date, time);
      if (iso8601DateTime) {
        formData.ended_at = iso8601DateTime;
      }
    }

    const validationResult = vehicleExitSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const response = await registerVehicleExit(
        companyId,
        validationResult.data.plate,
        validationResult.data.ended_at,
      );

      setExitResponse(response);

      const parkingTime = calculateParkingTime(response.entrance_date, response.ended_at);
      const totalPrice = formatCurrency(response.total_price);

      toastSuccess(
        `Saída registrada! Valor total: ${totalPrice} | Tempo: ${parkingTime}`,
      );

      setPlate('');
      setDate('');
      setTime('');
      setValidationErrors({});

      setTimeout(() => {
        clearForm();
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Erro ao registrar saída do veículo';
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    return getCurrentDateBrasilia();
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4" noValidate>
      {exitResponse && (
        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-800 p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-green-900 dark:text-green-100">
              Saída registrada com sucesso!
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Entrada
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDateTime(exitResponse.entrance_date)}
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">
                  Saída
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDateTime(exitResponse.ended_at)}
              </p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-green-200 dark:border-green-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tempo Estacionado:
              </span>
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {calculateParkingTime(exitResponse.entrance_date, exitResponse.ended_at)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Taxa Horária:
              </span>
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(exitResponse.hourly_rate)}
                /h
              </span>
            </div>
            <div className="pt-3 border-t border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Valor Total:
                </span>
                <span className="text-xl font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(exitResponse.total_price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="plate" className="text-base sm:text-sm">
          Placa do Veículo
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="plate"
          type="text"
          value={plate}
          onChange={e => setPlate(e.target.value)}
          placeholder="ABC1234"
          disabled={loading}
          className="h-11 sm:h-9 text-base sm:text-sm"
          aria-describedby={validationErrors.plate ? 'plate-error' : undefined}
          aria-invalid={!!validationErrors.plate}
        />
        {validationErrors.plate && (
          <p
            id="plate-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.plate}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-base sm:text-sm">Data e Hora de Saída (Opcional)</Label>
        <p className="text-xs text-muted-foreground">
          Se não informado, será usada a data e hora atual
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="exit-date" className="text-sm">
              Data
            </Label>
            <Input
              id="exit-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={getCurrentDate()}
              disabled={loading}
              className="h-11 sm:h-9 text-base sm:text-sm"
              aria-describedby={validationErrors.ended_at ? 'date-error' : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exit-time" className="text-sm">
              Hora
            </Label>
            <Input
              id="exit-time"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              disabled={loading || !date}
              className="h-11 sm:h-9 text-base sm:text-sm"
              aria-describedby={validationErrors.ended_at ? 'time-error' : undefined}
            />
          </div>
        </div>
        {validationErrors.ended_at && (
          <p
            id="date-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.ended_at}
          </p>
        )}
        {date && !time && (
          <p className="text-xs text-muted-foreground">
            Informe também a hora para registrar a saída
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4 sm:pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={loading}
          className="w-full sm:w-auto h-11 sm:h-9 text-base sm:text-sm"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || Boolean(date && !time)}
          className="w-full sm:w-auto h-11 sm:h-9 text-base sm:text-sm"
        >
          {loading ? 'Registrando...' : 'Registrar Saída'}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto border-t-2 border-primary/20 p-0"
        >
          <SheetHeader className="px-5 pt-5 pb-3">
            <SheetTitle className="text-xl">Registrar Saída de Veículo</SheetTitle>
            <SheetDescription className="text-base">
              Informe a placa do veículo e opcionalmente a data e hora de saída.
            </SheetDescription>
          </SheetHeader>
          <div className="px-5 pb-5">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Saída de Veículo</DialogTitle>
          <DialogDescription>
            Informe a placa do veículo e opcionalmente a data e hora de saída.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
