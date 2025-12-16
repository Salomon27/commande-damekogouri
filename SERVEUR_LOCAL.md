# Comment démarrer le serveur local

## ⚠️ IMPORTANT
L'application **DOIT** être servie via HTTP/HTTPS, pas en ouvrant directement le fichier HTML (file://). Cela est nécessaire pour :
- Le Service Worker (PWA)
- Les requêtes CORS
- L'accès au manifest.json
- Le fonctionnement de Supabase

## Option 1 : Script Windows (Le plus simple)

**Double-cliquez sur `demarrer-serveur.bat`** dans l'explorateur Windows.

Puis ouvrez votre navigateur à : `http://localhost:3000`

## Option 2 : Serveur Node.js (Manuel)

1. Assurez-vous d'avoir Node.js installé
2. Dans le terminal, naviguez vers le dossier du projet
3. Exécutez :
```bash
node server.js
```
4. Ouvrez votre navigateur à : `http://localhost:3000`

## Option 2 : Python (si Node.js n'est pas installé)

### Python 3 :
```bash
python -m http.server 3000
```

### Python 2 :
```bash
python -m SimpleHTTPServer 3000
```

Puis ouvrez : `http://localhost:3000`

## Option 3 : PHP

```bash
php -S localhost:3000
```

Puis ouvrez : `http://localhost:3000`

## Option 4 : Extension VS Code

Installez l'extension "Live Server" dans VS Code, puis :
1. Clic droit sur `index.html`
2. Sélectionnez "Open with Live Server"

## Option 5 : Extension Chrome

Installez l'extension "Web Server for Chrome" depuis le Chrome Web Store.

## Vérification

Une fois le serveur démarré, vous devriez voir :
- ✅ Pas d'erreurs CORS dans la console
- ✅ Le Service Worker s'enregistre correctement
- ✅ Supabase fonctionne
- ✅ L'application peut être installée comme PWA

