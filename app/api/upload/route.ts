import { NextRequest, NextResponse } from 'next/server'

/**
 * Handles secure image uploads to ImgBB
 */
export async function POST(request: NextRequest) {
  try {
    // Server-side environment validation
    const apiKey = process.env.IMGBB_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'IMG_SERVICE_UNAVAILABLE' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const image = formData.get('image')
    
    if (!(image instanceof Blob)) {
      return NextResponse.json(
        { error: 'INVALID_MEDIA_FORMAT' },
        { status: 400 }
      )
    }

    // Create a secure form for image upload
    const secureForm = new FormData()
    secureForm.append('image', image)

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: secureForm
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Upload Failed' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('[IMG_UPLOAD_ERROR]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
