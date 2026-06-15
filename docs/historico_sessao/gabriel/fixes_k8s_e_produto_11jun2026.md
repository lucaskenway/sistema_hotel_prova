### 2026-06-11 — Gabriel (agente-prova)

- **Branch:** `develop` (via `fix/k8s-hardening`, `fix/reservation-price-calculation`, `fix/checkin-extra-rooms-status`)
- **Horário:** sessão única
- **Objetivo da sessão:** Executar delegação `docs/delegacoes/fixes_k8s_e_produto_11jun2026.md` — K8s hardening + cálculo automático de `total_amount` + propagação de status de quartos extras no check-in/out

---

#### O que foi feito

| Tarefa | Arquivo(s) | Descrição |
|--------|-----------|-----------|
| K8s — resource limits | `k8s/backend.yaml`, `k8s/nginx.yaml`, `k8s/postgres.yaml` | Adicionado `resources.requests` e `resources.limits` nos 3 deployments |
| K8s — terminationGracePeriodSeconds | `k8s/backend.yaml` | Adicionado `terminationGracePeriodSeconds: 60` no spec do backend |
| K8s — PodDisruptionBudget | `k8s/pdb.yaml` (novo) | Garante mínimo 2 réplicas do backend durante drenos de nó |
| K8s — NetworkPolicy | `k8s/networkpolicy.yaml` (novo) | Isola postgres (só backend acessa 5432) e backend (só nginx acessa 3000) |
| K8s — Nginx ConfigMap | `k8s/nginx.yaml` | Adicionado `upstream backend_pool` com keepalive 32 + timeouts (connect 5s, read/send 60s) + headers Upgrade/X-Forwarded-Proto |
| K8s — Kustomize namespace central | `k8s/kustomization.yaml` | Adicionado `namespace: hotel-system` centralizado + referências a `pdb.yaml` e `networkpolicy.yaml` |
| K8s — Pin nginx Lab 9 | `docker/kubernetes/deployment.yaml` | `nginx:alpine` → `nginx:1.27-alpine` |
| Produto — total_amount automático | `app/Controllers/ReservationApi/CreateReservationController.js` | Remove `total_amount` do body; calcula via `price_per_night × noites` com `RoomModel include category`; retorna 404 se quarto não encontrado, 422 se categoria sem preço |
| Produto — quartos extras check-in | `app/Controllers/ReservationApi/CheckInController.js` | Busca `ReservationRoomModel` após salvar quarto principal; atualiza extras para `OCCUPIED` na mesma transaction |
| Produto — quartos extras check-out | `app/Controllers/ReservationApi/CheckOutController.js` | Mesma estrutura; atualiza extras para `CLEANING` na mesma transaction |

---

#### Commits gerados

| Hash | Mensagem |
|------|----------|
| `5d97c11` | `fix(k8s): hardening — resource limits, PDB, NetworkPolicy e nginx upstream` |
| `a70e9a0` | `fix(reservations): calcular total_amount automaticamente via price_per_night × noites` |
| `b58788c` | `fix(reservations): check-in e check-out atualizam status de todos os quartos da reserva` |

---

#### Pendências

| # | Pendência | Prioridade | Observação |
|---|-----------|-----------|------------|
| 1 | Secrets K8s — `hotel_password` e JWT secret em plaintext no git | 🔴 Alta | Findings [1] e [4] foram excluídos do escopo desta sessão. Para prod: Sealed Secrets (Bitnami) ou External Secrets Operator. Ver detalhes em `docs/historico_sessao/gabriel/revisao_kubernetes.md` |
| 2 | securityContext nos containers K8s | 🟡 Média | Finding [8] excluído do escopo. Adicionar `runAsNonRoot`, `allowPrivilegeEscalation: false`, `capabilities.drop: ALL` em backend, nginx e postgres |
| 3 | `total_amount` não recalcula em `UpdateReservationController` | 🟡 Média | Se datas forem alteradas via PUT /reservations/:id, o `total_amount` não é recalculado. Avaliar se deve ser imutável após criação ou recalculado |
