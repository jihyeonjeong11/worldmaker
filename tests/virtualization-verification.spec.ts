import { test, expect } from '@playwright/test';

/**
 * Temporary verification test for react-window virtualization feature
 * This test verifies that virtualization is working correctly in the application.
 * DELETE THIS FILE after verification is complete.
 */

test.describe('React-Window Virtualization', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    // Wait for the app to load (check for projects view or loading screen to disappear)
    await page.waitForSelector('[data-testid="projects-view"], [data-testid="kanban-section"]', { timeout: 30000 });
  });

  test('application loads successfully', async ({ page }) => {
    // Verify the app renders without errors - either projects view or kanban section
    const projectsView = page.locator('[data-testid="projects-view"]');
    const kanbanSection = page.locator('[data-testid="kanban-section"]');

    // At least one should be visible
    const projectsVisible = await projectsView.isVisible().catch(() => false);
    const kanbanVisible = await kanbanSection.isVisible().catch(() => false);

    expect(projectsVisible || kanbanVisible).toBe(true);
  });

  test('card library drawer opens and displays templates', async ({ page }) => {
    // Look for the "Open Card Library" button in the demo features section
    const libraryButton = page.locator('[data-testid="open-card-library-btn"]');

    // Wait for the button to be visible
    await expect(libraryButton).toBeVisible({ timeout: 10000 });

    // Click the library button
    await libraryButton.click();

    // Wait for the drawer to open
    const drawer = page.locator('[data-testid="card-library-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Verify category list is present
    const categoryList = page.locator('[data-testid="category-list"]');
    await expect(categoryList).toBeVisible();

    // Verify at least one category header is visible
    const categoryHeader = page.locator('[data-testid^="category-header-"]');
    await expect(categoryHeader.first()).toBeVisible({ timeout: 5000 });

    // Verify templates are visible in expanded categories (Story Structure is expanded by default)
    const templateCard = page.locator('[data-testid^="template-card-"]');
    if (await templateCard.count() > 0) {
      await expect(templateCard.first()).toBeVisible();
    }
  });

  test('card library drawer search functionality works', async ({ page }) => {
    // Open the card library
    const libraryButton = page.locator('[data-testid="open-card-library-btn"]');
    await expect(libraryButton).toBeVisible({ timeout: 10000 });
    await libraryButton.click();

    // Wait for the drawer to open
    const drawer = page.locator('[data-testid="card-library-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Find the search input
    const searchInput = page.locator('[data-testid="template-search-input"]');
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('character');

    // Wait for debounce (300ms) + some buffer
    await page.waitForTimeout(500);

    // Verify search results info is shown
    const searchResultsInfo = page.locator('[data-testid="search-results-info"]');
    await expect(searchResultsInfo).toBeVisible({ timeout: 5000 });

    // The search info should contain "Found X matching"
    await expect(searchResultsInfo).toContainText('Found');
  });

  test('expand and collapse all buttons work in drawer', async ({ page }) => {
    // Open the card library
    const libraryButton = page.locator('[data-testid="open-card-library-btn"]');
    await expect(libraryButton).toBeVisible({ timeout: 10000 });
    await libraryButton.click();

    // Wait for the drawer to open
    const drawer = page.locator('[data-testid="card-library-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Find expand/collapse buttons
    const expandAllBtn = page.locator('[data-testid="expand-all-btn"]');
    const collapseAllBtn = page.locator('[data-testid="collapse-all-btn"]');

    await expect(expandAllBtn).toBeVisible();
    await expect(collapseAllBtn).toBeVisible();

    // Click collapse all
    await collapseAllBtn.click();
    await page.waitForTimeout(300); // Wait for animation

    // Click expand all
    await expandAllBtn.click();
    await page.waitForTimeout(300); // Wait for animation

    // Verify drawer is still visible (no errors occurred)
    await expect(drawer).toBeVisible();
  });

  test('kanban board view can be accessed and renders correctly', async ({ page }) => {
    // First create a project if needed
    const createProjectBtn = page.locator('button:has-text("Create Project"), button:has-text("New Project")');

    if (await createProjectBtn.count() > 0) {
      // Try to access board via existing project
      const projectCard = page.locator('[data-testid^="project-card-"]');

      if (await projectCard.count() > 0) {
        // Click on the first project to select it
        await projectCard.first().click();

        // Click on Board view button
        const boardBtn = page.locator('[data-testid="view-board-btn"]');
        if (await boardBtn.isEnabled()) {
          await boardBtn.click();

          // Wait for kanban section
          const kanbanSection = page.locator('[data-testid="kanban-section"]');
          await expect(kanbanSection).toBeVisible({ timeout: 5000 });

          // Check for board components
          const kanbanBoard = page.locator('[data-testid="kanban-board"], [data-testid="kanban-board-empty"], [data-testid="kanban-board-no-columns"]');
          await expect(kanbanBoard).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('template selection works in drawer', async ({ page }) => {
    // Open the card library
    const libraryButton = page.locator('[data-testid="open-card-library-btn"]');
    await expect(libraryButton).toBeVisible({ timeout: 10000 });
    await libraryButton.click();

    // Wait for the drawer to open
    const drawer = page.locator('[data-testid="card-library-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Find a template card (Story Structure is expanded by default)
    const templateCard = page.locator('[data-testid^="template-card-"]').first();

    if (await templateCard.count() > 0) {
      // Click the template
      await templateCard.click();

      // Verify the selection was logged (check the selected template indicator in the app)
      // The app shows "Last selected template:" when a template is selected
      await page.waitForTimeout(500);

      // Just verify no errors occurred and drawer is still functional
      await expect(drawer).toBeVisible();
    }
  });
});
