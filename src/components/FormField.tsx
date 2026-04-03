import { InputHTMLAttributes, forwardRef } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  as?: "input" | "select" | "textarea";
  children?: React.ReactNode;
}

const inputClasses = "w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors";

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, as = "input", children, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {as === "select" ? (
          <select className={inputClasses} {...(props as any)}>
            {children}
          </select>
        ) : as === "textarea" ? (
          <textarea className={`${inputClasses} min-h-[80px] resize-none`} {...(props as any)} />
        ) : (
          <input ref={ref} className={inputClasses} {...(props as any)} />
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";
export default FormField;
