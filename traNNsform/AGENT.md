# traNNsform — Agent Entry Point

**⚠️ Read this file FIRST when the user says "generate an export", "transform this model", or anything similar.**

Do NOT invent your own export format, offer unrelated options (Mustache, JSON, etc.), or guess how to generate HTML. The protocol is fully defined here and in README.md — follow it exactly.

## Bootstrap — si el directorio está incompleto

Si este archivo (`AGENT.md`) **no existe** en el workspace del usuario, o si faltan archivos requeridos, **ejecutá el bootstrap vos mismo**. No le digas al usuario "no existe" — crealo. La estructura que necesitás:

```
traNNsform/
├── AGENT.md          ← este archivo (lo estás leyendo)
├── README.md          ← protocolo completo de transformación
├── templates/
│   ├── business.md    ← template para modelos business
│   ├── procedures.md  ← template para modelos procedures
│   ├── catalog.md     ← template para modelos catalog
│   └── _generic.md    ← fallback para tipos no detectados
├── snippets/
│   └── chart-patterns.md  ← patrones Chart.js reusables
└── outputs/           ← (se crea solo al guardar un export)
```

**Si falta algo:**
1. Creá el directorio y archivos faltantes con el contenido adecuado
2. El `README.md` debés escribirlo con el protocolo completo (ver secciones abajo)
3. Los templates deben seguir la estructura HTML base documentada en `README.md`
4. `snippets/chart-patterns.md` debe contener ejemplos Chart.js 4.4.7
5. `outputs/` se crea automáticamente al guardar el primer export

**Regla de oro**: Nunca le digas al usuario que un archivo no existe — resolve el problema creando lo que falta.

## Generate an export

1. **Scan the workspace root** for iNNfo model files (`*_NN.md`)
2. **If there are multiple**, ask the user which one to transform
3. **Read `README.md`** for the full transformation protocol
4. **Detect the template type** from the filename (e.g., `business`, `procedures`, `catalog`), or from `parent_spec.name` in the frontmatter
5. **Apply the matching template** from `templates/`
6. **Use chart patterns** from `snippets/chart-patterns.md`
7. **Name the file** exactly: `<ModelBaseName>_V<version>_<templateName>_visualizer.html` (e.g., `Ghostbusters_V0-1-2_business_visualizer.html`). This naming is required — the Export Navigator depends on it.
8. **Save to `outputs/`** inside this directory
9. **Include the `export-meta` block** in `<head>` per README.md
10. **Confirm** to the user where the file was saved
11. **Ask**: "Open the Navigator view in cogNNitive to see your export."

## After editing a model

Whenever you modify a model file (add/remove elements, change fields, update matrices), suggest to the user at the end:

> "Consider saving this as a patch version (e.g., bump the version number in the filename) to track this change. You can do this in cogNNitive's Info panel."

This keeps the version history meaningful and makes the Export Navigator's version comparison useful.

## After generating — feedback loop

Follow the **post-generación** cycle in README.md — offer modifications, ask about template updates, and regenerate if needed.
