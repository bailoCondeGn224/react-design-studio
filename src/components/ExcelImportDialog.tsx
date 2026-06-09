import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useImportArticles, useDownloadTemplate } from '@/hooks/useImports';
import { ImportResult } from '@/api/imports';

interface ExcelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ExcelImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: ExcelImportDialogProps) {
  const isMobile = useIsMobile();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const importMutation = useImportArticles();
  const downloadMutation = useDownloadTemplate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Valider l'extension
    const validExtensions = ['.xlsx', '.xls', '.zip'];
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      alert('Format de fichier non supporté. Utilisez Excel (.xlsx, .xls) ou ZIP');
      return;
    }

    // Valider la taille (max 50MB pour ZIP, 10MB pour Excel)
    const maxSize = fileExtension === '.zip' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert(`Fichier trop volumineux. Taille maximale: ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;

    const data = await importMutation.mutateAsync(file);
    setResult(data);

    if (data.errors.length === 0 && onSuccess) {
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    }
  };

  const handleDownloadTemplate = () => {
    downloadMutation.mutate();
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onOpenChange(false);
  };

  const content = (
    <div className="space-y-4">
      {/* Télécharger template */}
      <Alert>
        <FileSpreadsheet className="h-4 w-4" />
        <AlertDescription className="ml-2">
          Utilisez notre template Excel pour faciliter l'import
          <Button
            variant="link"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={downloadMutation.isPending}
            className="ml-2 p-0 h-auto"
          >
            <Download className="w-3 h-3 mr-1" />
            {downloadMutation.isPending ? 'Téléchargement...' : 'Télécharger le template'}
          </Button>
        </AlertDescription>
      </Alert>

      {/* Zone d'upload */}
      {!result && (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <input
            type="file"
            id="file-upload"
            accept=".xlsx,.xls,.zip"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">
              {file ? file.name : 'Cliquez pour sélectionner un fichier'}
            </p>
            <p className="text-xs text-muted-foreground">
              Excel (.xlsx, .xls) ou ZIP (avec photos) - Max 50MB
            </p>
          </label>
        </div>
      )}

      {/* Instructions */}
      {!result && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold">Instructions:</p>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• <strong>Sans fournisseur:</strong> Articles créés avec stock initial</li>
            <li>• <strong>Avec fournisseur:</strong> Approvisionnement créé (augmente stock)</li>
            <li>• Si l'article existe, seul l'approvisionnement est créé</li>
            <li>• Les catégories doivent exister dans le système</li>
            <li>• <strong>Avec photos:</strong> Créez un ZIP avec le Excel + dossier "photos/"</li>
          </ul>
        </div>
      )}

      {/* Boutons d'action */}
      {file && !result && (
        <div className="flex gap-2">
          <Button
            onClick={handleImport}
            disabled={importMutation.isPending}
            className="flex-1"
          >
            {importMutation.isPending ? 'Import en cours...' : 'Importer'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setFile(null)}
            disabled={importMutation.isPending}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Progress bar */}
      {importMutation.isPending && (
        <div className="space-y-2">
          <Progress value={undefined} className="w-full" />
          <p className="text-xs text-center text-muted-foreground">
            Import en cours, veuillez patienter...
          </p>
        </div>
      )}

      {/* Résultats */}
      {result && (
        <div className="space-y-4">
          <Alert className={result.errors.length === 0 ? 'border-green-500' : 'border-orange-500'}>
            {result.errors.length === 0 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
            <AlertDescription className="ml-2">
              <p className="font-semibold mb-2">Résultat de l'import:</p>
              <ul className="text-sm space-y-1">
                <li>✅ {result.articlesCreated} article(s) créé(s)</li>
                <li>✅ {result.approvisionnementsCreated} approvisionnement(s) créé(s)</li>
                <li>📊 Total: {result.summary.totalRows} ligne(s) traitée(s)</li>
                {result.errors.length > 0 && (
                  <li className="text-orange-600">
                    ⚠️ {result.errors.length} erreur(s)
                  </li>
                )}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Liste des erreurs */}
          {result.errors.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              <p className="text-sm font-semibold">Erreurs détaillées:</p>
              {result.errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    <p className="font-semibold">
                      Ligne {error.row}
                      {error.codeArticle && ` - ${error.codeArticle}`}
                      {error.nom && ` (${error.nom})`}
                    </p>
                    <ul className="text-xs mt-1">
                      {error.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Boutons après import */}
          <div className="flex gap-2">
            <Button onClick={handleClose} className="flex-1">
              Fermer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
            >
              Nouvel import
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return isMobile ? (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Import Excel Massif</SheetTitle>
          <SheetDescription>
            Importez des milliers d'articles en quelques secondes
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">{content}</div>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Excel Massif</DialogTitle>
          <DialogDescription>
            Importez des milliers d'articles en quelques secondes
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
