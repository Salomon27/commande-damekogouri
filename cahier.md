Voici la **version complète et mise à jour des instructions à donner à l’IA**, en intégrant la prévisualisation et la consultation des commandes par période. Tu peux copier directement.

---

**Objectif général**
Créer une application web simple en HTML, CSS et JavaScript pour répertorier les commandes d’une boutique. L’application utilise Supabase comme base de données. Elle doit être rapide, intuitive et pensée pour un usage quotidien. Aucun objectif de paiement ou de gestion complexe.

**Technologies imposées**

* HTML5
* CSS avec Flexbox uniquement
* JavaScript pur
* Supabase comme backend
* Aucune librairie externe ou framework

**Principes UI à respecter**

* Interface minimaliste et facile à comprendre
* Design propre, clair, adapté au mobile
* Peu de couleurs, typographie lisible
* Utilisation de cartes pour l’affichage des commandes
* Navigation simple entre les pages
* Flexbox pour tous les alignements
* Pas de surcharge visuelle

---

### Page 1. Enregistrement d’une commande

**Fonction principale**
Un formulaire permettant d’enregistrer une commande avec une prévisualisation en temps réel.

**Champs du formulaire**

* Numéro du client, obligatoire
* Nom du client, optionnel
* Lieu de livraison, obligatoire
* Date de livraison, obligatoire avec date du jour par défaut
* Description du colis, optionnel
* Montant, obligatoire, numérique

**Prévisualisation en temps réel**

* Une carte de prévisualisation s’affiche à côté ou en dessous du formulaire
* Les informations se mettent à jour pendant la saisie
* Les champs non remplis affichent une valeur par défaut claire
* La carte reprend le même style que les cartes de la liste des commandes

**Validation**

* Vérifier les champs obligatoires avant l’envoi
* Afficher un message simple en cas d’erreur
* Le montant doit être un nombre valide
* Le formulaire ne s’envoie pas si une règle échoue

**Comportement JavaScript**

* Écouter les changements des champs pour la prévisualisation
* Valider les données
* Envoyer la commande vers Supabase
* Afficher un message de succès
* Réinitialiser le formulaire après succès

---

### Page 2. Liste des commandes

**Objectif**
Afficher toutes les commandes enregistrées sous forme de cartes, avec des filtres par période.

**Filtres disponibles**

* Commandes du jour
* Commandes de la semaine
* Commandes du mois

Les filtres doivent être simples, sous forme de boutons ou onglets.

**Affichage des commandes**

* Chaque commande est affichée dans une carte
* Les cartes affichent les informations essentielles

  * Numéro client
  * Lieu de livraison
  * Date
  * Montant
* Disposition en Flexbox, responsive

**Ouverture des détails**

* Un clic sur une carte ouvre les détails complets de la commande
* Affichage sous forme de modal ou page dédiée
* Les détails incluent tous les champs, y compris la description du colis
* Bouton pour fermer et revenir à la liste

---

### Supabase

**Structure de la table commandes**

* id
* numero_client
* nom_client
* lieu_livraison
* date_livraison
* description_colis
* montant
* created_at

**Fonctionnalités Supabase**

* Insertion des commandes
* Lecture des commandes
* Filtrage par date pour jour, semaine et mois
* Utilisation de la clé publique
* Pas d’authentification complexe

---

### Contraintes importantes

* Application utilisée uniquement pour répertorier les commandes
* Pas de paiement
* Pas de facturation
* Code simple, lisible et bien structuré
* Optimisé pour un usage mobile
* Le projet doit rester léger et maintenable

---
