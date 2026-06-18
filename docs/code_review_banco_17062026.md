# Documento de Code Review — Requisitos de Banco de Dados
**Data:** 17/06/2026
**Autor:** Gabriel (sessão de banco de dados)
**Branch:** `develop`
**Commits a revisar:** `992f3ef` (SQL + diagrama lógico), `45fb54b` (PNGs)

> Documento destinado ao coordenador/revisor. Lista o que foi entregue, **como
> verificar cada item de forma independente**, as decisões técnicas que merecem
> atenção no review e os pontos em aberto.

---

## 1. Escopo desta entrega

Implementação dos requisitos acadêmicos de banco de dados:

| # | Entrega | Arquivo |
|---|---------|---------|
| 1 | 5 consultas de agregação | `queries/agregacoes.sql` |
| 2 | Seed com 165 registros (2 tenants) | `seed/seed_hotels.sql` |
| 3 | DDL de referência corrigido | `scripts/setup.sql` |
| 4 | Diagrama lógico + imagens | `modelagem/modelo_logico.mmd`, `modelagem/der.png`, `modelagem/modelo_logico.png` |

**Fora de escopo (não alterado):** `db/schema.sql` (fonte de verdade), código da
aplicação (`app/`, `routes/`, `middlewares/`), testes (`tests/`).

---

## 2. Como obter e revisar

```bash
git checkout develop
git pull origin develop

# Ver as mudanças principais
git show 992f3ef --stat
git show 992f3ef -- queries/agregacoes.sql
git show 992f3ef -- scripts/setup.sql
git diff 992f3ef~1 992f3ef -- seed/seed_hotels.sql
```

---

## 3. Checklist de verificação (rode e compare)

Cada comando abaixo é objetivo e independente.

```bash
# (1) Seed tem volume suficiente de inserções
grep -c "^INSERT" seed/seed_hotels.sql           # esperado: >= 15  (resultado: 17)

# (2) DDL não usa mais o nome antigo 'hotels'/'hotel_id'
grep -in "hotels\|hotel_id" scripts/setup.sql    # esperado: nenhuma linha

# (3) Há exatamente 5 consultas de agregação
grep -c "^-- CONSULTA" queries/agregacoes.sql    # esperado: 5

# (4) setup.sql cobre as 8 tabelas da fonte de verdade
grep -c "CREATE TABLE" scripts/setup.sql         # esperado: 8

# (5) Arquivos de diagrama existem e são PNGs válidos
file modelagem/der.png modelagem/modelo_logico.png
```

### Verificação funcional ponta a ponta (banco real)

```bash
# Sobe o ambiente (Postgres na porta 5432)
docker compose up -d postgres

# Cria o schema a partir do DDL de referência
psql -h localhost -U hotel_user -d gestao_hotel_review -f scripts/setup.sql

# Popula e RODA O SEED DUAS VEZES — o total deve permanecer 165 (idempotência)
psql -h localhost -U hotel_user -d gestao_hotel_review -f seed/seed_hotels.sql
psql -h localhost -U hotel_user -d gestao_hotel_review -f seed/seed_hotels.sql

# Confere contagem total
psql -h localhost -U hotel_user -d gestao_hotel_review -At -c \
"SELECT (SELECT count(*) FROM tenants)+(SELECT count(*) FROM room_categories)
 +(SELECT count(*) FROM rooms)+(SELECT count(*) FROM users)+(SELECT count(*) FROM guests)
 +(SELECT count(*) FROM reservations)+(SELECT count(*) FROM payments);"   # esperado: 165
```

> Esta validação já foi executada nesta sessão em um banco scratch: o seed rodou
> 2× mantendo **165 registros** e as 5 agregações retornaram resultados coerentes.

---

## 4. Detalhamento das entregas

### 4.1 `queries/agregacoes.sql` — 5 agregações
Cada consulta tem cabeçalho padronizado (o que faz, importância para o negócio,
índice utilizado, parâmetros). Todas filtram por `tenant_id` (isolamento) e
respeitam soft delete (`deleted_at IS NULL`).

| # | Consulta | Técnica | Valor de negócio |
|---|----------|---------|------------------|
| 1 | Receita por mês/ano | `SUM` + `date_trunc` | relatório financeiro |
| 2 | Taxa de ocupação por data | `COUNT`/`NULLIF` + `LEFT JOIN` período | KPI operacional |
| 3 | Ranking de quartos reservados | `COUNT` + `GROUP BY` + `LIMIT` | precificação |
| 4 | Ticket médio por categoria | `AVG` + `JOIN` categoria | análise de segmento |
| 5 | Top 10 hóspedes por estadias | `COUNT` + `GROUP BY guest_id` | fidelização |

