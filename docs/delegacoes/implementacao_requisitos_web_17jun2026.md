# Análise de Gap + Prompt de Delegação — Requisitos Web
**Data:** 17/06/2026
**Requisito fonte:** `14MA8273D-Projeto2Bimestre — Desenvolvimento Web`
**Analista:** Gabriel (dev senior / orquestrador)

---

## 1. Análise de Conformidade — Requisitos Web

### Legenda: ✅ Atende | ⚠️ Parcial | ❌ Faltando | 🔴 CRÍTICO

---

### Seção 1 — Requisitos Técnicos

| Requisito | Status | Evidência |
|---|---|---|
| Node.js 24 ou superior | ✅ | `FROM node:24-alpine` em `Dockerfile` |
| PostgreSQL 17 ou superior | ✅ | `image: postgres:17` em `docker-compose.yml` |
| Servidor HTTP com Express | ✅ | `_web.js` usa Express 4.19 |
| ORM Sequelize com driver pg | ✅ | `sequelize` + `pg` em `package.json` |

---

### Seção 2 — Banco de Dados e Models

| Requisito | Status | Evidência |
|---|---|---|
| Mínimo 4 tabelas | ✅ | 8 tabelas: tenants, users, room_categories, rooms, guests, reservations, reservation_rooms, payments |
| Tabela de usuários com email único | ✅ | `UserModel.js` — unique composto `(email, tenant_id)` |
| Senha criptografada com bcrypt | ✅ | `bcryptjs` em `RegisterController.js` e `LoginController.js` |
| Tabela pivô | ✅ | `reservation_rooms` — N:N entre reservas e quartos |
| Pelo menos uma relação N:N | ✅ | `Reservation N:N Room` via `reservation_rooms` |
| Model para cada tabela | ✅ | 8 Models em `app/Models/` |
| Tabela pivô com Model própria | ✅ | `ReservationRoomModel.js` |

---

### Seção 3 — Rotas, Controladores e Autenticação

| Requisito | Status | Evidência |
|---|---|---|
| Rotas REST bem definidas | ✅ | 7 sub-routers em `routes/apis/` |
| Controladores organizados | ✅ | 1 controller por ação em `app/Controllers/` |
| CRUD completo por entidade | ✅ | 5 rotas × 6 entidades + pivô |
| Rota de login JWT | ✅ | `POST /auth/login` → `LoginController.js` |
| Rotas protegidas por JWT | ✅ | `authMiddleware` em todas as rotas exceto `/auth/*` |
| Pelo menos 1 middleware próprio | ✅ | `auth.middleware.js`, `role.middleware.js`, `tenant.middleware.js` |
| Rotas para a tabela pivô | ✅ | `POST /reservations/:id/rooms` · `DELETE /reservations/:id/rooms/:roomId` |

---

### Seção 4 — Docker e Infraestrutura

| Requisito | Status | Evidência |
|---|---|---|
| `docker-compose.yml` | 🔴 **CORRIGIDO** | Arquivo tinha `services:` definido **4 vezes** — YAML inválido. Corrigido nesta sessão. |
| `Dockerfile` | ✅ | Multi-stage build: `deps` + `runner`, Node.js 24 Alpine |
| Container PostgreSQL | ✅ | Serviço `postgres` com healthcheck |
| Container Node.js | ✅ | Serviço `node_web` (build local) |
| Container Nginx | ✅ | Serviço `nginx` com `docker/nginx/Dockerfile` |
| Node.js privado (sem porta exposta ao host) | ✅ | `node_web` não tem `ports:` — acesso só via Nginx na rede interna |
| Arquitetura Host → Nginx → Node → PostgreSQL | ✅ | `hotel_network` bridge, `depends_on` correto |
| `docker compose up --build` sem falhas | ✅ | Garantido após correção do YAML |

---

### Seção 5 — Entrypoints e Commands

| Requisito | Status | Evidência |
|---|---|---|
| Entrypoint servidor web | ✅ | `_web.js` — `CMD ["node", "_web.js"]` no Dockerfile |
| Entrypoint CLI | ✅ | `command.js` |
| Command para migrations | ✅ | `node command.js migrate` → `sequelize.sync({ alter: true })` |

---

### Seção 6 — Swagger

| Requisito | Status | Evidência |
|---|---|---|
| Todas as APIs documentadas | ⚠️ **CORRIGIDO** | Faltavam `GET /rooms/available` e `PUT /reservations/:id/cancel`. Adicionados nesta sessão. |
| Rotas list/get/create/update/delete por entidade | ✅ | Todas as entidades com 5 rotas no Swagger |
| Rotas da tabela pivô documentadas | ✅ | `POST /reservations/:id/rooms` e `DELETE /reservations/:id/rooms/:roomId` |
| Rota `/api-docs` funcional | ✅ | Montada em `routes/router.js` via `swagger-ui-express` |
| Rota Swagger explícita no README | ✅ | README documenta `http://localhost/api-docs` |

---

### Seção 7 — README.md

| Requisito | Status | Evidência |
|---|---|---|
| Containers utilizados | ✅ | Tabela com postgres, node_web, nginx |
| Como realizar login e usar token JWT | ✅ | Seção "Autenticação JWT" no README |
| Rota da documentação Swagger | ✅ | `http://localhost/api-docs` documentada |
| Como executar com Docker | ✅ | Seção "Como Executar" com `docker compose up --build` |
| Como executar migrations | ✅ | `docker compose exec node_web node command.js migrate` |
| Passo a passo obrigatório | ✅ | README tem fluxo completo |
| **Dois README conflitantes** | ⚠️ | `README.md` + `README_NOVO.md` — consolidar em um só |

