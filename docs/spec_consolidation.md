# Spec Consolidation — Documento de Trabajo

> Fecha: 2026-07-01 (v3 — parent como objeto name+url, modelos lightweight, specs/ caching, rich templates)
> Propósito: Unificar especificaciones del ecosistema iNNv0 bajo una arquitectura coherente.
> Estado: Borrador de análisis y propuesta.

---

## Índice

1. [Arquitectura del Ecosistema](#1-arquitectura-del-ecosistema)
2. [Semantic Versioning Transversal](#2-semantic-versioning-transversal)
3. [defiNNe — La Meta-Capa (Nivel 0)](#3-definne--la-meta-capa-nivel-0)
4. [FORMAT — La Especificación Central (Nivel 1)](#4-format--la-especificación-central-nivel-1)
5. [Templates (Nivel 2)](#5-templates-nivel-2)
6. [Modelos (Nivel 3)](#6-modelos-nivel-3)
7. [Tipos de Relación — Meta-Sistema Unificado](#7-tipos-de-relación--meta-sistema-unificado)
8. [Persistencia de URLs y Dependencias](#8-persistencia-de-urls-y-dependencias)
9. [VidGeNN / Anydeo — Futura Integración](#9-vidgenn--anydeo--futura-integración)
10. [Skills — Relación con las Especificaciones](#10-skills--relación-con-las-especificaciones)
11. [Estructura de Repositorios](#11-estructura-de-repositorios)
12. [Plan de Acción](#12-plan-de-acción)

---

## 1. Arquitectura del Ecosistema

### 1.1. Jerarquía de niveles

El ecosistema se organiza en **4 niveles**, donde cada nivel añade restricciones sobre el anterior:

```
NIVEL 0:  defiNNe
            Meta-especificación: estructura, versionado, RFC 2119

NIVEL 1:  FORMAT
            Especificación concreta: concepts, elements, fields, markers, relationships
            Modos: FILE (documento único) y FOLDER (nodo como carpeta)

NIVEL 2:  Templates
            business, procedures, kb (knowledge base), anydeo (futuro)...

NIVEL 3:  Modelos
            Ghostbusters, Onboarding, KnowledgeBase, VideoAd...
```

### 1.2. Principios

1. **defiNNe es la base común**: toda especificación del ecosistema se define en términos de defiNNe.
2. **Cada nivel añade restricciones, nunca las relaja**: lo que defiNNe dice MUST, FORMAT y sus templates lo heredan.
3. **FORMAT es la única especificación de nivel 1**: los antiguos FORMAT e iNNfo se unifican como **modos** (FILE y FOLDER) de una misma especificación. El nombre iNNfo puede vivir como alias/marca del modo FOLDER.
4. **La nomenclatura del archivo solo codifica el nivel más bajo** (numéricamente más alto). Los niveles superiores se declaran en el frontmatter vía `parent`.
5. **Cada nivel declara su `parent` con versión explícita**: la cadena completa es resoluble desde cualquier archivo.

### 1.3. Cadena de dependencias (versiones)

Cada archivo conoce su lugar en la jerarquía mediante dos campos en el frontmatter:

```yaml
level: 3              # 0=defiNNe, 1=FORMAT, 2=template, 3=model
parent: "business_V_1-0-0"   # nombre + versión del nivel superior (sin _FORMAT.md)
```

La cadena se resuelve así:

```
Ghostbusters_V_0-3-0_business_FORMAT.md  (level 3)
  └── parent: "business_V_1-0-0"              ──→ business_V_1-0-0_FORMAT.md  (level 2)
        └── parent: "FORMAT_V_0-2-0"           ──→ FORMAT_V_0-2-0_FORMAT.md   (level 1)
              └── parent: "defiNNe_V_0-2-0"    ──→ defiNNe_V_0-2-0_FORMAT.md  (level 0)
```

Cada eslabón se resuelve: el `parent` es exactamente el nombre del archivo del nivel superior (sin el sufijo `_FORMAT.md`), y combinado con `specification_url` se puede obtener la URL canónica de ese nivel.

---

## 2. Semantic Versioning Transversal

### 2.1. Formato único

TODO el ecosistema usa el mismo formato:

```
V_MAJOR-MINOR-PATCH
```

Ejemplos:
- `V_0-1-0` — versión inicial
- `V_1-0-0` — primer release estable
- `V_2-3-1` — patch tras features

### 2.2. Reglas SemVer universales

| Incremento | Cuándo aplica |
|---|---|
| **MAJOR** | Cambio incompatible en la estructura o semántica |
| **MINOR** | Adición compatible de funcionalidad (nuevo campo opcional, nuevo concepto) |
| **PATCH** | Corrección de errores, aclaraciones, ejemplos |

### 2.3. Ámbito de aplicación — todos los niveles

El versionado SemVer es TRANSVERSAL y se aplica a TODOS los niveles:

- **Nivel 0** (defiNNe): `specification_version: "V_0-2-0"` — la meta-especificación misma
- **Nivel 1** (FORMAT): `specification_version: "V_0-2-0"` — la especificación concreta
- **Nivel 2** (templates): `template.version: "V_1-0-0"` — el template
- **Nivel 3** (modelos): `model_version: "V_0-3-0"` — el modelo concreto

### 2.4. Convención de nomenclatura de archivos

**Regla**: el nombre del archivo solo codifica el nivel más bajo (numéricamente más alto). Los niveles superiores se declaran en el frontmatter.

| Nivel | Tipo | Patrón de archivo | `level` | `parent` en frontmatter |
|---|---|---|---|---|
| 0 | Meta-especificación | `defiNNe_V_x-y-z_FORMAT.md` | `0` | *(ninguno)* |
| 1 | Especificación | `FORMAT_V_x-y-z_FORMAT.md` | `1` | `"defiNNe_V_x-y-z"` |
| 2 | Template | `<template>_V_x-y-z_FORMAT.md` | `2` | `"FORMAT_V_x-y-z"` |
| 3 | Modelo | `<Name>_V_x-y-z_<template>_FORMAT.md` | `3` | `"<template>_V_x-y-z"` |

**Ejemplos**:

- `defiNNe_V_0-2-0_FORMAT.md` — nivel 0, sin parent
- `FORMAT_V_0-2-0_FORMAT.md` — nivel 1, parent: `"defiNNe_V_0-2-0"`
- `business_V_1-0-0_FORMAT.md` — nivel 2, parent: `"FORMAT_V_0-2-0"` (se sabe que es de FORMAT por el parent, no por el nombre)
- `Ghostbusters_V_0-3-0_business_FORMAT.md` — nivel 3, parent: `"business_V_1-0-0"` (se sabe que es de business por el nombre, pero su nivel 1 FORMAT se resuelve siguiendo la cadena)

**¿Por qué el template SÍ aparece en el nombre del modelo pero FORMAT/defiNNe no?**

Porque el template es el **contexto inmediato** del modelo. FORMAT y defiNNe son infraestructura — el usuario trabaja con templates, no directamente con FORMAT. Pero la cadena siempre es resoluble porque cada nivel apunta a su `parent`.

---

## 3. defiNNe — La Meta-Capa (Nivel 0)

### 3.1. Rol

defiNNe es la **especificación de especificaciones**. Define:
- Qué estructura DEBE tener una especificación iNNv0.
- Cómo se versiona (SemVer, `specification_version`, `specification_url`).
- Cómo se escribe (verbos RFC 2119).
- El sistema de niveles (`level`, `parent`).

### 3.2. Frontmatter canónico (nivel 0)

```yaml
---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/innV0/defiNNe/v0.2.0/defiNNe_V_0-2-0_FORMAT.md"
level: 0
title: "defiNNe — The Definition of Definitions"
description: "Meta-specification for the iNNv0 ecosystem"
author: "innV0 Team"
status: "Draft | Stable | Deprecated"
---
```

- **`level: 0`**: indica que es la raíz de la jerarquía.
- **Sin `parent`**: no hay nivel superior.
- **`specification_url`**: puntero canónico e inmutable a esta versión exacta.

### 3.3. Estructura obligatoria del body

Toda especificación del ecosistema DEBE seguir esta estructura en el body (hereda de defiNNe):

```markdown
> [!NOTE]
> This is a **FORMAT document**...

# [Name]

## [One-sentence summary]

## Philosophy

## Objectives

## Specification
[Usar RFC 2119: MUST, SHOULD, MAY, MUST NOT, SHOULD NOT]

## Template

## Examples
```

### 3.4. RFC 2119 como lenguaje normativo

| Verbo | Significado |
|---|---|
| **MUST** / **REQUIRED** / **SHALL** | Obligatorio |
| **MUST NOT** / **SHALL NOT** | Prohibido |
| **SHOULD** / **RECOMMENDED** | Recomendado |
| **SHOULD NOT** / **NOT RECOMMENDED** | Desaconsejado |
| **MAY** / **OPTIONAL** | Opcional |

### 3.5. Sistema de tipos

defiNNe NO define tipos (ni `text`, `weight`, `category`, etc.). Opera a un nivel de abstracción donde eso no corresponde. Cada especialización (FORMAT, etc.) define su propio sistema de tipos. Esto es intencional.

### 3.6. Una sola especificación

defiNNe no está diseñada para producir múltiples documentos. Es una sola especificación que actúa como raíz normativa. Esto es correcto y esperable.

---

## 4. FORMAT — La Especificación Central (Nivel 1)

### 4.1. FORMAT es la única especificación de nivel 1

En lugar de tener FORMAT e iNNfo como dos especificaciones hermanas, se **unifican bajo un mismo nombre** con dos modos de representación:

```
FORMAT_V_0-2-0_FORMAT.md
  ├── mode: "FILE"     ← el FORMAT actual (todo en un solo .md)
  └── mode: "FOLDER"   ← el antiguo iNNfo (nodos como carpetas con assets)
```

### 4.2. Frontmatter canónico (nivel 1)

```yaml
---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/innV0/FORMAT/v0.2.0/FORMAT_V_0-2-0_FORMAT.md"
level: 1
parent: "defiNNe_V_0-2-0"
title: "FORMAT Specification"
modes: ["FILE", "FOLDER"]
---
```

- **`level: 1`**: es especialización directa de defiNNe.
- **`parent: "defiNNe_V_0-2-0"`**: incluye la versión exacta del padre.
- **`modes`**: lista de modos de representación que soporta.

### 4.3. Modo FILE (formato clásico)

Un solo documento `.md` que contiene:
- YAML frontmatter con la definición del template (concepts, markers, matrices).
- Markdown body con los concept blocks (`_F concepts:`).
- Elements como bullets con YAML fields.
- Matrices relacionales (tablas Markdown).
- Wikilinks `[[Name]]` para referencias cruzadas.

**Cuándo usarlo**: modelos principalmente textuales, relaciones matriciales evaluables, dashboards visuales, caben en un solo archivo.

### 4.4. Modo FOLDER (antiguo iNNfo)

Cada **element** (instance de un concept) es una **carpeta** en el filesystem.

#### 4.4.1. Estructura

La carpeta raíz del modelo usa el naming canónico del nivel 3. Las subcarpetas (elementos) usan nombres semánticos simples. El `_FORMAT.md` es el discovery file universal dentro de cada carpeta-nodo:

```
📁 MiKB_V_1-0-0_kb/                  ← raíz del modelo (naming canónico)
  📄 _FORMAT.md                       ← discovery: level:3, parent:"kb_V_1-0-0", mode:FOLDER
  📁 Alice/                           ← element del concept Persona
    📄 _FORMAT.md                     ← metadatos del elemento
    📄 foto.jpg                       ← asset físico
    📁 documentos/                    ← carpeta de assets (SIN _FORMAT.md)
      📄 contrato.pdf
  📁 Bob/
    📄 _FORMAT.md
    📄 avatar.png
  📁 Concepto_X/                      ← otro element
    📄 _FORMAT.md
    📁 SubConcepto/                   ← sub-elemento
      📄 _FORMAT.md
      📄 video.mp4
```

#### 4.4.2. Reglas de detección

| Situación | Es nodo o asset? |
|---|---|
| Carpeta contiene `_FORMAT.md` | **NODO** — sus metadatos están en `_FORMAT.md` |
| Carpeta NO contiene `_FORMAT.md` | **CARPETA DE ASSETS** — fuera del modelo |
| El nodo raíz se llama `MiKB_V_1-0-0_kb/` | Su `_FORMAT.md` define el modelo completo |

#### 4.4.3. Naming en FOLDER

- **Raíz del modelo**: `<Name>_V_x-y-z_<template>` — ej: `MiKB_V_1-0-0_kb/`
- **Sub-nodos**: nombre semántico libre — ej: `Alice/`, `Concepto_X/`
- **Discovery file universal**: `_FORMAT.md` en TODAS las carpetas-nodo
- Un sub-nodo NO repite la versión en el nombre de su carpeta. Hereda la versión de la raíz.

**Cuándo usarlo**: modelos con assets físicos asociados, knowledge bases con ficheros, jerarquías profundas, versionado granular por nodo.

### 4.5. ¿Qué comparten ambos modos?

| Aspecto | Comportamiento común |
|---|---|
| Concepts y elements | Ambos modos modelan los mismos conceptos. Lo que cambia es dónde y cómo se almacenan |
| Fields | Misma sintaxis YAML para definir propiedades |
| Markers | Mismos markers (weight, certainty, priority...) |
| Sistema de relaciones | Mismo meta-sistema de tipos de relación (sección 7) |
| Versionado | Misma convención `V_MAJOR-MINOR-PATCH` |
| Nomenclatura | `_FORMAT.md` suffix en todos los archivos |
| Document Notice | `[!NOTE]` requerido en todos los documentos |

### 4.6. Relación con el antiguo iNNfo

El nombre "iNNfo" puede seguir existiendo como **alias reconocible** para el modo FOLDER, pero técnicamente ya no es una especificación separada.

El repo `innV0/iNNfo` se consolida dentro del ecosistema FORMAT:
- Su spec independiente desaparece (pasa a ser el modo FOLDER de FORMAT).
- El repo existente se mantiene pero su README se actualiza para indicar que está pendiente de migración al proyecto unificado FORMAT.
- El plan de migración incluye: adaptar la app iNNfo a los nuevos términos y forma de trabajar de FORMAT, integrar sus funcionalidades (node-as-folder, filesystem sync, assets) como modo FOLDER.

La documentación puede usar frases como:

> **FORMAT mode FOLDER** — antes conocido como iNNfo. Para modelos jerárquicos con assets.

### 4.7. FORMAT como defiNNe-compliant

Para que FORMAT sea defiNNe-compliant, su spec `_format.md` debe incluir:
- **Philosophy** (ya existe como "1. Motivation" — puede refinarse)
- **Objectives** (hacerlos explícitos)
- **Specification** (ya existe, usar RFC 2119 más explícitamente)
- **Template** (pointer a business, procedures, kb)
- **Examples** (pointer a samples/)

**Impacto en la aplicación FORMAT: CERO**. Estas secciones son Markdown plano que el parser ignora porque no usan `_F concepts:`. Es puramente aditivo.

### 4.8. Ubicación y naming

La especificación FORMAT en el repo FORMAT/ sigue en:
`docs/documentation/spec/V_x-y-z/FORMAT_V_x-y-z_FORMAT.md`

El archivo se renombra de `_format.md` a `FORMAT_V_x-y-z_FORMAT.md` para ser 100% consistente con el naming del nivel 1. El frontmatter interno declarará `level: 1` y `parent: "defiNNe_V_0-2-0"`.

---

## 5. Templates (Nivel 2)

### 5.1. Rol

Un template es una plantilla concreta para un dominio específico. Define:
- Qué concepts aplican a ese dominio (y su tipo: text, weight, category, etc.).
- Qué markers están disponibles.
- Qué matrices o relaciones aplican.
- Qué modo (FILE o FOLDER) es compatible.

### 5.2. Frontmatter canónico (nivel 2)

```yaml
---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/innV0/FORMAT/v0.2.0/docs/templates/business/V_1-0-0/business_V_1-0-0_FORMAT.md"
level: 2
parent: "FORMAT_V_0-2-0"
title: "Business Template"
mode: "FILE"    # o "FOLDER", o ["FILE", "FOLDER"] si soporta ambos
concepts: [...]
markers: [...]
matrices: [...]
---
```

- **`level: 2`**, **`parent: "FORMAT_V_0-2-0"`**: se sabe que este template pertenece a FORMAT.
- **`mode`**: declara qué modo(s) de FORMAT soporta.
- La nomenclatura: `<template>_V_x-y-z_FORMAT.md` — el nombre no incluye "FORMAT" porque el `parent` ya lo especifica.

### 5.3. Templates actuales

| Template | Modo | Descripción |
|---|---|---|
| `business` | FILE | Modelado de estrategia de negocio (~60 concepts) |
| `procedures` | FILE | Workflows, SOPs, procesos |
| `kb` (futuro) | FOLDER | Knowledge base con assets físicos |

### 5.4. Un template puede venir de otro repo

Un template no tiene por qué vivir en el repo de FORMAT. Por ejemplo:

- `business_V_1-0-0_FORMAT.md` está en `FORMAT/docs/templates/business/V_1-0-0/`.
- Un template `kb_V_1-0-0_FORMAT.md` podría estar en otro repo, siempre que su `parent` apunte a `"FORMAT_V_0-2-0"`.

---

## 6. Modelos (Nivel 3)

### 6.1. Rol

Un modelo es una instancia concreta de un template. Representa datos reales.

### 6.2. Frontmatter canónico (nivel 3)

```yaml
---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/innV0/FORMAT/v0.2.0/docs/documentation/spec/V_0-2-0/_format.md"
level: 3
parent: "business_V_1-0-0"
model_version: "V_0-3-0"
title: "Ghostbusters Business Model"
mode: "FILE"
---
```

### 6.3. Modo FILE

Un solo archivo: `Ghostbusters_V_0-3-0_business_FORMAT.md`

### 6.4. Modo FOLDER

Un directorio raíz que representa el modelo, siguiendo la estructura Variant C:

```
📁 MiKB_V_1-0-0_kb/                    ← carpeta raíz (naming canónico del modelo)
  📄 _FORMAT.md                         ← discovery del modelo completo
  📁 Alice/                             ← element de un concept
    📄 _FORMAT.md                       ← metadatos del elemento
    📄 foto.jpg
  📁 Bob/
    📄 _FORMAT.md
  📁 Concepto_X/
    📄 _FORMAT.md
    📁 SubY/
      📄 _FORMAT.md
```

El `_FORMAT.md` raíz:

```yaml
---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/innV0/FORMAT/v0.2.0/docs/documentation/spec/V_0-2-0/_format.md"
level: 3
parent: "kb_V_1-0-0"
model_version: "V_1-0-0"
title: "Mi Knowledge Base"
mode: "FOLDER"
---
```

Cada `_FORMAT.md` de nodo individual:

```yaml
---
specification_version: "V_0-2-0"
level: 3
mode: "FOLDER"
category: "Item"
type: "Persona"
fields:
  status: active
---
```

Reglas:
- Los nodos individuales NO declaran `parent`. La cadena completa se resuelve desde la raíz.
- Los nodos individuales NO repiten `specification_url`. Se resuelve por herencia desde la raíz.
- La detección de nodos es: toda carpeta con `_FORMAT.md` es un nodo. Sin `_FORMAT.md` es carpeta de assets.

### 6.5. CSV como representación adicional (futuro)

Para datos masivos, un tercer modo podría ser:
- **Modo TABLE**: datos en CSV/TSV con una `_FORMAT.md` companion que define el esquema (concepts, fields, relaciones).

No se define en esta iteración pero se deja la puerta abierta:
```
FORMAT_V_0-3-0_FORMAT.md
  ├── mode: "FILE"     ← conceptos en un solo .md
  ├── mode: "FOLDER"   ← conceptos como carpetas
  └── mode: "TABLE"    ← conceptos como columnas CSV (futuro)
```

---

## 7. Tipos de Relación — Meta-Sistema Unificado

### 7.1. Problema

FORMAT modo FILE usa **matrices relacionales** (tablas source→target). El antiguo iNNfo usa **graph_edges** (aristas en frontmatter) + **jerarquía de directorios**. Son mecanismos diferentes para el mismo propósito: expresar relaciones entre elementos.

### 7.2. Solución: meta-sistema de tipos de relación

FORMAT define un **sistema polimórfico de relaciones**, donde cada tipo de relación tiene una representación distinta según el modo (FILE/FOLDER):

```yaml
# Definido en la spec FORMAT_V_0-2-0_FORMAT.md
relationship_types:
  - name: "hierarchy"
    description: "Parentesco estructural entre elementos"
    file_representation: "index block (wikilinks [[Parent]] → [[Child]])"
    folder_representation: "subdirectorio (carpeta → subcarpeta)"
  - name: "evaluable_matrix"
    description: "Relación N a M evaluable en una escala"
    file_representation: "tabla Markdown source→target con params"
    folder_representation: "no aplica (no hay representación matricial en FOLDER)"
  - name: "graph_edge"
    description: "Arista de grafo con propiedades arbitrarias"
    file_representation: "frontmatter graph_edges: [{source, target, label, weight}]"
    folder_representation: "frontmatter graph_edges (idéntico)"
  - name: "sequence"
    description: "Secuencia ordenada de pasos o eventos"
    file_representation: "concept type 'steps' o 'sequence'"
    folder_representation: "concept type 'steps' o 'sequence' (idéntico)"
```

### 7.3. Cómo se usa

Cada template declara qué tipos de relación soporta:

```yaml
# business_V_1-0-0_FORMAT.md (modo FILE)
relationship_declarations:
  hierarchy:
    enabled: true
    via: "index block"
  evaluable_matrix:
    enabled: true
  sequence:
    enabled: true
  graph_edge:
    enabled: false
```

```yaml
# kb_V_1-0-0_FORMAT.md (modo FOLDER)
relationship_declarations:
  hierarchy:
    enabled: true
    via: "subdirectorios"
  evaluable_matrix:
    enabled: false
  graph_edge:
    enabled: true
  sequence:
    enabled: false
```

### 7.4. Ventajas

- **Un solo concepto mental**: "las relaciones se declaran en el template y se materializan según el modo".
- **Cada template escoge lo que necesita**: business usa matrices, kb usa graph_edges.
- **La aplicación sabe renderizar cada tipo** según el modo activo.
- **Extensible**: se pueden añadir nuevos tipos sin romper los existentes.

---

## 8. Persistencia de URLs y Dependencias

### 8.1. Principio

Cada versión de cada especificación DEBE tener una URL que nunca cambie.

### 8.2. Estrategia: tag releases en GitHub

La URL primaria usa **tags de git** (inmutables), no branches:

```yaml
specification_url: "https://raw.githubusercontent.com/innV0/defiNNe/v0.2.0/defiNNe_V_0-2-0_FORMAT.md"
```

- Un tag de git es efectivamente inmutable.
- Cada Spec Release tiene su tag (`v0.2.0`, `v0.2.1`, etc.).
- GitHub mantiene las raw URLs de tags para siempre mientras el repo exista.

### 8.3. Opción de respaldo: repositorio único de specs

```
innV0/specs/
├── defiNNe/
│   └── V_0-2-0/
│       └── defiNNe_V_0-2-0_FORMAT.md
├── FORMAT/
│   ├── V_0-1-0/
│   │   └── _format.md
│   └── V_0-2-0/
│       └── FORMAT_V_0-2-0_FORMAT.md
└── ...
```

Este repo es **inmutable por convención**: una vez publicada una versión, no se modifica jamás. Si hay erratas, se publica `V_0-2-1`.

### 8.4. Archive.org como respaldo terciario

Opcional, para máxima resiliencia:

```yaml
specification_url: "https://raw.githubusercontent.com/innV0/defiNNe/v0.2.0/defiNNe_V_0-2-0_FORMAT.md"
archive_url: "https://web.archive.org/web/2026.../..."
```

### 8.5. Resolución de la cadena

Dado un modelo `Ghostbusters_V_0-3-0_business_FORMAT.md`:

1. Leer `parent: "business_V_1-0-0"`.
2. Buscar `business_V_1-0-0_FORMAT.md`. ¿Dónde? Dos opciones:
   - **Opción A**: si el template está en el mismo repo, misma organización → resolver por convención `{parent_repo}/docs/templates/{name}/V_{version}/`.
   - **Opción B**: el campo `parent` es el nombre del archivo. El `specification_url` del modelo apunta a FORMAT, y siguiendo la cadena se puede localizar cada nivel. Si el `parent` incluye un repo:
     ```yaml
     parent:
       name: "business_V_1-0-0"
       repo: "innV0/FORMAT"
     ```
3. Cada nivel tiene su `specification_url` que apunta a una URL inmutable.

**Recomendación inicial**: Opción A (convención de ruta), con Opción B como mecanismo de override para templates externos.

---

## 9. VidGeNN / Anydeo — Futura Integración

### 9.1. Visión

La especificación Anydeo (VUS — VidGeNN Universal Specification) podría convertirse en un **template FORMAT**, y los scripts de vídeo en **modelos FORMAT** de ese template.

### 9.2. Mapeo conceptual

| Anydeo (VUS) | FORMAT |
|---|---|
| `//VIDGENN_SPEC: V_0-3-3` | `specification_version: "V_0-3-3"` en frontmatter |
| `# video` (config global) | Concept `VideoConfig` type `text` |
| `## Sección` | Concept `Section` type `category` |
| `@ Escena` | Element de concept `Scene` |
| `@@ Capa` | Element de concept `Layer` |
| `scene_content` (diálogo) | Field del element Scene |
| `@template` | Herencia de template FORMAT |
| Matriz escenas-capas | Relación type `evaluable_matrix` Scene→Layer |

### 9.3. Cuándo abordarlo

Fase 2. Primero consolidar defiNNe ↔ FORMAT (FILE + FOLDER), luego integrar VidGeNN como template.

---

## 10. Skills — Relación con las Especificaciones

### 10.1. Principio

Los skills NO son especificaciones. Son **instrucciones para agentes AI** que referencian especificaciones. Un skill NUNCA duplica contenido que ya está en una especificación.

### 10.2. Formato

```yaml
---
name: "innv0-format"
version: "V_0-1-0"
references:
  - specification: "FORMAT"
    version: "V_0-2-0"
    url: "https://raw.githubusercontent.com/innV0/FORMAT/v0.2.0/FORMAT_V_0-2-0_FORMAT.md"
  - specification: "defiNNe"
    version: "V_0-2-0"
    url: "https://raw.githubusercontent.com/innV0/defiNNe/v0.2.0/defiNNe_V_0-2-0_FORMAT.md"
---
```

### 10.3. Reglas

- Si el skill necesita que el agente conozca una regla DEBE decir: *"Lea la especificación en [URL] antes de continuar."*
- Si necesita ejemplos, DEBE apuntar a los `samples/` de la especificación.
- Excepción: fragmentos <5 líneas pueden citarse con atribución clara.

### 10.4. Skills actuales

| Skill | Referencia a spec |
|---|---|
| `innv0-format` | FORMAT, defiNNe |
| `innv0-opencode-model-router` | Ninguna |
| `innv0-skills-manager` | Ninguna |
| `innv0-trannsform` | FORMAT (consumidor) |
| `innv0-web-design-guide` | Ninguna |

---

## 11. Estructura de Repositorios

### 11.1. Principios

1. **Cada especificación tiene su propio repositorio**.
2. **Mínima información**: solo la especificación, templates, samples, y código de validación/generación.
3. **Skills referencian specs por URL** — no duplican.
4. **El website referencia specs por URL** — no las alberga.

### 11.2. Estructura propuesta

```
GitHub: innV0/

├── defiNNe/                          ← REPO NUEVO
│   ├── defiNNe_V_0-2-0_FORMAT.md
│   ├── README.md                     → pointer a spec canónica
│   └── samples/

├── FORMAT/                           ← REPO EXISTENTE
│   ├── docs/
│   │   ├── documentation/spec/V_x-y-z/_format.md
│   │   └── templates/
│   │       ├── business/
│   │       └── procedures/
│   ├── src/ (editor, parser...)
│   ├── openspec/
│   └── README.md

├── iNNfo/                            ← REPO EXISTENTE (migrar a docs de modo FOLDER)
│   ├── docs/                         ← documentación del modo FOLDER
│   ├── src/
│   └── README.md
│   (YA NO alberga una spec separada; apunta a FORMAT spec)

├── iNNv0_skills/                     ← REPO EXISTENTE
│   ├── skills/
│   │   └── innv0-format/             ← apunta a FORMAT + defiNNe por URL
│   └── README.md

├── innV0.com/                        ← REPO EXISTENTE
│   ├── content/docs/
│   │   ├── format/                   → pointer a raw spec FORMAT
│   │   ├── definne/                  → pointer a raw spec defiNNe
│   │   └── folder-mode/             → pointer a docs del modo FOLDER
│   └── (sin specs embebidas)

├── VidGeNN/                          ← REPO EXISTENTE (fase 2: migrar a template FORMAT)
├── cogNNitive/                       ← REPO: este documento de trabajo
└── specs/                            ← REPO OPCIONAL: mirror inmutable de todas las specs
```

### 11.3. defiNNe sale de innV0.com

El `public/defiNNe/` actual en innV0.com debe:
1. Reemplazarse por un redirect al raw del repo defiNNe.
2. La documentación del website referencia el repo, no alberga el contenido.

---

## 12. Plan de Acción

### Fase 0: Consolidación de specs en cogNNitive (AHORA — ESTAMOS AQUÍ)

1. Finalizar este documento `spec_consolidation.md` con todas las decisiones tomadas.
2. Publicar la primera versión de `defiNNe_V_0-2-0_FORMAT.md` en cogNNitive como documento de trabajo.
3. Redactar `FORMAT_V_0-2-0_FORMAT.md` actualizada con modos FILE/FOLDER, sistema de relaciones, `level`, `parent`.
4. Redactar template `kb_V_1-0-0_FORMAT.md` como ejemplo de modo FOLDER.

### Fase 1: Repositorios (SIGUIENTE)

#### 1a: defiNNe

5. **Crear repo `innV0/defiNNe`** y publicar `defiNNe_V_0-2-0_FORMAT.md` con:
   - `level: 0`, sin `parent`.
   - SemVer `V_0-2-0`.
   - `specification_url` con tag `v0.2.0`.
   - RFC 2119 como REQUISITO para especializaciones.
   - Plantilla canónica para niveles 1, 2, 3.

#### 1b: FORMAT

6. **Renombrar** `_format.md` → `FORMAT_V_0-2-0_FORMAT.md`.
7. **Actualizar spec** a `V_0-2-0`: añadir Philosophy, Objectives, RFC 2119, modos FILE/FOLDER, meta-sistema de relaciones, `level: 1`, `parent: "defiNNe_V_0-2-0"`. CERO impacto en código de la app.
8. **Actualizar templates existentes** (`business`, `procedures`): añadir `level: 2`, `parent: "FORMAT_V_0-2-0"`.
9. **Tag `v0.2.0`** en git.

#### 1c: iNNfo

10. **Actualizar README** del repo indicando migración a FORMAT modo FOLDER.
11. **Redirigir documentación** a FORMAT spec.
12. **Plan de migración** para la app iNNfo (ver Fase 3).

### Fase 2: Skills

13. **Auditar `innv0-format` skill**: eliminar contenido duplicado de specs, dejar solo pointers con `references:`.
14. **Actualizar skills manager** para reconocer la nueva estructura.

### Fase 3: App y librería compartida

15. **Crear `@innv0/format-core`** — librería TypeScript pura con:
    - Parser unificado (FILE y FOLDER modes)
    - Modelo de datos (concepts, elements, fields, markers, relationships)
    - Validador contra template
    - IO drivers: `file-driver.ts` y `folder-driver.ts`
16. **Integrar `@innv0/format-core`** en FORMAT app (Vue).
17. **Migrar iNNfo app** (React) para que consuma `@innv0/format-core` y opere en modo FOLDER.
18. **Actualizar UI de FORMAT app** para soportar modo FOLDER: tree view de nodos, gestión de assets, filesystem sync.
19. **Despreciar** la spec separada de iNNfo.

### Fase 4: Website

20. **Quitar `public/defiNNe/`** de innV0.com, reemplazar con redirect.
21. **Documentar modo FOLDER** oficialmente en FORMAT docs.

### Fase 5: VidGeNN / Anydeo

22. Analizar migración de VUS a template FORMAT (modo FILE o FOLDER según el caso).

## 13. Estrategia de integración de apps

### 13.1. Situación actual

- **FORMAT app**: Vue 3 + Pinia + d3 → editor FILE mode funcional.
- **iNNfo app**: React + Radix + @dnd-kit → knowledge base FOLDER mode funcional.
- Stack común: Vite + Tailwind + TypeScript.

### 13.2. Estrategia: librería central compartida

No se fusionan las UIs (costoso, diferentes frameworks). En su lugar se crea una **librería TypeScript pura** que ambas apps consumen:

```
📦 @innv0/format-core/               ← librería compartida (framework-agnostic)
  ├── parser/
  │   ├── parse-frontmatter.ts        ← YAML frontmatter parser
  │   ├── parse-concepts.ts           ← Concept blocks parser
  │   ├── parse-matrices.ts           ← Matrix tables parser
  │   └── parse-relationships.ts      ← Relationship type parser
  ├── model/
  │   ├── concept.ts                  ← Concept, Element, Field types
  │   ├── marker.ts                   ← Marker types
  │   ├── matrix.ts                   ← Matrix types
  │   └── relationship.ts             ← Relationship type system (hierarchy, evaluable, graph, sequence)
  ├── validator/
  │   └── validate.ts                 ← Validate model against template schema
  ├── io/
  │   ├── file-driver.ts              ← Read/write single FILE mode documents
  │   └── folder-driver.ts            ← Discover/walk FOLDER mode nodes (detect _FORMAT.md)
  └── index.ts                        ← Public API

📦 FORMAT app (Vue)                  ← UI para modo FILE
  └── consume @innv0/format-core

📦 iNNfo app (React)                 ← UI para modo FOLDER
  └── consume @innv0/format-core
```

### 13.3. Beneficios

- **El parser es uno solo** — no hay divergencia entre lo que entiende FORMAT y lo que entiende iNNfo.
- **Cada app mantiene su framework y su UI** — no hay que reescribir nada.
- **El modo FOLDER driver** descubre nodos caminando el árbol de directorios y detectando `_FORMAT.md`.
- **El modo FILE driver** lee/escribe un solo documento.
- **El validador** es el mismo para ambos modos.
- **Se puede empezar mañana** — la librería no toca el código existente de ninguna app.

### 13.4. Roadmap de la librería

1. **Parser**: extraer el parser actual de FORMAT app a `@innv0/format-core`.
2. **Modelo**: tipar concepts, elements, fields, markers, relationships.
3. **File driver**: envolver el parser en un driver de lectura/escritura para modo FILE.
4. **Folder driver**: implementar discovery de nodos por detección de `_FORMAT.md` en directorios.
5. **Validator**: validar modelo contra schema del template.
6. **Integrar en FORMAT app**: sustituir el parser inline por `@innv0/format-core`.
7. **Integrar en iNNfo app**: migrar iNNfo para que consuma `@innv0/format-core` en modo FOLDER.

---

## Apéndice: Diff de versionado

| Documento | Versión actual | Versión propuesta | `level` | `parent` |
|---|---|---|---|---|
| `defiNNe.md` | `0.1.1` | `V_0-2-0` | `0` | *(ninguno)* |
| `_format.md` (FORMAT) | `V_0-1-0` | `V_0-2-0` | `1` | `"defiNNe_V_0-2-0"` |
| `iNNfo.defiNNe.md` | `1.1.0` | *(desaparece como spec)* | — | — |
| `business_V_0-1-0_FORMAT.md` | `V_0-1-0` | `V_1-0-0` | `2` | `"FORMAT_V_0-2-0"` |
| `procedures_V_0-1-0_FORMAT.md` | `V_0-1-0` | `V_1-0-0` | `2` | `"FORMAT_V_0-2-0"` |
| Modelos (`Ghostbusters_V_...`) | `V_x-y-z` | Sin cambios | `3` | `"<template>_V_x-y-z"` |
| Skills | `1.0` | `V_1-0-0` | — | — |

---

## 13. Resumen de decisiones finales (v3)

| Decisión | Valor |
|---|---|
| `parent` | Objeto con `name` + `url`. `name` es el filename sin `_FORMAT.md`. `url` es un tag de git inmutable |
| Modelos (level 3) | **Lightweight** — NO llevan template inline. Solo `parent` + datos |
| Templates (level 2) | **Rich** — Philosophy, Objectives, Specification, Template, Examples en el body |
| FORMAT (level 1) | **Rich** — Philosophy, Objectives, Specification, Template, Examples |
| defiNNe (level 0) | **Rich** — Philosophy, Objectives, Specification, Template, Examples |
| Spec resolver | La app descarga la cadena de parents al cargar un modelo y lo cachea en `specs/` |
| Cache | `specs/<parent.name>_FORMAT.md` por cada nivel. En cargas sucesivas, usa el cache |
| Template URL opcional | El template puede incluir `template_url` además de los concepts inline (modo híbrido) |
| Verification | 4 archivos creados en `verification/` con la cadena completa |
| Ningún repo original se tocó | FORMAT, iNNfo, innV0.com, VidGeNN, iNNv0_skills intactos |

## 14. Verification Artifacts

Los 4 archivos de verificación están en `verification/`:

```
verification/
├── defiNNe_V_0-2-0_FORMAT.md              ← Level 0: meta-spec (parent chain, resolver protocol, RFC 2119)
├── FORMAT_V_0-2-0_FORMAT.md               ← Level 1: FORMAT spec (FILE/FOLDER modes, relationship types)
├── business_V_1-0-0_FORMAT.md             ← Level 2: business template (70+ concepts, rich body sections)
└── Ghostbusters_V_0-3-0_business_FORMAT.md ← Level 3: lightweight model (no inline template, just data)
```

**Próximo paso**: decidir cuándo y cómo publicar estos specs a los repositorios originales.

---

*Este documento es un artefacto de trabajo vivo. Se actualizará a medida que avance la consolidación.*
