import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as Blob;

    if (!image) {
      console.error('No image provided in request');
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!process.env.IMGBB_API_KEY) {
      console.error('IMGBB_API_KEY is not configured');
      return NextResponse.json(
        { error: 'ImgBB API key not configured' },
        { status: 500 }
      );
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append('image', image);

    const imgbbUrl = `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`;
    console.log('Attempting to upload to ImgBB...');

    const response = await fetch(imgbbUrl, {
      method: 'POST',
      body: imgbbFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ImgBB API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Failed to upload to ImgBB: ${errorText}`);
    }

    const result = await response.json();
    console.log('Upload successful:', result.data.url);
    return NextResponse.json({ url: result.data.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
