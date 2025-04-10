"use client"

import { useState, useRef, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'

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
  const [isUploading, setIsUploading] = useState(false)

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
    toast.success('Photo captured! Ready to upload.')
  }

  const handleUpload = async () => {
    if (!imageData) return
    
    try {
      setIsUploading(true)
      const blob = dataURLtoBlob(imageData)
      
      if (blob.size > MAX_FILE_SIZE) {
        toast.error('File exceeds 5MB limit')
        return
      }
      
      const formData = new FormData()
      formData.append('image', blob)
      
      toast.loading('Uploading image...')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      console.log('Upload response:', result) // Debug log
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }
      
      if (result.data?.display_url) {
        toast.dismiss()
        toast.success('Image uploaded successfully!')
        setUploadUrl(result.data.display_url)
      } else {
        throw new Error('No image URL received')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const retake = () => {
    setImageData(null)
    setUploadUrl('')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Toaster position="top-center" />
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
                disabled={isUploading}
                className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : 'Upload'}
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
