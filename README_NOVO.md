# 🏨 Sistema de Gestão de Hotel — Backend API

> Sistema acadêmico de gestão hoteleira com foco em arquitetura backend, banco de dados relacional e infraestrutura moderna.

**Versão**: 1.0.0  
**Status**: ✅ Backend funcional — API REST, Docker (Nginx + Node + PostgreSQL), Swagger  
**Data**: Junho 2026

> **Nota:** O backend vive na **raiz do repositório** (não existe subpasta `backend/`).  
> Para documentação operacional resumida, consulte também [`README.md`](./README.md).

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Pré-requisitos](#pré-requisitos)
4. [Instalação](#instalação)
5. [Configuração do Ambiente](#configuração-do-ambiente)
6. [Execução Local](#execução-local)
7. [Banco de Dados](#banco-de-dados)
8. [Docker](#docker)
9. [API & Endpoints](#api--endpoints)
10. [Arquitetura](#arquitetura)
11. [Fluxo de Autenticação](#fluxo-de-autenticação)
12. [Roadmap](#roadmap)
13. [Contribuição](#contribuição)
14. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Sistema backend de gestão hoteleira desenvolvido como projeto acadêmico (TCC) para demonstrar:

- ✅ APIs REST em Node.js + Express (JavaScript ESModules)
- ✅ Modelagem relacional com PostgreSQL
- ✅ ORM Sequelize com sync via `command.js migrate`
- ✅ Autenticação JWT + bcrypt
- ✅ Docker Compose para desenvolvimento
- ✅ Escalabilidade com Docker Swarm (futuro)
- ✅ Padrões SOLID, DRY, KISS

### Público-Alvo

- Hotéis e pousadas pequenas/médias (5-80 quartos)
- Estudantes de Sistemas de Informação, Engenharia de Software e Desenvolvimento Web
- Demonstração para avaliação acadêmica

### Fluxo Principal

```
Hóspede chega
    ↓
Receptionist cria/busca reserva (GET /reservations)
    ↓
Valida disponibilidade de quarto
    ↓
Realiza check-in (PATCH /reservations/:id/check-in)
    ↓
Altera status do quarto para OCCUPIED
    ↓
Hóspede sai
    ↓
Realiza check-out (PATCH /reservations/:id/check-out)
    ↓
Altera status do quarto para AVAILABLE
```

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Runtime** | Node.js | 24.x (Alpine no Docker) |
| **Linguagem** | JavaScript (ESModules) | `"type": "module"` |
| **Framework Web** | Express | 4.x |
| **ORM** | Sequelize | 6.37.x |
| **Banco de Dados** | PostgreSQL | 17 |
| **Autenticação** | JWT | jsonwebtoken 9.x |
| **Hashing** | bcryptjs | 2.x |
| **Variáveis de Ambiente** | dotenv | 16.x |
| **Documentação API** | Swagger UI | `/api-docs` |
| **Dev Server** | nodemon | 3.x |

---

## ✅ Pré-requisitos

Instale antes de começar:

- **Node.js** (20.x LTS ou superior)
  - Verificar: `node --version`
  - Download: https://nodejs.org/

- **npm** (vem com Node.js)
  - Verificar: `npm --version`
  - Versão mínima: 10.x

- **PostgreSQL** (17 ou superior) — Opção A (local)
  - Download: https://www.postgresql.org/download/
  - Ou use **Docker** (Opção B - recomendado)

- **Git** (para clonar o repositório)
  - Download: https://git-scm.com/

---

## 📥 Instalação

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/sirlande/sistema_hotel_prova.git
cd sistema_hotel_prova
```

### Passo 2: Instalar Dependências

```bash
# Na raiz do repositório
npm install
```

Saída esperada:
```
added 456 packages, and audited 457 packages in 45s
```

### Passo 3: Verificar Instalação

```bash
npm --version
node --version
```

---

## ⚙️ Configuração do Ambiente

### Passo 1: Copiar Arquivo de Exemplo

```bash
# Na raiz do repositório
cp .env.example .env
```

### Passo 2: Editar `.env`

Abra `.env` na raiz e configure:

```env
# Configurações do Servidor
NODE_ENV=development
NODE_WEB_PORT=3000

# Conexão com o PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gestao_hotel
POSTGRES_USER=hotel_user
POSTGRES_PASSWORD=hotel_password

# Segurança
JWT_SECRET=sua_chave_secreta_aqui
```

**⚠️ IMPORTANTE — Segurança:**
- Altere `JWT_SECRET` para uma string forte
- Nunca commite `.env` no Git (já está em `.gitignore`)
- Use valores diferentes entre dev/staging/produção

### Variáveis de Ambiente Explicadas

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `POSTGRES_HOST` | Host do PostgreSQL | `localhost` |
| `POSTGRES_PORT` | Porta do PostgreSQL | `5432` |
| `POSTGRES_DB` | Nome do banco de dados | `gestao_hotel` |
| `POSTGRES_USER` | Usuário do PostgreSQL | `hotel_user` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `hotel_password` |
| `NODE_WEB_PORT` | Porta do servidor backend | `3000` |
| `NODE_ENV` | Ambiente (dev/staging/prod) | `development` |
| `JWT_SECRET` | Chave secreta para assinar JWTs | (obrigatório) |

---

## 🚀 Execução Local

### Opção A: Com Docker Compose (Recomendado)

Stack completa: PostgreSQL + Node.js + Nginx (porta 80).

#### 1. Subir os containers

```bash
# Na raiz do repositório
docker compose up --build
```

#### 2. Executar migrations

Em outro terminal, com os containers rodando:

```bash
docker compose exec node_web node command.js migrate
```

#### 3. (Opcional) Carregar dados de seed

```bash
docker compose exec node_web npm run seed:db
```

#### 4. Acessar a API

- API: `http://localhost`
- Swagger: `http://localhost/api-docs`

---

### Opção B: Desenvolvimento local (sem Docker)

#### 1. Instalar dependências e configurar `.env`

```bash
npm install
cp .env.example .env
# Edite .env com credenciais do PostgreSQL local
```

#### 2. Executar migrations

```bash
node command.js migrate
```

#### 3. (Opcional) Carregar seed

```bash
npm run seed:db
```

#### 4. Iniciar o servidor

```bash
npm run dev
# ou: node _web.js
```

Saída esperada:
```
✅ Conexão com o banco de dados estabelecida.
🚀 Servidor rodando na porta 3000
```

#### 5. Teste o servidor

```bash
curl http://localhost:3000
```

---

### Verificação Rápida

```bash
# Terminal 1: Inicie o servidor (na raiz)
npm run dev

# Terminal 2: Teste os endpoints
curl -X GET http://localhost:3000
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aurora.example","password":"password"}'
```

---

## 💾 Banco de Dados

### Arquitetura

O banco PostgreSQL contém **7 tabelas** relacionadas:

```
┌──────────────┐
│   hotels     │ ◄── Multi-hotel (escalabilidade)
├──────────────┤
│ id (UUID) PK │
│ name UNIQUE  │
│ legal_id     │
│ created_at   │
│ updated_at   │
└──────┬───────┘
       │ 1:N
       ├──────────────────────┬──────────────────────┬─────────────────┐
       ▼                      ▼                      ▼                 ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    users     │    │room_categories│   │    rooms     │    │    guests    │
├──────────────┤    ├──────────────┤    ├──────────────┤    ├──────────────┤
│ id (UUID)    │    │ id (UUID)    │    │ id (UUID)    │    │ id (UUID)    │
│ hotel_id FK  │    │ hotel_id FK  │    │ hotel_id FK  │    │ hotel_id FK  │
│ name         │    │ name UNIQUE  │    │ category_id  │    │ full_name    │
│ email UNIQUE │    │ capacity > 0 │    │ number UNIQUE│    │ cpf UNIQUE   │
│ password_hash│    │ price > 0    │    │ floor        │    │ phone        │
│ role (enum) │    │ created_at   │    │ status (enum)│    │ email UNIQUE │
│ created_at   │    │ updated_at   │    │ created_at   │    │ created_at   │
│ updated_at   │    │              │    │ updated_at   │    │ updated_at   │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                    │                    │                    │
       │ 1:N                │ 1:N                └─────┐             │ 1:N
       │                    └────────────────────┐    │              │
       └────────────────────┐                    │    │              │
                            │                    ▼    ▼              │
                            │              ┌──────────────┐         │
                            │              │reservations  │◄────────┘
                            │              ├──────────────┤
                            │              │ id (UUID)    │
                            │              │ hotel_id FK  │
                            │              │ guest_id FK  │
                            │              │ room_id FK   │
                            └─────────────→│ user_id FK   │
                                           │ check_in_date│
                                           │check_out_date│
                                           │ status (enum)│
                                           │ total_amount │
                                           │ created_at   │
                                           │ updated_at   │
                                           └──────┬───────┘
                                                  │ 1:N
                                                  ▼
                                           ┌──────────────┐
                                           │  payments    │
                                           ├──────────────┤
                                           │ id (UUID)    │
                                           │ reservation_id│
                                           │ amount > 0   │
                                           │ method (enum)│
                                           │ paid_at      │
                                           │ created_at   │
                                           │ updated_at   │
                                           └──────────────┘
```

### Tabelas

#### 1. `hotels`
Representa unidades de hotel (suporte a multi-hotel).
- `id`: UUID (PK)
- `name`: TEXT UNIQUE
- `legal_id`: TEXT (CNPJ)
- `created_at`, `updated_at`: TIMESTAMP

#### 2. `users`
Representa funcionários do hotel.
- `id`: UUID (PK)
- `hotel_id`: UUID (FK → hotels)
- `name`: TEXT
- `email`: TEXT UNIQUE (por hotel)
- `password_hash`: TEXT (bcrypt)
- `role`: TEXT CHECK (ADMIN, RECEPTIONIST)
- `created_at`, `updated_at`: TIMESTAMP

#### 3. `room_categories`
Tipos de quartos (Standard, Suite, Deluxe, etc).
- `id`: UUID (PK)
- `hotel_id`: UUID (FK → hotels)
- `name`: TEXT UNIQUE (por hotel)
- `capacity`: INTEGER > 0
- `price_per_night`: DECIMAL(10,2) >= 0
- `created_at`, `updated_at`: TIMESTAMP

#### 4. `rooms`
Quartos físicos do hotel.
- `id`: UUID (PK)
- `hotel_id`: UUID (FK → hotels)
- `category_id`: UUID (FK → room_categories)
- `number`: TEXT UNIQUE (por hotel, ex: "101", "2B")
- `floor`: INTEGER
- `status`: TEXT CHECK (AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING)
- `created_at`, `updated_at`: TIMESTAMP

#### 5. `guests`
Hóspedes.
- `id`: UUID (PK)
- `hotel_id`: UUID (FK → hotels)
- `full_name`: TEXT
- `cpf`: TEXT UNIQUE (por hotel, CPF brasileiro)
- `phone`: TEXT
- `email`: TEXT UNIQUE (por hotel)
- `created_at`, `updated_at`: TIMESTAMP

#### 6. `reservations`
Reservas de quartos.
- `id`: UUID (PK)
- `hotel_id`: UUID (FK → hotels)
- `guest_id`: UUID (FK → guests, RESTRICT on delete)
- `room_id`: UUID (FK → rooms, RESTRICT on delete)
- `user_id`: UUID (FK → users, RESTRICT on delete)
- `check_in_date`: DATEONLY
- `check_out_date`: DATEONLY (> check_in)
- `status`: TEXT CHECK (PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED)
- `total_amount`: DECIMAL(12,2) >= 0
- `created_at`, `updated_at`: TIMESTAMP

**Constraints especiais:**
- EXCLUDE USING GIST: Impede reservas sobrepostas no mesmo quarto
- Índices em (hotel_id, check_in_date) e (hotel_id, check_out_date)

#### 7. `payments`
Registros de pagamento.
- `id`: UUID (PK)
- `reservation_id`: UUID (FK → reservations, CASCADE)
- `amount`: DECIMAL(12,2) >= 0
- `method`: TEXT CHECK (CARD, CASH, TRANSFER)
- `paid_at`: TIMESTAMP
- `created_at`, `updated_at`: TIMESTAMP

### Migrations

O schema é criado/atualizado via Sequelize sync:

```bash
node command.js migrate
```

### Seed

Dados iniciais para desenvolvimento:

```bash
npm run seed:db
```

---

## 🐳 Docker

### Docker Compose (Produção / Demo)

Stack com 3 serviços: `postgres`, `node_web`, `nginx`.

```bash
docker compose up --build
```

| Serviço | Descrição | Porta externa |
|---------|-----------|---------------|
| `postgres` | PostgreSQL 17 | (interna) |
| `node_web` | API Node.js | (interna) |
| `nginx` | Proxy reverso | **80** |

Fluxo: `Cliente → Nginx (:80) → node_web (:3000) → postgres (:5432)`

#### Migrations no container

```bash
docker compose exec node_web node command.js migrate
```

#### Parar

```bash
docker compose down
```

#### Ver logs

```bash
docker compose logs -f
```

---

## 📡 API & Endpoints

⚠️ **Status**: Endpoints implementados. Consulte [`README.md`](./README.md) e Swagger em `/api-docs` para a lista completa.

### Base URL

```
http://localhost:3000
```

### Autenticação

Endpoints protegidos requerem header:
```
Authorization: Bearer <jwt_token>
```

### Padrão de Resposta de Erro

```json
{
  "error": "Descrição do erro",
  "statusCode": 400,
  "timestamp": "2026-06-01T10:30:00Z"
}
```

### Endpoints Planejados

#### 1. Auth

```http
POST /auth/register
Content-Type: application/json

{
  "name": "João da Silva",
  "email": "joao@hotel.com",
  "password": "senha_forte_123"
}

Response 201:
{
  "id": "uuid",
  "name": "João da Silva",
  "email": "joao@hotel.com",
  "token": "eyJhbGc..."
}
```

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@aurora.example",
  "password": "password"
}

Response 200:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "Admin Local",
    "email": "admin@aurora.example",
    "role": "ADMIN"
  }
}
```

#### 2. Room Categories

```http
GET /room-categories
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "name": "Standard",
    "capacity": 2,
    "pricePerNight": 120.00
  }
]
```

```http
POST /room-categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Suite Premium",
  "capacity": 4,
  "pricePerNight": 450.00
}

Response 201:
{
  "id": "uuid",
  "name": "Suite Premium",
  "capacity": 4,
  "pricePerNight": 450.00
}
```

#### 3. Rooms

```http
GET /rooms
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "number": "101",
    "floor": 1,
    "status": "AVAILABLE",
    "category": {
      "id": "uuid",
      "name": "Standard"
    }
  }
]
```

```http
GET /rooms/available?checkIn=2026-06-15&checkOut=2026-06-20
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "number": "101",
    "category": "Standard",
    "pricePerNight": 120.00
  }
]
```

#### 4. Guests

```http
POST /guests
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Maria Silva",
  "cpf": "12345678901",
  "phone": "+55-11-99999-9999",
  "email": "maria@example.com"
}

