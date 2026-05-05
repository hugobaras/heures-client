# Compteur d’heures client

Application Next.js (style proche du portfolio) pour suivre les heures par client, appliquer des coefficients par catégorie (ex. « Travail ensemble » à 50 %), persister avec **Prisma** (SQLite en local via `file:./dev.db`, PostgreSQL en production), et générer des **devis en PDF**.

## Prérequis

- Node 20+
- Rien d’autre en local si vous utilisez SQLite (`DATABASE_URL="file:./dev.db"` dans `.env`). Pour la prod, une base **PostgreSQL** et une `DATABASE_URL` adaptée.

## Installation

```bash
cd heures-client
npm install
cp .env.example .env
```

Renseignez `.env` :

1. **`DATABASE_URL`** — par défaut SQLite : `file:./dev.db` (fichier sous `prisma/`). En production, utiliser une URL PostgreSQL (`postgresql://…`).
2. **`AUTH_SECRET`** — secret pour les sessions (ex. `openssl rand -base64 32`).
3. **`APP_OWNER_EMAIL`** — e-mail du compte « propriétaire » : seul ce profil accède au tableau de bord, aux clients, aux saisies et à la création de devis. Les autres utilisateurs ne voient que **Mes devis** (devis dont la fiche client a le même e-mail que leur compte, en minuscules). Laissez vide en dev pour donner l’accès complet à tous les comptes.
4. **`SEED_ADMIN_EMAIL`** / **`SEED_ADMIN_PASSWORD`** — utilisés par `npm run db:seed` pour créer un compte administrateur initial (mot de passe hashé en base). En option : **`SEED_RESET_ADMIN_PASSWORD=1`** pour forcer la mise à jour du mot de passe admin au prochain seed.
5. **`INVOICE_*`** (optionnel) — informations affichées sur le PDF.

## Authentification et rôles

Les comptes sont en base (**`User`**, e-mail unique, mot de passe **bcrypt**).

- Connexion : `/login`, inscription : `/register` (mot de passe ≥ 8 caractères).
- Avec **`APP_OWNER_EMAIL`** renseigné : seul ce compte gère clients, saisies et création de devis ; les autres ne voient que leurs devis (e-mail utilisateur = e-mail du **client** sur le devis) et peuvent télécharger le PDF.
- **`APP_OWNER_EMAIL` vide** : tout utilisateur connecté a l’accès complet (utile en développement).

Après le premier seed, connectez-vous avec `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (voir `.env.example`) et alignez **`APP_OWNER_EMAIL`** sur votre e-mail propriétaire si vous activez le mode restreint.

## Base de données

```bash
npx prisma migrate deploy
npm run db:seed
```

Le seed crée les catégories **Développement / standard** (coefficient 1) et **Travail ensemble** (0,5), plus le compte admin décrit ci-dessus.

En développement, vous pouvez utiliser `npx prisma migrate dev` à la place de `deploy`.

## Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) et se connecter.

## Déploiement (ex. Vercel + Neon)

1. Créer un projet Neon (ou autre Postgres), copier `DATABASE_URL` dans les variables d’environnement Vercel.
2. Ajouter **`AUTH_SECRET`**, **`APP_OWNER_EMAIL`** (recommandé en production), **`SEED_ADMIN_*`** si vous utilisez le seed, et les variables `INVOICE_*` si besoin.
3. Commande de build : `prisma migrate deploy && next build` (configurer dans Vercel comme « Build Command »), ou exécuter les migrations une fois manuellement puis `next build`. Exécuter le seed une fois si vous en avez besoin.
4. S’assurer que `AUTH_URL` correspond à l’URL de production si les redirections de connexion posent problème.

## Fonctionnalités

- **Clients** avec tarif horaire HT par défaut.
- **Saisies** : date, durée en heures, client, catégorie ; `appliedFactor` est figé à l’enregistrement.
- **Devis** : période + client → lignes agrégées par catégorie, TVA optionnelle, PDF via `/api/quotes/[id]/pdf` (authentifié).

## Structure

Projet séparé du portfolio, même esprit visuel (tokens CSS `data-theme`, polices Inter / Fraunces / JetBrains Mono, grille en fond).
