const CACHE_NAME = 'rcios-core-v1';
let sharedFile = null; // Memory hold for the incoming file

self.addEventListener('install', (event) => {
    // Force the waiting service worker to become the active service worker.
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Tell the active service worker to take control of the page immediately.
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // 🚨 INTERCEPT: PWA Share Target File Uploads
    if (event.request.method === 'POST' && event.request.url.includes('shared=true')) {
        event.respondWith((async () => {
            try {
                // Parse the incoming POST form data from the OS Share Sheet
                const formData = await event.request.formData();
                sharedFile = formData.get('receipt_file'); 
                
                // ⚡ ENTERPRISE FIX: 303 Redirect
                // Instead of faking an HTML response, we cleanly redirect the browser.
                // This converts the rejected POST into a safe GET request for GitHub Pages.
                return Response.redirect('index.html?shared=true&target=vault', 303);
                
            } catch (e) {
                console.error('Service Worker Share Catch Error:', e);
                // Failsafe redirect home
                return Response.redirect('index.html', 303);
            }
        })());
        return; // Exit fetch handler
    }

    // Pass-through for all normal network traffic
    event.respondWith(fetch(event.request));
});

// 📡 LISTENER: Frontend requesting the held file
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'get-shared-file') {
        // Send the file down to the active VaultView iframe/window
        event.source.postMessage({ 
            action: 'deliver-shared-file',
            file: sharedFile 
        });
        
        // Clear memory to prevent duplicate uploads
        sharedFile = null; 
    }
});
