"use client"

import { useState, useRef, useEffect } from 'react'

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [imageData, setImageData] = useState<string | null>(null)

  useEffect(() => {
    // Start camera automatically when component mounts
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error('Camera error:', error)
      }
    }
    startCamera()
  }, [])

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
    console.log('Starting upload...')

    try {
      const response = await fetch(imageData)
      const blob = await response.blob()
      console.log('Blob created:', blob.size, 'bytes')

      const formData = new FormData()
      formData.append('image', blob)

      console.log('Sending to API...')
      const upload = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await upload.json()
      console.log('Upload result:', result)
      
      if (result.data?.url) {
        window.open(result.data.url, '_blank')
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: '100%', maxWidth: '500px', border: '1px solid #ccc', borderRadius: '8px' }}
      />

      {!imageData ? (
        <button 
          onClick={takePhoto}
          style={{ 
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Take Photo
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '500px' }}>
          <img 
            src={imageData} 
            alt="Captured" 
            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '8px' }} 
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setImageData(null)}
              style={{ 
                backgroundColor: '#f44336',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Retake
            </button>
            <button
              onClick={uploadToImgBB}
              style={{ 
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Upload to ImgBB
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
