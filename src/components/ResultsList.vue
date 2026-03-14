<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import ResultItem from './ResultItem.vue'
import SearchBar from './SearchBar.vue'

const searchStore = useSearchStore()

interface Props {
  showMobileFiltersToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showMobileFiltersToggle: false
})

const emit = defineEmits<{
  toggleFilters: []
}>()

const getResultsText = (): string => {
  if (searchStore.totalResults === 0) {
    return 'No results found';
  } else if (searchStore.totalResults === 1) {
    return '1 result found';
  } else {
    return `${searchStore.totalResults.toLocaleString()} results found`;
  }
};

</script>

<template>
<div class="results-list">
  <v-container class="pa-0">
      <!-- Results count with aria-live for screen readers -->
      <div
        class="results-header mb-2"
        :class="{ 'sticky-header': searchStore.hasQuery || searchStore.results.length > 0 }"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          v-if="searchStore.isLoading"
          class="loading-indicator d-flex align-center ga-3"
          data-testid="loading-indicator"
        >
          <v-progress-circular
            indeterminate
            size="20"
            width="3"
          />
          <span>Searching...</span>
        </div>

        <div
          v-else-if="searchStore.hasQuery && !searchStore.error && searchStore.results.length > 0"
          class="d-flex align-center justify-between"
          data-testid="results-count"
        >
          <h2 class="text-h6 mb-0">
            {{ getResultsText() }}
          </h2>

          <v-btn
            v-if="props.showMobileFiltersToggle"
            variant="outlined"
            size="small"
            prepend-icon="mdi-tune"
            @click="emit('toggleFilters')"
            class="ml-4"
          >
            Filters
          </v-btn>
        </div>
      </div>

      <!-- Error state -->
      <v-alert
        v-if="searchStore.error"
        type="error"
        variant="tonal"
        class="mb-4"
        role="alert"
        data-testid="error-alert"
      >
        <template #title>
          Failed to fetch results
        </template>
        <p class="mb-3">Please try again.</p>
        <v-btn
          color="error"
          variant="outlined"
          size="small"
          @click="searchStore.performSearch()"
        >
          Retry
        </v-btn>
      </v-alert>

      <!-- Loading state gets priority -->
      <div
        v-if="searchStore.isLoading"
        class="loading-content d-flex flex-column align-center justify-center"
        style="min-height: 300px;"
        data-testid="loading-content"
      >
        <!-- Loading indicator is handled in results-header above -->
      </div>

      <!-- Google-style empty state -->
      <div
        v-else-if="!searchStore.hasQuery"
        class="google-empty-state"
        data-testid="empty-state"
      >
        <div class="google-branding text-center mb-8">
          <div class="d-flex align-center justify-center mb-6">
            <v-icon
              icon="mdi-book-search-outline"
              size="32"
              class="mr-3"
              style="color: #424242;"
            />
            <h1 class="text-h4 font-weight-light" style="color: #424242;">
              Crossref Academic Search
            </h1>
          </div>
        </div>

        <div class="google-search-container">
          <SearchBar />

          <div class="mt-4 text-center text-body-2 text-grey-darken-1">
            Search metadata from over 150 million scholarly works
          </div>
        </div>
      </div>

      <!-- No results state -->
      <div
        v-else-if="searchStore.results.length === 0 && searchStore.hasSearched"
        class="d-flex flex-column align-center justify-center"
        style="min-height: 400px;"
        data-testid="no-results"
      >
        <v-icon size="64" color="grey-lighten-1">mdi-file-search-outline</v-icon>
        <h3 class="mt-4 text-grey-darken-1">No results found for "{{ searchStore.query }}"</h3>
        <p class="text-grey">Try different search terms.</p>
      </div>

      <!-- Results list -->
      <div
        v-else-if="searchStore.results.length > 0"
        class="results"
        data-testid="results-list"
        aria-label="Search results"
      >
        <div class="results-grid">
          <template
            v-for="(work, index) in searchStore.results"
            :key="work.DOI || index"
          >
            <ResultItem :work="work" />
            <v-divider
              v-if="index < searchStore.results.length - 1"
              class="my-0"
            />
          </template>
        </div>

        <!-- Showing X of Y indicator -->
        <v-card
          v-if="searchStore.totalResults > searchStore.results.length"
          variant="tonal"
          class="results-pagination text-center mt-4 pa-3"
        >
          <div class="text-body-1 font-weight-medium mb-1">
            Showing {{ searchStore.results.length }} of {{ searchStore.totalResults.toLocaleString() }} results
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Use more specific search terms or filters to narrow results
          </div>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.results-list {
  flex: 1;
}

.results-header {
  min-height: 40px;
  display: flex;
  align-items: center;
}

.sticky-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 20;
  padding: 8px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.google-empty-state {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 600px;
  z-index: 1;
  width: 100%;
  padding: 0 24px;
  padding-bottom: 20vh;
}

.google-search-container {
  max-width: 500px;
  margin: 0 auto;
}

.no-results {
  max-width: 600px;
  margin: 0 auto;
}

.results-grid {
  display: flex;
  flex-direction: column;
}

.loading-indicator {
  color: rgb(var(--v-theme-on-surface-variant));
}
</style>