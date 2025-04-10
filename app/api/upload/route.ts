import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const errorResponses = {
  serviceUnavailable: () => NextResponse.json(
    { error: 'IMG_SERVICE_UNAVAILABLE' }, 
    { status: 503 }
  ),
  invalidFormat: () => NextResponse.json(
    { error: 'INVALID_MEDIA_FORMAT' }, 
    { status: 400 }
  ),
  fileTooLarge: () => NextResponse.json(
    { error: 'FILE_TOO_LARGE' }, 
    { status: 413 }
  ),
  invalidType: () => NextResponse.json(
    { error: 'INVALID_MEDIA_TYPE' }, 
    { status: 415 }
  ),
  serverError: () => NextResponse.json(
    { error: 'Internal server error' }, 
    { status: 500 }
  )
}

/**
 * Handles secure image uploads to ImgBB
 * @param request - The incoming request containing image file
 * @returns NextResponse with upload result or error
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.IMGBB_API_KEY
    if (!apiKey) {
      console.error('ImgBB API key not found')
      return errorResponses.serviceUnavailable()
    }

    const formData = await request.formData()
    const image = formData.get('image')

    // Validate payload
    if (!(image instanceof Blob)) {
      console.error('Invalid image format - not a Blob')
      return errorResponses.invalidFormat()
    }
    if (image.size > MAX_FILE_SIZE) {
      console.error('File too large:', image.size)
      return errorResponses.fileTooLarge()
    }
    if (!image.type.startsWith('image/')) {
      console.error('Invalid image type:', image.type)
      return errorResponses.invalidType()
    }

    // Get image data directly from the client's formData
    const imgbbForm = new FormData()
    imgbbForm.append('image', image)

    // Upload to ImgBB
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: imgbbForm
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('ImgBB error response:', data)
      return NextResponse.json(
        { error: data.error?.message || 'Upload failed' },
        { status: response.status }
      )
    }

    if (!data.data?.url) {
      console.error('No URL in ImgBB response')
      return errorResponses.serverError()
    }
    
    return NextResponse.json({ 
      success: true,
      data: {
        display_url: data.data.display_url,
        url: data.data.url,
        delete_url: data.data.delete_url
      }
    })

  } catch (error) {
    console.error('[IMG_UPLOAD_ERROR]:', error)
    return errorResponses.serverError()
  }
}

export const dynamic = 'force-dynamic'
export const maxDuration = 30
