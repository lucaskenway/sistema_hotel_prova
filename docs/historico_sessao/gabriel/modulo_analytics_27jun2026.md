# Sessão: Módulo Analytics — Inteligência Financeira e Operacional
**Data:** 27/06/2026
**Dev:** Gabriel (orquestrador)
**Branch:** feature/analytics-module → develop
**Duração estimada:** 1 sessão

---

## O que foi feito

### 1. Planejamento (RPI — R e P)
- Análise de quais KPIs hoteleiros fazem sentido para hotéis de pequeno e médio porte
- Identificação de que todos os dados necessários já existem no banco (payments, reservations, rooms, room_categories, guests)
- Decisão: usar `sequelize.query()` com raw SQL e `QueryTypes.SELECT` — zero mudança de schema
- Plano aprovado com 7 endpoints priorizados

### 2. Implementação (RPI — I)

**Arquivos criados:**

| Arquivo | Propósito |
|---------|-----------|
| `app/Controllers/AnalyticsApi/GetRevenueController.js` | Caixa realizado por mês + esperado + inadimplentes |
| `app/Controllers/AnalyticsApi/GetOccupancyController.js` | Taxa de ocupação + ADR + RevPAR |
| `app/Controllers/AnalyticsApi/GetAlertsController.js` | No-show risk, cleaning pendente, PENDING >48h |
| `app/Controllers/AnalyticsApi/GetSeasonalityController.js` | Histórico mensal (1–60 meses) |
| `app/Controllers/AnalyticsApi/GetRevenueByCategoryController.js` | Ranking de rentabilidade por tipo de quarto |
| `app/Controllers/AnalyticsApi/GetPaymentMixController.js` | PIX/CARTÃO/DINHEIRO com percentual via window function |
| `app/Controllers/AnalyticsApi/GetTopGuestsController.js` | Hóspedes por lifetime value |
| `routes/apis/analyticsRouter.js` | Router com authMiddleware + tenantMiddleware |

**Arquivos modificados:**

| Arquivo | O que mudou |
|---------|-------------|
| `routes/router.js` | Import + `router.use('/analytics', analyticsRouter)` |
| `config/swagger.js` | 7 endpoints documentados com schemas de resposta completos |
| `docs/PRODUCT_ROADMAP.md` | Módulo Analytics adicionado na Fase 2, cobertura atualizada para 78% |

**Documentos criados:**

| Arquivo | Público |
|---------|---------|
| `docs/planejamento_analytics_27jun2026.md` | Devs — especificação técnica com queries SQL e guia de verificação |
| `docs/analytics_valor_de_produto_27jun2026.md` | Grupo — documento de negócio sem código, com exemplos práticos e justificativa para o TCC |

### 3. Git
```
feature/analytics-module
  6108e14 feat(analytics): 7 endpoints de BI para hoteis
  cccabc5 docs(analytics): relatorio de planejamento
  f2aedd0 docs(roadmap): atualizar PRODUCT_ROADMAP com modulo analytics
  c586ee9 Merge feature/analytics-module → develop
  0224bce docs(analytics): documento de valor de produto para o grupo
  (swagger: commit desta sessão — ver abaixo)
```

---

## Decisões técnicas

| Decisão | Alternativa descartada | Motivo |
|---------|----------------------|--------|
| Raw SQL com `sequelize.query()` | ORM com models e includes | Queries analíticas com múltiplos JOINs, GROUPs e window functions são muito mais legíveis em SQL puro |
| Sem mudança de schema | Criar tabelas `analytics_*` | Zero retrabalho, zero migration de risco, mesmos dados já existem |
| `WHERE tenant_id = :tenantId` em toda query | Filtro pelo ORM | Named replacements do Sequelize são equivalentes a prepared statements — seguro contra SQL injection |
| Validação simples (400 com mensagem) | Sem validação | `months` e `limit` têm limites razoáveis; intervalos inválidos dariam queries muito pesadas |

---

## O que NÃO foi feito (pendências)

| Item | Prioridade | Motivo de não ter feito |
|------|-----------|------------------------|
| Teste runtime dos 7 endpoints | Alta | Ambiente K8s não estava rodando na sessão |
| Testes automatizados | Média | Fora do escopo desta sessão (meta de TCC, não desta entrega) |
| Cache para `/analytics/seasonality` | Baixa | Query aceitável para o volume atual; só vale com Redis, que é Fase 3 |

---

## Para o próximo dev

1. **Testar os endpoints** com ambiente K8s rodando:
   ```bash
   ./start.sh tunnel
   # Fazer login e testar cada GET /analytics/*
   # Verificar que admin@aurora.example e admin@sol.example veem dados separados
   ```

2. **Possível problema**: o campo `room_id` em `reservations` — verificar se a coluna FK existe no schema atual antes de rodar `/analytics/revenue-by-category` (faz JOIN reservations → rooms)

3. Os documentos de analytics estão em `develop`. Quando for fazer PR develop → main, eles sobem junto automaticamente.

---

## KPIs implementados (referência rápida)

| Sigla | Nome completo | Fórmula |
|-------|--------------|---------|
| ADR | Average Daily Rate | Receita / Diárias vendidas |
| RevPAR | Revenue Per Available Room | ADR × (Quartos ocupados / Total de quartos) |
| LTV | Lifetime Value | Soma histórica de `total_amount` por hóspede |
| No-show | — | CONFIRMED + check_in = hoje + sem pagamento |
