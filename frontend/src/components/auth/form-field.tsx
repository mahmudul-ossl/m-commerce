import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FormFieldProps = React.ComponentProps<typeof Input> & {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  /** Extra content on the label row, e.g. a "Forgot password?" link. */
  aside?: React.ReactNode;
};

export function FormField({ label, error, hint, aside, id, className, ...props }: FormFieldProps) {
  const fieldId = id ?? props.name;
  const errorId = `${fieldId}-error`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={fieldId} className="text-sm font-medium">
          {label}
        </label>
        {aside}
      </div>
      <Input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn("h-11 text-base md:text-sm", className)}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
