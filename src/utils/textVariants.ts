import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export const textVariants = cva('', {
  variants: {
    variant: {
      'label': 'text-sm font-medium text-foreground',
      'label-muted': 'text-sm font-medium text-muted-foreground',
      'body': 'text-base text-foreground',
      'body-muted': 'text-sm text-muted-foreground',
      'body-muted-lg': 'text-sm sm:text-base text-muted-foreground',
      'body-medium': 'text-sm sm:text-base font-medium text-card-foreground',
      'body-small': 'text-xs text-muted-foreground',
      'body-small-medium': 'text-xs font-medium text-muted-foreground',
      'heading': 'text-xl font-semibold text-foreground',
      'heading-lg': 'text-xl sm:text-2xl font-semibold text-card-foreground',
      'heading-card': 'text-lg sm:text-xl font-semibold text-card-foreground',
      'price': 'text-lg sm:text-xl font-bold text-primary',
      'error': 'text-sm text-destructive-foreground font-medium',
      'success': 'text-sm text-foreground font-medium',
    },
    size: {
      'sm': 'text-sm',
      'base': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl',
      '2xl': 'text-2xl',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

export type TextVariants = VariantProps<typeof textVariants>;
