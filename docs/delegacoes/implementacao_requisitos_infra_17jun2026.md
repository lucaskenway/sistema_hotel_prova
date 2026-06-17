# Análise de Gap + Prompt de Delegação — Requisitos de Infraestrutura
**Data:** 17/06/2026
**Requisito fonte:** `requisitos_prova_infra.pdf` — Opção A (Docker/Orquestração Nativa)
**Analista:** Gabriel (dev senior / orquestrador)
**Para:** Weslley Lucas

---

## 1. Análise de Conformidade — Requisitos de Infraestrutura (Opção A)

### Matriz de Avaliação (pesos oficiais do PDF)

| Critério | Peso | Status | Detalhe |
|---|---|---|---|
| Eficiência da Imagem (Multi-stage, camadas, .dockerignore) | 20% | ✅ **CORRIGIDO** | Dockerfile já tinha multi-stage e layer cache correto. `.dockerignore` estava incompleto (faltavam `tests/`, `k8s/`, `.git/`) — corrigido nesta sessão. |
| Arquitetura de Rede — Custom Bridge com DNS interno | 25% | ✅ | `hotel_network` bridge declarada, comunicação via nome de serviço, sem IPs estáticos |
| Estrutura Multicamadas — App + DB + **Cache** | (2.2) | ✅ **CORRIGIDO** | Faltava Redis/Memcached. Serviço `redis:7-alpine` adicionado ao `docker-compose.yml` nesta sessão com named volume e healthcheck |
| Persistência — Named Volumes resilientes | 20% | ✅ | `postgres_data` + `redis_data` (novo) declarados como Named Volumes |
| Segurança — Isolamento de redes e usuário não-root | 20% | ✅ | `hotel_network` isolada, `USER node` no Dockerfile, `.env` não commitado |
| Automação CI/CD → ECR | 15% | 🔴 **FALTANDO** | Sem `.github/workflows/`. Pipeline não existe. |
| README.md com 7 seções de infra | (seção 7) | ❌ **INCOMPLETO** | README atual não tem: identificação Opção A, Detalhamento Técnico de Infraestrutura, Gestão de Segredos, Evidências CLI, `docker compose down -v` |

---

## 2. O Que Foi Corrigido Por Gabriel Nesta Sessão

| Arquivo | Problema | Correção |
|---|---|---|
| `docker-compose.yml` | Faltava serviço de Cache — requisito obrigatório "mínimo 3 serviços: App, DB e Cache" | Adicionado `redis:7-alpine` com `appendonly yes`, named volume `redis_data`, healthcheck e `REDIS_URL` no node_web |
| `.dockerignore` | Não excluía `tests/`, `k8s/`, `vitest.config.js`, `.git/`, `.gitattributes` — arquivos desnecessários entravam na imagem de produção | Completado com todas as exclusões corretas |

---

## 3. O Que Ainda Precisa Ser Feito (Delegar ao Weslley)

| # | Item | Impacto na nota |
|---|---|---|
| 1 | Pipeline CI/CD GitHub Actions → ECR | **15% da nota** |
| 2 | README.md com seções de infra completas | Critério de entrega obrigatório |

---

## 4. Prompt de Delegação — Para o Weslley usar com a IA

