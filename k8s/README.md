# Phase 3 — Kubernetes Manifests

Raw K8s YAMLs for running the whole stack on a local **Kind** cluster.
(Helm chart comes next in Phase 4.)

## File layout

```
k8s/
├── kind-config.yaml            Single-node Kind cluster with 80/443 host ports
├── 00-namespaces.yaml          3 namespaces: checkout, payment, messaging
├── messaging/
│   ├── 10-rabbitmq-secret.yaml     guest/guest admin creds
│   └── 11-rabbitmq.yaml            Deployment + Service (5672 amqp, 15672 mgmt UI)
├── payment/
│   ├── 00-rabbitmq-client-secret.yaml   copy of RMQ creds (secrets don't cross NS)
│   ├── 10-postgres-secret.yaml          payments/payments DB creds
│   ├── 11-postgres-configmap.yaml       init.sql mounted at /docker-entrypoint-initdb.d
│   ├── 12-postgres.yaml                 StatefulSet + headless Service + 1Gi PVC
│   └── 20-spring-boot.yaml              Deployment + Service (actuator health)
├── checkout/
│   ├── 00-rabbitmq-client-secret.yaml   copy of RMQ creds
│   ├── 10-go-api.yaml                   Deployment + Service (8080)
│   └── 20-react-nginx.yaml              Deployment + Service (80)
└── ingress/
    └── 99-ingress.yaml         Ingress -> react-nginx on tesco.localtest.me
```

## Prerequisites (one-time)

```bash
# Verify tools
kubectl version --client
kind version
helm version         # used next phase

# Install if missing (macOS)
brew install kind
brew install helm
```

## One-shot setup

```bash
# 1) Create the cluster with the port mappings Ingress needs
kind create cluster --name tesco --config k8s/kind-config.yaml

# 2) Install the NGINX Ingress Controller (official Kind manifest)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# 3) Wait for the ingress controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s

# 4) Apply manifests in order (numeric prefixes make this safe)
kubectl apply -f k8s/00-namespaces.yaml
kubectl apply -f k8s/messaging/
kubectl apply -f k8s/payment/
kubectl apply -f k8s/checkout/
kubectl apply -f k8s/ingress/

# 5) Watch everything come up
kubectl get pods -A -w
```

## Visit the app

Open **http://tesco.localtest.me** in your browser.
(`*.localtest.me` always resolves to 127.0.0.1 — no /etc/hosts edit needed.)

## Useful debug commands

```bash
# Follow go-api logs
kubectl -n checkout logs -f deploy/go-api

# Follow spring-boot logs
kubectl -n payment logs -f deploy/spring-boot

# Peek at RabbitMQ management UI
kubectl -n messaging port-forward svc/rabbitmq 15672:15672
# then open http://localhost:15672  (guest / guest)

# Run a psql session inside the Postgres pod
kubectl -n payment exec -it postgres-0 -- psql -U payments -d payments
```

## Teardown

```bash
kind delete cluster --name tesco
```
