# CLAUDE.md - Gruppo Cestari

Sito corporate multilingue per Gruppo Cestari - Holding multisettoriale.

## Quick Info

| | |
|---|---|
| **Dominio** | cestari.fodivps1.cloud |
| **Porta PM2** | 3016 |
| **PostgreSQL** | localhost:5442 |
| **Redis** | localhost:6387 |
| **MinIO Bucket** | gruppo-cestari |

## Stack

- Next.js 15 + React 19 + TypeScript 5.7
- Tailwind CSS 4 + Shadcn/ui
- Prisma 6 + PostgreSQL 18
- Redis 8 (sessioni, cache)
- NextAuth v5 (autenticazione)
- next-intl (i18n: IT/EN/FR)
- tRPC (API type-safe)
- MinIO (storage documenti)
- Framer Motion (animazioni)

## Struttura

```
src/
├── app/
│   └── [locale]/
│       ├── (public)/     # Sito pubblico
│       ├── (auth)/       # Login, register
│       ├── (portal)/     # Area riservata clienti/partner
│       └── (admin)/      # Dashboard admin
├── components/
│   ├── ui/               # Shadcn components
│   ├── public/           # Componenti sito pubblico
│   ├── portal/           # Componenti area riservata
│   └── admin/            # Componenti admin
├── lib/                  # Utils, db, auth, storage
├── server/               # tRPC routers
├── i18n/                 # Configurazione i18n
└── types/                # TypeScript types
```

## Comandi

```bash
# Development
npm run dev

# Build
npm run build

# Start (production)
npm run start

# Database
npm run db:push      # Push schema
npm run db:generate  # Genera client
npm run db:studio    # Prisma Studio
npm run db:seed      # Seed dati

# Type check
npm run type-check
npm run lint
```

## Ruoli Utente

| Ruolo | Accesso |
|-------|---------|
| SUPERADMIN | Tutto |
| ADMIN | Dashboard, contenuti, utenti |
| EDITOR | Solo contenuti |
| PARTNER | Area riservata (propri dati) |
| CLIENT | Area riservata (propri dati) |

## Funzionalità

- **Sito pubblico** - Home, Chi siamo, Servizi, Sostenibilità, News, Contatti
- **Sistema bandi** - Filtri, ricerca, notifiche, candidature
- **Area riservata** - Dashboard, documenti, candidature
- **Blog/News** - Categorie, tag, multilingua
- **Portfolio progetti** - Filtri settore/paese, case study
- **Form consulenza** - Wizard multi-step con upload
- **Dashboard admin** - CRUD contenuti, utenti, analytics

## Database

Schema principale in `prisma/schema.prisma`. Tabelle principali:
- User, Account, Session (auth)
- Page, PageTranslation (pagine)
- News, NewsTranslation, NewsCategory, Tag (blog)
- Project, ProjectTranslation (portfolio)
- Bando, BandoTranslation, BandoApplication (bandi)
- Document (storage)
- ConsultationForm (richieste consulenza)
- Contact, NewsletterSubscriber (contatti)
- Office, Subsidiary (sedi e società)

## Multi-lingua

- Routing: path-based (`/en/`, `/fr/`)
- UI: file JSON in `messages/`
- Contenuti DB: tabelle `*Translation`
- Locales: it (default), en, fr

## Storage (MinIO)

```
gruppo-cestari/
├── public/           # Immagini pubbliche
├── documents/        # Documenti area riservata
└── bandi/            # Allegati bandi
```

## Deploy

```bash
# Build e avvia
npm run build
pm2 start ecosystem.config.cjs
pm2 save

# Restart
pm2 restart gruppo-cestari

# Logs
pm2 logs gruppo-cestari
```

## Credenziali

| Account | Email | Password | Ruolo |
|---------|-------|----------|-------|
| **Admin** | admin@gruppocestari.com | AdminCestari2025 | SUPERADMIN |

## URLs

| Area | URL |
|------|-----|
| Homepage | https://cestari.fodivps1.cloud |
| Login | https://cestari.fodivps1.cloud/login |
| Registrazione | https://cestari.fodivps1.cloud/register |
| Portale | https://cestari.fodivps1.cloud/portal |
| Admin | https://cestari.fodivps1.cloud/admin |

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| App non raggiungibile | `pm2 status`, verifica porta 3016 |
| DB connection error | `docker ps`, verifica porta 5442 |
| Build fallisce | `npm run type-check` |
| Traduzioni mancanti | Verifica file in `messages/` |
