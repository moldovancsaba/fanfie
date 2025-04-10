import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

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
 * Handles secure image uploads to ImgBB with EXIF sanitization
 * @param request - The incoming request containing image file
 * @returns NextResponse with upload result or error
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.IMGBB_API_KEY
    if (!apiKey) return errorResponses.serviceUnavailable()

    const formData = await request.formData()
    const image = formData.get('image')

    // Validate payload
    if (!(image instanceof Blob)) return errorResponses.invalidFormat()
    if (image.size > MAX_FILE_SIZE) return errorResponses.fileTooLarge()
    if (!image.type.startsWith('image/')) return errorResponses.invalidType()

    // Read the image data
    const buffer = Buffer.from(await image.arrayBuffer())

    // Sanitize EXIF data and format
    const cleanBuffer = await sharp(buffer)
      .withMetadata({ orientation: undefined })
      .jpeg({ quality: 85 })
      .toBuffer()

    // Convert buffer to base64 for ImgBB
    const base64Image = cleanBuffer.toString('base64')

    // Create the form data with base64 image
    const uploadForm = new URLSearchParams()
    uploadForm.append('image', base64Image)

    // Upload to ImgBB
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: uploadForm
      }
    )
    
    const data = await response.json()
    console.log('ImgBB Response:', data) // For debugging
    
    if (!response.ok) {
      console.error('ImgBB Error:', data)
      return NextResponse.json(
        { error: data.error?.message || 'Upload failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({ 
      success: true,
      data: {
        display_url: data.data?.display_url,
        url: data.data?.url,
        delete_url: data.data?.delete_url
      }
    })

  } catch (error) {
    console.error('[IMG_UPLOAD_ERROR]:', error)
    return errorResponses.serverError()
  }
}

export const dynamic = 'force-dynamic'
export const maxDuration = 30