Response 201:
{
  "id": "uuid",
  "fullName": "Maria Silva",
  "cpf": "12345678901"
}
```

#### 5. Reservations

```http
POST /reservations
Authorization: Bearer <token>
Content-Type: application/json

{
  "guestId": "uuid",
  "roomId": "uuid",
  "checkInDate": "2026-06-15",
  "checkOutDate": "2026-06-20"
}

Response 201:
{
  "id": "uuid",
  "guestId": "uuid",
  "roomId": "uuid",
  "status": "PENDING",
  "totalAmount": 600.00
}
```

```http
PATCH /reservations/:id/check-in
Authorization: Bearer <token>

Response 200:
{
  "id": "uuid",
  "status": "CHECKED_IN",
  "room": {
    "status": "OCCUPIED"
  }
}
```

---

## 🏗️ Arquitetura

### Estrutura de Pastas (Raiz do Repositório)

```
sistema_hotel_prova/           ← raiz (backend vive aqui)
├── _web.js                    ← Entrypoint Express
├── command.js                 ← CLI: node command.js migrate
├── package.json
├── docker-compose.yml
├── Dockerfile
├── app/
│   ├── Controllers/             ← Single-Action Controllers
│   └── Models/                  ← Modelos Sequelize
├── database/
│   ├── connections/sequelize.js
│   └── relations.js
├── routes/
│   ├── apis/                    ← Routers por domínio
│   └── router.js
├── bootstrap/
├── middlewares/
├── config/swagger.js
├── db/schema.sql                ← Schema SQL de referência
└── seed/seed_hotels.sql
```

Detalhes completos em [`docs/back/ARQ_BACKEND.md`](./docs/back/ARQ_BACKEND.md).

### Padrões Arquiteturais

O projeto segue:
- **MVC Simplificado**: Models (ORM) → Controllers (requisições) → Views (JSON)
- **Service Layer**: Lógica de negócio centralizada
- **Middlewares**: Autenticação, validação, tratamento de erros
- **Separação de Responsabilidades**: SOLID principles

### Fluxo de uma Requisição

```
HTTP Request
    ↓
