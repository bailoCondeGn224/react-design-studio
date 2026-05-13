import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  backButton?: boolean;
  backTo?: string;
}

const PageHeader = ({ title, description, action, backButton, backTo }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="flex-1 min-w-0">
        {backButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => backTo ? navigate(backTo) : navigate(-1)}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        )}
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
