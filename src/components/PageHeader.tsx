import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <div className="flex items-start justify-between mb-8">
    <div>
      <h1 className="text-3xl font-heading font-bold text-foreground">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default PageHeader;
