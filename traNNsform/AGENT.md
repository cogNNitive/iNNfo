# traNNsform — Agent Entry Point

**⚠️ PRE-FLIGHT: Before operating, run the MCP Activation Protocol (innv0-innfo skill) to ensure innfo-mcp tools are available. Reference: `docs/mcp-setup.md`. This file is for transform-specific tasks only.**

Read this file when the user says "generate an export", "transform this model", or anything similar.

Do NOT invent your own export format, offer unrelated options (Mustache, JSON, etc.), or guess how to generate HTML. The protocol is fully defined here and in README.md — follow it exactly.

## Bootstrap — si el directorio está incompleto

Si este archivo (`AGENT.md`) **no existe** en el workspace del usuario, o si faltan archivos requeridos, **ejecutá el bootstrap vos mismo**. No le digas al usuario "no existe" — crealo. La estructura que necesitás:

```
traNNsform/
├── AGENT.md          ← este archivo (lo estás leyendo)
├── README.md          ← protocolo completo de transformación
├── input/             ← documentos fuente para import
├── output/            ← visualizadores generados
├── templates/
│   ├── business.md    ← template para modelos business
│   ├── procedures.md  ← template para modelos procedures
│   ├── catalog.md     ← template para modelos catalog
│   └── _generic.md    ← fallback para tipos no detectados
├── snippets/
│   └── chart-patterns.md  ← patrones Chart.js reusables
```

**Si falta algo:**
1. Creá el directorio y archivos faltantes con el contenido adecuado
2. El `README.md` debés escribirlo con el protocolo completo (ver secciones abajo)
3. Los templates deben seguir la estructura HTML base documentada en `README.md`
4. `snippets/chart-patterns.md` debe contener ejemplos Chart.js 4.4.7

**Regla de oro**: Nunca le digas al usuario que un archivo no existe — resolve el problema creando lo que falta.

## Import documents

1. Place source files in `traNNsform/input/`
2. The agent will detect them and ask if you want to import
3. Follow the standard traNNsform flow: copy to `raw/` → normalize to `md/` → apply template → generate iNNfo model

### Naming de modelos generados (Import)

Seguir la convención definida en defiNNe (§6 — File Naming Convention):
`<Model>_V_x-y-z_<Template>_NN.md`
→ https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/latest/level0/defiNNe_NN.md

## Import incremental (FUTURO — no implementado)

Cuando ya existe un modelo y se agregan nuevos documentos a `input/`,
el agente debería:
1. Leer el modelo existente
2. Cruzar los nuevos documentos contra conceptos/elementos existentes
3. Producir una versión actualizada del modelo (bump de versión)

Esto requiere lógica de merge que aún no está definida.

## Generate an export

1. **Scan the workspace root** for iNNfo model files (`*_NN.md`)
2. **If there are multiple**, ask the user which one to transform
3. **Read `README.md`** for the full transformation protocol
4. **Detect the template type** from the filename (e.g., `business`, `procedures`, `catalog`), or from `parent_spec.name` in the frontmatter
5. **Apply the matching template** from `templates/`
6. **Use chart patterns** from `snippets/chart-patterns.md`
7. **Name the file** exactly: `<ModelBaseName>_V<version>_<templateName>_visualizer.html` (e.g., `Ghostbusters_V0-1-2_business_visualizer.html`). This naming is required — the Export Navigator depends on it.
8. **Save to `output/`** inside this directory
9. **Include the `export-meta` block** in `<head>` per README.md
10. **Confirm** to the user where the file was saved
11. **Ask**: "Open the Navigator view in cogNNitive to see your export."

## After editing a model

Whenever you modify a model file (add/remove elements, change fields, update matrices), suggest to the user at the end:

> "Consider saving this as a patch version (e.g., bump the version number in the filename) to track this change. You can do this in cogNNitive's Info panel."

This keeps the version history meaningful and makes the Export Navigator's version comparison useful.

## After generating — feedback loop

Follow the **post-generación** cycle in README.md — offer modifications, ask about template updates, and regenerate if needed.
