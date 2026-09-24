# ADR-0002 · PostgreSQL con libro de movimientos inmutable

- **Estado:** aceptado · 24/09/2026

## Contexto
Los Dedines no tienen valor, pero la **confianza** sí: si alguien ve su saldo cambiar sin motivo o que se pagó dos veces un mercado, se acaba el proyecto. En los picos (un Gulag, una mención en directo) habrá muchas apuestas a la vez.

## Decisión
- **PostgreSQL** como única base de datos.
- El saldo **no se guarda**: se calcula como `SUM(delta)` de `ledger_entry`. Cada movimiento (`signup_bonus`, `daily_bonus`, `bet`, `payout`, `refund`, `rounding`, `admin_adjust`) es una fila nueva; **nunca se actualiza ni se borra**.
- Apostar y resolver se hacen **en una transacción** con bloqueo de filas.
- Importes en **enteros** (`bigint`). Nada de `float`.

## Alternativas descartadas
- **Columna `balance` en `user` que se suma y resta:** más rápida de leer, pero un bug o una condición de carrera deja saldos imposibles sin rastro.
- **SQLite:** suficiente en volumen, peor en escrituras concurrentes y no practica lo que se usa en empresas.
- **MongoDB:** sin necesidad de documentos flexibles; perdemos transacciones y restricciones simples.

## Consecuencias
- ✅ Auditoría completa: cualquier saldo se puede explicar movimiento a movimiento.
- ✅ Un error se corrige con un movimiento compensatorio, no editando datos.
- ⚠️ Leer el saldo cuesta un `SUM`. Con índice en `(user_id)` es trivial a este volumen; si hiciera falta, una vista materializada.
