import * as React from 'react';
import { cn } from '@/utils/cn';

export type LabelTextProps = {
  muted?: boolean;
} & React.LabelHTMLAttributes<HTMLLabelElement>;

const LabelText = ({
  ref,
  className,
  muted = false,
  ...props
}: LabelTextProps & { ref?: React.RefObject<HTMLLabelElement | null> }) => (
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  <label
    ref={ref}
    className={cn(
      'block text-sm font-medium',
      muted ? 'text-muted-foreground' : 'text-foreground',
      className,
    )}
    {...props}
  />
);
LabelText.displayName = 'LabelText';

export { LabelText };
