import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { SESSION_QUESTION_COUNT } from '../src/repositories/questionRepository'

// Real two-device sync needs a Supabase backend. Local runs get it from
// .env.local (e.g. the `supabase start` stack); CI smoke runs skip it.
function hasSupabaseEnv() {
  try {
    const env = readFileSync(fileURLToPath(new URL('../.env.local', import.meta.url)), 'utf8')

    return /^VITE_SUPABASE_URL=.+$/m.test(env)
  } catch {
    return false
  }
}

test.describe('two-device sync', () => {
  test.skip(!hasSupabaseEnv(), 'Requires Supabase env in .env.local')

  test('guest progress from a second device appears on the host device', async ({ browser }) => {
    const hostContext = await browser.newContext()
    const guestContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    const guestPage = await guestContext.newPage()

    await hostPage.goto('/')
    await hostPage.getByRole('button', { name: /Oda oluştur|Sohbete başla/ }).click()
    await expect(hostPage.getByRole('heading', { name: 'Odan hazır.' })).toBeVisible()

    const roomCode = await hostPage.locator('.invite-details strong').innerText()

    await guestPage.goto(`/join/${roomCode.toLowerCase()}`)
    await guestPage.getByRole('button', { name: 'Sorulara geç' }).click()
    await expect(guestPage.locator('.question-panel')).toBeVisible()

    await guestPage.locator('.answer-option').first().click()
    await guestPage.getByRole('button', { name: 'Sonraki soru' }).click()

    // Realtime or the 3s polling fallback should surface the guest's answer.
    const guestRow = hostPage.locator('.participant-row', { hasText: 'Davetli' })
    await expect(guestRow.locator('strong')).toHaveText(`1/${SESSION_QUESTION_COUNT}`, { timeout: 15_000 })

    await hostContext.close()
    await guestContext.close()
  })
})
