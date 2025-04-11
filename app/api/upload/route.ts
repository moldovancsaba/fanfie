import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.IMGBB_API_KEY;

    // Check if API key is configured
    if (!apiKey || apiKey === '{{IMGBB_API_KEY}}') {
      return NextResponse.json(
        { 
          error: 'ImgBB API key not configured. Please set IMGBB_API_KEY in environment variables.',
          details: 'Contact administrator to configure the API key.'
        }, 
        { status: 503 }
      );
    }

    // Get the image from the request
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json(
        { 
          error: 'No image provided',
          details: 'Image data is required for upload.'
        }, 
        { status: 400 }
      );
    }

    // Send to ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', image as Blob);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: imgbbFormData
      }
    );

    const data = await response.json();

    // Handle ImgBB API errors
    if (!response.ok) {
      console.error('ImgBB API error:', data);
      return NextResponse.json(
        {
          error: 'Image upload failed',
          details: data.error?.message || 'Unknown error occurred with ImgBB service.',
          code: data.status_code
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred.'
      }, 
      { status: 500 }
    );
  }
}
