# Relatório de Sessão — Requisitos Acadêmicos de Banco de Dados
**Data:** 17/06/2026
**Branch:** develop
**Commits:** `992f3ef` (DB), `45fb54b` (PNGs dos diagramas)

---

## Objetivo

Implementar os requisitos acadêmicos de banco de dados do TCC: consultas de
agregação, expansão do seed para 120+ registros, correção do DDL de referência
e geração das imagens dos diagramas.

---

## O que foi feito (arquivos)

| Arquivo | Ação | Detalhe |
|---------|------|---------|
| `queries/agregacoes.sql` | criado | 5 consultas de agregação comentadas (importância + índice + parâmetros) |
| `seed/seed_hotels.sql` | substituído | Seed idempotente com 165 registros em 2 tenants |
| `scripts/setup.sql` | substituído | DDL de referência espelhando `db/schema.sql` (hotels→tenants), com comentários por coluna |
| `modelagem/modelo_logico.mmd` | criado | Diagrama lógico (erDiagram) das 8 tabelas |
| `modelagem/der.png` | gerado | DER renderizado a partir de `DER.mmd` |
| `modelagem/modelo_logico.png` | gerado | Modelo lógico renderizado a partir de `modelo_logico.mmd` |

### As 5 consultas de agregação
1. Receita total por mês/ano (`SUM` + `date_trunc`)
2. Taxa de ocupação por data (`COUNT`/`NULLIF` + `LEFT JOIN` com filtro de período)
3. Ranking de quartos mais reservados (`COUNT` + `GROUP BY` + `LIMIT`)
4. Ticket médio por categoria (`AVG` + `JOIN room_categories`)
5. Top 10 hóspedes por número de estadias (`COUNT` + `GROUP BY guest_id`)

### Distribuição do seed (165 registros)
| Tabela | Aurora | Sol | Total |
|--------|-------:|----:|------:|
| tenants | — | — | 2 |
| room_categories | 3 | 2 | 5 |
| rooms | 15 | 10 | 25 |
| users | 3 | 2 | 5 |
| guests | 40 | 20 | 60 |
| reservations | 25 | 15 | 40 |
| payments | 18 | 10 | 28 |
| **Total** | | | **165** |

Distribuição de status (Aurora): 8 CHECKED_OUT, 5 CONFIRMED, 5 PENDING, 4 CHECKED_IN, 3 CANCELLED.

---

## Validação executada (banco real PostgreSQL 17)

O seed e o DDL foram aplicados em um banco scratch (`seed_scratch`) para validação
antes do commit.

**Idempotência comprovada** — seed rodado 2x, total permaneceu 165:
```
run 1: total = 165
run 2: total = 165 (idêntico)
```

**As 5 agregações executaram sem erro**, com resultados coerentes. Exemplos:
```
Ocupação em 2026-06-17:  15 quartos, 4 ocupados, 26.67%
Top hóspede Aurora:      Ana Souza — 4 estadias (cliente recorrente do seed)
Ticket médio:            Presidencial 2933.33 | Suite 1150.00 | Standard 525.00
```

---

## Critérios de aceite

| # | Verificação | Esperado | Resultado |
|---|-------------|----------|-----------|
| 1 | `grep -c "^INSERT" seed/seed_hotels.sql` | ≥ 15 | **17** ✅ |
| 2 | `grep -in "hotels\|hotel_id" scripts/setup.sql` | nenhuma | **nenhuma ocorrência** ✅ |
| 3 | `grep -c "^-- CONSULTA" queries/agregacoes.sql` | 5 | **5** ✅ |
| 4 | Arquivos obrigatórios existem | todos | **todos presentes** ✅ |
| 5 | `git status` working tree | limpo | **limpo** (apenas PNGs, depois commitados) ✅ |
| 6 | `git log origin/develop` | commit de DB no topo | **`992f3ef` + `45fb54b` pushados** ✅ |

---

## Problemas encontrados e resolução

1. **Renderização dos PNGs falhou inicialmente** — `@mermaid-js/mermaid-cli` usa
   Chrome headless, que faltava bibliotecas no WSL (`libnspr4.so`).
   **Resolução:** instaladas as libs (`libnspr4`, `libnss3`, `libasound2t64`) e
   ambos os PNGs foram gerados com sucesso (der.png 784×484, modelo_logico.png 784×1077).

2. **Invocação do mmdc** — o comando sugerido `npx @mermaid-js/mermaid-cli mmdc -i ...`
   falhava ("too many arguments"), pois o binário do pacote já é o `mmdc`.
   **Resolução:** usar `npx @mermaid-js/mermaid-cli -i ... -o ...` (sem o `mmdc` extra).

3. **Constraint EXCLUDE de reservations** — o mesmo quarto não pode ter reservas
   com períodos sobrepostos (vale para qualquer status).
   **Resolução:** as 40 reservas foram distribuídas em janelas de datas separadas
   por quarto; idempotência garantida via `ON CONFLICT DO NOTHING` (que captura
   violação de exclusão) e `NOT EXISTS` em `payments` (que não tem unique natural).

4. **Trabalho commitado por outro agente em paralelo** — os arquivos SQL/mmd foram
   commitados em `992f3ef` por outro agente da sessão antes do meu commit.
   **Resolução:** verifiquei que o conteúdo commitado é exatamente o produzido
   (5 consultas, 17 INSERTs, 0 refs a hotels) e adicionei apenas os 2 PNGs
   restantes em `45fb54b`.

---

*Relatório gerado em 17/06/2026.*
