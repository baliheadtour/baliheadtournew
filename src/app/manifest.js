export default function manifest() {
  return {
    name: 'MyBaliDriver Admin',
    short_name: 'AdminPortal',
    description: 'Management dashboard for MyBaliDriver',
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
