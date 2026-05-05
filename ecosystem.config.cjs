/**
 * PM2 — production Next.js
 *
 * Sur le serveur (depuis la racine du dépôt) :
 *   npm ci && npx prisma migrate deploy && npm run build
 *   pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup
 *
 * Les secrets (DATABASE_URL, AUTH_SECRET, etc.) sont lus depuis `.env` au runtime
 * par Next.js tant que cwd pointe sur le projet.
 */
module.exports = {
  apps: [
    {
      name: "heures-client",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        // Aligner avec Nginx (proxy_pass) si 3000/3001 sont pris
        PORT: 3002,
      },
    },
  ],
};
