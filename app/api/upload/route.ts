import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the image from the request
    const formData = await request.formData()
    const image = formData.get('image')

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Send to ImgBB
    const imgbbFormData = new FormData()
    imgbbFormData.append('image', image as Blob)

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: imgbbFormData
      }
    )

    const data = await response.json()
    console.log('ImgBB response:', data)
    return NextResponse.json(data)

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
