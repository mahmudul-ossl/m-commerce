type AuthCardProps = {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-md">
        <h1 className="text-center font-display text-5xl leading-none">{title}</h1>
        {description && <p className="mt-3 text-center text-muted-foreground">{description}</p>}
        <div className="mt-10">{children}</div>
        {footer && <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
