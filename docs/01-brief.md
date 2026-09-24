# Dedpuestas — Brief del proyecto

> Estado: **borrador v0.2** · Última revisión: 2026-09-24
> Proyecto: **Dedpuestas** · repo `dedpuestas`

## 1. Problema

Los fans de Dedsafio 4 siguen la serie en directo y comentan quién va a morir, pero no tienen dónde apostarlo ni dónde comparar sus predicciones con las de otros fans. El tracker de fans que existe muestra estadísticas, pero no permite participar, y además está saturado.

## 2. Propuesta

Una web donde los fans apuestan **Dedines**, una moneda virtual sin valor real, sobre lo que pasa en la serie: quién muere, quién sale del Gulag, qué equipo sobrevive. Los fans compiten en un ranking de pronosticadores.

La web tiene que dar a los streamers un motivo para mencionarla en directo. Por ejemplo: *"el 73 % de la gente apuesta a que muero esta semana"*.

## 3. Usuarios

| Perfil | Qué quiere |
|---|---|
| **Fan** (principal) | Apostar por o contra su streamer favorito, presumir de aciertos, seguir la serie con más emoción |
| **Streamer** | Ver qué piensa su comunidad de él; contenido para reaccionar en directo |
| **Administrador** (yo) | Abrir, cerrar y resolver mercados rápido, incluso desde el móvil |

La mayor parte del público es de Latinoamérica (México, Argentina, Colombia…) y entra desde el **móvil**.

## 4. Objetivos y métricas de éxito

| Objetivo | Métrica | Meta (propuesta) |
|---|---|---|
| Que lo usen | Usuarios registrados al 17/10 | 300 |
| Que vuelvan | Usuarios que apuestan en ≥ 3 días distintos | 30 % |
| Que se hable de ello | Menciones de un streamer en directo o en X | ≥ 1 |
| Que aguante | Disponibilidad durante los directos | 99 % |
| Portfolio DevOps | Repo público con CI/CD, IaC, observabilidad y documentación | Completo al 17/10 |

## 5. Alcance

### Dentro (primera versión)
- Registro y login con usuario y contraseña. Kick o Google llegarán más adelante.
- Dedines (moneda virtual): saldo inicial y bono diario.
- Mercados Sí/No sobre jugadores ("¿muere esta semana?") con porcentajes en vivo.
- Liquidación automática al resolver un mercado.
- Ranking de apostadores.
- Panel de administración.

### Fuera
- Dinero real, compra o canje de Dedines. **Nunca.**
- App móvil nativa (la web será responsive).
- Chat o comentarios.

## 6. Restricciones

| Tipo | Detalle |
|---|---|
| **Fechas** | La serie va del 21/09 al 17/10/2026. Primera versión antes del **Evento Boss del sábado 26/09**. Mercados del Gulag antes del **viernes 2/10**. |
| **Horario** | Directos de 15:00 a 22:00 GMT-6, es decir, de 23:00 a 06:00 en Italia. Los resultados se liquidan normalmente a la mañana siguiente. |
| **Equipo** | Una persona, apoyada por IA generativa. |
| **Presupuesto** | 0 €: servidor casero y Oracle Cloud Always Free. |
| **Legal** | Solo moneda virtual sin valor. Sitio de fans no oficial, sin relación con los organizadores de la serie. |
| **Datos** | No hay API oficial. Los resultados los carga el administrador a mano. |

## 7. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Pico de tráfico si un streamer la menciona | La web se cae en el peor momento | Cloudflare delante, pruebas de carga con k6, caché de las páginas públicas |
| Un streamer se molesta por "apostar a su muerte" | Mala imagen | Tono con humor; opción de retirarse a petición |
| Cuentas múltiples para conseguir más Dedines | Ranking injusto | CAPTCHA, límite de registros por IP, detección manual de cuentas sospechosas |
| Llegar tarde | La serie termina y se acaba el interés | Recortar alcance, nunca retrasar fechas |
| Resultados mal cargados | Pérdida de confianza | Resolver con enlace al clip como prueba; posibilidad de anular un mercado |
| Aprobación de Oracle lenta | No hay servidor en la nube | La primera versión corre en el servidor casero |

## 8. Preguntas abiertas

1. ~~Nombre del proyecto~~ → **Dedpuestas** (decidido 24/09). Dominio: pendiente.
2. ~~Nombre de la moneda~~ → **Dedines** (decidido 24/09).
3. ¿Contactar con los creadores del tracker de fans para colaborar **antes** o **después** del lanzamiento?
