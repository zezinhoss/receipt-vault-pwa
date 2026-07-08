let sharedFile = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Catch the native POST payload from Android Share Sheet
  if (event.request.method === 'POST' && url.searchParams.has('shared_file')) {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      sharedFile = formData.get('receipt_file'); // Catch the file
      
      // Redirect to the UI page
      return Response.redirect('/?shared_file=1', 303);
    })());
  }
});

// Pass the file to the UI when it asks for it
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'get-shared-file') {
    event.source.postMessage({ file: sharedFile });
  }
});
