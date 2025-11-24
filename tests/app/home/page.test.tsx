import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '@/app/home/page';
import { getToken } from '@/utils/tokenStorage';

vi.mock('@/utils/tokenStorage', () => ({
  getToken: vi.fn(),
}));

vi.mock('@/components/layout/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/parking/ParkingLotList', () => ({
  default: ({ onCompanyClick }: { onCompanyClick?: (id: string) => void }) => (
    <div data-testid="parking-lot-list">
      <button type="button" onClick={() => onCompanyClick?.('company-1')}>
        Click Company
      </button>
    </div>
  ),
}));

describe('homePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login when token does not exist', async () => {
    const mockPush = vi.fn();

    vi.mocked(getToken).mockReturnValue(null);
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));

    render(<HomePage />);

    await waitFor(() => {
      expect(getToken).toHaveBeenCalled();
    });
  });
});
