import { Loader2 } from "lucide-react";

const LoadingFallback = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
