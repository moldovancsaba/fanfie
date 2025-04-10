"use client"

import { useState, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'

function dataURLtoBlob(dataurl: string) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while(n--) u8arr[n] = bstr.charCodeAt(n)
  return new Blob([u8arr], { type: mime || 'image/png' })
}

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState(false)

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsStreaming(true)
        }
      } catch (error) {
        console.error('Camera access error:', error)
        toast.error('Unable to access camera')
      }
    }

    setupCamera()
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const captureImage = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg')
    setImageData(dataUrl)
  }

  const handleUpload = async () => {
    if (!imageData) return
    
    try {
      const blob = dataURLtoBlob(imageData)
      
      if (blob.size > MAX_FILE_SIZE) {
        toast.error('File exceeds 5MB limit')
        return
      }
      
      const formData = new FormData()
      formData.append('image', blob)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      const result = await response.json()
      if (result.data?.display_url) {
        toast.success('Image uploaded successfully!')
        setUploadUrl(result.data.display_url)
      } else {
        throw new Error(result.error?.message || 'Unknown error')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const retake = () => {
    setImageData(null)
    setUploadUrl('')
  }

  return (
    <div className="camera-container">
      {!imageData ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="camera-preview"
          />
          <button
            onClick={captureImage}
            disabled={!isStreaming}
            className="capture-button"
          >
            Take Photo
          </button>
        </>
      ) : (
        <div className="preview-container">
          <img src={imageData} alt="Captured" className="captured-image" />
          <div className="button-group">
            <button onClick={retake} className="retake-button">
              Retake
            </button>
            <button onClick={handleUpload} className="upload-button">
              Upload
            </button>
          </div>
          {uploadUrl && (
            <div className="upload-success">
              <p>Uploaded successfully!</p>
              <a href={uploadUrl} target="_blank" rel="noopener noreferrer">
                View Image
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