### 4.2 `seed/seed_hotels.sql` — 165 registros
| Tabela | Aurora | Sol | Total |
|--------|-------:|----:|------:|
| tenants | — | — | 2 |
| room_categories | 3 | 2 | 5 |
| rooms | 15 | 10 | 25 |
| users | 3 | 2 | 5 |
| guests | 40 | 20 | 60 |
| reservations | 25 | 15 | 40 |
| payments | 18 | 10 | 28 |

Distribuição de status (Aurora): 8 CHECKED_OUT, 5 CONFIRMED, 5 PENDING,
4 CHECKED_IN, 3 CANCELLED. Há hóspedes recorrentes (ex.: Ana Souza com 4 estadias)
para tornar a consulta de fidelidade significativa.

### 4.3 `scripts/setup.sql` — DDL de referência
Espelha exatamente `db/schema.sql`: 8 tabelas, mesmas colunas/constraints/índices/
triggers, com comentários por coluna para fins didáticos. Corrigido o bug anterior
(`hotels`/`hotel_id` → `tenants`/`tenant_id`) e acrescentados `deleted_at` e a
tabela pivô `reservation_rooms` que faltavam.

### 4.4 Diagramas
`modelagem/modelo_logico.mmd` (erDiagram das 8 tabelas, com PK/FK/UK) renderizado
em `modelo_logico.png`; `der.png` renderizado de `DER.mmd`.

---

## 5. Decisões técnicas que merecem atenção no review

1. **Idempotência do seed.** `ON CONFLICT DO NOTHING` cobre violações de chave
   única **e** de exclusão. Como `payments` não tem chave única natural, a
   idempotência ali é garantida por um guard `NOT EXISTS` (por reserva + valor +
   data). **Ponto de review:** validar que rodar o seed 2× não duplica pagamentos.

2. **Constraint `EXCLUDE USING gist` em `reservations`.** Impede o mesmo quarto
   com períodos sobrepostos — vale para **qualquer** status (inclusive CANCELLED).
   As 40 reservas foram distribuídas em janelas de datas separadas por quarto para
   respeitar isso. **Ponto de review:** confirmar que não há sobreposição inserida.

3. **`tenant_id` denormalizado em `payments`.** Presente em `db/schema.sql` e
   mantido no `setup.sql` — acelera relatórios financeiros por tenant (consulta 1)
   sem `JOIN` com `reservations`. É uma denormalização intencional.

4. **`scripts/setup.sql` vs `db/schema.sql`.** São dois DDLs equivalentes. O oficial
   para migrations continua sendo `node command.js migrate` (Sequelize). O setup.sql
   é material de referência/acadêmico. **Ponto de review:** decidir se mantemos os
   dois sincronizados manualmente ou se consolidamos no futuro.

5. **Métodos de pagamento no seed** usam `PIX`/`DINHEIRO`/`CARTAO` (consistente com
   a aplicação). `db/schema.sql` não impõe CHECK em `method`, então não há conflito.

---

## 6. Pontos em aberto / sugestões

| # | Item | Severidade | Observação |
|---|------|-----------|------------|
| 1 | Sincronização `setup.sql` ↔ `schema.sql` é manual | 🟡 Média | Risco de divergência futura; considerar um único source |
| 2 | Diagrama lógico declara FKs de reserva como nullable | 🟢 Baixa | `db/schema.sql` usa `NOT NULL` + `ON DELETE RESTRICT`; o `.mmd` e `diagrama_logico.md` descrevem intenção alternativa — alinhar texto |
| 3 | PNGs versionados no git | 🟢 Baixa | Imagens binárias no repo; aceitável para entrega acadêmica |

---

## 7. Validação já executada nesta sessão

- ✅ Schema + seed aplicados em banco PostgreSQL 17 real (scratch)
- ✅ Seed idempotente: 165 registros após 1ª e 2ª execução
- ✅ Distribuição de status conforme especificado
- ✅ As 5 agregações executaram sem erro com resultados coerentes
  (ocupação 26,67% na data com check-ins; ticket médio por categoria; top hóspede)

---

*Para o histórico completo da sessão, ver
`docs/historico_sessao/sirlande/requisitos_banco_17062026.md`.*
