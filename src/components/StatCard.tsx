interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "gold" | "accent";
}

const StatCard = ({ title, value, subtitle, icon, trend, variant = "default" }: StatCardProps) => {
  const variants = {
    default: "bg-card border border-border",
    gold: "gradient-gold text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
  };

  const isColored = variant !== "default";

  return (
    <div className={`rounded-xl p-4 sm:p-5 shadow-card animate-fade-in ${variants[variant]}`}>
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
          isColored ? "bg-primary-foreground/20" : "bg-secondary"
        }`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.positive
              ? isColored ? "bg-primary-foreground/20" : "bg-success/10 text-success"
              : isColored ? "bg-primary-foreground/20" : "bg-destructive/10 text-destructive"
          }`}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <p className={`text-xs sm:text-sm font-medium ${isColored ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {title}
      </p>
      <p className="text-xl sm:text-2xl font-heading font-bold mt-1 break-words">{value}</p>
      {subtitle && (
        <p className={`text-xs mt-1 ${isColored ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
