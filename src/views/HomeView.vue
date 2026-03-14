<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useSearchStore } from '@/stores/search'
import SearchBar from '@/components/SearchBar.vue'
import FacetPanel from '@/components/FacetPanel.vue'
import ResultsList from '@/components/ResultsList.vue'

const searchStore = useSearchStore()
const { mdAndUp } = useDisplay()
const showMobileFilters = ref(false)

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
          <!-- Desktop Filters Sidebar - Always visible on desktop when there are results -->
          <div
            v-if="searchStore.results.length > 0 && mdAndUp"
            class="filters-sidebar"
          >
            <FacetPanel />
          </div>

          <!-- Mobile Filters Drawer -->
          <v-navigation-drawer
            v-if="searchStore.results.length > 0 && !mdAndUp"
            v-model="showMobileFilters"
            location="bottom"
            temporary
            height="70vh"
            class="mobile-filters-drawer"
          >
            <div class="pa-4">
              <div class="d-flex align-center justify-between mb-4">
                <h3 class="text-h6">Filters</h3>
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  size="small"
                  @click="showMobileFilters = false"
                />
              </div>
              <FacetPanel :hide-title="true" />
            </div>
          </v-navigation-drawer>

          <!-- Right Main Area - Results -->
          <div class="results-column">
            <ResultsList :show-mobile-filters-toggle="!mdAndUp && searchStore.results.length > 0" @toggle-filters="showMobileFilters = !showMobileFilters" />
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

/* Mobile responsive layout */
@media (max-width: 960px) {
  .content-container {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 48px - 80px);
  }

  .results-column {
    padding-left: 0;
    height: auto;
    flex: 1;
    width: 100%;
  }
}

/* Mobile filters drawer styling */
.mobile-filters-drawer {
  border-radius: 16px 16px 0 0 !important;
}

.mobile-filters-drawer .v-navigation-drawer__content {
  overflow-y: auto;
}
</style>
