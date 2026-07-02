import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useModelStore } from './modelStore'
import { resolveEffectiveMetamodel } from '../model/metamodel'
import type { MetamodelConcept, MetamodelMarker } from '../model/types'

/**
 * Thin Pinia adapter over `resolveEffectiveMetamodel()`. Replaces
 * file-format's `metamodelStore` imports: exposes `concepts`, `markers`,
 * `getConceptByName`, and `getConceptFields` by resolving the effective
 * metamodel from the root node (or active node) in `modelStore`.
 */
export const useMetamodelStore = defineStore('metamodel', () => {
  const modelStore = useModelStore()

  const rootId = computed(() => modelStore.rootIds[0])

  const concepts = computed<MetamodelConcept[]>(() => {
    if (!rootId.value) return []
    const metamodel = resolveEffectiveMetamodel(rootId.value, modelStore.nodes)
    return metamodel.concepts
  })

  const markers = computed<MetamodelMarker[]>(() => {
    if (!rootId.value) return []
    const metamodel = resolveEffectiveMetamodel(rootId.value, modelStore.nodes)
    return metamodel.markers
  })

  function getConceptByName(name: string): MetamodelConcept | undefined {
    return concepts.value.find((c) => c.name === name)
  }

  function getConceptFields(name: string): MetamodelConcept['fields'] {
    const concept = getConceptByName(name)
    return concept?.fields ?? []
  }

  return { concepts, markers, getConceptByName, getConceptFields }
})
