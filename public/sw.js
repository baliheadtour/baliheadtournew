self.addEventListener('install', (event) => {
  console.log('PWA Service worker installed');
});

self.addEventListener('fetch', (event) => {
  // Required empty fetch handler for Chrome PWA install prompt to trigger
});
