import * as React from 'react';
import { cn } from '../../lib/utils';

const Alert = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'destructive';
}
>(({ className, variant = 'default', ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'relative w-full rounded-lg border p-4',
            variant === 'destructive'
                ? 'border-red-500 bg-red-500/10 text-red-600'
                : 'border-blue-500 bg-blue-500/10 text-blue-600',
            className
        )}
        {...props}
    />
));
Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm leading-snug', className)}
        {...props}
    />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };