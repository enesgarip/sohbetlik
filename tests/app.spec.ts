import { expect, test } from '@playwright/test'

test('creates a room and completes the sample conversation flow', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Doğru cevaplar değil/i })).toBeVisible()
  await page.getByRole('button', { name: 'Oda oluştur' }).click()

  await expect(page.getByRole('heading', { name: 'Odan hazır.' })).toBeVisible()
  await expect(page.locator('.qr-block svg')).toHaveCount(1)
  await page.getByRole('button', { name: 'Soru setine başla' }).click()

  await expect(page.locator('.question-panel')).toBeVisible()

  for (let index = 0; index < 8; index += 1) {
    const range = page.getByRole('slider')
    if (await range.count()) {
      await range.fill('4')
    } else {
      await page.locator('.answer-option').first().click()
    }

    await page.getByRole('button', { name: index === 7 ? 'Cevapları tamamla' : 'Sonraki soru' }).click()
  }

  await expect(page.getByRole('heading', { name: 'Cevaplar tamamlandı.' })).toBeVisible()
  await page.getByRole('button', { name: 'Sonuçları aç' }).click()
  await expect(page.getByRole('heading', { name: 'Konuşmanın güzel yerleri burada.' })).toBeVisible()
  await expect(page.getByText('Konuşmaya değer konu')).toBeVisible()
})

test('opens an invite route and starts as the invited participant', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Oda oluştur' }).click()

  const roomCode = await page.locator('.invite-details strong').innerText()

  await page.goto(`/join/${roomCode.toLowerCase()}`)
  await expect(page.getByRole('heading', { name: 'Davete katıl.' })).toBeVisible()
  await page.getByRole('button', { name: 'Sorulara geç' }).click()

  await expect(page.locator('.question-panel')).toBeVisible()
  await expect(page.getByText('Davetli')).toBeVisible()
})