```
Você é um dev senior DevOps/Infra trabalhando em um projeto acadêmico (TCC) de
gestão hoteleira. Você vai implementar os requisitos de infraestrutura que ainda
estão faltando.

════════════════════════════════════════════════════════════
CONTEXTO DO PROJETO
════════════════════════════════════════════════════════════

Sistema: SaaS de gestão hoteleira multi-tenant
Stack: Node.js 24, Express 4, PostgreSQL 17, Docker, Nginx, Redis
Repositório: /home/gabri/sistema_gestao_hotel (WSL Ubuntu)
Branch de trabalho: develop
Opção escolhida: Opção A — Infraestrutura Baseada em Contêineres (Docker)

════════════════════════════════════════════════════════════
O QUE JÁ EXISTE E ESTÁ CORRETO (NÃO ALTERAR)
════════════════════════════════════════════════════════════

Já implementado e funcionando:
- Dockerfile: multi-stage build (deps + runner), Node.js 24 Alpine, USER node
- docker-compose.yml: 4 serviços — postgres, redis, node_web, nginx
  - postgres: PostgreSQL 17 com healthcheck e named volume postgres_data
  - redis: Redis 7 Alpine com appendonly yes, named volume redis_data, healthcheck
  - node_web: sem porta exposta ao host, depende de postgres E redis
  - nginx: proxy reverso, única porta exposta (80:80)
- .dockerignore: completo (exclui node_modules, tests, k8s, .git, .env)
- hotel_network: custom bridge, DNS interno por nome de serviço
- Named Volumes: postgres_data e redis_data declarados
- .env.example: variáveis documentadas sem valores reais
- README.md: existe com informações gerais, mas falta seções de infra

════════════════════════════════════════════════════════════
SUA TAREFA — 2 ITENS OBRIGATÓRIOS
════════════════════════════════════════════════════════════

Execute nesta ordem. Confirme cada item antes de avançar.

────────────────────────────────────────────────────────────
ITEM 1 — Criar pipeline CI/CD GitHub Actions (.github/workflows/docker-ecr.yml)
────────────────────────────────────────────────────────────
O requisito exige "Pipeline integrado ao Amazon ECR com evidência de push/deploy"
(15% da nota). Crie o arquivo .github/workflows/docker-ecr.yml.

O pipeline deve ter as seguintes etapas em ordem:

  1. TRIGGER: em push para a branch main

  2. JOB: build-and-push
     Runner: ubuntu-latest

  3. STEPS na ordem correta:
     a. Checkout do código (actions/checkout@v4)
     b. Configurar credenciais AWS usando secrets do GitHub:
        - AWS_ACCESS_KEY_ID  → secrets.AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY → secrets.AWS_SECRET_ACCESS_KEY
        - AWS_REGION → secrets.AWS_REGION (default: us-east-1)
        (usar: aws-actions/configure-aws-credentials@v4)
     c. Login no Amazon ECR
        (usar: aws-actions/amazon-ecr-login@v2)
     d. Build da imagem Docker com tag baseada no SHA do commit:
        - Tag 1: $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG  (IMAGE_TAG = github.sha)
        - Tag 2: $ECR_REGISTRY/$ECR_REPOSITORY:latest
        - ECR_REPOSITORY deve ser definido como variável de ambiente: hotel-backend
     e. Push das duas tags para o ECR
     f. Output: imprimir a URI completa da imagem publicada

  4. ENV vars no job:
     - ECR_REPOSITORY: hotel-backend

  5. Adicionar comentários explicando cada step para fins acadêmicos

IMPORTANTE: O arquivo deve ser válido YAML e executável.
O avaliador vai verificar a existência do arquivo e seu conteúdo.

────────────────────────────────────────────────────────────
ITEM 2 — Atualizar README.md com seções obrigatórias de infraestrutura
────────────────────────────────────────────────────────────
O PDF de requisitos (seção 7) exige que o README seja o "manual de operação e
planta arquitetural do sistema". Adicione as seções FALTANTES ao README.md existente
SEM apagar o que já existe.

O README atual já tem: descrição geral, containers, JWT, Swagger, Como Executar,
Estrutura do Projeto, Troubleshooting básico.

Adicione as seguintes seções NOVAS logo após a seção "## Containers Docker" atual:

SEÇÃO A — Identificação do Caminho de Infraestrutura
  Título: ## Infraestrutura — Opção A: Docker/Orquestração Local
  Conteúdo:
  - Declarar explicitamente que o projeto usa Opção A (Docker)
  - Listar os 4 serviços: postgres (DB), redis (Cache), node_web (App), nginx (Proxy)
  - Diagrama ASCII da arquitetura:
    Host → Nginx (porta 80) → node_web:3000 → postgres:5432
                                             → redis:6379

SEÇÃO B — Detalhamento Técnico da Infraestrutura
  Título: ## Detalhamento Técnico da Infraestrutura
  Sub-seções obrigatórias:
  
  ### Otimização da Imagem Docker
  - Explicar o multi-stage build: stage deps (npm ci --omit=dev) + stage runner
  - Mencionar Node.js 24 Alpine (imagem leve ~50MB vs ~900MB do node:24)
  - Mencionar execução como usuário não-root (USER node) para segurança
  - Mencionar .dockerignore excluindo node_modules, tests, docs, k8s
  
  ### Persistência de Dados (Named Volumes)
  - Explicar que Named Volumes são gerenciados pelo Docker daemon
  - postgres_data: persiste o banco PostgreSQL mesmo após docker compose down
  - redis_data: persiste cache Redis com appendonly yes (AOF — append-only file)
  - Bind mounts foram evitados (conforme boas práticas de produção)
  
  ### Rede e Comunicação (Custom Bridge)
  - Explicar hotel_network como Custom Bridge Network (driver: bridge)
  - DNS Interno: serviços se comunicam por nome (ex: node_web → postgres, não 172.x.x.x)
  - IPs estáticos proibidos — resolução via Service Discovery nativo do Docker
  - node_web sem ports expostos → acessível SOMENTE via nginx na rede interna
  
  ### Segurança
  - Variáveis de ambiente via .env (nunca hardcoded no código)
  - .env.example documenta as variáveis sem valores reais — .env no .gitignore
  - USER node no Dockerfile — container não executa como root
  - node_web e postgres sem portas expostas ao host — isolamento perimetral
  - JWT_SECRET rotacionável via variável de ambiente

SEÇÃO C — Gestão de Segredos e Configurações
  Título: ## Gestão de Segredos e Configurações
  Conteúdo:
  - Instrução: copiar .env.example para .env e preencher os valores
  - Mostrar o comando: cp .env.example .env
  - Listar cada variável com descrição do que ela configura
  - Aviso em destaque: ⚠️ NUNCA commite o arquivo .env ou senhas reais no repositório

SEÇÃO D — Evidências de Funcionamento (para o avaliador)
  Título: ## Evidências de Funcionamento
  Conteúdo — lista de comandos que o avaliador pode rodar para validar:

  # Verificar todos os containers rodando
  docker compose ps

  # Inspecionar a rede e verificar DNS interno
  docker inspect hotel_network

  # Testar resolução DNS interna (provar que não usa IPs)
  docker compose exec node_web ping -c 2 postgres
  docker compose exec node_web ping -c 2 redis

  # Verificar Named Volumes criados
  docker volume ls | grep sistema_gestao_hotel

  # Testar persistência: reiniciar postgres e verificar dados
  docker compose restart postgres
  curl http://localhost/health

  # Ver logs de todos os serviços
  docker compose logs --tail=20

  # Verificar pipeline CI/CD
  cat .github/workflows/docker-ecr.yml

SEÇÃO E — Limpeza após Avaliação
  Título: ## Limpeza após Avaliação
  Conteúdo:
  - Comando para parar e remover containers: docker compose down
  - Comando para remover TAMBÉM os volumes (dados): docker compose down -v
  - Aviso: usar -v remove todos os dados do banco e cache — irreversível

════════════════════════════════════════════════════════════
RESTRIÇÕES ABSOLUTAS — NÃO FAÇA
════════════════════════════════════════════════════════════

- NÃO altere docker-compose.yml (já está correto com os 4 serviços)
- NÃO altere Dockerfile (já está correto com multi-stage)
- NÃO altere .dockerignore (já está completo)
- NÃO altere app/Controllers/, app/Models/, routes/, middlewares/
- NÃO altere nenhum arquivo de teste em tests/
- NÃO faça push para main (apenas develop)
- NÃO use git add . ou git add -A

════════════════════════════════════════════════════════════
GIT — SEQUÊNCIA OBRIGATÓRIA
════════════════════════════════════════════════════════════

  git checkout develop
  git pull origin develop

  # Adicionar apenas os arquivos relevantes
  git add .github/workflows/docker-ecr.yml
  git add README.md

  git commit -m "feat(infra): adicionar pipeline CI/CD ECR e seções de infra no README

  - .github/workflows/docker-ecr.yml: pipeline build → tag → push para Amazon ECR
    acionado em push para main, usa GitHub Secrets para credenciais AWS
  - README.md: adicionadas seções obrigatórias do requisito de infra:
    Opção A identificada, Detalhamento Técnico (imagem/persistência/rede/segurança),
    Gestão de Segredos, Evidências de Funcionamento, Limpeza com down -v

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

  git push origin develop

════════════════════════════════════════════════════════════
CRITÉRIOS DE ACEITE — VERIFICAR ANTES DE ENCERRAR
════════════════════════════════════════════════════════════

  # 1. Pipeline existe?
  cat .github/workflows/docker-ecr.yml
  # Esperado: arquivo com steps de configure-aws-credentials, ecr-login, docker build, docker push

  # 2. Pipeline tem as 4 etapas obrigatórias?
  grep -c "configure-aws-credentials\|amazon-ecr-login\|docker build\|docker push" .github/workflows/docker-ecr.yml
  # Esperado: 4

  # 3. README tem as novas seções?
  grep -c "Opção A\|Named Volumes\|hotel_network\|Gestão de Segredos\|docker compose down -v" README.md
  # Esperado: 5 (uma ocorrência de cada)

  # 4. Working tree limpo?
  git status
  # Esperado: "nothing to commit, working tree clean"

  # 5. Push feito?
  git log origin/develop --oneline -3
  # Esperado: commit "feat(infra)" no topo

════════════════════════════════════════════════════════════
OUTPUT ESPERADO AO FINAL
════════════════════════════════════════════════════════════

1. .github/workflows/docker-ecr.yml criado e commitado
2. README.md atualizado com as 5 novas seções de infra
3. Tudo pushado para origin/develop
4. Relatório de sessão em docs/historico_sessao/weslley/requisitos_infra_17062026.md com:
   - O que foi implementado
   - Resultado dos 5 critérios de aceite (com saída real dos comandos)
   - Observações sobre o pipeline (ex: secrets que o avaliador precisa configurar no GitHub)
```

