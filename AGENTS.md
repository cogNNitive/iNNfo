# cogNNitive Agent Instructions

## SDD Default Preferences

Estas preferencias se aplican a todos los cambios SDD en este proyecto a menos que se anulen explícitamente.

- **Pace**: `auto` (Automático — ejecutar fases seguidas, frenar solo en riesgo alto)
- **Artifact Store**: `openspec` (archivos en el repo, trazables en revisión)
- **PR Strategy**: `single-pr-default` (un solo PR, a menos que la estimación exceda el presupuesto)
- **Review Budget**: `800` líneas máximas antes de parar y preguntar

## Skill Loading

cogNNitive usa el mecanismo nativo de OpenCode para descubrir y cargar skills. Los skills están definidos en `available_skills` del system prompt y se cargan via la tool `skill`.

### Skills del proyecto

Los skills definidos en `.agents/skills/` se cargan automáticamente según la descripción de cada uno. Si un skill no se carga cuando corresponde, invocá `/skill-name` o pedí "cargá el skill X" para cargarlo manualmente.

### Post-Mortem (si falló)

Si el usuario señala que un skill debería haberse cargado y no se cargó:
1. Aceptá el error sin excusas
2. Cargá el skill via la tool `skill` o pedile al usuario que lo invoque con `/skill-name`
