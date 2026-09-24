# Dedpuestas — Requisitos

> Estado: **borrador v0.2** (cambio: login con usuario y contraseña en lugar de Discord) · Prioridad **MoSCoW**: **M**ust (imprescindible), **S**hould (importante), **C**ould (si da tiempo), **W**on't (ahora no)
> Hito: **MVP** = sábado 26/09 · **v1** = viernes 2/10 · **Final** = sábado 17/10

## Reglas de negocio

| Id | Regla |
|---|---|
| RN-1 | La moneda se llama **Dedines**; es virtual y sin valor. No se puede comprar, vender, transferir ni canjear. |
| RN-2 | Saldo inicial al registrarse: **1.000**. Bono diario: **+100** al reclamarlo, una vez por día (medianoche GMT-6). |
| RN-3 | Apuesta mínima **10**, máxima **el saldo disponible**. El saldo nunca puede ser negativo. |
| RN-4 | Sistema **parimutuel**: todo lo apostado va a un bote. Al resolver, el bote se reparte entre los ganadores en proporción a lo que apostó cada uno. La casa no se queda nada. |
| RN-5 | Si nadie acierta, o el mercado se **anula**, se devuelve lo apostado a todos. |
| RN-6 | Un mercado se cierra automáticamente a su hora de cierre, que por defecto es el inicio del directo (15:00 GMT-6). No se aceptan apuestas después. |
| RN-7 | Un mercado se anula si el jugador no participa ese día o si el resultado no se puede verificar. |
| RN-8 | Todo movimiento de saldo queda registrado en un **libro de movimientos inmutable**. El saldo se calcula a partir de ese libro. |
| RN-9 | Estados de un jugador: `vivo` → `gulag` → `vivo` (vuelve) o `eliminado`. |

## Historias de usuario

### Cuenta y saldo

**HU-01 · Registro y login con usuario y contraseña** · `M` · MVP
Como fan, quiero crearme una cuenta con un nombre de usuario y una contraseña, para empezar a apostar en segundos.
- [ ] El registro pide solo usuario (3–20 caracteres, único) y contraseña (mínimo 8). No pide email.
- [ ] La contraseña se guarda con hash **argon2id**, nunca en texto plano.
- [ ] Hay un CAPTCHA invisible (Cloudflare Turnstile) en registro y login, y límite de registros por IP, para frenar las cuentas múltiples.
- [ ] Tras 5 intentos fallidos de login, se bloquea ese usuario 15 minutos.
- [ ] Al crear la cuenta se acreditan 1.000 Dedines (RN-2).
- [ ] Sin email no hay "he olvidado mi contraseña": el administrador puede restablecerla (HU-33).

**HU-02b · Login con Kick o Google** · `C` · Final
Como fan, quiero entrar con mi cuenta de Kick o de Google, para no recordar otra contraseña.
- [ ] El modelo de datos separa el **usuario** de sus **formas de acceso** (contraseña, Kick, Google), así que añadir un proveedor no obliga a migrar cuentas.

**HU-02 · Bono diario** · `M` · MVP
Como fan, quiero reclamar Dedines cada día, para seguir jugando aunque pierda.
- [ ] El botón aparece solo si hoy no lo he reclamado.
- [ ] Dos clics seguidos no dan dos bonos.

**HU-03 · Rescate semanal** · `S` · v1
Como fan que se ha quedado a cero, quiero recibir 200 Dedines una vez por semana, para no quedarme fuera.

### Mercados y apuestas

**HU-10 · Ver mercados abiertos** · `M` · MVP
Como fan, quiero ver los mercados abiertos con el porcentaje de Dedines en cada opción, para decidir dónde apostar.
- [ ] Cada mercado muestra la pregunta, el jugador (avatar y equipo), el % Sí / No, el total del bote y la cuenta atrás hasta el cierre.
- [ ] Se puede filtrar por equipo y buscar por jugador.
- [ ] Se ve bien en un móvil de 360 px de ancho.

**HU-11 · Apostar** · `M` · MVP
Como fan, quiero apostar Dedines a Sí o No, para ganar si acierto.
- [ ] Antes de confirmar, veo cuánto ganaría si el mercado cerrase ahora.
- [ ] No puedo apostar más de mi saldo ni con el mercado cerrado (RN-3, RN-6).
- [ ] Si dos apuestas llegan a la vez, el saldo nunca queda negativo.

