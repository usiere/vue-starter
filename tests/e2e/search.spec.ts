import { test, expect } from '@playwright/test'

test.describe('Search App', () => {
  test('page loads and shows heading', async ({ page }) => {
    await page.goto('/')

    // Check that the main heading is visible
    await expect(page.locator('h1')).toContainText('Crossref Academic Search')
  })

  test('search functionality works', async ({ page }) => {
    await page.goto('/')

    // Type in the search input
    const searchInput = page.locator('[data-testid="search-input"] input')
    await searchInput.fill('climate change')

    // Wait for API response
    await page.waitForTimeout(3000)

    // Check that results appear
    await expect(page.locator('text=results found')).toBeVisible()
  })
})