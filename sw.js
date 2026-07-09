let sharedFile = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST' && event.request.url.includes('shared=true')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        sharedFile = formData.get('receipt_file'); 
        
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

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'get-shared-file') {
    event.source.postMessage({ file: sharedFile });
    sharedFile = null; 
  }
});
