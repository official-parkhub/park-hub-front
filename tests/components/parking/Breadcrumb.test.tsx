import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Breadcrumb from '@/components/parking/Breadcrumb';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('breadcrumb', () => {
  it('should render breadcrumb with company name', () => {
    render(<Breadcrumb companyName="Estacionamento Teste" />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Estacionamento Teste')).toBeInTheDocument();
  });

  it('should have link to home page', () => {
    render(<Breadcrumb companyName="Estacionamento Teste" />);

    const homeLink = screen.getByText('Início').closest('a');

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/home');
  });

  it('should mark current page with aria-current', () => {
    render(<Breadcrumb companyName="Estacionamento Teste" />);

    const currentItem = screen.getByText('Estacionamento Teste');

    expect(currentItem.closest('li')).toHaveAttribute('aria-current', 'page');
  });

  it('should have proper semantic structure', () => {
    render(<Breadcrumb companyName="Estacionamento Teste" />);

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });

    expect(nav).toBeInTheDocument();

    const list = nav.querySelector('ol');

    expect(list).toBeInTheDocument();
  });

  it('should display separator between items', () => {
    render(<Breadcrumb companyName="Estacionamento Teste" />);

    const listItems = screen.getAllByRole('listitem');

    expect(listItems.length).toBeGreaterThanOrEqual(2);
  });
});
