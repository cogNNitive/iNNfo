import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '../../src/stores/uiStore'

describe('uiStore search state and methods', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes search state with defaults', () => {
    const uiStore = useUiStore()
    expect(uiStore.isSearchOpen).toBe(false)
    expect(uiStore.searchQuery).toBe('')
    expect(uiStore.searchConceptFilter).toBe('all')
  })

  it('toggles search open and clears fields when closing', () => {
    const uiStore = useUiStore()
    uiStore.toggleSearchOpen()
    expect(uiStore.isSearchOpen).toBe(true)

    uiStore.setSearchQuery('test query')
    uiStore.setSearchConceptFilter('Market')
    expect(uiStore.searchQuery).toBe('test query')
    expect(uiStore.searchConceptFilter).toBe('Market')

    uiStore.toggleSearchOpen()
    expect(uiStore.isSearchOpen).toBe(false)
    expect(uiStore.searchQuery).toBe('')
    expect(uiStore.searchConceptFilter).toBe('all')
  })

  it('clears search query and concept filter via clearSearch', () => {
    const uiStore = useUiStore()
    uiStore.setSearchOpen(true)
    uiStore.setSearchQuery('concept name')
    uiStore.setSearchConceptFilter('Product')

    uiStore.clearSearch()
    expect(uiStore.searchQuery).toBe('')
    expect(uiStore.searchConceptFilter).toBe('all')
    expect(uiStore.isSearchOpen).toBe(true)
  })
})
