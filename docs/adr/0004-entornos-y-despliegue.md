# ADR-0004 · Docker Compose, staging casero, producción en Oracle Cloud

- **Estado:** aceptado · 24/09/2026

## Contexto
Presupuesto 0 €. Hay un servidor casero (amd64) ya expuesto con Cloudflare Tunnel. Oracle Cloud Always Free ofrece una VM ARM (2 OCPU / 12 GB desde junio de 2026), pero la aprobación de la cuenta Pay-As-You-Go puede tardar hasta una semana. Los directos son de noche en Europa: la web no puede depender de la luz o el router de casa.

## Decisión
- Todo en **contenedores** con **Docker Compose**: `app`, `db`, `cloudflared`, `backup`.
- **Imagen multi-arquitectura** (`linux/amd64` + `linux/arm64`) con `docker buildx`, publicada en **GHCR**.
- **staging** = servidor casero; se despliega solo al hacer merge en `main`.
- **production** = Oracle Cloud A1; se despliega con **aprobación manual** (GitHub Environments).
  Mientras Oracle no esté listo, production también corre en el servidor casero.
- **Entrada solo por Cloudflare Tunnel**: ningún puerto abierto a internet.
- **SSH solo por Tailscale**; el despliegue desde GitHub Actions entra también por Tailscale.
- Guardarraíles de coste en Oracle: **Quota Policies** + alerta de presupuesto de 1 €, luego en Terraform.

## Alternativas descartadas
- **Kubernetes (k3s) desde el día 1:** buen aprendizaje, pero demasiada complejidad para la primera versión. Queda para la fase 4.
- **Vercel / Railway:** despliegue en un clic, pero no se aprende DevOps y los planes gratuitos tienen límites en picos.
- **AWS Free Tier:** la cuenta gratuita termina el 11/10, antes que la serie.

## Consecuencias
- ✅ Mismo `compose.yaml` en local, staging y producción: solo cambian las variables.
- ✅ Superficie de ataque mínima.
- ⚠️ Staging en casa puede caerse; es aceptable porque no es público.
- ⚠️ Hay que probar que la imagen arm64 funciona (argon2 y Prisma tienen binarios nativos).
