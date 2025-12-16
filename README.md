# Application de Gestion des Commandes

Application web simple pour répertorier les commandes d'une boutique, utilisant Supabase comme backend.

## Technologies

- HTML5
- CSS3 (Flexbox uniquement)
- JavaScript pur
- Supabase

## Configuration

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre URL et votre clé publique (anon key)

### 2. Créer la table dans Supabase

Exécutez cette requête SQL dans l'éditeur SQL de Supabase :

```sql
CREATE TABLE commandes (
  id BIGSERIAL PRIMARY KEY,
  numero_client TEXT NOT NULL,
  nom_client TEXT,
  lieu_livraison TEXT NOT NULL,
  date_livraison DATE NOT NULL,
  description_colis TEXT,
  montant DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security) si nécessaire
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre la lecture et l'écriture publiques
-- (À adapter selon vos besoins de sécurité)
CREATE POLICY "Allow public read access" ON commandes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON commandes
  FOR INSERT WITH CHECK (true);
```

### 3. Configurer les clés Supabase

Ouvrez le fichier `config.js` et remplacez :

- `VOTRE_URL_SUPABASE` par l'URL de votre projet Supabase
- `VOTRE_CLE_PUBLIQUE_SUPABASE` par votre clé publique (anon key)

Exemple :
```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Utilisation

1. Ouvrez `index.html` dans un navigateur web
2. Utilisez la navigation pour basculer entre :
   - **Nouvelle Commande** : Enregistrer une nouvelle commande avec prévisualisation
   - **Liste des Commandes** : Consulter les commandes avec filtres par période

## Fonctionnalités

### Page d'enregistrement
- Formulaire avec validation
- Prévisualisation en temps réel
- Champs obligatoires : numéro client, lieu de livraison, date, montant
- Champs optionnels : nom client, description du colis

### Page de liste
- Filtres par période : aujourd'hui, cette semaine, ce mois
- Affichage en cartes
- Clic sur une carte pour voir les détails complets

## Structure des fichiers

- `index.html` : Structure HTML de l'application
- `styles.css` : Styles CSS avec Flexbox
- `app.js` : Logique JavaScript
- `config.js` : Configuration Supabase
- `README.md` : Ce fichier

## Notes

- L'application est optimisée pour mobile
- Aucune librairie externe n'est utilisée (sauf le SDK Supabase via CDN)
- Le design est minimaliste et épuré
- Les données sont stockées dans Supabase



