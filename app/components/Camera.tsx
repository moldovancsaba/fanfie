
"use client"

import { useState } from 'react'
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
  const [imageData, setImageData] = useState&lt;string|null&gt;(null)
  const [uploadUrl, setUploadUrl] = useState&lt;string&gt;('')


  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

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
    if (result.success) {
      toast.success('Image uploaded successfully!')
      setUploadUrl(result.data.url)
    } else {
      throw new Error(result.error?.message || 'Unknown error')
    }
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const result = await response.json()
    if (result.success) {
      toast.success('Image uploaded successfully!')
      setUploadUrl(result.data.url)
    } else {
      throw new Error(result.error?.message || 'Unknown error')
    }
      {imageData &amp;&amp; (
        &lt;div className="upload-section"&gt;
          &lt;button 
            onClick={handleUpload}
            className="bg-blue-500 text-white p-2 rounded"
          &gt;
            Upload to ImgBB
          &lt;/button&gt;
          {uploadUrl &amp;&amp; (
            &lt;p className="mt-2 text-sm"&gt;
              Uploaded: &lt;a href={uploadUrl} target="_blank"&gt;{uploadUrl}&lt;/a&gt;
            &lt;/p&gt;
          )}
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  )
}

