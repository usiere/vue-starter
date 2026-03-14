import { test, expect } from '@playwright/test'

test.describe('Crossref Search Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('home page loads with correct title and search interface', async ({ page }) => {
    // Check app header loads
    await expect(page.getByTestId('app-header')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Crossref Academic Search' })).toBeVisible()

    // Check search input is present
    await expect(page.getByTestId('search-input')).toBeVisible()

    // Check facet panel is present
    await expect(page.getByTestId('facet-panel')).toBeVisible()

    // Check empty state is shown initially
    await expect(page.getByTestId('empty-state')).toBeVisible()
    await expect(page.getByText('Search academic publications')).toBeVisible()
  })

  test('user can type a query and see results', async ({ page }) => {
    // Type a search query
    const searchInput = page.getByTestId('search-input').locator('input')
    await searchInput.fill('machine learning')

    // Wait for loading indicator
    await expect(page.getByTestId('loading-indicator')).toBeVisible()

    // Wait for results to appear (with longer timeout for API call)
    await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('results-count')).toBeVisible()

    // Check that result items are displayed
    await expect(page.getByTestId('result-item').first()).toBeVisible()

    // Verify results count is shown
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('results found')
  })

  test('loading state appears during search', async ({ page }) => {
    const searchInput = page.getByTestId('search-input').locator('input')

    // Type search query
    await searchInput.fill('artificial intelligence')

    // Check loading indicator appears
    await expect(page.getByTestId('loading-indicator')).toBeVisible()
    await expect(page.getByText('Searching...')).toBeVisible()

    // Wait for loading to complete
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 10000 })
  })

  test('user can click a type facet and results update', async ({ page }) => {
    // First perform a search to get facets
    const searchInput = page.getByTestId('search-input').locator('input')
    await searchInput.fill('covid')

    // Wait for results and facets to load
    await expect(page.getByTestId('results-count')).toBeVisible({ timeout: 10000 })

    // Expand the type facet if needed
    const typeFacet = page.getByTestId('type-facet')
    await expect(typeFacet).toBeVisible()

    // Get the first checkbox in the type facet panel
    const firstTypeFilter = page.getByTestId('type-facet').locator('[data-testid^="type-filter-"]').first()

    if (await firstTypeFilter.isVisible()) {
      // Click the first type filter
      await firstTypeFilter.click()

      // Wait for results to update
      await expect(page.getByTestId('loading-indicator')).toBeVisible()
      await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 10000 })

      // Verify that an active filter chip appears
      await expect(page.getByText('Active filters:')).toBeVisible()

      // Verify clear filters button appears
      await expect(page.getByTestId('clear-filters')).toBeVisible()
    }
  })

  test('user can click a year facet and results update', async ({ page }) => {
    // First perform a search to get facets
    const searchInput = page.getByTestId('search-input').locator('input')
    await searchInput.fill('climate change')

    // Wait for results and facets to load
    await expect(page.getByTestId('results-count')).toBeVisible({ timeout: 10000 })

    // Expand the year facet if needed
    const yearFacet = page.getByTestId('year-facet')
    await expect(yearFacet).toBeVisible()

    // Get the first checkbox in the year facet panel
    const firstYearFilter = page.getByTestId('year-facet').locator('[data-testid^="year-filter-"]').first()

    if (await firstYearFilter.isVisible()) {
      // Click the first year filter
      await firstYearFilter.click()

      // Wait for results to update
      await expect(page.getByTestId('loading-indicator')).toBeVisible()
      await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 10000 })

      // Verify that an active filter chip appears
      await expect(page.getByText('Active filters:')).toBeVisible()

      // Verify clear filters button appears
      await expect(page.getByTestId('clear-filters')).toBeVisible()
    }
  })

  test('clearing filters resets results', async ({ page }) => {
    // First perform a search and apply filters
    const searchInput = page.getByTestId('search-input').locator('input')
    await searchInput.fill('machine learning')

    // Wait for results and facets to load
    await expect(page.getByTestId('results-count')).toBeVisible({ timeout: 10000 })

    // Apply a filter
    const firstTypeFilter = page.getByTestId('type-facet').locator('[data-testid^="type-filter-"]').first()

    if (await firstTypeFilter.isVisible()) {
      await firstTypeFilter.click()

      // Wait for filtered results
      await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 10000 })
      await expect(page.getByTestId('clear-filters')).toBeVisible()

      // Click clear filters
      await page.getByTestId('clear-filters').click()

      // Wait for results to update
      await expect(page.getByTestId('loading-indicator')).toBeVisible()
      await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 10000 })

      // Verify filters are cleared
      await expect(page.getByText('Active filters:')).not.toBeVisible()
      await expect(page.getByTestId('clear-filters')).not.toBeVisible()
    }
  })

  test('no results state is shown when search returns no results', async ({ page }) => {
    // Search for something that should return no results
    const searchInput = page.getByTestId('search-input').locator('input')
    await searchInput.fill('xyzxyznonexistentterm123')

    // Wait for search to complete
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 10000 })

    // Check no results state is shown
    await expect(page.getByTestId('no-results')).toBeVisible()
    await expect(page.getByText('No results found')).toBeVisible()
    await expect(page.getByText('Try adjusting your search terms or clearing some filters.')).toBeVisible()
  })

  test('result items contain expected information', async ({ page }) => {
    // Perform a search
    const searchInput = page.getByTestId('search-input').locator('input')
    await searchInput.fill('quantum computing')

    // Wait for results
    await expect(page.getByTestId('results-count')).toBeVisible({ timeout: 10000 })

    // Check first result item contains expected elements
    const firstResult = page.getByTestId('result-item').first()
    await expect(firstResult).toBeVisible()

    // Check for title link
    await expect(firstResult.locator('a').first()).toBeVisible()

    // Check for publication type and year chips
    await expect(firstResult.locator('.v-chip').first()).toBeVisible()

    // Check for DOI link
    await expect(firstResult.getByText('DOI:')).toBeVisible()
  })
})
