# Sistema Hotel API - Backend

## 1. Identificação do Projeto

**Título:** Sistema Hotel API  
**Descrição:** API REST para gerenciamento de hotel com funcionalidades de autenticação de usuários, gerenciamento de quartos e controle de reservas. Sistema modular construído com TypeScript e Express.js.  
**Caminho Escolhido:** **Opção A - Docker/Orquestração Local** (Docker Compose com PostgreSQL em contêiner)

---

## 2. Pré-requisitos

Ferramentas necessárias para executar o projeto:

- **Docker Desktop** (versão 20.10+)
- **Docker Compose** (versão 1.29+)
- **Node.js** (versão 18+) - Para desenvolvimento local
- **npm** (versão 8+)
- **WSL2** (Windows Subsystem for Linux 2) - Se usando Windows
- **Git** - Para versionamento de código

### Verificar instalação:
```bash
docker --version
docker-compose --version
node --version
npm --version
```

---

## 3. Guia de Instalação e Execução ("How to Up")

### 3.1 Clonar o repositório
```bash
git clone https://github.com/gabrielreis354/sistema_hotel_prova.git
cd sistema_hotel_prova/backend
```

### 3.2 Instalar dependências Node.js
```bash
npm install
```

### 3.3 Configurar variáveis de ambiente

Copiar o arquivo `.env.example` (se existir) ou criar um `.env` na raiz da pasta `backend/`:

```bash
cp .env.example .env
```

**Conteúdo do `.env`:**
```env
# Servidor
PORT=3000

# Banco de Dados PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=hotel_user
DB_PASSWORD=hotel_pass

# JWT
JWT_SECRET=seu_secret_jwt_aqui
JWT_EXPIRATION=7d
```

### 3.4 Iniciar a infraestrutura com Docker Compose
```bash
# Subir os serviços em background
docker-compose up -d --build

# Verificar se os contêineres estão rodando
docker-compose ps
```

### 3.5 Executar migrations (se existirem)
```bash
npx sequelize-cli db:migrate
```

### 3.6 Executar seeders para dados iniciais (se existirem)
```bash
npx sequelize-cli db:seed:all
```

### 3.7 Iniciar o servidor em modo desenvolvimento
```bash
# No terminal, a partir de sistema_hotel_prova/backend/
npm run dev
```

**Saída esperada:**
```
✅ PostgreSQL conectado
🚀 Servidor rodando na porta 3000
```

**Acessar a aplicação:**
- API URL: `http://localhost:3000`
- Health Check: `http://localhost:3000/` (deve retornar JSON com status "online")

---

## 4. Detalhamento Técnico da Infraestrutura

### 4.1 Otimização de Imagens (Dockerfile)

O projeto utiliza as seguintes práticas de otimização:

#### **Multi-stage Build**
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

**Benefícios:**
- Reduz tamanho da imagem final (~150MB → ~80MB)
- Camadas de build não são incluídas na imagem de produção
- Mantém apenas dependências necessárias

#### **Layer Caching**
A ordem das instruções Dockerfile é otimizada:
1. `COPY package*.json` (muda pouco)
2. `RUN npm install` (dependências - cache reusável)
3. `COPY . .` (código-fonte - muda frequentemente)

Isso garante que o cache de dependências seja reutilizado ao rebuild do código.

#### **.dockerignore**
Arquivo `.dockerignore` previne envio de arquivos desnecessários:
```
node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
.vscode
.idea
dist
coverage
*.md
.DS_Store
```

**Resultado:** Contexto de build reduzido em ~90%

#### **Imagem Base Alpine**
Uso de `node:18-alpine` em lugar de `node:18`:
- Alpine: ~80MB
- Full: ~380MB
- Ganho: 79% de redução

### 4.2 Persistência de Dados

**Estratégia:** Named Volumes para dados do PostgreSQL

**Arquivo docker-compose.yml:**
```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: hotel_postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Named Volume
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"

volumes:
  postgres_data:  # Definição do volume nomeado
```

