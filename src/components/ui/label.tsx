'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { textVariants } from '@/utils/textVariants';

export type LabelProps = {
  muted?: boolean;
} & React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = ({
  ref,
  className,
  muted = false,
  ...props
}: LabelProps & { ref?: React.RefObject<HTMLLabelElement | null> }) => (
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  <label
    ref={ref}
    className={cn(
      textVariants({ variant: muted ? 'label-muted' : 'label' }),
      'leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className,
    )}
    {...props}
  />
);
Label.displayName = 'Label';

export { Label };
