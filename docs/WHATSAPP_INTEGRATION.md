# Intégration WhatsApp - Confirmation de Commande

## Fonctionnalité

Lorsqu'un client confirme une commande sur la vitrine en ligne, WhatsApp s'ouvre automatiquement avec un message pré-rempli contenant:
- Numéro et détails de commande
- Liste des articles avec quantités et prix
- Sous-total, frais de livraison, total
- Adresse et téléphone de livraison
- Message de confirmation professionnel

## Configuration

Pour activer cette fonctionnalité:
1. Configurer le numéro WhatsApp de la boutique dans le backoffice
2. Le numéro doit être au format international (ex: 224621234567)
3. Sauvegarder

Si aucun numéro WhatsApp n'est configuré, la fonctionnalité est simplement ignorée.

## Fonctionnement Technique

### URL Format
```
https://wa.me/{phoneNumber}?text={encodedMessage}
```

### Comportement
- **Mobile**: Ouvre l'application WhatsApp installée
- **Desktop**: Ouvre WhatsApp Web dans un nouvel onglet
- **Bloqueur de popups**: La commande est créée normalement, mais WhatsApp peut ne pas s'ouvrir

### Non-bloquant
Cette fonctionnalité est conçue pour être **non-bloquante**:
- Si le numéro WhatsApp n'est pas configuré → skip silencieusement
- Si window.open() échoue (bloqueur) → erreur loggée, commande créée
- Si erreur de construction du message → erreur loggée, commande créée

La création de commande n'est JAMAIS empêchée par un problème WhatsApp.

## Format du Message

Template utilisé:
```
🛍️ Nouvelle Commande Confirmée

Bonjour {nomClient}!

Votre commande a été enregistrée avec succès.

📦 Articles commandés:
• {article} x{qty} - {prix} GNF
...

💰 Sous-total: {subtotal} GNF
🚚 Frais de livraison: {frais} GNF
✅ TOTAL: {total} GNF

📍 Adresse de livraison: {adresse}
📞 Téléphone: {tel}

Nous vous contacterons bientôt pour confirmer votre commande.

Merci pour votre confiance! 🙏
{nomBoutique}
```

## Code Source

Fichiers modifiés:
- `src/components/storefront/CartDrawer.tsx` - Fonctions et intégration

Fonctions principales:
- `buildWhatsAppMessage()` - Construit le message formaté
- `openWhatsApp()` - Ouvre l'URL wa.me
- Intégration dans `handleSubmitOrder()` après création de commande

## Tests

### Tests Manuels Recommandés

1. **Commande normale avec WhatsApp**
   - Passer commande
   - Vérifier ouverture WhatsApp
   - Vérifier formatage message
   - Vérifier destinataire correct

2. **Commande sans numéro WhatsApp**
   - Désactiver le numéro dans config
   - Passer commande
   - Vérifier que tout fonctionne sans WhatsApp

3. **Avec bloqueur de popups**
   - Activer bloqueur
   - Passer commande
   - Vérifier que commande est créée

4. **Différents navigateurs**
   - iOS Safari
   - Android Chrome
   - Desktop Chrome/Firefox/Safari

### Résultats Attendus

Tous les tests doivent passer avec:
- Commande créée en base de données
- Panier vidé
- Écran de succès affiché
- WhatsApp ouvert (si numéro configuré et pas de bloqueur)

## Compatibilité Navigateurs

| Navigateur | Version | Support |
|------------|---------|---------|
| iOS Safari | 11+ | ✅ |
| Android Chrome | 60+ | ✅ |
| Desktop Chrome | 60+ | ✅ |
| Desktop Firefox | 60+ | ✅ |
| Desktop Safari | 11+ | ✅ |

## Sécurité

- Numéro WhatsApp nettoyé avec regex (enlève caractères non-numériques)
- Message encodé avec `encodeURIComponent()` (prévention XSS)
- Données utilisateur déjà validées côté backend

## Limitations Connues

- Pas d'images dans le message (limitation wa.me)
- Dépend du numéro WhatsApp configuré
- Peut être bloqué par bloqueurs de popups (non bloquant pour commande)

## Support

Pour toute question ou problème, consulter:
- Spec: `docs/superpowers/specs/2026-07-22-whatsapp-integration-design.md`
- Plan: `docs/superpowers/plans/2026-07-22-whatsapp-integration.md`