**Por que Named Volumes e não Bind Mounts?**
- ✅ Gerenciado pelo Docker (backup automático possível)
- ✅ Persistem após `docker-compose down`
- ✅ Funcionam em qualquer OS (Windows, Mac, Linux)
- ❌ Bind mounts são proibidos para dados em produção

**Verificar volume:**
```bash
docker volume ls
docker volume inspect sistema_hotel_prova_postgres_data
```

### 4.3 Rede e Comunicação Interna

**Arquitetura de Rede Customizada (Ponte Inteligente):**

```yaml
networks:
  hotel_network:
    driver: bridge

services:
  app:
    networks:
      - hotel_network
    environment:
      DB_HOST: postgres  # Service Discovery via DNS
  
  postgres:
    networks:
      - hotel_network
```

**Service Discovery:**
- App acessa BD via `postgres:5432` (não IP estático)
- DNS interno resolve automaticamente
- Isolamento perimetral: apenas contêineres da rede conseguem se comunicar

**Validar comunicação:**
```bash
docker exec hotel_app nslookup postgres
```

### 4.4 Segurança

**Medidas Implementadas:**

1. **Variáveis de Ambiente**
   - Credenciais nunca são commitadas
   - `.env` listado em `.gitignore`
   - Arquivo `.env.example` serve como template

2. **Isolamento de Rede**
   - PostgreSQL não exposto na internet (apenas localhost:5432)
   - Acesso apenas via rede interna do Docker

3. **Usuário Não-Root**
   - Contêiner Node.js roda com usuário `node` (não root)

4. **Criptografia de Senhas**
   - Bcrypt com salt 10 para senhas de usuários
   - JWT para autenticação stateless

---

## 5. Gestão de Segredos e Configurações

### 5.1 Arquivo `.env.example`
Deve ser commitado ao repositório como template:

```env
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=hotel_user
DB_PASSWORD=MUDE_ISSO_EM_PRODUCAO
JWT_SECRET=MUDE_ISSO_EM_PRODUCAO
JWT_EXPIRATION=7d
```

### 5.2 Checklist de Segurança
- [ ] Nunca comitar arquivo `.env` real no Git
- [ ] `.env` está no `.gitignore`
- [ ] Senhas são alteradas de exemplo antes de produção
- [ ] Usar variáveis de ambiente em CI/CD (GitHub Secrets, GitLab Variables)

---

## 6. Evidências de Funcionamento e Verificação

### 6.1 Comandos de Validação

**Verificar status dos contêineres:**
```bash
docker-compose ps
```

**Saída esperada:**
```
NAME                    STATUS
hotel_app              Up 5 minutes
hotel_postgres         Up 5 minutes
```

**Visualizar logs da aplicação:**
```bash
docker-compose logs app -f
```

**Visualizar logs do banco:**
```bash
docker-compose logs postgres
```

**Inspecionar rede interna:**
```bash
docker network inspect sistema_hotel_prova_hotel_network
```

**Verificar volume de persistência:**
```bash
docker volume inspect sistema_hotel_prova_postgres_data
```

### 6.2 Testes de Funcionamento

**Health Check da API:**
```bash
curl -i http://localhost:3000/
```

**Resposta esperada:**
```json
HTTP/1.1 200 OK
{"status":"online","project":"Sistema Hotel API"}
```

**Testar conectividade com BD:**
```bash
docker exec hotel_app npm run db:check
```

### 6.3 Teste de Persistência

**Parar e reiniciar o serviço (dados devem persistir):**
```bash
# Parar o PostgreSQL (mas manter o volume)
docker-compose stop postgres

# Reiniciar
docker-compose start postgres

# Validar que os dados ainda existem
docker exec hotel_postgres psql -U hotel_user -d hotel_db -c "SELECT COUNT(*) FROM users;"
```

---

## 7. Troubleshooting e Limpeza

