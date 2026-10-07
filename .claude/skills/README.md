# Skills del proyecto

Una *skill* es un conjunto de instrucciones expertas en Markdown que un asistente de IA
carga cuando la tarea lo requiere (por ejemplo: auditoría SEO, optimización GEO,
rendimiento, seguridad, redacción de contenido).

## Formato

```
.claude/skills/
  nombre-de-la-skill/
    SKILL.md          ← obligatorio: frontmatter (name, description) + instrucciones
    references/       ← opcional: material de apoyo
    scripts/          ← opcional: scripts que la skill usa
```

Ejemplo de `SKILL.md`:

```markdown
---
name: seo-audit
description: Auditoría SEO técnica y on-page del sitio. Usar al crear o revisar páginas, metadatos o contenido.
---

# Instrucciones
1. ...
```

## Portabilidad

- **Claude Code** detecta automáticamente las skills de esta carpeta.
- **Otras herramientas** (Cursor, Copilot, Codex, Gemini…) pueden leerlas como Markdown:
  `AGENTS.md` indica a cualquier agente que las revise antes de trabajar en un área.
- Mantén las skills **específicas de este proyecto** (marca, stack Astro, reglas de CSP) y
  sin secretos ni credenciales.

## Skills instaladas

_(Se irán agregando: SEO, GEO, rendimiento, seguridad, contenido…)_
