# Session Handoff — Tesco Coffee Checkout DevOps Project

## Where we are: End of Phase 3 (K8s manifests written, ready to deploy)

## Project goal (5-phase roadmap)

1. **Phase 1 — DONE.** Local dev with docker-compose (5 containers: react-nginx, go-api, rabbitmq, spring-boot, postgres)
2. **Phase 2 — DONE.** Production Dockerfiles
3. **Phase 3 — IN PROGRESS.** K8s YAMLs written. Need to push images → create Kind cluster → apply.
4. **Phase 4 — TODO.** Convert YAMLs to a Helm chart
5. **Phase 5 — TODO.** Install ArgoCD for GitOps
6. **Phase 6 — TODO.** GitHub Actions CI (build + push on every commit)
7. **Phase 7 — OPTIONAL.** Short EKS demo with ALB Ingress

## Key decisions locked in

- **Docker Hub username:** `bhargav2806`
- **Local K8s:** Kind (single-node)
- **Namespaces:** `checkout`, `payment`, `messaging`
- **Postgres:** StatefulSet + 1Gi PVC (data persists across pod restarts)
- **RabbitMQ:** plain Deployment (messages ephemeral, fine for learning)
- **No Redis** — go-api uses an in-memory `map[string]string` + RWMutex
- **Ingress host:** `tesco.localtest.me` (resolves to 127.0.0.1 automatically)
- **Comments in files:** native per language (`//` Go/Java, `#` YAML/Docker, `--` SQL), short and beginner-friendly
- **All K8s YAMLs slimmed down** — no probes, no resource limits, no named ports (can re-add in Helm later)

## Current file layout

```
.
├── frontend/                        React + Vite + nginx
├── go-api/                          Go Gin service (Dockerfile uses `go mod tidy`)
├── payment-service/                 Spring Boot service
├── db/init.sql
├── docker-compose.yml
├── k8s/
│   ├── README.md                    Apply order + debug commands
│   ├── kind-config.yaml             1-node Kind with 80/443 host mapping
│   ├── 00-namespaces.yaml
│   ├── messaging/
│   │   ├── 10-rabbitmq-secret.yaml
│   │   └── 11-rabbitmq.yaml
│   ├── payment/
│   │   ├── 00-rabbitmq-client-secret.yaml    (copy — secrets don't cross NS)
│   │   ├── 10-postgres-secret.yaml
│   │   ├── 11-postgres-configmap.yaml        (init.sql)
│   │   ├── 12-postgres.yaml                  (StatefulSet + PVC + headless Service)
│   │   └── 20-spring-boot.yaml
│   ├── checkout/
│   │   ├── 00-rabbitmq-client-secret.yaml    (copy)
│   │   ├── 10-go-api.yaml
│   │   └── 20-react-nginx.yaml
│   └── ingress/
│       └── 99-ingress.yaml          tesco.localtest.me → react-nginx
└── SESSION_NOTES.md                 this file
```

## Last thing we did

- Hit a `go: updates to go.mod needed; to update it: go mod tidy` error when running `docker build -t bhargav2806/tesco-go-api:latest ./go-api`
- **Fix applied:** edited `go-api/Dockerfile` to replace `COPY go.mod go.sum ./` + `RUN go mod download` with `COPY . .` + `RUN go mod tidy` (slower but always consistent)
- User had NOT yet rerun the build

## Next steps (pick up here tomorrow)

### Step 1 — Push images to Docker Hub

```bash
# (already logged in with PAT)
docker build -t bhargav2806/tesco-go-api:latest          ./go-api
docker build -t bhargav2806/tesco-payment-service:latest ./payment-service
docker build -t bhargav2806/tesco-react-nginx:latest     ./frontend

docker push bhargav2806/tesco-go-api:latest
docker push bhargav2806/tesco-payment-service:latest
docker push bhargav2806/tesco-react-nginx:latest
```

Check https://hub.docker.com/u/bhargav2806 — 3 repos should be visible.

### Step 2 — Create Kind cluster + install Ingress

```bash
kind create cluster --name tesco --config k8s/kind-config.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s
```

### Step 3 — Apply YAMLs (order matters — namespace first)

```bash
kubectl apply -f k8s/00-namespaces.yaml
kubectl apply -f k8s/messaging/
kubectl apply -f k8s/payment/
kubectl apply -f k8s/checkout/
kubectl apply -f k8s/ingress/

kubectl get pods -A -w      # watch everything become Running
```

### Step 4 — Smoke test

Open http://tesco.localtest.me and repeat the happy-path + declined-path tests from Phase 1.

### Step 5 — Phase 4 (Helm)

Convert the YAMLs into a single Helm chart with `values.yaml` for image tags, replica counts, and the probe/resource settings we trimmed out.

## Known minor issues / watch-outs

- **Image tag is `:latest`.** Kind will happily cache it; if you re-push after changes, you'll need `kubectl rollout restart deployment/<name> -n <ns>` to force pull.
- **Secrets duplicated across namespaces.** Known limitation — external-secrets would fix this but is overkill for learning.
- **Spring Boot takes ~30s to start.** Without readiness probes, it may show up in Services a bit too early. If you see `Connection refused` to Postgres/RabbitMQ in Spring Boot logs for the first 30s, that's expected and self-heals.

## Pending tasks (from task list)

- #15 [in_progress] Verify kubectl + install Kind
- #21 [pending] Push images to Docker Hub
- #22 [pending] Create Kind cluster + install ingress-nginx
- #23 [pending] Apply YAMLs + smoke test
- Phase 4+ tasks not yet created
