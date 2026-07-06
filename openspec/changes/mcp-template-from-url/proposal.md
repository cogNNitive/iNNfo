# Proposal: Eliminar TEMPLATE_SPECS hardcodeado, resolver template desde parent_spec.url

## Intent

Eliminar el mapa `TEMPLATE_SPECS` hardcodeado en `packages/innfo-mcp/src/tools/spec.ts` que tiene versiones incorrectas (V_0-2-0 vs. V_0-1-1/V_0-1-2 reales) y construye URLs que no reflejan la estructura actual del repo (falta `level2/{domain}/`). En lugar de derivar manualmente URLs desde un mapa estático, resolver el template directamente desde `parent_spec.url` que cada modelo ya declara en su frontmatter — la fuente de verdad.

## Scope

### In Scope
- `packages/innfo-mcp/src/tools/spec.ts`: agregar `getTemplateFromUrl(url, name, rootDir)` que llama a `resolveParentChain` directo, sin pasar por `TEMPLATE_SPECS`.
- `packages/innfo-mcp/src/tools/mutate.ts`: en `validateModel()` y `applyChange()`, reemplazar `getTemplate(rootDir, derivedName, ...)` por `getTemplateFromUrl(rootDir, parent_spec.url, parentName)`.
- Mantener `getTemplate()` legacy para `handleGetTemplate()` (MCP client solo manda `name`, no URL).

### Out of Scope
- Cambios en `packages/innfo-core/src/resolver.ts` — ya tiene el fix de level 3 fallback.
- Refactor de `handleGetTemplate()` ni su interfaz MCP.
- Ningún cambio de comportamiento en la API pública del MCP server.

## Capabilities

### New Capabilities
None — refactor interno, sin nuevos contratos de especificación.

### Modified Capabilities
None — comportamiento en la API pública no cambia.

## Approach

1. **`spec.ts`**: Exportar `getTemplateFromUrl(url, name, rootDir)` que construye el cache path con `name`, llama `resolveParentChain(url, name, cacheDir)` y extrae el template via `coreGetTemplate(cache)`. Sin `TEMPLATE_SPECS`, sin `SPEC_BASE_URL`.
2. **`mutate.ts`**: En `validateModel()` (línea 115) y `applyChange()` (línea 205), cambiar de:
   ```ts
   template = await getTemplate(rootDir, templateName, modelVersion)
   ```
   a:
   ```ts
   template = await getTemplateFromUrl(rootDir, model.frontmatter.parent_spec.url, parentName)
   ```
3. Verificar que `parent_spec.url` existe antes de llamar (ya se chequea `parent_spec.name`, mismo guard).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/innfo-mcp/src/tools/spec.ts` | Modified | Agregar `getTemplateFromUrl()`. Mantener `getTemplate()` legacy. |
| `packages/innfo-mcp/src/tools/mutate.ts` | Modified | Template resolution lines 115 and 205. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `parent_spec.url` ausente en un modelo existente | Low | Ya hay guard `if (parent_spec.name)`. Si falta `url`, `resolveParentChain` falla y retorna null — mismo comportamiento que antes. |
| `getTemplateFromUrl` no cubre el fallback de lectura directa que `getTemplate()` tiene (líneas 133-151) | Medium | Evaluar si ese fallback (leer `.spec-cache/{templateName}_NN.md` directo) es necesario. Si `resolveParentChain` ya cachea, el fallback sobra. Preguntar en spec/design. |

## Rollback Plan

Revertir los cambios en `spec.ts` y `mutate.ts`. El `TEMPLATE_SPECS` hardcodeado se restaura. `getTemplateFromUrl()` se elimina. `getTemplate()` legacy queda como única ruta.

## Dependencies

Ninguna.

## Success Criteria

- [ ] `validateModel()` resuelve el template correcto para un modelo cuyo `parent_spec.url` apunta a `https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/level2/business/business_V_0-1-1_NN.md`
- [ ] `applyChange()` también resuelve el template correcto post-mutación
- [ ] `getTemplate()` legacy sigue funcionando para `handleGetTemplate()` (solo por nombre)
- [ ] Todos los tests existentes pasan (`npm run test` en packages/innfo-mcp)
