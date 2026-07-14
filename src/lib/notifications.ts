const PERMISSION_KEY = 'sohbetlik:notification-asked'

export function canAskNotificationPermission(): boolean {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  try {
    return !sessionStorage.getItem(PERMISSION_KEY)
  } catch {
    return true
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false

  try {
    sessionStorage.setItem(PERMISSION_KEY, '1')
  } catch {
    // Ignore
  }

  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function sendLocalNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  try {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'sohbetlik-partner',
      renotify: true,
    } as NotificationOptions)

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch {
    // SW-only environments may not support the Notification constructor
  }
}
