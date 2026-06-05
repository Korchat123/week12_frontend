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
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    // eslint-disable-next-line no-undef
    clients.openWindow(event.notification.data.url)
  );
});
