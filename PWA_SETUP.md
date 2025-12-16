# Configuration PWA

## Fichiers créés

1. **manifest.json** - Configuration de l'application PWA
2. **sw.js** - Service Worker pour le cache et le fonctionnement hors ligne
3. **pwa.js** - Script d'enregistrement du service worker et gestion de l'installation

## Icônes nécessaires

Vous devez créer deux fichiers d'icônes dans le répertoire racine :

- **icon-192.png** (192x192 pixels)
- **icon-512.png** (512x512 pixels)

### Comment créer les icônes

1. Créez une image carrée de 512x512 pixels avec votre logo/icône
2. Utilisez un outil en ligne comme :
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
   - https://favicon.io/favicon-converter/
3. Ou utilisez un éditeur d'image (Photoshop, GIMP, Canva, etc.)

### Recommandations pour les icônes

- Fond transparent ou couleur unie
- Logo/icône centré
- Couleurs vives et contrastées
- Design simple et reconnaissable
- Format PNG avec transparence

## Test de l'installation

1. Ouvrez l'application dans Chrome/Edge (desktop ou mobile)
2. Le bouton "Installer l'app" apparaîtra automatiquement
3. Ou utilisez le menu du navigateur :
   - Chrome : Menu (⋮) > Installer l'application
   - Edge : Menu (⋯) > Applications > Installer ce site en tant qu'application
   - Safari iOS : Partage > Sur l'écran d'accueil

## Fonctionnalités PWA

- ✅ Installation sur l'écran d'accueil
- ✅ Mode standalone (sans barre d'adresse)
- ✅ Cache des ressources pour fonctionnement hors ligne
- ✅ Mise à jour automatique du service worker
- ✅ Thème coloré personnalisé

## Déploiement

Pour que la PWA fonctionne correctement, l'application doit être servie en HTTPS (ou localhost pour le développement).

