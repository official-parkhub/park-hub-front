import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/utils/cn';

const headingVariants = cva('font-semibold', {
  variants: {
    level: {
      '1': 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground',
      '2': 'text-xl sm:text-2xl font-semibold text-foreground',
      '2-card': 'text-xl sm:text-2xl font-semibold text-card-foreground',
      '2-section': 'text-xl font-semibold text-foreground',
      '3': 'text-lg sm:text-xl font-semibold text-card-foreground',
      '4': 'text-base sm:text-lg font-semibold text-card-foreground',
    },
  },
  defaultVariants: {
    level: '2',
  },
});

export type HeadingProps = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
} & React.HTMLAttributes<HTMLHeadingElement>
& VariantProps<typeof headingVariants>;

const Heading = ({
  ref,
  className,
  level,
  as,
  ...props
}: HeadingProps & { ref?: React.RefObject<HTMLHeadingElement | null> }) => {
  const Component = as || (`h${level || 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
  return (
    <Component
      ref={ref}
      className={cn(headingVariants({ level }), className)}
      {...props}
    />
  );
};
Heading.displayName = 'Heading';

// eslint-disable-next-line react-refresh/only-export-components
export { Heading, headingVariants };
