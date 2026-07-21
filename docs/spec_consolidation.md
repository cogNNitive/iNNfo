# Spec Consolidation Ã¢â‚¬” Documento de Trabajo

> **Nota**: Documento histÃƒÂ³rico. El modo `FOLDER` y el template `kb` fueron eliminados en V_0-2-0.
> La consolidaciÃƒÂ³n final adoptÃƒÂ³ 3 templates: `business`, `procedures`, `organization`.
> Fecha: 2026-07-01 (v3)
> PropÃƒÂ³sito: Unificar especificaciones del ecosistema iNNv0 bajo una arquitectura coherente.
> Estado: HistÃƒÂ³rico Ã¢â‚¬” reemplazado por V_0-2-0.

---

## ÃƒÂndice

1. [Arquitectura del Ecosistema](#1-arquitectura-del-ecosistema)
2. [Decisiones ArquitectÃƒÂ³nicas](#2-decisiones-arquitectÃƒÂ³nicas)
3. [Estructura de Repositorios](#3-estructura-de-repositorios)
4. [Plan de AcciÃƒÂ³n](#4-plan-de-acciÃƒÂ³n)
5. [Estrategia de IntegraciÃƒÂ³n de Apps](#5-estrategia-de-integraciÃƒÂ³n-de-apps)

---

## 1. Arquitectura del Ecosistema

### 1.1. JerarquÃƒÂ­a de niveles

El ecosistema se organiza en **4 niveles**, donde cada nivel aÃƒÂ±ade restricciones sobre el anterior:

```
NIVEL 0:  defiNNe Ã¢â‚¬” Meta-especificaciÃƒÂ³n: estructura, versionado, RFC 2119
NIVEL 1:  FORMAT Ã¢â‚¬” EspecificaciÃƒÂ³n concreta: concepts, elements, fields, markers, relationships
           Modos: FILE (documento ÃƒÂºnico) y FOLDER (nodo como carpeta)
NIVEL 2:  Templates Ã¢â‚¬” business, procedures, kb (knowledge base), anydeo (futuro)...
NIVEL 3:  Modelos Ã¢â‚¬” Ghostbusters, Onboarding, KnowledgeBase, VideoAd...
```

### 1.2. Principios

1. **defiNNe es la base comÃƒÂºn**: toda especificaciÃƒÂ³n del ecosistema se define en tÃƒÂ©rminos de defiNNe.
2. **Cada nivel aÃƒÂ±ade restricciones, nunca las relaja**: lo que defiNNe dice MUST, FORMAT y sus templates lo heredan.
3. **FORMAT es la ÃƒÂºnica especificaciÃƒÂ³n de nivel 1**: los antiguos FORMAT e iNNfo se unifican como **modos** (FILE y FOLDER) de una misma especificaciÃƒÂ³n.
4. **La nomenclatura del archivo solo codifica el nivel mÃƒÂ¡s bajo** (numÃƒÂ©ricamente mÃƒÂ¡s alto). Los niveles superiores se declaran en el frontmatter vÃƒÂ­a `parent`.
5. **Cada nivel declara su `parent` con versiÃƒÂ³n explÃƒÂ­cita**: la cadena completa es resoluble desde cualquier archivo.

### 1.3. Cadena de dependencias (versiones)

Cada archivo conoce su lugar en la jerarquÃƒÂ­a mediante `level` y `parent` en el frontmatter. La cadena se resuelve ascendiendo:

```
Ghostbusters_V_0-3-0_business_F.md  (level 3)
  Ã¢””Ã¢”â‚¬Ã¢”â‚¬ parent: "business_V_1-0-0" Ã¢” ’ business_V_1-0-0_F.md  (level 2)
        Ã¢””Ã¢”â‚¬Ã¢”â‚¬ parent: "FORMAT_V_0-2-0" Ã¢” ’ FORMAT_V_0-2-0_F.md   (level 1)
              Ã¢””Ã¢”â‚¬Ã¢”â‚¬ parent: "defiNNe_V_0-2-0" Ã¢” ’ defiNNe_V_0-2-0_F.md  (level 0)
```

**Para la especificaciÃƒÂ³n completa** (frontmatter canÃƒÂ³nico, modos FILE/FOLDER, body sections, tipos de relaciÃƒÂ³n), consultar:
- [`specs/FORMAT_V_0-1-5_F.md`](../specs/FORMAT_V_0-1-5_F.md) Ã¢â‚¬” especificaciÃƒÂ³n actual
- [`specs/CHANGELOG.md`](../specs/CHANGELOG.md) Ã¢â‚¬” cambios entre versiones

---

## 2. Decisiones ArquitectÃƒÂ³nicas

### 2.1. UnificaciÃƒÂ³n FILE + FOLDER en una sola especificaciÃƒÂ³n

En lugar de tener FORMAT e iNNfo como dos especificaciones hermanas, se unifican bajo FORMAT con dos modos de representaciÃƒÂ³n. Esto elimina la duplicaciÃƒÂ³n de conceptos y permite que una misma aplicaciÃƒÂ³n procese ambos modos con el mismo cÃƒÂ³digo.

**Rationale**: ambos modos modelan los mismos concepts, elements, fields, markers. Lo que cambia es la representaciÃƒÂ³n fÃƒÂ­sica (FILE = un solo archivo, FOLDER = carpeta con `_F.md` por nodo). Unificar evita tener dos parsers, dos validadores, dos modelos de datos.

### 2.2. Meta-sistema de tipos de relaciÃƒÂ³n

FORMAT define un sistema polimÃƒÂ³rfico de relaciones donde cada tipo tiene una representaciÃƒÂ³n distinta segÃƒÂºn el modo:

| Tipo | FILE | FOLDER |
|------|------|--------|
| hierarchy | Index block (wikilinks) | Subdirectorios |
| evaluable_matrix | Markdown tabla sourceÃ¢” ’target | No aplica |
| graph_edge | Frontmatter `graph_edges` array | Frontmatter `graph_edges` |
| sequence | Concept type steps/sequence | Concept type steps/sequence |

Ver la spec en [`specs/FORMAT_V_0-1-5_F.md`](../specs/FORMAT_V_0-1-5_F.md) para definiciones completas.

### 2.3. Decisiones adicionales

| DecisiÃƒÂ³n | Valor |
|---|---|
| `parent` | Objeto con `name` + `url`. `name` es el filename sin `_F.md`. `url` es un tag de git inmutable |
| Modelos (level 3) | **Lightweight** Ã¢â‚¬” NO llevan template inline. Solo `parent` + datos |
| Templates (level 2) | **Rich** Ã¢â‚¬” Philosophy, Objectives, Specification, Template, Examples en el body |
| FORMAT (level 1) | **Rich** Ã¢â‚¬” Philosophy, Objectives, Specification, Template, Examples |
| defiNNe (level 0) | **Rich** Ã¢â‚¬” Philosophy, Objectives, Specification, Template, Examples |
| Spec resolver | La app descarga la cadena de parents al cargar un modelo y lo cachea en `specs/` |
| Cache | `specs/<parent.name>_F.md` por cada nivel. En cargas sucesivas, usa el cache |
| Skills | NO son especificaciones. Referencian specs por URL, nunca duplican contenido |

### 2.4. Persistencia de URLs

Cada versiÃƒÂ³n de cada especificaciÃƒÂ³n DEBE tener una URL que nunca cambie:

```
spec_url: "https://raw.githubusercontent.com/innV0/defiNNe/v0.2.0/defiNNe_V_0-2-0_F.md"
```

Estrategia primaria: **tag releases en GitHub** (gits tags inmutables). OpciÃƒÂ³n de respaldo: repositorio ÃƒÂºnico `innV0/specs/` como mirror inmutable.

---

## 3. Estructura de Repositorios

### 3.1. Principios

1. **Cada especificaciÃƒÂ³n tiene su propio repositorio**.
2. **MÃƒÂ­nima informaciÃƒÂ³n**: solo la especificaciÃƒÂ³n, templates, samples, y cÃƒÂ³digo de validaciÃƒÂ³n/generaciÃƒÂ³n.
3. **Skills referencian specs por URL** Ã¢â‚¬” no duplican.
4. **El website referencia specs por URL** Ã¢â‚¬” no las alberga.

### 3.2. Mapa de repositorios

```
innV0/
Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ defiNNe/         Ã¢” Â REPO NUEVO: meta-especificaciÃƒÂ³n
Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ FORMAT/          Ã¢” Â REPO EXISTENTE: editor, parser, templates
Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ iNNfo/           Ã¢” Â REPO EXISTENTE: migrar a docs de modo FOLDER (YA NO es spec separada)
Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ innV0_skills/    Ã¢” Â REPO EXISTENTE: agent skills, apuntan a specs por URL
Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ innV0.com/       Ã¢” Â REPO EXISTENTE: website sin specs embebidas (redirects)
Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ VidGeNN/         Ã¢” Â REPO EXISTENTE: fase 2 Ã¢â‚¬” migrar a template FORMAT
Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ iNNfo/      Ã¢” Â REPO ACTUAL: este documento, SDD changes, formato V_0-1-3
Ã¢””Ã¢”â‚¬Ã¢”â‚¬ specs/           Ã¢” Â REPO OPCIONAL: mirror inmutable de todas las specs
```

### 3.3. defiNNe sale de innV0.com

El `public/defiNNe/` actual en innV0.com debe reemplazarse por un redirect al raw del repo defiNNe.

---

## 4. Plan de AcciÃƒÂ³n

### Fase 0: ConsolidaciÃƒÂ³n de specs en iNNfo (COMPLETADA)

1. Ã¢Å“”¦ Finalizar documento `spec_consolidation.md` con decisiones.
2. Ã¢Å“”¦ Publicar `FORMAT_V_0-1-3_FORMAT.md` actualizada con workspace index, esquema unificado.
3. Ã¢Å“”¦ Template `kb_V_0-1-1_FORMAT.md` como ejemplo de modo FOLDER.
4. Ã°Å¸””ž SDD consolidate-format-drivers: PR 1 (Core Abstraction), PR 2 (App Wiring), PR 3 (Data Completeness).

### Fase 1: Repositorios (PENDIENTE)

5. Crear repo `innV0/defiNNe` con `defiNNe_V_0-2-0_F.md`.
6. Actualizar spec FORMAT a `V_0-2-0` con modos, relaciones, RFC 2119.
7. Actualizar templates existentes con `level: 2`, `parent: "FORMAT_V_0-2-0"`.
8. Tag `v0.2.0` en git.
9. Actualizar README de iNNfo indicando migraciÃƒÂ³n a FORMAT modo FOLDER.

### Fase 2: Skills (PENDIENTE)

10. Auditar `innv0-format` skill: eliminar contenido duplicado de specs.
11. Actualizar skills manager para nueva estructura.

### Fase 3: App y librerÃƒÂ­a compartida (EN CURSO)

12. Ã¢Å“”¦ Crear `@cognnitive/format-core` con parser unificado, modelo de datos, validador, IO drivers.
13. Ã°Å¸””ž Integrar en FORMAT app (Vue) Ã¢â‚¬” PR 2.3 del SDD.
14. Migrar iNNfo app (React) para que consuma `@cognnitive/format-core`.
15. Despreciar la spec separada de iNNfo.

### Fase 4: Website

16. Quitar `public/defiNNe/` de innV0.com, reemplazar con redirect.
17. Documentar modo FOLDER oficialmente en FORMAT docs.

### Fase 5: VidGeNN / Anydeo

18. Analizar migraciÃƒÂ³n de VUS a template FORMAT.

---

## 5. Estrategia de IntegraciÃƒÂ³n de Apps

### 5.1. SituaciÃƒÂ³n actual

- **FORMAT app**: Vue 3 + Pinia Ã¢” ’ editor FILE mode funcional.
- **iNNfo app**: React + Radix Ã¢” ’ knowledge base FOLDER mode funcional.
- Stack comÃƒÂºn: Vite + Tailwind + TypeScript.

### 5.2. Estrategia: librerÃƒÂ­a central compartida

No se fusionan las UIs. En su lugar se crea una **librerÃƒÂ­a TypeScript pura** que ambas apps consumen:

```
Ã°Å¸“Â¦ @cognnitive/format-core/
  Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ parser.ts               Ã¢” Â Parser unificado FILE+FOLDER
  Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ types.ts                 Ã¢” Â Modelo de datos comÃƒÂºn
  Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ identity.ts              Ã¢” Â IdentityRegistry para IDs cualificados
  Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ metamodel.ts             Ã¢” Â ResoluciÃƒÂ³n de metamodelo efectivo
  Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ driver.ts                Ã¢” Â ModelDriver interface + createDriver factory
  Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ driver-file.ts           Ã¢” Â FileDriver implementaciÃƒÂ³n
  Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ driver-folder.ts         Ã¢” Â FolderDriver implementaciÃƒÂ³n
  Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ recursiveParser.ts       Ã¢” Â Parser recursivo con soporte driver/handle
  Ã¢”Å“Ã¢”â‚¬Ã¢”â‚¬ validator.ts             Ã¢” Â Validador contra template + contenido FORMAT
  Ã¢””Ã¢”â‚¬Ã¢”â‚¬ index.ts                 Ã¢” Â Public API

Ã°Å¸“Â¦ FORMAT app (Vue) Ã¢â‚¬” consume @cognnitive/format-core (modo FILE)
Ã°Å¸“Â¦ iNNfo app (React) Ã¢â‚¬” consume @cognnitive/format-core (modo FOLDER)
```

### 5.3. Roadmap de la librerÃƒÂ­a

1. Ã¢Å“”¦ Parser: extraer a `@cognnitive/format-core`.
2. Ã¢Å“”¦ Modelo: tipar concepts, elements, fields, markers, relationships.
3. Ã¢Å“”¦ File/Folder driver: IO abstraction para ambos modos.
4. Ã¢Å“”¦ Validador: validar modelo contra template + contenido FORMAT.
5. Ã¢Å“”¦ Integrar en FORMAT app: sustituir parser inline por `@cognnitive/format-core` (SDD PR 1-2).
6. Pendiente: Integrar en iNNfo app para modo FOLDER.

---

## ApÃƒÂ©ndice: Diff de versionado

| Documento | VersiÃƒÂ³n actual | VersiÃƒÂ³n propuesta | `level` |
|-----------|---------------|-------------------|---------|
| `defiNNe.md` | `0.1.1` | `V_0-2-0` | `0` |
| `_format.md` (FORMAT) | `V_0-1-0` | `V_0-2-0` | `1` |
| `iNNfo.defiNNe.md` | `1.1.0` | *(desaparece como spec)* | Ã¢â‚¬” |
| `business_V_0-1-1_NN.md` | `V_0-1-1` | `V_1-0-0` | `2` |
| `procedures_V_0-1-1_NN.md` | `V_0-1-1` | `V_1-0-0` | `2` |
| Modelos (`Ghostbusters_V_...`) | `V_x-y-z` | Sin cambios | `3` |

---

*Este documento es un artefacto de trabajo vivo. Para la especificaciÃƒÂ³n completa, ver [`specs/FORMAT_V_0-1-5_F.md`](../specs/FORMAT_V_0-1-5_F.md).*
