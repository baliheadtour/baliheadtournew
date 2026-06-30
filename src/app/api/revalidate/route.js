import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { tags } = await request.json();
    
    if (tags && Array.isArray(tags)) {
      tags.forEach(tag => revalidateTag(tag));
      return NextResponse.json({ revalidated: true, now: Date.now() });
    }
    
    return NextResponse.json({ error: 'Missing tags' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 });
  }
}
