# MVP Runbook

- Prereqs: Docker Desktop, Docker Compose, Node.js (for non-Docker path)
- Stack: NestJS MVP + PostgreSQL + Prisma + S3-compatible storage + Redis (optional)
- Local run:
  1. docker-compose up -d --build
  2. docker-compose exec app npx prisma migrate dev --name init
  3. docker-compose exec app npx prisma generate
  4. curl -s http://localhost:3000/healthz
- Endpoints to test (core):
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/user/:id
  - POST /api/posts/create
  - GET /api/posts/feed
  - POST /api/stories/upload
  - GET /api/stories/feed
  - POST /api/chat/send
  - GET /api/chat/messages
  - GET /api/notifications
- Observability: tail logs, ensure health endpoints respond, verify 4xx/5xx responses are structured
- Next steps: wire Socket.IO with Redis, add rate limiting, add readiness probes, and add a smoke test suite
