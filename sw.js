let sharedFile = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Capture POST requests to the share target using the absolute root path
  if (event.request.method === 'POST' && event.request.url.includes('shared=true')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        sharedFile = formData.get('receipt_file'); 
        
        // Fetch the HTML interface from the absolute root
        const response = await fetch('/RCexsview.html');
        const html = await response.text();
        
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (e) {
        console.error('Service Worker Share Catch Error:', e);
        const response = await fetch('/RCexsview.html');
        return new Response(await response.text(), { headers: { 'Content-Type': 'text/html' }});
      }
    })());
  }
});

self.addEventListener('message', (event) => {
  // Wait for the frontend to ask for the file
  if (event.data && event.data.action === 'get-shared-file') {
    event.source.postMessage({ file: sharedFile });
    sharedFile = null; 
  }
});
