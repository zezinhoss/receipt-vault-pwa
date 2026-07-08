let sharedFile = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Catch the native POST payload from Android Share Sheet BEFORE GitHub rejects it
  if (event.request.method === 'POST' && url.pathname.endsWith('/_share')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        sharedFile = formData.get('receipt_file'); 
        
        // Redirect to the UI page using a safe GET request
        return Response.redirect('https://zezinhoss.github.io/receipt-vault-pwa/index.html?shared=true', 303);
      } catch (e) {
        return Response.redirect('https://zezinhoss.github.io/receipt-vault-pwa/index.html', 303);
      }
    })());
  }
});

// Pass the file to the UI when it asks for it
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'get-shared-file') {
    event.source.postMessage({ file: sharedFile });
    sharedFile = null; // Clear memory
  }
});
