import { expect, test, type Page } from '@playwright/test'

async function completeQuestionSet(page: Page) {
  await expect(page.locator('.question-panel')).toBeVisible()

  for (let index = 0; index < 24; index += 1) {
    const range = page.getByRole('slider')
    if (await range.count()) {
      await range.fill('4')
    } else {
      await page.locator('.answer-option').first().click()
    }

    await page.getByRole('button', { name: index === 23 ? 'Cevapları tamamla' : 'Sonraki soru' }).click()
  }
}

test('creates a room and completes the two-person conversation flow', async ({ page, browser }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Doğru cevaplar değil/i })).toBeVisible()
  await page.getByRole('button', { name: 'Oda oluştur' }).click()

  await expect(page.getByRole('heading', { name: 'Odan hazır.' })).toBeVisible()
  await expect(page.locator('.qr-block svg')).toHaveCount(1)
  const roomCode = await page.locator('.invite-details strong').innerText()
  await page.getByRole('button', { name: 'Soru setine başla' }).click()

  await completeQuestionSet(page)
  await expect(page.getByRole('heading', { name: 'Senin cevapların tamam.' })).toBeVisible()

  const guestContext = await browser.newContext()
  const guestPage = await guestContext.newPage()

  try {
    await guestPage.goto(`/join/${roomCode.toLowerCase()}`)
    await guestPage.getByRole('button', { name: 'Sorulara geç' }).click()

    await completeQuestionSet(guestPage)
    await expect(guestPage.getByRole('heading', { name: 'İkiniz de tamamladınız!' })).toBeVisible()
    await guestPage.getByRole('button', { name: 'Sonuçları aç' }).click()
    await expect(guestPage.getByRole('heading', { name: 'Konuşmanın güzel yerleri burada.' })).toBeVisible()
    await expect(guestPage.getByText('Konuşmaya değer konu')).toBeVisible()
  } finally {
    await guestContext.close()
  }
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
