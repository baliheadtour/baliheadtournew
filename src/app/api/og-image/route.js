// API route that proxies and serves the OG image with proper Content-Type headers
// This ensures social crawlers (WhatsApp, Facebook, etc.) can always read the image
export async function GET() {
  const imageUrl = "https://kmbeugpxtctqkywsvhqj.supabase.co/storage/v1/object/public/discovering_bali_images/gallery/qvau6l8uff_1777343958194.jpg";

  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    return new Response('Image not found', { status: 404 });
  }
}
