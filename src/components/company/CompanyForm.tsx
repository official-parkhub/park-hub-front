'use client';

import type { City } from '@/services/geo/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
import { createCompany } from '@/services/company/companyService';
import { getCities } from '@/services/geo/geoService';
import { formatCEP, formatCNPJ } from '@/utils/formatters';
import { toastError, toastSuccess } from '@/utils/toast';
import { companyFormSchema } from '@/validations/company';

type CompanyFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (companyId: string) => void;
};

export default function CompanyForm({ open, onOpenChange, onSuccess }: CompanyFormProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [registerCode, setRegisterCode] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [isCovered, setIsCovered] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [totalSpots, setTotalSpots] = useState<number | ''>('');
  const [hasChargingStation, setHasChargingStation] = useState(false);
  const [cityId, setCityId] = useState('');

  const [cities, setCities] = useState<City[]>([]);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const loadCities = useCallback(async () => {
    setLoadingCities(true);
    setCitiesError(null);
    try {
      const citiesData = await getCities();
      setCities(citiesData);
    } catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Erro ao carregar cidades';
      setCitiesError(errorMessage);
      toastError(errorMessage);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadCities();
    }
  }, [open, loadCities]);

  const clearForm = () => {
    setName('');
    setPostalCode('');
    setRegisterCode('');
    setAddress('');
    setDescription('');
    setIsCovered(false);
    setHasCamera(false);
    setTotalSpots('');
    setHasChargingStation(false);
    setCityId('');
    setValidationErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      clearForm();
      onOpenChange(false);
    }
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCNPJ(value);
    setRegisterCode(formatted);
    if (validationErrors.register_code) {
      setValidationErrors((prev) => {
        const { register_code, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCEP(value);
    setPostalCode(formatted);
    if (validationErrors.postal_code) {
      setValidationErrors((prev) => {
        const { postal_code, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationErrors({});

    const formData = {
      name: name.trim(),
      postal_code: postalCode.trim(),
      register_code: registerCode.trim(),
      address: address.trim(),
      description: description.trim() || null,
      is_covered: isCovered,
      has_camera: hasCamera,
      total_spots: totalSpots === '' ? 0 : Number(totalSpots),
      has_charging_station: hasChargingStation,
      city_id: cityId,
    };

    const validationResult = companyFormSchema.safeParse(formData);

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
      const company = await createCompany(validationResult.data);

      toastSuccess('Empresa criada com sucesso!');
      clearForm();
      onOpenChange(false);

      router.push(`/parking/${company.id}`);
      onSuccess?.(company.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar empresa';
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome da empresa
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
          placeholder="Estacionamento Central"
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
        <Label htmlFor="postal_code">
          CEP
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="postal_code"
          type="text"
          value={postalCode}
          onChange={handleCEPChange}
          placeholder="12345-678"
          maxLength={9}
          aria-describedby={
            validationErrors.postal_code ? 'postal_code-error' : undefined
          }
          aria-invalid={!!validationErrors.postal_code}
          disabled={loading}
          required
        />
        {validationErrors.postal_code && (
          <p
            id="postal_code-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.postal_code}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register_code">
          CNPJ
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="register_code"
          type="text"
          value={registerCode}
          onChange={handleCNPJChange}
          placeholder="12.345.678/0001-90"
          maxLength={18}
          aria-describedby={
            validationErrors.register_code ? 'register_code-error' : undefined
          }
          aria-invalid={!!validationErrors.register_code}
          disabled={loading}
          required
        />
        {validationErrors.register_code && (
          <p
            id="register_code-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.register_code}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          Endereço
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address"
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (validationErrors.address) {
              setValidationErrors((prev) => {
                const { address, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="Rua Principal, 123"
          aria-describedby={validationErrors.address ? 'address-error' : undefined}
          aria-invalid={!!validationErrors.address}
          disabled={loading}
          required
        />
        {validationErrors.address && (
          <p
            id="address-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.address}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (validationErrors.description) {
              setValidationErrors((prev) => {
                const { description, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="Descrição do estacionamento (opcional)"
          rows={3}
          className="w-full min-h-[80px] px-3 py-2 text-base md:text-sm bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 resize-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
          aria-describedby={
            validationErrors.description ? 'description-error' : undefined
          }
          aria-invalid={!!validationErrors.description}
          disabled={loading}
        />
        {validationErrors.description && (
          <p
            id="description-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.description}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="city_id">
          Cidade
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        {loadingCities
          ? (
              <div className="w-full h-9 px-3 bg-input border border-border rounded-md flex items-center">
                <span className="text-sm text-muted-foreground">Carregando cidades...</span>
              </div>
            )
          : citiesError
            ? (
                <div className="space-y-2">
                  <div className="w-full h-9 px-3 bg-destructive/10 border border-destructive rounded-md flex items-center">
                    <p className="text-sm text-destructive">{citiesError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadCities}
                    className="text-sm text-primary hover:text-primary/80 underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              )
            : (
                <div className="relative">
                  <select
                    id="city_id"
                    value={cityId}
                    onChange={(e) => {
                      setCityId(e.target.value);
                      if (validationErrors.city_id) {
                        setValidationErrors((prev) => {
                          const { city_id, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    className={`w-full h-9 px-3 pr-10 bg-input border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                      validationErrors.city_id ? 'border-destructive' : 'border-border'
                    }`}
                    aria-describedby={validationErrors.city_id ? 'city_id-error' : undefined}
                    aria-invalid={!!validationErrors.city_id}
                    disabled={loading || cities.length === 0}
                    required
                  >
                    <option value="">Selecione uma cidade</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                        {' '}
                        -
                        {city.state.iso2_code}
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
              )}
        {validationErrors.city_id && (
          <p
            id="city_id-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.city_id}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="total_spots">
          Total de vagas
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="total_spots"
          type="number"
          value={totalSpots}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              setTotalSpots('');
            } else {
              const numValue = Number.parseInt(value, 10);
              if (!Number.isNaN(numValue)) {
                setTotalSpots(numValue);
              }
            }
            if (validationErrors.total_spots) {
              setValidationErrors((prev) => {
                const { total_spots, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="50"
          min={1}
          aria-describedby={
            validationErrors.total_spots ? 'total_spots-error' : undefined
          }
          aria-invalid={!!validationErrors.total_spots}
          disabled={loading}
          required
        />
        {validationErrors.total_spots && (
          <p
            id="total_spots-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.total_spots}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            id="is_covered"
            type="checkbox"
            checked={isCovered}
            onChange={(e) => {
              setIsCovered(e.target.checked);
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          />
          <Label htmlFor="is_covered" className="cursor-pointer">
            Estacionamento coberto
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="has_camera"
            type="checkbox"
            checked={hasCamera}
            onChange={(e) => {
              setHasCamera(e.target.checked);
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          />
          <Label htmlFor="has_camera" className="cursor-pointer">
            Possui câmera
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="has_charging_station"
            type="checkbox"
            checked={hasChargingStation}
            onChange={(e) => {
              setHasChargingStation(e.target.checked);
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          />
          <Label htmlFor="has_charging_station" className="cursor-pointer">
            Possui estação de carregamento
          </Label>
        </div>
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
          disabled={loading || loadingCities}
          className="w-full sm:w-auto h-11 sm:h-9 text-base sm:text-sm"
        >
          {loading ? 'Criando...' : 'Criar Empresa'}
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
            <SheetTitle className="text-xl">Criar Empresa</SheetTitle>
            <SheetDescription className="text-base">
              Preencha os dados da empresa. Campos marcados com * são obrigatórios.
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
          <DialogTitle>Criar Empresa</DialogTitle>
          <DialogDescription>
            Preencha os dados da empresa. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
