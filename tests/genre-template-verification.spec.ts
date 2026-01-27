import { test, expect } from '@playwright/test';

test.describe('Genre Template System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await expect(page.locator('h1:has-text("StoryMaker")')).toBeVisible({ timeout: 15000 });
  });

  test('should open genre template picker and display all 4 genres', async ({ page }) => {
    // Click the "Create from Genre Template" button
    const genreBtn = page.locator('[data-testid="open-genre-picker-btn"]');
    await expect(genreBtn).toBeVisible();
    await genreBtn.click();

    // Verify the dialog opens
    const picker = page.locator('[data-testid="genre-template-picker"]');
    await expect(picker).toBeVisible();

    // Verify all 4 genre options are present
    await expect(page.locator('[data-testid="genre-option-genre-thriller"]')).toBeVisible();
    await expect(page.locator('[data-testid="genre-option-genre-romance"]')).toBeVisible();
    await expect(page.locator('[data-testid="genre-option-genre-fantasy"]')).toBeVisible();
    await expect(page.locator('[data-testid="genre-option-genre-mystery"]')).toBeVisible();
  });

  test('should create a project from thriller template with correct columns', async ({ page }) => {
    // Open genre picker
    await page.locator('[data-testid="open-genre-picker-btn"]').click();
    await expect(page.locator('[data-testid="genre-template-picker"]')).toBeVisible();

    // Select Thriller genre
    await page.locator('[data-testid="genre-option-genre-thriller"]').click();

    // Verify template preview appears
    await expect(page.locator('[data-testid="template-preview"]')).toBeVisible();

    // Enter project name
    await page.locator('[data-testid="genre-project-name-input"]').fill('My Thriller Story');

    // Click apply
    await page.locator('[data-testid="apply-genre-template-btn"]').click();

    // Should switch to board view and show the project
    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible({ timeout: 10000 });

    // Verify thriller columns are created
    await expect(page.locator('text=Setup & Hook')).toBeVisible();
    await expect(page.locator('text=Inciting Incident')).toBeVisible();
    await expect(page.locator('text=Rising Tension')).toBeVisible();
    await expect(page.locator('text=Climax')).toBeVisible();
    await expect(page.locator('text=Resolution')).toBeVisible();
  });

  test('should create a project from romance template', async ({ page }) => {
    await page.locator('[data-testid="open-genre-picker-btn"]').click();
    await page.locator('[data-testid="genre-option-genre-romance"]').click();
    await page.locator('[data-testid="genre-project-name-input"]').fill('Love Story');
    await page.locator('[data-testid="apply-genre-template-btn"]').click();

    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Meet Cute')).toBeVisible();
    await expect(page.locator('text=Building Attraction')).toBeVisible();
    await expect(page.locator('text=Dark Moment')).toBeVisible();
  });

  test('should create a project from mystery template', async ({ page }) => {
    await page.locator('[data-testid="open-genre-picker-btn"]').click();
    await page.locator('[data-testid="genre-option-genre-mystery"]').click();
    await page.locator('[data-testid="genre-project-name-input"]').fill('Whodunit');
    await page.locator('[data-testid="apply-genre-template-btn"]').click();

    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Crime Discovery')).toBeVisible();
    await expect(page.locator('text=Investigation')).toBeVisible();
    await expect(page.locator('text=Red Herrings')).toBeVisible();
    await expect(page.locator('text=Revelation')).toBeVisible();
  });

  test('should create a project from fantasy template', async ({ page }) => {
    await page.locator('[data-testid="open-genre-picker-btn"]').click();
    await page.locator('[data-testid="genre-option-genre-fantasy"]').click();
    await page.locator('[data-testid="genre-project-name-input"]').fill('Epic Quest');
    await page.locator('[data-testid="apply-genre-template-btn"]').click();

    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Ordinary World')).toBeVisible();
    await expect(page.locator('text=Call to Adventure')).toBeVisible();
    await expect(page.locator('text=World Discovery')).toBeVisible();
    await expect(page.locator('text=Final Battle')).toBeVisible();
  });

  test('should show validation error when no name entered', async ({ page }) => {
    await page.locator('[data-testid="open-genre-picker-btn"]').click();
    await page.locator('[data-testid="genre-option-genre-thriller"]').click();

    // The apply button should be disabled without a name
    const applyBtn = page.locator('[data-testid="apply-genre-template-btn"]');
    await expect(applyBtn).toBeDisabled();
  });

  test('should close picker when cancel is clicked', async ({ page }) => {
    await page.locator('[data-testid="open-genre-picker-btn"]').click();
    await expect(page.locator('[data-testid="genre-template-picker"]')).toBeVisible();

    await page.locator('[data-testid="cancel-genre-picker"]').click();
    await expect(page.locator('[data-testid="genre-template-picker"]')).not.toBeVisible();
  });

  test('genre templates appear in card library drawer', async ({ page }) => {
    await page.locator('[data-testid="open-card-library-btn"]').click();

    // Search for genre templates
    const searchInput = page.locator('[data-testid="template-search-input"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('genre');

    // Should find genre templates
    await expect(page.locator('[data-testid="search-results-info"]')).toBeVisible();
    await expect(page.locator('text=Thriller')).toBeVisible();
    await expect(page.locator('text=Romance')).toBeVisible();
    await expect(page.locator('text=Fantasy')).toBeVisible();
    await expect(page.locator('text=Mystery')).toBeVisible();
  });
});
