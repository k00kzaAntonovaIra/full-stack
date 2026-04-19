import { test, expect } from '@playwright/test';

test('должен успешно создать поездку и отобразить её', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await page.getByRole('button', { name: /создать поездку|add trip/i }).click();

  await page.getByPlaceholder(/название/i).fill('Тестовое путешествие');
  await page.getByPlaceholder(/куда/i).fill('Париж');

  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.locator('input[type="file"]').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('tests/fixtures/test-image.jpg'); // положи картинку в эту папку

  // 5. Отправляем форму
  await page.getByRole('button', { name: /сохранить|submit/i }).click();

  // 6. ПРОВЕРКА: появилась ли карточка с таким названием?
  await expect(page.getByText('Тестовое путешествие')).toBeVisible();
  
  // 7. Проверка картинки (что она не битая)
  const img = page.locator('img[src*="travel-photos"]');
  await expect(img).toBeVisible();
});