Routes (validação de URL)
    ↓
Middlewares (autenticação, validação)
    ↓
Controllers (recebe dados, delega negócio)
    ↓
Services (executa regras de negócio, consulta BD)
    ↓
Models/ORM (Sequelize interage com PostgreSQL)
    ↓
Response (JSON com resultado ou erro)
```

---

## 🔐 Fluxo de Autenticação

⚠️ **Status**: Implementado. JWT com expiração de 8 horas; payload `{ userId, role, tenantId }`.

### Login com JWT

```
1. Cliente POST /auth/login com email + senha
2. Backend busca user no PostgreSQL
3. Compara senha com bcrypt (hash armazenado)
4. Se OK, gera JWT assinado com JWT_SECRET
5. Retorna token ao cliente
6. Cliente armazena token (localStorage/sessionStorage)
```

### Uso do Token

```
1. Cliente envia requisição com:
   Authorization: Bearer <token>

2. Middleware de auth:
   - Extrai token do header
   - Valida assinatura com JWT_SECRET
   - Verifica expiração
   - Se OK, adiciona user ao req.user

3. Controller acessa req.user
```

### Proteção de Rotas

```typescript
// Exemplo de rota protegida:
app.get('/rooms', 
  authMiddleware,  // ← Valida JWT
  roomController.listRooms  // ← Executa lógica
);
```

---

## 📋 Roadmap

### ✅ Concluído (Fase 1)

- [x] Setup Express + JavaScript ESModules
- [x] Configuração Sequelize + PostgreSQL
- [x] Sync de schema via `command.js migrate`
- [x] Seed de dados de demo
- [x] Docker Compose (PostgreSQL + Node + Nginx)
- [x] Controllers, rotas e middlewares de auth JWT
- [x] Swagger/OpenAPI em `/api-docs`

### 🟡 Em Progresso (Fase 2)

- [ ] Testes unitários e e2e
- [ ] Validações de entrada (schemas)
- [ ] CI/CD (GitHub Actions)

### 🔴 Planejado (Fase 3)

- [ ] Docker Swarm (demo)
- [ ] Kubernetes (demo)
- [ ] Frontend (React/Next.js)

### 📊 Checklist por Módulo

#### Auth
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] JWT middleware
- [ ] Validação de senha
- [ ] Refresh token

#### Rooms
- [ ] GET /rooms
- [ ] GET /rooms/available
- [ ] POST /rooms
- [ ] PATCH /rooms/:id
- [ ] DELETE /rooms/:id

#### Guests
- [ ] GET /guests
- [ ] POST /guests
- [ ] PUT /guests/:id
- [ ] DELETE /guests/:id

#### Reservations
- [ ] POST /reservations (com validação de conflito)
- [ ] GET /reservations
- [ ] PATCH /reservations/:id/check-in
- [ ] PATCH /reservations/:id/check-out
- [ ] PATCH /reservations/:id/cancel

---

## 🤝 Contribuição

### Setup para Contribuidores

```bash
# 1. Fork e clone
git clone https://github.com/SEU_USUARIO/sistema_hotel_prova.git
cd sistema_hotel_prova