---

## 5. Perguntas de Conferência — Para o Weslley fazer ao Agente

Após o agente terminar, faça estas perguntas e exija a **saída real dos comandos**:

### Grupo A — Pipeline CI/CD

**1.** Rode `cat .github/workflows/docker-ecr.yml` e me mostre o conteúdo completo. Quero ver os steps: `configure-aws-credentials`, `amazon-ecr-login`, `docker build` e `docker push`.

**2.** Rode `grep "on:" .github/workflows/docker-ecr.yml` — deve mostrar que o trigger é `push` para `main`.

**3.** Rode `grep "secrets\." .github/workflows/docker-ecr.yml` — deve aparecer `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `AWS_REGION` como secrets (nunca hardcoded).

### Grupo B — README

**4.** Rode `grep -n "Opção A\|Detalhamento Técnico\|Named Volumes\|Gestão de Segredos\|docker compose down -v" README.md` — todas as 5 linhas devem aparecer.

**5.** Rode `wc -l README.md` — o arquivo deve ter crescido (era ~280 linhas, deve ter agora pelo menos 380).

### Grupo C — Git

**6.** Rode `git log origin/develop --oneline -3` — commit `feat(infra)` deve estar no topo.

**7.** Rode `git status` — deve retornar "nothing to commit, working tree clean".

**8.** O relatório foi criado? Rode `ls docs/historico_sessao/weslley/` e me mostre `requisitos_infra_17062026.md` na listagem.

### Grupo D — Verificação da Arquitetura Completa

**9.** Rode `grep "redis\|postgres\|node_web\|nginx" docker-compose.yml | grep "image:\|build:" ` — deve aparecer os 4 serviços.

**10.** Rode `grep -c "redis_data\|postgres_data" docker-compose.yml` — deve ser ≥ 2 (Named Volumes declarados).

---

*Documento criado por Gabriel em 17/06/2026*
*Correções do docker-compose.yml (Redis) e .dockerignore já aplicadas diretamente nesta sessão.*
