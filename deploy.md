# Déploiement en production

Guide pour mettre en ligne **heures-client** (Next.js 16, App Router, NextAuth v5, Prisma). Cible typique : **Vercel** + base **PostgreSQL** (Neon, Supabase, Railway, etc.).

## Prérequis

- Node 20+
- Un compte sur l’hébergeur front (ex. Vercel) et une instance **PostgreSQL**
- Un domaine ou l’URL fournie par l’hébergeur (important pour les cookies / redirections)

## 1. Base de données : passer de SQLite à PostgreSQL

En local, le dépôt utilise souvent SQLite (`DATABASE_URL="file:./dev.db"` dans `.env`, fichier sous `prisma/`). En production, utilisez **PostgreSQL**.

1. Dans `prisma/schema.prisma`, adaptez le bloc `datasource` :

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Créez la base (ex. Neon) et copiez l’URL **avec** paramètres SSL si le fournisseur l’exige (souvent `?sslmode=require`).

3. Générez et appliquez les migrations sur cette base :

   ```bash
   export DATABASE_URL="postgresql://…"
   npx prisma migrate deploy
   ```

4. **Première mise en ligne** : exécutez le seed si vous voulez un admin + catégories par défaut (une fois, depuis votre machine CI ou localement avec la même `DATABASE_URL`) :

   ```bash
   npm run db:seed
   ```

   Pensez à retirer ou sécuriser `SEED_ADMIN_PASSWORD` après coup.

Si vous réutilisez un schéma déjà migré sur une nouvelle instance vide, `prisma migrate deploy` suffit.

## 2. Variables d’environnement (production)

À configurer sur l’hébergeur (ex. Vercel → _Settings → Environment Variables_).

| Variable               | Obligatoire          | Rôle                                                                                                                   |
| ---------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | Oui                  | URL PostgreSQL                                                                                                         |
| `AUTH_SECRET`          | **Oui en prod**      | Secret NextAuth (`openssl rand -base64 32`)                                                                            |
| `APP_OWNER_EMAIL`      | Fortement recommandé | E-mail du compte « propriétaire » (gestion clients / devis). Même valeur que l’utilisateur seedé ou votre compte réel. |
| `AUTH_URL`             | Si besoin            | URL canonique du site, ex. `https://monapp.vercel.app` — utile si les redirections de connexion échouent               |
| `SEED_ADMIN_EMAIL`     | Pour le seed         | Création du premier utilisateur                                                                                        |
| `SEED_ADMIN_PASSWORD`  | Pour le seed         | À ne pas laisser en clair durablement après init                                                                       |
| `INVOICE_COMPANY_NAME` | Optionnel            | PDF devis                                                                                                              |
| `INVOICE_SIRET`        | Optionnel            | PDF                                                                                                                    |
| `INVOICE_VAT_NUMBER`   | Optionnel            | PDF                                                                                                                    |
| `INVOICE_ADDRESS`      | Optionnel            | PDF                                                                                                                    |

Le code utilise `trustHost: true` pour NextAuth ; en cas de souci de callback, vérifiez `AUTH_URL` et l’URL réellement servie (HTTPS).

## 3. Build sur Vercel

- **Install command** : `npm install` (déjà le défaut ; `postinstall` lance `prisma generate`).
- **Build command** : appliquer les migrations puis construire Next :

  ```bash
  prisma migrate deploy && next build
  ```

  Sur Vercel, utilisez la même ligne comme _Build Command_ (les binaires Prisma sont disponibles après `npm install`).

- **Output** : application Next standard (`next start` est géré par Vercel sur le build serverless / Node).

Si vous préférez **ne pas** migrer à chaque build : exécutez `prisma migrate deploy` une fois manuellement (CLI locale ou job CI) après chaque déploiement de schéma, et gardez `next build` seul — documentez-le pour l’équipe pour éviter les oublis.

## 4. Après le premier déploiement

1. Vérifier que le site répond en HTTPS.
2. Se connecter avec le compte créé par le seed (ou créer un utilisateur via `/register` si vous n’utilisez pas le seed).
3. Aligner `APP_OWNER_EMAIL` sur l’e-mail du compte qui doit tout administrer.
4. Tester une génération de PDF (route `/api/quotes/[id]/pdf`) en étant connecté.

## 5. Dépendances spécifiques

`next.config.ts` déclare `serverExternalPackages: ["@react-pdf/renderer"]` : à conserver pour que la génération PDF fonctionne sur la partie serveur.

## 6. Autres hébergeurs (aperçu)

- **Docker** : image Node 20, `npm ci`, `prisma migrate deploy`, `next build`, `next start`, variables d’env injectées au runtime.
- **Plateforme Node classique** : même séquence ; assurez un process long (pas uniquement un build statique pur, car l’app utilise l’API et Prisma côté serveur).

Pour le détail fonctionnel (rôles, seed, SQLite local), voir le [README](./README.md).
