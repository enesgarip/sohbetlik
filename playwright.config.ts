import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // 24 soruluk akış gerçek Supabase'e karşı koştuğunda (soru başına ağ
  // gidiş-dönüşü) mobil emülasyonda 30sn'ye sığmıyor.
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
    },
  ],
})
