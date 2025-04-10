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
  console.log('Upload request received')
  
  try {
    const apiKey = process.env.IMGBB_API_KEY
    if (!apiKey) {
      console.error('ImgBB API key not found')
      return errorResponses.serviceUnavailable()
    }
    console.log('API key valid')

    const formData = await request.formData()
    const image = formData.get('image')
    console.log('Received image:', image instanceof Blob, image?.type, image?.size)

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

    console.log('Image validation passed')

    // Read the image data
    const buffer = Buffer.from(await image.arrayBuffer())
    console.log('Image buffer created:', buffer.length, 'bytes')

    // Sanitize EXIF data and format
    const cleanBuffer = await sharp(buffer)
      .jpeg({ quality: 85 })
      .withMetadata({ orientation: undefined })
      .toBuffer()
    console.log('Image processed with sharp:', cleanBuffer.length, 'bytes')

    // Convert buffer to base64
    const base64Image = cleanBuffer.toString('base64')
    console.log('Converted to base64, length:', base64Image.length)

    // Create the form data for ImgBB
    const uploadForm = new URLSearchParams()
    uploadForm.append('image', base64Image)

    console.log('Sending request to ImgBB')
    
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
    console.log('ImgBB response:', {
      status: response.status,
      ok: response.ok,
      data: data
    })
    
    if (!response.ok) {
      console.error('ImgBB error response:', data)
      return NextResponse.json(
        { error: data.error?.message || 'Upload failed' },
        { status: response.status }
      )
    }

    if (!data.data?.url) {
      console.error('No URL in ImgBB response:', data)
      return errorResponses.serverError()
    }

    console.log('Upload successful:', data.data.url)
    
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
