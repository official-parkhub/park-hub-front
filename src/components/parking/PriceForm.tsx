'use client';

/**
 * PriceForm component
 * Form for creating parking prices with validation
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createParkingPrice } from '@/services/company/priceService';
import { toastError, toastSuccess } from '@/utils/toast';
import { parkingPriceSchema } from '@/validations/price';

type PriceFormProps = {
  companyId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const WEEK_DAYS = [
  { value: 0, label: 'Segunda-feira' },
  { value: 1, label: 'Terça-feira' },
  { value: 2, label: 'Quarta-feira' },
  { value: 3, label: 'Quinta-feira' },
  { value: 4, label: 'Sexta-feira' },
  { value: 5, label: 'Sábado' },
  { value: 6, label: 'Domingo' },
];

export default function PriceForm({ companyId, onSuccess, onCancel }: PriceFormProps) {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [weekDay, setWeekDay] = useState<number | ''>('');
  const [startHour, setStartHour] = useState<number | ''>('');
  const [endHour, setEndHour] = useState<number | ''>('');
  const [priceReais, setPriceReais] = useState<string>('');
  const [isDiscount, setIsDiscount] = useState(false);

  const clearForm = () => {
    setWeekDay('');
    setStartHour('');
    setEndHour('');
    setPriceReais('');
    setIsDiscount(false);
    setValidationErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationErrors({});

    const priceInReais
      = priceReais.trim() === '' ? undefined : Number.parseFloat(priceReais);
    const priceInCents
      = priceInReais !== undefined && !Number.isNaN(priceInReais)
        ? Math.round(priceInReais * 100)
        : undefined;

    const formData = {
      week_day: weekDay === '' ? undefined : Number(weekDay),
      start_hour: startHour === '' ? undefined : Number(startHour),
      end_hour: endHour === '' ? undefined : Number(endHour),
      price_cents: priceInCents,
      is_discount: isDiscount,
    };

    const validationResult = parkingPriceSchema.safeParse(formData);

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
      await createParkingPrice(companyId, validationResult.data);

      clearForm();
      toastSuccess('Preço criado com sucesso!');
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar preço';
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="week_day">
          Dia da Semana
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <select
            id="week_day"
            value={weekDay}
            onChange={(e) => {
              const value = e.target.value;
              setWeekDay(value === '' ? '' : Number(value));
              if (validationErrors.week_day) {
                setValidationErrors((prev) => {
                  const { week_day, ...rest } = prev;
                  return rest;
                });
              }
            }}
            className={`w-full h-9 px-3 pr-10 bg-input border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 appearance-none cursor-pointer ${
              validationErrors.week_day ? 'border-destructive' : 'border-border'
            }`}
            aria-describedby={validationErrors.week_day ? 'week_day-error' : undefined}
            aria-invalid={!!validationErrors.week_day}
            disabled={loading}
            required
          >
            <option value="">Selecione um dia</option>
            {WEEK_DAYS.map(day => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {validationErrors.week_day && (
          <p
            id="week_day-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.week_day}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="start_hour">
          Horário de Início
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="start_hour"
          type="number"
          value={startHour === '' ? '' : startHour}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              setStartHour('');
            } else {
              const numValue = Number.parseInt(value, 10);
              if (!Number.isNaN(numValue)) {
                setStartHour(numValue);
              }
            }
            if (validationErrors.start_hour) {
              setValidationErrors((prev) => {
                const { start_hour, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="8"
          min={0}
          max={23}
          aria-describedby={
            validationErrors.start_hour ? 'start_hour-error' : 'start_hour-help'
          }
          aria-invalid={!!validationErrors.start_hour}
          disabled={loading}
          required
        />
        <p id="start_hour-help" className="text-xs text-muted-foreground">
          O horário sempre iniciará em
          {' '}
          {startHour !== '' ? `${startHour.toString().padStart(2, '0')}:00` : 'XX:00'}
          {' '}
          (UTC-3)
        </p>
        {validationErrors.start_hour && (
          <p
            id="start_hour-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.start_hour}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_hour">
          Horário de Fim
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="end_hour"
          type="number"
          value={endHour === '' ? '' : endHour}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              setEndHour('');
            } else {
              const numValue = Number.parseInt(value, 10);
              if (!Number.isNaN(numValue)) {
                setEndHour(numValue);
              }
            }
            if (validationErrors.end_hour) {
              setValidationErrors((prev) => {
                const { end_hour, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="18"
          min={0}
          max={23}
          aria-describedby={
            validationErrors.end_hour ? 'end_hour-error' : 'end_hour-help'
          }
          aria-invalid={!!validationErrors.end_hour}
          disabled={loading}
          required
        />
        <p id="end_hour-help" className="text-xs text-muted-foreground">
          O horário sempre finalizará em
          {' '}
          {endHour !== '' ? `${endHour.toString().padStart(2, '0')}:59` : 'XX:59'}
          {' '}
          (UTC-3)
        </p>
        {validationErrors.end_hour && (
          <p
            id="end_hour-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.end_hour}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price_cents">
          Preço (R$)
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price_cents"
          type="number"
          value={priceReais}
          onChange={(e) => {
            const value = e.target.value;
            setPriceReais(value);
            if (validationErrors.price_cents) {
              setValidationErrors((prev) => {
                const { price_cents, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="10.50"
          min={0}
          step="0.01"
          aria-describedby={
            validationErrors.price_cents ? 'price_cents-error' : undefined
          }
          aria-invalid={!!validationErrors.price_cents}
          disabled={loading}
          required
        />
        {validationErrors.price_cents && (
          <p
            id="price_cents-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.price_cents}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            id="is_discount"
            type="checkbox"
            checked={isDiscount}
            onChange={(e) => {
              setIsDiscount(e.target.checked);
              if (validationErrors.is_discount) {
                setValidationErrors((prev) => {
                  const { is_discount, ...rest } = prev;
                  return rest;
                });
              }
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-describedby={
              validationErrors.is_discount ? 'is_discount-error' : undefined
            }
            aria-invalid={!!validationErrors.is_discount}
            disabled={loading}
          />
          <Label htmlFor="is_discount" className="cursor-pointer">
            É desconto?
          </Label>
        </div>
        {validationErrors.is_discount && (
          <p
            id="is_discount-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.is_discount}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Criando...' : 'Criar Preço'}
        </Button>
      </div>
    </form>
  );
}
