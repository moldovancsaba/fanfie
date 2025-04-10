'use client'

import { useState } from 'react'

export default function Camera() {
  const [photo, setPhoto] = useState<string | null>(null)

  // Take photo using browser camera
  const takePhoto = async () => {
    try {
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      
      // Create video element
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()

      // Create canvas and capture frame
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)

      // Convert to base64
      const base64 = canvas.toDataURL('image/jpeg')
      setPhoto(base64)

      // Stop camera
      stream.getTracks().forEach(track => track.stop())
    } catch (err) {
      console.error('Camera error:', err)
      alert('Could not access camera')
    }
  }

  // Upload to ImgBB
  const uploadPhoto = async () => {
    if (!photo) return

    try {
      // Convert base64 to blob
      const res = await fetch(photo)
      const blob = await res.blob()

      // Upload using FormData
      const formData = new FormData()
      formData.append('image', blob)

      // Send to our API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      // Open image in new tab if successful
      if (result.data?.url) {
        window.open(result.data.url, '_blank')
      } else {
        throw new Error('Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Upload failed')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {photo ? (
        <>
          <img 
            src={photo} 
            alt="Captured photo" 
            className="w-full rounded-lg shadow-lg mb-4"
          />
          <div className="flex gap-4 w-full">
            <button
              onClick={() => setPhoto(null)}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Retake
            </button>
            <button
              onClick={uploadPhoto}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Upload
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={takePhoto}
          className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 font-medium"
        >
          Take Photo
        </button>
      )}
    </div>
  )
}
