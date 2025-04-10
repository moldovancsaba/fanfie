"use client"

import { useRef, useState } from 'react'

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [photo, setPhoto] = useState<string | null>(null)

  // Start camera when button is clicked
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }

  // Take photo from video feed
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
  }

  // Upload to ImgBB
  const upload = async () => {
    if (!photo) return
    
    try {
      // Convert base64 to blob
      const res = await fetch(photo)
      const blob = await res.blob()

      // Create form data
      const formData = new FormData()
      formData.append('image', blob)

      // Send to our API
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await uploadRes.json()
      
      // Open the image URL in new tab
      if (result.data?.url) {
        window.open(result.data.url)
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  return (
    <div>
      <h1>Simple Camera Upload</h1>
      
      <button onClick={startCamera}>
        1. Start Camera
      </button>

      <br />
      <br />

      <video 
        ref={videoRef}
        autoPlay 
        playsInline
        style={{ width: '400px', height: '300px', border: '2px solid black' }}
      />

      <br />
      <br />

      <button onClick={takePhoto}>
        2. Take Photo
      </button>

      <br />
      <br />

      {photo && (
        <>
          <img 
            src={photo} 
            alt="Captured"
            style={{ width: '400px', height: '300px', border: '2px solid black' }}
          />
          <br />
          <br />
          <button onClick={upload}>
            3. Upload to ImgBB
          </button>
        </>
      )}
    </div>
  )
}
