'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';

type CreateCompanyFABProps = {
  onClick: () => void;
  className?: string;
};

export default function CreateCompanyFAB({ onClick, className }: CreateCompanyFABProps) {
  const [isVisible] = useState(true);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    onClick();

    setTimeout(() => setIsPressed(false), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Criar nova empresa"
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'flex items-center justify-center',
        'w-14 h-14 sm:w-16 sm:h-16',
        'bg-primary text-primary-foreground',
        'rounded-full',
        'shadow-xl hover:shadow-2xl',
        'transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2',
        'active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',

        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90',

        isPressed && 'scale-90',
        className,
      )}
    >
      <svg
        className="w-6 h-6 sm:w-7 sm:h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      <span className="sr-only">Criar nova empresa</span>
    </button>
  );
}
