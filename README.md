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
3. **`SEED_ADMIN_EMAIL`** / **`SEED_ADMIN_PASSWORD`** — utilisés par `npm run db:seed` pour créer un compte administrateur initial (mot de passe hashé en base). En option : **`SEED_RESET_ADMIN_PASSWORD=1`** pour forcer la mise à jour du mot de passe admin au prochain seed.
4. **`INVOICE_*`** (optionnel) — informations affichées sur le PDF.

## Authentification

Les comptes sont stockés en base (modèle **`User`** : e-mail unique, mot de passe en **bcrypt**).

- Connexion : `/login`
- Inscription : `/register` (mot de passe ≥ 8 caractères)

Après le premier seed, connectez-vous avec `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (valeurs par défaut dans `.env.example` : `admin@local.dev` / `changeme123` — à changer en production).

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
2. Ajouter **`AUTH_SECRET`**, **`SEED_ADMIN_*`** (ou créer des utilisateurs autrement après migration), et les variables `INVOICE_*` si besoin.
3. Commande de build : `prisma migrate deploy && next build` (configurer dans Vercel comme « Build Command »), ou exécuter les migrations une fois manuellement puis `next build`. Exécuter le seed une fois si vous en avez besoin.
4. S’assurer que `AUTH_URL` correspond à l’URL de production si les redirections de connexion posent problème.

## Fonctionnalités

- **Clients** avec tarif horaire HT par défaut.
- **Saisies** : date, durée en heures, client, catégorie ; `appliedFactor` est figé à l’enregistrement.
- **Devis** : période + client → lignes agrégées par catégorie, TVA optionnelle, PDF via `/api/quotes/[id]/pdf` (authentifié).

## Structure

Projet séparé du portfolio, même esprit visuel (tokens CSS `data-theme`, polices Inter / Fraunces / JetBrains Mono, grille en fond).
