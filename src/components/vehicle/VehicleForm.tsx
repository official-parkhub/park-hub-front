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
import { createVehicle } from '@/services/vehicle/vehicleService';
import { toastError } from '@/utils/toast';
import { vehicleFormSchema } from '@/validations/vehicle';

type VehicleFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export default function VehicleForm({ open, onOpenChange, onSuccess }: VehicleFormProps) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [plate, setPlate] = useState('');
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | undefined>(undefined);
  const [color, setColor] = useState('');
  const [country, setCountry] = useState('BR');

  const clearForm = () => {
    setPlate('');
    setName('');
    setModel('');
    setYear(undefined);
    setColor('');
    setCountry('BR');
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

    const formData: {
      plate: string;
      name: string;
      model?: string;
      year?: number;
      color?: string;
      country?: string;
    } = {
      plate: plate.trim(),
      name: name.trim(),
      country: country || 'BR',
    };

    if (model.trim()) {
      formData.model = model.trim();
    }
    if (year !== undefined && year !== null) {
      formData.year = year;
    }
    if (color.trim()) {
      formData.color = color.trim();
    }

    const validationResult = vehicleFormSchema.safeParse(formData);

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
      const apiData = {
        name: validationResult.data.name,
        vehicle: {
          plate: validationResult.data.plate,
          ...(validationResult.data.model && {
            model: validationResult.data.model,
          }),
          ...(validationResult.data.year && {
            year: validationResult.data.year,
          }),
          ...(validationResult.data.color && {
            color: validationResult.data.color,
          }),
          ...(validationResult.data.country && {
            country: validationResult.data.country,
          }),
        },
      };

      await createVehicle(apiData);

      clearForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Erro ao adicionar veículo';
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="plate">
          Placa
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="plate"
          type="text"
          value={plate}
          onChange={(e) => {
            setPlate(e.target.value);
            if (validationErrors.plate) {
              setValidationErrors((prev) => {
                const { plate, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="ABC-1234"
          maxLength={20}
          aria-describedby={validationErrors.plate ? 'plate-error' : undefined}
          aria-invalid={!!validationErrors.plate}
          disabled={loading}
          required
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
        <Label htmlFor="name">
          Apelido
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (validationErrors.name) {
              setValidationErrors((prev) => {
                const { name, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="Meu Carro"
          maxLength={100}
          aria-describedby={validationErrors.name ? 'name-error' : undefined}
          aria-invalid={!!validationErrors.name}
          disabled={loading}
          required
        />
        {validationErrors.name && (
          <p
            id="name-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">Modelo</Label>
        <Input
          id="model"
          type="text"
          value={model}
          onChange={(e) => {
            setModel(e.target.value);
            if (validationErrors.model) {
              setValidationErrors((prev) => {
                const { model, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="Honda Civic"
          maxLength={100}
          aria-describedby={validationErrors.model ? 'model-error' : undefined}
          aria-invalid={!!validationErrors.model}
          disabled={loading}
        />
        {validationErrors.model && (
          <p
            id="model-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.model}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Ano</Label>
        <Input
          id="year"
          type="number"
          value={year ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              setYear(undefined);
            } else {
              const numValue = Number.parseInt(value, 10);
              if (!Number.isNaN(numValue)) {
                setYear(numValue);
              }
            }
            if (validationErrors.year) {
              setValidationErrors((prev) => {
                const { year, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="2020"
          min={1900}
          max={2100}
          aria-describedby={validationErrors.year ? 'year-error' : undefined}
          aria-invalid={!!validationErrors.year}
          disabled={loading}
        />
        {validationErrors.year && (
          <p
            id="year-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.year}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Cor</Label>
        <Input
          id="color"
          type="text"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            if (validationErrors.color) {
              setValidationErrors((prev) => {
                const { color, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="Branco"
          maxLength={50}
          aria-describedby={validationErrors.color ? 'color-error' : undefined}
          aria-invalid={!!validationErrors.color}
          disabled={loading}
        />
        {validationErrors.color && (
          <p
            id="color-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.color}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">País</Label>
        <Input
          id="country"
          type="text"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            if (validationErrors.country) {
              setValidationErrors((prev) => {
                const { country, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="BR"
          maxLength={10}
          aria-describedby={validationErrors.country ? 'country-error' : undefined}
          aria-invalid={!!validationErrors.country}
          disabled={loading}
        />
        {validationErrors.country && (
          <p
            id="country-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.country}
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
          {loading ? 'Adicionando...' : 'Adicionar Veículo'}
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
            <SheetTitle className="text-xl">Adicionar Veículo</SheetTitle>
            <SheetDescription className="text-base">
              Preencha os dados do veículo. Campos marcados com * são obrigatórios.
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
          <DialogTitle>Adicionar Veículo</DialogTitle>
          <DialogDescription>
            Preencha os dados do veículo. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