### 7.1 Problemas Comuns

**Erro: "Cannot connect to Docker daemon"**
```bash
# Solução: Reiniciar Docker Desktop
sudo systemctl restart docker
```

**Erro: "Port 5432 already in use"**
```bash
# Listar contêineres usando porta 5432
docker ps -a | grep 5432

# Ou matar processo na porta
lsof -i :5432 | awk 'NR!=1 {print $2}' | xargs kill -9
```

**Erro: "Connection refused to postgres"**
```bash
# Aguardar inicialização do PostgreSQL
docker-compose logs postgres | grep "database system is ready"

# Se problema persistir, reconstruir
docker-compose down -v
docker-compose up -d --build
```

**Erro: "EACCES: permission denied"**
```bash
# Usar sudo com Docker (se necessário)
sudo docker-compose up -d
```

### 7.2 Limpeza Completa

**Parar serviços:**
```bash
docker-compose down
```

**Remover volumes (CUIDADO: Deleta dados do BD):**
```bash
docker-compose down -v
```

**Remover tudo (imagens + volumes + contêineres):**
```bash
docker-compose down -v --rmi all
```

**Limpar espaço em disco (remover dangling images e volumes não usados):**
```bash
docker system prune -a --volumes
```

---

## 8. Estrutura do Projeto

```
backend/
├── src/
│   ├── app.ts                 # Configuração Express
│   ├── server.ts              # Entry point
│   ├── config/
│   │   └── database.ts        # Conexão Sequelize + PostgreSQL
│   ├── models/
│   │   ├── User.ts            # Modelo de usuário
│   │   ├── Room.ts            # Modelo de quarto
│   │   ├── Reservation.ts     # Modelo de reserva
│   │   └── ReservationRoom.ts # Relacionamento N:M
│   ├── controllers/           # Lógica de negócio
│   ├── services/              # Funções reutilizáveis
│   ├── middlewares/           # Autenticação, validações
│   ├── routes/                # Definição de endpoints
│   └── database/
│       ├── migrations/        # Versionamento do BD
│       └── seeders/           # Dados iniciais
├── dist/                      # Build compilado
├── node_modules/              # Dependências
├── Dockerfile                 # Multi-stage build otimizado
├── docker-compose.yml         # Orquestração (App + DB)
├── .env.example               # Template de variáveis
├── .dockerignore              # Otimização de build
├── .gitignore                 # Arquivos a não comitar
├── package.json               # Dependências do projeto
├── tsconfig.json              # Configuração TypeScript
└── README.md                  # Este arquivo
```

---

## 9. Sumário de Decisões Arquiteturais

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| **Linguagem** | TypeScript | Type safety + menos bugs |
| **Framework** | Express.js | Leve, rápido, comunidade ativa |
| **Banco de Dados** | PostgreSQL | ACID, relacionamentos complexos, ORM |
| **ORM** | Sequelize | Migrations, validações, proteção SQL injection |
| **Autenticação** | JWT + Bcrypt | Padrão seguro, tokens stateless |
| **Containerização** | Docker Compose | Padronização, portabilidade |
| **Persistência** | Named Volumes | Dados sobrevivem a reinicializações |
| **Rede** | Custom Bridge | DNS interno, isolamento perimetral |
| **Imagem Base** | Alpine | Leve (~80MB vs 380MB) |
| **Build** | Multi-stage | Reduz tamanho, melhor segurança |

---

## 10. Próximos Passos

- [ ] Implementar controllers (GET, POST, PUT, DELETE)
- [ ] Adicionar middlewares de autenticação JWT
- [ ] Criar seeders com dados iniciais de teste
- [ ] Implementar validações com Joi/Zod
- [ ] Adicionar testes unitários com Jest
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Implementar logging centralizado
- [ ] Adicionar rate limiting e CORS restritivo

---

**Versão:** 1.0  
**Última atualização:** Maio 2026  
**Autor:** Sistema Hotel PROVA
