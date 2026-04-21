# Tesco Coffee Checkout — DevOps Practice Project

A small, deliberately simple microservices project built to practice the full DevOps
pipeline end to end: Docker → GitHub Actions → Docker Hub → Helm → ArgoCD → Kubernetes.

## Architecture (5 containers, 1 Docker network)

```
Browser
   │ HTTP :3000
   ▼
┌────────────────┐       ┌──────────────┐       ┌────────────────┐
│  react-nginx   │──────▶│    go-api    │──────▶│    rabbitmq    │
│ (React + nginx)│       │ (Gin / :8080)│       │ (AMQP + mgmt)  │
└────────────────┘       └──────────────┘       └────────────────┘
                                ▲                       │
                                │ consume               │ consume
                                │ payment.result        │ order.created
                                │                       ▼
                         ┌─────────────┐         ┌────────────────┐
                         │             │         │  spring-boot   │
                         │  (in-memory │         │ (Java payment  │
                         │   status)   │         │   processor)   │
                         └─────────────┘         └────────────────┘
                                                        │ JDBC
                                                        ▼
                                                 ┌────────────────┐
                                                 │  postgresql    │
                                                 │ (payments tbl) │
                                                 └────────────────┘
```

**Flow:** React posts card → Go API publishes `order.created` → Spring Boot consumes,
runs mock logic (card ending `0000` → DECLINED, else APPROVED), writes to Postgres,
publishes `payment.result` → Go API updates its in-memory map → React polls and
sees the final status.

## Folder layout

```
.
├── frontend/            React SPA (2 pages: ShopPage, ConfirmationPage)
├── go-api/              Go service (POST /api/checkout, GET /api/order/:id/status)
├── payment-service/     Spring Boot service (RabbitMQ consumer + Postgres writer)
├── db/init.sql          Postgres schema loaded on first boot
├── docker-compose.yml   Orchestrates all 5 containers for local dev
└── README.md
```

## Prerequisites

You only need **Docker Desktop** (macOS/Windows) or **Docker Engine + Compose** (Linux).
No local Node, Go, or Java install required — everything builds inside containers.

## Run everything locally

```bash
# Build all images and start the 5 containers
docker compose up --build

# In another terminal, tail one service's logs
docker compose logs -f spring-boot
```

Once all containers report healthy:

| Service        | URL                                  | Notes                        |
|----------------|--------------------------------------|------------------------------|
| Frontend       | http://localhost:3000                | Main app                     |
| Go API         | http://localhost:8080/health         | Returns `{"status":"ok"}`    |
| RabbitMQ UI    | http://localhost:15672 (guest/guest) | Watch queues + messages live |
| Spring Boot    | http://localhost:8081/actuator/health| Returns `{"status":"UP"}`    |
| Postgres       | localhost:5432 (payments/payments)   | `psql` or any JDBC tool      |

## Try the happy path

1. Open http://localhost:3000
2. Click either coffee product
3. Enter any cardholder name, **card number NOT ending in `0000`**, future expiry, any 3-digit CVV
4. Hit *Place Order* → you should see "Order confirmed!" within ~2 seconds

## Try the declined path

Same flow but use a card number ending in `0000` (e.g. `4242 4242 4242 0000`) → you'll see
"Payment declined".

## Stop / reset

```bash
# Stop all containers (data preserved in a Docker volume)
docker compose down

# Stop and wipe the Postgres volume too (fresh DB next time)
docker compose down -v
```

## What comes next (roadmap)

- **Phase 2** – Production-grade Dockerfiles + tighter image sizes
- **Phase 3** – GitHub Actions CI: build + push images to Docker Hub
- **Phase 4** – Helm chart covering all services
- **Phase 5** – Minikube / kind + ArgoCD GitOps
- **Phase 6** – NGINX Ingress Controller for external routing
- **Phase 7** – One-shot EKS deployment with ALB Ingress (paid, brief)
