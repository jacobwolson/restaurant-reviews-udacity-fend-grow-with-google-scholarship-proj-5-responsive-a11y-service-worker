/**
 *  Sources consulted: 
 * https://developers.google.com/web/fundamentals/codelabs/offline/
 * https://developers.google.com/web/fundamentals/primers/service-workers/
 * https://matthewcranford.com/restaurant-reviews-app-walkthrough-part-4-service-workers/
 */


// Code adapted from afformentioned source: https://developers.google.com/web/fundamentals/primers/service-workers/
const cacheV1 = 'restaurant-reviews-cache-v1';
let urlsToCache = [
        '/',
        '/index.html',
        '/restaurant.html',
        '/css/styles.css',
        '/css/styles-428plus.css',
        '/css/styles-498plus.css',
        '/data/restaurants.json',
        '/img/1.jpg',
        '/img/2.jpg',
        '/img/3.jpg',
        '/img/4.jpg',
        '/img/5.jpg',
        '/img/6.jpg',
        '/img/7.jpg',
        '/img/8.jpg',
        '/img/9.jpg',
        '/img/10.jpg',
        '/img/logo.png',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
]

self.addEventListener('install', function(event) {
  console.log("serviceWorker installed");
  event.waitUntil(
    caches.open('cacheV1').then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
      return response;
      }
      let requestClone = event.request.clone();
      return fetch(requestClone).then(function(response) {
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        let responseClone = response.clone();
        caches.open(cacheV1).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    })
  );
});
