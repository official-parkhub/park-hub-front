import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/utils/cn';

const textVariants = cva('', {
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
  },
  defaultVariants: {
    variant: 'body',
  },
});

export type TextProps = {
  as?: 'p' | 'span' | 'div';
} & React.HTMLAttributes<HTMLElement>
& VariantProps<typeof textVariants>;

const Text = ({
  ref,
  className,
  variant,
  as: Component = 'p',
  ...props
}: TextProps & { ref?: React.RefObject<HTMLElement | null> }) => {
  return (
    <Component
      ref={ref as any}
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  );
};
Text.displayName = 'Text';

// eslint-disable-next-line react-refresh/only-export-components
export { Text, textVariants };
