import { Loader2 } from "lucide-react";
import AppLayout from "./AppLayout";

const LoadingFallback = () => {
  return (
    <AppLayout>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Chargement de la page...</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default LoadingFallback;
