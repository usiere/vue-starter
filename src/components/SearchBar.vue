<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useSearchStore } from '@/stores/search'

const searchStore = useSearchStore()
const searchInputRef = ref()

// Immediate focus function without delays
const focusInput = () => {
  try {
    const input = searchInputRef.value?.$el?.querySelector('input')
    if (input && document.activeElement !== input) {
      input.focus()
    }
  } catch (error) {
    console.warn('Focus error:', error)
  }
}

// Auto-focus when component mounts (for empty state)
onMounted(async () => {
  if (!searchStore.hasQuery && searchStore.results.length === 0) {
    await nextTick()
    focusInput()
  }
})

const handleClear = async () => {
  searchStore.query = ''
  searchStore.resetToInitialState()

  // Immediate focus after clearing
  await nextTick()
  focusInput()
}

// Watch for hasQuery to transition to results view - IMMEDIATE focus
watch(() => searchStore.hasQuery, async (hasQuery, prevHasQuery) => {
  // When transitioning from no query to having query (2+ characters)
  if (hasQuery && !prevHasQuery) {
    // Focus immediately without waiting for DOM updates
    focusInput()
    // Also ensure focus after DOM updates
    await nextTick()
    focusInput()
  }
  // When transitioning from having a query to no query (cleared/deleted)
  else if (!hasQuery && prevHasQuery) {
    await nextTick()
    focusInput()
  }
})

// Watch for when results first appear to maintain focus
watch(() => searchStore.results.length > 0, async (hasResults, prevHasResults) => {
  // When results first appear, ensure focus is maintained
  if (hasResults && !prevHasResults) {
    focusInput()
    await nextTick()
    focusInput()
  }
})

// Handle input changes - maintain focus during typing
const handleInput = (value: string) => {
  searchStore.setQuery(value)
  // Ensure focus is maintained after query updates
  setTimeout(focusInput, 0)
}
</script>

<template>
  <div class="search-bar" role="search">
    <v-text-field
      ref="searchInputRef"
      :model-value="searchStore.query"
      label=""
      placeholder="Search academic publications"
      prepend-inner-icon="mdi-magnify"
      variant="solo"
      clearable
      autofocus
      data-testid="search-input"
      density="comfortable"
      style="box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
      @update:model-value="handleInput"
      @click:clear="handleClear"
    />

    <v-progress-linear
      v-if="searchStore.isLoading"
      indeterminate
      color="primary"
      class="mt-2"
    ></v-progress-linear>
  </div>
</template>

<style scoped>
.search-bar {
  margin-bottom: 1rem;
}

.search-status {
  margin-top: 0.5rem;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.875rem;
}

/* Improve search bar contrast */
.search-bar :deep(.v-field__input) {
  font-weight: 500;
  color: #2c2c2c !important;
}

.search-bar :deep(.v-field__input::placeholder) {
  color: #9e9e9e !important;
  font-weight: 400;
  opacity: 0.7;
}

.search-bar :deep(.v-field--focused .v-field__outline) {
  border-color: #2d4a3e !important;
}

.search-bar :deep(.v-field--focused .v-field__outline__start),
.search-bar :deep(.v-field--focused .v-field__outline__end) {
  border-color: #2d4a3e !important;
}
</style>