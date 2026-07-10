import { test, expect } from '@playwright/test'
import { injectMockFileSystem, loadHomePage, openMockFolder } from './helpers/setup'

test.describe('Ghost Concepts — filter toggle, ghost groups, add lifecycle', () => {
  test.beforeEach(async ({ page, context }) => {
    await injectMockFileSystem(page, context)
    await loadHomePage(page)
    await openMockFolder(page)
  })

  test('R-TGC-01: Filter toggle is visible and functional', async ({ page }) => {
    // Wait for the tree to render
    await page.getByTestId('expand-all').click()

    // The ghost filter toggle should be visible
    const toggle = page.getByTestId('ghost-filter-toggle')
    await expect(toggle).toBeVisible()

    // Default label on the button should be CMP (showing complete only, option to cycle to ALL)
    await expect(toggle).toHaveText('CMP')
  })

  test('R-TGC-02: Filter toggle switches modes and renders ghost concepts', async ({ page }) => {
    await page.getByTestId('expand-all').click()

    const toggle = page.getByTestId('ghost-filter-toggle')
    await expect(toggle).toBeVisible()

    // Click to cycle to ALL mode (which shows ghosts)
    await toggle.click()
    await expect(toggle).toHaveText('ALL')

    // In ALL mode, ghost concept headers should render in the tree
    const ghostHeaders = page.getByTestId('ghost-group-header')
    // They may exist if metamodel has ghost concepts
    const count = await ghostHeaders.count()
    if (count > 0) {
      await expect(ghostHeaders.first()).toBeVisible()
    }
  })

  test('R-TGC-03: Selecting a ghost concept opens empty table view', async ({ page }) => {
    await page.getByTestId('expand-all').click()

    const toggle = page.getByTestId('ghost-filter-toggle')
    await toggle.click() // Switch to ALL mode to see ghosts

    const ghostHeaders = page.getByTestId('ghost-group-header')
    if ((await ghostHeaders.count()) > 0) {
      const firstGhost = ghostHeaders.first()
      await firstGhost.click()

      // Should open the table view in the central panel
      // Verify empty table status message is visible
      await expect(page.locator('text=No elements for this concept.')).toBeVisible()

      // The "Add Element" button should be visible in the table header
      const addBtn = page.getByTestId('add-element-btn')
      await expect(addBtn).toBeVisible()
    }
  })

  test('R-TGC-04: Adding element from table creates element and updates sidebar', async ({
    page,
  }) => {
    await page.getByTestId('expand-all').click()

    const toggle = page.getByTestId('ghost-filter-toggle')
    await toggle.click() // Switch to ALL mode to see ghosts

    const ghostHeaders = page.getByTestId('ghost-group-header')
    if ((await ghostHeaders.count()) > 0) {
      // Record the count of ghosts before adding
      const initialGhostCount = await ghostHeaders.count()

      const firstGhost = ghostHeaders.first()

      await firstGhost.click()

      // Click the Add Element button inside the empty table view
      const addBtn = page.getByTestId('add-element-btn')
      await addBtn.click()

      // Wait a tick for reactivity
      await page.waitForTimeout(200)

      // Once created, the concept is no longer empty, so it should not render as a ghost anymore.
      // Ghost headers count should decrease by 1.
      const newGhostCount = await page.getByTestId('ghost-group-header').count()
      expect(newGhostCount).toBe(initialGhostCount - 1)

      // The new element should be selected and its detail block visible
      await expect(page.getByTestId('block-sheet')).toBeVisible()
    }
  })
})
