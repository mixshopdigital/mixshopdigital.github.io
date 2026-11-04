// Al tocar una notificación, abre (o enfoca) Familia Sana en la sección correspondiente.
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const ruta = (e.notification.data && e.notification.data.ruta) || '#/inicio'
  e.waitUntil((async () => {
    const abiertas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const c of abiertas) { await c.focus(); c.navigate(self.registration.scope + ruta); return }
    await self.clients.openWindow(self.registration.scope + ruta)
  })())
})
