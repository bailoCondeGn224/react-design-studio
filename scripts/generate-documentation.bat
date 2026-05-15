@echo off
REM Script Windows pour générer automatiquement la documentation PDF avec captures d'écran

echo =========================================
echo   Génération Documentation PDF
echo   Walli Industrie - Gestion Boutique
echo =========================================
echo.

echo IMPORTANT: Assurez-vous que l'application est lancée sur http://localhost:5173
echo.

set /p confirm="L'application est-elle lancée ? (O/N) "
if /i not "%confirm%"=="O" (
    echo.
    echo Veuillez d'abord lancer l'application avec: npm run dev
    exit /b 1
)

echo.
echo Etape 1/2: Génération des captures d'écran...
echo Cela peut prendre quelques minutes...
echo.

call npx tsx scripts/generate-screenshots.ts

if errorlevel 1 (
    echo.
    echo Erreur lors de la génération des captures d'écran
    exit /b 1
)

echo.
echo Etape 2/2: Génération du PDF...
echo.

call npx tsx scripts/generate-pdf.ts

if errorlevel 1 (
    echo.
    echo Erreur lors de la génération du PDF
    exit /b 1
)

echo.
echo =========================================
echo Documentation générée avec succès !
echo =========================================
echo.
echo Fichiers générés:
echo    - documentation\screenshots\*.png
echo    - documentation\Guide-Utilisateur-Walli-Industrie.pdf
echo.

pause