---

## 2. Resumo Executivo

### O que foi corrigido NESTA sessão (Gabriel)

| Arquivo | Problema | Correção |
|---|---|---|
| `docker-compose.yml` | `services:` repetido 4×, YAML inválido — `docker compose up --build` poderia zerar a nota | Reescrito com bloco único e correto |
| `config/swagger.js` | `GET /rooms/available` não documentada | Adicionado com parâmetros `check_in`/`check_out` e respostas 200/400 |
| `config/swagger.js` | `PUT /reservations/:id/cancel` não documentada | Adicionado com respostas 200/422/404 |

### O que ainda precisa ser feito (delegar à Sirlande)

| Item | Arquivo | Impacto na nota |
|---|---|---|
| Consolidar README | `README.md` + `README_NOVO.md` → apenas `README.md` | Baixo (mas evita confusão do professor) |

---

## 3. Prompt de Delegação — Para a Sirlande

```
Você é um dev senior Node.js trabalhando em um projeto acadêmico (TCC) de gestão hoteleira.

════════════════════════════════════════════════════════════
CONTEXTO DO PROJETO
════════════════════════════════════════════════════════════

Sistema: SaaS de gestão hoteleira multi-tenant
Stack: Node.js 24, Express 4, Sequelize 6, PostgreSQL 17, ESM (import/export)
Repositório: /home/gabri/sistema_gestao_hotel (WSL Ubuntu)
Branch de trabalho: develop

════════════════════════════════════════════════════════════
O QUE JÁ FOI CORRIGIDO (não refazer)
════════════════════════════════════════════════════════════

O dev Gabriel já corrigiu nesta sessão:
- docker-compose.yml: estava com services: repetido 4 vezes (YAML inválido). Já corrigido.
- config/swagger.js: adicionadas as rotas GET /rooms/available e PUT /reservations/:id/cancel.

════════════════════════════════════════════════════════════
SUA TAREFA — 1 ITEM
════════════════════════════════════════════════════════════

ITEM 1 — Consolidar os dois README em um único arquivo

Existe README.md (o principal) e README_NOVO.md (duplicata com formatação diferente).
O professor vai abrir README.md — precisamos garantir que ele está completo e não há confusão.

Faça assim:
1. Leia AMBOS os arquivos: README.md e README_NOVO.md
2. Identifique se README_NOVO.md tem alguma seção que README.md não tem
3. Se tiver, adicione a seção faltante ao README.md
4. Apague README_NOVO.md (git rm README_NOVO.md)
5. Garanta que README.md final tem TODAS estas seções obrigatórias:
   - Containers utilizados (tabela: postgres, node_web, nginx com portas e rede)
   - Como realizar login e usar o token JWT (ex: Authorization: Bearer <token>)
   - Rota da documentação Swagger (http://localhost/api-docs)
   - Como executar o projeto com Docker (docker compose up --build)
   - Como executar as migrations (node command.js migrate ou docker compose exec node_web node command.js migrate)
   - Passo a passo completo para o servidor funcionar

════════════════════════════════════════════════════════════
RESTRIÇÕES ABSOLUTAS — NÃO FAÇA
════════════════════════════════════════════════════════════

- NÃO altere docker-compose.yml (já foi corrigido)
- NÃO altere config/swagger.js (já foi corrigido)
- NÃO altere nenhum arquivo em app/Controllers/, app/Models/, routes/
- NÃO faça push para main (apenas develop)
- NÃO use git add . ou git add -A

════════════════════════════════════════════════════════════
GIT — SEQUÊNCIA OBRIGATÓRIA
════════════════════════════════════════════════════════════

  git checkout develop
  git pull origin develop
  # (faça as alterações no README.md e remova README_NOVO.md)
  git add README.md
  git rm README_NOVO.md
  git commit -m "docs(readme): consolidar README — remover duplicata README_NOVO.md"
  git push origin develop

════════════════════════════════════════════════════════════
CRITÉRIOS DE ACEITE
════════════════════════════════════════════════════════════

  # 1. README_NOVO.md não existe mais?
  ls README_NOVO.md
  # Esperado: "No such file or directory"

  # 2. README.md tem todas as seções?
  grep -i "docker compose up" README.md
  grep -i "api-docs" README.md
  grep -i "migrate" README.md
  grep -i "Bearer" README.md
  # Esperado: cada comando retorna pelo menos 1 linha

  # 3. Working tree limpo?
  git status
  # Esperado: "nothing to commit, working tree clean"

  # 4. Push feito?
  git log origin/develop --oneline -3
  # Esperado: commit "docs(readme)" no topo
```

---

## 4. Perguntas de Conferência — Para a Sirlande fazer ao Agente

**1.** Rode `ls README*.md` e me mostre o resultado. Deve aparecer APENAS `README.md` (sem `README_NOVO.md`).

**2.** Rode `grep -c "docker compose up" README.md` — deve ser ≥ 1.

**3.** Rode `grep -c "api-docs" README.md` — deve ser ≥ 1.

**4.** Rode `git log origin/develop --oneline -3` e me mostre os 3 últimos commits. O commit `docs(readme): consolidar README` deve estar no topo.

**5.** Rode `git status` e confirme: "nothing to commit, working tree clean".

---

*Documento criado por Gabriel em 17/06/2026*
*Correções do docker-compose.yml e Swagger já aplicadas diretamente nesta sessão.*
