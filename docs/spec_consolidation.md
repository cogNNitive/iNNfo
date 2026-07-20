# Spec Consolidation â€” Documento de Trabajo

> **Nota**: Documento histÃ³rico. El modo `FOLDER` y el template `kb` fueron eliminados en V_0-2-0.
> La consolidaciÃ³n final adoptÃ³ 3 templates: `business`, `procedures`, `organization`.
> Fecha: 2026-07-01 (v3)
> PropÃ³sito: Unificar especificaciones del ecosistema iNNv0 bajo una arquitectura coherente.
> Estado: HistÃ³rico â€” reemplazado por V_0-2-0.

---

## Ãndice

1. [Arquitectura del Ecosistema](#1-arquitectura-del-ecosistema)
2. [Decisiones ArquitectÃ³nicas](#2-decisiones-arquitectÃ³nicas)
3. [Estructura de Repositorios](#3-estructura-de-repositorios)
4. [Plan de AcciÃ³n](#4-plan-de-acciÃ³n)
5. [Estrategia de IntegraciÃ³n de Apps](#5-estrategia-de-integraciÃ³n-de-apps)

---

## 1. Arquitectura del Ecosistema

### 1.1. JerarquÃ­a de niveles

El ecosistema se organiza en **4 niveles**, donde cada nivel aÃ±ade restricciones sobre el anterior:

```
NIVEL 0:  defiNNe â€” Meta-especificaciÃ³n: estructura, versionado, RFC 2119
NIVEL 1:  FORMAT â€” EspecificaciÃ³n concreta: concepts, elements, fields, markers, relationships
           Modos: FILE (documento Ãºnico) y FOLDER (nodo como carpeta)
NIVEL 2:  Templates â€” business, procedures, kb (knowledge base), anydeo (futuro)...
NIVEL 3:  Modelos â€” Ghostbusters, Onboarding, KnowledgeBase, VideoAd...
```

### 1.2. Principios

1. **defiNNe es la base comÃºn**: toda especificaciÃ³n del ecosistema se define en tÃ©rminos de defiNNe.
2. **Cada nivel aÃ±ade restricciones, nunca las relaja**: lo que defiNNe dice MUST, FORMAT y sus templates lo heredan.
3. **FORMAT es la Ãºnica especificaciÃ³n de nivel 1**: los antiguos FORMAT e iNNfo se unifican como **modos** (FILE y FOLDER) de una misma especificaciÃ³n.
4. **La nomenclatura del archivo solo codifica el nivel mÃ¡s bajo** (numÃ©ricamente mÃ¡s alto). Los niveles superiores se declaran en el frontmatter vÃ­a `parent`.
5. **Cada nivel declara su `parent` con versiÃ³n explÃ­cita**: la cadena completa es resoluble desde cualquier archivo.

### 1.3. Cadena de dependencias (versiones)

Cada archivo conoce su lugar en la jerarquÃ­a mediante `level` y `parent` en el frontmatter. La cadena se resuelve ascendiendo:

```
Ghostbusters_V_0-3-0_business_F.md  (level 3)
  â””â”€â”€ parent: "business_V_1-0-0" â†’ business_V_1-0-0_F.md  (level 2)
        â””â”€â”€ parent: "FORMAT_V_0-2-0" â†’ FORMAT_V_0-2-0_F.md   (level 1)
              â””â”€â”€ parent: "defiNNe_V_0-2-0" â†’ defiNNe_V_0-2-0_F.md  (level 0)
```

**Para la especificaciÃ³n completa** (frontmatter canÃ³nico, modos FILE/FOLDER, body sections, tipos de relaciÃ³n), consultar:
- [`specs/FORMAT_V_0-1-5_F.md`](../specs/FORMAT_V_0-1-5_F.md) â€” especificaciÃ³n actual
- [`specs/CHANGELOG.md`](../specs/CHANGELOG.md) â€” cambios entre versiones

---

## 2. Decisiones ArquitectÃ³nicas

### 2.1. UnificaciÃ³n FILE + FOLDER en una sola especificaciÃ³n

En lugar de tener FORMAT e iNNfo como dos especificaciones hermanas, se unifican bajo FORMAT con dos modos de representaciÃ³n. Esto elimina la duplicaciÃ³n de conceptos y permite que una misma aplicaciÃ³n procese ambos modos con el mismo cÃ³digo.

**Rationale**: ambos modos modelan los mismos concepts, elements, fields, markers. Lo que cambia es la representaciÃ³n fÃ­sica (FILE = un solo archivo, FOLDER = carpeta con `_F.md` por nodo). Unificar evita tener dos parsers, dos validadores, dos modelos de datos.

### 2.2. Meta-sistema de tipos de relaciÃ³n

FORMAT define un sistema polimÃ³rfico de relaciones donde cada tipo tiene una representaciÃ³n distinta segÃºn el modo:

| Tipo | FILE | FOLDER |
|------|------|--------|
| hierarchy | Index block (wikilinks) | Subdirectorios |
| evaluable_matrix | Markdown tabla sourceâ†’target | No aplica |
| graph_edge | Frontmatter `graph_edges` array | Frontmatter `graph_edges` |
| sequence | Concept type steps/sequence | Concept type steps/sequence |

Ver la spec en [`specs/FORMAT_V_0-1-5_F.md`](../specs/FORMAT_V_0-1-5_F.md) para definiciones completas.

### 2.3. Decisiones adicionales

| DecisiÃ³n | Valor |
|---|---|
| `parent` | Objeto con `name` + `url`. `name` es el filename sin `_F.md`. `url` es un tag de git inmutable |
| Modelos (level 3) | **Lightweight** â€” NO llevan template inline. Solo `parent` + datos |
| Templates (level 2) | **Rich** â€” Philosophy, Objectives, Specification, Template, Examples en el body |
| FORMAT (level 1) | **Rich** â€” Philosophy, Objectives, Specification, Template, Examples |
| defiNNe (level 0) | **Rich** â€” Philosophy, Objectives, Specification, Template, Examples |
| Spec resolver | La app descarga la cadena de parents al cargar un modelo y lo cachea en `specs/` |
| Cache | `specs/<parent.name>_F.md` por cada nivel. En cargas sucesivas, usa el cache |
| Skills | NO son especificaciones. Referencian specs por URL, nunca duplican contenido |

### 2.4. Persistencia de URLs

Cada versiÃ³n de cada especificaciÃ³n DEBE tener una URL que nunca cambie:

```
spec_url: "https://raw.githubusercontent.com/innV0/defiNNe/v0.2.0/defiNNe_V_0-2-0_F.md"
```

Estrategia primaria: **tag releases en GitHub** (gits tags inmutables). OpciÃ³n de respaldo: repositorio Ãºnico `innV0/specs/` como mirror inmutable.

---

## 3. Estructura de Repositorios

### 3.1. Principios

1. **Cada especificaciÃ³n tiene su propio repositorio**.
2. **MÃ­nima informaciÃ³n**: solo la especificaciÃ³n, templates, samples, y cÃ³digo de validaciÃ³n/generaciÃ³n.
3. **Skills referencian specs por URL** â€” no duplican.
4. **El website referencia specs por URL** â€” no las alberga.

### 3.2. Mapa de repositorios

```
innV0/
â”œâ”€â”€ defiNNe/         â† REPO NUEVO: meta-especificaciÃ³n
â”œâ”€â”€ FORMAT/          â† REPO EXISTENTE: editor, parser, templates
â”œâ”€â”€ iNNfo/           â† REPO EXISTENTE: migrar a docs de modo FOLDER (YA NO es spec separada)
â”œâ”€â”€ innV0_skills/    â† REPO EXISTENTE: agent skills, apuntan a specs por URL
â”œâ”€â”€ innV0.com/       â† REPO EXISTENTE: website sin specs embebidas (redirects)
â”œâ”€â”€ VidGeNN/         â† REPO EXISTENTE: fase 2 â€” migrar a template FORMAT
â”œâ”€â”€ iNNfo/      â† REPO ACTUAL: este documento, SDD changes, formato V_0-1-3
â””â”€â”€ specs/           â† REPO OPCIONAL: mirror inmutable de todas las specs
```

### 3.3. defiNNe sale de innV0.com

El `public/defiNNe/` actual en innV0.com debe reemplazarse por un redirect al raw del repo defiNNe.

---

## 4. Plan de AcciÃ³n

### Fase 0: ConsolidaciÃ³n de specs en iNNfo (COMPLETADA)

1. âœ… Finalizar documento `spec_consolidation.md` con decisiones.
2. âœ… Publicar `FORMAT_V_0-1-3_FORMAT.md` actualizada con workspace index, esquema unificado.
3. âœ… Template `kb_V_0-1-1_FORMAT.md` como ejemplo de modo FOLDER.
4. ðŸ”„ SDD consolidate-format-drivers: PR 1 (Core Abstraction), PR 2 (App Wiring), PR 3 (Data Completeness).

### Fase 1: Repositorios (PENDIENTE)

5. Crear repo `innV0/defiNNe` con `defiNNe_V_0-2-0_F.md`.
6. Actualizar spec FORMAT a `V_0-2-0` con modos, relaciones, RFC 2119.
7. Actualizar templates existentes con `level: 2`, `parent: "FORMAT_V_0-2-0"`.
8. Tag `v0.2.0` en git.
9. Actualizar README de iNNfo indicando migraciÃ³n a FORMAT modo FOLDER.

### Fase 2: Skills (PENDIENTE)

10. Auditar `innv0-format` skill: eliminar contenido duplicado de specs.
11. Actualizar skills manager para nueva estructura.

### Fase 3: App y librerÃ­a compartida (EN CURSO)

12. âœ… Crear `@innv0/format-core` con parser unificado, modelo de datos, validador, IO drivers.
13. ðŸ”„ Integrar en FORMAT app (Vue) â€” PR 2.3 del SDD.
14. Migrar iNNfo app (React) para que consuma `@innv0/format-core`.
15. Despreciar la spec separada de iNNfo.

### Fase 4: Website

16. Quitar `public/defiNNe/` de innV0.com, reemplazar con redirect.
17. Documentar modo FOLDER oficialmente en FORMAT docs.

### Fase 5: VidGeNN / Anydeo

18. Analizar migraciÃ³n de VUS a template FORMAT.

---

## 5. Estrategia de IntegraciÃ³n de Apps

### 5.1. SituaciÃ³n actual

- **FORMAT app**: Vue 3 + Pinia â†’ editor FILE mode funcional.
- **iNNfo app**: React + Radix â†’ knowledge base FOLDER mode funcional.
- Stack comÃºn: Vite + Tailwind + TypeScript.

### 5.2. Estrategia: librerÃ­a central compartida

No se fusionan las UIs. En su lugar se crea una **librerÃ­a TypeScript pura** que ambas apps consumen:

```
ðŸ“¦ @innv0/format-core/
  â”œâ”€â”€ parser.ts               â† Parser unificado FILE+FOLDER
  â”œâ”€â”€ types.ts                 â† Modelo de datos comÃºn
  â”œâ”€â”€ identity.ts              â† IdentityRegistry para IDs cualificados
  â”œâ”€â”€ metamodel.ts             â† ResoluciÃ³n de metamodelo efectivo
  â”œâ”€â”€ driver.ts                â† ModelDriver interface + createDriver factory
  â”œâ”€â”€ driver-file.ts           â† FileDriver implementaciÃ³n
  â”œâ”€â”€ driver-folder.ts         â† FolderDriver implementaciÃ³n
  â”œâ”€â”€ recursiveParser.ts       â† Parser recursivo con soporte driver/handle
  â”œâ”€â”€ validator.ts             â† Validador contra template + contenido FORMAT
  â””â”€â”€ index.ts                 â† Public API

ðŸ“¦ FORMAT app (Vue) â€” consume @innv0/format-core (modo FILE)
ðŸ“¦ iNNfo app (React) â€” consume @innv0/format-core (modo FOLDER)
```

### 5.3. Roadmap de la librerÃ­a

1. âœ… Parser: extraer a `@innv0/format-core`.
2. âœ… Modelo: tipar concepts, elements, fields, markers, relationships.
3. âœ… File/Folder driver: IO abstraction para ambos modos.
4. âœ… Validador: validar modelo contra template + contenido FORMAT.
5. âœ… Integrar en FORMAT app: sustituir parser inline por `@innv0/format-core` (SDD PR 1-2).
6. Pendiente: Integrar en iNNfo app para modo FOLDER.

---

## ApÃ©ndice: Diff de versionado

| Documento | VersiÃ³n actual | VersiÃ³n propuesta | `level` |
|-----------|---------------|-------------------|---------|
| `defiNNe.md` | `0.1.1` | `V_0-2-0` | `0` |
| `_format.md` (FORMAT) | `V_0-1-0` | `V_0-2-0` | `1` |
| `iNNfo.defiNNe.md` | `1.1.0` | *(desaparece como spec)* | â€” |
| `business_V_0-1-1_NN.md` | `V_0-1-1` | `V_1-0-0` | `2` |
| `procedures_V_0-1-1_NN.md` | `V_0-1-1` | `V_1-0-0` | `2` |
| Modelos (`Ghostbusters_V_...`) | `V_x-y-z` | Sin cambios | `3` |

---

*Este documento es un artefacto de trabajo vivo. Para la especificaciÃ³n completa, ver [`specs/FORMAT_V_0-1-5_F.md`](../specs/FORMAT_V_0-1-5_F.md).*
