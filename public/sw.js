self.addEventListener('push', (event) => {
  const data = event.data.json();
  const eventTime = data.eventAt
    ? new Date(data.eventAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : null;
  const noticeTime = data.noticeAt
    ? new Date(data.noticeAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : null;
  const body = eventTime
    ? `Event: ${eventTime}${noticeTime ? `\nNotice: ${noticeTime}` : ''}`
    : data.body;
  const options = {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.noteId ? `reminder-${data.noteId}` : undefined,
    requireInteraction: true,
    actions: [
      { action: 'notice', title: 'Notice' },
      { action: 'pause-once', title: 'Temporary' },
      { action: 'stop-always', title: 'Always off' }
    ],
    data: {
      url: data.url || '/',
      actionUrl: data.actionUrl,
      noteId: data.noteId
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  const { actionUrl, url } = event.notification.data || {};

  event.notification.close();

  if (event.action && event.action !== 'notice' && actionUrl) {
    event.waitUntil(
      fetch(actionUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: event.action })
      }).catch(() => {
        // eslint-disable-next-line no-undef
        return clients.openWindow(url || '/');
      })
    );
    return;
  }

  if (event.action === 'notice') return;

  event.waitUntil(
    // eslint-disable-next-line no-undef
    clients.openWindow(url || '/')
  );
});
