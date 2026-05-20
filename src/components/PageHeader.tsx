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
    <div className="mb-3 sm:mb-6">
      {backButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => backTo ? navigate(backTo) : navigate(-1)}
          className="mb-2 -ml-2 h-9"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 w-full sm:w-auto">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
