import CameraComponent from './components/CameraComponent';
import { useEffect, useState } from 'react';
import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

const imgbbUploader = require("imgbb-uploader");

interface HomeProps {

};

export default function Home() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [view, setView] = useState<"camera" | "shot" | "editor">("camera");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    const isValid = apiKey !== undefined && apiKey.length > 0;

    setApiKeyValid(isValid);
  }, []);

  const handleCapture = async (capturedImageData: string) => {
    // Store the captured image data into the imageData state
    setImageData(capturedImageData);

    // Set the view state to "shot" after the photo is taken
    setView("shot");
  };

  const handleShare = async () => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    // Validate API key again before upload
    if (!apiKeyValid) {
      toast.error("Missing API Key");
      return;
    }

    setIsUploading(true);
    toast.loading("Uploading...", { id: 'uploading' });

    try {
      // Configuration options for imgbbUploader
      const options = {
        apiKey: apiKey,
        base64string: imageData!.split(',')[1],
      };

      const response = await imgbbUploader(options);

      toast.success('Upload complete!', { id: 'uploading' });
      console.log(response.output.url);
      setUploadUrl(response.output.url);
      setView("editor");
    } catch (error: any) {
      console.error(error);
      toast.error('Upload failed.', { id: 'uploading' });
      setUploadUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    
      
        <Toaster />
        {apiKeyValid === false && (
          
            Missing API Key
            Please add your ImgBB API key to .env.local
          
        )}

        {uploadUrl && (
          
            Uploaded Image:
            <a href={uploadUrl} target="_blank" rel="noopener noreferrer">{uploadUrl}</a>
          
        )}

        {view === "shot" && imageData && (
          
            <img src={imageData} alt="Captured Image" className="max-w-full" />
            
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
              >
                Share
              </button>
              <button
                onClick={() => {
                  setImageData(null);
                  setView("camera");
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
              >
                Back
              </button>
            
          
        )}

        {view === "camera" && (
          <CameraComponent
            onCapture={handleCapture}
            disabled={isUploading || apiKeyValid === false}
          />
        )}

        {isUploading && (
          
            Uploading...
          
        )}
      
    
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CameraComponent from './components/CameraComponent';
const validateApiKey = (key: string | undefined): boolean => {
  if (!key || key.trim() === '') {
    toast.error('API key not configured');
    return false;
  }
  return true;
};

export default function Home() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [view, setView] = useState<"camera" | "shot" | "editor">("camera");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  
  // Validate API key on component mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    const isValid = validateApiKey(apiKey);
    setApiKeyValid(isValid);
  }, []);
  
  const handleCapture = async (capturedImageData: string) => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    
    // Validate API key again before upload
    if (!validateApiKey(apiKey)) {
      return;
    }
    
    try {
      setIsUploading(true);
    const handleCapture = async (capturedImageData: string) => {\n      // Store the captured image data into the imageData state\n      setImageData(capturedImageData);\n\n      // Set the view state to \"shot\" after the photo is taken\n      setView("shot");\n    };\n\n    const handleShare = async () => {\n      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;\n\n      // Validate API key again before upload\n      if (!apiKeyValid) {\n        toast.error("Missing API Key");\n        return;\n      }\n\n      setIsUploading(true);\n      toast.loading("Uploading...", { id: 'uploading' });
      
      // Remove the data URL prefix to get just the base64 data
      const base64Image = capturedImageData.split(',')[1];

      // Store the captured image data into the imageData state
      setImageData(capturedImageData);

      // Set the view state to "shot" after the photo is taken
      setView("shot");
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('key', apiKey as string);
      formData.append('image', base64Image);
    };\n\n    return (\n      \n        \n          <Toaster />\n          {apiKeyValid === false && (\n            Missing API Key\n            Please add your ImgBB API key to .env.local\n          )}\n\n          {uploadUrl && (\n            \n              Uploaded Image:\n              <a href={uploadUrl} target="_blank" rel="noopener noreferrer">{uploadUrl}</a>\n            \n          )}\n\n          {view === "shot" && imageData && (\n            \n              <img src={imageData} alt="Captured Image" className="max-w-full" />\n              \n                <button\n                  onClick={handleShare}\n                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"\n                >\n                  Share\n                </button>\n                <button\n                  onClick={() => {\n                    setImageData(null);\n                    setView("camera");\n                  }}\n                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"\n                >\n                  Back\n                </button>\n              \n            \n          )}\n\n          {isUploading && (\n            \n              Uploading...\n            \n          )}\n\n          {view === "camera" && (\n            <CameraComponent\n              onCapture={handleCapture}\n              disabled={isUploading || apiKeyValid === false}\n            />\n          )}\n        \n      \n    );\n
      // Upload the image to ImgBB
    setView("shot");
  };
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
          )}\n\n        \n      \n    );\n
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Image uploaded successfully!');
        setUploadUrl(data.data.url);
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fanfie</h1>
          <p className="text-gray-300">Take and share photos easily</p>
        </header>
        
        {apiKeyValid === false && (
          <div className="mb-4 p-4 bg-red-500 text-white rounded max-w-4xl mx-auto">
            <p className="font-bold">API Configuration Error</p>
            <p>Please set the NEXT_PUBLIC_IMGBB_API_KEY environment variable.</p>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          {view === "camera" && (
            <CameraComponent
              onCapture={handleCapture}
        )}\n\n        {view === "shot" && imageData && (\n          \n            <img src={imageData} alt=\"Captured Image\" className=\"max-w-full\" />\n            \n              <button\n                onClick={handleShare}
          )}

          {view === "shot" && imageData && (
            <div>
              <img src={imageData} alt="Captured Image" className="max-w-full" />
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    // Implement Share functionality (upload to ImgBB) here
                    handleCapture(imageData);
                    setView("editor"); // Assuming "editor" is the next view after sharing
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
                >
                  Share
                </button>
                <button
                  onClick={() => {
          \n        )}\n\n        {view === "camera" && (\n          <CameraComponent\n            onCapture={handleCapture}\n            disabled={isUploading || apiKeyValid === false}\n          />\n        )}\n      \n    \n  );\n}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {isUploading && (
          <CameraComponent 
            onCapture={handleCapture} 
            disabled={isUploading || apiKeyValid === false} 
          />
          
          {isUploading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
              <p>Uploading image...</p>
            </div>
          )}
          
          {uploadUrl && (
            <div className="mt-6 p-4 bg-gray-800 rounded">
              <p className="mb-2 font-bold">Image Uploaded Successfully!</p>
              <div className="mb-4">
                <a 
                  href={uploadUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline break-all"
                >
                  {uploadUrl}
                </a>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(uploadUrl)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