**HU-12 · Mis apuestas** · `M` · MVP
Como fan, quiero ver mis apuestas abiertas y resueltas, para saber cuánto he ganado o perdido.

**HU-13 · Mercados del Gulag** · `S` · v1
Como fan, quiero apostar a si un jugador sale del Gulag, para vivir el viernes con más emoción.

**HU-14 · Mercados por equipo** · `C` · Final
Como fan, quiero apostar a qué equipo tendrá más supervivientes al final.

**HU-15 · Número de muertes (más/menos)** · `C` · Final
Como fan, quiero apostar a si habrá más o menos de N muertes en un día.

### Ranking y parte social

**HU-20 · Ranking de pronosticadores** · `M` · MVP
Como fan, quiero ver un ranking por saldo total, para competir con otros.

**HU-21 · Ficha pública del streamer** · `S` · v1
Como streamer o fan, quiero una página por jugador con lo que opina la comunidad ("el 73 % cree que muere esta semana"), para compartirla.
- [ ] Tiene URL propia y previsualización en X y Discord (imagen OG generada).

**HU-22 · Compartir mi apuesta** · `S` · v1
Como fan, quiero compartir mi apuesta en X con una imagen, para presumir.

**HU-23 · Overlay para OBS** · `C` · Final
Como streamer, quiero un overlay con el % de gente que apuesta contra mí, para mostrarlo en directo.

**HU-24 · Retirarse de la web** · `S` · v1
Como streamer, quiero poder pedir que no se creen mercados sobre mí, y que se respete.

### Administración

**HU-30 · Gestionar mercados** · `M` · MVP
Como administrador, quiero crear, cerrar, resolver y anular mercados, para mantener la web al día.
- [ ] Botón "Crear mercados de la semana": genera "¿Muere esta semana?" para todos los jugadores vivos.
- [ ] Para resolver hay que indicar el resultado y, de forma opcional, un enlace al clip como prueba.
- [ ] Al resolver, la liquidación es automática y atómica: o se paga a todos o a nadie.

**HU-31 · Actualizar el estado de un jugador** · `M` · MVP
Como administrador, quiero marcar a un jugador como `gulag` o `eliminado` en pocos clics desde el móvil.

**HU-33 · Restablecer contraseña** · `M` · MVP
Como administrador, quiero generar una contraseña temporal para un usuario que la ha olvidado, que tendrá que cambiar al entrar.

**HU-32 · Reportes de la comunidad** · `C` · Final
Como fan, quiero reportar una muerte con el enlace al clip, para ayudar al administrador.

### Legal

**HU-40 · Aviso legal y términos** · `M` · MVP
- [ ] Hay una página de términos: moneda sin valor (RN-1), sitio de fans no oficial, todos los derechos de la serie pertenecen a sus creadores.
- [ ] El aviso "Dedines sin valor real · Sitio no oficial" aparece en el pie de todas las páginas.

## Requisitos no funcionales

| Id | Requisito | Cómo se comprueba |
|---|---|---|
| RNF-1 | **Rendimiento.** Aguantar 500 usuarios simultáneos con p95 < 500 ms en páginas y apuestas | Prueba de carga con k6 |
| RNF-2 | **Consistencia.** Ninguna apuesta ni liquidación deja saldos negativos o dobles | Tests de concurrencia; transacciones en la base de datos |
| RNF-3 | **Disponibilidad.** 99 % durante los directos | Uptime monitor y alertas |
| RNF-4 | **Seguridad.** HTTPS, sesiones seguras, rate limit en las apuestas, sin puertos públicos en el servidor | Revisión y escaneo en CI |
| RNF-5 | **Privacidad.** No se pide ni se guarda el email; contraseñas con argon2id; secretos fuera del repo | Revisión de código; escaneo de secretos |
| RNF-6 | **Móvil primero.** Usable a 360 px | Revisión en móvil real |
| RNF-7 | **Horas en la zona del usuario.** Las horas de cierre se muestran en la hora local de cada uno | Test con varias zonas horarias |
| RNF-8 | **Backups.** Copia diaria de la base de datos, restauración probada | Restaurar un backup en staging |
| RNF-9 | **Observabilidad.** Métricas, logs y alertas | Dashboard en Grafana |

## Won't (esta edición)

- Dinero real, compra o canje de Dedines.
- App móvil nativa.
- Chat, comentarios o mensajes privados.
- Datos automáticos desde fuentes oficiales (no hay API).
