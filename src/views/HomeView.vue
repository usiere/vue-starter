<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useSearchStore } from '@/stores/search'
import SearchBar from '@/components/SearchBar.vue'
import FacetPanel from '@/components/FacetPanel.vue'
import ResultsList from '@/components/ResultsList.vue'

const searchStore = useSearchStore()

onUnmounted(() => {
  searchStore.cleanup()
})
</script>

<template>
  <v-app style="background-color: white !important;">
    <!-- App Bar - Only show when there's a query or results -->
    <v-app-bar
      v-if="searchStore.hasQuery || searchStore.results.length > 0"
      data-testid="app-header"
      elevation="0"
      height="48"
      style="background-color: white !important; border-bottom: 1px solid #e0e0e0;"
    >
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-book-search-outline"
          size="20"
          class="mr-2 ml-4"
          style="color: #424242;"
        />
        <span class="text-subtitle-1 font-weight-medium" style="color: #424242;">
          Crossref Academic Search
        </span>
      </div>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <!-- Empty State - Show when no query -->
      <ResultsList v-if="!searchStore.hasQuery && searchStore.results.length === 0" />

      <!-- Results Layout - Show when there's a query or results -->
      <div v-else class="results-layout">
        <!-- Search Bar at Top - Fixed -->
        <div class="search-bar-container pa-3 pb-0">
          <SearchBar />
        </div>

        <!-- Two-Column Layout with Flex -->
        <div class="content-container">
          <!-- Left Sidebar - Filters (only show when there are results) -->
          <div
            v-if="searchStore.results.length > 0"
            class="filters-sidebar"
          >
            <FacetPanel />
          </div>

          <!-- Right Main Area - Results -->
          <div class="results-column">
            <ResultsList />
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.results-layout {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px); /* Subtract app bar height */
  overflow: hidden;
}

.search-bar-container {
  flex-shrink: 0;
}

.content-container {
  display: flex;
  height: calc(100vh - 48px - 80px); /* Subtract app bar and search bar container height */
  overflow: hidden;
  padding: 0 12px 12px 12px; /* Match container padding */
}

.filters-sidebar {
  width: 25%;
  overflow-y: auto;
  height: 100%;
  padding-right: 12px;
}

.results-column {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  padding-left: 12px;
}
</style>
