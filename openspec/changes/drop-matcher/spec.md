# Drop Custom Skill Matcher â€” Spec

## Requirements

### REQ-1: Eliminar `agents/triggers.yaml`
- **AcciÃ³n**: Borrar el archivo completo
- **Criterio**: El archivo no debe existir post-cambio

### REQ-2: Eliminar `scripts/skill-matcher.mjs`
- **AcciÃ³n**: Borrar el archivo completo
- **Criterio**: El archivo no debe existir post-cambio

### REQ-3: Reemplazar Pre-Flight Protocol en `AGENTS.md`
- **AcciÃ³n**: Reemplazar lÃ­neas 12-45 (secciÃ³n `## Pre-Flight Protocol â€” Skill Loading (MANDATORY)` y todo su contenido) con una secciÃ³n mÃ¡s simple que:
  1. Explique que iNNfo usa OpenCode y el dispatch nativo de skills
  2. Liste los skills del proyecto y quÃ© hacen
  3. Tenga un Post-Mortem breve para cuando un skill no se carga (idem anterior, sin referencia al matcher)
- **Criterio**: No debe haber referencias a `triggers.yaml`, `skill-matcher.mjs`, `Pre-Flight Protocol`, ni al comando `node scripts/skill-matcher.mjs`

### REQ-4: No afectar otros archivos
- **Criterio**: NingÃºn otro archivo del repo debe ser modificado. Skills, configuraciones de OpenCode, docs no relacionados, etc. se conservan intactos.

## Scenarios

### SC-1: Happy path â€” agente en OpenCode
1. Usuario envÃ­a mensaje a OpenCode en iNNfo
2. OpenCode ve `available_skills` + descripciones
3. Modelo decide cargar el skill relevante via tool `skill`
4. Skill se carga y el agente procede
5. **VerificaciÃ³n**: funciona como antes, sin el matcher

### SC-2: Skill no se carga automÃ¡ticamente
1. Usuario nota que un skill no se activÃ³
2. Usuario invoca `/skill-name` directamente, o pide "cargÃ¡ el skill X"
3. **VerificaciÃ³n**: el mecanismo de Post-Mortem en AGENTS.md cubre este caso

### SC-3: No hay scripts rotos
1. Verificar que ningÃºn script en `package.json`, `scripts/`, o CI referencia `skill-matcher.mjs`
2. **VerificaciÃ³n**: cero referencias externas
