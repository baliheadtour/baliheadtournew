import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Initialize Supabase Admin Client
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const supabase = getSupabase();
    // Fetch all blogs, order by updated_at descending
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("GET Blogs error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET Blogs server error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    // Map formData to table columns
    const insertData = {
      title: body.title,
      slug: body.slug,
      content: body.content,
      meta_description: body.meta,
      category: body.category,
      location: body.location,
      status: body.status || 'Draft',
      image: body.image
    };

    const { data, error } = await supabase
      .from('blogs')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("POST Blogs error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST Blogs server error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing blog ID' }, { status: 400 });
    }

    // Ensure we update 'updated_at'
    updateData.updated_at = new Date().toISOString();
    
    // Map meta -> meta_description and drop images
    if (updateData.meta !== undefined) {
      updateData.meta_description = updateData.meta;
      delete updateData.meta;
    }
    delete updateData.images;

    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("PUT Blogs error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("PUT Blogs server error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const supabase = getSupabase();

    if (!id) {
      return NextResponse.json({ error: 'Missing blog ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("DELETE Blogs error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE Blogs server error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
