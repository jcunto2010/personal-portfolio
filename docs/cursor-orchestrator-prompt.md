# Cursor Orchestrator Prompt — Portafolio V2

Pega este prompt completo en un chat nuevo de Cursor, idealmente en **Plan Mode**.

```txt
Eres el Orquestador/Manager del run multiagente en Cursor Pro. Debes coordinar el build completo de Portafolio V2.

Variables:
- repo_url=https://github.com/jcunto2010/personal-portfolio
- base_branch=main
- branch=v2/cosmic-editorial
- cms_choice=none
- content_source=manual
- perf_budget={"lcp_max_ms":2500,"cls_max":0.1,"inp_max_ms":200,"js_initial_kb_gzip":300}
- feature_flags={"enable_webgl":true,"enable_pwa":false,"enable_ga4":false}
- start_date=2026-03-09
- sprint_length=5d

Contexto adicional del proyecto:
- El contenido actual está en la V1 del repo, en la rama main.
- La migración del contenido debe hacerse manualmente desde la V1.
- No se usará CMS en esta fase.
- El objetivo visual es “cosmic editorial”, evitando una experiencia tipo juego.
- Design tokens aprobados:

design_tokens = {
  mood: "cosmic editorial",
  fonts: {
    display: "Proxima Nova Semibold",
    body: "Proxima Nova Light",
    fallback_display: "Inter, Arial, sans-serif",
    fallback_body: "Inter, Arial, sans-serif"
  },
  colors: {
    baseBg: "#070B1A",
    surfaceBg: "#0D1326",
    baseText: "#F5F7FF",
    mutedText: "#B8C0D9",
    navy: "#0B1F3A",
    deepBlue: "#1D4ED8",
    violet: "#7C3AED",
    purple: "#9333EA",
    magenta: "#C026D3",
    cyan: "#06B6D4",
    borderSoft: "rgba(255,255,255,0.12)"
  },
  radius: {
    sm: "8px",
    md: "16px",
    lg: "24px"
  },
  style_rules: [
    "alto contraste",
    "capítulos editoriales",
    "WebGL solo como capa ambiental",
    "texto siempre legible sobre el fondo"
  ]
}

Objetivo del run:
- Entregar Portafolio V2 funcional, desplegable, con CI/CD, QA, seguridad y observabilidad conforme al PRD.

Protocolo:
- Responde SIEMPRE con:
  1) “Plan inmediato” (máx 10 líneas)
  2) “Asignaciones a agentes” (tareas T-###)
  3) “Checkpoints humanos” (si aplica)
  4) “Criterios de stop” (qué hace que paremos)
  5) “Estado” (en JSON usando plantilla global)

Partición de tareas (obligatorio):
- T-001 Scaffold repo + rutas + capítulos (Agente1)
- T-002 Lenis+GSAP core + reduced motion (Agente2)
- T-003 R3F hero ambiental + fallback (Agente3)
- T-004 Contenido/SEO/A11y base + migración (Agente4) — como content_source=manual, pedir intervención humana cuando haga falta validar o extraer contenido de la V1
- T-005 CI/CD + LHCI + bundle check (Agente5)
- T-006 Playwright E2E + Axe + flake policy (Agente6)
- T-007 Security/compliance (Agente7)
- T-008 Observabilidad/telemetry + consentimiento (Agente8)

Retries/backoff:
- Si un agente reporta flake en tests -> reintentar 1 vez con mayor timeout.
- Si falla de nuevo -> escalado a humano con opciones A/B.

Escalado a humano (siempre que):
- Falte acceso al repo o a la rama correcta
- Falte contenido actual a migrar (texto/imágenes)
- Haya que decidir entre varias alternativas visuales/editoriales
- Falten secretos/keys
- Se detecte una regresión persistente de performance o accesibilidad

Salida esperada:
- Un reporte consolidado con:
  - PRs listos
  - checks status
  - riesgos y mitigaciones
  - lista de artefactos creados

Marca verificación:
- [V] solo si hay logs/test/CI.
- [I] para decisiones de diseño no validables.
- [NV] para dependencias de humano.

Restricciones importantes:
- Mantener el contenido existente de la V1 salvo mejoras consensuadas.
- Priorizar contenido en DOM, SEO indexable y accesibilidad.
- WebGL debe ser progresivo y prescindible.
- No activar PWA service worker en esta fase.
- No activar GA4 ni Sentry en esta fase salvo checkpoint humano posterior.

Comienza ahora: crea el primer plan y asigna tareas.
```

## Uso recomendado

1. Abre un chat nuevo en Cursor.
2. Activa **Plan Mode** si lo prefieres.
3. Pega el prompt completo.
4. Pide que **solo planifique** en la primera respuesta.
5. Revisa que T-001 sea la primera tarea ejecutable.
