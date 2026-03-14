import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSearchStore } from '@/stores/search'

describe('Search Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty state', () => {
    const store = useSearchStore()

    expect(store.query).toBe('')
    expect(store.results).toEqual([])
    expect(store.facets).toBe(null)
    expect(store.isLoading).toBe(false)
    expect(store.activeFilters).toEqual({
      'type-name': [],
      'published-year': []
    })
  })

  it('clearFilters resets active filters', () => {
    const store = useSearchStore()

    // Set some filters
    store.activeFilters['type-name'] = ['journal-article']
    store.activeFilters['published-year'] = ['2024']

    // Clear filters
    store.clearFilters()

    // Should be reset
    expect(store.activeFilters['type-name']).toEqual([])
    expect(store.activeFilters['published-year']).toEqual([])
  })

  it('hasQuery computed property works correctly', () => {
    const store = useSearchStore()

    expect(store.hasQuery).toBe(false)

    store.query = 'test query'
    expect(store.hasQuery).toBe(true)

    store.query = '   '
    expect(store.hasQuery).toBe(false)
  })

  it('hasActiveFilters computed property works correctly', () => {
    const store = useSearchStore()

    expect(store.hasActiveFilters).toBe(false)

    store.activeFilters['type-name'] = ['journal-article']
    expect(store.hasActiveFilters).toBe(true)

    store.activeFilters['type-name'] = []
    store.activeFilters['published-year'] = ['2024']
    expect(store.hasActiveFilters).toBe(true)
  })
})