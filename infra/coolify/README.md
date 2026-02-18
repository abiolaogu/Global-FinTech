# Coolify Deployment

Use this folder to deploy AtlasX with Coolify.

## Files

- `docker-compose.coolify.yaml`: Compose stack imported into Coolify.
- `.env.coolify.example`: Required variables.

## Deployment Steps

1. In Coolify, create a new Docker Compose application.
2. Point to `infra/coolify/docker-compose.coolify.yaml`.
3. Add environment variables from `.env.coolify.example`.
4. Configure domains/TLS in Coolify:
   - Web: `app.global-fintech.com`
   - API: `api.global-fintech.com`
   - AI Advisor: `ai.global-fintech.com`

## Notes

- Keep PostgreSQL and Redis external for production scalability.
- Use Coolify secret variables for all sensitive values.