# 2. Crie uma branch
git checkout -b feat/novo-endpoint

# 3. Instale deps (na raiz)
npm install

# 4. Desenvolvimento
npm run dev

# 5. Faça commit seguindo convenção
git commit -m "feat: adiciona endpoint GET /rooms"

# 6. Push
git push origin feat/novo-endpoint

# 7. Crie Pull Request
```

### Convenções de Código

Consulte [CODING_STANDARDS.md](../docs/CODING_STANDARDS.md) para:
- Princípios SOLID
- Padrão DRY
- KISS
- Commits semânticos

### Testes

```bash
# Executar testes (quando implementados)
npm run test

# Com coverage
npm run test:coverage
```

---

## 🆘 Troubleshooting

### Problema: "ECONNREFUSED 127.0.0.1:5432"

**Causa**: PostgreSQL não está rodando.

**Solução**:
```bash
# Com Docker Compose:
docker-compose up -d

# Com PostgreSQL local:
pg_ctl -D /usr/local/var/postgres start
```

### Problema: "password authentication failed"

**Causa**: Credenciais incorretas no `.env`.

**Solução**:
```bash
# Verifique .env na raiz:
cat .env | grep POSTGRES_

# Recrie o banco e rode migrations:
node command.js migrate
npm run seed:db
```

### Problema: "relation 'hotels' does not exist"

**Causa**: Migrations não foram executadas.

**Solução**:
```bash
node command.js migrate
npm run seed:db
```

### Problema: "Cannot find module 'cors'"

**Causa**: Dependências não instaladas.

**Solução**:
```bash
npm install
```

### Problema: "TypeError: Cannot read property 'authenticate' of undefined"

**Causa**: Database não foi importado corretamente.

**Solução**:
```bash
# Verifique .env está correto
npm run dev
```

---

## 📚 Documentação Adicional

- [CODING_STANDARDS.md](../docs/CODING_STANDARDS.md) — Padrões de código
- [FEATURE_COVERAGE_ANALYSIS.md](../docs/FEATURE_COVERAGE_ANALYSIS.md) — Análise de funcionalidades
- [PRODUCT_ROADMAP.md](../docs/PRODUCT_ROADMAP.md) — Visão de futuro
- [ARQ_BACKEND.md](../docs/back/ARQ_BACKEND.md) — Detalhes de arquitetura
- [ARQ_DATABASE.md](../docs/db/ARQ_DATABASE.md) — Detalhes de BD

---

## 📞 Suporte

- 📧 Email: sirlande@example.com
- 🐛 Issues: https://github.com/sirlande/sistema_hotel_prova/issues
- 💬 Discussões: https://github.com/sirlande/sistema_hotel_prova/discussions

---

## 📄 Licença

ISC — Veja [LICENSE](LICENSE) para detalhes.

---

**Última atualização**: 11 Junho 2026  
**Versão**: 1.0.0
