let sharedFile = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 1. Catch the POST request from Android Share Target
  if (event.request.method === 'POST' && event.request.url.includes('shared=true')) {
    event.respondWith((async () => {
      try {
        // 2. Extract the file from the payload
        const formData = await event.request.formData();
        sharedFile = formData.get('receipt_file'); 
        
        // 3. DO NOT REDIRECT. Fetch the HTML interface directly and serve it as a clean 200 OK.
        const response = await fetch('index.html');
        const html = await response.text();
        
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (e) {
        console.error('Service Worker Share Catch Error:', e);
        const response = await fetch('index.html');
        return new Response(await response.text(), { headers: { 'Content-Type': 'text/html' }});
      }
    })());
  }
});

// 4. Pass the file to the frontend UI when it asks
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'get-shared-file') {
    event.source.postMessage({ file: sharedFile });
    sharedFile = null; // Clear memory after passing
  }
});
