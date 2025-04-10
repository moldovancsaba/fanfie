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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {!imageData ? (
          <>
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={captureImage}
              disabled={!isStreaming}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isStreaming ? 'Take Photo' : 'Accessing Camera...'}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img src={imageData} alt="Captured" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={retake}
                className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={handleUpload}
                className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload
              </button>
            </div>
            {uploadUrl && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700 font-medium mb-2">Uploaded successfully!</p>
                <a
                  href={uploadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  View Image
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
