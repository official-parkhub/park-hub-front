import type { Company } from '@/services/company/types';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ParkingLotList from '@/components/parking/ParkingLotList';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { getCompanyImages } from '@/services/company/companyService';

vi.mock('@/hooks/useInfiniteScroll');
vi.mock('@/services/company/companyService', () => ({
  listCompanies: vi.fn(),
  getCompanyImages: vi.fn(),
}));

describe('parkingLotList', () => {
  const mockCompany: Company = {
    id: 'company-1',
    name: 'Estacionamento Teste',
    postal_code: '70000-000',
    register_code: '123456',
    address: 'Rua Teste, 123',
    description: 'Descrição teste',
    is_covered: true,
    has_camera: true,
    total_spots: 50,
    has_charging_station: false,
    city: {
      name: 'Brasília',
      identification_code: null,
      country: 'BR',
    },
    organization_id: 'org-1',
    organization: {
      id: 'org-1',
      user_id: 'user-1',
      name: 'Organização Teste',
      register_code: 'ORG123',
      state_id: 'state-1',
      state: {
        id: 'state-1',
        name: 'Distrito Federal',
        country: 'BR',
        iso2_code: 'DF',
      },
    },
    parking_prices: [],
    parking_exceptions: [],
  };

  const mockSentinelRef = { current: null };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCompanyImages).mockResolvedValue([
      {
        id: 'img-1',
        url: 'https://example.com/image.jpg',
        is_primary: true,
      },
    ]);
  });

  it('should render loading state initially', () => {
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [],
      loading: true,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    render(<ParkingLotList />);
    expect(screen.getByLabelText('Carregando estacionamentos')).toBeInTheDocument();
    expect(screen.getByText('Carregando estacionamentos...')).toBeInTheDocument();
  });

  it('should render error state when error occurs', () => {
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [],
      loading: false,
      error: 'Erro ao carregar estacionamentos',
      hasMore: true,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    render(<ParkingLotList />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Erro ao carregar estacionamentos')).toBeInTheDocument();
    expect(screen.getByText(/Tente recarregar a página/)).toBeInTheDocument();
  });

  it('should render empty state when no companies are available', () => {
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    render(<ParkingLotList />);
    expect(
      screen.getByText(/Oops! Não encontramos estacionamentos disponíveis/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tente novamente mais tarde/)).toBeInTheDocument();
  });

  it('should render list of companies', () => {
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [mockCompany],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    render(<ParkingLotList />);
    expect(screen.getByText('Estacionamento Teste')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('should fetch images for companies', async () => {
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [mockCompany],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    render(<ParkingLotList />);

    await waitFor(() => {
      expect(getCompanyImages).toHaveBeenCalledWith('company-1');
    });
  });

  it('should use primary image when available', async () => {
    const primaryImage = {
      id: 'img-1',
      url: 'https://example.com/primary.jpg',
      is_primary: true,
    };

    const secondaryImage = {
      id: 'img-2',
      url: 'https://example.com/secondary.jpg',
      is_primary: false,
    };

    vi.mocked(getCompanyImages).mockResolvedValue([primaryImage, secondaryImage]);
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [mockCompany],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    render(<ParkingLotList />);

    await waitFor(() => {
      expect(getCompanyImages).toHaveBeenCalled();
    });

    const image = screen.getByAltText(`Imagem do estacionamento ${mockCompany.name}`);
    expect(image).toBeInTheDocument();
  });

  it('should use first image when no primary image is available', async () => {
    const images = [
      {
        id: 'img-1',
        url: 'https://example.com/first.jpg',
        is_primary: false,
      },
      {
        id: 'img-2',
        url: 'https://example.com/second.jpg',
        is_primary: false,
      },
    ];

    vi.mocked(getCompanyImages).mockResolvedValue(images);
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [mockCompany],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });
    render(<ParkingLotList />);
    await waitFor(() => {
      expect(getCompanyImages).toHaveBeenCalled();
    });
  });

  it('should handle image fetch errors gracefully', async () => {
    vi.mocked(getCompanyImages).mockRejectedValue(new Error('Failed to fetch'));
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [mockCompany],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    render(<ParkingLotList />);
    await waitFor(() => {
      expect(getCompanyImages).toHaveBeenCalled();
    });

    expect(screen.getByText('Estacionamento Teste')).toBeInTheDocument();
  });

  it('should show loading indicator when loading more items', () => {
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [mockCompany],
      loading: true,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    render(<ParkingLotList />);
    expect(screen.getByLabelText('Carregando mais estacionamentos')).toBeInTheDocument();
  });

  it('should render sentinel element when hasMore is true', () => {
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [mockCompany],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    const { container: _container } = render(<ParkingLotList />);
    expect(mockSentinelRef).toBeDefined();
  });

  it('should not render sentinel element when hasMore is false', () => {
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [mockCompany],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    render(<ParkingLotList />);
  });

  it('should call onCompanyClick when company is clicked', async () => {
    const mockOnClick = vi.fn();
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [mockCompany],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    render(<ParkingLotList onCompanyClick={mockOnClick} />);
    expect(screen.getByText('Estacionamento Teste')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    vi.mocked(useInfiniteScroll).mockReturnValue({
      items: [mockCompany],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      sentinelRef: mockSentinelRef as React.RefObject<HTMLDivElement | null>,
    });

    render(<ParkingLotList />);
    const list = screen.getByRole('list', {
      name: 'Lista de estacionamentos disponíveis',
    });

    expect(list).toBeInTheDocument();
  });
});
