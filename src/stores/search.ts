import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import type { CrossrefResponse, CrossrefWork, CrossrefFacets, SearchFilters } from '@/types/crossref'

export const useSearchStore = defineStore('search', () => {
  // State
  const query = ref('')
  const results = ref<CrossrefWork[]>([])
  const facets = ref<CrossrefFacets | null>(null)
  const totalResults = ref(0)
  const activeFilters = ref<SearchFilters>({
    'type-name': [],
    'published-year': []
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasSearched = ref(false)

  // Private state for request management
  const abortController = ref<AbortController | null>(null)
  const debounceTimeout = ref<number | null>(null)

  // Computed
  const hasActiveFilters = computed(() => {
    return activeFilters.value['type-name'].length > 0 ||
           activeFilters.value['published-year'].length > 0
  })

  const hasQuery = computed(() => query.value.trim().length >= 2)


  // Helper functions
  const buildApiUrl = (searchQuery: string, filters: SearchFilters): string => {
    const baseUrl = 'https://api.crossref.org/works'
    const params = new URLSearchParams({
      'query.bibliographic': searchQuery,
      'facet': 'type-name:*,published:*',
      rows: '10'
    })

    const filterParts: string[] = []

    if (filters['type-name'].length > 0) {
      filterParts.push(...filters['type-name'].map(type => `type-name:${type}`))
    }

    if (filters['published-year'].length > 0) {
      filterParts.push(...filters['published-year'].map(year => `from-pub-date:${year}`))
    }

    if (filterParts.length > 0) {
      params.append('filter', filterParts.join(','))
    }

    return `${baseUrl}?${params.toString()}`
  }

  // Actions
  const performSearch = async (searchQuery?: string, filters?: SearchFilters) => {
    const currentQuery = searchQuery ?? query.value
    const currentFilters = filters ?? activeFilters.value

    if (!currentQuery.trim()) {
      results.value = []
      facets.value = null
      totalResults.value = 0
      error.value = null
      return
    }

    // Cancel previous request
    if (abortController.value) {
      abortController.value.abort()
    }

    abortController.value = new AbortController()
    isLoading.value = true
    error.value = null

    try {
      const url = buildApiUrl(currentQuery, currentFilters)
      const response = await fetch(url, {
        signal: abortController.value.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CrossrefResponse = await response.json()

      results.value = data.message.items || []
      facets.value = data.message.facets || null
      totalResults.value = data.message['total-results'] || 0
      hasSearched.value = true

      // Wait multiple ticks to ensure DOM fully renders before hiding loading state
      await nextTick()
      await nextTick()
      await nextTick()
      // Add small delay to ensure smooth visual transition
      await new Promise(resolve => setTimeout(resolve, 50))
      isLoading.value = false
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        error.value = err.message
        results.value = []
        facets.value = null
        totalResults.value = 0
        hasSearched.value = true
      }
      // Wait multiple ticks to ensure DOM fully renders before hiding loading state
      await nextTick()
      await nextTick()
      await nextTick()
      // Add small delay to ensure smooth visual transition
      await new Promise(resolve => setTimeout(resolve, 50))
      isLoading.value = false
    }
  }

  const debouncedSearch = (searchQuery: string) => {
    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value)
    }

    if (searchQuery.trim().length < 2) {
      return
    }

    debounceTimeout.value = window.setTimeout(() => {
      // Loading state already set in setQuery, just perform search
      performSearch(searchQuery)
    }, 500)
  }

  const setQuery = (newQuery: string) => {
    query.value = newQuery

    if (newQuery.trim().length < 2) {
      resetToInitialState()
    } else {
      // Set loading state immediately when user starts typing valid query
      isLoading.value = true
      debouncedSearch(newQuery)
    }
  }

  const resetToInitialState = () => {
    results.value = []
    facets.value = null
    totalResults.value = 0
    activeFilters.value = {
      'type-name': [],
      'published-year': []
    }
    error.value = null
    isLoading.value = false
    hasSearched.value = false

    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value)
      debounceTimeout.value = null
    }

    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
  }

  const selectType = (typeName: string) => {
    const typeFilters = activeFilters.value['type-name']
    const index = typeFilters.indexOf(typeName)

    if (index > -1) {
      typeFilters.splice(index, 1)
    } else {
      typeFilters.push(typeName)
    }

    if (hasQuery.value) {
      isLoading.value = true
    }
    performSearch()
  }

  const selectYear = (year: string) => {
    const yearFilters = activeFilters.value['published-year']
    const index = yearFilters.indexOf(year)

    if (index > -1) {
      yearFilters.splice(index, 1)
    } else {
      yearFilters.push(year)
    }

    if (hasQuery.value) {
      isLoading.value = true
    }
    performSearch()
  }

  const clearFilters = () => {
    activeFilters.value['type-name'] = []
    activeFilters.value['published-year'] = []
    if (hasQuery.value) {
      isLoading.value = true
    }
    performSearch()
  }

  const cleanup = () => {
    if (abortController.value) {
      abortController.value.abort()
    }
    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value)
    }
  }

  return {
    // State
    query,
    results,
    facets,
    totalResults,
    activeFilters,
    isLoading,
    error,
    hasSearched,

    // Computed
    hasActiveFilters,
    hasQuery,

    // Actions
    performSearch,
    setQuery,
    resetToInitialState,
    selectType,
    selectYear,
    clearFilters,
    cleanup
  }
})