# Pro Cycling Life

Un jeu de gestion de carrière cycliste, de 16 ans à la retraite. Classiques, Grands Tours, rivalités,
dilemmes d'équipe : chaque choix compte.

## Tester en local

```bash
npm install
npm run dev
```

Puis ouvre l'URL affichée dans le terminal (en général `http://localhost:5173`).

## Déployer sur GitHub Pages

### Étape 1 — Créer le dépôt

Crée un nouveau dépôt sur GitHub (public), puis pousse ce dossier dedans :

```bash
git init
git add .
git commit -m "Version initiale"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/NOM-DU-DEPOT.git
git push -u origin main
```

### Étape 2 — Activer GitHub Pages

Dans le dépôt sur GitHub : **Settings → Pages → Build and deployment → Source**, sélectionne
**"GitHub Actions"** (pas "Deploy from a branch").

C'est tout. Le fichier `.github/workflows/deploy.yml` déjà présent dans ce projet construit et publie
le site automatiquement à chaque `push` sur `main`. Le premier déploiement prend 1 à 2 minutes — tu peux
suivre sa progression dans l'onglet **Actions** du dépôt.

Le site sera ensuite accessible à `https://TON-PSEUDO.github.io/NOM-DU-DEPOT/`.

### Mises à jour

À chaque fois que tu modifies le jeu et fais un `git push` sur `main`, le site se redéploie automatiquement.

## Sauvegardes

La progression de chaque joueur est sauvegardée automatiquement dans le `localStorage` de son navigateur.
Chaque joueur garde sa propre carrière en cours (rien n'est partagé entre les visiteurs). Vider le cache
du navigateur ou naviguer en mode privé efface la sauvegarde.

## Structure du projet

```
index.html              point d'entrée HTML
src/main.jsx             démarrage React
src/ProCyclingLife.jsx    le jeu entier (un seul fichier)
vite.config.js            configuration du build
.github/workflows/        déploiement automatique sur GitHub Pages
```

Le jeu tient dans un unique composant React (`src/ProCyclingLife.jsx`) — c'est un choix délibéré pour
rester simple à faire évoluer sans jongler entre des dizaines de fichiers.
