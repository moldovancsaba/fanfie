'use client'

import { useState, useRef, useEffect } from 'react'

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [photo, setPhoto] = useState<string | null>(null)

  // Start camera on component mount
  useEffect(() => {
    startCamera()
    // Cleanup camera on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Start camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera error:', err)
      alert('Could not access camera')
    }
  }

  // Take photo from video stream
  const takePhoto = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      setPhoto(canvas.toDataURL())
    }

    // Stop camera after taking photo
    if (videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
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

  // Handle retake - restart camera
  const retake = () => {
    setPhoto(null)
    startCamera()
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
              onClick={retake}
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
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg shadow-lg mb-4"
          />
          <button
            onClick={takePhoto}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 font-medium"
          >
            Take Photo
          </button>
        </>
      )}
    </div>
  )
}
