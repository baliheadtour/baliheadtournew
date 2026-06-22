export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/admin/'],
    },
    sitemap: 'https://www.bobbybaliguide.com/sitemap.xml',
  }
}
