'use client';

import { useState } from 'react';
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
import { getCompanyPriceReference } from '@/services/company/companyService';
import { registerVehicleEntrance } from '@/services/vehicle/vehicleEntranceService';
import { toastError, toastSuccess } from '@/utils/toast';
import { vehicleEntranceSchema } from '@/validations/vehicleEntrance';

type VehicleEntranceFormProps = {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export default function VehicleEntranceForm({
  companyId,
  open,
  onOpenChange,
  onSuccess,
}: VehicleEntranceFormProps) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [plate, setPlate] = useState('');

  const clearForm = () => {
    setPlate('');
    setValidationErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      clearForm();
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationErrors({});

    const formData = {
      plate: plate.trim(),
    };

    const validationResult = vehicleEntranceSchema.safeParse(formData);

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
      const plateValue = validationResult.data.plate;

      const priceReference = await getCompanyPriceReference(companyId);

      if (
        !priceReference
        || priceReference.current_price_cents === undefined
        || priceReference.current_price_cents === null
      ) {
        toastError(
          'Não é possível registrar entrada: não há preço horário definido para este estacionamento. Por favor, defina um preço antes de registrar entradas.',
        );
        setLoading(false);
        return;
      }

      await registerVehicleEntrance(companyId, plateValue);

      toastSuccess('Entrada do veículo registrada com sucesso!');
      clearForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Erro ao registrar entrada do veículo';
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4" noValidate>
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
          disabled={loading}
          className="w-full sm:w-auto h-11 sm:h-9 text-base sm:text-sm"
        >
          {loading ? 'Registrando...' : 'Registrar Entrada'}
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
            <SheetTitle className="text-xl">Registrar Entrada de Veículo</SheetTitle>
            <SheetDescription className="text-base">
              Informe a placa do veículo para registrar a entrada no estacionamento.
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
          <DialogTitle>Registrar Entrada de Veículo</DialogTitle>
          <DialogDescription>
            Informe a placa do veículo para registrar a entrada no estacionamento.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
