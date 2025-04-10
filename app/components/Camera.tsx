"use client"

import { useState, useRef } from 'react'

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [imageData, setImageData] = useState<string | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera error:', error)
    }
  }

  const takePhoto = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(videoRef.current, 0, 0)
    const data = canvas.toDataURL('image/jpeg')
    setImageData(data)
  }

  const uploadToImgBB = async () => {
    if (!imageData) return

    try {
      // Convert base64 to blob
      const response = await fetch(imageData)
      const blob = await response.blob()

      const formData = new FormData()
      formData.append('image', blob)

      const upload = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await upload.json()
      if (result.data?.url) {
        window.open(result.data.url, '_blank')
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <button onClick={startCamera} className="bg-blue-500 text-white p-2 rounded">
        Start Camera
      </button>
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-md border rounded"
      />

      <button onClick={takePhoto} className="bg-green-500 text-white p-2 rounded">
        Take Photo
      </button>

      {imageData && (
        <>
          <img src={imageData} alt="Captured" className="w-full max-w-md border rounded" />
          <button onClick={uploadToImgBB} className="bg-purple-500 text-white p-2 rounded">
            Upload to ImgBB
          </button>
        </>
      )}
    </div>
  )
}
