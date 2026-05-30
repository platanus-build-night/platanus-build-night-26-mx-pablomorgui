# CLAUDE.md — Mundialin Portal

Portal de inteligencia de precios para boletos del Mundial 2026.

## Contexto

Este proyecto es el frontend del sistema wc_bot. Comparten la misma DB de Supabase.
- **wc_bot**: extrae ofertas de grupos de WhatsApp
- **Este proyecto**: portal web para explorar precios, gestionar ofertas (sellers) y alertas

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS (estilo neobrutalist)
- Supabase (PostgreSQL)
- Auth con JWT (jose)

## Estructura

```
src/
├── app/
│   ├── (auth)/login/       # Login page
│   ├── (dashboard)/        # Páginas autenticadas
│   │   ├── inteligencia/   # Explorar precios de partidos
│   │   ├── partidos/       # Mis ofertas (sellers only)
│   │   └── alertas/        # Mis alertas de precio
│   └── api/auth/           # Auth endpoints
├── components/
│   ├── ui/                 # Componentes base (button, input, card...)
│   └── nav.tsx             # Navegación principal
└── lib/
    ├── auth.ts             # Autenticación JWT
    ├── supabase.ts         # Cliente Supabase
    ├── constants.ts        # Equipos, categorías, monedas
    └── utils.ts            # cn() helper
```

## Usuarios

Tabla `users` con roles:
- `buyer`: solo puede ver inteligencia y alertas
- `seller`: puede ver todo + gestionar sus ofertas
- `both`: comprador que también vende

Los sellers tienen un `premium_seller_id` que los vincula a `premium_sellers` de wc_bot.

## Reglas

- TypeScript estricto, nunca `any`
- Imports con `@/` alias
- Usar componentes de `@/components/ui/`
- No crear archivos de documentación sin que lo pidan
- Mantener el estilo neobrutalist (bordes gruesos, sombras sólidas, colores mostaza)

## Fases del proyecto

- [x] Fase 0: Setup proyecto, estructura, conexión Supabase
- [ ] Fase 1: Tabla users, auth email/password
- [ ] Fase 2: Layout + navegación con placeholders
- [ ] Fase 3: Migrar portal vendedores
- [ ] Fase 4: Inteligencia de precios
- [ ] Fase 5: Detalle de partido
- [ ] Fase 6: Sistema de alertas
- [ ] Fase 7: WhatsApp + envío de alertas

## Desarrollo

```bash
# Instalar
pnpm install

# Desarrollo
pnpm dev

# Build
pnpm build
```
