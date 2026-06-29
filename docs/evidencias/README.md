# 📸 Evidências — Subida do ambiente (do zero)

Esta pasta comprova que o **Sistema de Gestão de Hotel** sobe corretamente em
**Kubernetes (minikube)**, partindo de um namespace limpo até a API respondendo.

> Ambiente: minikube (Docker Desktop) · namespace `hotel-system` · backend (3 réplicas),
> nginx, postgres (StatefulSet + PVC) e redis. Sequência executada manualmente para
> evidenciar cada etapa.

## Sequência comprovada

| Ordem | Arquivo | Etapa | O que comprova |
|---|---|---|---|
| 1 | `passso2_k8.png` | **Build no minikube** | `eval $(minikube docker-env)` + `docker build` da imagem `sistema-gestao-hotel-backend:latest` **dentro do daemon do minikube** — `Building FINISHED (12/12)` |
| 2 | `passo2.png` | **Build da imagem** | `docker build` do backend concluído — `Building FINISHED (13/13)` |
| 3 | `passo3.png` | **Apply dos manifests** | `kubectl apply -k k8s/` cria namespace, configmaps, secret, services (backend/nginx/postgres/redis), PVCs, deployments, statefulset, PDB e networkpolicies |
| 4 | `passo4.png` | **Pods no ar** | `kubectl get pods -n hotel-system` → 3× backend + nginx + postgres-0 + redis, todos **1/1 Running** |
| 5 | `passo5.png` | **Migrations** | `kubectl exec deploy/backend -- node command.js migrate` → conexão OK + "Migrations executadas com sucesso" |
| 6 | `passo6_opcional.png` | **Seed (opcional)** | carga do `seed/seed_hotels.sql` via `psql` no statefulset postgres → `BEGIN … INSERTs … COMMIT` (2 hotéis + quartos, hóspedes, reservas, pagamentos) |
| 7 | `passo7.png` | **API respondendo** | `minikube tunnel` ativo + `curl http://localhost/health` → `{"status":"OK", ... "service":"Sistema de Gestão de Hotel Backend"}` |

## Resultado

Build da imagem → deploy no cluster → pods saudáveis → banco migrado → dados semeados →
**endpoint `/health` respondendo `OK`**. Ambiente funcional, ponta a ponta.

## Evidências adicionais sugeridas (opcional)
Para reforçar a demonstração das funcionalidades (além da infra), valem prints de:
- **Swagger** aberto em `/api-docs` (com as tags `Reserva Direta (Público)` e `Webhooks`).
- **Login** (`POST /auth/login`, `admin@aurora.example` / `senha123`) retornando o JWT.
- Uma chamada autenticada (ex.: `GET /rooms`) retornando dados do seed.
