<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSearchStore } from '@/stores/search'

const searchStore = useSearchStore()
const expansionPanels = ref(['types', 'years'])

// Transform type facets from object to array
const typeFacetEntries = computed(() => {
  const facets = searchStore.facets
  if (!facets?.['type-name']?.values) return []

  return Object.entries(facets['type-name'].values).map(([name, count]) => ({
    name,
    count: typeof count === 'number' ? count : 0
  }))
})

// Transform year facets from object to array, filter valid years, sort descending, take top 20
const yearFacetEntries = computed(() => {
  const facets = searchStore.facets
  if (!facets?.published?.values) return []

  const currentYear = new Date().getFullYear()

  return Object.entries(facets.published.values)
    .map(([name, count]) => ({
      name,
      count: typeof count === 'number' ? count : 0
    }))
    .filter(f => {
      const year = Number(f.name)
      return year >= 1000 && year <= currentYear
    })
    .sort((a, b) => Number(b.name) - Number(a.name))
    .slice(0, 20)
})
</script>

<template>
  <div
    class="facet-panel"
    data-testid="facet-panel"
  >
    <v-card
      variant="outlined"
      class="pa-4"
    >
      <div class="facet-header d-flex justify-space-between align-center mb-4">
        <h2 class="text-h6">
          Filters
        </h2>
        <v-btn
          v-if="searchStore.hasActiveFilters"
          variant="text"
          size="small"
          color="primary"
          data-testid="clear-filters"
          @click="searchStore.clearFilters"
        >
          Clear all
        </v-btn>
      </div>

      <!-- Active filters chips -->
      <div
        v-if="searchStore.hasActiveFilters"
        class="mb-4"
      >
        <div class="text-caption mb-2">
          Active filters:
        </div>
        <div class="d-flex flex-wrap ga-1">
          <v-chip
            v-for="typeFilter in searchStore.activeFilters['type-name']"
            :key="`type-${typeFilter}`"
            size="small"
            closable
            @click:close="searchStore.selectType(typeFilter)"
          >
            {{ typeFilter }}
          </v-chip>
          <v-chip
            v-for="yearFilter in searchStore.activeFilters['published-year']"
            :key="`year-${yearFilter}`"
            size="small"
            closable
            @click:close="searchStore.selectYear(yearFilter)"
          >
            {{ yearFilter }}
          </v-chip>
        </div>
      </div>

      <div
        v-if="!searchStore.facets"
        class="text-body-2 text-medium-emphasis"
      >
        Search to see available filters
      </div>

      <div v-else>
        <!-- Publication Type Facet -->
        <v-expansion-panels
          v-model="expansionPanels"
          variant="accordion"
          class="mb-4"
        >
          <v-expansion-panel
            v-if="typeFacetEntries.length > 0"
            title="Publication Type"
            value="types"
            data-testid="type-facet"
            aria-label="Publication type filters"
          >
            <v-expansion-panel-text>
              <fieldset class="facet-options" style="max-height: 250px; overflow-y: auto; border: none; padding: 0; margin: 0;">
                <legend class="sr-only">Publication Type Filters</legend>
                <v-checkbox
                  v-for="facetEntry in typeFacetEntries"
                  :key="facetEntry.name"
                  :model-value="searchStore.activeFilters['type-name'].includes(facetEntry.name)"
                  :label="`${facetEntry.name} (${facetEntry.count?.toLocaleString() || 0})`"
                  density="compact"
                  hide-details
                  :data-testid="`type-filter-${facetEntry.name}`"
                  @update:model-value="searchStore.selectType(facetEntry.name)"
                />
              </fieldset>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Publication Year Facet -->
          <v-expansion-panel
            v-if="yearFacetEntries.length > 0"
            title="Publication Year"
            value="years"
            data-testid="year-facet"
            aria-label="Publication year filters"
          >
            <v-expansion-panel-text>
              <fieldset class="facet-options" style="max-height: 250px; overflow-y: auto; border: none; padding: 0; margin: 0;">
                <legend class="sr-only">Publication Year Filters</legend>
                <v-checkbox
                  v-for="facetEntry in yearFacetEntries"
                  :key="facetEntry.name"
                  :model-value="searchStore.activeFilters['published-year'].includes(facetEntry.name)"
                  :label="`${facetEntry.name} (${facetEntry.count?.toLocaleString() || 0})`"
                  density="compact"
                  hide-details
                  :data-testid="`year-filter-${facetEntry.name}`"
                  @update:model-value="searchStore.selectYear(facetEntry.name)"
                />
              </fieldset>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.facet-panel {
  height: 100%;
}

.facet-options {
  padding-left: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>