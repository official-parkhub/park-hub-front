'use client';

import type {
  BaseParkingExceptionSchema,
  BaseParkingPriceSchema,
} from '@/services/company/types';
import {
  convertDateUTCToBrasilia,
  getCurrentDateBrasilia,
  getCurrentDayAPIFormat,
  getCurrentHourBrasilia,
} from '@/utils/dateTimeUtils';

type PriceTableProps = {
  prices?: BaseParkingPriceSchema[];
  currentPrice?: number;
  currentPriceFormatted?: string;
  exceptions?: BaseParkingExceptionSchema[];
  isCurrentPriceFromException?: boolean;
  exceptionDescription?: string | null;
  canManage?: boolean;
};

const DAYS_OF_WEEK = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

const EMPTY_PRICES: BaseParkingPriceSchema[] = [];
const EMPTY_EXCEPTIONS: BaseParkingExceptionSchema[] = [];

function formatPrice(cents: number): string {
  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
}

function formatHour(hour: number, isEndHour: boolean = false): string {
  if (isEndHour) {
    return `${hour.toString().padStart(2, '0')}:59`;
  }
  return `${hour.toString().padStart(2, '0')}:00`;
}

function formatHourRange(startHour: number, endHour: number): string {
  const start = formatHour(startHour, false);
  const end = formatHour(endHour, true);
  return `${start} até ${end}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function calculateCurrentPrice(prices?: BaseParkingPriceSchema[]): number | undefined {
  if (!prices || prices.length === 0) {
    return undefined;
  }

  const apiDay = getCurrentDayAPIFormat();
  const currentHour = getCurrentHourBrasilia();

  const currentPrice = prices.find(
    price =>
      price.week_day === apiDay
      && currentHour >= price.start_hour
      && currentHour < price.end_hour,
  );

  return currentPrice?.price_cents;
}

function sortPricesByDayAndHour(
  prices: BaseParkingPriceSchema[],
): BaseParkingPriceSchema[] {
  return [...prices].sort((a, b) => {
    if (a.week_day !== b.week_day) {
      return a.week_day - b.week_day;
    }

    return a.start_hour - b.start_hour;
  });
}

export default function PriceTable({
  prices = EMPTY_PRICES,
  currentPrice,
  currentPriceFormatted,
  exceptions = EMPTY_EXCEPTIONS,
  isCurrentPriceFromException = false,
  exceptionDescription,
  canManage = false,
}: PriceTableProps) {
  const displayCurrentPrice
    = currentPrice !== undefined ? currentPrice : calculateCurrentPrice(prices);
  const displayCurrentPriceFormatted
    = currentPriceFormatted
      ?? (displayCurrentPrice ? formatPrice(displayCurrentPrice) : undefined);

  const currentDay = getCurrentDayAPIFormat();
  const currentHour = getCurrentHourBrasilia();
  const today = getCurrentDateBrasilia();

  const activeException = exceptions.find((exception) => {
    try {
      const exceptionDateBrasilia = convertDateUTCToBrasilia(exception.exception_date);

      if (exceptionDateBrasilia === today && displayCurrentPrice) {
        return (
          currentHour >= exception.start_hour
          && currentHour < exception.end_hour
          && exception.price_cents === displayCurrentPrice
        );
      }
    } catch {
      if (exception.exception_date === today && displayCurrentPrice) {
        return (
          currentHour >= exception.start_hour
          && currentHour < exception.end_hour
          && exception.price_cents === displayCurrentPrice
        );
      }
    }
    return false;
  });

  const isFromException = isCurrentPriceFromException || !!activeException;

  const hasActiveException = exceptions.some((exception) => {
    try {
      const exceptionDateBrasilia = convertDateUTCToBrasilia(exception.exception_date);
      return exceptionDateBrasilia === today;
    } catch {
      return exception.exception_date === today;
    }
  });

  const isPriceActive = (price: BaseParkingPriceSchema): boolean => {
    const matchesTime
      = price.week_day === currentDay
        && currentHour >= price.start_hour
        && currentHour < price.end_hour;

    if (!matchesTime) {
      return false;
    }

    if (isFromException) {
      return false;
    }

    return true;
  };

  const sortedPrices = sortPricesByDayAndHour(prices);

  const hasPrices = prices.length > 0;
  const hasExceptions = exceptions.length > 0;

  // PriceTable component renders prices when available

  return (
    <div className="space-y-6">
      {displayCurrentPriceFormatted
        ? (
            <div className="bg-primary/10 border-2 border-primary rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-sm sm:text-base text-muted-foreground mb-2">Preço Atual</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                {displayCurrentPriceFormatted}
                <span className="text-lg sm:text-xl font-normal text-muted-foreground">
                  /hora
                </span>
              </p>
              {isFromException && (
                <div className="mt-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Preço devido a uma exceção
                  </p>
                  {(exceptionDescription || activeException?.description) && (
                    <p className="text-xs sm:text-sm font-medium text-primary mt-1">
                      {exceptionDescription || activeException?.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        : (
            <div className="bg-muted/50 border-2 border-border rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-sm sm:text-base text-muted-foreground mb-2">Preço Atual</p>
              {hasActiveException || exceptions.length > 0
                ? (
                    <p className="text-base sm:text-lg text-muted-foreground">
                      Preço não definido para hoje. O preço atual é devido a uma exceção.
                    </p>
                  )
                : (
                    <p className="text-base sm:text-lg text-muted-foreground">
                      Preço não foi definido para esta empresa.
                    </p>
                  )}
            </div>
          )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">
            Tabela de Preços da Semana
          </h3>
          {hasPrices && (
            <span className="text-sm text-muted-foreground">
              {prices.length}
              {' '}
              {prices.length === 1 ? 'preço cadastrado' : 'preços cadastrados'}
            </span>
          )}
        </div>

        {!hasPrices && (
          <div className="bg-muted/30 rounded-lg p-6 text-center border border-border">
            <p className="text-muted-foreground mb-2">Nenhum preço cadastrado ainda.</p>
            {canManage
              ? (
                  <p className="text-sm text-muted-foreground">
                    Use o botão "Adicionar Preço" acima para cadastrar preços para diferentes
                    dias e horários da semana.
                  </p>
                )
              : (
                  <p className="text-sm text-muted-foreground">
                    Entre em contato com o estacionamento para mais informações sobre os
                    preços e horários disponíveis.
                  </p>
                )}
          </div>
        )}

        {hasPrices && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table
                className="w-full border-collapse"
                role="table"
                aria-label="Tabela de preços da semana"
              >
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 px-4 font-semibold text-card-foreground">
                      Dia
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-card-foreground">
                      Horário
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-card-foreground">
                      Preço
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-card-foreground">
                      Tipo
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-card-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPrices.map((price, index) => {
                    const isActive = isPriceActive(price);
                    const showDay
                      = index === 0 || sortedPrices[index - 1]?.week_day !== price.week_day;
                    return (
                      <tr
                        key={`${price.week_day}-${price.start_hour}-${price.end_hour}-${index}`}
                        className={`border-b border-border hover:bg-accent/50 transition-colors ${
                          isActive ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-card-foreground">
                          {showDay ? DAYS_OF_WEEK[price.week_day] : ''}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatHourRange(price.start_hour, price.end_hour)}
                          <span className="text-xs text-muted-foreground/70 ml-1">
                            (UTC-3)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-card-foreground">
                          {formatPrice(price.price_cents)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {price.is_discount
                            ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Desconto
                                </span>
                              )
                            : (
                                <span className="text-muted-foreground text-sm">Regular</span>
                              )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isActive && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                              Atual
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-2">
              {sortedPrices.map((price, index) => {
                const isActive = isPriceActive(price);
                const showDay
                  = index === 0 || sortedPrices[index - 1]?.week_day !== price.week_day;
                return (
                  <div
                    key={`${price.week_day}-${price.start_hour}-${price.end_hour}-${index}`}
                  >
                    {showDay && (
                      <h4 className="font-semibold text-card-foreground mb-2 mt-4 first:mt-0">
                        {DAYS_OF_WEEK[price.week_day]}
                      </h4>
                    )}
                    <div
                      className={`flex items-center justify-between py-2 px-3 border border-border rounded-lg mb-2 ${
                        isActive ? 'bg-primary/10 border-l-4 border-l-primary' : 'bg-card'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {formatHourRange(price.start_hour, price.end_hour)}
                            <span className="text-xs text-muted-foreground/70 ml-1">
                              (UTC-3)
                            </span>
                          </p>
                          {isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                              Atual
                            </span>
                          )}
                        </div>
                        {price.is_discount && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1">
                            Desconto
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-card-foreground">
                        {formatPrice(price.price_cents)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {hasExceptions && (
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">
            Exceções e Promoções
          </h3>
          <div className="space-y-3">
            {exceptions.map((exception, index) => (
              <div
                key={`${exception.exception_date}-${exception.start_hour}-${exception.end_hour}-${index}`}
                className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {formatDate(exception.exception_date)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatHourRange(exception.start_hour, exception.end_hour)}
                      <span className="text-xs text-muted-foreground/70 ml-1">
                        (UTC-3)
                      </span>
                    </p>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(exception.price_cents)}
                  </p>
                </div>
                {exception.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {exception.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
