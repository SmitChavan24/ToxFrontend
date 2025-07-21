self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
});

// self.addEventListener('fetch', (event) => {
//     console.log('Fetching:', event.request.url);
// });

self.addEventListener('push', function (event) {
    const data = event.data?.json() || { title: 'Notification', body: 'You have a message!' };
    self.registration.showNotification(data.title, {
        body: data.body,
        // icon: '/icon-192x192.png'
    });
});