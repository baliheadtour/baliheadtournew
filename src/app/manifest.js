export default function manifest() {
  return {
    name: 'BaliHeadTour Admin',
    short_name: 'AdminPortal',
    description: 'Management dashboard for BaliHeadTour',
    start_url: '/admin',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1C1C1E',
    icons: [
      {
        src: '/icon.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/icon.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
