import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PriceTable from '@/components/parking/PriceTable';

describe('priceTable', () => {
  it('should display current price when provided', () => {
    render(<PriceTable currentPrice={500} currentPriceFormatted="R$ 5,00" />);
    expect(screen.getByText('Preço Atual')).toBeInTheDocument();
    expect(screen.getByText('R$ 5,00')).toBeInTheDocument();
    expect(screen.getByText('/hora')).toBeInTheDocument();
  });
});
