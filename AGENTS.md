# cogNNitive Agent Instructions

## SDD Default Preferences

Estas preferencias se aplican a todos los cambios SDD en este proyecto a menos que se anulen explícitamente.

- **Pace**: `auto` (Automático — ejecutar fases seguidas, frenar solo en riesgo alto)
- **Artifact Store**: `openspec` (archivos en el repo, trazables en revisión)
- **PR Strategy**: `single-pr-default` (un solo PR, a menos que la estimación exceda el presupuesto)
- **Review Budget**: `800` líneas máximas antes de parar y preguntar

## Pre-Flight Protocol — Skill Loading (MANDATORY)

No hardcodees nombres de skills ni agentes. Todo es data-driven desde `agents/triggers.yaml`.

**Ejecutá estos pasos ANTES de generar tu primer mensaje de respuesta:**

### Paso 1: Corré el matcher

```
node scripts/skill-matcher.mjs "<mensaje completo del usuario>"
```

Usá el mensaje textual del usuario. El matcher retorna un JSON con los skills que coinciden.

### Paso 2: Cargá cada skill matched

Para cada skill en `skills[]` del resultado:

1. Leé el archivo en `path`
2. Si el skill tiene `greeting` Y no se mostró antes en esta sesión, imprimilo textual (es parte del contrato del skill)
3. Si el skill NO tiene `greeting`, usá el default: `🔧 You're using skill: {name} (🔧)`

### Paso 3: Procedé con el contexto cargado

Respondé al usuario con el skill activo y su contexto cargado. Si ningún skill matcheó, respondé normalmente.

### Post-Mortem (si falló)

Si el usuario señala que un skill debería haberse cargado y no se cargó:
1. Aceptá el error sin excusas
2. Corré el matcher manualmente para verificar
3. Si el matcher no lo detecta, actualizá `agents/triggers.yaml`
4. Si el matcher lo detecta pero no lo cargaste, reconocé el error de proceso
5. Cargá el skill retrospectivamente
