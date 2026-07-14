import { expect, test, type Page } from '@playwright/test'
import { SESSION_QUESTION_COUNT } from '../src/repositories/questionRepository'

async function createRoomFromHome(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Doğru cevaplar değil/i })).toBeVisible()
  await page.getByRole('button', { name: /Oda oluştur|Sohbete başla/ }).click()
}

async function completeQuestionSet(page: Page) {
  await expect(page.locator('.question-panel')).toBeVisible()

  for (let index = 0; index < SESSION_QUESTION_COUNT; index += 1) {
    const range = page.getByRole('slider')
    if (await range.count()) {
      await range.fill('4')
    } else {
      await page.locator('.answer-option').first().click()
    }

    await page.getByRole('button', { name: index === SESSION_QUESTION_COUNT - 1 ? 'Cevapları tamamla' : 'Sonraki soru' }).click()
  }
}

test('creates a room and completes the two-person conversation flow', async ({ page, browser }) => {
  await createRoomFromHome(page)

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
    await expect(guestPage.getByRole('heading', { name: 'Bu oturumdaki cevaplarınıza göre' })).toBeVisible()
    await expect(guestPage.getByText('Konuşmaya değer konu')).toBeVisible()

    const downloadPromise = guestPage.waitForEvent('download')
    await guestPage.getByRole('button', { name: 'Rapor indir' }).click()
    const report = await downloadPromise
    expect(report.suggestedFilename()).toMatch(/^sohbetlik-rapor-.+\.html$/)
  } finally {
    await guestContext.close()
  }
})

test('opens an invite route and starts as the invited participant', async ({ page }) => {
  await createRoomFromHome(page)

  const roomCode = await page.locator('.invite-details strong').innerText()

  await page.goto(`/join/${roomCode.toLowerCase()}`)
  await expect(page.getByRole('heading', { name: 'Seni bekliyorlar!' })).toBeVisible()
  await page.getByRole('button', { name: 'Sorulara geç' }).click()

  await expect(page.locator('.question-panel')).toBeVisible()
  await expect(page.getByText('Davetli')).toBeVisible()
})
