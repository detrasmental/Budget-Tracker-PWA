const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
    './',
    './index.html',
    './js/idb.js',
    './css/styles.css',
    './js/index.js',
    // './manifest.json',
    // './icons/icon-512x512.png',
    // './icons/icon-384x384.png',
    // './icons/icon-192x192.png',
    // './icons/icon-152x152.png',
    // './icons/icon-144x144.png',
    // './icons/icon-128x128.png',
    // './icons/icon-96x96.png',
    // './icons/icon-72x72.png'
  ];

  // install
self.addEventListener("install", function(e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("Files cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  // activate
  self.addEventListener("activate", function(e) {
    e.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Cache deleted", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  // fetch
  self.addEventListener("fetch", function (e) {
    if (e.request.url.includes("/api/")) {
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(e.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(e.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err => {
                        return cache.match(e.request);
                    });
            }).catch(err => console.log(err))
        );

        return;
    }
});